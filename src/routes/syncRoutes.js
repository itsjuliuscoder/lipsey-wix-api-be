const express = require('express');
const { syncInventory } = require('../controllers/syncController');

const router = express.Router();

router.post('/', syncInventory);

module.exports = router;
