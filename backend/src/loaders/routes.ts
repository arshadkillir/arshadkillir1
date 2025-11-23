import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

export const loadRoutes = async () => {
  const router = Router();

  const baseDir = path
    .dirname(new URL(import.meta.url).pathname)
    .replace(/^\/([A-Za-z]:)/, "$1");

  const routesPath = path.join(baseDir, '../routes');

  if (!fs.existsSync(routesPath)) {
    console.warn('⚠️  No routes folder found at', routesPath);
    return router;
  }

  for (const file of fs.readdirSync(routesPath)) {
    if (!file.endsWith('.ts') && !file.endsWith('.js')) continue;
    if (file === 'index.ts' || file === 'index.js') continue;

    // Use file URL for dynamic import (ESM/CJS compatibility)
    const modulePath = path.join(routesPath, file);
    const importPath = pathToFileURL(modulePath).href;
    const routeModule = await import(importPath);

    const route = routeModule.default;
    if (typeof route !== 'function') {
      console.warn(`⚠️  Route file ${file} does not export a valid Express router`);
      continue;
    }

    const routeName = '/' + file.replace(/\.ts$|\.js$/g, '');
    router.use(routeName, route);
  }

  return router;
};
