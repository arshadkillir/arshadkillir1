import EventEmitter from 'events';

export const appEvents = new EventEmitter();

// Example listener
appEvents.on('user:created', (user) => {
  console.log('Event received: user created', user);
});
