import express from 'express';
import cors from 'cors';

import { requestLogger } from './utils/loggerMiddleware.js';
import { apiLimiter } from './utils/rateLimiter.js';
import { errorHandler } from './utils/errorHandler.js';
import { loadRoutes } from './loaders/routes.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use(apiLimiter);

// ✅ Health route should be BEFORE error handler
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', time: new Date().toISOString() });
});

const setup = async () => {
  const routes = await loadRoutes();
  app.use('/api', routes);
};

setup().catch(err => {
  console.error("Failed to load routes:", err);
});

// ✅ Error handler should be LAST
app.use(errorHandler);

export default app;
