import { v2 as cloudinary } from 'cloudinary';
import { env } from '@configs/env.config';
import type { Request } from 'express';
import { unlink } from 'fs/promises';
import type { UploadApiResponse } from 'cloudinary';

cloudinary.config({
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  cloud_name: env.CLOUDINARY_CLOUD_NAME
});

export const uploadMedia = async (request: Request) => {
  let result: UploadApiResponse | undefined = undefined;
  let resource: string | undefined = undefined;

  if (request.file) resource = request.file.path;

  if (!resource) return result;

  try {
    result = await cloudinary.uploader.upload(resource, {
      resource_type: 'auto'
    });
    return result;
  } catch (error) {
    return result;
  } finally {
    await unlink(resource);
  }
};

export const deleteMedia = async (publicId: string) => {
  await cloudinary.uploader.destroy(publicId);
};

export const deleteVideo = async (publicId: string) => {
  await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
};
