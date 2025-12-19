import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

class UserModel {
    // User CRUD Operations
    async createUser(userData) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const userId = uuidv4();
            const passwordHash = await bcrypt.hash(userData.password, 10);

            // Insert user
            await connection.query(
                `INSERT INTO auth_users (id, email, password_hash, username, is_active) 
                 VALUES (?, ?, ?, ?, ?)`,
                [userId, userData.email, passwordHash, userData.username, 1]
            );

            // Create profile
            await connection.query(
                'INSERT INTO auth_user_profile (user_id) VALUES (?)',
                [userId]
            );

            // Assign role
            const [roles] = await connection.query(
                'SELECT id FROM auth_roles WHERE name = ?',
                [userData.role || 'user']
            );

            if (roles.length > 0) {
                await connection.query(
                    'INSERT INTO auth_users_roles (user_id, role_id) VALUES (?, ?)',
                    [userId, roles[0].id]
                );
            }

            // If seller role, create seller record
            if (userData.role === 'seller') {
                await connection.query(
                    'INSERT INTO catalog_sellers (id, user_id, business_name) VALUES (?, ?, ?)',
                    [uuidv4(), userId, userData.business_name || null]
                );
            }

            await connection.commit();
            return userId;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async findUserById(id) {
        try {
            const [users] = await pool.query(`
                SELECT 
                    u.*,
                    GROUP_CONCAT(DISTINCT r.name) as roles,
                    up.full_name, up.phone, up.dob, up.locale,
                    cs.business_name as seller_business
                FROM auth_users u
                LEFT JOIN auth_users_roles ur ON u.id = ur.user_id
                LEFT JOIN auth_roles r ON ur.role_id = r.id
                LEFT JOIN auth_user_profile up ON u.id = up.user_id
                LEFT JOIN catalog_sellers cs ON u.id = cs.user_id
                WHERE u.id = ?
                GROUP BY u.id
            `, [id]);

            if (users.length === 0) return null;
            
            const user = users[0];
            user.roles = user.roles ? user.roles.split(',') : [];
            delete user.password_hash;
            
            return user;
        } catch (error) {
            throw new Error(`Failed to fetch user: ${error.message}`);
        }
    }

    async findUserByEmail(email) {
        try {
            const [users] = await pool.query(`
                SELECT 
                    u.*,
                    GROUP_CONCAT(DISTINCT r.name) as roles
                FROM auth_users u
                LEFT JOIN auth_users_roles ur ON u.id = ur.user_id
                LEFT JOIN auth_roles r ON ur.role_id = r.id
                WHERE u.email = ?
                GROUP BY u.id
            `, [email]);

            return users[0] || null;
        } catch (error) {
            throw new Error(`Failed to find user: ${error.message}`);
        }
    }

    async findUserByUsername(username) {
        try {
            const [users] = await pool.query(
                'SELECT * FROM auth_users WHERE username = ?',
                [username]
            );
            return users[0] || null;
        } catch (error) {
            throw new Error(`Failed to find user: ${error.message}`);
        }
    }

    async findAllUsers(filters = {}) {
        try {
            let query = `
                SELECT 
                    u.*,
                    GROUP_CONCAT(DISTINCT r.name) as roles,
                    up.full_name, up.phone, up.dob, up.locale,
                    cs.business_name as seller_business
                FROM auth_users u
                LEFT JOIN auth_users_roles ur ON u.id = ur.user_id
                LEFT JOIN auth_roles r ON ur.role_id = r.id
                LEFT JOIN auth_user_profile up ON u.id = up.user_id
                LEFT JOIN catalog_sellers cs ON u.id = cs.user_id
            `;

            const conditions = [];
            const params = [];

            if (filters.role) {
                conditions.push('r.name = ?');
                params.push(filters.role);
            }

            if (filters.is_active !== undefined) {
                conditions.push('u.is_active = ?');
                params.push(filters.is_active ? 1 : 0);
            }

            if (conditions.length > 0) {
                query += ' WHERE ' + conditions.join(' AND ');
            }

            query += ' GROUP BY u.id ORDER BY u.created_at DESC';

            const [users] = await pool.query(query, params);
            
            return users.map(user => {
                const userObj = { ...user };
                userObj.roles = userObj.roles ? userObj.roles.split(',') : [];
                delete userObj.password_hash;
                return userObj;
            });
        } catch (error) {
            throw new Error(`Failed to fetch users: ${error.message}`);
        }
    }

    async updateUser(id, updates) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            if (updates.email) {
                await connection.query(
                    'UPDATE auth_users SET email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                    [updates.email, id]
                );
            }

            if (updates.username) {
                await connection.query(
                    'UPDATE auth_users SET username = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                    [updates.username, id]
                );
            }

