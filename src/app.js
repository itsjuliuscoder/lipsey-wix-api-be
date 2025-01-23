// src/app.js
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const syncRoutes = require('./routes/syncRoutes');  
const cors = require('cors');

const app = express();
require('dotenv').config();

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

module.exports = app;
