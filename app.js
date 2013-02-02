//require('require-typescript');

// @see http://nodejs.org/api/all.html#all_require_extensions
var fs = require('fs')
  , exec = require('child_process').exec
  , uuid = require('node-uuid')
  , fs = require('fs')
  , execSync = require('execSync');

// typescript doesn't export any public interface, we need to spawn a
// process
// @todo: do I need to take care of caching or is this done at a higher level??
// @todo: cache compiled files and don't recompile them if source didn't
//        change (last modified date comparison)
require.extensions['.ts'] = function(module, filename) {
  var out = 'require-typescript-' + uuid.v1() + '.js'
  var cmd = __dirname + '/node_modules/.bin/tsc --out ' + out + ' ' + filename;
  execSync.stdout(cmd);
  var content = fs.readFileSync(out, 'utf8');
  execSync.stdout('rm ' + out);
  return module._compile(content, filename);
};


//
_ = require('underscore');

var Gnd = require('./public/lib/ground/gnd-server.ts');

var express = require('express'),
  request = require('request'),
  md = require("node-markdown").Markdown,
  app = express.createServer(),
  sio = require('socket.io').listen(app),
  port = process.env['GNDIO_PORT'] || 8000,
  mongoHost = process.env['MONGO_HOST'] || 'localhost';

  mongoose = require('mongoose'),
  redis = require('redis'),
  Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;

app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/views');

app.get('/', function(req, res){
  request('https://raw.github.com/OptimalBits/ground/ts/Readme.md', function(error, response, body){
    if (!error && response.statusCode == 200) {
      res.render('index.jade', {content:md(body)});
    }else{
      console.log(error);
      console.log(response);
      res.send('Error generating page, please try later on...');
    }
  })
});

app.get('/demos/table', function(req,res) {
  res.render('demos/table.jade',{ pretty: true });
})

app.get('/demos/list', function(req,res) {
  res.render('demos/list.jade',{ pretty: true });
})

app.get('/demos/route', function(req,res) {
  res.render('demos/routes.jade');
})

app.get('/demos/chat', function(req,res) {
  res.render('demos/chat/index.jade',{ pretty: true });
})
/* api still not working
app.get('/api/',function(req,res){
  res.render('api/index.jade');
})*/
// Setup a mongo DB. This is used by the chat example
var Message = new Schema({
  _cid: {type: String},
  text: {type: String},
  ts: {type: Number}
});

var Room = new Schema({
  _cid: {type: String},
  name : {type: String},
  url: {type: String},
  ts: {type: Number},
  messages :  [{type: Schema.ObjectId, ref: 'Message'}]
});

var Chat = new Schema({
  _cid: {type: String},
  rooms :  [{type: Schema.ObjectId, ref: 'Room'}]
});

Chat.statics.add = Room.statics.add = function(id, setName, itemIds, cb){
  var update = {$addToSet: {}};
  update.$addToSet[setName] = {$each:itemIds};
  this.update({_id:id}, update, cb);
};

var models = {
  messages: mongoose.model('Message', Message),
  rooms: mongoose.model('Room', Room),
  chats: mongoose.model('Chat', Chat)
};

// Setup mongodb
mongoose.connect('mongodb://'+mongoHost+'/exDB', function(){
  // mongoose.connection.db.executeDbCommand( {dropDatabase:1}, function(err, result) {
  //   console.log(result);
  //   mongoose.disconnect(function(){
  //     mongoose.connect('mongodb://localhost/exDB');
  
      app.listen(port);
      console.log("Started test server at port: %d in %s mode", app.address().port, app.settings.env);
  //   });
  // });
});

var mongooseStorage = new Gnd.MongooseStorage(models);
var pubClient = redis.createClient(6379, "127.0.0.1"),
    subClient = redis.createClient(6379, "127.0.0.1");

var syncHub = new Gnd.Sync.SyncHub(pubClient, subClient, sio.sockets);
var gndServer = new Gnd.Server(mongooseStorage, syncHub);
var socketServer = new Gnd.SocketBackend(sio.sockets, gndServer);