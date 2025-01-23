const { queryProducts, updateWixInventory } = require('../services/wixService');
const { getLipseyInventory, getCatalogFeed } = require('../services/lipseyService');
const data = require('./data.json');
const SyncLog = require('../models/SyncLog');


/*

async function syncInventory(req, res) {
  try {
    
    const wixData = await queryProducts();
    const lipseyData = await getCatalogFeed();
  
    const unifiedLipseyData = mapLipseyToUnifiedFormat(lipseyData);
    const unifiedWixData = mapWixToUnifiedFormat(wixData.items);
  
    const updates = unifiedLipseyData.map((lipseyItem) => {
      const wixItem = unifiedWixData.find((item) => item.sku === lipseyItem.sku);
        
      if (!wixItem) {
        console.log(`Item with SKU ${lipseyItem.sku} not found in Wix data.`);
        return null;
      }
  
      const updates = {};
      if (lipseyItem.price !== wixItem.price) {
        updates.price = lipseyItem.price;
      }
      if (lipseyItem.quantity !== wixItem.quantity) {
        updates.quantity = lipseyItem.quantity;
      }
  
      return {
        sku: lipseyItem.sku,
        updates,
      };
    }).filter(Boolean);
  
    // Return the updates as the result
    res.status(200).json({
        success: true,
        updates,
    });

  } catch (error) {
    console.error('Error during synchronization:', error);
    res.status(500).json({ error: error, details: error.message });
  }
}

*/


async function syncInventory(req, res) {
    try {
        const selectedProductSkus = req.body.skus; // List of SKUs to sync

        // Fetch inventory data from both Lipsey and Wix
        const lipseyInventory = data;
        const wixInventory = await queryProducts(); 
        const wixData = wixInventory.items;

        // Create a map for quick lookup of Lipsey product quantities
        const lipseyMap = lipseyInventory.reduce((map, item) => {
            map[item.itemNo] = item.quantity;
            return map;
        }, {});

        // Iterate through Wix products and sync quantities
        const updates = [];
        for (const wixProduct of wixData) {
            if (selectedProductSkus.includes(wixProduct.sku)) {
                console.log('Syncing product:', wixProduct.sku);
                
                const lipseyQuantity = lipseyMap[wixProduct.sku];

                if (lipseyQuantity !== undefined && wixProduct.stock.quantity !== lipseyQuantity) {
                    // await updateWixInventory(wixProduct._id, lipseyQuantity);
                    updates.push({ sku: wixProduct.sku, updatedQuantity: lipseyQuantity });

                    // Save the synchronization details in the database
                    const syncLog = new SyncLog({
                        sku: wixProduct.sku,
                        updatedQuantity: lipseyQuantity,
                    });

                    let syncResp = await syncLog.save();

                    // console.log('Synced product:', syncResp);
                }
            }
        }

        res.json({ message: 'Synchronization complete', updates });
    } catch (error) {
        console.error('Error during synchronization:', error.message);
        res.status(500).json({ error: 'Synchronization failed', details: error.message });
    }
}

// Function to map Lipsey data to the unified schema
function mapLipseyToUnifiedFormat(lipseyData) {
    return lipseyData.map((item) => ({
        sku: item.itemNo,
        name: item.description1,
        price: item.price,
        quantity: item.quantity,
    }));
}

// Function to map Wix data to the unified schema
function mapWixToUnifiedFormat(wixData) {
    return wixData.map((item) => ({
        sku: item.sku,
        name: item.name,
        price: item.price,
        quantity: item.stock.quantity,
    }));
}

async function syncInventories() {
    try {
        const lipseysProducts = await getCatalogFeed();
        const wixProducts = await queryProducts();
        const wixData = wixProducts.items;

        // Ensure wixData is an array
        if (!Array.isArray(wixData)) {
            throw new Error('Wix products data is not an array');
        }

        const syncedProducts = [];
        const notFoundProducts = [];
        const updatedProducts = [];
        const unchangedProducts = [];

        for (const lipseysProduct of lipseysProducts) {
            const matchingWixProduct = wixData.find(
                (wixProduct) => wixProduct.sku === lipseysProduct.itemNo
            );

            if (matchingWixProduct) {
                const wixStock = matchingWixProduct.variants[0].stock.quantity || 0;
                const lipseysStock = lipseysProduct.quantity || 0;

                if (wixStock !== lipseysStock) {
                    // await updateWixInventory(matchingWixProduct._id, lipseysStock);
                    updatedProducts.push({
                        wixProductId: matchingWixProduct._id,
                        itemNo: lipseysProduct.itemNo,
                        previousStock: wixStock,
                        updatedStock: lipseysStock,
                    });
                } else {
                    unchangedProducts.push({
                        wixProductId: matchingWixProduct._id,
                        itemNo: lipseysProduct.itemNo,
                        stock: wixStock,
                    });
                }
                syncedProducts.push({
                    wixProductId: matchingWixProduct._id,
                    itemNo: lipseysProduct.itemNo,
                    stock: lipseysStock,
                });
            } else {
                notFoundProducts.push({
                    itemNo: lipseysProduct.itemNo,
                    description: lipseysProduct.description1,
                });
            }
        }

        return { syncedProducts, notFoundProducts, updatedProducts, unchangedProducts };
    } catch (error) {
        console.error('Error during synchronization:', error.message);
        throw new Error('Failed to sync inventory.');
    }
}


module.exports = { syncInventory, syncInventories };
