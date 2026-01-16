import mongoose from 'mongoose';

const userFilesSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  files: [
    {
      fileId: {
        type: String,
        required: true
      },
      fileName: {
        type: String,
        required: true
      },
      fileType: {
        type: String,
        enum: ['image', 'pdf'],
        required: true
      },
      mimeType: {
        type: String,
        required: true
      },
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('UserFiles', userFilesSchema);
