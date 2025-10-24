import jwt from 'jsonwebtoken';
import pool from '../config/database.js';
import { AppError } from '../utils/error.js';

// Protect routes - Authentication middleware
export const auth = async (req, res, next) => {
    try {
        // 1) Check if token exists
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            throw new AppError('You are not logged in! Please log in to get access.', 401);
        }

        // 2) Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');

        // 3) Check if user still exists
        const [user] = await pool.query('SELECT * FROM users WHERE id = ?', [decoded.id]);

        if (!user[0]) {
            throw new AppError('The user belonging to this token no longer exists.', 401);
        }

        // 4) Check if user changed password after the token was issued
        if (user[0].password_changed_at && decoded.iat < user[0].password_changed_at.getTime() / 1000) {
            throw new AppError('User recently changed password! Please log in again.', 401);
        }

        // Grant access to protected route
        req.user = user[0];
        next();
    } catch (err) {
        if (err.name === 'JsonWebTokenError') {
            next(new AppError('Invalid token. Please log in again!', 401));
        } else if (err.name === 'TokenExpiredError') {
            next(new AppError('Your token has expired! Please log in again.', 401));
        } else {
            next(err);
        }
    }
};

// Restrict to certain roles
export const checkRole = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action', 403));
        }
        next();
    };
};

// Rate limiting middleware
export const rateLimiter = (maxRequests, timeWindow) => {
    const requests = new Map();

    return (req, res, next) => {
        const ip = req.ip;
        const now = Date.now();

        if (requests.has(ip)) {
            const { count, firstRequest } = requests.get(ip);

            if (now - firstRequest > timeWindow * 1000) {
                requests.set(ip, { count: 1, firstRequest: now });
                next();
            } else if (count < maxRequests) {
                requests.set(ip, { count: count + 1, firstRequest });
                next();
            } else {
                throw new AppError('Too many requests from this IP, please try again later.', 429);
            }
        } else {
            requests.set(ip, { count: 1, firstRequest: now });
            next();
        }
    };
};

// Check if user owns the resource
export const checkOwnership = async (req, res, next) => {
    try {
        const resourceId = req.params.id;
        const userId = req.user.id;
        const resourceType = req.baseUrl.split('/')[1]; // e.g., 'products', 'reviews'

        const [resource] = await pool.query(
            `SELECT * FROM ${resourceType} WHERE id = ? AND user_id = ?`,
            [resourceId, userId]
        );

        if (!resource[0]) {
            throw new AppError('You do not have permission to perform this action', 403);
        }

        next();
    } catch (err) {
        next(err);
    }
};