'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
const dns = require('dns');
const Schema = mongoose.Schema;
var cors = require('cors');
var app = express();
var bodyParser = require('body-parser');
const AutoIncrement = require('mongoose-sequence')(mongoose);




// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/
// mongoose.connect(process.env.DB_URI);

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
require('dotenv').config();

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

const urlSchema = new Schema({

  url: String,

});

urlSchema.plugin(AutoIncrement, { inc_field: 'short_url' });
const URL = mongoose.model('Url', urlSchema);

mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true });


app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});


// your first API endpoint... 
app.post("/api/shorturl/new", function (req, res) {

  let { url } = req.body;
  url = url.split('//');
  url = url.length == 1 ? url = url[0] : url = url[1];

  dns.lookup(url, (err) => {
    if (err) return res.send({ error: "Invalid URL" });

    let newURL = new URL({ url: url, short_url: 0 });

    newURL.save((err, data) => {
      if (err) console.log(err);

      res.json({ orginal_url: newURL.url, short_url: newURL.short_url });

    })
  });
});




app.get('/api/shorturl/:id', (req, res) => {
  let id = req.params.id;

  URL.findOne({ 'short_url': id }, (err, data) => {
    if (data) {
     return res.json({ orginal_url: data.url, short_url: data.short_url });
    }

    return res.json({error:'Invalid URL'});

  });
});

app.listen(port, function () {
  console.log('Node.js listening on port: ' + port);
});
