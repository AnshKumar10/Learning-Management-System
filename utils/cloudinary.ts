import { v2 as cloudinary } from 'cloudinary';
import { env } from '@configs/env.config';
import type { Request } from 'express';
import { unlink } from 'fs/promises';

cloudinary.config({
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  cloud_name: env.CLOUDINARY_CLOUD_NAME
});

export const uploadMedia = async (request: Request) => {
  let publicId: string | undefined = undefined;
  let image: string | undefined = undefined;

  if (request.file) image = request.file.path;

  if (!image) return publicId;

  try {
    const result = await cloudinary.uploader.upload(image, {
      resource_type: 'auto'
    });

    publicId = result?.public_id;
    return publicId;
  } catch (error) {
    return publicId;
  } finally {
    await unlink(image);
  }
};

export const deleteMedia = async (publicId: string) => {
  await cloudinary.uploader.destroy(publicId);
};

export const deleteVideo = async (publicId: string) => {
  await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
};
