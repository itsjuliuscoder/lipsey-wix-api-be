const mongoose = require('mongoose');

const syncLogSchema = new mongoose.Schema({
    sku: { type: String, required: true },
    productName: { type: String, required: true },
    productId: { type: String, required: true },
    previousQuantity: { type: String, required: true }, 
    updatedQuantity: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('SyncLog', syncLogSchema);