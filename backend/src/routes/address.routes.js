import express from 'express';
import addressController from '../controllers/address.controller.js';
import { auth } from '../middleware/auth.js';
import { validate, addressValidationRules } from '../middleware/validation.js';

const router = express.Router();

// ========== PROTECTED ROUTES (All require authentication) ==========

// Get all user addresses
router.get(
    '/',
    auth,
    addressController.getAddresses
);

// Add new address
router.post(
    '/',
    auth,
    validate(addressValidationRules.create),
    addressController.addAddress
);

// Update address
router.put(
    '/:addressId',
    auth,
    validate(addressValidationRules.update),
    addressController.updateAddress
);

// Delete address
router.delete(
    '/:addressId',
    auth,
    addressController.deleteAddress
);

// Set default address
router.post(
    '/:addressId/default',
    auth,
    addressController.setDefaultAddress
);

export default router;
