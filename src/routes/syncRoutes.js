const express = require('express');
const { syncInventory } = require('../controllers/syncController');

const router = express.Router();

router.post('/sync', syncInventory);

module.exports = router;
