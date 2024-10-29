const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const Grid = require('gridfs-stream');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/social-media-dashboard', { useNewUrlParser: true, useUnifiedTopology: true });
const conn = mongoose.connection;

// Initialize GridFS
let gfs;
conn.once('open', () => {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');
});

// Create storage engine for Multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload image endpoint
app.post('/upload', upload.single('image'), (req, res) => {
    // Save image to GridFS
    const writestream = gfs.createWriteStream({ filename: req.file.originalname });
    writestream.write(req.file.buffer);
    writestream.end();

    res.json({ message: 'Image uploaded successfully' });
});

// Get image endpoint
app.get('/image/:filename', (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
        if (!file || file.length === 0) {
            return res.status(404).json({ err: 'Image not found' });
        }

        const readstream = gfs.createReadStream(file.filename);
        readstream.pipe(res);
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
