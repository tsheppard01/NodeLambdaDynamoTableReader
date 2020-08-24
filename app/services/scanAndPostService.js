const usersClient = require("../clients/usersClient")
const queueClient = require("../clients/queueClient")

/**
 * Responsible for scanning the items from the source table and posting
 * the items to a queue.
 * 
 * Functions in this module show a couple different ways of doing the same thing.
 * A scan of dynamo must be performed recursively as there is a max amount of
 * data that can be returned in a single call.
 */


/**
 * Function scans all of the items in the source table and then posts them all.
 * Returns a Prmoise that resolves to an array of promises, one for each item 
 * posted to the queue.
 */
exports.scanAllThenPost = () => {
    
    return usersClient.scanAllItems().then((items) => {
        return queueClient.postAllItems(
            items.map( item => {
                return item.Email
            })
        )
    })
}

/**
 * Function retrieves a page of data and then posts the data for that page to 
 * the queue, then recursively calls itself to get the next page
 * Returns a Promise that resolves to an array of promises, one for each item
 * posted to the queue.
 * 
 * @param {} lastEvaulatedKey 
 */
exports.scanAndPost = () => {

    return usersClient.scanNextItems().then((data) =>{

        const postItemsResult = queueClient.postAllItems(
            data.Items.map( item => {
                return item.Email
            })
        )
        
        if(data.LastEvaluatedKey) {
            return this.scanAndPost(data.LastEvaluatedKey).then(nextData => {
                return postItemsResult.concat(nextData)
            })
        }
        else {
            return postItemsResult
        }
    })
}