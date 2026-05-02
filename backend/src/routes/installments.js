const express = require('express');
const { getMyInstallments, payInstallment } = require('../controllers/installmentController');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/my', auth, getMyInstallments);
router.post('/pay', auth, payInstallment);

module.exports = router;
