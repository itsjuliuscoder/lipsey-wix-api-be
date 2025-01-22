const { queryProducts, updateWixInventory } = require('../services/wixService');
const { getLipseyInventory, getCatalogFeed } = require('../services/lipseyService');

async function syncInventory(req, res) {
  try {
    
    const wixData = await queryProducts();
    const lipseyData = await getCatalogFeed();
  
    const unifiedLipseyData = mapLipseyToUnifiedFormat(lipseyData);
    const unifiedWixData = mapWixToUnifiedFormat(wixData);
  
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
