// src/routes/inventoryRoutes.js
const express = require('express');
const { syncInventory, getWixProducts, getWixCollections } = require('../controllers/inventoryController');
const router = express.Router();

router.post('/sync', syncInventory);
router.get('/wix-products', getWixProducts);
router.get('/wix-collections', getWixCollections);

module.exports = router;