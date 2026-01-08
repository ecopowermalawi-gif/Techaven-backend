import UserModel from '../models/user.model.js';
import smsService from './sms.service.js'; // Changed from email service
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database.js';

class UserService {
    // Registration
    async registerUser(userData) {
        try {
            console.log("hello here is the data in user service", userData);
            
            // Check if user exists
            const phoneExists = await UserModel.checkPhoneNumberExists(userData.phonenumber);
            if (phoneExists) {
                console.log("phone number already existed ", phoneExists);
                throw new Error('Phone number already in use');
            }
            console.log("checking phone number", phoneExists);

            if (userData.username) {
                const usernameExists = await UserModel.checkUsernameExists(userData.username);
                if (usernameExists) {
                    console.log("user name already existed ", usernameExists);
                    throw new Error('Username already taken');
                }
            }

            console.log("==== creating a user =====");
            // Create user (inactive until phone verified)
            const userId = await UserModel.createUser(userData);
            console.log("Here is the user id ", userId);

            // Generate and send OTP
            const otp = this.generateOTP();
            console.log("here is the OTP generated ", otp);

            await UserModel.storeOTP(userId, otp);
            console.log('stored OTP for user', userId);
console.log("==== sending OTP to phone number =====");
            // Send OTP via SMS instead of email
            //const phoneNumber = userData.phone_number;
              const phoneNumber = userData.phonenumber; // For testing purposes only
            if (phoneNumber) {
                const smsres = await smsService.sendOTPSMS(phoneNumber, otp); // Using Twilio Verify service
                console.log("Sent OTP verification to phone", smsres);
            } else {
                throw new Error('Phone number is required for registration');
            }

            return {
                id: userId,
                phone_number: phoneNumber,
                username: userData.username,
                message: `User registered. Check your phone for OTP to verify your account.`
            };
        } catch (error) {
            throw new Error(`Registration failed: ${error.message}`);
        }
    }

    // OTP Generation (6-digit code)
    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    // Send OTP to phone
    async sendOTP(phoneNumber) {
        try {
            // Check if user exists
            const user = await UserModel.findUserByPhone(phoneNumber);
            if (!user) {
                throw new Error('User not found');
            }

            // Generate and store OTP (fallback - Twilio will generate its own)
            const otp = this.generateOTP();
            await UserModel.storeOTP(user.id, otp);
            
            // Send OTP via SMS using Twilio Verify
            await smsService.sendOTP(phoneNumber);

            return {
                success: true,
                message: `OTP sent to your phone ${phoneNumber}`
            };
        } catch (error) {
            throw new Error(`Failed to send OTP: ${error.message}`);
        }
    }

    // Verify OTP and activate account using Twilio Verify
    async verifyOTP(phoneNumber, otp) {
        try {
            // Find user by phone
            const user = await UserModel.findUserByPhone(phoneNumber);
            if (!user) {
                throw new Error('User not found');
            }
            
            console.log("user id in verify OTP : phoneNumber, : otp", user.id, phoneNumber, otp);

            // Verify OTP using Twilio Verify service
            const verificationResult = await smsService.verifyOTP(phoneNumber, otp);
            
            if (!verificationResult.success) {
                throw new Error('Invalid or expired OTP');
            }

            // Clear used OTP from database
            await UserModel.clearOTP(user.id);

            // Activate user account
            await UserModel.updateUser(user.id, { is_active: 1 });

            // Get updated user
            const updatedUser = await UserModel.findUserById(user.id);

            return {
                success: true,
                message: 'Phone verified successfully. Account activated.',
                user: {
                    id: updatedUser.id,
                    phone_number: updatedUser.phone_number,
                    username: updatedUser.username
                }
            };
        } catch (error) {
            throw new Error(`OTP verification failed: ${error.message}`);
        }
    }

