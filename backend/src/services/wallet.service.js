import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../middleware/error.js';

class WalletService {
    // Get wallet balance
    async getBalance(userId) {
        const connection = await pool.getConnection();
        try {
            let [wallets] = await connection.query(
                'SELECT balance FROM wallets WHERE user_id = ?',
                [userId]
            );

            // Create wallet if it doesn't exist
            if (wallets.length === 0) {
                const id = uuidv4();
                await connection.query(
                    'INSERT INTO wallets (id, user_id, balance) VALUES (?, ?, 0)',
                    [id, userId]
                );
                return { balance: 0 };
            }

            return { balance: wallets[0].balance || 0 };
        } finally {
            connection.release();
        }
    }

    // Get wallet transactions
    async getTransactions(userId, page = 1, limit = 20, type = null) {
        const connection = await pool.getConnection();
        try {
            const offset = (page - 1) * limit;
            
            let query = `
                SELECT 
                    wt.id,
                    wt.type,
                    wt.amount,
                    'MWK' as currency,
                    wt.description,
                    wt.reference,
                    wt.balance_after,
                    wt.created_at
                FROM wallet_transactions wt
                WHERE wt.user_id = ?
            `;
            
            const params = [userId];
            
            if (type) {
                query += ' AND wt.type = ?';
                params.push(type);
            }

            query += ' ORDER BY wt.created_at DESC LIMIT ? OFFSET ?';
            params.push(limit, offset);

            const [transactions] = await connection.query(query, params);

            // Get total count
            let countQuery = 'SELECT COUNT(*) as total FROM wallet_transactions WHERE user_id = ?';
            const countParams = [userId];
            
            if (type) {
                countQuery += ' AND type = ?';
                countParams.push(type);
            }

            const [countResult] = await connection.query(countQuery, countParams);
            const total = countResult[0].total;
            const totalPages = Math.ceil(total / limit);

            return {
                transactions: transactions,
                pagination: {
                    current_page: page,
                    total_pages: totalPages,
                    total_items: total,
                    items_per_page: limit,
                    has_next: page < totalPages,
                    has_previous: page > 1
                }
            };
        } finally {
            connection.release();
        }
    }

    // Top up wallet
    async topupWallet(userId, amount, paymentMethod, phoneNumber) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Create transaction record
            const transactionId = uuidv4();
            await connection.query(`
                INSERT INTO wallet_transactions 
                (id, user_id, type, amount, description, status)
                VALUES (?, ?, 'pending_topup', ?, ?, 'pending')
            `, [transactionId, userId, amount, `Wallet top-up via ${paymentMethod}`]);

            await connection.commit();

            return {
                transaction_id: transactionId,
                amount,
                status: 'pending',
                payment_url: `https://payment.techaven.mw/topup/${transactionId}`
            };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Add funds to wallet (called after successful payment)
    async addFunds(userId, amount, reference, description) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Get current balance
            const [wallets] = await connection.query(
                'SELECT id FROM wallets WHERE user_id = ?',
                [userId]
            );

            let walletId;
            if (wallets.length === 0) {
                walletId = uuidv4();
                await connection.query(
                    'INSERT INTO wallets (id, user_id, balance) VALUES (?, ?, ?)',
                    [walletId, userId, amount]
                );
            } else {
                walletId = wallets[0].id;
                await connection.query(
                    'UPDATE wallets SET balance = balance + ? WHERE id = ?',
                    [amount, walletId]
                );
            }

            // Get new balance
            const [updated] = await connection.query(
                'SELECT balance FROM wallets WHERE id = ?',
                [walletId]
            );

            const newBalance = updated[0].balance;

            // Record transaction
            const transactionId = uuidv4();
            await connection.query(`
                INSERT INTO wallet_transactions 
                (id, user_id, type, amount, description, reference, balance_after, status)
                VALUES (?, ?, 'credit', ?, ?, ?, ?, 'completed')
            `, [transactionId, userId, amount, description, reference, newBalance]);

            await connection.commit();

            return { balance: newBalance };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Deduct from wallet (for orders/purchases)
    async deductFunds(userId, amount, reference, description) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Get current balance
            const [wallets] = await connection.query(
                'SELECT id, balance FROM wallets WHERE user_id = ?',
                [userId]
            );

            if (wallets.length === 0 || wallets[0].balance < amount) {
                throw new AppError('Insufficient wallet balance', 400);
            }

            const walletId = wallets[0].id;

            // Deduct amount
            await connection.query(
                'UPDATE wallets SET balance = balance - ? WHERE id = ?',
                [amount, walletId]
            );

            // Get new balance
            const [updated] = await connection.query(
                'SELECT balance FROM wallets WHERE id = ?',
                [walletId]
            );

            const newBalance = updated[0].balance;

            // Record transaction
            const transactionId = uuidv4();
            await connection.query(`
                INSERT INTO wallet_transactions 
                (id, user_id, type, amount, description, reference, balance_after, status)
                VALUES (?, ?, 'debit', ?, ?, ?, ?, 'completed')
            `, [transactionId, userId, amount, description, reference, newBalance]);

            await connection.commit();

            return { balance: newBalance };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}

export default new WalletService();
