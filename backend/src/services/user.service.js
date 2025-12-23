import UserModel from '../models/user.model.js';
import emailService from './email.service.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database.js';
class UserService {
    // Registration
    async registerUser(userData) {
        try {

            console.log("hello here is the data i user service",userData );
            // Check if user exists
            const emailExists = await UserModel.checkEmailExists(userData.email);
            if (emailExists) {
                throw new Error('User with this email already exists');
            }
            console.log("checking email", emailExists);

            if (userData.username) {
                const usernameExists = await UserModel.checkUsernameExists(userData.username);
                if (usernameExists) {
                    console.log("user email already existed ", usernameExists)
                    throw new Error('Username already taken');
                }
            }
console.log("==== creting a user =====");
            // Create user (inactive until email verified)
            const userId = await UserModel.createUser(userData);
console.log("Here is the user id ", userId);
            // Generate and send OTP
            const otp = this.generateOTP();

            console.log("here is he otp genertotped ",otp );

            await UserModel.storeOTP(userId, otp);

            console.log('stored OTP for user', userId)
            await emailService.sendOTPEmail(userData.email, otp);
console.log("seds the otp to emil d");
            return {
                id: userId,
                email: userData.email,
                username: userData.username,
                message: 'User registered. Check your email for OTP to verify your account.'
            };
        } catch (error) {
            throw new Error(`Registration failed: ${error.message}`);
        }
    }

    // OTP Generation (6-digit code)
    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    // Send OTP to email
    async sendOTP(email) {
        try {
            // Check if user exists
            const user = await UserModel.findUserByEmail(email);
            if (!user) {
                throw new Error('User not found');
            }

            // Generate and store OTP
            const otp = this.generateOTP();
            await UserModel.storeOTP(user.id, otp);
            await emailService.sendOTPEmail(email, otp);

            return {
                success: true,
                message: 'OTP sent to your email'
            };
        } catch (error) {
            throw new Error(`Failed to send OTP: ${error.message}`);
        }
    }

    // Verify OTP and activate account
    async verifyOTP(userId, otp) {
        try {
            // Validate OTP
            const isValid = await UserModel.validateOTP(userId, otp);
            if (!isValid) {
                throw new Error('Invalid or expired OTP');
            }

            // Clear used OTP
            await UserModel.clearOTP(userId);

            // Activate user account
            await UserModel.updateUser(userId, { is_active: 1 });

            // Get updated user
            const user = await UserModel.findUserById(userId);

            return {
                success: true,
                message: 'Email verified successfully. Account activated.',
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username
                }
            };
        } catch (error) {
            throw new Error(`OTP verification failed: ${error.message}`);
        }
    }

    // Login
    async loginUser(email, password, sessionData = {}) {
        try {
            // Find user
            const user = await UserModel.findUserByEmail(email);
            if (!user) {
                throw new Error('Invalid credentials');
            }

            // Check if user is active
            if (!user.is_active) {
                throw new Error('Account is deactivated');
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
            delete userData.refresh_token_hash;
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
                    email: user.email,
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

            // Send password change notification
            const user = await UserModel.findUserById(userId);
            if (user) {
                await emailService.sendPasswordChangeNotification(user.email);
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
                        [uuidv4(), userId, user.username || user.email]
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
    async requestPasswordReset(email) {
        try {
            const { resetToken, userId, expiresAt } = await UserModel.createPasswordResetToken(email);
            
            // Generate reset link
            const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&userId=${userId}`;
            
            // Send reset email
            await emailService.sendPasswordResetEmail(email, {
                resetLink,
                expiresAt: expiresAt.toLocaleString()
            });

            return {
                success: true,
                message: 'Password reset email sent',
                // In production, don't return the token
                // Only returning for demo/testing
                resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
            };
        } catch (error) {
            throw new Error(`Password reset request failed: ${error.message}`);
        }
    }

    async resetPassword(token, userId, newPassword) {
        try {
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

            // Send confirmation email
            const user = await UserModel.findUserById(userId);
            if (user) {
                await emailService.sendPasswordResetConfirmation(user.email);
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

    async activateUser(userId) {
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
                    u.id, u.email, u.username, u.created_at,
                    up.full_name, up.phone,
                    GROUP_CONCAT(DISTINCT r.name) as roles
                FROM auth_users u
                LEFT JOIN auth_users_roles ur ON u.id = ur.user_id
                LEFT JOIN auth_roles r ON ur.role_id = r.id
                LEFT JOIN auth_user_profile up ON u.id = up.user_id
                WHERE (
                    u.email LIKE ? OR 
                    u.username LIKE ? OR 
                    up.full_name LIKE ?
                )
                AND u.is_active = ?
                GROUP BY u.id
                ORDER BY u.created_at DESC
            `, [
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
}

export default new UserService();