require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const errorHandler = require('./src/middleware/errorHandler');
const { startCronJobs } = require('./src/utils/cronJobs');

const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/user');
const treeRoutes = require('./src/routes/tree');
const walletRoutes = require('./src/routes/wallet');
const installmentRoutes = require('./src/routes/installments');
const productRoutes = require('./src/routes/products');
const rewardRoutes = require('./src/routes/rewards');
const adminRoutes = require('./src/routes/admin');

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => res.json({ status: 'ok', app: 'Samriddhi Network API' }));

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/tree', treeRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/installments', installmentRoutes);
app.use('/api/products', productRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/admin', adminRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Samriddhi Network API running on port ${PORT}`);
  startCronJobs();
});
