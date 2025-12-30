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
//reister
router.post(
    '/register',
    validate(userValidationRules.register),
    userController.register
);

//login
router.post(
    '/login',
    loginLimiter,
    validate(userValidationRules.login),
    userController.login
);

// verify -otp
router.post(
    '/verify-otp',
    validate(userValidationRules.verifyOTP),
    userController.verifyOTP
);

//resend otp

router.post(
    '/resend-otp',
    //validate(userValidationRules.resendOTP),
    userController.resendOTP
);
//test send otp mail
router.post('/testmail', userController.testOTP); // For testing purposes only

//forgot password
router.post(
    '/forgot-password',
    passwordResetLimiter,
    validate(userValidationRules.forgotPassword),
    userController.forgotPassword
);

//rest-password
router.post(
    '/reset-password',
    //validate(userValidationRules.resetPassword),
    userController.resetPassword
);


//refresh token
router.post(
    '/refresh-token',
   // validate(userValidationRules.refreshToken),
    userController.refreshToken
);

// ========== PROTECTED ROUTES ==========

// User Profile routes
router.get(
    '/profile',
    auth,
    userController.getProfile
);

//update the user profile
router.put(
    '/profile',
    auth,
    validate(userValidationRules.updateProfile),
    userController.updateProfile
);

//uploading profile picture
router.post(
    '/avatar',
    auth,
    uploadSingleFile('avatar'),
    userController.uploadAvatar
);

//chage the password
router.put(
    '/password',
    auth,
    validate(userValidationRules.changePassword),
    userController.changePassword
);

//delete account
router.delete(
    '/account',
    auth,
    validate(userValidationRules.deleteAccount),
    userController.deleteAccount
);


//logout
router.post(
    '/logout',
    auth,
    userController.logout
);

// Admin routes (existing functionality)

//get all users by admin
router.get(
    '/users',
    auth,
    checkRole(['admin']),
    userController.getAllUsers
);

// get all sellers
router.get(
    '/sellers',
    auth,
    checkRole(['admin', 'seller']),
    userController.getSellers
);


//get all sellers
router.get(
    '/buyers',
    auth,
    checkRole(['admin', 'seller']),
    userController.getBuyers
);


//add a role
router.post(
    '/roles',
    auth,
    checkRole(['admin']),
    validate(userValidationRules.addRole),
    userController.addRole
);

//remove a role
router.delete(
    '/roles',
    auth,
    checkRole(['admin']),
    validate(userValidationRules.removeRole),
    userController.removeRole
);

//deactivate account
router.put(
    '/deactivate',
    auth,
    checkRole(['admin']),
    //validate(userValidationRules.deleteUser),
    userController.deactivateAccount
);

//verify shop account
router.put(
    '/verify-shop',
    auth,
    checkRole(['admin']),
    //validate(userValidationRules.deleteUser),
    userController.verifyShop
);

//delete account
router.delete(
    '/users',
    auth,
    checkRole(['admin']),
    //validate(userValidationRules.deleteUser),
    userController.deleteAccount
);

export default router;