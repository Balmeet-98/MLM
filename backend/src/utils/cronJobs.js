const cron = require('node-cron');
const { creditMonthlyRankIncome } = require('../services/incomeService');
const { checkMissedInstallments } = require('../services/installmentService');

const startCronJobs = () => {
  // 1st of every month at midnight — credit rank-based monthly income
  cron.schedule('0 0 1 * *', async () => {
    console.log('[CRON] Running monthly rank income credit...');
    try {
      await creditMonthlyRankIncome();
    } catch (err) {
      console.error('[CRON] Monthly rank income error:', err.message);
    }
  });

  // 11th of every month at midnight — check missed installments (due date is 10th)
  cron.schedule('0 0 11 * *', async () => {
    console.log('[CRON] Checking missed installments...');
    try {
      await checkMissedInstallments();
    } catch (err) {
      console.error('[CRON] Missed installment check error:', err.message);
    }
  });

  console.log('[CRON] Cron jobs scheduled: monthly-income (1st) + installment-check (11th)');
};

module.exports = { startCronJobs };
