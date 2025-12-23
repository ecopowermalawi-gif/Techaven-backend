import express from 'express';
import userController from '../controllers/user.controller.js';
import { auth, checkRole } from '../middleware/auth.js';
import { 
    validate, 
    userValidationRules 
} from '../middleware/validation.js';
import { loginLimiter, passwordResetLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

// Health check
router.get('/health', userController.health);

// Public routes
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
    '/refresh-token',
    userController.refreshToken
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

// OTP routes
router.post(
    '/send-otp',
    validate(userValidationRules.sendOTP),
    userController.sendOTP
);

router.post(
    '/verify-otp',
    validate(userValidationRules.verifyOTP),
    userController.verifyOTP
);

// Protected routes (require authentication)
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

router.put(
    '/change-password',
    auth,
    validate(userValidationRules.changePassword),
    userController.changePassword
);

router.post(
    '/logout',
    auth,
    userController.logout
);

router.post(
    '/logout-all',
    auth,
    userController.logoutAll
);

router.get(
    '/sessions',
    auth,
    userController.getSessions
);

router.post(
    '/deactivate',
    auth,
    userController.deactivateAccount
);

// Admin routes
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
    userController.deleteUser
);

// Test route
router.get('/', (req, res) => {
    res.json({
        message: 'User API is working',
        endpoints: [
            'POST /register',
            'POST /login',
            'POST /refresh-token',
            'POST /forgot-password',
            'POST /reset-password',
            'GET /profile',
            'PUT /profile',
            'PUT /change-password',
            'POST /logout',
            'GET /sessions',
            'GET /users (admin)',
            'GET /sellers',
            'GET /buyers',
            'POST /roles (admin)',
            'DELETE /roles (admin)',
            'DELETE /users (admin)'
        ]
    });
});

export default router;