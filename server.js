// server.js
// where your node app starts

//TODO: [✔] sorting
//TODO: [ ] authentication using auth0
//TODO: enable moderation actions for admin users when logged in
//TODO:      [ ] delete post    [ ] ban user   [ ] pause all submissions
 

// init project
var express = require('express');
var app = express();
var azure = require('azure-storage');

var multer  = require('multer');
var upload = multer();
var bodyParser = require('body-parser');
var Guid = require('guid');
var moment = require('moment');
var _ = require('underscore')

// var table = new azure.Table({
//   accountId:    process.env.AZURE_STORAGE_ACCOUNT,
//   accessKey:    process.env.AZURE_STORAGE_ACCESS_KEY
// });

var tableService = azure.createTableService();
tableService.createTableIfNotExists('messages', function(error, result, response) {
  if (!error) {
   console.log('✔ connected to azure table')
  }
});

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get("/messages", function (req, res) {
  var query = new azure.TableQuery()
  .top(100)
  .where('PartitionKey eq ?', moment().format('YYYY-MM-DD'));
 
tableService.queryEntities('messages', query, null, function(error, result, response) {
  if (!error) {
    console.log("✔ retreived ")// + JSON.stringify(result.entries));
    var list = result.entries.map(function(obj) {
      
      return {
        id: obj.RowKey._,
        text: obj.text._,
        name: obj.name._,
        side: obj.side ? obj.side._ : '',
        timestamp: obj.Timestamp._
      }
    })
    list = _.sortBy(list, function(o){
      return o.timestamp;
    });
    res.send(list);
    // result.entries contains entities matching the query
  }
});
  
  
});

// could also use the POST body instead of query string: http://expressjs.com/en/api.html#req.body
app.post("/messages", upload.array(), function (req, res) {
  
  if (req.body.message) {
    var entGen = azure.TableUtilities.entityGenerator;
    var entity = {
      PartitionKey: entGen.String(moment().format('YYYY-MM-DD')),
      RowKey: entGen.String(Guid.raw()),
      text: entGen.String(req.body.message.text),
      name: entGen.String(req.body.message.name),
      side: entGen.String(req.body.message.side)
    };
    tableService.insertEntity('messages', entity, function(error, result, response) {
      if (!error) {
        console.log("✔ posted: " + JSON.stringify(entity));
        // result contains the ETag for the new entity
        res.sendStatus(200);
      }
    });
    
    
    //messages.push(request.body.message);
    
  }
});


// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});