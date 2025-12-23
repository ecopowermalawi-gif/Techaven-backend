import { body, query, validationResult } from 'express-validator';

// ========== VALIDATION MIDDLEWARE FACTORY ==========
export const validate = (validations) => {
    return async (req, res, next) => {
        await Promise.all(validations.map(validation => validation.run(req)));
        
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }
        
        res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    };
};

// ========== PAGINATION RULES ==========
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
        .isIn(['price', 'created_at', 'name', 'title', 'rating', 'updated_at'])
        .withMessage('Invalid sort field'),
    query('order')
        .optional()
        .isString()
        .isIn(['asc', 'desc'])
        .withMessage('Order must be asc or desc'),
    query('search')
        .optional()
        .isString()
        .trim()
        .withMessage('Search query must be a string')
];

// ========== PRODUCT VALIDATION RULES ==========
export const productValidationRules = {
    create: [
        body('title')
            .notEmpty().withMessage('Title is required')
            .trim()
            .isLength({ min: 3, max: 255 }).withMessage('Title must be between 3 and 255 characters'),
        body('short_description')
            .optional()
            .trim()
            .isLength({ max: 512 }).withMessage('Short description must be less than 512 characters'),
        body('long_description')
            .optional()
            .trim()
            .isLength({ max: 5000 }).withMessage('Long description must be less than 5000 characters'),
        body('price')
            .notEmpty().withMessage('Price is required')
            .isFloat({ min: 0 }).withMessage('Price must be a positive number')
            .custom(value => {
                if (value > 999999999999.99) {
                    throw new Error('Price is too large');
                }
                return true;
            }),
        body('currency')
            .optional()
            .isString()
            .isLength({ min: 3, max: 3 })
            .withMessage('Currency must be a 3-letter code'),
        body('sku')
            .notEmpty().withMessage('SKU is required')
            .isString()
            .trim()
            .isLength({ max: 100 }).withMessage('SKU must be less than 100 characters'),
        body('category_id')
            .optional()
            .isInt({ min: 1 }).withMessage('Category ID must be a positive integer'),
        body('tag_ids')
            .optional()
            .isArray().withMessage('Tag IDs must be an array'),
        body('weight_grams')
            .optional()
            .isInt({ min: 0 }).withMessage('Weight must be a non-negative integer'),
        body('is_active')
            .optional()
            .isBoolean().withMessage('Active status must be boolean')
    ],
    
    update: [
        body('title')
            .optional()
            .trim()
            .isLength({ min: 3, max: 255 }).withMessage('Title must be between 3 and 255 characters'),
        body('short_description')
            .optional()
            .trim()
            .isLength({ max: 512 }).withMessage('Short description must be less than 512 characters'),
        body('long_description')
            .optional()
            .trim()
            .isLength({ max: 5000 }).withMessage('Long description must be less than 5000 characters'),
        body('price')
            .optional()
            .isFloat({ min: 0 }).withMessage('Price must be a positive number')
            .custom(value => {
                if (value > 999999999999.99) {
                    throw new Error('Price is too large');
                }
                return true;
            }),
        body('currency')
            .optional()
            .isString()
            .isLength({ min: 3, max: 3 })
            .withMessage('Currency must be a 3-letter code'),
        body('sku')
            .optional()
            .isString()
            .trim()
            .isLength({ max: 100 }).withMessage('SKU must be less than 100 characters'),
        body('category_id')
            .optional()
            .isInt({ min: 1 }).withMessage('Category ID must be a positive integer'),
        body('tag_ids')
            .optional()
            .isArray().withMessage('Tag IDs must be an array'),
        body('weight_grams')
            .optional()
            .isInt({ min: 0 }).withMessage('Weight must be a non-negative integer'),
        body('is_active')
            .optional()
            .isBoolean().withMessage('Active status must be boolean')
    ],
    
    search: [
        query('q')
            .optional()
            .trim()
            .isString().withMessage('Search query must be a string'),
        query('category')
            .optional()
            .isInt({ min: 1 }).withMessage('Category must be a valid ID'),
        query('min_price')
            .optional()
            .isFloat({ min: 0 }).withMessage('Minimum price must be a positive number'),
        query('max_price')
            .optional()
            .isFloat({ min: 0 }).withMessage('Maximum price must be a positive number'),
        query('seller_id')
            .optional()
            .isLength({ min: 36, max: 36 }).withMessage('Invalid seller ID format'),
        ...paginationRules
    ]
};

