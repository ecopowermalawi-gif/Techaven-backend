import mysql from 'mysql2/promise';
import config from '../config/config.js';
import { v4 as uuidv4 } from 'uuid';
import ShopService from './shop.service.js';
import pool from '../config/database.js';
import shippingService from './shipping.service.js';
import userService from './user.service.js';
import { forEachChild } from 'typescript';
import { connect } from 'http2';

class OrderService {
    
    async createOrder({ buyer_id, seller_id, shipping_address_id, billing_address_id, total_amount, currency, user_email, items }) {
        // ... existing createOrder code remains the same ...

         const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();
        
        console.log("######--in order service item are", items);
        console.log("creating an order in order service for ", buyer_id, seller_id, shipping_address_id, billing_address_id, total_amount, currency, user_email);
        
        const order_id = uuidv4();
        const shippingAddressId = uuidv4();
        const billingAddressId = billing_address_id || shippingAddressId; // Use same address if billing not provided
        
        console.log("order id", order_id);
        console.log("shipping address id", shippingAddressId);
        console.log("billing address id", billingAddressId);
        
        // 1. GET USER PROFILE DETAILS FOR SHIPPING ADDRESS
        const [users] = await connection.query(
            `SELECT * FROM auth_user_profile WHERE user_id = ?`,
            [buyer_id]
        );

        if (!users || users.length === 0) {
            throw new Error('User profile not found');
        }

        console.log("user results in user profiles==== id in user control ", users);
        console.log("=====Results of user full name ====== :", users[0].full_name);
        
        const user = users[0];
        const full_name = user.full_name || 'Unknown';
        const phone = user.phone || '';
        const line1 = user.phone || ''; // Using phone as line1 temporarily
        const line2 = user.phone || '';
        const city = user.locale || 'Unknown';
        const region = user.locale || 'Unknown';
        const postal_code = user.phone || '0000';
        const country = user.locale || 'Malawi';
        
        console.log("***************** Address details - id, user_id, full_name, phone", shippingAddressId, buyer_id, full_name, phone);

        // 2. GET SHOP DETAILS FOR SELLER
        const [shops] = await connection.query(
            `SELECT * FROM catalog_sellers WHERE user_id = ?`,
            [seller_id]
        );
        
      
        
        console.log("======= Results of shops ====", shops);
        const shop = shops[0];
        const shopId = shop.id;
        console.log("++++shop id for seller ++++", shopId);

        // 3. CREATE SHIPPING ADDRESS
        console.log("Creating shipping address...");
        const [shippingAddressResult] = await connection.query(
            `INSERT INTO order_addresses 
             (id, user_id, full_name, line1, line2, city, region, postal_code, country, phone) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [shippingAddressId, buyer_id, full_name, line1, line2, city, region, postal_code, country, phone]
        );
        console.log("Shipping address created:", shippingAddressResult);

        // 4. CREATE BILLING ADDRESS (if different from shipping)
        if (billing_address_id && billing_address_id !== shippingAddressId) {
            // If billing address is provided and different from shipping, create it
            const [billingAddressResult] = await connection.query(
                `INSERT INTO order_addresses 
                 (id, user_id, full_name, line1, line2, city, region, postal_code, country, phone) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [billingAddressId, buyer_id, full_name, line1, line2, city, region, postal_code, country, phone]
            );
            console.log("Billing address created:", billingAddressResult);
        }

        // 5. CREATE THE ORDER
        console.log("Creating order with params:", order_id, buyer_id, shopId, shippingAddressId, billingAddressId, total_amount, currency);
        
