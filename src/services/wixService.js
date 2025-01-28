require('dotenv').config();
const axios = require('axios');
const WIX_API_BASE_URL = 'https://www.wixapis.com/stores/v2';
// Load environment variables
const API_KEY = process.env.WIX_API_KEY_THREE;
const SITE_ID = process.env.WIX_SITE_ID;
const ACCOUNT_ID = process.env.WIX_ACCOUNT_ID;

// Define the API endpoint
const PRODUCTS_API_URL = "https://www.wixapis.com/stores/v1/products/query";

const { createClient, ApiKeyStrategy, OAuthStrategy } = require("@wix/sdk");
const { products, collections, inventory } = require("@wix/stores");


require('@wix/sdk').AppStrategy
const wixClient = createClient({
    modules: { products, collections, inventory  },
    auth: OAuthStrategy({ clientId: '3d517b60-eaa6-4d6c-a0a1-cae06ddfd79a', scopes: ['WIX_STORES.MODIFY_INVENTORY', 'WIX_STORES.READ_PRODUCTS'] }),
});

// Create a client instance using the API Key
const myWixClient = createClient({
  auth: ApiKeyStrategy({
    apiKey: API_KEY,
    siteId: SITE_ID,
    accountId: ACCOUNT_ID,
  }),
  modules: {
    products,
  }
});

const axiosInstance = axios.create({
  baseURL: "https://www.wixapis.com/stores/v2",
  headers: {
    Authorization: `Bearer ${process.env.WIX_API_KEY}`,
    "Content-Type": "application/json",
  },
});



async function queryInventory() {
    let allInventoryItems = [];
    let hasNext = true;
    let cursor = null;
  
    while (hasNext) {
      const response = await myWixClient.inventory.queryInventory().find({ cursor, limit: 100 });
        
      console.log("this is the response -->", response);
      const { items, pageSize, totalCount, nextCursor } = response;
  
      allInventoryItems = allInventoryItems.concat(items);
  
      if (nextCursor) {
        cursor = nextCursor;
      } else {
        hasNext = false;
      }
    }
  
    return { items: allInventoryItems, totalCount: allInventoryItems.length };
}



// Function to get products
async function queryProduct() {
  // console.log("These are the credentials ", API_KEY, ACCOUNT_ID, SITE_ID);
  try {
    const response = await wixClient.products
    .queryProducts().descending('lastUpdated')
    .limit(100)
    .find();
    
    return response;
  } catch (error) {
    console.error("Error fetching products:", error.response?.data || error.message);
  }
}


async function updateProductInventory(productId, quantity) {

  console.log("Product Id & Quantity -->", productId, quantity);

  try {
    //const productId = 'your-product-id'; // Replace with the actual product ID
    const newQuantity = 10; // Replace with the desired quantity

    const updatedProduct = await wixClient.inventory.updateInventoryVariants(productId, quantity);
    console.log("Product inventory updated successfully:", updatedProduct);
  } catch (error) {
    console.error("Error updating product inventory:", error.response?.data || error.message);
  }

}


async function queryCollections() {
  const { items } = await myWixClient.collections.queryCollections().find();

  return items;
}

async function filterByName(array, name){
  return array.filter(item => item.name === name)
}

async function updateWixInventory(productId, quantity) {
  try {
    // Fetch the inventory item for the product
    const response = await myWixClient.inventory.queryInventory({
        productId: productId,
        variantId: '00000000-0000-0000-0000-000000000000'
    });

    // console.log(`${JSON.stringify(response)} I am here`);

    const inventoryItems = response.inventoryItems;

    if (!inventoryItems || inventoryItems.length === 0) {
        throw new Error('No inventory items found for the given product ID.');
    }

    // Update the inventory quantity for the first inventory item (variant)
    const inventoryItemId = inventoryItems[0].id; // Use the first inventory item (variant)

    const updatedItem = await myWixClient.inventory.updateInventoryVariants(productId, {
      variantId: '00000000-0000-0000-0000-000000000000',
      quantity: quantity
    });
    console.log("")
    console.log(`Successfully updated product ${productId} (inventory item ${inventoryItemId}) to quantity ${quantity}.`);
    return updatedItem; // Return the updated inventory item
  } catch (error) {

      console.error('Error updating product quantity:', error.response?.data || error.message);
      throw error;
  }
}

// Function to query all products in a specific collection
async function queryProductsByCollection(collectionId) {
  const response = await axiosInstance.post("/products/query", {
    filter: {
      collectionIds: [collectionId],
    },
  });

  console.log("Products:", response.data);
  return response.data;
}

module.exports = { updateWixInventory, queryProduct, updateProductInventory, queryCollections, queryInventory, queryProductsByCollection};