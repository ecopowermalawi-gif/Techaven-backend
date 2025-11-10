import categoryService from '../services/category.service.js';

class CategoryController {
    async getAllCategories(req, res) {
        try {
            const categories = await categoryService.getAllCategories();
            res.json({
                success: true,
                data: categories
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch categories'
            });
        }
    }

    async getCategoryById(req, res) {
        try {
            const category = await categoryService.getCategoryById(Number(req.params.id));
            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: 'Category not found'
                });
            }
            res.json({
                success: true,
                data: category
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch category'
            });
        }
    }

    async createCategory(req, res) {
        try {
            const categoryId = await categoryService.createCategory(req.body);
            res.status(201).json({
                success: true,
                data: {
                    id: categoryId,
                    message: 'Category created successfully'
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to create category'
            });
        }
    }

    async updateCategory(req, res) {
        try {
            const updated = await categoryService.updateCategory(Number(req.params.id), req.body);
            if (!updated) {
                return res.status(404).json({
                    success: false,
                    message: 'Category not found'
                });
            }
            res.json({
                success: true,
                message: 'Category updated successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to update category'
            });
        }
    }

    async deleteCategory(req, res) {
        try {
            const deleted = await categoryService.deleteCategory(Number(req.params.id));
            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: 'Category not found'
                });
            }
            res.json({
                success: true,
                message: 'Category deleted successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to delete category'
            });
        }
    }

    async getCategoryProducts(req, res) {
        try {
            const categoryId = Number(req.params.id);
            const limit = Number(req.query.limit) || 10;
            const offset = Number(req.query.offset) || 0;

            const products = await categoryService.getCategoryProducts(categoryId, limit, offset);
            res.json({
                success: true,
                data: products
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch category products'
            });
        }
    }
}

export default new CategoryController();