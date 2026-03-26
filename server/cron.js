import Food from './models/Food.js';

export const startCompostCron = () => {
  // Run every 1 minute
  setInterval(async () => {
    try {
      const result = await Food.updateMany(
        {
          expiryTime: { $lt: new Date() },
          isCompostable: false
        },
        {
          $set: {
            isCompostable: true,
            status: 'Expired',
            compostStatus: 'available'
          }
        }
      );
      if (result.modifiedCount > 0) {
        console.log(`[Cron] Marked ${result.modifiedCount} expired foods as compostable.`);
      }
    } catch (error) {
      console.error('[Cron] Error updating to compostable:', error);
    }
  }, 60 * 1000); // 1 minute
};
