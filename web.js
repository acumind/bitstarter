var express = require('express');

var app = express.createServer(express.logger());

var welcomeString = fs.readFileSync("index.html",'r');
app.get('/', function(request, response) {
  response.send('<<<*>>> Welcome To Avair <<<*>>>' + "   " + welcomeString);
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
