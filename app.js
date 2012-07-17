var express = require('express');
var request = require('request');

var app = express.createServer();

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  request('https://raw.github.com/OptimalBits/ginger/master/Readme.md',function(error,response,body){
    if (!error && response.statusCode == 200) {
      var output = require( "markdown" ).markdown.toHTML(body)
      console.log(output);
      res.render('index.jade',{content:output, moco:'pedo'});
    }
  })
});

app.listen(3000);