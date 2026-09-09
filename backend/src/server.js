import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { config } from './config/env.js';
import { connectDB, dbHealth } from './config/db.js';
import generateRoutes from './routes/generateRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import voiceInterviewRoutes from './routes/voiceInterviewRoutes.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const app = express();

// Behind Render/Vercel/any reverse proxy the client IP is in X-Forwarded-For.
// Trusting the first hop lets express-rate-limit key by real per-client IP
// instead of lumping every user under the proxy's single IP.
app.set('trust proxy', 1);

await connectDB();

app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || config.clientUrls.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(apiLimiter);

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString(), db: dbHealth() }));
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/voice-interview', voiceInterviewRoutes);
app.use('/api', generateRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
  console.log(`Gemini model(s): ${config.aiModels.join(', ')}`);
});
