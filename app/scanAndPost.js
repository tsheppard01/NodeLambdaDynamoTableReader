const scanAndPostService = require("./services/scanAndPostService")
const lodash = require("lodash")

exports.scanAllThenPost = () => {
    return scanAndPostService.scanAllThenPost().then(res => {
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

exports.scanAndPost = () => {
    return scanAndPostService.scanAndPost().then( res => {
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