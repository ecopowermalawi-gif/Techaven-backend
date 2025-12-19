import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import config from '../config/config.js';

// Create rate limiter instance
const limiter = rateLimit({
    windowMs: config.api.rateLimits.windowMs,
    max: config.api.rateLimits.max,
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    keyGenerator: ipKeyGenerator
});
// Login rate limiter - more strict for login attempts

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login requests per windowMs
    message: {
        success: false,
        message: 'Too many login attempts, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false
});


const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit each IP to 3 reset requests per hour
    message: {
        success: false,
        message: 'Too many password reset requests, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false
});

const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 registrations per hour
    message: {
        success: false,
        message: 'Too many registration attempts, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false
});


// API key rate limiter - for authenticated requests
const apiKeyLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30, // limit each API key to 30 requests per minute
    message: {
        success: false,
        message: 'API rate limit exceeded. Please upgrade your plan for higher limits.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Custom key generator to use API key instead of IP
    keyGenerator: (req) => {
        const apiKey = req.headers['x-api-key'];
        return typeof apiKey === 'string' ? apiKey : ipKeyGenerator(req.ip || 'unknown');
    }
});

// Create rate limiter for file uploads
const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // limit each IP to 10 uploads per hour
    message: {
        success: false,
        message: 'Too many file uploads from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => ipKeyGenerator(req.ip || 'unknown')
});



/**
 * Creates a rate limiter with custom settings
 * @param {number} windowMs - The time window in milliseconds
 * @param {number} max - Maximum number of requests allowed in the window
 * @param {string} [message] - Optional custom error message
 * @returns {import('express').RequestHandler} Rate limiter middleware
 */
const createEndpointLimiter = (windowMs, max, message) => {
    return rateLimit({
        windowMs,
        max,
        message: {
            success: false,
            message: message || 'Too many requests, please try again later.'
        },
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: (req) => ipKeyGenerator(req.ip || 'unknown')
    });
};

export {
    limiter,
    loginLimiter,
    passwordResetLimiter, 
    registerLimiter ,
    apiKeyLimiter,
    uploadLimiter,
   
    createEndpointLimiter
};