const dynamoDB = require("../clients/awsClients").dynamoDb

/**
 * Scans all the Items recusively then returns all items
 */
exports.scanAllItems = () => {

    return scanItems().then( (data, err) => {
        if(data.LastEvaluatedKey) {
            return data.Items.concat(this.scanItems(data.LastEvaluatedKey))
        }
        else {
            console.log("Scaned items: ", data.Items.length)
            return data.Items
        }
    })
}

/**
 * Scans the next page of Items
 * 
 * @param {String} lastEvaulatedKey 
 */
exports.scanNextItems = (lastEvaulatedKey) => {
    return scanItems(lastEvaulatedKey)
}

/**
 * Reads a single item from dynamo
 */
exports.getItem = () => {
    var getRequest = {
        TableName: "users",
        Key: {
            "UserId": 1
        }
    }

    console.log("running get")
    return dynamoDB.get(getRequest).promise()
}

function scanItems(lastEvaulatedKey) {
    
    console.log("Scanning table starting at last evaulated key", lastEvaulatedKey)

    var scanRequest = {
        TableName: "users",
        ProjectionExpression: "UserId, Email",
        ExpressionAttributeNameMap: {
            "UserId": "userId",
            "Email": "emailAddress"
        },
        ExclusiveStartKey: lastEvaulatedKey
    }
    
    return dynamoDB.scan(scanRequest).promise()
}
