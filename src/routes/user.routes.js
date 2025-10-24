import express from 'express';
import userController from '../controllers/user.controller.js';
import { auth, checkRole } from '../middleware/auth.js';
import { userValidationRules } from '../middleware/validation.js';
import { loginLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

// Public routes

router.get('/',(req, res)=>{
    res.send('User route is working');
console.log('User route accessed');

    })



router.post(
    '/register',
    // userValidationRules.register,
    userController.register
);

router.post(
    '/login',
    loginLimiter,
    userValidationRules.login,
    userController.login
);

// Protected routes
router.get(
    '/profile',
    auth,
    userController.getProfile
);

router.put(
    '/profile',
    auth,
    userValidationRules.updateProfile,
    userController.updateProfile
);

router.put(
    '/change-password',
    auth,
    userValidationRules.changePassword,
    userController.changePassword
);

// Admin routes
router.post(
    '/role',
    auth,
    checkRole(['admin']),
    userController.addRole
);

export default router;