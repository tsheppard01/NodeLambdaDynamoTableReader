const scanAndPostService = require("./services/scanAndPostService")
const lodash = require("lodash")

exports.scanAllThenPost = () => {
    return scanAndPostService.scanAllThenPost().then(res => {
        return Promise.allSettled(res).then( finishedRes => {

            let successNum = 0
            let failNum = 0

            const results = lodash.groupBy(finishedRes, 'status')
            
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
        })
    })
}

exports.scanAndPost = () => {
    return scanAndPostService.scanAndPost().then( res => {
        return Promise.allSettled(res).then( finishedRes => {

            let successNum = 0
            let failNum = 0

            const results = lodash.groupBy(finishedRes, 'status')
            
            if(results.fulfilled && results.fulfilled.length) {
                results.fulfilled.forEach( item => {
                    console.log("Successful for email: ", item.value.Email)
                })
                successNum = results.fulfilled.length
            }

            if(results.rejected && results.rejected.length) {
                results.rejected.forEach( item => {
                    console.log("Unsuccessful for email: ", item.value.Email)
                })
                failNum = results.rejected.length
            }

            return {Success: successNum, Fail: failNum}
        })
    })
}