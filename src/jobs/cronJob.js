const cron = require('node-cron');
const axios = require('axios');

// Schedule the cron job to run every 30 minutes
cron.schedule('*/30 * * * *', async () => {
  try {
    console.log('Running cron job to sync inventory...');
    const response = await axios.get('https://lipsey-wix-api-be.onrender.com/api/sync/sync-inventory');
    console.log('Inventory sync response:', response.data);
  } catch (error) {
    console.error('Error syncing inventory:', error.message);
  }
});

console.log('Cron job scheduled to run every 30 minutes.');