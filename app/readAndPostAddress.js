const userService = require("./services/usersService")
const queueService = require("./services/queueService")
const lodash = require("lodash")
const { result } = require("lodash")

/**
 * Funcitons in this show a couple different ways of doing the same thing.
 * A scan of dynamo must be performed recursively as there is a max amount of
 * data that can be returned in a single call.  
 */

/**
 * Function scans all of the items in the dynamodb and then posts the each one by one.
 * The recursive call is hidden in scanAllItems
 * Returns an array of promises, one for each item posted to the queue
 */
exports.scanAllThenPost = () => {
    
    return userService.scanAllItems().then((items) => {
        return queueService.postAllItems(
            items.map( item => {
                return item.Email
            })
        )
    })
}

/**
 * Function retrieves a page of data and then posts the data for that page to 
 * the queue, then recursively calls itself to get the next page
 * @param {} lastEvaulatedKey 
 */
exports.scanAndPost = () => {

    return userService.scanNextItems().then((data) =>{

        const postItemsResult = queueService.postAllItems(
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

exports.stuff = () => {
    return this.scanAllThenPost().then(res => {
        Promise.allSettled(res).then( finishedRes => {

            const results = lodash.groupBy(finishedRes, 'status')
            
            if(results.fulfilled && results.fulfilled.length) {
                results.fulfilled.forEach( item => {
                    console.log("Successful for email: ", item.value.Email)
                })
            }

            if(results.rejected && results.rejected.length) {
                results.rejected.forEach( item => {
                    console.log("Unsuccessful for email: ", item.value.Email)
                })
            }
        })
    })
}

exports.stuffAgain = () => {
    return this.scanAndPost().then( res => {
        Promise.allSettled(res).then( finishedRes => {

            const results = lodash.groupBy(finishedRes, 'status')
            
            if(results.fulfilled && results.fulfilled.length) {
                results.fulfilled.forEach( item => {
                    console.log("Successful for email: ", item.value.Email)
                })
            }

            if(results.rejected && results.rejected.length) {
                results.rejected.forEach( item => {
                    console.log("Unsuccessful for email: ", item.value.Email)
                })
            }
        })
    })
}

exports.stuff2 = () => {
    return Promise.allSettled(
        this.scanAllThenPost()
    ).then( res => {
        console.log(res)
        console.log("Completed Processing 2")
    })
}