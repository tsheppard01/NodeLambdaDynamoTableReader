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
    }).catch(err => {
        console.log("An error occured, but I still want to process whats already been retrieved")
        console.log("Theres a chance this could be a silent failure")
        console.log("Alternative is to just rethrow (or not catch) the error, if we don't read all the table then should just start lambda again")
        return []
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
