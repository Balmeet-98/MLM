const express = require('express');
const { getMyRewards, getMyRanks } = require('../controllers/rewardController');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, getMyRewards);
router.get('/ranks', auth, getMyRanks);

module.exports = router;
