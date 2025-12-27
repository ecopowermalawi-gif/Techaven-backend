import walletService from '../services/wallet.service.js';
import { AppError } from '../middleware/error.js';

class WalletController {
    // Get wallet balance
    async getBalance(req, res, next) {
        try {
            const userId = req.user.id;
            const wallet = await walletService.getBalance(userId);
            
            res.json({
                success: true,
                message: 'Wallet retrieved',
                data: {
                    balance: wallet.balance,
                    currency: 'MWK',
                    formatted_balance: `MK ${wallet.balance.toLocaleString()}`
                }
            });
        } catch (error) {
            next(error);
        }
    }

    // Get wallet transactions
    async getTransactions(req, res, next) {
        try {
            const userId = req.user.id;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const type = req.query.type; // 'credit' or 'debit'
            
            const result = await walletService.getTransactions(userId, page, limit, type);
            
            res.json({
                success: true,
                message: 'Transactions retrieved',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    // Top up wallet
    async topupWallet(req, res, next) {
        try {
            const userId = req.user.id;
            const { amount, payment_method, phone_number } = req.body;
            
            const result = await walletService.topupWallet(userId, amount, payment_method, phone_number);
            
            res.status(200).json({
                success: true,
                message: 'Top up initiated',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new WalletController();
