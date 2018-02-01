/*package Imports*/
var express = require('express');
var app = express();
var bodyParser = require('body-parser');

/*file Imports*/
var awsModule = require('./aws-module');

/*Default*/
console.log("index.js || App started!");

/*Creating default queue first*/
awsModule.createIfNotExists()
    .then(data => {
        console.log("index.js || createQueue Response:", data);
    })
    .catch(err => {
        console.log("index.js || createQueue Error:", err);
    });

/*Express body parse*/
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/*Routes and Functions*/
app.post('/createMessage', function(req, res) {
    console.log("***Starts***");
    if (!req.body.hasOwnProperty('message')) {
        console.log("index.js || createMessage Error: message parameter is empty");
        res.send({ errorMessage: 'message is empty' });
    } else
        awsModule.createMessage(req.body.message)
        .then(data => {
            console.log("index.js || createMessage Response:", data);
            res.send(data);
            console.log("***Ends***");
        })
        .catch(err => {
            console.log("index.js || createMessage Error:", err);
            res.send(err);
            console.log("***Ends***");
        });
});

app.get('/receiveMessage', function(req, res) {
    console.log("***Starts***");
    awsModule.receiveMessage(req.body.message)
        .then(data => {
            console.log("index.js || receiveMessage Response:", data);
            res.send(data);
            console.log("***Ends***");
        })
        .catch(err => {
            console.log("index.js || receiveMessage Error:", err);
            res.send(err);
            console.log("***Ends***");
        });
});

app.get('/receiveAllMessages', function(req, res) {
    console.log("***Starts***");
    awsModule.receiveAllMessages(req.body.message)
        .then(data => {
            console.log("index.js || receiveMessage Response:", data);
            res.send(data);
            console.log("***Ends***");
        })
        .catch(err => {
            console.log("index.js || receiveMessage Error:", err);
            res.send(err);
            console.log("***Ends***");
        });
});

/*Express Server*/
var server = app.listen(1337, function() {
    var host = server.address().address;
    var port = server.address().port;

    console.log('index.js || sns-sqs listening at http://%s:%s', host, port);
});