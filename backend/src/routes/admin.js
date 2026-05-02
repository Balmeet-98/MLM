const express = require('express');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const {
  getAllUsers, blockUser, unblockUser,
  createProduct, updateProduct, getAllProducts,
  createGroup, getGroups,
  getPendingWithdrawals, approveWithdrawal, rejectWithdrawal,
  triggerLuckyDraw, getLuckyDrawHistory,
  markRewardCollected, getPendingRewards,
  getIncomeLogs, getStats,
} = require('../controllers/adminController');
const { getUserTree } = require('../controllers/treeController');

const router = express.Router();
router.use(auth, adminAuth);

// Stats
router.get('/stats', getStats);

// Users
router.get('/users', getAllUsers);
router.patch('/users/:id/block', blockUser);
router.patch('/users/:id/unblock', unblockUser);
router.get('/users/:userId/tree', getUserTree);

// Products
router.get('/products', getAllProducts);
router.post('/products', createProduct);
router.patch('/products/:id', updateProduct);

// Groups
router.get('/groups', getGroups);
router.post('/groups', createGroup);

// Withdrawals
router.get('/withdrawals', getPendingWithdrawals);
router.patch('/withdrawals/:id/approve', approveWithdrawal);
router.patch('/withdrawals/:id/reject', rejectWithdrawal);

// Lucky Draw
router.post('/lucky-draw/:groupId', triggerLuckyDraw);
router.get('/lucky-draw/history', getLuckyDrawHistory);

// Rewards
router.get('/rewards/pending', getPendingRewards);
router.patch('/rewards/:id/mark-collected', markRewardCollected);

// Income
router.get('/income-logs', getIncomeLogs);

module.exports = router;
