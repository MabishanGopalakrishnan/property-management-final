import cron from 'node-cron';
import { performStripeSync } from '../controllers/paymentController.js';

// Schedule a job every 5 minutes to reconcile Stripe payments
export default function startSyncJob() {
  cron.schedule('*/5 * * * *', async () => {
    try {
      console.log('[syncPaymentsJob] Running periodic Stripe sync...');
      const result = await performStripeSync();
      console.log('[syncPaymentsJob] Sync result:', result);
    } catch (err) {
      console.error('[syncPaymentsJob] Error during sync:', err);
    }
  });
}
