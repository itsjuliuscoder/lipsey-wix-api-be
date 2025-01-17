// src/models/product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  sku: { type: String, required: true, unique: true },
  quantity: { type: Number, required: true },
  lastSynced: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ProductLW', productSchema);
