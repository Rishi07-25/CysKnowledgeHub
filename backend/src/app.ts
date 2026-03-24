import videoRoutes from './routes/videos';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

import authRoutes         from './routes/auth';
import healthRoutes        from './routes/health';
import adminRoutes         from './routes/admin';
import topicsRoutes        from './routes/topics';
import articlesRoutes      from './routes/articles';
import uploadRoutes        from './routes/upload';
import projectsRoutes      from './routes/projects';
import achievementsRoutes  from './routes/achievements';
import interviewsRoutes    from './routes/interviews';
import companiesRoutes     from './routes/companies';
import roadmapsRoutes      from './routes/roadmaps';
import blogRoutes          from './routes/blog';
import writeupsRoutes      from './routes/writeups';

const app = express();

// ─── Middleware ──────────────────────────────────────────────────────────────
const allowedOrigins = process.env.CLIENT_ORIGIN
  ? [process.env.CLIENT_ORIGIN]
  : ['http://localhost:3000', 'http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. curl, Postman, same-origin)
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(express.json());

// ─── Static uploads (article images) ─────────────────────────────────────────
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/health',            healthRoutes);
app.use('/api/auth',          authRoutes);
app.use('/api/admin',         adminRoutes);
app.use('/api/topics',        topicsRoutes);
app.use('/api/articles',      articlesRoutes);
app.use('/api/upload',        uploadRoutes);
app.use('/api/projects',      projectsRoutes);
app.use('/api/achievements',  achievementsRoutes);
app.use('/api/interviews',    interviewsRoutes);
app.use('/api/companies',     companiesRoutes);
app.use('/api/roadmaps',      roadmapsRoutes);
app.use('/api/blog',          blogRoutes);
app.use('/api/writeups',      writeupsRoutes);
app.use('/api/videos', videoRoutes);

// ─── API 404 Fallback (must be before SPA catch-all) ─────────────────────────
app.use('/api/*', (_req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

// ─── Serve built frontend ────────────────────────────────────────────────────
app.use(express.static(path.join(process.cwd(), '../frontend/dist')));

// ─── SPA Fallback (must be last) ──────────────────────────────────────────────
// For any request that didn't match an API route or a static file, send
// index.html so React Router can handle client-side navigation on refresh.
app.get('*', (_req, res) => {
  res.sendFile(path.resolve(process.cwd(), '../frontend/dist/index.html'));
});

export default app;
