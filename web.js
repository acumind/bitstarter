var express = require('express');
var fs = require('fs');
var app = express.createServer(express.logger());

var welcomeString = fs.readFileSync("index.html",'utf8');
app.get('/', function(request, response) {
  response.send(welcomeString.toString());
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
