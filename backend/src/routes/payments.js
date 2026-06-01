const express = require('express');
const { createOrder, createInstallmentOrder } = require('../controllers/paymentController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/create-order', createOrder);
router.post('/installment-order', auth, createInstallmentOrder);

module.exports = router;
