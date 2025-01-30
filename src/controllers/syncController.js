const { queryProduct, updateWixInventory, updateProductInventory } = require('../services/wixService');
const { getLipseyInventory, getCatalogFeed } = require('../services/lipseyService');
const data = require('./data.json');
const SyncLog = require('../models/SyncLog');



async function syncInventory(req, res) {
    try {
        const selectedProductSkus = req.body.skus; // List of SKUs to sync

        // Fetch inventory data from both Lipsey and Wix
        const lipseyInventory = await getCatalogFeed();
        const wixInventory = await queryProduct(); 
        const wixData = wixInventory.items;

        // Create a map for quick lookup of Lipsey product quantities
        const lipseyMap = lipseyInventory.reduce((map, item) => {
            map[item.itemNo] = item.quantity;
            return map;
        }, {});

        // Iterate through Wix products and sync quantities
        const syncedProducts = [];
        const updatedProducts = [];
        const unchangedProducts = [];

        for (const wixProduct of wixData) {
            if (selectedProductSkus.includes(wixProduct.sku)) {
                console.log('Syncing product:', wixProduct.sku);
                
                const lipseyQuantity = lipseyMap[wixProduct.sku];

                if (lipseyQuantity !== undefined) {
                    if (wixProduct.stock.quantity !== lipseyQuantity) {
                        // await updateWixInventory(wixProduct._id, lipseyQuantity);
                        updatedProducts.push({ sku: wixProduct.sku, updatedQuantity: lipseyQuantity });

                        // Save the synchronization details in the database
                        const syncLog = new SyncLog({
                            sku: wixProduct.sku,
                            updatedQuantity: lipseyQuantity,
                        });

                        await syncLog.save();
                    } else {
                        unchangedProducts.push({ sku: wixProduct.sku, quantity: wixProduct.stock.quantity });
                    }
                    syncedProducts.push({ sku: wixProduct.sku, quantity: lipseyQuantity });
                }
            }
        }

        res.json({ message: 'Synchronization completed', syncedProducts, updatedProducts, unchangedProducts });
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
        const lipseysProducts =  await getCatalogFeed();
        const wixProducts = await queryProduct();
        const wixData = wixProducts._items;

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
                console.log(wixStock, "wix product quantity", lipseysStock, "lipseys quantity")
                if (wixStock !== lipseysStock) {

                    const payload = {
                        sku: matchingWixProduct.sku,
                        productName: matchingWixProduct.name,
                        productId: matchingWixProduct._id,
                        previousQuantity: wixStock, 
                        updatedQuantity: lipseysStock
                    }

                    await updateProductInventory(matchingWixProduct._id, lipseysStock);
                    const newLog = new SyncLog(payload);
                    await newLog.save();
                    console.log("SyncLog -->", newLog)
                    updatedProducts.push({
                        productName: matchingWixProduct.name,
                        wixProductId: matchingWixProduct._id,
                        manufacturerModelNo: lipseysProduct.manufacturerModelNo,
                        previousStock: wixStock,
                        updatedStock: lipseysStock,
                    });
                } else {
                    unchangedProducts.push({
                        productName: matchingWixProduct.name,
                        wixProductId: matchingWixProduct._id,
                        itemNo: lipseysProduct.itemNo,
                        stock: wixStock,
                    });
                }
                syncedProducts.push({
                    productName: matchingWixProduct.name,
                    wixProductId: matchingWixProduct._id,
                    manufacturerModelNo: lipseysProduct.manufacturerModelNo,
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
