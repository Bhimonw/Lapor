const { NODE_ENV } = process.env;

// Import the appropriate database configuration based on environment
let dbConfig;

switch (NODE_ENV) {
  case 'production':
    dbConfig = require('./database.production');
    break;
  case 'development':
    dbConfig = require('./database.development');
    break;
  case 'test':
    dbConfig = require('./database.development'); // Use development config for tests
    break;
  default:
    dbConfig = require('./database'); // Fallback to general config
    break;
}

module.exports = dbConfig;