import express from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import UserFiles from '../models/UserFiles.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = './uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const fileId = uuidv4();
    const ext = path.extname(file.originalname);
    cb(null, `${fileId}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const validMimes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
    if (validMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Upload file - POST /api/files/upload
router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const userEmail = req.user?.email;
    if (!userEmail) {
      return res.status(400).json({ error: 'User email not found' });
    }

    const fileId = path.parse(req.file.filename).name;
    const fileType = req.file.mimetype === 'application/pdf' ? 'pdf' : 'image';
    const fileName = req.body.fileName || req.file.originalname;

    console.log('Upload successful - File:', req.file.filename, 'User:', userEmail);

    // Find or create user files document
    let userFilesDoc = await UserFiles.findOne({ userEmail });

    if (!userFilesDoc) {
      userFilesDoc = new UserFiles({
        userEmail,
        files: []
      });
    }

    // Add file reference
    userFilesDoc.files.push({
      fileId,
      fileName,
      fileType,
      mimeType: req.file.mimetype
    });

    userFilesDoc.updatedAt = new Date();
    await userFilesDoc.save();

    res.json({
      success: true,
      fileId,
      message: 'File uploaded successfully'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Upload failed' });
  }
});

// Get all files for logged-in user - GET /api/files
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const userFilesDoc = await UserFiles.findOne({ userEmail });

    if (!userFilesDoc) {
      return res.json({ files: [] });
    }

    res.json({ files: userFilesDoc.files });
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: 'Fetch failed' });
  }
});

// Stream file as data URL - GET /api/files/stream/:fileId
router.get('/stream/:fileId', authenticateToken, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const { fileId } = req.params;

    const userFilesDoc = await UserFiles.findOne({ userEmail });
    if (!userFilesDoc) {
      return res.status(404).json({ error: 'No files found' });
    }

    const file = userFilesDoc.files.find(f => f.fileId === fileId);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Find actual file on disk
    const files = fs.readdirSync(uploadsDir);
    const actualFile = files.find(f => f.startsWith(fileId));

    if (!actualFile) {
      return res.status(404).json({ error: 'File not found on disk' });
    }

    const filePath = path.join(uploadsDir, actualFile);
    const fileData = fs.readFileSync(filePath);
    const base64 = fileData.toString('base64');

    res.json({
      fileId: file.fileId,
      fileName: file.fileName,
      fileType: file.fileType,
      mimeType: file.mimeType,
      data: `data:${file.mimeType};base64,${base64}`
    });
  } catch (error) {
    console.error('Stream error:', error);
    res.status(500).json({ error: 'Stream failed' });
  }
});

// Delete file - DELETE /api/files/:fileId
router.delete('/:fileId', authenticateToken, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const { fileId } = req.params;

    const userFilesDoc = await UserFiles.findOne({ userEmail });
    if (!userFilesDoc) {
      return res.status(404).json({ error: 'No files found' });
    }

    userFilesDoc.files = userFilesDoc.files.filter(f => f.fileId !== fileId);
    userFilesDoc.updatedAt = new Date();
    await userFilesDoc.save();

    // Delete file from disk
    const files = fs.readdirSync(uploadsDir);
    const actualFile = files.find(f => f.startsWith(fileId));
    if (actualFile) {
      fs.unlinkSync(path.join(uploadsDir, actualFile));
    }

    res.json({ success: true, message: 'File deleted' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Delete failed' });
  }
});

export default router;
