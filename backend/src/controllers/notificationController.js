const {
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} = require('../services/notificationService');

const listNotifications = async (req, res, next) => {
  try {
    const { limit, unreadOnly } = req.query;
    const result = await getUserNotifications(req.user.id, {
      limit: limit ? parseInt(limit, 10) : 30,
      unreadOnly: unreadOnly === 'true',
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const readNotification = async (req, res, next) => {
  try {
    const notification = await markNotificationRead(req.user.id, req.params.id);
    res.json({ notification });
  } catch (err) {
    next(err);
  }
};

const readAllNotifications = async (req, res, next) => {
  try {
    await markAllNotificationsRead(req.user.id);
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
};

module.exports = { listNotifications, readNotification, readAllNotifications };
