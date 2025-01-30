// src/app.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const syncRoutes = require('./routes/syncRoutes');  
const cors = require('cors');
require('./jobs/cronJob');

// Wix App Credentials
const CLIENT_ID = encodeURIComponent(process.env.APP_ID);
const CLIENT_SECRET = process.env.APP_SECRET_KEY;
const REDIRECT_URI = encodeURIComponent(process.env.REDIRECT_URI);
const scope = encodeURIComponent("wix.stores.modify_inventory");

const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
}));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Lipseys & Wix Synchronization API' });
});


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/sync', syncRoutes);


// Step 1: Authorization URL Endpoint
app.get("/authorize", (req, res) => {
    const url = `https://www.wix.com/oauth/authorize?client_id=${CLIENT_ID}&scope=${scope}&redirect_uri=${REDIRECT_URI}`
    //const authorizationUrl = `https://www.wix.com/oauth2/access?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=stores:modify_inventory&response_type=code`;
    res.redirect(url);
});

// Step 2: Callback to Handle Authorization Code
app.get("/callback", async (req, res) => {
    const { code } = req.query;

    // console.log(`This is the request data ---> ${(req)}`);
    // console.log("This is the request body --> ", JSON.stringify(req));

    if (!code) {
        return res.status(400).send("Authorization code not found");
    }

    try {
        const response = await axios.post(
        "https://www.wix.com/oauth/access",
        {
            grant_type: "authorization_code",
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            code: code,
            redirect_uri: REDIRECT_URI,
        },
        { headers: { "Content-Type": "application/json" } }
        );

        const { access_token, refresh_token, expires_in } = response.data;

        console.log(`This is the response data ---> ${response.data}`);

        res.send({
            message: "Authorization successful!",
            access_token,
            refresh_token,
            expires_in,
        });



    } catch (error) {
        console.error("Error exchanging authorization code:", error.response?.data || error.message);
        res.status(500).send("Failed to exchange authorization code");
    }
});

// Step 3: Refresh Token Endpoint
app.post("/refresh-token", async (req, res) => {
    const { refresh_token } = req.body;

    if (!refresh_token) {
        return res.status(400).send("Refresh token is required");
    }

    try {
        const response = await axios.post(
            "https://www.wix.com/oauth/access",
        {
            grant_type: "refresh_token",
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            refresh_token: refresh_token,
        },
        { headers: { "Content-Type": "application/json" } }
        );

        const { access_token, refresh_token: new_refresh_token, expires_in } = response.data;

        res.send({
            message: "Token refreshed successfully!",
            access_token,
            refresh_token: new_refresh_token,
            expires_in,
        });
    } catch (error) {
        console.error("Error refreshing token:", error.response?.data || error.message);
        res.status(500).send("Failed to refresh token");
    }
});



module.exports = app;
