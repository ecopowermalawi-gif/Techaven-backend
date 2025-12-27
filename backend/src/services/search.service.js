import pool from '../config/database.js';

class SearchService {
    // Search products
    async searchProducts({ query, page = 1, limit = 20, categoryId, minPrice, maxPrice, sort }) {
        const connection = await pool.getConnection();
        try {
            const offset = (page - 1) * limit;

            // Build base query
            let sqlQuery = `
                SELECT 
                    cp.id,
                    cp.title as name,
                    cp.title as slug,
                    cp.long_description as description,
                    cp.price,
                    cp.price as original_price,
                    0 as discount_percentage,
                    cp.currency,
                    cc.id as category_id,
                    cc.name as category_name,
                    cs.id as vendor_id,
                    cs.business_name as vendor_name,
                    COALESCE(inv.quantity, 0) as stock_quantity,
                    CASE WHEN COALESCE(inv.quantity, 0) > 0 THEN true ELSE false END as is_in_stock,
                    COALESCE(AVG(rpr.rating), 0) as rating,
                    COUNT(DISTINCT rpr.id) as review_count,
                    cpi.url as thumbnail,
                    false as is_featured,
                    false as is_hot_sale,
                    false as is_new_arrival,
                    cp.created_at
                FROM catalog_products cp
                LEFT JOIN catalog_product_categories cpc ON cp.id = cpc.product_id
                LEFT JOIN catalog_categories cc ON cpc.category_id = cc.id
                LEFT JOIN catalog_sellers cs ON cp.seller_id = cs.id
                LEFT JOIN inventory_inventories inv ON cp.id = inv.product_id
                LEFT JOIN review_product_reviews rpr ON cp.id = rpr.product_id
                LEFT JOIN catalog_product_images cpi ON cp.id = cpi.product_id AND cpi.sort_order = 0
                WHERE cp.is_active = 1
            `;

            const params = [];

            // Search by query
            if (query) {
                sqlQuery += ` AND (cp.title LIKE ? OR cp.long_description LIKE ?)`;
                const searchTerm = `%${query}%`;
                params.push(searchTerm, searchTerm);
            }

            // Filter by category
            if (categoryId) {
                sqlQuery += ` AND cc.id = ?`;
                params.push(categoryId);
            }

            // Price range filter
            if (minPrice) {
                sqlQuery += ` AND cp.price >= ?`;
                params.push(minPrice);
            }
            if (maxPrice) {
                sqlQuery += ` AND cp.price <= ?`;
                params.push(maxPrice);
            }

            sqlQuery += ` GROUP BY cp.id`;

            // Sorting
            switch (sort) {
                case 'price_asc':
                    sqlQuery += ` ORDER BY cp.price ASC`;
                    break;
                case 'price_desc':
                    sqlQuery += ` ORDER BY cp.price DESC`;
                    break;
                case 'rating':
                    sqlQuery += ` ORDER BY AVG(rpr.rating) DESC`;
                    break;
                case 'newest':
                    sqlQuery += ` ORDER BY cp.created_at DESC`;
                    break;
                case 'relevance':
                default:
                    sqlQuery += ` ORDER BY cp.created_at DESC`;
            }

            sqlQuery += ` LIMIT ? OFFSET ?`;
            params.push(limit, offset);

            const [products] = await connection.query(sqlQuery, params);

            // Get total count (without limit/offset)
            let countQuery = `
                SELECT COUNT(DISTINCT cp.id) as total
                FROM catalog_products cp
                LEFT JOIN catalog_product_categories cpc ON cp.id = cpc.product_id
                LEFT JOIN catalog_categories cc ON cpc.category_id = cc.id
                WHERE cp.is_active = 1
            `;

            const countParams = [];

            if (query) {
                countQuery += ` AND (cp.title LIKE ? OR cp.long_description LIKE ?)`;
                const searchTerm = `%${query}%`;
                countParams.push(searchTerm, searchTerm);
            }

            if (categoryId) {
                countQuery += ` AND cc.id = ?`;
                countParams.push(categoryId);
            }

            if (minPrice) {
                countQuery += ` AND cp.price >= ?`;
                countParams.push(minPrice);
            }
            if (maxPrice) {
                countQuery += ` AND cp.price <= ?`;
                countParams.push(maxPrice);
            }

            const [countResult] = await connection.query(countQuery, countParams);
            const total = countResult[0].total;
            const totalPages = Math.ceil(total / limit);

            // Get category filters
            const [categoryFilters] = await connection.query(`
                SELECT DISTINCT cc.id, cc.name, COUNT(cp.id) as count
                FROM catalog_categories cc
                LEFT JOIN catalog_product_categories cpc ON cc.id = cpc.category_id
                LEFT JOIN catalog_products cp ON cpc.product_id = cp.id
                WHERE cp.is_active = 1
                GROUP BY cc.id
                ORDER BY cc.name
            `);

            // Get price range
            const [priceRange] = await connection.query(`
                SELECT MIN(price) as min, MAX(price) as max
                FROM catalog_products
                WHERE is_active = 1
            `);

            return {
                query: query || '',
                products: products.map(p => ({
                    id: p.id,
                    name: p.name,
                    slug: p.slug,
                    description: p.description,
                    price: p.price,
                    original_price: p.original_price,
                    discount_percentage: p.discount_percentage,
                    currency: p.currency,
                    category_id: p.category_id,
                    category_name: p.category_name,
                    vendor_id: p.vendor_id,
                    vendor_name: p.vendor_name,
                    stock_quantity: p.stock_quantity,
                    is_in_stock: Boolean(p.is_in_stock),
                    rating: parseFloat(p.rating || 0),
                    review_count: p.review_count,
                    images: [p.thumbnail],
                    thumbnail: p.thumbnail,
                    is_featured: Boolean(p.is_featured),
                    is_hot_sale: Boolean(p.is_hot_sale),
                    is_new_arrival: Boolean(p.is_new_arrival),
                    created_at: p.created_at
                })),
                suggestions: [],
                filters: {
                    categories: categoryFilters,
                    price_range: {
                        min: priceRange[0].min || 0,
                        max: priceRange[0].max || 0
                    }
                },
                pagination: {
                    current_page: page,
                    total_pages: totalPages,
                    total_items: total,
                    items_per_page: limit,
                    has_next: page < totalPages,
                    has_previous: page > 1
                }
            };
        } finally {
            connection.release();
        }
    }

    // Get search suggestions
    async getSearchSuggestions(query) {
        const connection = await pool.getConnection();
        try {
            if (!query || query.length < 2) {
                return [];
            }

            const searchTerm = `%${query}%`;

            // Get product suggestions
            const [products] = await connection.query(`
                SELECT DISTINCT title
                FROM catalog_products
                WHERE title LIKE ? AND is_active = 1
                LIMIT 5
            `, [searchTerm]);

            // Get category suggestions
            const [categories] = await connection.query(`
                SELECT DISTINCT name
                FROM catalog_categories
                WHERE name LIKE ?
                LIMIT 3
            `, [searchTerm]);

            const suggestions = [
                ...products.map(p => ({
                    text: p.title,
                    type: 'product'
                })),
                ...categories.map(c => ({
                    text: c.name,
                    type: 'category'
                }))
            ];

            return suggestions;
        } finally {
            connection.release();
        }
    }
}

export default new SearchService();
