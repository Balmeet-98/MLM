const express = require('express');
const { getProducts, purchaseProduct, getMyProducts } = require('../controllers/productController');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, getProducts);
router.get('/my', auth, getMyProducts);
router.post('/purchase', auth, purchaseProduct);

module.exports = router;
