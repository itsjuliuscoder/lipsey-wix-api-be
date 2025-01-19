const { getWixProducts, updateWixInventory } = require('../services/wixService');
const { getLipseyInventory } = require('../services/lipseyService');

async function syncInventory(req, res) {
  try {
    const wixProducts = await getWixProducts();
    const lipseyInventory = await getLipseyInventory();

    const syncResults = [];
    for (const wixProduct of wixProducts) {
      const matchingLipseyItem = lipseyInventory.find(
        (item) => item.sku === wixProduct.sku
      );

      if (matchingLipseyItem) {
        const updated = await updateWixInventory(
          wixProduct.id,
          matchingLipseyItem.quantity
        );
        syncResults.push({ product: wixProduct.name, updated });
      }
    }

    res.status(200).json({ message: 'Synchronization complete', syncResults });
  } catch (error) {
    console.error('Error during synchronization:', error);
    res.status(500).json({ error: 'Synchronization failed' });
  }
}

module.exports = { syncInventory };
