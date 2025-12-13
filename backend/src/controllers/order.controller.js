import orderService from '../services/order.service.js';
import escrowService from '../services/escrow.service.js';
import { validationResult } from 'express-validator';

class OrderController {
    async createOrder(req, res) {
        try {

            // Validate request
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

             console.log('=== REQUEST BODY DEBUG ===');
        console.log('Full request body:', JSON.stringify(req.body, null, 2));
        console.log('Items array received:', req.body.items);
        console.log('Items array type:', typeof req.body.items);
        console.log('Is array?', Array.isArray(req.body.items));
        
        if (req.body.items && Array.isArray(req.body.items)) {
            req.body.items.forEach((item, index) => {
                console.log(`Item ${index}:`, item);
                console.log(`Item ${index} keys:`, Object.keys(item));
                console.log(`Item ${index} productId:`, item.productId);
                console.log(`Item ${index} product_id:`, item.product_id);
                console.log(`Item ${index} price:`, item.price);
                console.log(`Item ${index} unit_price:`, item.unit_price);
                console.log(`Item ${index} sku:`, item.sku);
                console.log(`Item ${index} quantity:`, item.quantity);
            });
        }
        
            const {
                buyer_id,
                seller_id,
                shipping_address_id,
                billing_address_id,
                total_amount,
                currency = 'MWK',
                user_email,
                items
            } = req.body;

            // Validate required fields
            // if (!buyer_id || !seller_id || !total_amount || !items || !Array.isArray(items) || items.length === 0) {
            //     return res.status(400).json({
            //         success: false,
            //         message: 'Missing required fields: buyer_id, seller_id, total_amount, and items array are required'
            //     });
            // }
console.log('Order items:', items);
console.log("requsrt body:", req.body);
            // Validate each item
            // for (let i = 0; i < items.length; i++) {
            //     const item = items[i];
            //     if (!item.product_id || !item.sku || !item.unit_price || !item.quantity) {
            //         return res.status(400).json({
            //             success: false,
            //             message: `Item ${i} missing required fields: product_id, sku, unit_price, and quantity are required`
            //         });
            //     }
            // }

            console.log('Creating order with data:', {
                buyer_id,
                seller_id,
                total_amount,
                currency,
                items_count: items.length
            });

            // Create order using service
            const orderData = await orderService.createOrder({
                buyer_id,
                seller_id,
                shipping_address_id,
                billing_address_id,
                total_amount: parseFloat(total_amount),
                currency,
                user_email,
                items: items.map(item => ({
                    ...item,
                    unit_price: parseFloat(item.unit_price),
                    quantity: parseInt(item.quantity),
                    line_total: item.line_total ? parseFloat(item.line_total) : undefined,
                    tax_amount: item.tax_amount ? parseFloat(item.tax_amount) : undefined
                }))
            });

            res.status(201).json({
                success: true,
                message: 'Order created successfully',
                data: {
                    order_id: orderData.order_id,
                    shipping_address_id: orderData.shipping_address_id,
                    billing_address_id: orderData.billing_address_id,
                    total_amount: total_amount,
                    currency: currency,
                    status: 'pending'
                }
            });

        } catch (error) {
            console.error('Error creating order:', error);
            
            // Handle specific error cases
            let statusCode = 500;
            let errorMessage = error.message || 'Failed to create order';
            
            if (error.message.includes('not found')) {
                statusCode = 404;
            } else if (error.message.includes('Missing required') || error.message.includes('Invalid')) {
                statusCode = 400;
            }

            res.status(statusCode).json({
                success: false,
                message: errorMessage,
                ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
            });
        }
    }



//GETTING ORDER
    async getAllOrdersPublic(req, res) {
        try {
            const { page = 1, limit = 10, status } = req.query;
            
            const orders = await orderService.getAllOrders(
                parseInt(page),
                parseInt(limit),
                status
            );

            res.json({
                success: true,
                data: orders
            });

        } catch (error) {
            console.error('Error fetching orders:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch orders'
            });
        }
    }

    async getOrderByID(req, res) {
        try {
            const  orderId = req.body.order_id;
            const userId = req.body.user_id;

            if (!orderId) {
                return res.status(400).json({
                    success: false,
                    message: 'Order ID is required'
                });
            }

            const order = await orderService.getOrderById(orderId, userId);

            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Order not found'
                });
            }

            res.json({
                success: true,
                data: order
            });

        } catch (error) {
            console.error('Error fetching order:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch order'
            });
        }
    }

    async confirmOrderByID(req, res) {
        try {
            const user_id = req.body.user_id;
            const  order_id  = req.body.order_id;

            if (!order_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Order ID is required'
                });
            }

            await orderService.confirmOderById(order_id);

            res.json({
                success: true,
                message: `Order ${order_id} confirmed successfully`
            });

        } catch (error) {
            console.error('Error confirming order:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to confirm order'
            });
        }
    }

    async getUserOrders(req, res) {
        try {
            const userId = req.body.user_id;
            const { page = 1, limit = 10 } = req.query;

            const orders = await orderService.getUserOrders(
                userId,
                parseInt(page),
                parseInt(limit)
            );

            res.json({
                success: true,
                data: orders
            });

        } catch (error) {
            console.error('Error fetching user orders:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch user orders'
            });
        }
    }

    async updateOrderStatus(req, res) {
        try {
            const  orderId  = req.body.order_id;
            const  status  = req.body.status;
            const user_id = req.body.user_id;

            if (!orderId || !status) {
                return res.status(400).json({
                    success: false,
                    message: 'Order ID and status are required'
                });
            }

            await orderService.updateOrderStatus(orderId, user_id, status);

            res.json({
                success: true,
                message: 'Order status updated successfully'
            });

        } catch (error) {
            console.error('Error updating order status:', error);
            
            let statusCode = 500;
            if (error.message.includes('Invalid order status') || error.message.includes('Order not found')) {
                statusCode = 400;
            }

            res.status(statusCode).json({
                success: false,
                message: error.message || 'Failed to update order status'
            });
        }
    }


