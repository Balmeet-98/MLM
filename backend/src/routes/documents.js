const express = require('express');
const { getBrochure } = require('../controllers/documentController');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/brochure', auth, getBrochure);

module.exports = router;
