var express = require('express'),
  request = require('request'),
  md = require( "markdown" ),
  app = express.createServer();

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  request('https://raw.github.com/OptimalBits/ginger/master/Readme.md', function(error, response, body){
    if (!error && response.statusCode == 200) {
      res.render('index.jade',{content:md.markdown.toHTML(body)});
    }
  })
});

app.listen(process.argv[2] || 3000);
