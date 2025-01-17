// src/controllers/inventoryController.js
const Product = require('../models/product');
const axios = require('axios');

const syncInventory = async (req, res) => {
  try {
    const products = await Product.find();
    const updates = products.map(async (product) => {
      // Fetch data from Wix and Lipseys
      const wixData = await axios.get(`https://api.wix.com/inventory/${product.sku}`, {
        headers: { Authorization: `Bearer ${process.env.WIX_API_KEY}` },
      });
      const lipseyData = await axios.get(`https://api.lipseys.com/inventory/${product.sku}`, {
        headers: { Authorization: `Bearer ${process.env.LIPSEY_API_KEY}` },
      });

      // Update product quantity based on data from APIs
      product.quantity = Math.min(wixData.data.quantity, lipseyData.data.quantity);
      product.lastSynced = new Date();
      await product.save();
    });

    await Promise.all(updates);
    res.status(200).json({ message: 'Inventory synchronized successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { syncInventory };
