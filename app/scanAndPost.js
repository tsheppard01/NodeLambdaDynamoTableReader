const scanAndPostService = require("./services/scanAndPostService")
const lodash = require("lodash")

/**
 * The main method for the lambda, think of this as a controller, calls on
 * to services to do the actual work
 */

/**
 * Scan all the items then post all the items
 */
exports.scanAllThenPost = () => {
    return scanAndPostService.scanAllThenPost().then(res => {
        return Promise.allSettled(res).then( finishedRes => {
            return handleResults(finishedRes)
        })
    })
}

/**
 * Retrieve a page of items and post them to the queue, then repeat for subsequent pages
 */
exports.scanAndPost = () => {
    return scanAndPostService.scanAndPost().then( res => {
        return Promise.allSettled(res).then( finishedRes => {
            return handleResults(finishedRes)
        })
    })
}

function handleResults(scanAndPostResults) {

    let successNum = 0
    let failNum = 0

    const results = lodash.groupBy(scanAndPostResults, 'status')
            
    if(results.fulfilled && results.fulfilled.length) {
        results.fulfilled.forEach( item => {
            console.log("Successful for email: ", item.value.Email)
        })
        successNum = results.fulfilled.length
    }

    if(results.rejected && results.rejected.length) {
        results.rejected.forEach( item => {
            console.log("Unsuccessful for email: ", item.reason.Email)
        })
        failNum = results.rejected.length
    }

    return {
        Success: successNum, 
        Fail: failNum
    }
}