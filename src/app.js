// src/app.js
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');

const app = express();
require('dotenv').config();

// Middleware
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Lipseys & Wix Synchronization API' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);

module.exports = app;
