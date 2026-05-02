const express = require('express');
const { getDashboard, getProfile } = require('../controllers/userController');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/dashboard', auth, getDashboard);
router.get('/profile', auth, getProfile);

module.exports = router;
