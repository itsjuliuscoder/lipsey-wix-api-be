require('dotenv').config();
const axios = require('axios');
// Load environment variables
const API_KEY = process.env.WIX_API_KEY_THREE;
const SITE_ID = process.env.WIX_SITE_ID;

// Define the API endpoint
const PRODUCTS_API_URL = "https://www.wixapis.com/stores/v1/products/query";


const { createClient, ApiKeyStrategy, OAuthStrategy } = require("@wix/sdk");
const { products, collections, inventory } = require("@wix/stores");

// const wixClient = createClient({
//     auth: OAuthStrategy({
//       clientId: '3e0af21c-448b-4c0f-9324-122e33b96358',
//       tokens: {
//         accessToken: ACCESS_TOKEN,
//         refreshToken: REFRESH_TOKEN
//       },
//       siteId: SITE_ID,
//     }),
//     modules: { products, inventory }
// });

// Create a client instance using the API Key
const myWixClient = createClient({
  auth: ApiKeyStrategy({
    apiKey: API_KEY,
    siteId: SITE_ID,
    // accountId: ACCOUNT_ID,
  }),
  modules: {
    products,
    inventory
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
    const response = await myWixClient.products
    .queryProducts().descending('lastUpdated')
    .limit(100)
    .find();
    
    return response;
  } catch (error) {
    // console.error("Error fetching products:", error.response?.data || error.message);
    console.log("error response", error)
  }
}


async function updateProductInventory(productId, quantity) {
  const url = `https://www.wixapis.com/stores/v2/inventoryItems/product/${productId}`;
  console.log(`This is the Withdrawal --> ${url} & Product Id ${productId}`)
  const headers = {
    'Authorization': API_KEY,
    'wix-site-id': SITE_ID,
    'Content-Type': 'application/json'
  };

  const data = {
    inventoryItem: {
      trackQuantity: true,
      variants: [
        {
          variantId: '00000000-0000-0000-0000-000000000000',
          quantity: quantity
        }
      ]
    }
  };

  const payload = JSON.stringify(data);

  console.log(`This is the request data ${payload}`);

  try {
    const response = await axios.patch(url, payload, { headers });
    //console.log('Inventory updated successfully:', response);
    return response.data;
  } catch (error) {
    console.error('Error updating inventory:', error.response ? error.response.data : error.message);
    throw error;
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