import pool from '../config/database.js';

class CategoryService {
    async getAllCategories() {
        try {
            const [categories] = await pool.query(`
                SELECT c.*,
                       COUNT(DISTINCT pc.product_id) as product_count
                FROM catalog_categories c
                LEFT JOIN catalog_product_categories pc ON c.id = pc.category_id
                WHERE c.parent_id IS NULL
                GROUP BY c.id
            `);

            // Fetch subcategories for each main category
            for (let category of categories) {
                category.subcategories = await this.getSubcategories(category.id);
            }

            return categories;
        } catch (error) {
            throw new Error('Failed to fetch categories');
        }
    }

    async getSubcategories(parentId) {
        try {
            const [categories] = await pool.query(`
                SELECT c.*,
                       COUNT(DISTINCT pc.product_id) as product_count
                FROM catalog_categories c
                LEFT JOIN catalog_product_categories pc ON c.id = pc.category_id
                WHERE c.parent_id = ?
                GROUP BY c.id
            `, [parentId]);
            return categories;
        } catch (error) {
            throw new Error('Failed to fetch subcategories');
        }
    }

    async getCategoryById(id) {
        try {
            const [categories] = await pool.query(`
                SELECT c.*,
                       COUNT(DISTINCT pc.product_id) as product_count
                FROM catalog_categories c
                LEFT JOIN catalog_product_categories pc ON c.id = pc.category_id
                WHERE c.id = ?
                GROUP BY c.id
            `, [id]);

            if (categories.length === 0) return null;

            const category = categories[0];
            if (category.parent_id === null) {
                category.subcategories = await this.getSubcategories(category.id);
            }

            return category;
        } catch (error) {
            throw new Error('Failed to fetch category');
        }
    }

    async createCategory(data) {
        try {
            const [result] = await pool.query(`
                INSERT INTO catalog_categories (parent_id, name, slug, description)
                VALUES (?, ?, ?, ?)
            `, [
                data.parent_id || null,
                data.name,
                data.slug,
                data.description
            ]);

            return result.insertId;
        } catch (error) {
            throw new Error('Failed to create category');
        }
    }

    async updateCategory(id, data) {
        try {
            const [result] = await pool.query(`
                UPDATE catalog_categories
                SET parent_id = COALESCE(?, parent_id),
                    name = COALESCE(?, name),
                    slug = COALESCE(?, slug),
                    description = COALESCE(?, description)
                WHERE id = ?
            `, [
                data.parent_id,
                data.name,
                data.slug,
                data.description,
                id
            ]);

            return result.affectedRows > 0;
        } catch (error) {
            throw new Error('Failed to update category');
        }
    }

    async deleteCategory(id) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Delete product associations first
            await connection.query(
                'DELETE FROM catalog_product_categories WHERE category_id = ?',
                [id]
            );

            // Delete the category
            const [result] = await connection.query(
                'DELETE FROM catalog_categories WHERE id = ?',
                [id]
            );

            await connection.commit();
            return result.affectedRows > 0;
        } catch (error) {
            await connection.rollback();
            throw new Error('Failed to delete category');
        } finally {
            connection.release();
        }
    }

    async getCategoryProducts(categoryId, limit = 10, offset = 0) {
        try {
            const [products] = await pool.query(`
                SELECT p.*,
                       COUNT(DISTINCT pr.id) as review_count,
                       AVG(pr.rating) as average_rating
                FROM catalog_products p
                JOIN catalog_product_categories pc ON p.id = pc.product_id
                LEFT JOIN review_product_reviews pr ON p.id = pr.product_id
                WHERE pc.category_id = ? AND p.is_active = 1
                GROUP BY p.id
                LIMIT ? OFFSET ?
            `, [categoryId, limit, offset]);

            return Array.isArray(products) ? products : [];
        } catch (error) {
            throw new Error('Failed to fetch category products');
        }
    }
}

export default new CategoryService();