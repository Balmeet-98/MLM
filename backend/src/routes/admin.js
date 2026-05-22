const express = require('express');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const {
  getAllUsers, blockUser, unblockUser,
  createProduct, updateProduct, getAllProducts,
  createGroup, getGroups,
  getPendingWithdrawals, approveWithdrawal, rejectWithdrawal,
  triggerLuckyDraw, getLuckyDrawHistory, scheduleLuckyDraw, getLuckyDrawSchedules, cancelLuckyDrawSchedule,
  markRewardCollected, getPendingRewards,
  getIncomeLogs, getStats, getPairsOverview,
} = require('../controllers/adminController');
const { getUserTree } = require('../controllers/treeController');

const router = express.Router();
router.use(auth, adminAuth);

// Stats
router.get('/stats', getStats);

// Pair insights (all members)
router.get('/pairs', getPairsOverview);

// Users
router.get('/users', getAllUsers);
router.patch('/users/:id/block', blockUser);
router.patch('/users/:id/unblock', unblockUser);
router.get('/users/:userId/tree', getUserTree);

// Products (disabled for now — routes kept for later)
// router.get('/products', getAllProducts);
// router.post('/products', createProduct);
// router.patch('/products/:id', updateProduct);

// Groups
router.get('/groups', getGroups);
router.post('/groups', createGroup);

// Withdrawals
router.get('/withdrawals', getPendingWithdrawals);
router.patch('/withdrawals/:id/approve', approveWithdrawal);
router.patch('/withdrawals/:id/reject', rejectWithdrawal);

// Lucky Draw
router.post('/lucky-draw/:groupId/schedule', scheduleLuckyDraw);
router.get('/lucky-draw/schedules', getLuckyDrawSchedules);
router.patch('/lucky-draw/schedules/:id/cancel', cancelLuckyDrawSchedule);
router.post('/lucky-draw/:groupId', triggerLuckyDraw);
router.get('/lucky-draw/history', getLuckyDrawHistory);

// Rewards
router.get('/rewards/pending', getPendingRewards);
router.patch('/rewards/:id/mark-collected', markRewardCollected);

// Income
router.get('/income-logs', getIncomeLogs);

module.exports = router;
