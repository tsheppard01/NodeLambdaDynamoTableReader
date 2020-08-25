
const AWS = require("aws-sdk")
const config = require("../../config")

function initSqs() {
    console.log("Initiaising SQS")
    if(config.IS_LOCAL) {
        return new  AWS.SQS({
            region: config.REGION,
            endpoint: config.LOCAL_SQS_ENDPOINT
        })
    }
    else {
        return new AWS.SQS({
            region: config.REGION
        })
    }
}

const sqsClient = initSqs()

exports.sendMessage = (request) => {
    return sqsClient.sendMessage(request).promise()
}