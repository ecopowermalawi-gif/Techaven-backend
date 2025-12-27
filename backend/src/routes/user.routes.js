import express from 'express';
import userController from '../controllers/user.controller.js';
import { auth, checkRole } from '../middleware/auth.js';
import { 
    validate, 
    userValidationRules 
} from '../middleware/validation.js';
import { loginLimiter, passwordResetLimiter } from '../middleware/rateLimit.js';
import { uploadSingleFile } from '../middleware/upload.js';

const router = express.Router();

// ========== PUBLIC ROUTES ==========

// Auth routes
router.post(
    '/register',
    validate(userValidationRules.register),
    userController.register
);

router.post(
    '/login',
    loginLimiter,
    validate(userValidationRules.login),
    userController.login
);

router.post(
    '/verify-otp',
    validate(userValidationRules.verifyOTP),
    userController.verifyOTP
);

router.post(
    '/resend-otp',
    validate(userValidationRules.resendOTP),
    userController.resendOTP
);

router.post(
    '/forgot-password',
    passwordResetLimiter,
    validate(userValidationRules.forgotPassword),
    userController.forgotPassword
);

router.post(
    '/reset-password',
    validate(userValidationRules.resetPassword),
    userController.resetPassword
);

router.post(
    '/refresh-token',
    validate(userValidationRules.refreshToken),
    userController.refreshToken
);

// ========== PROTECTED ROUTES ==========

// User Profile routes
router.get(
    '/profile',
    auth,
    userController.getProfile
);

router.put(
    '/profile',
    auth,
    validate(userValidationRules.updateProfile),
    userController.updateProfile
);

router.post(
    '/avatar',
    auth,
    uploadSingleFile('avatar'),
    userController.uploadAvatar
);

router.put(
    '/password',
    auth,
    validate(userValidationRules.changePassword),
    userController.changePassword
);

router.delete(
    '/account',
    auth,
    validate(userValidationRules.deleteAccount),
    userController.deleteAccount
);

router.post(
    '/logout',
    auth,
    userController.logout
);

// Admin routes (existing functionality)
router.get(
    '/users',
    auth,
    checkRole(['admin']),
    userController.getAllUsers
);

router.get(
    '/sellers',
    auth,
    checkRole(['admin', 'seller']),
    userController.getSellers
);

router.get(
    '/buyers',
    auth,
    checkRole(['admin', 'seller']),
    userController.getBuyers
);

router.post(
    '/roles',
    auth,
    checkRole(['admin']),
    validate(userValidationRules.addRole),
    userController.addRole
);

router.delete(
    '/roles',
    auth,
    checkRole(['admin']),
    validate(userValidationRules.removeRole),
    userController.removeRole
);

router.delete(
    '/users',
    auth,
    checkRole(['admin']),
    validate(userValidationRules.deleteUser),
    userController.deleteAccount
);

export default router;