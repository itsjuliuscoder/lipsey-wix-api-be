// src/routes/authRoutes.js
const express = require('express');
const { register, login, lipseyLogin } = require('../controllers/authController');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/lipsey-login', lipseyLogin);

module.exports = router;