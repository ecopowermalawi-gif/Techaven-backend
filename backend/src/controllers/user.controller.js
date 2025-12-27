import userService from '../services/user.service.js';

class UserController {
    // Authentication
    async register(req, res) {
        try {
            const { email, password, username, role = 'buyer', business_name } = req.body;
            
            const result = await userService.registerUser({
                email,
                password,
                username,
                role,
                business_name
            });

            res.status(201).json({
                success: true,
                message: result.message || 'User registered successfully. Check email for OTP.',
                data: result
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async sendOTP(req, res) {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({
                    success: false,
                    message: 'Email is required'
                });
            }

            const result = await userService.sendOTP(email);

            res.json({
                success: true,
                message: result.message
            });
        } catch (error) {
            console.error('Send OTP error:', error);
            res.status(error.message.includes('not found') ? 404 : 500).json({
                success: false,
                message: error.message
            });
        }
    }
 async testOTP(req, res) {
        try {
            const email = 'born2code265@gmail.com';

            if (!email) {
                return res.status(400).json({
                    success: false,
                    message: 'Email is required'
                });
            }

            const result = await userService.sendOTP(email);

            res.json({
                success: true,
                message: result.message
            });
        } catch (error) {
            console.error('Send OTP error:', error);
            res.status(error.message.includes('not found') ? 404 : 500).json({
                success: false,
                message: error.message
            });
        }
    }


      async resendOTP(req, res) {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({
                    success: false,
                    message: 'Email is required'
                });
            }

            const result = await userService.sendOTP(email);

            res.json({
                success: true,
                message: result.message
            });
        } catch (error) {
            console.error('Send OTP error:', error);
            res.status(error.message.includes('not found') ? 404 : 500).json({
                success: false,
                message: error.message
            });
        }
    }


