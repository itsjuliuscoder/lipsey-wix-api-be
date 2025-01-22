// src/routes/inventoryRoutes.js
const express = require('express');
const { syncInventory, getWixProducts, getWixCollections, getLipseyCatalog, getLipseyPricingQuantityFeed } = require('../controllers/inventoryController');
const router = express.Router();

router.post('/sync', syncInventory);
router.get('/wix-products', getWixProducts);
router.get('/wix-collections', getWixCollections);
router.get('/lipsey-catalog', getLipseyCatalog);
router.get('/lipsey-pricing', getLipseyPricingQuantityFeed);

module.exports = router;