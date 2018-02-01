/*package Imports*/
var express = require('express');
var app = express();
var bodyParser = require('body-parser');

/*file Imports*/
var awsModule = require('./aws-module');

/*Default*/
console.log("index.js || App started!");

/*Express body parse*/
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/*Routes and Functions*/
app.post('/sns/createMessage', function(req, res) {
    console.log("***Starts***");
    if (!req.body.hasOwnProperty('message')) {
        console.log("index.js || createMessage Error: message parameter is empty");
        res.send({ errorMessage: 'message is empty' });
    } else
        awsModule.snsPublishMessage(req.body.message)
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

app.post('/sqs/createMessage', function(req, res) {
    console.log("***Starts***");
    if (!req.body.hasOwnProperty('message')) {
        console.log("index.js || createMessage Error: message parameter is empty");
        res.send({ errorMessage: 'message is empty' });
    } else
        awsModule.sqsCreateMessage(req.body.message)
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

app.get('/sqs/receiveMessage', function(req, res) {
    console.log("***Starts***");
    awsModule.sqsReceiveMessage(req.body.message)
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

app.get('/sqs/receiveAllMessages', function(req, res) {
    console.log("***Starts***");
    awsModule.sqsReceiveAllMessages(req.body.message)
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


/*Creating default queue first*/
awsModule.createIfNotExists()
    .then(data => {
        console.log("index.js || createQueue Response:", data);
        if (data[0].hasOwnProperty('QueueUrl') && data[1].hasOwnProperty('TopicArn'))
            /*Express Server*/
            var server = app.listen(1337, function() {
                var host = server.address().address;
                var port = server.address().port;
                console.log('index.js || express started');
                console.log('index.js || sns-sqs listening at http://%s:%s', host, port);
            });
    })
    .catch(err => {
        console.log("index.js || createQueue Error:", err);
    });