import express from 'express';
import notificationController from '../controllers/notification.controller.js';
import { auth } from '../middleware/auth.js';
import { validate, notificationValidationRules, paginationRules } from '../middleware/validation.js';

const router = express.Router();

// ========== PROTECTED ROUTES (All require authentication) ==========

// Get user's notifications
router.get(
    '/',
    auth,
    paginationRules,
    notificationController.getNotifications
);

// Mark notification as read
router.post(
    '/:notificationId/read',
    auth,
    notificationController.markAsRead
);

// Mark all notifications as read
router.post(
    '/read-all',
    auth,
    notificationController.markAllAsRead
);

// Register device for push notifications
router.post(
    '/register-device',
    auth,
    validate(notificationValidationRules.registerDevice),
    notificationController.registerDevice
);

export default router;
