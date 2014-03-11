"use strict";

var   _ = require('lodash'),
  cabinet = require('cabinet'),
  express = require('express'),
    app = express(),
    http = require('http'),
    server = http.createServer(app),
    fs = require('fs'),
    md = require("node-markdown").Markdown,
    sio = require('socket.io').listen(server),
    port = process.env['GNDIO_PORT'] || 8000,
    mongoHost = process.env['MONGO_HOST'] || 'localhost',
    mongoose = require('mongoose'),
    redis = require('redis'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    Gnd = require('gnd');

console.log('Using: '+Gnd.lib);

app.use(cabinet(__dirname + '/public', {
  files: {
    '/lib/gnd.js': Gnd.debug,//Gnd.lib,
    '/lib/third/lodash.js': Gnd.third.underscore,
    '/lib/third/curl.js': Gnd.third.curl,
  },
}));

app.use(cabinet(Gnd.docs, {
  prefix: '/api'
}))


app.set('views', __dirname + '/views');

app.get('/', function(req, res){
  fs.readFile(Gnd.readme, {encoding: 'utf8'}, function(err, text){
    if(!err){
      res.render('index.jade', {content: md(text.toString())});
    }else{
      console.log(err);
      res.send('Error generating page, please try later on...');
    }
  });
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

//
// Define Models (redundant with chat example, TODO: refactor)
//
var MessageSchema = new Gnd.Schema({
  text: {type: String},
  ts: {type: Number}
});
var Message = Gnd.Model.extend('messages', MessageSchema);

var RoomSchema = new Gnd.Schema({
  name : {type: String},
  ts: {type: Number},
  messages: new Gnd.CollectionSchemaType(Message, 'messages'),
  url: String
});
var Room = Gnd.Model.extend('rooms', RoomSchema);

var ChatSchema = new Gnd.Schema({
  rooms: new Gnd.CollectionSchemaType(Room, 'rooms')
});
var Chat = Gnd.Model.extend('chats', ChatSchema);

var models = {
  messages: Message,
  rooms: Room,
  chats: Chat
};

// Setup mongodb
mongoose.connect('mongodb://'+mongoHost+'/gndio');


var mongooseStorage = new Gnd.Storage.MongooseStorage(mongoose, models);
var pubClient = redis.createClient(6379, "127.0.0.1"),
    subClient = redis.createClient(6379, "127.0.0.1");

var syncHub = new Gnd.Sync.Hub(pubClient, subClient, sio.sockets);
var gndServer = new Gnd.Server(mongooseStorage, new Gnd.SessionManager(), syncHub);
var socketServer = new Gnd.SocketBackend(sio.sockets, gndServer);

app.set('port', port);

server.listen(app.get('port'), function(){
  console.info('Express server listening on port ' + app.get('port'));
});
