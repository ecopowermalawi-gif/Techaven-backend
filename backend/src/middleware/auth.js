import jwt from 'jsonwebtoken';
import UserModel from '../models/user.model.js';

const auth = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No authentication token provided'
            });
        }

        const token = authHeader.split(' ')[1];
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here');
        
        // Check if user still exists and is active
        const user = await UserModel.findUserById(decoded.id);
        if (!user || !user.is_active) {
            return res.status(401).json({
                success: false,
                message: 'User no longer exists or is deactivated'
            });
        }

        // Attach user to request
        req.user = {
            id: user.id,
            email: user.email,
            username: user.username,
            roles: user.roles || []
        };

        // Check session if session ID is provided
        const sessionId = req.headers['x-session-id'];
        if (sessionId) {
            const session = await UserModel.findSessionById(sessionId);
            if (!session || session.user_id !== user.id) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid session'
                });
            }
        }

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired'
            });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }

        console.error('Auth middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Authentication failed'
        });
    }
};

const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const userRoles = req.user.roles || [];
        const hasRole = roles.some(role => userRoles.includes(role));

        if (!hasRole) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
        }

        next();
    };
};

export { auth, checkRole };