// ========== USER VALIDATION RULES ==========
export const userValidationRules = {
    register: [
        body('email')
            .isEmail().withMessage('Please provide a valid email')
            .normalizeEmail(),
        body('password')
            .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
            .matches(/\d/).withMessage('Password must contain a number'),
        body('username')
            .optional()
            .isLength({ min: 3 }).withMessage('Username must be at least 3 characters')
            .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores'),
        body('role')
            .optional()
            .isIn(['user', 'seller', 'buyer', 'admin']).withMessage('Invalid role'),
        body('business_name')
            .if(body('role').equals('seller'))
            .notEmpty().withMessage('Business name is required for sellers')
            .trim()
            .isLength({ min: 2, max: 255 }).withMessage('Business name must be between 2 and 255 characters')
    ],
    
    login: [
        body('email')
            .isEmail().withMessage('Please provide a valid email')
            .normalizeEmail(),
        body('password')
            .notEmpty().withMessage('Password is required')
    ],
    
    updateProfile: [
        body('full_name')
            .optional()
            .trim()
            .isLength({ max: 255 }).withMessage('Full name too long'),
        body('phone')
            .optional()
            .trim()
            .matches(/^[+]?[\d\s\-()]+$/).withMessage('Invalid phone number'),
        body('dob')
            .optional()
            .isISO8601().withMessage('Invalid date format (YYYY-MM-DD)'),
        body('locale')
            .optional()
            .isLength({ min: 2, max: 10 }).withMessage('Invalid locale format')
    ],
    
    changePassword: [
        body('currentPassword')
            .notEmpty().withMessage('Current password is required'),
        body('newPassword')
            .isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
            .matches(/\d/).withMessage('New password must contain a number')
            .custom((value, { req }) => {
                if (value === req.body.currentPassword) {
                    throw new Error('New password must be different from current password');
                }
                return true;
            }),
        body('confirmPassword')
            .custom((value, { req }) => {
                if (value !== req.body.newPassword) {
                    throw new Error('Password confirmation does not match');
                }
                return true;
            })
    ],
    
    forgotPassword: [
        body('email')
            .isEmail().withMessage('Please provide a valid email')
            .normalizeEmail()
    ],
    
    resetPassword: [
        body('token')
            .notEmpty().withMessage('Reset token is required'),
        body('userId')
            .notEmpty().withMessage('User ID is required')
            .isLength({ min: 36, max: 36 }).withMessage('Invalid user ID format'),
        body('newPassword')
            .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
            .matches(/\d/).withMessage('Password must contain a number'),
        body('confirmPassword')
            .custom((value, { req }) => {
                if (value !== req.body.newPassword) {
                    throw new Error('Password confirmation does not match');
                }
                return true;
            })
    ],

    sendOTP: [
        body('email')
            .isEmail().withMessage('Please provide a valid email')
            .normalizeEmail()
    ],

    verifyOTP: [
        body('userId')
            .notEmpty().withMessage('User ID is required')
            .isLength({ min: 36, max: 36 }).withMessage('Invalid user ID format'),
        body('otp')
            .notEmpty().withMessage('OTP is required')
            .isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
            .isNumeric().withMessage('OTP must contain only numbers')
    ],
    
    addRole: [
        body('userId')
            .notEmpty().withMessage('User ID is required')
            .isLength({ min: 36, max: 36 }).withMessage('Invalid user ID format'),
        body('role')
            .notEmpty().withMessage('Role is required')
            .isIn(['user', 'seller', 'buyer', 'admin']).withMessage('Invalid role')
    ],
    
    removeRole: [
        body('userId')
            .notEmpty().withMessage('User ID is required')
            .isLength({ min: 36, max: 36 }).withMessage('Invalid user ID format'),
        body('role')
            .notEmpty().withMessage('Role is required')
            .isIn(['user', 'seller', 'buyer', 'admin']).withMessage('Invalid role')
    ],
    
    deleteUser: [
        body('user_id')
            .notEmpty().withMessage('User ID is required')
            .isLength({ min: 36, max: 36 }).withMessage('Invalid user ID format')
    ]
};

// ========== CATEGORY VALIDATION RULES ==========
export const categoryValidationRules = {
    create: [
        body('name')
            .notEmpty().withMessage('Name is required')
            .trim()
            .isLength({ min: 2, max: 150 }).withMessage('Name must be between 2 and 150 characters'),
        body('slug')
            .notEmpty().withMessage('Slug is required')
            .trim()
            .matches(/^[a-z0-9-]+$/).withMessage('Slug must contain only lowercase letters, numbers, and hyphens')
            .isLength({ max: 150 }).withMessage('Slug must be less than 150 characters'),
        body('parent_id')
            .optional()
            .isInt({ min: 1 }).withMessage('Parent ID must be a positive integer'),
        body('description')
            .optional()
            .trim()
            .isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters')
    ],
    
    update: [
        body('name')
            .optional()
            .trim()
            .isLength({ min: 2, max: 150 }).withMessage('Name must be between 2 and 150 characters'),
        body('slug')
            .optional()
            .trim()
            .matches(/^[a-z0-9-]+$/).withMessage('Slug must contain only lowercase letters, numbers, and hyphens')
            .isLength({ max: 150 }).withMessage('Slug must be less than 150 characters'),
        body('parent_id')
            .optional()
            .isInt({ min: 1 }).withMessage('Parent ID must be a positive integer'),
        body('description')
            .optional()
            .trim()
            .isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters')
    ]
};

