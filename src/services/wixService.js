const axios = require('axios');
const WIX_API_BASE_URL = 'https://www.wixapis.com/stores/v2';
const WIX_AUTH_TOKEN = process.env.WIX_API_KEY;

const { createClient } = require("@wix/sdk");
const { products, collections } = require("@wix/stores");
const OAuthStrategy = require("@wix/sdk").OAuthStrategy;

const myWixClient = createClient({
    modules: { products, collections },
    auth: OAuthStrategy({ clientId: '3e0af21c-448b-4c0f-9324-122e33b96358' }),
});

const axiosInstance = axios.create({
  baseURL: WIX_API_BASE_URL,
  headers: {
    Authorization: WIX_AUTH_TOKEN,
    'Content-Type': 'application/json',
  },
});


async function queryProducts() {
  const { items } = await myWixClient.products.queryProducts().find();

  return items;
}

async function queryCollections() {
  const { items } = await myWixClient.collections.queryCollections().find();

  return items;
}



// Update Wix inventory
async function updateWixInventory(productId, quantity) {
  const response = await axiosInstance.post(`/inventoryItems/${productId}/updateInventory`, {
    quantity,
  });
  return response.data;
}

module.exports = { updateWixInventory, queryProducts, queryCollections};
