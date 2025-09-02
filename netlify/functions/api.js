const serverless = require('serverless-http');
const { app, ensureDbConnection } = require('../../app');

let cachedHandler;

exports.handler = async (event, context) => {
  if (!cachedHandler) {
    await ensureDbConnection();
    cachedHandler = serverless(app);
  }
  return cachedHandler(event, context);
};


