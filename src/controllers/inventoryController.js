// src/controllers/inventoryController.js
const Product = require('../models/product');
const {queryProducts, queryCollections, queryInventory} = require('../services/wixService');
const {getCatalogFeed, pricingQuantityFeed } = require('../services/lipseyService');
const axios = require('axios');

const syncInventory = async (req, res) => {
  try {
    const inventories = await queryInventory();
    res.status(200).json(inventories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getWixProducts = async (req, res) => {
  try {
    const products = await queryProducts();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const getWixCollections = async (req, res) => {
  try {
    const collections = await queryCollections();
    res.status(200).json(collections);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const getLipseyCatalog = async (req, res) => {
  try {
    const catalog = await getCatalogFeed();
    res.status(200).json(catalog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const getLipseyPricingQuantityFeed = async (req, res) => {
  try {
    const catalog = await pricingQuantityFeed();
    res.status(200).json(catalog);
  } catch(error){
    res.status(500).json({ error: error.message })
  }
}

module.exports = { syncInventory, getWixProducts, getWixCollections, getLipseyCatalog, getLipseyPricingQuantityFeed };