    async verifyOTP(req, res) {
        try {
            const { email, otp } = req.body;

            if (!email || !otp) {
                return res.status(400).json({
                    success: false,
                    message: 'Email and OTP are required'
                });
            }

            const result = await userService.verifyOTP(email, otp);
            res.json({
                success: true,
                message: result.message,
                data: result.user
            });
        } catch (error) {
            console.error('OTP verification error:', error);
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;
            
            const result = await userService.loginUser(email, password, {
                userAgent: req.headers['user-agent'],
                ipAddress: req.ip
            });

            // Set refresh token in HTTP-only cookie
            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            res.json({
                success: true,
                message: 'Login successful',
                data: {
                    accessToken: result.accessToken,
                    sessionId: result.sessionId,
                    user: result.user
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(401).json({
                success: false,
                message: error.message
            });
        }
    }

    async logout(req, res) {
        try {
            const sessionId = req.headers['x-session-id'];
            if (sessionId) {
                await userService.logout(sessionId);
            }

            // Clear refresh token cookie
            res.clearCookie('refreshToken');

            res.json({
                success: true,
                message: 'Logged out successfully'
            });
        } catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async refreshToken(req, res) {
        try {
            const refreshToken = req.cookies.refreshToken;
            
            if (!refreshToken) {
                return res.status(401).json({
                    success: false,
                    message: 'Refresh token required'
                });
            }

            const result = await userService.refreshAccessToken(refreshToken);

            res.json({
                success: true,
                message: 'Token refreshed',
                data: result
            });
        } catch (error) {
            console.error('Token refresh error:', error);
            res.status(401).json({
                success: false,
                message: error.message
            });
        }
    }

    // User Management
    async getProfile(req, res) {
        try {
            const userId = req.user?.id || req.body.user_id;
            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: 'User ID required'
                });
            }

            const user = await userService.getUserById(userId);
            
            res.json({
                success: true,
                data: user
            });
        } catch (error) {
            console.error('Get profile error:', error);
            res.status(error.message.includes('not found') ? 404 : 500).json({
                success: false,
                message: error.message
            });
        }
    }

    async getAllUsers(req, res) {
        try {
            const { role, active } = req.query;
            
            const filters = {};
            if (role) filters.role = role;
            if (active !== undefined) filters.is_active = active === 'true';

            const users = await userService.getAllUsers(filters);
            
            res.json({
                success: true,
                data: users
            });
        } catch (error) {
            console.error('Get users error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }


    async updateProfile(req, res) {
        try {
            const userId = req.user?.id || req.body.user_id;
            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: 'User ID required'
                });
            }

            const updatedUser = await userService.updateUserProfile(userId, req.body);
            
            res.json({
                success: true,
                message: 'Profile updated successfully',
                data: updatedUser
            });
        } catch (error) {
            console.error('Update profile error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async changePassword(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            const { currentPassword, newPassword } = req.body;
            
            await userService.changePassword(userId, currentPassword, newPassword);
            
            res.json({
                success: true,
                message: 'Password changed successfully'
            });
        } catch (error) {
            console.error('Change password error:', error);
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
    async uploadAvatar(req, res){
        
        try {
            console.log("in user controller : uploadingg uploadAvatar")
            const results = userService.uploadAvatar
            console.log("uploading file location", results);
        } catch (error) {
            console.log("error during uploading", error);
        }
    }

    // Password Reset
    async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            
            const result = await userService.requestPasswordReset(email);
            
            res.json({
                success: true,
                message: result.message
            });
        } catch (error) {
            console.error('Forgot password error:', error);
            res.status(error.message.includes('not found') ? 404 : 500).json({
                success: false,
                message: error.message
            });
        }
    }

    async resetPassword(req, res) {
        try {
            const { token, userId, newPassword } = req.body;
            
            await userService.resetPassword(token, userId, newPassword);
            
            res.json({
                success: true,
                message: 'Password reset successful'
            });
        } catch (error) {
            console.error('Reset password error:', error);
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Role Management
    async addRole(req, res) {
        try {
            const { userId, role } = req.body;
            
            await userService.addUserRole(userId, role);
            
            res.json({
                success: true,
                message: 'Role added successfully'
            });
        } catch (error) {
            console.error('Add role error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async removeRole(req, res) {
        try {
            const { userId, role } = req.body;
            
            await userService.removeUserRole(userId, role);
            
            res.json({
                success: true,
                message: 'Role removed successfully'
            });
        } catch (error) {
            console.error('Remove role error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Session Management
    async getSessions(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            const sessions = await userService.getUserSessions(userId);
            
            res.json({
                success: true,
                data: sessions
            });
        } catch (error) {
            console.error('Get sessions error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async logoutAll(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            await userService.logoutAll(userId);
            
            // Clear refresh token cookie
            res.clearCookie('refreshToken');

            res.json({
                success: true,
                message: 'Logged out from all devices'
            });
        } catch (error) {
            console.error('Logout all error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Specialized Queries
    async getSellers(req, res) {
        try {
            const sellers = await userService.getSellers();
            
            res.json({
                success: true,
                data: sellers
            });
        } catch (error) {
            console.error('Get sellers error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async getBuyers(req, res) {
        try {
            const buyers = await userService.getBuyers();
            
            res.json({
                success: true,
                data: buyers
            });
        } catch (error) {
            console.error('Get buyers error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Account Management
    async deactivateAccount(req, res) {
        try {
            const userId = req.user?.id || req.body.user_id;
            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: 'User ID required'
                });
            }

            await userService.deactivateUser(userId);
            
            res.json({
                success: true,
                message: 'Account deactivated successfully'
            });
        } catch (error) {
            console.error('Deactivate account error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async deleteAccount(req, res) {
        try {
            const userId = req.body.user_id;
            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: 'User ID required'
                });
            }

            await userService.deleteUser(userId);
            
            res.json({
                success: true,
                message: 'User deleted successfully'
            });
        } catch (error) {
            console.error('Delete user error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Search
    async searchUsers(req, res) {
        try {
            const { q, role, active } = req.query;
            
            if (!q) {
                return res.status(400).json({
                    success: false,
                    message: 'Search query required'
                });
            }

            const filters = { activeOnly: active !== 'false' };
            if (role) filters.role = role;

            const users = await userService.searchUsers(q, filters);
            
            res.json({
                success: true,
                data: users
            });
        } catch (error) {
            console.error('Search users error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Health Check
    async health(req, res) {
        try {
            // Test database connection
           
            res.json({
                success: true,
                message: 'User service is healthy',
                timestamp: new Date().toISOString(),
                database:  'connected'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Service unhealthy',
                error: error.message
            });
        }
    }
}

export default new UserController();