const express = require('express');
const { syncInventory, syncInventories } = require('../controllers/syncController');
const SyncLog = require('../models/SyncLog');

const router = express.Router();

router.post('/', syncInventory);
router.post('/sync-inventory', async (req, res) => {
    try {
        const syncResults = await syncInventories();
        // console.log("syncResults", syncResults);
        res.status(200).json({
            message: 'Inventory sync complete!',
            synced: syncResults.syncedProducts,
            notFound: syncResults.notFoundProducts,
            updated: syncResults.updatedProducts,
            unchanged: syncResults.unchangedProducts,
        });
    } catch (error) {
        console.error('Error during sync:', error);
        res.status(500).json({
            message: 'Failed to sync inventory.',
            error: error.message,
        });
    }
});

router.post('/sync-update', async (req, res) => {
    // console.log("This is the req body -->", req.body);
    try {
        const newLog = new SyncLog(req.body);
        await newLog.save();
        console.log("SyncLog -->", newLog)
        res.status(201).json({
            message: 'Sync log created successfully!',
            log: newLog,
        });
    } catch (error) {
        console.error('Error creating sync log:', error);
        res.status(500).json({
            message: 'Failed to create sync log.',
            error: error.message,
        });
    }
})

router.get('/get-synced-products', async (req, res) => {
    try {
        const syncedProducts = await SyncLog.find();
        const totalCount = await SyncLog.countDocuments();
        res.status(200).json({
            message: 'Fetched synced products successfully!',
            totalCount: totalCount,
            products: syncedProducts,
        });
    } catch (error) {
        console.error('Error fetching synced products:', error);
        res.status(500).json({
            message: 'Failed to fetch synced products.',
            error: error.message,
        });
    }
});

module.exports = router;
