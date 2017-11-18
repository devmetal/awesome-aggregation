const path = require('path');
const fexists = require('file-exists');
const convict = require('convict');

const config = convict({
  env: {
    doc: 'Application environment',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV',
  },
  rabbit: {
    host: {
      default: 'localhost:5672',
      env: 'REDIS_HOST',
    },
    user: {
      default: 'guest',
      env: 'REDIS_USER',
    },
    pass: {
      default: 'guest',
      env: 'REDIS_USER',
    },
    aggregationQueue: {
      default: 'aggregation',
      env: 'AGGREGATION_QUEUE',
    },
  },
  mongo: {
    uri: {
      default: 'mongodb://localhost:27017/awesome-db',
      env: 'MONGO_URI',
    },
  },
  aggregation: {
  },
});

const env = config.get('env');
const configFile = path.join(__dirname, `${env}.json`);

if (fexists.sync(configFile)) {
  config.loadFile(configFile);
}

module.exports = config;
