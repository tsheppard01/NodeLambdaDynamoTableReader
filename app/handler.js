
console.log("Starting lambda function")
const main = require("./readAndPostAddress")

/**
 * This is the lambda request handler entry point.
 * Best practive is that this method should be as small as possible, 
 * calling on to the main processing function of the lambda, only concerned with 
 * logging and perhaps processing AWS specific input and output of the lambda.
 * This makes code more portable
 * 
 * @param {} event 
 * @param {*} context 
 */
exports.handler = (event, context) => {
    console.log("Entering the Request Handler for Example Lambda")
    console.log("Getting config for the main processing")

    return main.stuffAgain()
    // return main.stuffAgain().then( res => {
    //     console.log("Completed processing in Example Lambda, exiting")
    // })
    // main.scanAllThenPost().then(res => {
    //     Promise.allSettled(res).then( finishedRes => {
    //         console.log("Completed Processing")
    //     })
    // })
}