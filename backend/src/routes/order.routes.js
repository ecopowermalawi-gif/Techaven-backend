import express from 'express';
import orderController from '../controllers/order.controller.js';
import { auth, checkRole } from '../middleware/auth.js';
import {  userValidationRules, paginationRules } from '../middleware/validation.js';

const router = express.Router();

// Customer routes
router.post(
    '/add',
   // auth,
    //validate(orderValidationRules.create),
    orderController.createOrder
);
router.get('all-orders', orderController.getAllOrdersPublic); // Public route to get all orders


router.get(
    '/my-orders',
    auth,
    paginationRules,
    orderController.getUserOrders
);

router.get(
    '/my-orders/:orderId',
    auth,
    orderController.getUserOrders
);

router.post(
    '/cancel/:orderId',
    auth,
    orderController.cancelOrder
);

router.post(
    '/create',
    //auth,
    orderController.createOrder
);

router.post('/order-addresses/', orderController.addOrderAddress)


router.post('/confirmById/:order_id',
    //auth
    orderController.confirmOrderByID,
);


router.put('/confirm/',
    //auth
    
  //    checkRole(['seller']),
    orderController.confirmedOrderStatus,
);

// derivering status
router.put('/delivered/',
    //auth
      //checkRole(['buyer']),
    orderController.deliveredOrderStatus,
)

// derivering status
router.put('/pending/',
    //auth
    orderController.pendingOrderStatus,
)


// derivering status
router.put('/shipped/',
    //auth
    orderController.shippedOrderStatus,
)

// derivering status
router.put('/shipped/:order_id',
    //auth
    orderController.shippedOrderStatus,
)



// Admin routes
router.get(
    '/all/',
    //auth,
    //checkRole(['admin']),
    paginationRules,
    orderController.getAllOrders
);

router.put(
    '/status',
    //auth,
    //checkRole(['admin']),
    //validate(orderValidationRules.updateStatus),
    orderController.updateOrderStatus
);

export default router;