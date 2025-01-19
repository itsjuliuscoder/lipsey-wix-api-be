const axios = require('axios');

const WIX_API_BASE_URL = 'https://www.wixapis.com/stores/v2';
const WIX_AUTH_TOKEN = process.env.WIX_AUTH_TOKEN;

const axiosInstance = axios.create({
  baseURL: WIX_API_BASE_URL,
  headers: {
    Authorization: WIX_AUTH_TOKEN,
    'Content-Type': 'application/json',
  },
});

// Fetch Wix products
async function getWixProducts() {
  const response = await axiosInstance.get('/products/query');
  return response.data.products;
}

// Update Wix inventory
async function updateWixInventory(productId, quantity) {
  const response = await axiosInstance.post(`/inventoryItems/${productId}/updateInventory`, {
    quantity,
  });
  return response.data;
}

module.exports = { getWixProducts, updateWixInventory };
