const sqs = require("../clients/awsClients").sqsClient
const config = require("../config")

/**
 * Posts messages to a queue
 * 
 * @param {String} emailAddress 
 */
exports.postItem = (emailAddress) => {
    var sendMessageRequest = {
        QueueUrl: config.SQS_MESSAGE_QUEUE_URL,
        MessageBody: emailAddress
    }
    //console.log("Sending message to sqs queue")
    return sqs.sendMessage(sendMessageRequest).promise()
}

/**
 * Takes an array of messages to post to the queue
 * 
 * @param {} emailAddresses 
 */
exports.postAllItems = (emailAddresses) => {
    emailAddresses.forEach(emailAddress => {
        this.postItem(emailAddress).catch( (err) => {
            console.log("Caught an error: ", err)
        })
    });
}


