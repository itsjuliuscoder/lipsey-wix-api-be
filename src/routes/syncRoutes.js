const express = require('express');
const { syncInventory, syncInventories } = require('../controllers/syncController');

const router = express.Router();

router.post('/', syncInventory);
router.post('/sync-inventory', async (req, res) => {
    try {
        const syncResults = await syncInventories();
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

module.exports = router;
