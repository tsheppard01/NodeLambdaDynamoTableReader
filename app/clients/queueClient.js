const sqsClient = require("./aws/sqsClient")
const config = require("../config")

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
        }).catch( err => {
            console.log(`Encountered an error while posting item ${emailAddress} to sqs: `, err)
            return Promise.reject({MessageId: undefined, Email: emailAddress})
        })
    })
}

function postItem(emailAddress) {
    var sendMessageRequest = {
        QueueUrl: config.SQS_MESSAGE_QUEUE_URL,
        MessageBody: emailAddress
    }
    return sqsClient.sendMessage(sendMessageRequest)
}


