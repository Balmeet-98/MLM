const express = require('express');
const { getWallet, requestWithdrawal, getWithdrawals, getIncomeLogs } = require('../controllers/walletController');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, getWallet);
router.post('/withdraw', auth, requestWithdrawal);
router.get('/withdrawals', auth, getWithdrawals);
router.get('/income', auth, getIncomeLogs);

module.exports = router;
