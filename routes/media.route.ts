import express from 'express';
import upload from '@/middlewares/multer.middleware';
import { uploadVideo } from '@/controllers/media.controller';

const router = express.Router();

router.route('/upload-video').post(upload.single('file'), uploadVideo);

export default router;