    // Alternative OTP verification (using stored OTP in database - fallback)
    async verifyStoredOTP(phoneNumber, otp) {
        try {
            const user = await UserModel.findUserByPhone(phoneNumber);
            if (!user) {
                throw new Error('User not found');
            }

            // Validate OTP from database
            const isValid = await UserModel.validateOTP(user.id, otp);
            if (!isValid) {
                throw new Error('Invalid or expired OTP');
            }

            // Clear used OTP
            await UserModel.clearOTP(user.id);

            // Activate user account
            await UserModel.updateUser(user.id, { is_active: 1 });

            // Get updated user
            const updatedUser = await UserModel.findUserById(user.id);

            return {
                success: true,
                message: 'Phone verified successfully. Account activated.',
                user: {
                    id: updatedUser.id,
                    phone_number: updatedUser.phone_number,
                    username: updatedUser.username
                }
            };
        } catch (error) {
            throw new Error(`OTP verification failed: ${error.message}`);
        }
    }

    // Login (now using phone number or username instead of email)
    async loginUser(identifier, password, sessionData = {}) {
        try {
            // Find user by phone or username
            let user;
            if (identifier.includes('@')) {
                // Email login (for backward compatibility)
                user = await UserModel.findUserByEmail(identifier);
            } else if (/^\d+$/.test(identifier)) {
                // Phone number login
                user = await UserModel.findUserByPhone(identifier);
            } else {
                // Username login
                user = await UserModel.findUserByUsername(identifier);
            }

            if (!user) {
                throw new Error('Invalid credentials');
            }

            // Check if user is active
            if (!user.is_active) {
                throw new Error('Account not Active');
            }

            // Verify password
            const isValid = await bcrypt.compare(password, user.password_hash);
            if (!isValid) {
                throw new Error('Invalid credentials');
            }

            // Generate tokens
            const accessToken = UserModel.generateAccessToken(user);
            const { sessionId, refreshToken } = await UserModel.createSession(user.id, sessionData);

            // Remove sensitive data
            const userData = { ...user };
            delete userData.password_hash;
            
            userData.roles = userData.roles ? userData.roles.split(',') : [];

            return {
                accessToken,
                refreshToken,
                sessionId,
                user: userData
            };
        } catch (error) {
            throw new Error(`Login failed: ${error.message}`);
        }
    }

    // Token Refresh
    async refreshAccessToken(refreshToken) {
        try {
            const session = await UserModel.validateRefreshToken(refreshToken);
            if (!session) {
                throw new Error('Invalid refresh token');
            }

            const user = await UserModel.findUserById(session.user_id);
            if (!user) {
                throw new Error('User not found');
            }

            const accessToken = UserModel.generateAccessToken(user);
            
            return {
                accessToken,
                user: {
                    id: user.id,
                    phone_number: user.phone_number,
                    username: user.username,
                    roles: user.roles
                }
            };
        } catch (error) {
            throw new Error(`Token refresh failed: ${error.message}`);
        }
    }

    // User Management
    async getUserById(id) {
        try {
            const user = await UserModel.findUserById(id);
            if (!user) {
                throw new Error('User not found');
            }
            return user;
        } catch (error) {
            throw new Error(`Failed to get user: ${error.message}`);
        }
    }

    async getAllUsers(filters = {}) {
        try {
            return await UserModel.findAllUsers(filters);
        } catch (error) {
            throw new Error(`Failed to get users: ${error.message}`);
        }
    }

    async updateUserProfile(userId, profileData) {
        try {
            await UserModel.updateUserProfile(userId, profileData);
            return await UserModel.findUserById(userId);
        } catch (error) {
            throw new Error(`Failed to update profile: ${error.message}`);
        }
    }

    async changePassword(userId, currentPassword, newPassword) {
        try {
            // Verify current password
            const isValid = await UserModel.verifyPassword(userId, currentPassword);
            if (!isValid) {
                throw new Error('Current password is incorrect');
            }

            // Update password
            await UserModel.updatePassword(userId, newPassword);

            // Revoke all sessions for security
            await UserModel.revokeAllUserSessions(userId);

            // Send password change notification via SMS
            const user = await UserModel.findUserById(userId);
            if (user && user.phone_number) {
                await smsService.sendPasswordChangeNotification(user.phone_number);
            }

            return true;
        } catch (error) {
            throw new Error(`Failed to change password: ${error.message}`);
        }
    }

