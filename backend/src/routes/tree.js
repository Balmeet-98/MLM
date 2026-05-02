const express = require('express');
const { getMyTree, getUserTree, getDirectReferrals } = require('../controllers/treeController');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/my', auth, getMyTree);
router.get('/referrals', auth, getDirectReferrals);
router.get('/:userId', auth, getUserTree);

module.exports = router;
