import { body, validationResult } from 'express-validator';

// Validation rules for shop data
export const shopValidationRules = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Shop name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Shop name must be between 2 and 100 characters'),
        
    body('description')
        .trim()
        .notEmpty()
        .withMessage('Shop description is required')
        .isLength({ min: 10, max: 1000 })
        .withMessage('Shop description must be between 10 and 1000 characters'),
        
    body('category')
        .trim()
        .notEmpty()
        .withMessage('Shop category is required')
        .isIn(['Electronics', 'Fashion', 'Home', 'Beauty', 'Sports', 'Books', 'Other'])
        .withMessage('Invalid shop category'),
        
    body('address')
        .trim()
        .notEmpty()
        .withMessage('Shop address is required')
        .isLength({ min: 5, max: 200 })
        .withMessage('Shop address must be between 5 and 200 characters')
];

// Function to validate shop data
export const validateShopData = (data) => {
    const errors = [];
    
    // Validate required fields
    if (!data.name) {
        errors.push({ field: 'name', message: 'Shop name is required' });
    } else if (data.name.length < 2 || data.name.length > 100) {
        errors.push({ field: 'name', message: 'Shop name must be between 2 and 100 characters' });
    }
    
    if (!data.description) {
        errors.push({ field: 'description', message: 'Shop description is required' });
    } else if (data.description.length < 10 || data.description.length > 1000) {
        errors.push({ field: 'description', message: 'Shop description must be between 10 and 1000 characters' });
    }
    
    const validCategories = ['Electronics', 'Fashion', 'Home', 'Beauty', 'Sports', 'Books', 'Other'];
    if (!data.category) {
        errors.push({ field: 'category', message: 'Shop category is required' });
    } else if (!validCategories.includes(data.category)) {
        errors.push({ field: 'category', message: 'Invalid shop category' });
    }
    
    if (!data.address) {
        errors.push({ field: 'address', message: 'Shop address is required' });
    } else if (data.address.length < 5 || data.address.length > 200) {
        errors.push({ field: 'address', message: 'Shop address must be between 5 and 200 characters' });
    }
    
    return errors;
};