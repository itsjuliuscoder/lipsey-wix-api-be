// src/controllers/inventoryController.js
const Product = require('../models/product');
const {queryProduct, queryCollections, queryInventory, updateWixInventory, updateProductInventory, fetchAllProducts, queryProductsByCollection} = require('../services/wixService');
const {getCatalogFeed, pricingQuantityFeed } = require('../services/lipseyService');
const { getToken } = require('../services/wixApiService');
const axios = require('axios');

const getWixToken = async (req, res) => {
  try {
    const response = await getToken();
    res.status(200).json(response);
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
}

const syncInventory = async (req, res) => {
  try {
    const inventories = await queryInventory();
    res.status(200).json(inventories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getProductsByCollections = async (req, res) => {
    console.log("req ", req.params.id)
    try {
      const products = await queryProductsByCollection(req.params.id);
      res.status(200).json(products);
    } catch(error) {
      res.status(500).json({ error: error.message });
    }
}

const getWixProducts = async (req, res) => {
  try {
    const products = await queryProduct();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getWixProductsV2 = async (req, res) => {
  try {
    const products = await fetchAllProducts();
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

const updateWixProduct = async (req, res) => {
  try {
    // console.log("req.body --> ", req.body)
    const wixProductId = req.body.wixProductId;
    const quantity = req.body.quantity;
    const updatedProduct = await updateProductInventory(wixProductId, quantity);
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}



module.exports = { syncInventory, getWixToken, updateWixProduct, getProductsByCollections, getWixProductsV2, getWixProducts, getWixCollections, getLipseyCatalog, getLipseyPricingQuantityFeed };