// ========== ORDER VALIDATION RULES ==========
export const orderValidationRules = {
    create: [
        body('seller_id')
            .notEmpty().withMessage('Seller ID is required')
            .isLength({ min: 36, max: 36 }).withMessage('Invalid seller ID format'),
        body('items')
            .notEmpty().withMessage('Items are required')
            .isArray({ min: 1 }).withMessage('Items must be an array with at least one item'),
        body('items.*.product_id')
            .notEmpty().withMessage('Product ID is required for each item')
            .isLength({ min: 36, max: 36 }).withMessage('Invalid product ID format'),
        body('items.*.quantity')
            .notEmpty().withMessage('Quantity is required for each item')
            .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
        body('shipping_address')
            .optional()
            .isObject().withMessage('Shipping address must be an object'),
        body('billing_address')
            .optional()
            .isObject().withMessage('Billing address must be an object')
    ],
    
    updateStatus: [
        body('status')
            .notEmpty().withMessage('Status is required')
            .isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'])
            .withMessage('Invalid status'),
        body('note')
            .optional()
            .trim()
            .isLength({ max: 1000 }).withMessage('Note must be less than 1000 characters')
    ]
};

// ========== PAYMENT VALIDATION RULES ==========
export const paymentValidationRules = {
    create: [
        body('order_id')
            .notEmpty().withMessage('Order ID is required')
            .isLength({ min: 36, max: 36 }).withMessage('Invalid order ID format'),
        body('amount')
            .notEmpty().withMessage('Amount is required')
            .isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
        body('currency')
            .optional()
            .isString()
            .isLength({ min: 3, max: 3 })
            .withMessage('Currency must be a 3-letter code'),
        body('payment_method')
            .notEmpty().withMessage('Payment method is required')
            .isIn(['mpamba', 'airtel_money', 'card', 'mobile_money'])
            .withMessage('Invalid payment method'),
        body('provider_ref')
            .optional()
            .isString().withMessage('Provider reference must be a string')
    ],
    
    update: [
        body('status')
            .notEmpty().withMessage('Status is required')
            .isIn(['initiated', 'pending', 'completed', 'failed', 'refunded'])
            .withMessage('Invalid status'),
        body('provider_ref')
            .optional()
            .isString().withMessage('Provider reference must be a string')
    ]
};

// ========== SELLER/SHOP VALIDATION RULES ==========
export const sellerValidationRules = {
    create: [
        body('user_id')
            .notEmpty().withMessage('User ID is required')
            .isLength({ min: 36, max: 36 }).withMessage('Invalid user ID format'),
        body('business_name')
            .notEmpty().withMessage('Business name is required')
            .trim()
            .isLength({ min: 2, max: 255 }).withMessage('Business name must be between 2 and 255 characters'),
        body('registration_number')
            .optional()
            .trim()
            .isLength({ max: 100 }).withMessage('Registration number must be less than 100 characters')
    ],
    
    update: [
        body('business_name')
            .optional()
            .trim()
            .isLength({ min: 2, max: 255 }).withMessage('Business name must be between 2 and 255 characters'),
        body('registration_number')
            .optional()
            .trim()
            .isLength({ max: 100 }).withMessage('Registration number must be less than 100 characters')
    ]
};

// ========== INVENTORY VALIDATION RULES ==========
export const inventoryValidationRules = {
    update: [
        body('product_id')
            .notEmpty().withMessage('Product ID is required')
            .isLength({ min: 36, max: 36 }).withMessage('Invalid product ID format'),
        body('quantity')
            .notEmpty().withMessage('Quantity is required')
            .isInt().withMessage('Quantity must be an integer'),
        body('delta')
            .optional()
            .isInt().withMessage('Delta must be an integer'),
        body('reason')
            .optional()
            .trim()
            .isLength({ max: 255 }).withMessage('Reason must be less than 255 characters'),
        body('location_code')
            .optional()
            .trim()
            .isLength({ max: 100 }).withMessage('Location code must be less than 100 characters')
    ]
};

// ========== REVIEW VALIDATION RULES ==========
export const reviewValidationRules = {
    create: [
        body('product_id')
            .notEmpty().withMessage('Product ID is required')
            .isLength({ min: 36, max: 36 }).withMessage('Invalid product ID format'),
        body('rating')
            .notEmpty().withMessage('Rating is required')
            .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
        body('title')
            .optional()
            .trim()
            .isLength({ max: 255 }).withMessage('Title must be less than 255 characters'),
        body('body')
            .optional()
            .trim()
            .isLength({ max: 2000 }).withMessage('Review body must be less than 2000 characters')
    ]
};

// ========== EXPORT ALL RULES AS A SINGLE OBJECT ==========
export const validationRules = {
    user: userValidationRules,
    product: productValidationRules,
    category: categoryValidationRules,
    order: orderValidationRules,
    payment: paymentValidationRules,
    seller: sellerValidationRules,
    inventory: inventoryValidationRules,
    review: reviewValidationRules,
    pagination: paginationRules
};

// ========== LEGACY EXPORT FOR BACKWARD COMPATIBILITY ==========
export const validatePayment = validate(paymentValidationRules.create);
export const validateShop = validate(sellerValidationRules.create);
export const validateCategory = validate(categoryValidationRules.create);