    // Role Management
    async addUserRole(userId, roleName) {
        try {
            await UserModel.addUserRole(userId, roleName);
            
            // If adding seller role, ensure seller record exists
            if (roleName === 'seller') {
                // Check if seller record exists
                const [existingSeller] = await pool.query(
                    'SELECT id FROM catalog_sellers WHERE user_id = ?',
                    [userId]
                );

                if (existingSeller.length === 0) {
                    const user = await UserModel.findUserById(userId);
                    await pool.query(
                        'INSERT INTO catalog_sellers (id, user_id, business_name) VALUES (?, ?, ?)',
                        [uuidv4(), userId, user.username || user.phone_number]
                    );
                }
            }

            return true;
        } catch (error) {
            throw new Error(`Failed to add role: ${error.message}`);
        }
    }

    async removeUserRole(userId, roleName) {
        try {
            await UserModel.removeUserRole(userId, roleName);
            return true;
        } catch (error) {
            throw new Error(`Failed to remove role: ${error.message}`);
        }
    }

    // Session Management
    async logout(sessionId) {
        try {
            await UserModel.revokeSession(sessionId);
            return true;
        } catch (error) {
            throw new Error(`Logout failed: ${error.message}`);
        }
    }

    async logoutAll(userId) {
        try {
            await UserModel.revokeAllUserSessions(userId);
            return true;
        } catch (error) {
            throw new Error(`Failed to logout all sessions: ${error.message}`);
        }
    }

    async getUserSessions(userId) {
        try {
            return await UserModel.getUserSessions(userId);
        } catch (error) {
            throw new Error(`Failed to get sessions: ${error.message}`);
        }
    }

