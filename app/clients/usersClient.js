const dynamoDb = require("./aws/dynamoDbClient")
const config = require("../config")

/**
 * Scans all the Items recusively then returns all items
 */
exports.scanAllItems = (lastEvaulatedKey) => {

    return scanItems(lastEvaulatedKey).then( data => {
        console.log("Scaned items: ", data.Items.length)
        if(data.LastEvaluatedKey) {
            return this.scanAllItems(data.LastEvaluatedKey).then( nextData => {
                return data.Items.concat(nextData)
            })
        }
        else {
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

function scanItems(lastEvaulatedKey) {
    
    console.log("Scanning table starting at last evaulated key", lastEvaulatedKey)

    var scanRequest = {
        TableName: config.USERS_TABLE_NAME,
        ProjectionExpression: "UserId, Email",
        ExclusiveStartKey: lastEvaulatedKey
    }
        
    return dynamoDb.scan(scanRequest)
}
