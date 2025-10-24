import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AppError } from './error.js';
import config from '../config/config.js';

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), config.upload.directory);
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter function
const fileFilter = (req, file, cb) => {
    // Check file type
    if (!config.upload.allowedTypes.includes(file.mimetype)) {
        cb(new AppError('File type not allowed', 400), false);
        return;
    }

    cb(null, true);
};

// Create multer instance with configuration
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: config.upload.maxSize // Maximum file size in bytes
    }
});

// Middleware for handling single file upload
export const uploadSingleFile = (fieldName) => {
    return (req, res, next) => {
        upload.single(fieldName)(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return next(new AppError(`File size should be less than ${config.upload.maxSize / (1024 * 1024)}MB`, 400));
                }
                return next(new AppError(err.message, 400));
            } else if (err) {
                return next(err);
            }
            next();
        });
    };
};

// Middleware for handling multiple files upload
export const uploadMultipleFiles = (fieldName, maxCount) => {
    return (req, res, next) => {
        upload.array(fieldName, maxCount)(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return next(new AppError(`File size should be less than ${config.upload.maxSize / (1024 * 1024)}MB`, 400));
                } else if (err.code === 'LIMIT_FILE_COUNT') {
                    return next(new AppError(`Cannot upload more than ${maxCount} files`, 400));
                }
                return next(new AppError(err.message, 400));
            } else if (err) {
                return next(err);
            }
            next();
        });
    };
};

// Middleware for handling fields with multiple files
export const uploadFields = (fields) => {
    return (req, res, next) => {
        upload.fields(fields)(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return next(new AppError(`File size should be less than ${config.upload.maxSize / (1024 * 1024)}MB`, 400));
                } else if (err.code === 'LIMIT_FILE_COUNT') {
                    return next(new AppError('Too many files uploaded', 400));
                }
                return next(new AppError(err.message, 400));
            } else if (err) {
                return next(err);
            }
            next();
        });
    };
};

// Function to delete file
export const deleteFile = async (filename) => {
    const filePath = path.join(uploadDir, filename);
    try {
        if (fs.existsSync(filePath)) {
            await fs.promises.unlink(filePath);
        }
    } catch (error) {
        console.error('Error deleting file:', error);
    }
};

// Function to generate file URL
export const getFileUrl = (filename) => {
    return `${config.upload.directory}/${filename}`;
};

// Function to validate file existence
export const fileExists = (filename) => {
    const filePath = path.join(uploadDir, filename);
    return fs.existsSync(filePath);
};

export default {
    uploadSingleFile,
    uploadMultipleFiles,
    uploadFields,
    deleteFile,
    getFileUrl,
    fileExists
};