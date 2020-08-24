const sqsClient = require("./awsClients").sqsClient
const config = require("../config")
const { reject } = require("bluebird")

/**
 * Takes an array of messages to post to the queue
 * Returns an Array of Promises that resolve to the MessageId, Email
 *
 * @param {} emailAddresses 
 */
exports.postAllItems = (emailAddresses) => {
    return emailAddresses.map(emailAddress => {
        return postItem(emailAddress).then( res => {
            return { MessageId: res.MessageId, Email: emailAddress}
        })
    })
}

function postItem(emailAddress) {
    var sendMessageRequest = {
        QueueUrl: config.SQS_MESSAGE_QUEUE_URL,
        MessageBody: emailAddress
    }
    //console.log("Sending message to sqs queue")
    return sqsClient.sendMessage(sendMessageRequest).promise()
}


