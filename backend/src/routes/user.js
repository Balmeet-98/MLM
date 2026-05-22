const express = require('express');
const { getDashboard, getProfile } = require('../controllers/userController');
const { listNotifications, readNotification, readAllNotifications } = require('../controllers/notificationController');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/dashboard', auth, getDashboard);
router.get('/profile', auth, getProfile);
router.get('/notifications', auth, listNotifications);
router.patch('/notifications/read-all', auth, readAllNotifications);
router.patch('/notifications/:id/read', auth, readNotification);

module.exports = router;
