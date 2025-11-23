export const schedule = '*/5 * * * * *'; // every 5 seconds

export const task = () => {
  console.log('Example cron job running at', new Date().toISOString());
};
