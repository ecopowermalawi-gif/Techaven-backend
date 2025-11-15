import { body, query, validationResult } from 'express-validator';

// Common validation rules for pagination
export const paginationRules = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    query('sort')
        .optional()
        .isString()
        .isIn(['price', 'created_at', 'name', 'title', 'rating'])
        .withMessage('Invalid sort field'),
    query('order')
        .optional()
        .isString()
        .isIn(['asc', 'desc'])
        .withMessage('Order must be asc or desc')
];

export const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }
    next();
};

export const productValidationRules = {
    create: [
        body('title')
            .notEmpty().withMessage('Title is required')
            .isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
        body('description')
            .notEmpty().withMessage('Description is required')
            .isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),
        body('price')
            .notEmpty().withMessage('Price is required')
            .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
        body('stock')
            .notEmpty().withMessage('Stock is required')
            .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
        body('category')
            .notEmpty().withMessage('Category is required')
            .isMongoId().withMessage('Invalid category ID'),
        body('sku')
            .optional()
            .isString().withMessage('SKU must be a string')
            .matches(/^[A-Za-z0-9-_]+$/).withMessage('SKU can only contain letters, numbers, hyphens, and underscores'),
        body('brand')
            .optional()
            .isString().withMessage('Brand must be a string'),
        body('specifications')
            .optional()
            .isArray().withMessage('Specifications must be an array'),
        validateRequest
    ],
    update: [
        body('title')
            .optional()
            .isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
        body('description')
            .optional()
            .isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),
        body('price')
            .optional()
            .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
        body('stock')
            .optional()
            .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
        body('category')
            .optional()
            .isMongoId().withMessage('Invalid category ID'),
        body('sku')
            .optional()
            .isString().withMessage('SKU must be a string')
            .matches(/^[A-Za-z0-9-_]+$/).withMessage('SKU can only contain letters, numbers, hyphens, and underscores'),
        body('brand')
            .optional()
            .isString().withMessage('Brand must be a string'),
        body('specifications')
            .optional()
            .isArray().withMessage('Specifications must be an array'),
        validateRequest
    ]
};

export const validateCategory = [
    body('name').notEmpty().trim().isLength({ min: 2 })
        .withMessage('Name must be at least 2 characters long'),
    body('slug').notEmpty().trim().matches(/^[a-z0-9-]+$/)
        .withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),
    body('parent_id').optional().isInt().withMessage('Parent ID must be an integer'),
    body('description').optional().trim(),
    validateRequest
];

export const userValidationRules = {
    register: [
        body('email')
            .isEmail().withMessage('Invalid email address')
            .normalizeEmail(),
        body('password')
            .isLength({ min: 3 }).withMessage('Password must be at least 6 characters long'),
          
        body('username')
            .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long')
            .matches(/^[A-Za-z0-9_-]+$/).withMessage('Username can only contain letters, numbers, underscores, and hyphens'),
        body('full_name')
            .optional()
            .trim()
            .isLength({ min: 2 }).withMessage('Full name must be at least 2 characters long'),
        body('phone')
            .optional()
            .trim()
            .matches(/^\+?[1-9]\d{1,14}$/).withMessage('Invalid phone number format'),
        validateRequest
    ],

    login: [
        body('email')
            .isEmail().withMessage('Invalid email address')
            .normalizeEmail(),
        body('password')
            .notEmpty().withMessage('Password is required'),
        validateRequest
    ],

    updateProfile: [
        body('full_name')
            .optional()
            .trim()
            .isLength({ min: 2 }).withMessage('Full name must be at least 2 characters long'),
        body('phone')
            .optional()
            .trim()
            .matches(/^\+?[1-9]\d{1,14}$/).withMessage('Invalid phone number format'),
        body('dob')
            .optional()
            .isISO8601().toDate().withMessage('Invalid date format'),
        body('locale')
            .optional()
            .isLength({ min: 2, max: 10 }).withMessage('Invalid locale format'),
        body('address')
            .optional()
            .trim()
            .isLength({ min: 5 }).withMessage('Address must be at least 5 characters long'),
        body('avatar')
            .optional()
            .isURL().withMessage('Avatar must be a valid URL'),
        validateRequest
    ],

    changePassword: [
        body('currentPassword')
            .notEmpty().withMessage('Current password is required'),
        body('newPassword')
            .isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
            .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]/)
            .withMessage('Password must contain at least one letter and one number')
            .custom((value, { req }) => {
                if (value === req.body.currentPassword) {
                    throw new Error('New password must be different from current password');
                }
                return true;
            }),
        body('confirmPassword')
            .custom((value, { req }) => {
                if (value !== req.body.newPassword) {
                    throw new Error('Password confirmation does not match new password');
                }
                return true;
            }),
        validateRequest
    ]
};

export const validatePayment = [
    body('orderId').notEmpty().withMessage('Order ID is required'),
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('currency').isLength({ min: 3, max: 3 }).withMessage('Currency must be a 3-letter code'),
    validateRequest
];

export const validateShop = [
    body('userId').notEmpty().withMessage('User ID is required'),
    body('businessName').optional().isString().trim().isLength({ min: 2 })
        .withMessage('Business name must be at least 2 characters long'),
    body('registrationNumber').optional().isString().trim(),
    validateRequest
];