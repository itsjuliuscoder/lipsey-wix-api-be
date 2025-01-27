// src/routes/inventoryRoutes.js
const express = require('express');
const { syncInventory, getWixProducts, getWixProductsV2, getProductsByCollections,  getWixCollections, getLipseyCatalog, getLipseyPricingQuantityFeed } = require('../controllers/inventoryController');
const router = express.Router();

router.post('/sync', syncInventory);
router.get('/wix-products', getWixProducts);
router.get('/wix-collections', getWixCollections);
router.get('/lipsey-catalog', getLipseyCatalog);
router.get('/lipsey-pricing', getLipseyPricingQuantityFeed);
router.get('/wix-inventories', syncInventory)
router.get('/wix-products/:id', getProductsByCollections);
//router.get('/wix-products-v2', getWixProductsV2)

module.exports = router;