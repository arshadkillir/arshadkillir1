import fs from 'fs';
import path from 'path';

export const loadServices = async () => {
  const services: any = {};

  // Normalize Windows path (remove leading slash)
  const baseDir = path
    .dirname(new URL(import.meta.url).pathname)
    .replace(/^\/([A-Za-z]:)/, "$1");

  const servicesPath = path.join(baseDir, '../services');

  // Loop with for...of so we can use await
  for (const file of fs.readdirSync(servicesPath)) {
    if (!file.endsWith('.ts') && !file.endsWith('.js')) continue;

    const serviceName = file.replace('.ts', '').replace('.js', '');
    const modulePath = path.join(servicesPath, file);

    const service = await import(modulePath);
    services[serviceName] = service.default || service;
  }

  return services;
};
