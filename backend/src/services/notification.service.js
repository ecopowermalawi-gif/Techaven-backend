import { get } from 'http';
import  pool  from  '../config/database.js';
import { AppError } from '../utils/error.js';
import { v4 as uuidv4 } from 'uuid';
class NotificationService {
    
// SELECT `id`, `user_id`, `channel`, `type`, `payload`, `is_read`, `created_at` 
// FROM `notification_notifications` WHERE 1          
   
// Get all escows with filters and pagination
    async getAllNotification({ page = 1, limit = 10, search = '', user_id = '', sort = 'created_id' }) {
        const offset = (page - 1) * limit;
        const db =  await pool.getConnection();
        let query = 'SELECT * FROM notification_notifications';
        const params = [];

        if (search) {
            query += ' AND (user_id or LIKE ?)';
            params.push(`%${search}%`);
        }


        // Add sorting
        query += ` ORDER BY ${sort} DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        const [notification_notifications] = await db.query(query, params);
        const total = await db.query('SELECT COUNT(id) FROM notification_notifications');

        return {
            notification_notifications,
            pagination: {
                page: page,
                limit: limit,
                total
            }
        };
    }

       // Get single Notification by ID

// SELECT `id`, `user_id`, `channel`, `type`, `payload`, `is_read`, `created_at` 
// FROM `notification_notifications` WHERE 1          
   

       async getNotificationById(id) {
          const db = await pool.getConnection();
          console.log("inside get Notification service")

        const Notification = await db.query('SELECT * FROM notification_notifications WHERE id = ?', [id]);
       
        return Notification[0];
    }
    // Get single order by ID
    async getUserNotification(user_id) {
          const db = await pool.getConnection();
          console.log("inside get Notification service");

        const Order_Notification = await db.query('SELECT * FROM notification_notifications WHERE user_id = ?', [user_id]);
       console.log("Notification service results", Order_Notification);
        return Order_Notification[0];
 
 
    }



    // Get Notification

     //INSERT INTO `notification_notifications
     // `SELECT `id`, `user_id`, `channel`, `type`, `payload`, `is_read`, `created_at
   
     async addNotification(data) {
console.log("Notification process started ..");
const db = await pool.getConnection();
db.beginTransaction();

console.log("DATA RECEIVED  for Notification service ...", data);

console.log("inside add Notification service method");
             const {user_id, channel, type, payload} = data;
        
        const id = uuidv4();
console.log("Notification id ...", id);
   
        try {
            
let query = 'INSERT INTO notification_notifications (id,user_id, channel, type, payload) VALUES (?,?, ?, ?, ?';
        const params = [id,user_id, channel, type, payload];
        console.log("query params ", params);
        const [result] = await db.query(query, params);
       
            console.log("here comes the data ", result);
        } catch (error) {
  console.error("Error adding Notification Order :", error);
 db.rollback();
 return false;         
        }
        finally{
            db.release();
        }

        return true;
    }

     //INSERT INTO `notification_notifications
     // `SELECT `id`, `user_id`, `channel`, `type`, `payload`, `is_read`, `created_at
          
    async updateNotificationStatus(id) {
        const db = await pool.getConnection();
        console.log("update notification id and status", id);
        db.beginTransaction();
        try {
            
        const results = await db.query(
            'UPDATE notification_notifications SET is_read = ? WHERE id = ?',
            [1, id]
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
 
    
     //INSERT INTO `notification_notifications
     // `SELECT `id`, `user_id`, `channel`, `type`, `payload`, `is_read`, `created_at
     async deleteNotification(id){
           const db = await pool.getConnection();
        console.log("update notification id and status", id);
        db.beginTransaction();
     try {
        const deleteResults = await db.query(`DELETE FROM notification_notifications WHERE id = ?`, [id]);
        console.log("deleting notification,",deleteResults)
        return true;
     } catch (error) {
        console.log("error deleting notification", error);
        db.rollback();
        return false;
     }
     }  

}

export default NotificationService;