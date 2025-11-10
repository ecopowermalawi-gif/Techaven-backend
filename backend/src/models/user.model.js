import pool from '../config/database.js';
import bcrypt from 'bcryptjs';

class User {
    static async create({
        email,
        password,
        username,
        full_name = null,
        phone = null,
        role = 'user'
    }) {
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const [result] = await pool.query(
            `INSERT INTO users (
                email, password_hash, username, full_name, 
                phone, role, status
            ) VALUES (?, ?, ?, ?, ?, ?, "active")`,
            [email, password_hash, username, full_name, phone, role]
        );

        return this.findById(result.insertId);
    }

    static async findById(id) {
        const [users] = await pool.query(
            'SELECT id, email, username, full_name, phone, role, status, created_at, updated_at FROM users WHERE id = ?',
            [id]
        );
        return users[0];
    }

    static async findByEmail(email) {
        const [users] = await pool.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        return users[0];
    }

    static async update(id, {
        username,
        full_name,
        phone,
        avatar_url,
        address
    }) {
        const updates = [];
        const params = [];

        if (username !== undefined) {
            updates.push('username = ?');
            params.push(username);
        }

        if (full_name !== undefined) {
            updates.push('full_name = ?');
            params.push(full_name);
        }

        if (phone !== undefined) {
            updates.push('phone = ?');
            params.push(phone);
        }

        if (avatar_url !== undefined) {
            updates.push('avatar_url = ?');
            params.push(avatar_url);
        }

        if (address !== undefined) {
            updates.push('address = ?');
            params.push(JSON.stringify(address));
        }

        if (updates.length === 0) {
            return this.findById(id);
        }

        params.push(id);
        await pool.query(
            `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            params
        );

        return this.findById(id);
    }

    static async updatePassword(id, newPassword) {
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(newPassword, salt);

        await pool.query(
            'UPDATE users SET password_hash = ?, password_changed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [password_hash, id]
        );

        return true;
    }

    static async verifyPassword(providedPassword, hashedPassword) {
        return bcrypt.compare(providedPassword, hashedPassword);
    }

    static async updateRole(id, role) {
        await pool.query(
            'UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [role, id]
        );
        return this.findById(id);
    }

    static async delete(id) {
        await pool.query('DELETE FROM users WHERE id = ?', [id]);
        return true;
    }

    static async findAll({ page = 1, limit = 10, role = null, search = '' }) {
        let query = `
            SELECT id, email, username, full_name, phone, role, 
                   status, created_at, updated_at 
            FROM users 
            WHERE 1=1
        `;
        const params = [];

        if (role) {
            query += ' AND role = ?';
            params.push(role);
        }

        if (search) {
            query += ' AND (email LIKE ? OR username LIKE ? OR full_name LIKE ?)';
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        // Add pagination
        const offset = (page - 1) * limit;
        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(Number(limit), offset);

        const [users] = await pool.query(query, params);
        const [{ total }] = await pool.query(
            'SELECT COUNT(*) as total FROM users WHERE 1=1' +
            (role ? ' AND role = ?' : ''),
            role ? [role] : []
        );

        return {
            users,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total
            }
        };
    }

    static async updateStatus(id, status) {
        await pool.query(
            'UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [status, id]
        );
        return this.findById(id);
    }

    static async addAddress(userId, address) {
        const [result] = await pool.query(
            'INSERT INTO user_addresses (user_id, address_line1, address_line2, city, state, postal_code, country, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [
                userId,
                address.address_line1,
                address.address_line2,
                address.city,
                address.state,
                address.postal_code,
                address.country,
                address.is_default || false
            ]
        );

        if (address.is_default) {
            await pool.query(
                'UPDATE user_addresses SET is_default = false WHERE user_id = ? AND id != ?',
                [userId, result.insertId]
            );
        }

        return this.getAddress(result.insertId);
    }

    static async getAddress(addressId) {
        const [addresses] = await pool.query(
            'SELECT * FROM user_addresses WHERE id = ?',
            [addressId]
        );
        return addresses[0];
    }

    static async getUserAddresses(userId) {
        const [addresses] = await pool.query(
            'SELECT * FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC',
            [userId]
        );
        return addresses;
    }

    static async deleteAddress(addressId, userId) {
        await pool.query(
            'DELETE FROM user_addresses WHERE id = ? AND user_id = ?',
            [addressId, userId]
        );
        return true;
    }

    static async setDefaultAddress(addressId, userId) {
        await pool.query('BEGIN');
        try {
            await pool.query(
                'UPDATE user_addresses SET is_default = false WHERE user_id = ?',
                [userId]
            );
            await pool.query(
                'UPDATE user_addresses SET is_default = true WHERE id = ? AND user_id = ?',
                [addressId, userId]
            );
            await pool.query('COMMIT');
            return true;
        } catch (error) {
            await pool.query('ROLLBACK');
            throw error;
        }
    }
}

export default User;