            if (updates.is_active !== undefined) {
                await connection.query(
                    'UPDATE auth_users SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                    [updates.is_active ? 1 : 0, id]
                );
            }

            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async updateUserProfile(userId, profileData) {
        try {
            await pool.query(`
                INSERT INTO auth_user_profile (user_id, full_name, phone, dob, locale)
                VALUES (?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                full_name = VALUES(full_name),
                phone = VALUES(phone),
                dob = VALUES(dob),
                locale = VALUES(locale)
            `, [
                userId,
                profileData.full_name,
                profileData.phone,
                profileData.dob,
                profileData.locale
            ]);
            return true;
        } catch (error) {
            throw new Error(`Failed to update profile: ${error.message}`);
        }
    }

    async updatePassword(userId, newPassword) {
        try {
            const passwordHash = await bcrypt.hash(newPassword, 10);
            await pool.query(
                'UPDATE auth_users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [passwordHash, userId]
            );
            return true;
        } catch (error) {
            throw new Error(`Failed to update password: ${error.message}`);
        }
    }

    async verifyPassword(userId, password) {
        try {
            const [users] = await pool.query(
                'SELECT password_hash FROM auth_users WHERE id = ?',
                [userId]
            );

            if (users.length === 0) return false;
            
            return await bcrypt.compare(password, users[0].password_hash);
        } catch (error) {
            throw new Error(`Failed to verify password: ${error.message}`);
        }
    }

    async deleteUser(id) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            
            // Note: Due to CASCADE constraints, related records will be deleted automatically
            await connection.query(
                'DELETE FROM auth_users WHERE id = ?',
                [id]
            );
            
            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Role Management
    async addUserRole(userId, roleName) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const [roles] = await connection.query(
                'SELECT id FROM auth_roles WHERE name = ?',
                [roleName]
            );

            if (roles.length === 0) {
                throw new Error('Role not found');
            }

            // Check if user already has this role
            const [existing] = await connection.query(
                'SELECT * FROM auth_users_roles WHERE user_id = ? AND role_id = ?',
                [userId, roles[0].id]
            );

            if (existing.length === 0) {
                await connection.query(
                    'INSERT INTO auth_users_roles (user_id, role_id) VALUES (?, ?)',
                    [userId, roles[0].id]
                );
            }

            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async removeUserRole(userId, roleName) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const [roles] = await connection.query(
                'SELECT id FROM auth_roles WHERE name = ?',
                [roleName]
            );

