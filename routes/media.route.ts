import express from 'express';
import { uploadMedia } from '@utils/cloudinary.js';
import upload from '@utils/multer.js';

const router = express.Router();

router
  .route('/upload-video')
  .post(upload.single('file'), async (request, response) => {
    try {
      const result = await uploadMedia(request?.file?.path!);
      response.status(200).json({
        success: true,
        message: 'File uploaded successfully.',
        data: result,
      });
    } catch (error) {
      console.log(error);
      response.status(500).json({ message: 'Error uploading file' });
    }
  });
export default router;
