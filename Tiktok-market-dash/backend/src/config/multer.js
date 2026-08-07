import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';
import { env } from './env.js';

const uploadRoot = path.resolve(process.cwd(), env.upload.dir);

if (!fs.existsSync(uploadRoot)) {
  fs.mkdirSync(uploadRoot, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadRoot);
  },
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safeName}`);
  },
});

/** Multer instance — wired for future upload routes; unused in Phase 2. */
export const upload = multer({
  storage,
  limits: {
    fileSize: env.upload.maxFileSizeMb * 1024 * 1024,
  },
});

export const uploadDir = uploadRoot;
