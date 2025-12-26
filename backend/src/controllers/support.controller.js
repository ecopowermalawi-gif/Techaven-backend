import supportService from '../services/support.service.js';

class SupportController {
    async createTicket(req, res) {
        try {
            const userId = req.user.id;
            const { subject, description, orderId } = req.body;
            const ticket = await supportService.createTicket(userId, subject, description, orderId);
            res.status(201).json({
                success: true,
                data: ticket
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to create support ticket'
            });
        }
    }

    async getTickets(req, res) {
        try {
            const { page = 1, limit = 10, status } = req.query;
            const tickets = await supportService.getTickets(
                parseInt(page),
                parseInt(limit),
                status
            );
            res.json({
                success: true,
                data: tickets
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch support tickets'
            });
        }
    }

    async getUserTickets(req, res) {
        try {
            const userId = req.user.id;
            const { page = 1, limit = 10, status } = req.query;
            const tickets = await supportService.getUserTickets(
                userId,
                parseInt(page),
                parseInt(limit),
                status
            );
            res.json({
                success: true,
                data: tickets
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch your tickets'
            });
        }
    }

    async getTicket(req, res) {
        try {
            const { ticketId } = req.params;
            const userId = req.user.id;
            const ticket = await supportService.getTicketById(ticketId, userId);
            if (!ticket) {
                return res.status(404).json({
                    success: false,
                    message: 'Ticket not found'
                });
            }
            res.json({
                success: true,
                data: ticket
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch ticket'
            });
        }
    }

    //SELECT `id`, `key_name`, `value`, 
    // `updated_at` FROM `admin_system_settings` WHERE 1
async getAppInfo(req, res){
    try {
        const infores =  await supportService.getAppInfo();
        console.log("here is the data", infores)
        res.json({
            success: true,
            data: infores
        });


    } catch (error) {
        
   console.log(error); 
   res.json({
    success : false,
    message: error.message
   })    
    }

}
    async updateTicketStatus(req, res) {
        try {
            const { ticketId } = req.params;
            const { status } = req.body;
            await supportService.updateTicketStatus(ticketId, status);
            res.json({
                success: true,
                message: 'Ticket status updated successfully'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to update ticket status'
            });
        }
    }

    async addSystemInfo(req, res){
        try {
            const { key_name, value } = req.body;
            const data = req.body;
            const info = await supportService.addSystemInfo(data);
            res.status(201).json({
                success: true,
                data: info
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to add system info'
            });
        }
    }

    updateSystemInfo(req, res){
        try {
            const { key_name, value } = req.body;
            const data = req.body;
            const info = supportService.updateSystemInfo(data);
            res.json({
                success: true,
                data: info
            });
        }
        catch (error) {
            res.status(400).json({
                success: false, 
                message: error.message || 'Failed to update system info'
            });
        }
    }

    async addTicketReply(req, res) {
        try {
            const { ticketId } = req.params;
            const userId = req.user.id;
            const { message } = req.body;
            const reply = await supportService.addTicketReply(ticketId, userId, message);
            res.status(201).json({
                success: true,
                data: reply
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to add reply'
            });
        }
    }

    async getTicketReplies(req, res) {
        try {
            const { ticketId } = req.params;
            const userId = req.user.id;
            const replies = await supportService.getTicketReplies(ticketId, userId);
            res.json({
                success: true,
                data: replies
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch ticket replies'
            });
        }
    }

    async assignTicket(req, res) {
        try {
            const { ticketId } = req.params;
            const { agentId } = req.body;
            await supportService.assignTicket(ticketId, agentId);
            res.json({
                success: true,
                message: 'Ticket assigned successfully'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to assign ticket'
            });
        }
    }

    async getTicketStats(req, res) {
        try {
            const stats = await supportService.getTicketStats();
            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch ticket statistics'
            });
        }
    }
}

export default new SupportController();