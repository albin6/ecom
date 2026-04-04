import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { notFound, errorHandler } from './middlewares/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

import { env } from './config/env.js';

const app = express();

// Security and utility middlewares
app.use(helmet());
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Routes
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Welcome to Hannvis eCommerce API',
    version: '1.0.0',
    documentation: 'https://github.com/albin6/ecom'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is healthy' });
});

// APIs will be mounted here
import uploadRoutes from './routes/uploadRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import checkoutRoutes from './routes/checkoutRoutes.js';
import cartRoutes from './routes/cartRoutes.js';

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/checkout', checkoutRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/cart', cartRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
