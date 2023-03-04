
var express = require("express");
var bodyParser = require("body-parser");

var path = require("path");


var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());



app.get('/', function(req, res, next) {
      console.log('nel root');
     
      res.send('sei nella root');
   
});
  
app.post('/v1/fulfillment', function(req, res, next) {
  
  console.log('la response');
  res.send("<p>Qui mando la risposta</p>");

});

app.listen(process.env.PORT || 3000, function() {
    console.log("App started on port 3000");
  });