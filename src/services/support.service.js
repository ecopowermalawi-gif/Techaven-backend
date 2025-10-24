import mysql from 'mysql2/promise';
import config from '../config/config.js';

const pool = mysql.createPool(config.database);

class SupportService {
    async createTicket(userId, subject, description, orderId = null) {
        const connection = await pool.getConnection();
        try {
            // Create ticket
            const [result] = await connection.query(
                `INSERT INTO support_tickets (
                    user_id,
                    subject,
                    description,
                    order_id,
                    status,
                    created_at
                ) VALUES (?, ?, ?, ?, 'open', NOW())`,
                [userId, subject, description, orderId]
            );

            // Get ticket details
            const [tickets] = await connection.query(
                `SELECT t.*, u.username as user_name,
                    o.id as order_id,
                    o.total_amount as order_amount,
                    o.status as order_status
                FROM support_tickets t
                JOIN users u ON t.user_id = u.id
                LEFT JOIN orders o ON t.order_id = o.id
                WHERE t.id = ?`,
                [result.insertId]
            );

            return tickets[0];
        } finally {
            connection.release();
        }
    }

    async getTickets(page, limit, status = null) {
        const connection = await pool.getConnection();
        try {
            const offset = (page - 1) * limit;

            let query = `
                SELECT t.*, 
                    u.username as user_name,
                    o.id as order_id,
                    o.total_amount as order_amount,
                    o.status as order_status,
                    COALESCE(
                        JSON_OBJECT(
                            'id', a.id,
                            'username', a.username,
                            'email', a.email
                        ),
                        NULL
                    ) as assigned_agent
                FROM support_tickets t
                JOIN users u ON t.user_id = u.id
                LEFT JOIN orders o ON t.order_id = o.id
                LEFT JOIN users a ON t.assigned_to = a.id
            `;

            const params = [];
            if (status) {
                query += ' WHERE t.status = ?';
                params.push(status);
            }

            query += ' ORDER BY t.created_at DESC LIMIT ? OFFSET ?';
            params.push(limit, offset);

            const [tickets] = await connection.query(query, params);

            const [totalCount] = await connection.query(
                'SELECT COUNT(*) as count FROM support_tickets' +
                (status ? ' WHERE status = ?' : ''),
                status ? [status] : []
            );

            return {
                tickets,
                total: totalCount[0].count,
                page,
                totalPages: Math.ceil(totalCount[0].count / limit)
            };
        } finally {
            connection.release();
        }
    }

    async getUserTickets(userId, page, limit, status = null) {
        const connection = await pool.getConnection();
        try {
            const offset = (page - 1) * limit;

            let query = `
                SELECT t.*, 
                    o.id as order_id,
                    o.total_amount as order_amount,
                    o.status as order_status,
                    COALESCE(
                        JSON_OBJECT(
                            'id', a.id,
                            'username', a.username
                        ),
                        NULL
                    ) as assigned_agent
                FROM support_tickets t
                LEFT JOIN orders o ON t.order_id = o.id
                LEFT JOIN users a ON t.assigned_to = a.id
                WHERE t.user_id = ?
            `;

            const params = [userId];
            if (status) {
                query += ' AND t.status = ?';
                params.push(status);
            }

            query += ' ORDER BY t.created_at DESC LIMIT ? OFFSET ?';
            params.push(limit, offset);

            const [tickets] = await connection.query(query, params);

            const [totalCount] = await connection.query(
                'SELECT COUNT(*) as count FROM support_tickets WHERE user_id = ?' +
                (status ? ' AND status = ?' : ''),
                status ? [userId, status] : [userId]
            );

            return {
                tickets,
                total: totalCount[0].count,
                page,
                totalPages: Math.ceil(totalCount[0].count / limit)
            };
        } finally {
            connection.release();
        }
    }

    async getTicketById(ticketId, userId = null) {
        const connection = await pool.getConnection();
        try {
            let query = `
                SELECT t.*, 
                    u.username as user_name,
                    o.id as order_id,
                    o.total_amount as order_amount,
                    o.status as order_status,
                    COALESCE(
                        JSON_OBJECT(
                            'id', a.id,
                            'username', a.username,
                            'email', a.email
                        ),
                        NULL
                    ) as assigned_agent
                FROM support_tickets t
                JOIN users u ON t.user_id = u.id
                LEFT JOIN orders o ON t.order_id = o.id
                LEFT JOIN users a ON t.assigned_to = a.id
                WHERE t.id = ?
            `;

            const params = [ticketId];
            if (userId) {
                query += ' AND t.user_id = ?';
                params.push(userId);
            }

            const [tickets] = await connection.query(query, params);

            return tickets.length ? tickets[0] : null;
        } finally {
            connection.release();
        }
    }

