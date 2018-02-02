# sns-sqs
Express Project to test AWS SNS-SQS Service
***
## Setup
***Run following commands in order:***
```
# git clone https://github.com/abhishekpal123/sns-sqs.git
# cd sns-sqs
# npm install
# cp config-sample.json config.json
```
***NOTE: Here you will want to edit config.json with your AWS keys.***

**To Run the Server:**
```
node index.js
```
***
## Working

Launching the application does following operations for you as part of AWS Setup:
```
# creates SQS Queue with name "sns-sqs-queue"
# creates SNS Topic with name "sns-sqs-topic" 
# Adds SNS Subscription to SQS
# Creates a Policy to allow SendMessage from SNS to SQS
````
***
## Server REST API List

| Path | Method | Body | Description |
| :----|:----|:----|:-----|
| `localhost:1337/sns/createMessage`   | post | { message : _"text"_ } | Publishes a message in topic - "sns-sqs-topic" |
| `localhost:1337/sqs/createMessage`   | post | { message : _"text"_ } | Sends a message to SQS queue - "sns-sqs-queue" |
| `localhost:1337/sqs/receiveMessage`   | get | | Receive One Message from SQS Queue |
| `localhost:1337/sqs/receiveAllMessages`   | get | | Receive all Messages from SQS Queue as an Array |
