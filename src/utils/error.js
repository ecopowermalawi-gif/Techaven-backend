// Custom error class for application errors
export class AppError extends Error {
    constructor(message, statusCode = 500, errors = []) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

// Error handler middleware
export const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            errors: err.errors,
            stack: err.stack
        });
    } else {
        // Production error response
        if (err.isOperational) {
            res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
                errors: err.errors
            });
        } else {
            // Programming or unknown errors: don't leak error details
            console.error('ERROR 💥', err);
            res.status(500).json({
                status: 'error',
                message: 'Something went wrong!'
            });
        }
    }
};

// Handle unhandled promise rejections
export const handleUnhandledRejection = (server) => {
    process.on('unhandledRejection', (err) => {
        console.error('UNHANDLED REJECTION! 💥 Shutting down...');
        console.error(err.name, err.message);
        server.close(() => {
            process.exit(1);
        });
    });
};

// Handle uncaught exceptions
export const handleUncaughtException = () => {
    process.on('uncaughtException', (err) => {
        console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
        console.error(err.name, err.message);
        process.exit(1);
    });
};

// Middleware to handle 404 - Not Found errors
export const handle404 = (req, res, next) => {
    const err = new AppError(`Can't find ${req.originalUrl} on this server!`, 404);
    next(err);
};

// Middleware to handle validation errors
export const handleValidationError = (error) => {
    const errors = Object.values(error.errors).map((el) => ({
        field: el.path,
        message: el.message
    }));

    const message = `Invalid input data. ${errors.map(err => err.message).join('. ')}`;
    return new AppError(message, 400, errors);
};

// Middleware to handle database errors
export const handleDBError = (error) => {
    if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        const message = `Duplicate ${field}. Please use another value!`;
        return new AppError(message, 400);
    }
    return new AppError('Database operation failed', 500);
};

// Middleware to handle JWT errors
export const handleJWTError = () => 
    new AppError('Invalid token. Please log in again!', 401);

export const handleJWTExpiredError = () => 
    new AppError('Your token has expired! Please log in again.', 401);