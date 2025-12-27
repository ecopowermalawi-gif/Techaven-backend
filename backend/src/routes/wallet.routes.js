import express from 'express';
import walletController from '../controllers/wallet.controller.js';
import { auth } from '../middleware/auth.js';
import { validate, walletValidationRules, paginationRules } from '../middleware/validation.js';

const router = express.Router();

// ========== PROTECTED ROUTES (All require authentication) ==========

// Get wallet balance
router.get(
    '/',
    auth,
    walletController.getBalance
);

// Get wallet transactions
router.get(
    '/transactions',
    auth,
    paginationRules,
    walletController.getTransactions
);

// Top up wallet
router.post(
    '/topup',
    auth,
    validate(walletValidationRules.topup),
    walletController.topupWallet
);

export default router;
