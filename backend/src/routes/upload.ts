import { Router, Response, Request } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import imagekit, { isImageKitConfigured } from '../config/imagekit';
import { toFile } from '@imagekit/nodejs';

const router = Router();

// ─── Local-disk fallback (used when ImageKit is not configured) ───────────────

function localUploadDir(type: string): string {
  const sub = type === 'blog' ? 'blog-images' : 'ctf-images';
  const dir = path.resolve(process.cwd(), 'uploads', sub);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

// ─── Multer — always use memory storage ──────────────────────────────────────
// Buffers are sent to ImageKit; local-fallback writes them to disk manually.

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// ─── POST /api/upload/image ───────────────────────────────────────────────────
//
//  Query params:
//    ?type=blog   → stores in /blog-images/ folder on ImageKit (or blog-images/ locally)
//    ?type=ctf    → stores in /ctf-images/  folder on ImageKit (or ctf-images/ locally)
//
//  Response: { url: string, fileId?: string }
//   • url    — public CDN URL (ImageKit) or local server URL (fallback)
//   • fileId — ImageKit file ID (useful for future delete operations), omitted on fallback

router.post(
  '/image',
  requireAuth,
  requireRole('author'),
  (req: Request, res: Response, next: any) => {
    upload.single('image')(req as any, res as any, (err: any) => {
      if (err instanceof multer.MulterError) {
        res.status(400).json({ message: `Upload error: ${err.message}` });
        return;
      }
      if (err) {
        res.status(400).json({ message: err.message });
        return;
      }
      next();
    });
  },
  async (req: Request, res: Response): Promise<void> => {
    const file = (req as any).file as Express.Multer.File | undefined;
    if (!file) {
      res.status(400).json({ message: 'No image file provided' });
      return;
    }

    const uploadType = (req.query?.type as string) === 'blog' ? 'blog' : 'ctf';
    const folder = uploadType === 'blog' ? '/blog-images' : '/ctf-images';

    // ── ImageKit path ─────────────────────────────────────────────────────────
    if (isImageKitConfigured()) {
      try {
        const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;

        // Convert Buffer → Uploadable using the SDK helper
        const uploadable = await toFile(file.buffer, fileName, { type: file.mimetype });

        const result = await imagekit.files.upload({
          file: uploadable,
          fileName,
          folder,
          useUniqueFileName: false, // we already generate a unique name above
        });

        res.json({ url: result.url, fileId: result.fileId });
      } catch (err: any) {
        console.error('[ImageKit upload error]', err);
        res.status(500).json({ message: 'ImageKit upload failed: ' + (err.message ?? String(err)) });
      }
      return;
    }

    // ── Local-disk fallback (dev / no credentials) ────────────────────────────
    try {
      const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
      const dir = localUploadDir(uploadType);
      fs.writeFileSync(path.join(dir, fileName), file.buffer);

      const subDir = uploadType === 'blog' ? 'blog-images' : 'ctf-images';
      const baseUrl = process.env.SERVER_URL ?? `http://localhost:${process.env.PORT ?? 5000}`;
      const url = `${baseUrl}/uploads/${subDir}/${fileName}`;

      res.json({ url });
    } catch (err: any) {
      console.error('[Local upload fallback error]', err);
      res.status(500).json({ message: 'Local upload failed: ' + (err.message ?? String(err)) });
    }
  }
);

export default router;
