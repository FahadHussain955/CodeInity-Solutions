import fs from 'node:fs/promises';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const isConfigured = Boolean(
  env.cloudinary.cloudName && env.cloudinary.apiKey && env.cloudinary.apiSecret
);

if (isConfigured) {
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
    secure: true,
  });
}

const ensureUploadDir = async (folder) => {
  const dir = path.resolve(process.cwd(), env.upload.dir, folder || '');
  await fs.mkdir(dir, { recursive: true });
  return dir;
};

const localUpload = async (source, folder = 'misc') => {
  const dir = await ensureUploadDir(folder);
  const ext = path.extname(typeof source === 'string' ? source : '') || '.jpg';
  const filename = `${Date.now()}-${randomBytes(6).toString('hex')}${ext}`;
  const dest = path.join(dir, filename);

  if (Buffer.isBuffer(source)) {
    await fs.writeFile(dest, source);
  } else {
    await fs.copyFile(source, dest);
  }

  const relative = path.posix.join('/uploads', folder, filename);
  return {
    url: relative.replace(/\\/g, '/'),
    publicId: `local:${folder}/${filename}`,
    provider: 'local',
  };
};

/**
 * Upload an image from a Buffer or filesystem path.
 * @returns {{ url: string, publicId: string, provider: string }}
 */
export const uploadImage = async (source, folder = 'misc') => {
  if (!source) throw new Error('uploadImage requires a buffer or file path');

  if (!isConfigured) {
    return localUpload(source, folder);
  }

  try {
    const options = {
      folder: folder.startsWith('nexora/') ? folder : `nexora/${folder}`,
      resource_type: 'image',
    };

    let result;
    if (Buffer.isBuffer(source)) {
      result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(options, (err, res) => {
          if (err) reject(err);
          else resolve(res);
        });
        stream.end(source);
      });
    } else {
      result = await cloudinary.uploader.upload(source, options);
    }

    return {
      url: result.secure_url || result.url,
      publicId: result.public_id,
      provider: 'cloudinary',
    };
  } catch (err) {
    logger.warn('Cloudinary upload failed, falling back to local:', err.message);
    return localUpload(source, folder.replace(/^nexora\//, ''));
  }
};

/**
 * Delete an image by publicId (Cloudinary or local:folder/file).
 */
export const deleteImage = async (publicId) => {
  if (!publicId) return { deleted: false };

  if (String(publicId).startsWith('local:')) {
    const relative = String(publicId).slice('local:'.length);
    const filePath = path.resolve(process.cwd(), env.upload.dir, relative);
    try {
      await fs.unlink(filePath);
      return { deleted: true, provider: 'local' };
    } catch {
      return { deleted: false, provider: 'local' };
    }
  }

  if (!isConfigured) {
    return { deleted: false, provider: 'cloudinary', reason: 'not_configured' };
  }

  try {
    await cloudinary.uploader.destroy(publicId);
    return { deleted: true, provider: 'cloudinary' };
  } catch (err) {
    logger.warn('Cloudinary destroy failed:', err.message);
    return { deleted: false, provider: 'cloudinary', error: err.message };
  }
};

export const cloudinaryService = {
  isConfigured,
  uploadImage,
  deleteImage,
};

export default cloudinaryService;
