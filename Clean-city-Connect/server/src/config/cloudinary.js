import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Determine resource type based on mime type
    let resource_type = 'image';
    if (file.mimetype.startsWith('video/')) {
      resource_type = 'video';
    }

    return {
      folder: 'cleancity_complaints',
      resource_type: resource_type,
      allowed_formats: ['jpg', 'png', 'jpeg', 'mp4', 'webm'],
    };
  },
});

export const upload = multer({ storage: storage });
export { cloudinary };
