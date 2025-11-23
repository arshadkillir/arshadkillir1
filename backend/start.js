/*
  start.js — single entrypoint that starts the server
*/
const app = require("./server");
const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Listening on ${port}`));