    async updateTicketStatus(ticketId, status) {
        const connection = await pool.getConnection();
        try {
            const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
            if (!validStatuses.includes(status)) {
                throw new Error('Invalid ticket status');
            }

            const [result] = await connection.query(
                'UPDATE support_tickets SET status = ? WHERE id = ?',
                [status, ticketId]
            );

            if (result.affectedRows === 0) {
                throw new Error('Ticket not found');
            }
        } finally {
            connection.release();
        }
    }

    async addTicketReply(ticketId, userId, message) {
        const connection = await pool.getConnection();
        try {
            // Check if ticket exists and user has access
            const [tickets] = await connection.query(
                `SELECT t.*, u.id as agent_id
                 FROM support_tickets t
                 LEFT JOIN users u ON t.assigned_to = u.id
                 WHERE t.id = ? AND (t.user_id = ? OR t.assigned_to = ?)`,
                [ticketId, userId, userId]
            );

            if (!tickets.length) {
                throw new Error('Ticket not found or access denied');
            }

            // Add reply
            const [result] = await connection.query(
                `INSERT INTO ticket_replies (
                    ticket_id,
                    user_id,
                    message,
                    created_at
                ) VALUES (?, ?, ?, NOW())`,
                [ticketId, userId, message]
            );

            // Get reply with user details
            const [replies] = await connection.query(
                `SELECT r.*, u.username, u.email
                 FROM ticket_replies r
                 JOIN users u ON r.user_id = u.id
                 WHERE r.id = ?`,
                [result.insertId]
            );

            return replies[0];
        } finally {
            connection.release();
        }
    }

    async getTicketReplies(ticketId, userId) {
        const connection = await pool.getConnection();
        try {
            // Check if user has access to ticket
            const [tickets] = await connection.query(
                'SELECT id FROM support_tickets WHERE id = ? AND (user_id = ? OR assigned_to = ?)',
                [ticketId, userId, userId]
            );

            if (!tickets.length) {
                throw new Error('Ticket not found or access denied');
            }

            // Get replies
            const [replies] = await connection.query(
                `SELECT r.*, u.username, 
                    CASE 
                        WHEN t.user_id = u.id THEN 'customer'
                        WHEN t.assigned_to = u.id THEN 'agent'
                        ELSE 'system'
                    END as role
                 FROM ticket_replies r
                 JOIN users u ON r.user_id = u.id
                 JOIN support_tickets t ON r.ticket_id = t.id
                 WHERE r.ticket_id = ?
                 ORDER BY r.created_at ASC`,
                [ticketId]
            );

            return replies;
        } finally {
            connection.release();
        }
    }

    async assignTicket(ticketId, agentId) {
        const connection = await pool.getConnection();
        try {
            // Check if agent exists and has support role
            const [agents] = await connection.query(
                `SELECT u.id 
                 FROM users u
                 JOIN user_roles ur ON u.id = ur.user_id
                 JOIN roles r ON ur.role_id = r.id
                 WHERE u.id = ? AND r.name = 'support'`,
                [agentId]
            );

            if (!agents.length) {
                throw new Error('Invalid agent ID');
            }

            // Assign ticket
            const [result] = await connection.query(
                'UPDATE support_tickets SET assigned_to = ?, status = "in_progress" WHERE id = ?',
                [agentId, ticketId]
            );

            if (result.affectedRows === 0) {
                throw new Error('Ticket not found');
            }
        } finally {
            connection.release();
        }
    }

    async getTicketStats() {
        const connection = await pool.getConnection();
        try {
            // Get counts by status
            const [statusStats] = await connection.query(
                `SELECT status, COUNT(*) as count
                 FROM support_tickets
                 GROUP BY status`
            );

            // Get average resolution time
            const [avgResolutionTime] = await connection.query(
                `SELECT AVG(TIMESTAMPDIFF(HOUR, created_at, updated_at)) as avg_hours
                 FROM support_tickets
                 WHERE status IN ('resolved', 'closed')`
            );

            // Get ticket count by category for last 30 days
            const [recentTickets] = await connection.query(
                `SELECT DATE(created_at) as date, COUNT(*) as count
                 FROM support_tickets
                 WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                 GROUP BY DATE(created_at)
                 ORDER BY date`
            );

            return {
                statusBreakdown: statusStats,
                averageResolutionTime: avgResolutionTime[0].avg_hours || 0,
                recentTickets,
                totalTickets: statusStats.reduce((sum, stat) => sum + stat.count, 0)
            };
        } finally {
            connection.release();
        }
    }
}

export default new SupportService();