//order staus stacking 
      async processingOrderStatus(req, res) {
        try {
            const  orderId  = req.body.order_id;
            const  status  = "processing";
            const user_id = req.body.user_id;

            if (!orderId || !status) {
                return res.status(400).json({
                    success: false,
                    message: 'Order ID and status are required'
                });
            }

            await orderService.updateOrderStatus(orderId, user_id, status);

            res.json({
                success: true,
                message: 'Order status updated successfully'
            });

        } catch (error) {
            console.error('Error updating order status:', error);
            
            let statusCode = 500;
            if (error.message.includes('Invalid order status') || error.message.includes('Order not found')) {
                statusCode = 400;
            }

            res.status(statusCode).json({
                success: false,
                message: error.message || 'Failed to update order status'
            });
        }
    }

    
      async cancelledOrderStatus(req, res) {
        try {
            const  orderId  = req.body.order_id;
            const  status  = "cancelled";
            const user_id = req.body.user_id;

            if (!orderId || !status) {
                return res.status(400).json({
                    success: false,
                    message: 'Order ID and status are required'
                });
            }

            await orderService.updateOrderStatus(orderId, user_id, status);

            res.json({
                success: true,
                message: 'Order status updated successfully'
            });

        } catch (error) {
            console.error('Error updating order status:', error);
            
            let statusCode = 500;
            if (error.message.includes('Invalid order status') || error.message.includes('Order not found')) {
                statusCode = 400;
            }

            res.status(statusCode).json({
                success: false,
                message: error.message || 'Failed to update order status'
            });
        }
    }

   async pendingOrderStatus(req, res) {
        try {
            const  orderId  = req.body.order_id;
            const  status  = "pending";
            const user_id = req.body.user_id;

            if (!orderId || !status) {
                return res.status(400).json({
                    success: false,
                    message: 'Order ID and status are required'
                });
            }

            await orderService.updateOrderStatus(orderId, user_id, status);

            res.json({
                success: true,
                message: 'Order status updated successfully'
            });

        } catch (error) {
            console.error('Error updating order status:', error);
            
            let statusCode = 500;
            if (error.message.includes('Invalid order status') || error.message.includes('Order not found')) {
                statusCode = 400;
            }

            res.status(statusCode).json({
                success: false,
                message: error.message || 'Failed to update order status'
            });
        }
    }
    
      async deliveredOrderStatus(req, res) {
        try {
            const  orderId  = req.body.order_id;
            const  status  = "delivered";
            const user_id = req.body.user_id;

            if (!orderId || !status) {
                return res.status(400).json({
                    success: false,
                    message: 'Order ID and status are required'
                });
            }

            await orderService.updateOrderStatus(orderId, user_id, status);

            res.json({
                success: true,
                message: 'Order status updated successfully'
            });

        } catch (error) {
            console.error('Error updating order status:', error);
            
            let statusCode = 500;
            if (error.message.includes('Invalid order status') || error.message.includes('Order not found')) {
                statusCode = 400;
            }

            res.status(statusCode).json({
                success: false,
                message: error.message || 'Failed to update order status'
            });
        }
    }


      
      async shippedOrderStatus(req, res) {
        try {
            const  orderId  = req.body.order_id;
            const  status  = "shipped";
            const user_id = req.body.user_id;

            if (!orderId || !status) {
                return res.status(400).json({
                    success: false,
                    message: 'Order ID and status are required'
                });
            }

            await orderService.updateOrderStatus(orderId, user_id, status);

            res.json({
                success: true,
                message: 'Order status updated successfully'
            });

        } catch (error) {
            console.error('Error updating order status:', error);
            
            let statusCode = 500;
            if (error.message.includes('Invalid order status') || error.message.includes('Order not found')) {
                statusCode = 400;
            }

            res.status(statusCode).json({
                success: false,
                message: error.message || 'Failed to update order status'
            });
        }
    }

    
      async confirmedOrderStatus(req, res) {
        try {
            const  orderId  = req.body.order_id;
            const  status  = "confirmed";
            const user_id = req.body.user_id;

            if (!orderId || !status) {
                return res.status(400).json({
                    success: false,
                    message: 'Order ID and status are required'
                });
            }

            await orderService.updateOrderStatus(orderId, user_id, status);

            res.json({
                success: true,
                message: 'Order status updated successfully'
            });

        } catch (error) {
            console.error('Error updating order status:', error);
            
            let statusCode = 500;
            if (error.message.includes('Invalid order status') || error.message.includes('Order not found')) {
                statusCode = 400;
            }

            res.status(statusCode).json({
                success: false,
                message: error.message || 'Failed to update order status'
            });
        }
    }





    async cancelOrder(req, res) {
        try {

            const  orderId  = req.body.order_id;

            const user_id = req.body.user_id;

            if (!orderId) {
                return res.status(400).json({
                    success: false,
                    message: 'Order ID is required'
                });
            }

            await orderService.cancelOrder(orderId, user_id);

            res.json({
                success: true,
                message: 'Order cancelled successfully'
            });

        } catch (error) {
            console.error('Error cancelling order:', error);
            
            let statusCode = 500;
            if (error.message.includes('Order not found') || error.message.includes('cannot be cancelled')) {
                statusCode = 400;
            }

            res.status(statusCode).json({
                success: false,
                message: error.message || 'Failed to cancel order'
            });
        }
    }

    async addOrderAddress(req, res) {
        try {
            const addressData = req.body;

            // Validate required fields
            if (!addressData.buyer_id || !addressData.full_name || !addressData.line1) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: buyer_id, full_name, and line1 are required'
                });
            }

            const addressId = await orderService.addOrderAddresses(addressData);

            res.status(201).json({
                success: true,
                message: 'Order address created successfully',
                data: {
                    address_id: addressId
                }
            });

        } catch (error) {
            console.error('Error adding order address:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to add order address'
            });
        }
    }

    async getAllOrders(req, res) {
        try {
            const { page = 1, limit = 10, status } = req.query;

            const orders = await orderService.getAllOrders(
                parseInt(page),
                parseInt(limit),
                status
            );

            res.json({
                success: true,
                data: orders
            });

        } catch (error) {
            console.error('Error fetching all orders:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch orders'
            });
        }
    }

    // Helper method for order validation
    async validateOrderItems(items) {
        const validationErrors = [];
        
        items.forEach((item, index) => {
            if (!item.product_id) {
                validationErrors.push(`Item ${index}: product_id is required`);
            }
            if (!item.sku) {
                validationErrors.push(`Item ${index}: sku is required`);
            }
            if (!item.unit_price || isNaN(item.unit_price)) {
                validationErrors.push(`Item ${index}: valid unit_price is required`);
            }
            if (!item.quantity || isNaN(item.quantity) || item.quantity <= 0) {
                validationErrors.push(`Item ${index}: valid quantity is required`);
            }
        });

        return validationErrors;
    }
}

export default new OrderController();