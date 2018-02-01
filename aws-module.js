/*package Imports*/
var aws = require('aws-sdk');

/*Default*/
console.log("aws-module.js || custom module imported!");

/*Create sqs & sns parameter*/
aws.config.loadFromPath(__dirname + '/config.json');
var sqs = new aws.SQS();
var sns = new aws.SNS();

/*Variables*/
var queueUrl = "";
var topicArn = "";
var queueArn = "";

/*Module Exports*/
module.exports = {
    createIfNotExists: function() {
        console.log("aws-module.js || createIfNotExists called!");
        let promises = [];
        return new Promise(function(resolve, reject) {
            /*create sqs queue*/
            promises.push(
                new Promise(function(fulfill, reject) {
                    sqs.createQueue({ QueueName: 'sns-sqs-queue' }, function(err, data) {
                        if (err)
                            reject(err);
                        else {
                            queueUrl = data.QueueUrl;
                            console.log("queueUrl:", data);
                            fulfill(data);
                        }
                    });
                })
            );
            /*create sns queue*/
            promises.push(
                new Promise(function(fulfill, reject) {
                    sns.createTopic({ 'Name': 'sns-sqs-topic' }, function(err, data) {
                        if (err)
                            reject(err);
                        else {
                            topicArn = data.TopicArn;
                            console.log("topicArn:", data);
                            fulfill(data);
                        }
                    });
                })
            );
            Promise.all(promises).then(function(values) {
                /*getting the queueARN*/
                getQueueAttr(queueUrl, ['QueueArn']).then(data => {
                    console.log("QueueArn:", data);
                    queueArn = data.Attributes.QueueArn;
                    sns.subscribe({
                        'TopicArn': topicArn,
                        'Protocol': 'sqs',
                        'Endpoint': queueArn
                    }, function(err, result) {
                        console.log(result);
                        if (err) {
                            console.log(err);
                        } else {
                            /*setting the policy SQS:SendMessage*/
                            let attributes = {
                                "Version": "2012-10-17",
                                "Id": "SQSDefaultPolicy",
                                "Statement": [{
                                    "Sid": "AllowPESends",
                                    "Effect": "Allow",
                                    "Principal": {
                                        "AWS": "*"
                                    },
                                    "Action": "SQS:SendMessage",
                                    "Resource": queueArn,
                                    "Condition": {
                                        "ArnEquals": {
                                            "aws:SourceArn": topicArn
                                        }
                                    }
                                }]
                            };
                            sqs.setQueueAttributes({
                                QueueUrl: queueUrl,
                                Attributes: {
                                    'Policy': JSON.stringify(attributes)
                                }
                            }, function(err, data) {
                                if (err) {
                                    console.log(err);
                                    reject("Policy Assigning Failed!");
                                }
                                console.log(data);
                                resolve(values);
                            });
                        }
                    });
                });
            });
        });
    },

    sqsCreateMessage: function(message) {
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

    sqsReceiveMessage: function() {
        console.log("aws-module.js || sqsReceiveMessage called!");
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

    sqsReceiveAllMessages: function() {
        console.log("aws-module.js || sqsReceiveAllMessages called!");
        let list = [];
        let promises = [];
        return new Promise(function(fulfill, reject) {
            getQueueAttr(queueUrl, ['All']).then(data => {
                console.log("ApproximateNumberOfMessages:", data);
                for (let i = 0; i < data.Attributes.ApproximateNumberOfMessages; i++) {
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
                    fulfill(list);
                });
            });
        });
    },

    snsPublishMessage: function(message) {
        console.log("aws-module.js || snsPublishMessage called!");
        let params = {
            TopicArn: topicArn,
            Message: message
        };
        return new Promise(function(fulfill, reject) {
            sns.publish(params, function(err, data) {
                fulfill(data);
            });
        });
    }

};


/*Helper Functions*/

function getQueueAttr(queueUrlParam, attributeNames) {
    console.log("aws-module.js || getQueueAttr called!");
    let params = {
        QueueUrl: queueUrlParam,
        AttributeNames: attributeNames
    };

    return new Promise(function(fulfill, reject) {
        sqs.getQueueAttributes(params, function(err, data) {
            if (err)
                reject(err);
            else {
                fulfill(data);
            }
        });
    });
}

function receiveOneMessage(queueUrlParam) {
    console.log("aws-module.js || receiveMessage called!");
    let params = {
        QueueUrl: queueUrlParam,
        MaxNumberOfMessages: 1,
        VisibilityTimeout: 1
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