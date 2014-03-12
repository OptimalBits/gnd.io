
var $ = require('sconf');

var env = process.env;

module.exports = {
  port: $('APP_PORT', 8000),
  
  redis: $('REDIS_PORT', 'tcp://127.0.0.1:6379'),
  
  mongo: $('MONGODB_URI', 'mongodb://localhost/gndio'),
  
  cookie: $('COOKIE', 'gnd-cookie'),
  mode: $('NODE_ENV', 'development'),
}

