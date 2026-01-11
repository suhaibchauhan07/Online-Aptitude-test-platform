import mongoose from 'mongoose';

let gfsBucket;

const conn = mongoose.connection;
conn.once('open', () => {
    gfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'profilePictures'
    });
});

export const getImage = async (req, res) => {
    try {
        if (!gfsBucket) {
             gfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
                bucketName: 'profilePictures'
            });
        }

        const filename = req.params.filename;
        const file = await conn.db.collection('profilePictures.files').findOne({ filename: filename });

        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        const readStream = gfsBucket.openDownloadStreamByName(filename);
        readStream.pipe(res);
    } catch (error) {
        console.error('Error fetching image:', error);
        res.status(500).json({ message: 'Error fetching image', error: error.message });
    }
};
