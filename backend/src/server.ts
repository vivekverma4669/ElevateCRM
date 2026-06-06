import './config/env'; // Load and validate env first
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectDB } from './config/db';
import { connectRedis } from './config/redis';
import { errorHandler, notFound } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import leadRoutes from './routes/leads';
import aiRoutes from './routes/ai';
import dashboardRoutes from './routes/dashboard';
import activityRoutes from './routes/activities';
import contactRoutes from './routes/contacts';
import companyRoutes from './routes/companies';
import taskRoutes from './routes/tasks';
import emailRoutes from './routes/emails';
import { env } from './config/env';

const app = express();

// Security & parsing middleware
app.use(helmet());
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));
}

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// API routes
const API_PREFIX = '/api/v1';
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/leads`, leadRoutes);
app.use(`${API_PREFIX}/ai`, aiRoutes);
app.use(`${API_PREFIX}/dashboard`, dashboardRoutes);
app.use(`${API_PREFIX}/activities`, activityRoutes);
app.use(`${API_PREFIX}/contacts`, contactRoutes);
app.use(`${API_PREFIX}/companies`, companyRoutes);
app.use(`${API_PREFIX}/tasks`, taskRoutes);
app.use(`${API_PREFIX}/emails`, emailRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

async function bootstrap(): Promise<void> {
  try {
    await connectDB();
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }

  try {
    await connectRedis();
  } catch (error) {
    console.warn('⚠️ Redis unavailable, continuing without cache/rate-limiting:', (error as Error).message);
  }

  const port = parseInt(env.PORT);
  app.listen(port, () => {
    console.log(`🚀 ElevateCRM API running on port ${port} [${env.NODE_ENV}]`);
  });
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

bootstrap();

export default app;
