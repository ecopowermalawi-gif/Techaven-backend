/**
 * @typedef {Object} QueryResult
 * @property {Array} [0] - The first element is the rows array
 * @property {Array} [1] - The second element is the fields array
 */

/**
 * @typedef {Object} ResultSetHeader
 * @property {number} fieldCount - The number of fields
 * @property {number} affectedRows - Number of affected rows
 * @property {number} insertId - The insert ID if an INSERT
 * @property {number} info - Additional information about the query
 * @property {number} serverStatus - The server status flag
 * @property {number} warningStatus - The warning status flag
 */

/**
 * @typedef {Object} DbPool
 * @property {Function} getConnection - Get a connection from the pool
 * @property {Function} query - Execute a query on the pool
 */

/**
 * @typedef {Object} DbConnection
 * @property {Function} beginTransaction - Start a transaction
 * @property {Function} commit - Commit a transaction
 * @property {Function} rollback - Rollback a transaction
 * @property {Function} query - Execute a query on the connection
 * @property {Function} release - Release the connection back to the pool
 */

/**
 * @typedef {Object} Product
 * @property {number} id - Product ID
 * @property {number} seller_id - Seller ID
 * @property {string} sku - Product SKU
 * @property {string} title - Product title
 * @property {string} description - Product description
 * @property {number} price - Product price
 * @property {string} currency - Product currency
 * @property {number} stock - Product stock quantity
 * @property {number} category_id - Category ID
 * @property {string} [brand] - Product brand
 * @property {Object} [specifications] - Product specifications
 * @property {string} [image_url] - Product image URL
 * @property {string} status - Product status
 * @property {Date} created_at - Creation timestamp
 * @property {Date} [updated_at] - Last update timestamp
 */

/**
 * @typedef {Object} User
 * @property {number} id - User ID
 * @property {string} email - User email
 * @property {string} password_hash - Hashed password
 * @property {string} [username] - Username
 * @property {string} [full_name] - Full name
 * @property {string} [phone] - Phone number
 * @property {string} role - User role
 * @property {string} status - User status
 * @property {Date} created_at - Creation timestamp
 * @property {Date} [updated_at] - Last update timestamp
 */

/**
 * @typedef {Object} Category
 * @property {number} id - Category ID
 * @property {number} [parent_id] - Parent category ID
 * @property {string} name - Category name
 * @property {string} slug - Category slug
 * @property {string} [description] - Category description
 * @property {string} [image_url] - Category image URL
 * @property {string} status - Category status
 * @property {Date} created_at - Creation timestamp
 * @property {Date} [updated_at] - Last update timestamp
 */

/**
 * @typedef {Object} Order
 * @property {number} id - Order ID
 * @property {number} user_id - User ID
 * @property {number} shipping_address_id - Shipping address ID
 * @property {number} [billing_address_id] - Billing address ID
 * @property {number} total_amount - Total order amount
 * @property {string} status - Order status
 * @property {string} payment_method - Payment method
 * @property {string} shipping_method - Shipping method
 * @property {string} [notes] - Order notes
 * @property {Date} created_at - Creation timestamp
 * @property {Date} [updated_at] - Last update timestamp
 */

/**
 * @typedef {Object} Shop
 * @property {number} id - Shop ID
 * @property {number} seller_id - Seller ID
 * @property {string} name - Shop name
 * @property {string} description - Shop description
 * @property {string} category - Shop category
 * @property {string} address - Shop address
 * @property {string} status - Shop status
 * @property {string} [rejection_reason] - Rejection reason if rejected
 * @property {string} [suspension_reason] - Suspension reason if suspended
 * @property {Date} [suspended_until] - Suspension end date
 * @property {Date} created_at - Creation timestamp
 * @property {Date} [updated_at] - Last update timestamp
 */