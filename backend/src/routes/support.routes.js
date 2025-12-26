import express from 'express';
import supportController from '../controllers/support.controller.js';
import { auth, checkRole } from '../middleware/auth.js';
import { validate, paginationRules } from '../middleware/validation.js';

const router = express.Router();

// Customer routes
router.post(
    '/tickets',
    auth,
   // validate(supportTicketValidationRules.create),
    supportController.createTicket
);

router.get(
    '/tickets',
    auth,
    paginationRules,
    supportController.getUserTickets
);

router.get(
    '/tickets/:ticketId',
    auth,
    supportController.getTicket
);

router.post(
    '/tickets/:ticketId/reply',
    auth,
    //validate(supportTicketValidationRules.reply),
    supportController.addTicketReply
);

router.get(
    '/tickets/:ticketId/replies',
    auth,
    supportController.getTicketReplies
);

// Support agent routes
router.get(
    '/all-tickets',
    auth,
    checkRole(['admin', 'support']),
    paginationRules,
    supportController.getTickets
);


router.get('/info',
    supportController.getAppInfo
)
router.put(
    '/tickets/:ticketId/status',
    auth,
    checkRole(['admin', 'support']),
    //validate(supportTicketValidationRules.updateStatus),
    supportController.updateTicketStatus
);

router.post(
    '/tickets/:ticketId/assign',
    auth,
    checkRole(['admin', 'support']),
    supportController.assignTicket
);

// Admin routes
router.get(
    '/stats',
    auth,
    checkRole(['admin']),
    supportController.getTicketStats
);

export default router;