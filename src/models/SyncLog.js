const mongoose = require('mongoose');

const syncLogSchema = new mongoose.Schema({
    sku: { type: String, required: true },
    updatedQuantity: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('SyncLog', syncLogSchema);