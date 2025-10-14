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

  try {
    if (request.file) {
      const image = request.file.path;

      const result = await cloudinary.uploader.upload(image, {
        resource_type: 'auto'
      });

      publicId = result?.public_id;
      await unlink(request.file.path);
    }

    return publicId;
  } catch (error) {
    return publicId;
  }
};

export const deleteMediaFromCloudinary = async (publicId: string) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.log(error);
  }
};

export const deleteVideoFromCloudinary = async (publicId: string) => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
  } catch (error) {
    console.log(error);
  }
};
