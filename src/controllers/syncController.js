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
        const lipseyInventory = await queryProducts();
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
                const lipseyQuantity = lipseyMap[wixProduct.sku];

                if (lipseyQuantity !== undefined && wixProduct.stock.quantity !== lipseyQuantity) {
                    // await updateWixInventory(wixProduct._id, lipseyQuantity);
                    updates.push({ sku: wixProduct.sku, updatedQuantity: lipseyQuantity });

                    // Save the synchronization details in the database
                    const syncLog = new SyncLog({
                        sku: wixProduct.sku,
                        updatedQuantity: lipseyQuantity,
                    });
                    await syncLog.save();
                }
            }
        }

        res.json({ message: 'Synchronization complete', updates });
    } catch (error) {
        console.error('Error during synchronization:', error.message);
        res.status(500).json({ error: 'Synchronization failed' });
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

module.exports = { syncInventory };
