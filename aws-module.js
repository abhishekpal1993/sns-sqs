/*package Imports*/
var aws = require('aws-sdk');

/*Default*/
console.log("aws-module.js || custom module imported!");

/*Create sqs parameter*/
aws.config.loadFromPath(__dirname + '/config.json');
var sqs = new aws.SQS();

/*Variables*/
var queueUrl = "";

/*Module Exports*/
module.exports = {
    createIfNotExists: function() {
        console.log("aws-module.js || createIfNotExists called!");
        return new Promise(function(fulfill, reject) {
            sqs.createQueue({ QueueName: "sns-sqs-queue" }, function(err, data) {
                if (err)
                    reject(err);
                else {
                    queueUrl = data.QueueUrl;
                    fulfill(data);
                }
            });
        });
    },

    createMessage: function(message) {
        console.log("aws-module.js || createMessage called!");
        let params = {
            MessageBody: message,
            QueueUrl: queueUrl,
            DelaySeconds: 0
        };

        return new Promise(function(fulfill, reject) {
            sqs.sendMessage(params, function(err, data) {
                if (err)
                    reject(err);
                else {
                    fulfill(data);
                }
            });
        });
    },

    receiveMessage: function() {
        return receiveOneMessage(queueUrl).then(data => {
            if (data.hasOwnProperty('Messages'))
                data.Messages.forEach(function(element) {
                    deleteOneMessage(queueUrl, element.ReceiptHandle);
                });
            return data;
        }).catch(err => {
            return err;
        });
    },

    receiveAllMessages: function() {
        let list = [];
        let promises = [];
        return new Promise(function(fulfill, reject) {
            getQueueAttr(queueUrl).then(data => {
                console.log("ApproximateNumberOfMessages:", data);
                for (let i = 0; i < data; i++) {
                    let promise = receiveOneMessage(queueUrl).then(data1 => {
                        if (data1.hasOwnProperty('Messages')) {
                            data1.Messages.forEach(function(element) {
                                deleteOneMessage(queueUrl, element.ReceiptHandle);
                            });
                            list.push(data1);
                        }
                    }).catch(err => {
                        console.log("aws-module.js || receiveAllMessages Error:", err);
                    });
                    promises.push(promise);
                }
                Promise.all(promises).then(function(values) {
                    console.log("promises:", JSON.stringify(promises));
                    console.log("List:", list);
                    fulfill(list);
                });
            });
        });
    }

};


/*Helper Functions*/

function getQueueAttr(queueUrlParam) {
    console.log("aws-module.js || getQueueAttr called!");
    let params = {
        QueueUrl: queueUrlParam,
        AttributeNames: ['All']
    };

    return new Promise(function(fulfill, reject) {
        sqs.getQueueAttributes(params, function(err, data) {
            if (err)
                reject(err);
            else {
                fulfill(data.Attributes.ApproximateNumberOfMessages);
            }
        });
    });
}

function receiveOneMessage(queueUrlParam) {
    console.log("aws-module.js || receiveMessage called!");
    let params = {
        QueueUrl: queueUrlParam,
        MaxNumberOfMessages: 1,
        VisibilityTimeout: 0
    };

    return new Promise(function(fulfill, reject) {
        sqs.receiveMessage(params, function(err, data) {
            if (err)
                reject(err);
            else {
                fulfill(data);
            }
        });
    });
};

function deleteOneMessage(queueUrlParam, receipt) {
    console.log("aws-module.js || deleteOneMessage called!");
    let params = {
        QueueUrl: queueUrlParam,
        ReceiptHandle: receipt
    };

    return new Promise(function(fulfill, reject) {
        sqs.deleteMessage(params, function(err, data) {
            if (err)
                reject(err);
            else {
                fulfill(data);
            }
        });
    });
};