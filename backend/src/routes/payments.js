const express = require('express');
const { createOrder } = require('../controllers/paymentController');

const router = express.Router();

// Public — no auth needed (called before account creation)
router.post('/create-order', createOrder);

module.exports = router;
