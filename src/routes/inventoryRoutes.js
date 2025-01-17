// src/routes/inventoryRoutes.js
const express = require('express');
const { syncInventory } = require('../controllers/inventoryController');
const router = express.Router();

router.post('/sync', syncInventory);

module.exports = router;