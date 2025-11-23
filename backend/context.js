const { AsyncLocalStorage } = require('async_hooks');

// This creates a shared context store that can be accessed anywhere in the application.
const asyncLocalStorage = new AsyncLocalStorage();
module.exports = asyncLocalStorage;