    // Password Reset
    async requestPasswordReset(identifier) {
        try {
            let user;
            
            // Find user by phone or email
            if (/^\d+$/.test(identifier)) {
                // Phone number
                user = await UserModel.findUserByPhone(identifier);
            } else if (identifier.includes('@')) {
                // Email (for backward compatibility)
                user = await UserModel.findUserByEmail(identifier);
            } else {
                // Username
                user = await UserModel.findUserByUsername(identifier);
            }
            
            if (!user) {
                throw new Error('User not found');
            }

            const { resetToken, userId, expiresAt } = await UserModel.createPasswordResetToken(user.id);
            
            console.log(`reset password for user is : ${userId}: === token :`, resetToken);

            // Generate reset link
            const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&userId=${userId}`;
            
            // Send reset notification via SMS if phone exists
            if (user.phone_number) {
                await smsService.sendPasswordResetNotification(user.phone_number, {
                    resetLink,
                    expiresAt: expiresAt.toLocaleString()
                });
            }

            return {
                success: true,
                message: `Password reset instructions sent`,
                resetToken: resetToken,
                phoneNumber: user.phone_number
            };
        } catch (error) {
            throw new Error(`Password reset request failed: ${error.message}`);
        }
    }

    async resetPassword(token, userId, newPassword) {
        try {
            console.log(`==in service::=user id : ${userId} ==== token : ${token} ==== new password ${newPassword}`);
           
            // Validate token
            const isValid = await UserModel.validatePasswordResetToken(token, userId);
            if (!isValid) {
                throw new Error('Invalid or expired reset token');
            }

            // Update password
            await UserModel.updatePassword(userId, newPassword);

            // Clear reset token
            await UserModel.clearPasswordResetToken(userId);

            // Revoke all sessions
            await UserModel.revokeAllUserSessions(userId);

            // Send confirmation via SMS
            const user = await UserModel.findUserById(userId);
            if (user && user.phone_number) {
                await smsService.sendPasswordResetConfirmation(user.phone_number);
            }

            return true;
        } catch (error) {
            throw new Error(`Password reset failed: ${error.message}`);
        }
    }

    // Account Management
    async deactivateUser(userId) {
        try {
            await UserModel.updateUser(userId, { is_active: false });
            await UserModel.revokeAllUserSessions(userId);
            return true;
        } catch (error) {
            throw new Error(`Failed to deactivate user: ${error.message}`);
        }
    }

    //activate user
    async activateUser(userId) {
        try {
            await UserModel.updateUser(userId, { is_active: true });
            return true;
        } catch (error) {
            throw new Error(`Failed to activate user: ${error.message}`);
        }
    }

    //activate shop
    async activateShop(userId) {
        try {
            await UserModel.updateUser(userId, { is_active: true });
            return true;
        } catch (error) {
            throw new Error(`Failed to activate user: ${error.message}`);
        }
    }

    async deleteUser(userId) {
        try {
            // Note: This will cascade delete all related records
            await UserModel.deleteUser(userId);
            return true;
        } catch (error) {
            throw new Error(`Failed to delete user: ${error.message}`);
        }
    }

    // Specialized Queries
    async getSellers() {
        try {
            return await UserModel.getSellers();
        } catch (error) {
            throw new Error(`Failed to get sellers: ${error.message}`);
        }
    }

    async getBuyers() {
        try {
            return await UserModel.getBuyers();
        } catch (error) {
            throw new Error(`Failed to get buyers: ${error.message}`);
        }
    }

    // Search and Filter
    async searchUsers(searchTerm, filters = {}) {
        try {
            const [users] = await pool.query(`
                SELECT 
                    u.id, u.email, u.username, u.phone_number, u.created_at,
                    up.full_name, up.phone,
                    GROUP_CONCAT(DISTINCT r.name) as roles
                FROM auth_users u
                LEFT JOIN auth_users_roles ur ON u.id = ur.user_id
                LEFT JOIN auth_roles r ON ur.role_id = r.id
                LEFT JOIN auth_user_profile up ON u.id = up.user_id
                WHERE (
                    u.email LIKE ? OR 
                    u.username LIKE ? OR 
                    u.phone_number LIKE ? OR 
                    up.full_name LIKE ?
                )
                AND u.is_active = ?
                GROUP BY u.id
                ORDER BY u.created_at DESC
            `, [
                `%${searchTerm}%`,
                `%${searchTerm}%`,
                `%${searchTerm}%`,
                `%${searchTerm}%`,
                filters.activeOnly ? 1 : 1
            ]);

            return users.map(user => ({
                ...user,
                roles: user.roles ? user.roles.split(',') : []
            }));
        } catch (error) {
            throw new Error(`Search failed: ${error.message}`);
        }
    }

    // New method: Send OTP for phone verification
    async sendPhoneVerificationOTP(phoneNumber) {
        try {
            const user = await UserModel.findUserByPhone(phoneNumber);
            if (!user) {
                throw new Error('User not found');
            }

            // Send OTP using Twilio Verify
            await smsService.sendOTP(phoneNumber);

            return {
                success: true,
                message: 'Verification OTP sent to your phone'
            };
        } catch (error) {
            throw new Error(`Failed to send verification OTP: ${error.message}`);
        }
    }

    // New method: Verify phone with Twilio Verify
    async verifyPhoneNumber(phoneNumber, otp) {
        try {
            const user = await UserModel.findUserByPhone(phoneNumber);
            if (!user) {
                throw new Error('User not found');
            }

            // Verify using Twilio
            const verificationResult = await smsService.verifyOTP(phoneNumber, otp);
            
            if (!verificationResult.success) {
                throw new Error('Invalid or expired OTP');
            }

            // Update user phone verification status
            await UserModel.updateUser(user.id, { phone_verified: true });

            return {
                success: true,
                message: 'Phone number verified successfully'
            };
        } catch (error) {
            throw new Error(`Phone verification failed: ${error.message}`);
        }
    }

    // New method: Update phone number with verification
    async updatePhoneNumber(userId, newPhoneNumber) {
        try {
            // Check if phone number is already in use
            const phoneExists = await UserModel.checkPhoneNumberExists(newPhoneNumber);
            if (phoneExists) {
                throw new Error('Phone number already in use');
            }

            // Send OTP to new phone number
            await smsService.sendOTP(newPhoneNumber);

            // Store pending phone update
            const otp = this.generateOTP();
            await UserModel.storePendingPhoneUpdate(userId, newPhoneNumber, otp);

            return {
                success: true,
                message: 'OTP sent to new phone number for verification'
            };
        } catch (error) {
            throw new Error(`Failed to update phone number: ${error.message}`);
        }
    }
}

export default new UserService();