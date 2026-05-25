import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import generateRoutes from './routes/generateRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10kb' }));

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
app.use('/api', generateRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
  console.log(`Gemini model(s): ${config.aiModels.join(', ')}`);
});