            if (roles.length > 0) {
                await connection.query(
                    'DELETE FROM auth_users_roles WHERE user_id = ? AND role_id = ?',
                    [userId, roles[0].id]
                );
            }

            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Session Management
    async createSession(userId, sessionData = {}) {
        try {
            const sessionId = uuidv4();
            const refreshToken = crypto.randomBytes(40).toString('hex');
            const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

            await pool.query(`
                INSERT INTO auth_sessions 
                (id, user_id, refresh_token_hash, expires_at, user_agent, ip_address)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [
                sessionId,
                userId,
                refreshTokenHash,
                sessionData.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                sessionData.userAgent || null,
                sessionData.ipAddress || null
            ]);

            return { sessionId, refreshToken };
        } catch (error) {
            throw new Error(`Failed to create session: ${error.message}`);
        }
    }

    async findSessionById(sessionId) {
        try {
            const [sessions] = await pool.query(`
                SELECT s.*, u.email, u.username
                FROM auth_sessions s
                JOIN auth_users u ON s.user_id = u.id
                WHERE s.id = ? AND s.expires_at > NOW()
            `, [sessionId]);

            return sessions[0] || null;
        } catch (error) {
            throw new Error(`Failed to find session: ${error.message}`);
        }
    }

    async validateRefreshToken(refreshToken) {
        try {
            const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
            
            const [sessions] = await pool.query(`
                SELECT s.*, u.*
                FROM auth_sessions s
                JOIN auth_users u ON s.user_id = u.id
                WHERE s.refresh_token_hash = ? AND s.expires_at > NOW()
            `, [refreshTokenHash]);

            if (sessions.length === 0) return null;
            
            const session = sessions[0];
            delete session.password_hash;
            delete session.refresh_token_hash;
            
            return session;
        } catch (error) {
            throw new Error(`Failed to validate refresh token: ${error.message}`);
        }
    }

    async revokeSession(sessionId) {
        try {
            await pool.query(
                'DELETE FROM auth_sessions WHERE id = ?',
                [sessionId]
            );
            return true;
        } catch (error) {
            throw new Error(`Failed to revoke session: ${error.message}`);
        }
    }

    async revokeAllUserSessions(userId) {
        try {
            await pool.query(
                'DELETE FROM auth_sessions WHERE user_id = ?',
                [userId]
            );
            return true;
        } catch (error) {
            throw new Error(`Failed to revoke sessions: ${error.message}`);
        }
    }

    async getUserSessions(userId) {
        try {
            const [sessions] = await pool.query(
                'SELECT * FROM auth_sessions WHERE user_id = ? AND expires_at > NOW() ORDER BY created_at DESC',
                [userId]
            );
            return sessions;
        } catch (error) {
            throw new Error(`Failed to get user sessions: ${error.message}`);
        }
    }

    // Password Reset
    async createPasswordResetToken(email) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Find user
            const [users] = await connection.query(
                'SELECT id FROM auth_users WHERE email = ?',
                [email]
            );

            if (users.length === 0) {
                throw new Error('User not found');
            }

            const userId = users[0].id;
            
            // Generate reset token
            const resetToken = crypto.randomBytes(32).toString('hex');
            const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
            const expiresAt = new Date(Date.now() + 3600000); // 1 hour

            // Store in user profile metadata (or create separate table)
            await connection.query(`
                UPDATE auth_user_profile 
                SET metadata = JSON_SET(
                    COALESCE(metadata, '{}'),
                    '$.password_reset_token',
                    ?,
                    '$.password_reset_expires',
                    ?
                )
                WHERE user_id = ?
            `, [resetTokenHash, expiresAt, userId]);

            await connection.commit();
            
            return {
                resetToken,
                userId,
                expiresAt
            };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async validatePasswordResetToken(token, userId) {
        try {
            const [profiles] = await pool.query(`
                SELECT metadata
                FROM auth_user_profile
                WHERE user_id = ?
            `, [userId]);

            if (profiles.length === 0) return false;
            
            const metadata = profiles[0].metadata ? JSON.parse(profiles[0].metadata) : {};
            
            if (!metadata.password_reset_token || !metadata.password_reset_expires) {
                return false;
            }

            const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
            const expiresAt = new Date(metadata.password_reset_expires);
            
            return tokenHash === metadata.password_reset_token && expiresAt > new Date();
        } catch (error) {
            throw new Error(`Failed to validate reset token: ${error.message}`);
        }
    }

    async clearPasswordResetToken(userId) {
        try {
            await pool.query(`
                UPDATE auth_user_profile 
                SET metadata = JSON_REMOVE(
                    COALESCE(metadata, '{}'),
                    '$.password_reset_token',
                    '$.password_reset_expires'
                )
                WHERE user_id = ?
            `, [userId]);
            return true;
        } catch (error) {
            throw new Error(`Failed to clear reset token: ${error.message}`);
        }
    }

    // Utility Methods
    async checkEmailExists(email, excludeUserId = null) {
        try {
            let query = 'SELECT COUNT(*) as count FROM auth_users WHERE email = ?';
            const params = [email];

            if (excludeUserId) {
                query += ' AND id != ?';
                params.push(excludeUserId);
            }

            const [result] = await pool.query(query, params);
            return result[0].count > 0;
        } catch (error) {
            throw new Error(`Failed to check email: ${error.message}`);
        }
    }

    async checkUsernameExists(username, excludeUserId = null) {
        try {
            let query = 'SELECT COUNT(*) as count FROM auth_users WHERE username = ?';
            const params = [username];

            if (excludeUserId) {
                query += ' AND id != ?';
                params.push(excludeUserId);
            }

            const [result] = await pool.query(query, params);
            return result[0].count > 0;
        } catch (error) {
            throw new Error(`Failed to check username: ${error.message}`);
        }
    }

    // Specialized Queries
    async getSellers() {
        try {
            const [sellers] = await pool.query(`
                SELECT 
                    u.id, u.email, u.username, u.created_at,
                    up.full_name, up.phone,
                    cs.business_name, cs.registration_number,
                    GROUP_CONCAT(DISTINCT r.name) as roles
                FROM auth_users u
                JOIN auth_users_roles ur ON u.id = ur.user_id
                JOIN auth_roles r ON ur.role_id = r.id
                LEFT JOIN auth_user_profile up ON u.id = up.user_id
                LEFT JOIN catalog_sellers cs ON u.id = cs.user_id
                WHERE r.name = 'seller'
                GROUP BY u.id
                ORDER BY u.created_at DESC
            `);

            return sellers.map(seller => ({
                ...seller,
                roles: seller.roles ? seller.roles.split(',') : []
            }));
        } catch (error) {
            throw new Error(`Failed to fetch sellers: ${error.message}`);
        }
    }

    async getBuyers() {
        try {
            const [buyers] = await pool.query(`
                SELECT 
                    u.id, u.email, u.username, u.created_at,
                    up.full_name, up.phone,
                    GROUP_CONCAT(DISTINCT r.name) as roles
                FROM auth_users u
                JOIN auth_users_roles ur ON u.id = ur.user_id
                JOIN auth_roles r ON ur.role_id = r.id
                LEFT JOIN auth_user_profile up ON u.id = up.user_id
                WHERE r.name = 'buyer' OR r.name = 'user'
                GROUP BY u.id
                ORDER BY u.created_at DESC
            `);

            return buyers.map(buyer => ({
                ...buyer,
                roles: buyer.roles ? buyer.roles.split(',') : []
            }));
        } catch (error) {
            throw new Error(`Failed to fetch buyers: ${error.message}`);
        }
    }

    // Token Generation
    generateAccessToken(user) {
        return jwt.sign(
            {
                id: user.id,
                email: user.email,
                username: user.username,
                roles: user.roles || []
            },
            process.env.JWT_SECRET || 'your_jwt_secret_key_here',
            { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
        );
    }

    generateRefreshToken() {
        return crypto.randomBytes(40).toString('hex');
    }
}

export default new UserModel();