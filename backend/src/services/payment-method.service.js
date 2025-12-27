import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../middleware/error.js';

const AVAILABLE_PROVIDERS = [
    { type: 'mobile_money', provider: 'Airtel Money', icon: 'airtel_money' },
    { type: 'mobile_money', provider: 'TNM Mpamba', icon: 'tnm_mpamba' },
    { type: 'bank_transfer', provider: 'National Bank', icon: 'national_bank' }
];

class PaymentMethodService {
    // Get payment methods
    async getPaymentMethods(userId) {
        const connection = await pool.getConnection();
        try {
            const [methods] = await connection.query(`
                SELECT 
                    id,
                    type,
                    provider,
                    phone_number,
                    is_default,
                    created_at
                FROM user_payment_methods
                WHERE user_id = ?
                ORDER BY is_default DESC, created_at DESC
            `, [userId]);

            return {
                payment_methods: methods,
                available_providers: AVAILABLE_PROVIDERS
            };
        } finally {
            connection.release();
        }
    }

    // Add payment method
    async addPaymentMethod(userId, data) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const id = uuidv4();
            const isDefault = data.is_default || false;

            // If default, remove default from others
            if (isDefault) {
                await connection.query(
                    'UPDATE user_payment_methods SET is_default = 0 WHERE user_id = ?',
                    [userId]
                );
            }

            await connection.query(`
                INSERT INTO user_payment_methods 
                (id, user_id, type, provider, phone_number, is_default)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [
                id, userId, data.type, data.provider,
                data.phone_number || null, isDefault ? 1 : 0
            ]);

            await connection.commit();

            return { id };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Delete payment method
    async deletePaymentMethod(userId, paymentMethodId) {
        const connection = await pool.getConnection();
        try {
            // Verify ownership
            const [existing] = await connection.query(
                'SELECT id FROM user_payment_methods WHERE id = ? AND user_id = ?',
                [paymentMethodId, userId]
            );

            if (existing.length === 0) {
                throw new AppError('Payment method not found', 404);
            }

            await connection.query(
                'DELETE FROM user_payment_methods WHERE id = ? AND user_id = ?',
                [paymentMethodId, userId]
            );
        } finally {
            connection.release();
        }
    }
}

export default new PaymentMethodService();
