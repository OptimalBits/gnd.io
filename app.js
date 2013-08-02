"use strict";

var _ = require('underscore');
var Gnd = require('gnd');
var cabinet = require('cabinet');

var express = require('express'),
    fs = require('fs'),
    md = require("node-markdown").Markdown,
    app = express.createServer(),
    sio = require('socket.io').listen(app),
    port = process.env['GNDIO_PORT'] || 8000,
    mongoHost = process.env['MONGO_HOST'] || 'localhost',
    mongoose = require('mongoose'),
    redis = require('redis'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

//app.use(express.static(__dirname + '/public'));

console.log('Using: '+Gnd.lib);

app.use(cabinet(__dirname + '/public', {
  files: {
    '/lib/gnd.js': Gnd.debug,//Gnd.lib,
    '/lib/third/underscore.js': Gnd.third.underscore,
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
      res.render('index.jade', {content:md(text.toString())});
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

var models = {
  messages: mongoose.model('Message', Message),
  rooms: mongoose.model('Room', Room),
  chats: mongoose.model('Chat', Chat)
};

// Setup mongodb
mongoose.connect('mongodb://'+mongoHost+'/gndio');

var mongooseStorage = new Gnd.Storage.MongooseStorage(models, mongoose, true);
var pubClient = redis.createClient(6379, "127.0.0.1"),
    subClient = redis.createClient(6379, "127.0.0.1");

var syncHub = new Gnd.Sync.Hub(pubClient, subClient, sio.sockets);
var gndServer = new Gnd.Server(mongooseStorage, new Gnd.SessionManager(), syncHub);
var socketServer = new Gnd.SocketBackend(sio.sockets, gndServer);

app.listen(port);
console.log("Started test server at port: %d in %s mode", app.address().port, app.settings.env);




