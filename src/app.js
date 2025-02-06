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
    origin: ['http://localhost:3000', 'https://lipsey-wix-api-be-v1.onrender.com'],
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



module.exports = app;