        const [orderResult] = await connection.query(
            `INSERT INTO order_orders 
             (id, buyer_id, seller_id, shipping_address_id, billing_address_id, 
              total_amount, currency, status, placed_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
            [order_id, buyer_id, shopId, shippingAddressId, shippingAddressId, 
             total_amount, currency || 'MWK', 'pending']
        );
        console.log("Order created:", orderResult);

        // 6. CREATE ORDER ITEMS

const totalEscrowAmount = total_amount *   0.03;    
        console.log("Creating order items...");
        for (let i = 0; i < items.length; i++) {
            console.log("Adding item to order:", items[i]);
            const product_order_id = uuidv4();
            
            // Validate required fields
            if (!items[i].product_id || !items[i].sku || !items[i].unit_price || !items[i].quantity) {
                throw new Error(`Missing required fields for item ${i}`);
            }
            
            // Calculate line total if not provided
            const line_total = items[i].line_total || (items[i].unit_price * items[i].quantity);
            const tax_amount = items[i].tax_amount || 0;

            const [productOrderResult] = await connection.query(
                `INSERT INTO order_items 
                 (id, order_id, product_id, sku, unit_price, quantity, line_total, tax_amount) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    product_order_id,
                    order_id,
                    items[i].product_id, 
                    items[i].sku, 
                    items[i].unit_price, 
                    items[i].quantity, 
                    line_total,
                    tax_amount
                ]
            );
            console.log(`Product ${i} added:`, productOrderResult);
            
            // 7. UPDATE INVENTORY (Reserve stock)
            console.log("Updating inventory...");
            const [inventoryUpdate] = await connection.query(
                `UPDATE inventory_inventories 
                 SET reserved = reserved + ?, 
                     quantity = quantity - ?,
                     updated_at = CURRENT_TIMESTAMP 
                 WHERE product_id = ?`,
                [items[i].quantity, items[i].quantity, items[i].product_id]
            );
            
            if (inventoryUpdate.affectedRows === 0) {
                throw new Error(`Inventory not found for product ${items[i].product_id}`);
            }
            
            // 8. CREATE INVENTORY TRANSACTION LOG
            const transaction_id = uuidv4();
            const [transactionResult] = await connection.query(
                `INSERT INTO inventory_transactions 
                 (id, inventory_id, delta, reason, related_entity_type, related_entity_id) 
                 VALUES (?, 
                         (SELECT id FROM inventory_inventories WHERE product_id = ? LIMIT 1),
                         ?, 'order_reservation', 'order', ?)`,
                [transaction_id, items[i].product_id, -items[i].quantity, order_id]
            );
            console.log("Inventory transaction logged:", transactionResult);
        }

        // 9. CREATE INITIAL ORDER STATUS HISTORY
        const status_history_id = uuidv4();
        const [statusHistoryResult] = await connection.query(
            `INSERT INTO order_status_history 
             (id, order_id, status, changed_by, note, changed_at) 
             VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
            [status_history_id, order_id, 'pending', buyer_id, 'Order created']
        );
        console.log("Status history created:", statusHistoryResult);
 
        // 10. CREATE ESCROW ACCOUNT

        const escow_toal = totalEscrowAmount * items.length;
        const escrow_id = uuidv4();
        const [escrowResult] = await connection.query(
            `INSERT INTO escrow_accounts 
             (id, order_id, escrow_amount, currency, status) 
             VALUES (?, ?, ?, ?, 'held')`,
            [escrow_id, order_id, total_amount - escow_toal, currency || 'MWK']
        );
        console.log("Escrow account created:", escrowResult);

        // 11. CREATE INITIAL SHIPMENT RECORD
        const shipment_id = uuidv4();
        const [shipmentResult] = await connection.query(
            `INSERT INTO shipping_shipments 
             (id, order_id, status) 
             VALUES (?, ?, 'pending')`,
            [shipment_id, order_id]
        );
        console.log("Shipment record created:", shipmentResult);

        // 12. CREATE NOTIFICATION FOR ORDER CREATION
        const notification_id = uuidv4();
        const [notificationResult] = await connection.query(
            `INSERT INTO notification_notifications 
             (id, user_id, channel, type, payload) 
             VALUES (?, ?, 'email', 'order_created', ?)`,
            [notification_id, buyer_id, JSON.stringify({
                orderId: order_id,
                totalAmount: total_amount,
                currency: currency || 'MWK',
                itemsCount: items.length
            })]
        );
        console.log("Notification created:", notificationResult);

        await connection.commit();
        console.log("Order created successfully with ID:", order_id);

        return {
            order_id,
            shipping_address_id: shippingAddressId,
            billing_address_id: billingAddressId,
            status: 'pending'
        };
    }
         finally {
            connection.release();
        }
    }


async confirmOderById({ order_id, user_id }) {
        const connection = await pool.getConnection();
        console.log("confirming order by id in order service", order_id);
        
        const confirmStatus = await this.updateOrderStatus(order_id, user_id, "confirmed");
        console.log("status updated", confirmStatus);
    }
    
async getOrderById(orderId, userId) {
        const connection = await pool.getConnection();
        try {
            const [orders] = await connection.query(
                `SELECT 
                    o.*,
                    sa.full_name as shipping_full_name,
                    sa.line1 as shipping_line1,
                    sa.city as shipping_city,
                    sa.region as shipping_region,
                    sa.country as shipping_country,
                    sa.phone as shipping_phone,
                    ba.full_name as billing_full_name,
                    ba.line1 as billing_line1,
                    ba.city as billing_city,
                    ba.region as billing_region,
                    ba.country as billing_country,
                    ba.phone as billing_phone,
                    ea.escrow_amount,
                    ea.currency as escrow_currency,
                    ea.status as escrow_status,
                    ss.status as shipment_status,
                    ss.tracking_number,
                    ss.carrier,
                    JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'id', oi.id,
                            'productId', oi.product_id,
                            'quantity', oi.quantity,
                            'unitPrice', oi.unit_price,
                            'lineTotal', oi.line_total,
                            'taxAmount', oi.tax_amount,
                            'productName', p.title,
                            'productImage', p.image_url
                        )
                    ) as items,
                    (
                        SELECT JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'id', n.id,
                                'type', n.type,
                                'channel', n.channel,
                                'payload', n.payload,
                                'createdAt', n.created_at,
                                'read', n.is_read
                            )
                        )
                        FROM notification_notifications n
                        WHERE n.user_id = o.buyer_id 
                        AND JSON_EXTRACT(n.payload, '$.orderId') = o.id
                        ORDER BY n.created_at DESC
                        LIMIT 10
                    ) as notifications
                 FROM order_orders o
                 LEFT JOIN order_addresses sa ON o.shipping_address_id = sa.id
                 LEFT JOIN order_addresses ba ON o.billing_address_id = ba.id
                 LEFT JOIN escrow_accounts ea ON o.id = ea.order_id
                 LEFT JOIN shipping_shipments ss ON o.id = ss.order_id
                 JOIN order_items oi ON o.id = oi.order_id
                 JOIN catalog_products p ON oi.product_id = p.id
                 WHERE o.id = ? AND (o.buyer_id = ? OR o.seller_id IN (SELECT id FROM catalog_sellers WHERE user_id = ?))
                 GROUP BY o.id`,
                [orderId, userId, userId]
            );

            return orders.length ? orders[0] : null;
        } finally {
            connection.release();
        }
    }

async getUserOrders(userId, page, limit) {
        const connection = await pool.getConnection();
        try {
            const offset = (page - 1) * limit;

            const [orders] = await connection.query(
                `SELECT 
                    o.*,
                    ea.status as escrow_status,
                    ss.status as shipment_status,
                    (
                        SELECT COUNT(*) 
                        FROM notification_notifications n 
                        WHERE n.user_id = ? 
                        AND JSON_EXTRACT(n.payload, '$.orderId') = o.id 
                        AND n.is_read = false
                    ) as unread_notifications,
                    JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'productId', oi.product_id,
                            'quantity', oi.quantity,
                            'unitPrice', oi.unit_price,
                            'productName', p.title
                        )
                    ) as items
                 FROM order_orders o
                 LEFT JOIN escrow_accounts ea ON o.id = ea.order_id
                 LEFT JOIN shipping_shipments ss ON o.id = ss.order_id
                 JOIN order_items oi ON o.id = oi.order_id
                 JOIN catalog_products p ON oi.product_id = p.id
                 WHERE o.buyer_id = ?
                 GROUP BY o.id
                 ORDER BY o.placed_at DESC
                 LIMIT ? OFFSET ?`,
                [userId, userId, limit, offset]
            );

            const [totalCount] = await connection.query(
                'SELECT COUNT(DISTINCT id) as count FROM order_orders WHERE buyer_id = ?',
                [userId]
            );

            return {
                orders,
                total: totalCount[0].count,
                page,
                totalPages: Math.ceil(totalCount[0].count / limit)
            };
        } finally {
            connection.release();
        }
    }


async updateOrderStatus(orderId, user_id, status, note = null) {
        const connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction();
            
            const validStatuses = ['pending', 'processing', 'confirmed', 'shipped', 'delivered', 'cancelled'];
            if (!validStatuses.includes(status)) {
                throw new Error('Invalid order status');
            }

            // 1. Get order details first to get the buyer_id, seller_id and other info
            const [orders] = await connection.query(
                `SELECT o.*, ea.id as escrow_id 
                 FROM order_orders o
                 LEFT JOIN escrow_accounts ea ON o.id = ea.order_id
                 WHERE o.id = ?`,
                [orderId]
            );

            if (orders.length === 0) {
                throw new Error('Order not found');
            }

            const order = orders[0];
            const oldStatus = order.status;
            
            // 2. Update order status
            const [result] = await connection.query(
                'UPDATE order_orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [status, orderId]
            );

            if (result.affectedRows === 0) {
                throw new Error('Order not found');
            }

            // 3. Create status history
            const status_history_id = uuidv4();
            await connection.query(
                `INSERT INTO order_status_history 
                 (id, order_id, status, changed_by, note, changed_at) 
                 VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
                [status_history_id, orderId, status, user_id, note || `Order status changed from ${oldStatus} to ${status}`]
            );

            // 4. Update escrow status based on order status
            let escrowStatus = null;
            let escrowNote = null;
            
            switch(status) {
                case 'confirmed':
                    escrowStatus = 'held';
                    escrowNote = 'Funds held in escrow';
                    break;
                case 'shipped':
                    escrowStatus = 'pending_release';
                    escrowNote = 'Awaiting delivery confirmation';
                    break;
                case 'delivered':
                    escrowStatus = 'released';
                    escrowNote = 'Funds released to seller';
                    // Create payout record
                    const payout_id = uuidv4();
                    // await connection.query(
                    //     `INSERT INTO seller_payouts 
                    //      (id, seller_id, order_id, amount, currency, status, payout_date) 
                    //      VALUES (?, ?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP)`,
                    //     [payout_id, order.seller_id, orderId, order.total_amount, order.currency]
                    // );
                    break;
                case 'cancelled':
                    escrowStatus = 'refunded';
                    escrowNote = 'Funds refunded to buyer';
                    
                    // Update inventory to restore stock
                    const [items] = await connection.query(
                        'SELECT * FROM order_items WHERE order_id = ?',
                        [orderId]
                    );
                    
                    for (const item of items) {
                        await connection.query(
                            `UPDATE inventory_inventories 
                             SET reserved = reserved - ?, 
                                 quantity = quantity + ?,
                                 updated_at = CURRENT_TIMESTAMP 
                             WHERE product_id = ?`,
                            [item.quantity, item.quantity, item.product_id]
                        );
                        
                        // Create inventory transaction log
                        const transaction_id = uuidv4();
                        await connection.query(
                            `INSERT INTO inventory_transactions 
                             (id, inventory_id, delta, reason, related_entity_type, related_entity_id) 
                             VALUES (?, 
                                     (SELECT id FROM inventory_inventories WHERE product_id = ? LIMIT 1),
                                     ?, 'order_cancellation', 'order', ?)`,
                            [transaction_id, item.product_id, item.quantity, orderId]
                        );
                    }
                    break;
            }
            
            // Update escrow if status changed
            if (escrowStatus && order.escrow_id) {
                await connection.query(
                    'UPDATE escrow_accounts SET status = ? WHERE id = ?',
                    [escrowStatus, order.escrow_id]
                );
                
                // Create escrow history

                //SELECT `id`, `escrow_account_id`, `event_type`, `event_data`, `created_at` FROM `escrow_events` WHERE 1
                const escrow_history_id = uuidv4();
                await connection.query(
                    `INSERT INTO escrow_events 
                     (id, escrow_account_id, event_type, event_data) 
                     VALUES (?, ?, ?, ?)`,
                    [escrow_history_id, order.escrow_id, escrowStatus, JSON.stringify({user_id: user_id,escrowNote})]
                );
            }

            // 5. Update shipment status if applicable
            if (['shipped', 'delivered'].includes(status)) {
                await connection.query(
                    'UPDATE shipping_shipments SET status = ? WHERE order_id = ?',
                    [status, orderId]
                );
            }

            // 6. Get user details for notifications
            const [buyer] = await connection.query(
                'SELECT email, username FROM auth_users WHERE id = ?',
                [order.buyer_id]
            );
            
            const [shop] = await connection.query(
                'SELECT s.user_id as seller_user_id, s.business_name, p.email as seller_email FROM catalog_sellers s JOIN auth_users p ON s.user_id = p.id WHERE s.id = ?',
                [order.seller_id]
            );

            // 7. Create notifications for buyer
            const buyer_notification_id = uuidv4();
            await connection.query(
                `INSERT INTO notification_notifications 
                 (id, user_id, channel, type, payload, is_read, created_at) 
                 VALUES (?, ?, 'web', 'order_status_changed', ?, false, CURRENT_TIMESTAMP)`,
                [
                    buyer_notification_id, 
                    order.buyer_id,
                    JSON.stringify({
                        orderId: orderId,
                        oldStatus: oldStatus,
                        newStatus: status,
                        orderNumber: orderId.substring(0, 8),
                        changedBy: user_id,
                        changedAt: new Date().toISOString(),
                        amount: order.total_amount,
                        currency: order.currency,
                        buyerName: buyer[0]?.full_name || 'Customer',
                        note: note || null
                    })
                ]
            );
            
            // 8. Create email notification for buyer
            const buyer_email_notification_id = uuidv4();
            await connection.query(
                `INSERT INTO notification_notifications 
                 (id, user_id, channel, type, payload, is_read, created_at) 
                 VALUES (?, ?, 'email', 'order_status_changed', ?, false, CURRENT_TIMESTAMP)`,
                [
                    buyer_email_notification_id, 
                    order.buyer_id,
                    JSON.stringify({
                        orderId: orderId,
                        status: status,
                        orderNumber: orderId.substring(0, 8),
                        buyerEmail: buyer[0]?.email,
                        amount: order.total_amount,
                        currency: order.currency,
                        itemsCount: (await connection.query(
                            'SELECT COUNT(*) as count FROM order_items WHERE order_id = ?',
                            [orderId]
                        ))[0][0].count,
                        statusMessage: this.getStatusMessage(status, 'buyer'),
                        supportContact: 'support@example.com'
                    })
                ]
            );

            // 9. Create notification for seller
            if (shop.length > 0) {
                const seller_user_id = shop[0].seller_user_id;
                const seller_notification_id = uuidv4();
                await connection.query(
                    `INSERT INTO notification_notifications 
                     (id, user_id, channel, type, payload, is_read, created_at) 
                     VALUES (?, ?, 'web', 'order_status_changed_seller', ?, false, CURRENT_TIMESTAMP)`,
                    [
                        seller_notification_id, 
                        seller_user_id,
                        JSON.stringify({
                            orderId: orderId,
                            oldStatus: oldStatus,
                            newStatus: status,
                            orderNumber: orderId.substring(0, 8),
                            changedBy: user_id,
                            changedAt: new Date().toISOString(),
                            amount: order.total_amount,
                            currency: order.currency,
                            businessName: shop[0].business_name,
                            escrowStatus: escrowStatus,
                            note: note || null
                        })
                    ]
                );
                
                // Email notification for seller
                const seller_email_notification_id = uuidv4();
                await connection.query(
                    `INSERT INTO notification_notifications 
                     (id, user_id, channel, type, payload, is_read, created_at) 
                     VALUES (?, ?, 'email', 'order_status_changed_seller', ?, false, CURRENT_TIMESTAMP)`,
                    [
                        seller_email_notification_id, 
                        seller_user_id,
                        JSON.stringify({
                            orderId: orderId,
                            status: status,
                            orderNumber: orderId.substring(0, 8),
                            sellerEmail: shop[0].seller_email,
                            amount: order.total_amount,
                            currency: order.currency,
                            escrowStatus: escrowStatus,
                            statusMessage: this.getStatusMessage(status, 'seller'),
                            nextAction: this.getNextAction(status, 'seller')
                        })
                    ]
                );
            }

            // 10. Log the status change for audit

            //SELECT `id`, `actor_id`, `actor_role`, `action`, `target_table`, `target_id`, `diff`, `created_at` FROM `admin_audit_logs` WHERE 1
            const audit_log_id = uuidv4();
            await connection.query(
                `INSERT INTO admin_audit_logs 
                 (id, actor_id, actor_role, action, target_table, target_id, diff) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [audit_log_id, user_id,"system", status, 'OrderService', orderId,JSON.stringify({oldStatus})]
            );

            await connection.commit();
            console.log(`Order ${orderId} status updated from ${oldStatus} to ${status}`);
            
            return {
                success: true,
                orderId,
                oldStatus,
                newStatus: status,
                escrowStatus,
                notificationsSent: {
                    buyer: true,
                    seller: shop.length > 0
                }
            };
            
        } catch (error) {
            await connection.rollback();
            console.error("Error updating order status:", error);
            throw error;
        } finally {
            connection.release();
        }
    }

    // Helper method for status messages
    getStatusMessage(status, role) {
        const messages = {
            buyer: {
                pending: 'Your order has been placed successfully and is awaiting confirmation.',
                processing: 'Your order is being processed by the seller.',
                confirmed: 'Your order has been confirmed by the seller.',
                shipped: 'Your order has been shipped and is on its way to you.',
                delivered: 'Your order has been delivered successfully.',
                cancelled: 'Your order has been cancelled.'
            },
            seller: {
                pending: 'New order received. Please confirm within 24 hours.',
                processing: 'Order confirmed. Please prepare items for shipping.',
                confirmed: 'Order ready for shipping.',
                shipped: 'Order shipped. Awaiting delivery confirmation.',
                delivered: 'Order delivered. Funds will be released.',
                cancelled: 'Order cancelled by buyer.'
            }
        };
        return messages[role]?.[status] || 'Order status updated.';
    }

    // Helper method for next actions
    getNextAction(status, role) {
        const actions = {
            buyer: {
                pending: 'Awaiting seller confirmation',
                processing: 'Your items are being prepared',
                confirmed: 'Awaiting shipping',
                shipped: 'Track your shipment',
                delivered: 'Leave a review',
                cancelled: 'View cancellation details'
            },
            seller: {
                pending: 'Confirm or cancel order',
                processing: 'Prepare items for shipping',
                confirmed: 'Mark as shipped',
                shipped: 'Update tracking details',
                delivered: 'Funds will be released within 24 hours',
                cancelled: 'Review cancellation reason'
            }
        };
        return actions[role]?.[status] || 'Check order details';
    }

    async cancelOrder(orderId, user_id, reason = null) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Get order details with escrow info
            const [orders] = await connection.query(
                `SELECT o.*, ea.id as escrow_id 
                 FROM order_orders o
                 LEFT JOIN escrow_accounts ea ON o.id = ea.order_id
                 WHERE o.id = ?`,
                [orderId]
            );

            console.log("getting an order to cancel", orders);
            if (!orders.length) {
                throw new Error('Order not found');
            }

            const order = orders[0];
            
            if (!['pending', 'confirmed', 'processing'].includes(order.status)) {
                throw new Error('Order cannot be cancelled in its current state');
            }

            // Get order items to restore stock
            const [items] = await connection.query(
                'SELECT * FROM order_items WHERE order_id = ?',
                [orderId]
            );

            console.log("order items", items);
            
            // Restore stock for each item
            for (const item of items) {
                await connection.query(
                    `UPDATE inventory_inventories 
                     SET reserved = reserved - ?, 
                         quantity = quantity + ?,
                         updated_at = CURRENT_TIMESTAMP 
                     WHERE product_id = ?`,
                    [item.quantity, item.quantity, item.product_id]
                );
                
                // Create inventory transaction log
                const transaction_id = uuidv4();
                await connection.query(
                    `INSERT INTO inventory_transactions 
                     (id, inventory_id, delta, reason, related_entity_type, related_entity_id) 
                     VALUES (?, 
                             (SELECT id FROM inventory_inventories WHERE product_id = ? LIMIT 1),
                             ?, 'order_cancellation', 'order', ?)`,
                    [transaction_id, item.product_id, item.quantity, orderId]
                );
            }

            // Update order status to cancelled
            await connection.query(
                'UPDATE order_orders SET status = "cancelled", updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [orderId]
            );

            // Update escrow status to refunded
            if (order.escrow_id) {
                await connection.query(
                    'UPDATE escrow_accounts SET status = "refunded", updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                    [order.escrow_id]
                );
                
                const escrow_history_id = uuidv4();
                await connection.query(
                    `INSERT INTO escrow_history 
                     (id, escrow_id, status, changed_by, note, changed_at) 
                     VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
                    [escrow_history_id, order.escrow_id, 'refunded', user_id, reason || 'Order cancelled by user']
                );
            }

            // Create notifications
            const notification_id = uuidv4();
            await connection.query(
                `INSERT INTO notification_notifications 
                 (id, user_id, channel, type, payload) 
                 VALUES (?, ?, 'web', 'order_cancelled', ?)`,
                [
                    notification_id, 
                    user_id, 
                    JSON.stringify({
                        orderId: orderId,
                        status: 'cancelled',
                        reason: reason,
                        refundAmount: order.total_amount,
                        currency: order.currency,
                        cancelledBy: user_id,
                        cancelledAt: new Date().toISOString()
                    })
                ]
            );

            // Notify seller
            const [shop] = await connection.query(
                'SELECT user_id FROM catalog_sellers WHERE id = ?',
                [order.seller_id]
            );

            if (shop.length > 0) {
                const seller_notification_id = uuidv4();
                await connection.query(
                    `INSERT INTO notification_notifications 
                     (id, user_id, channel, type, payload) 
                     VALUES (?, ?, 'web', 'order_cancelled_seller', ?)`,
                    [
                        seller_notification_id, 
                        shop[0].user_id,
                        JSON.stringify({
                            orderId: orderId,
                            status: 'cancelled',
                            reason: reason,
                            orderAmount: order.total_amount,
                            currency: order.currency,
                            cancelledBy: user_id
                        })
                    ]
                );
            }

            // Create status history
            const status_history_id = uuidv4();
            await connection.query(
                `INSERT INTO order_status_history 
                 (id, order_id, status, changed_by, note, changed_at) 
                 VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
                [status_history_id, orderId, 'cancelled', user_id, reason || 'Order cancelled']
            );

            await connection.commit();
            console.log("Order cancelled successfully:", orderId);
            
            return {
                success: true,
                orderId,
                status: 'cancelled',
                refundProcessed: !!order.escrow_id
            };
            
        } catch (error) {
            await connection.rollback();
            console.log("Error while cancelling an order", error);
            throw error;
        } finally {
            connection.release();
        }
    }

    async addOrderAddresses(data) {
        // ... existing addOrderAddresses code remains the same ...
        return id;
    }
    
    async getAllOrders(page, limit, status) {
        console.log("Fetching all orders with status:", status);
        const connection = await pool.getConnection();

        try {
            const offset = (page - 1) * limit;
            let query = `
                SELECT 
                    o.*, 
                    u.email as buyer_email,
                    up.full_name as buyer_name,
                    s.business_name as seller_name,
                    ea.status as escrow_status,
                    ea.escrow_amount,
                    ss.status as shipment_status,
                    (
                        SELECT COUNT(*)
                        FROM notification_notifications n
                        WHERE JSON_EXTRACT(n.payload, '$.orderId') = o.id
                    ) as notification_count,
                    JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'productId', oi.product_id,
                            'quantity', oi.quantity,
                            'unitPrice', oi.unit_price,
                            'productName', p.title
                        )
                    ) as items
                FROM order_orders o
                JOIN auth_users u ON o.buyer_id = u.id
                JOIN auth_user_profile up ON o.buyer_id = up.user_id
                JOIN catalog_sellers s ON o.seller_id = s.id
                LEFT JOIN escrow_accounts ea ON o.id = ea.order_id
                LEFT JOIN shipping_shipments ss ON o.id = ss.order_id
                JOIN order_items oi ON o.id = oi.order_id
                JOIN catalog_products p ON oi.product_id = p.id
            `;
            
            const params = [];
            if (status) {
                query += ' WHERE o.status = ?';
                params.push(status);
            }

            query += ' GROUP BY o.id ORDER BY o.placed_at DESC LIMIT ? OFFSET ?';
            params.push(limit, offset);

            const [orders] = await connection.query(query, params);

            const [totalCount] = await connection.query(
                'SELECT COUNT(DISTINCT id) as count FROM order_orders' + 
                (status ? ' WHERE status = ?' : ''),
                status ? [status] : []
            );

            return {
                orders,
                total: totalCount[0].count,
                page,
                totalPages: Math.ceil(totalCount[0].count / limit)
            };
        } finally {
            connection.release();
        }
    }

    async getOrderAddresses(id) {
        const db = await pool.getConnection();
        try {
            console.log("selecting the order address");
            const [orderAddressResult] = await db.query(
                `SELECT * FROM order_addresses WHERE id = ?`,
                [id]
            );
            console.log("here is the results ", orderAddressResult);

            return orderAddressResult[0];    
        } catch (error) {
            console.log(error);
            throw error;
        } finally {
            db.release();
        }
    }

    // New method to get order notifications
    async getOrderNotifications(orderId, userId) {
        const connection = await pool.getConnection();
        try {
            const [notifications] = await connection.query(
                `SELECT n.* 
                 FROM notification_notifications n
                 JOIN order_orders o ON JSON_EXTRACT(n.payload, '$.orderId') = o.id
                 WHERE o.id = ? AND n.user_id = ?
                 ORDER BY n.created_at DESC`,
                [orderId, userId]
            );
            
            return notifications;
        } finally {
            connection.release();
        }
    }

    // New method to get escrow details
    async getEscrowDetails(orderId) {
        const connection = await pool.getConnection();
        try {
            const [escrowDetails] = await connection.query(
                `SELECT 
                    ea.*,
                    eh.status as previous_status,
                    eh.note as status_note,
                    eh.changed_at as status_changed_at,
                    eh.changed_by as status_changed_by
                 FROM escrow_accounts ea
                 LEFT JOIN escrow_history eh ON ea.id = eh.escrow_id
                 WHERE ea.order_id = ?
                 ORDER BY eh.changed_at DESC
                 LIMIT 5`,
                [orderId]
            );
            
            return escrowDetails;
        } finally {
            connection.release();
        }
    }

    // New method to get order status history
    async getOrderStatusHistory(orderId) {
        const connection = await pool.getConnection();
        try {
            const [history] = await connection.query(
                `SELECT 
                    osh.*,
                    up.full_name as changed_by_name
                 FROM order_status_history osh
                 LEFT JOIN auth_user_profile up ON osh.changed_by = up.user_id
                 WHERE osh.order_id = ?
                 ORDER BY osh.changed_at DESC`,
                [orderId]
            );
            
            return history;
        } finally {
            connection.release();
        }
    }

    // New method to mark notifications as read
    async markNotificationsAsRead(orderId, userId) {
        const connection = await pool.getConnection();
        try {
            await connection.query(
                `UPDATE notification_notifications 
                 SET is_read = true, read_at = CURRENT_TIMESTAMP 
                 WHERE user_id = ? 
                 AND JSON_EXTRACT(payload, '$.orderId') = ?`,
                [userId, orderId]
            );
            
            return { success: true };
        } finally {
            connection.release();
        }
    }

}

export default new OrderService();