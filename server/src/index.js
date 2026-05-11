import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { trafficLogger } from './middleware/logger.js';
import authRoutes from './routes/auth.js';
import servicesRoutes from './routes/services.js';
import bookingsRoutes from './routes/bookings.js';
import feedbackRoutes from './routes/feedback.js';
import statsRoutes from './routes/stats.js';
import guidesRoutes from './routes/guides.js';
import { runMigrations } from './migrate.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(trafficLogger);

app.use('/api/auth', authRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/guides', guidesRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// Serve static frontend in production
const clientDist = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDist));
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

runMigrations().catch(console.error);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`JB IT Solutions API running on port ${PORT}`);
});
