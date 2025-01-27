const axios = require('axios');
const WIX_API_BASE_URL = 'https://www.wixapis.com/stores/v2';
const WIX_AUTH_TOKEN = process.env.WIX_API_KEY;

const { createClient } = require("@wix/sdk");
const { products, collections, inventory } = require("@wix/stores");
const OAuthStrategy = require("@wix/sdk").OAuthStrategy;

const myWixClient = createClient({
    modules: { products, collections, inventory  },
    auth: OAuthStrategy({ clientId: '3e0af21c-448b-4c0f-9324-122e33b96358' }),
});

const axiosInstance = axios.create({
  baseURL: "https://www.wixapis.com/stores/v2",
  headers: {
    Authorization: `Bearer ${process.env.WIX_API_KEY}`,
    "Content-Type": "application/json",
  },
});


async function queryProduct() {

    const getCollections = await queryCollections();
    const filteredData = await filterByName(getCollections, "All Products");
    console.log("this is the collections total products", filteredData[0].numberOfProducts);

    let allProducts = [];
    let offset = 0;
    const limit = 100; // Number of items per page
    let totalCount = filteredData[0].numberOfProducts;

    while (true) {
        try {
            const response = await myWixClient.products.queryProducts().find({
                offset,
                limit,
            });
            
            const { items } = response;
            // totalCount = total;

            // console.log(`Fetched ${items.length} products (Offset: ${offset}). Total Count: ${totalCount}`);
            allProducts = allProducts.concat(items);

            // Break the loop if no more products are available
            if (allProducts.length >= totalCount) break;

            offset += limit; // Increment offset for the next page
        } catch (error) {
            console.error("Error fetching products:", error.message);
            throw new Error("Failed to fetch products");
        }
    }

    console.log(`Total products fetched: ${allProducts.length}`);
    return { items: allProducts, totalCount: allProducts.length };
}

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


async function queryCollections() {
  const { items } = await myWixClient.collections.queryCollections().find();

  return items;
}

async function filterByName(array, name){
  return array.filter(item => item.name === name)
}



// Update Wix inventory
async function updateWixInventory(productId, quantity) {
  const response = await axiosInstance.post(`/inventoryItems/${productId}/updateInventory`, {
    quantity,
  });
  return response.data;
}
//
async function updateProduct(id, product) {
    const response = await myWixClient.products.updateProduct(id, product);
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

module.exports = { updateWixInventory, queryProduct, queryCollections, queryInventory, queryProductsByCollection};