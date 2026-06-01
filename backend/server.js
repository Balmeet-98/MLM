require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');
const errorHandler = require('./src/middleware/errorHandler');
const { startCronJobs } = require('./src/utils/cronJobs');

const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/user');
const treeRoutes = require('./src/routes/tree');
const walletRoutes = require('./src/routes/wallet');
const installmentRoutes = require('./src/routes/installments');
// const productRoutes = require('./src/routes/products');
const rewardRoutes = require('./src/routes/rewards');
const adminRoutes = require('./src/routes/admin');
const paymentRoutes = require('./src/routes/payments');

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));

const isProduction = process.env.NODE_ENV === 'production';
app.use(cors({
  origin: isProduction ? true : (process.env.FRONTEND_URL || 'http://localhost:5173'),
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => res.json({ status: 'ok', app: 'Samriddhi Network API' }));

app.use('/api/payments', paymentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/tree', treeRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/installments', installmentRoutes);
// app.use('/api/products', productRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/admin', adminRoutes);

// Serve React frontend only when dist exists (monolith deploy).
// API-only on Render/Vercel split: skip — frontend is a separate static site.
const frontendDist = path.join(__dirname, '../frontend/dist');
const serveFrontend = isProduction && fs.existsSync(path.join(frontendDist, 'index.html'));

if (serveFrontend) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(frontendDist, 'index.html'), (err) => {
      if (err) next(err);
    });
  });
} else if (isProduction) {
  app.get('/', (req, res) => {
    res.json({
      status: 'ok',
      app: 'Samriddhi Network API',
      message: 'API only. Use the frontend URL for the web app.',
      health: '/health',
    });
  });
}

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Samriddhi Network API running on port ${PORT}`);
  startCronJobs();
});
