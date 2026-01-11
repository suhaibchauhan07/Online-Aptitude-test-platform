import mongoose from 'mongoose';
import { Readable } from 'stream';

export const uploadToGridFS = (file, bucketName) => {
    return new Promise((resolve, reject) => {
        if (!mongoose.connection.db) {
            return reject(new Error('Database not connected'));
        }
        
        const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
            bucketName: bucketName
        });

        const filename = `${Date.now()}-profile-${file.originalname}`;
        const uploadStream = bucket.openUploadStream(filename, {
            contentType: file.mimetype
        });

        const readableStream = new Readable();
        readableStream.push(file.buffer);
        readableStream.push(null);

        readableStream.pipe(uploadStream)
            .on('error', (error) => reject(error))
            .on('finish', () => {
                resolve({ filename, fileId: uploadStream.id });
            });
    });
};
