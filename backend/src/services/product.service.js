import { v4 as uuidv4 } from 'uuid';
import ProductModel from '../models/product.model.js';  
import pool from '../config/database.js';

class ProductService {
    async getAllProducts(limit = 10, offset = 0) {
        try {
            const [products] = await pool.query(`
                SELECT p.*, 
                       GROUP_CONCAT(DISTINCT c.id, ':', c.name, ':', c.slug) as categories,
                       GROUP_CONCAT(DISTINCT pi.id, ':', pi.url, ':', COALESCE(pi.alt_text, '')) as images
                FROM catalog_products p
                LEFT JOIN catalog_product_categories pc ON p.id = pc.product_id
                LEFT JOIN catalog_categories c ON pc.category_id = c.id
                LEFT JOIN catalog_product_images pi ON p.id = pi.product_id
                WHERE p.is_active = 1
                GROUP BY p.id
                LIMIT ? OFFSET ?
            `, [limit, offset]);

            return products.map(product => this.formatProductResponse(product));
        } catch (error) {
            throw new Error('Error fetching products');
        }
    }

    async getLatestProducts(limit = 10, offset = 0) {

        const db = await pool.getConnection();
        console.log("Inside getLatestProducts service");
        try {
            const [products] = await db.query(`
                SELECT p.*, 
                       GROUP_CONCAT(DISTINCT c.id, ':', c.name, ':', c.slug) as categories,
                       GROUP_CONCAT(DISTINCT pi.id, ':', pi.url, ':', COALESCE(pi.alt_text, '')) as images
                FROM catalog_products p
                LEFT JOIN catalog_product_categories pc ON p.id = pc.product_id
                LEFT JOIN catalog_categories c ON pc.category_id = c.id
                LEFT JOIN catalog_product_images pi ON p.id = pi.product_id
                WHERE p.is_active = 1
                ORDER BY p.created_at DESC
                LIMIT ? OFFSET ?
            `, [limit, offset]);

            return products.map(product => this.formatProductResponse(product));
        } catch (error) {
            throw new Error('Error fetching products');
        }
    }
    
    async getProductById(id) {
        try {
            const [products] = await pool.query(`
                SELECT p.*, 
                       GROUP_CONCAT(DISTINCT c.id, ':', c.name, ':', c.slug) as categories,
                       GROUP_CONCAT(DISTINCT pi.id, ':', pi.url, ':', COALESCE(pi.alt_text, '')) as images
                FROM catalog_products p
                LEFT JOIN catalog_product_categories pc ON p.id = pc.product_id
                LEFT JOIN catalog_categories c ON pc.category_id = c.id
                LEFT JOIN catalog_product_images pi ON p.id = pi.product_id
                WHERE p.id = ?
                GROUP BY p.id
            `, [id]);

            if (products.length === 0) return null;
            
            return this.formatProductResponse(products[0]);
        } catch (error) {
            throw new Error('Error fetching product');
        }
    }

    async createProduct(productData) {
    try {
console.log("creating a product in product services with data : ", productData);
        const productRes = await ProductModel.create(productData);
console.log("response from product creatinon ", productRes);

    } catch (error) {
        console.log("error while creating the product", error)
    } 
    
    }

    async updateProduct(id, productData) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            await connection.query(`
                UPDATE catalog_products 
                SET title = COALESCE(?, title),
                    short_description = COALESCE(?, short_description),
                    long_description = COALESCE(?, long_description),
                    price = COALESCE(?, price),
                    currency = COALESCE(?, currency),
                    is_active = COALESCE(?, is_active),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [
                productData.title,
                productData.short_description,
                productData.long_description,
                productData.price,
                productData.currency,
                productData.is_active,
                id
            ]);

            if (productData.categories) {
                await connection.query('DELETE FROM catalog_product_categories WHERE product_id = ?', [id]);
                const categoryValues = productData.categories.map(cat => [id, cat.id]);
                if (categoryValues.length > 0) {
                    await connection.query(`
                        INSERT INTO catalog_product_categories (product_id, category_id)
                        VALUES ?
                    `, [categoryValues]);
                }
            }

            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw new Error('Error updating product');
        } finally {
            connection.release();
        }
    }

    async deleteProduct(id) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            await connection.query('DELETE FROM catalog_product_categories WHERE product_id = ?', [id]);
            await connection.query('DELETE FROM catalog_product_images WHERE product_id = ?', [id]);
            
            const [result] = await connection.query(
                'DELETE FROM catalog_products WHERE id = ?',
                [id]
            );

            await connection.commit();
            return result.affectedRows > 0;
        } catch (error) {
            await connection.rollback();
            throw new Error('Error deleting product');
        } finally {
            connection.release();
        }
    }

    async searchProducts(query) {
        try {
            const [products] = await pool.query(`
                SELECT p.*, 
                       GROUP_CONCAT(DISTINCT c.id, ':', c.name, ':', c.slug) as categories,
                       GROUP_CONCAT(DISTINCT pi.id, ':', pi.url, ':', COALESCE(pi.alt_text, '')) as images
                FROM catalog_products p
                LEFT JOIN catalog_product_categories pc ON p.id = pc.product_id
                LEFT JOIN catalog_categories c ON pc.category_id = c.id
                LEFT JOIN catalog_product_images pi ON p.id = pi.product_id
                WHERE p.is_active = 1 
                AND (
                    p.title LIKE ? OR 
                    p.short_description LIKE ? OR 
                    p.long_description LIKE ?
                )
                GROUP BY p.id
            `, [`%${query}%`, `%${query}%`, `%${query}%`]);
            console.log("Search products result:", products);

            return products.map(product => this.formatProductResponse(product));
        } catch (error) {
            throw new Error('Error searching products');
        }
    }

    formatProductResponse(product) {
        // Format categories
        const categoriesStr = product.categories;
        const categories = categoriesStr
            ? categoriesStr.split(',').map(cat => {
                const [id, name, slug] = cat.split(':');
                return { id: Number(id), name, slug };
            })
            : [];

        // Format images
        const imagesStr = product.images;
        const images = imagesStr
            ? imagesStr.split(',').map(img => {
                const [id, url, alt_text] = img.split(':');
                return { id, url, alt_text: alt_text || undefined };
            })
            : [];

        return {
            ...product,
            categories,
            images,
            is_active: Boolean(product.is_active)
        };
    }

    async updateStock(productId, quantity) {
        try {
           const updateResults =  await ProductModel.updateStock(productId, quantity);
console.log(" Results from the updates", updateResults);
}
catch(error){
    console.log("Here is the error", error);
}
finally{
    console.log("");
}
    }
}
export default new ProductService();