import addressService from '../services/address.service.js';
import { AppError } from '../middleware/error.js';

class AddressController {
    // Get user's addresses
    async getAddresses(req, res, next) {
        try {
            const userId = req.user.id;
            const addresses = await addressService.getAddresses(userId);
            
            res.json({
                success: true,
                message: 'Addresses retrieved',
                data: { addresses }
            });
        } catch (error) {
            next(error);
        }
    }

    // Add new address
    async addAddress(req, res, next) {
        try {
            const userId = req.user.id;
            const addressData = req.body;
            
            const result = await addressService.addAddress(userId, addressData);
            
            res.status(201).json({
                success: true,
                message: 'Address added successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    // Update address
    async updateAddress(req, res, next) {
        try {
            const userId = req.user.id;
            const { addressId } = req.params;
            const addressData = req.body;
            
            await addressService.updateAddress(userId, addressId, addressData);
            
            res.json({
                success: true,
                message: 'Address updated successfully',
                data: { id: addressId }
            });
        } catch (error) {
            next(error);
        }
    }

    // Delete address
    async deleteAddress(req, res, next) {
        try {
            const userId = req.user.id;
            const { addressId } = req.params;
            
            await addressService.deleteAddress(userId, addressId);
            
            res.json({
                success: true,
                message: 'Address deleted successfully',
                data: null
            });
        } catch (error) {
            next(error);
        }
    }

    // Set default address
    async setDefaultAddress(req, res, next) {
        try {
            const userId = req.user.id;
            const { addressId } = req.params;
            
            await addressService.setDefaultAddress(userId, addressId);
            
            res.json({
                success: true,
                message: 'Default address updated',
                data: { id: addressId }
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new AddressController();
