const userService = require("./services/usersService")
const queueService = require("./services/queueService")

module.exports = () => {
    //scanAllThenPost()
    scanAndPost()
}

/**
 * Funcitons in this show a couple different ways of doing the same thing.
 * A scan of dynamo must be performed recursively as there is a max amount of
 * data that can be returned in a single call.  
 */

/**
 * Function scans all of the items in the dynamodb and then posts the each one by one.
 * The recursive call is hidden in scanAllItems
 */
function scanAllThenPost() {
    
    userService.scanAllItems().then( (items) => {
        items.forEach(item => {
            return queueService.postItem(item.Email).catch( (err) => {
                console.log("Caught an error: ", err)
            })
        });
    })
}

/**
 * Function retrieves a page of data and then posts the data for that page to 
 * the queue, then recursively calls itself to get the next page
 * @param {} lastEvaulatedKey 
 */
function scanAndPost(lastEvaulatedKey) {

    userService.scanNextItems().then((data) =>{
        queueService.postAllItems(data.Items.map( item => {
            return item.Email
        }))

        if(data.LastEvaluatedKey) {
            scanAndPost(data.LastEvaluatedKey)
        }
    })
}