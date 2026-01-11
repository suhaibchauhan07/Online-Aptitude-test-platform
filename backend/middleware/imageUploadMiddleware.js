import multer from 'multer';
import { GridFsStorage } from 'multer-gridfs-storage';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

// Create storage engine
const storage = new GridFsStorage({
    url: process.env.MONGODB_URI,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            const filename = `${Date.now()}-profile-${file.originalname}`;
            const fileInfo = {
                filename: filename,
                bucketName: 'profilePictures'
            };
            resolve(fileInfo);
        });
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    // Accept images
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

// Configure multer
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

export default upload;
