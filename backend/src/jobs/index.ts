import cron from 'node-cron';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export const loadCronJobs = async () => {
  // ✅ ESM-safe __filename and __dirname
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // ✅ Read all files in this directory
  const files = fs.readdirSync(__dirname);

  for (const file of files) {
    // Skip index file itself
    if (file === 'index.ts' || file === 'index.js') continue;

    // Only load .ts or .js files
    if (!file.endsWith('.ts') && !file.endsWith('.js')) continue;

    const modulePath = path.join(__dirname, file);

    // ✅ Dynamic ESM import
    const jobModule = await import(modulePath);

    // Support both default and named exports
    const job = jobModule.default || jobModule;

    // ✅ Validate cron job structure
    if (job.schedule && job.task) {
      cron.schedule(job.schedule, job.task);
      console.log('✅ Cron job loaded:', file);
    } else {
      console.warn('⚠️ Invalid cron job file:', file);
    }
  }
};
