import escrowService from '../services/escrow.service.js';


import { validateShopData } from '../validators/shop.validator.js';
import { AppError } from '../utils/error.js';



const escrowController = {
    // Get all inventories
async getAllescrow(req, res, next ){
        try {
            console.log("Inside getAllescrow controller");
            const { page = 1, limit = 10, search, sort } = req.query;
            const escrow = await escrowService.getAllEscrow({ page, limit, search, sort });
            res.json(escrow);
        } catch (error) {
            next(error);
        }
    },

    // Get single escrow details
async getEscrowById(req, res, next) {
        try {
            console.log("inside get escrow controler by id")
            const {id } = req.body;
            console.log("Fetching escrow details for id ", id);
            console.log("Fetching escrow details for id from body ", req.body);
           const escrow = await escrowService.getEscrowById(id);
            console.log("escrow details ", escrow);

            
            res.json(escrow);
        } catch (error) {
            next(error);
        }
    },
async getOrderEscrow(req, res, next) {
    console.log("inside get order escrow controller");
        try {
            const order_id  =  req.body.order_id;
            console.log("Fetching order escrow details for order id ", order_id);
            console.log("Fetching order escrow details for id from body ", req.body);
           const escrow = await escrowService.getOrderEscrow(order_id);
            console.log("escrow details ", escrow);
            res.json(escrow);
        } catch (error) {
            next(error);
        }
        },
    
    // Create new escrow
    async addescrow(req, res, next) {
        try {
            console.log("here ", req.body);
             const escrow = await escrowService.addEscow(req.body);
            console.log("here is the shop created", escrow);
            res.status(201).json(escrow);
        } catch (error) {
            next(error);
        }
    },

    // Update shop details
    async updateEscrow(req, res, next) {
        try {
            const {id, status} = req.body;


            const escrow = await escrowService.updateEscrowStatus(id, status);
            res.json(escrow);
        } catch (error) {
            next(error);
        }
    },

    // Delete shop
    async deleteescrow(req, res, next) {
        try {
            const { escrow_id } = req.body.escrow_id;
        const results =  await escrowService.getAllEscrow;
            
        
        res.status(204).end();
        } catch (error) {
            next(error);
        }
    },

   
};

export default escrowController;