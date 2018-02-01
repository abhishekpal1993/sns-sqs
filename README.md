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
## Express API

| Path | Method | Body
| :----|:----|:----|
| `/sns/createMessage`   | post | { message : _"text"_ } |
| `/sqs/createMessage`   | post | { message : _"text"_ } |
| `/sqs/receiveMessage`   | get | |
| `/sqs/receiveAllMessages`   | get | |
