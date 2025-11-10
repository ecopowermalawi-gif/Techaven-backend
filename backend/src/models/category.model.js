import pool from '../config/database.js';

class Category {
    static async create({
        name,
        slug,
        description = null,
        parent_id = null,
        image_url = null
    }) {
        const [result] = await pool.query(
            `INSERT INTO categories (
                name, slug, description, parent_id, 
                image_url, status
            ) VALUES (?, ?, ?, ?, ?, "active")`,
            [name, slug, description, parent_id, image_url]
        );

        return this.findById(result.insertId);
    }

    static async findById(id) {
        const [categories] = await pool.query(
            `SELECT c.*, 
                    p.name as parent_name,
                    (SELECT COUNT(*) FROM products WHERE category_id = c.id) as product_count
             FROM categories c
             LEFT JOIN categories p ON c.parent_id = p.id
             WHERE c.id = ?`,
            [id]
        );
        return categories[0];
    }

    static async findBySlug(slug) {
        const [categories] = await pool.query(
            `SELECT c.*, 
                    p.name as parent_name,
                    (SELECT COUNT(*) FROM products WHERE category_id = c.id) as product_count
             FROM categories c
             LEFT JOIN categories p ON c.parent_id = p.id
             WHERE c.slug = ?`,
            [slug]
        );
        return categories[0];
    }

    static async findAll({ 
        page = 1, 
        limit = 10,
        parent_id = null,
        includeProducts = false
    }) {
        let query = `
            SELECT c.*, 
                   p.name as parent_name,
                   (SELECT COUNT(*) FROM products WHERE category_id = c.id) as product_count
            FROM categories c
            LEFT JOIN categories p ON c.parent_id = p.id
            WHERE c.status = 'active'
        `;
        const params = [];

        if (parent_id !== null) {
            query += ' AND c.parent_id = ?';
            params.push(parent_id);
        }

        // Add pagination
        const offset = (page - 1) * limit;
        query += ' ORDER BY c.name ASC LIMIT ? OFFSET ?';
        params.push(Number(limit), offset);

        const [categories] = await pool.query(query, params);

        if (includeProducts) {
            // Get products for each category
            for (const category of categories) {
                const [products] = await pool.query(
                    'SELECT * FROM products WHERE category_id = ? AND status = "active" LIMIT 5',
                    [category.id]
                );
                category.products = products;
            }
        }

        const [{ total }] = await pool.query(
            'SELECT COUNT(*) as total FROM categories WHERE status = "active"' +
            (parent_id !== null ? ' AND parent_id = ?' : ''),
            parent_id !== null ? [parent_id] : []
        );

        return {
            categories,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total
            }
        };
    }

    static async update(id, {
        name,
        slug,
        description,
        parent_id,
        image_url,
        status
    }) {
        const updates = [];
        const params = [];

        if (name !== undefined) {
            updates.push('name = ?');
            params.push(name);
        }

        if (slug !== undefined) {
            updates.push('slug = ?');
            params.push(slug);
        }

        if (description !== undefined) {
            updates.push('description = ?');
            params.push(description);
        }

        if (parent_id !== undefined) {
            updates.push('parent_id = ?');
            params.push(parent_id);
        }

        if (image_url !== undefined) {
            updates.push('image_url = ?');
            params.push(image_url);
        }

        if (status !== undefined) {
            updates.push('status = ?');
            params.push(status);
        }

        if (updates.length === 0) {
            return this.findById(id);
        }

        params.push(id);
        await pool.query(
            `UPDATE categories SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            params
        );

        return this.findById(id);
    }

    static async delete(id) {
        await pool.query('DELETE FROM categories WHERE id = ?', [id]);
        return true;
    }

    static async getTree() {
        const [categories] = await pool.query(
            `WITH RECURSIVE CategoryTree AS (
                SELECT 
                    c.*,
                    0 as level,
                    CAST(c.name AS CHAR(1000)) as path
                FROM categories c
                WHERE parent_id IS NULL

                UNION ALL

                SELECT 
                    c.*,
                    ct.level + 1,
                    CONCAT(ct.path, ' > ', c.name)
                FROM categories c
                INNER JOIN CategoryTree ct ON c.parent_id = ct.id
            )
            SELECT *, 
                   (SELECT COUNT(*) FROM products WHERE category_id = CategoryTree.id) as product_count
            FROM CategoryTree
            ORDER BY path`
        );

        // Convert flat structure to tree
        const buildTree = (categories, parentId = null, level = 0) => {
            return categories
                .filter(cat => cat.parent_id === parentId)
                .map(cat => ({
                    ...cat,
                    children: buildTree(categories, cat.id, level + 1)
                }));
        };

        return buildTree(categories);
    }

    static async search(query) {
        const [categories] = await pool.query(
            `SELECT c.*, 
                    p.name as parent_name,
                    (SELECT COUNT(*) FROM products WHERE category_id = c.id) as product_count
             FROM categories c
             LEFT JOIN categories p ON c.parent_id = p.id
             WHERE c.status = 'active'
             AND (c.name LIKE ? OR c.description LIKE ?)
             ORDER BY c.name ASC`,
            [`%${query}%`, `%${query}%`]
        );
        return categories;
    }

    static async moveCategory(id, newParentId) {
        // Check if new parent exists
        if (newParentId) {
            const parent = await this.findById(newParentId);
            if (!parent) {
                throw new Error('Parent category not found');
            }

            // Check for circular reference
            let currentParent = parent;
            while (currentParent.parent_id) {
                if (currentParent.parent_id === id) {
                    throw new Error('Cannot create circular reference in category hierarchy');
                }
                currentParent = await this.findById(currentParent.parent_id);
            }
        }

        await pool.query(
            'UPDATE categories SET parent_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [newParentId, id]
        );

        return this.findById(id);
    }

    static async getProductCount(id) {
        const [result] = await pool.query(
            'SELECT COUNT(*) as count FROM products WHERE category_id = ? AND status = "active"',
            [id]
        );
        return result[0].count;
    }

    static async getSubcategories(id) {
        const [categories] = await pool.query(
            `WITH RECURSIVE CategoryHierarchy AS (
                SELECT * FROM categories WHERE id = ?
                UNION ALL
                SELECT c.* FROM categories c
                INNER JOIN CategoryHierarchy ch ON c.parent_id = ch.id
            )
            SELECT * FROM CategoryHierarchy`,
            [id]
        );
        return categories;
    }
}

export default Category;