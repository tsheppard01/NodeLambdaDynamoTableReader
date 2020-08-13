const AWS = require("aws-sdk")
const config = require("../config")

function initDynamoDb() {
    console.log("Initialising DynamoDB")
    if(config.IS_LOCAL) {
        return new AWS.DynamoDB.DocumentClient({
            region: config.REGION,
            endpoint: 'http://localhost:8000'
        })
    }
    else {
        return new AWS.DynamoDB.DocumentClient({
            region: config.REGION
        })
    }
}

function initSqs() {
    console.log("Initiaising SQS")
    if(config.IS_LOCAL) {
        return new  AWS.SQS({
            region: config.REGION,
            endpoint: 'http://localhost:9324'
        })
    }
    else {
        return new AWS.SQS({
            region: config.REGION
        })
    }
}

exports.dynamoDb = initDynamoDb()

exports.sqsClient = initSqs()