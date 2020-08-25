const AWS = require("aws-sdk")
const config = require("../../config")

function initDynamoDb() {
    console.log("Initialising DynamoDB")
    if(config.IS_LOCAL) {
        return new AWS.DynamoDB.DocumentClient({
            region: config.REGION,
            endpoint: config.LOCAL_DYNAMO_ENDPOINT
        })
    }
    else {
        return new AWS.DynamoDB.DocumentClient({
            region: config.REGION
        })
    }
}


const dynamoDb = initDynamoDb()

exports.scan = (scanRequest) => {
    return dynamoDb.scan(scanRequest).promise()
}

