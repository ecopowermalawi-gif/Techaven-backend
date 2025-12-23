import { get } from 'http';
import  pool  from  '../config/database.js';
import { AppError } from '../utils/error.js';
import { v4 as uuidv4 } from 'uuid';
class EscrowService {
    
       //INSERT INTO `escrow_Orders`
       // (`id`, `order_id`, `escrow_amount`, `currency`, `status`, `created_at`, `updated_at`) VALUES 
          
    // Get all escows with filters and pagination
    async getAllEscrow({ page = 1, limit = 10, search = '', order_id = '', sort = 'updated_at' }) {
        const offset = (page - 1) * limit;
        const db =  await pool.getConnection();
        let query = 'SELECT * FROM escrow_Orders';
        const params = [];

        if (search) {
            query += ' AND (order_id or LIKE ?)';
            params.push(`%${search}%`);
        }


        // Add sorting
        query += ` ORDER BY ${sort} DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        const [escrow_Orders] = await db.query(query, params);
        const total = await db.query('SELECT COUNT(id) FROM escrow_Orders');

        return {
            escrow_Orders,
            pagination: {
                page: page,
                limit: limit,
                total
            }
        };
    }

        // Get single escrow by ID
   async getEscrowById(id) {
          const db = await pool.getConnection();
          console.log("inside get Escrow service")

        const escrow = await db.query('SELECT * FROM escrow_Orders WHERE id = ?', [id]);
       
        return escrow[0];
    }
    // Get single order by ID
    async getOrderEscrow(Order_id) {
          const db = await pool.getConnection();
          console.log("inside get Escrow service");

        const Order_Escrow = await db.query('SELECT * FROM escrow_Orders WHERE Order_id = ?', [Order_id]);
       console.log("escrow service results", Order_Escrow);
        return Order_Escrow[0];
 
 
    }

    // Get Escrow

     //INSERT INTO `escrow_Orders`
       // (`id`, `order_id`, `escrow_amount`, `currency`, `status`, `created_at`, `updated_at`) VALUES 
          
    async addEscow(data) {
console.log("escrow process started ..");
const db = await pool.getConnection();
db.beginTransaction();
console.log("DATA RECEIVED  for escrow service ...", data);

console.log("inside add escrow service method");
             const {order_id, escrow_amount, currency, status} = data;
        
        const id = uuidv4();
console.log("escrow id ...", id);
   
        try {
            
let query = 'INSERT INTO escrow_Orders (id, order_id, escrow_amount, currency, status) VALUES (?,?, ?, ?, ?';
        const params = [id, order_id, escrow_amount, currency, status];
        console.log("query params ", params);
        const [result] = await db.query(query, params);
       
            console.log("here comes the data ", result);
        } catch (error) {
  console.error("Error adding Escrow Order :", error);
 db.rollback();
 return false;         
        }
        finally{
            db.release();
        }

        return true;
    }

    
     //INSERT INTO `escrow_Orders`
       // (`id`, `order_id`, `escrow_amount`, `currency`, `status`, `created_at`, `updated_at`) VALUES 
          
    async updateEscrowStatus(id,status) {
        const db = await pool.getConnection();
        console.log("update ecrow id and status", id,status);
        db.beginTransaction();
        try {
            
        const results = await db.query(
            'UPDATE escrow_Orders SET status = ? WHERE id = ?',
            [status, id]
        );
        console.log("update results ", results);
    db.commit();
        } catch (error) {
            console.log(error);
            db.rollback();
            return false;
        } finally{
            db.release();
        }

        return true;
    }
 
}

export default EscrowService;