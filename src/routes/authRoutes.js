// src/routes/authRoutes.js
const express = require('express');
const { register, login, lipseyLogin } = require('../controllers/authController');
const router = express.Router();
const { handleOAuthCallback, getAuthorizationUrl } = require("../services/wixAuthService");

router.get("/login", (req, res) => {
    const authUrl = getAuthorizationUrl();
    console.log("this is the authurl", authUrl);
    res.redirect(authUrl);
});

router.get("/callback", async (req, res) => {
    const { code } = req.query;
    console.log("this is code", code);
    try {
        const accessToken = await handleOAuthCallback(code);
        res.json({ message: "OAuth successful!", accessToken });
    } catch (error) {
        res.status(500).json({ error: "OAuth failed", details: error.message });
    }
});

module.exports = router;


router.post('/register', register);
router.post('/login/user', login);
router.post('/lipsey-login', lipseyLogin);

module.exports = router;