var express = require('express'),
  request = require('request'),
  md = require("node-markdown").Markdown,
  app = express.createServer(),
  port = process.argv[2] || 8000;

app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/views');

app.get('/', function(req, res){
  request('https://raw.github.com/OptimalBits/ginger/ts/Readme.md', function(error, response, body){
    if (!error && response.statusCode == 200) {
      res.render('index.jade', {content:md(body)});
    }else{
      res.send('Error generating page, please try later on...');
    }
  })
});

app.get('/demos/list', function(req,res) {
  res.render('demos/list.jade');
})

app.get('/demos/routes', function(req,res) {
  res.render('demos/routes.jade');
})

app.listen(port);
console.log("Started web server in port %s", port);
