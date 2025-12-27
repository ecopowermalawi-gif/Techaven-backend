import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../middleware/error.js';

class AddressService {
    // Get user's addresses
    async getAddresses(userId) {
        const connection = await pool.getConnection();
        try {
            const [addresses] = await connection.query(`
                SELECT 
                    id,
                    label,
                    full_name,
                    phone,
                    address_line_1,
                    address_line_2,
                    city,
                    state,
                    postal_code,
                    country,
                    is_default,
                    created_at
                FROM order_addresses
                WHERE user_id = ?
                ORDER BY is_default DESC, created_at DESC
            `, [userId]);

            return addresses;
        } finally {
            connection.release();
        }
    }

    // Add address
    async addAddress(userId, data) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const id = uuidv4();
            const isDefault = data.is_default || false;

            // If this is default, remove default from others
            if (isDefault) {
                await connection.query(
                    'UPDATE order_addresses SET is_default = 0 WHERE user_id = ?',
                    [userId]
                );
            }

            await connection.query(`
                INSERT INTO order_addresses 
                (id, user_id, label, full_name, phone, address_line_1, address_line_2, 
                 city, state, postal_code, country, is_default)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                id, userId, data.label, data.full_name, data.phone,
                data.address_line_1, data.address_line_2 || null,
                data.city, data.state, data.postal_code || null,
                data.country, isDefault ? 1 : 0
            ]);

            await connection.commit();

            return {
                id,
                label: data.label,
                full_name: data.full_name,
                is_default: isDefault
            };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Update address
    async updateAddress(userId, addressId, data) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Verify ownership
            const [existing] = await connection.query(
                'SELECT id FROM order_addresses WHERE id = ? AND user_id = ?',
                [addressId, userId]
            );

            if (existing.length === 0) {
                throw new AppError('Address not found', 404);
            }

            const isDefault = data.is_default || false;

            // If setting as default, remove default from others
            if (isDefault) {
                await connection.query(
                    'UPDATE order_addresses SET is_default = 0 WHERE user_id = ? AND id != ?',
                    [userId, addressId]
                );
            }

            await connection.query(`
                UPDATE order_addresses SET
                    label = ?, full_name = ?, phone = ?,
                    address_line_1 = ?, address_line_2 = ?,
                    city = ?, state = ?, postal_code = ?,
                    country = ?, is_default = ?
                WHERE id = ? AND user_id = ?
            `, [
                data.label || null, data.full_name || null, data.phone || null,
                data.address_line_1 || null, data.address_line_2 || null,
                data.city || null, data.state || null, data.postal_code || null,
                data.country || null, isDefault ? 1 : 0,
                addressId, userId
            ]);

            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Delete address
    async deleteAddress(userId, addressId) {
        const connection = await pool.getConnection();
        try {
            // Verify ownership
            const [existing] = await connection.query(
                'SELECT id FROM order_addresses WHERE id = ? AND user_id = ?',
                [addressId, userId]
            );

            if (existing.length === 0) {
                throw new AppError('Address not found', 404);
            }

            await connection.query(
                'DELETE FROM order_addresses WHERE id = ? AND user_id = ?',
                [addressId, userId]
            );
        } finally {
            connection.release();
        }
    }

    // Set default address
    async setDefaultAddress(userId, addressId) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Verify ownership
            const [existing] = await connection.query(
                'SELECT id FROM order_addresses WHERE id = ? AND user_id = ?',
                [addressId, userId]
            );

            if (existing.length === 0) {
                throw new AppError('Address not found', 404);
            }

            // Remove default from all
            await connection.query(
                'UPDATE order_addresses SET is_default = 0 WHERE user_id = ?',
                [userId]
            );

            // Set as default
            await connection.query(
                'UPDATE order_addresses SET is_default = 1 WHERE id = ?',
                [addressId]
            );

            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}

export default new AddressService();
