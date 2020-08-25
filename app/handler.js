
console.log("Starting lambda function")
const main = require("./scanAndPost")

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
exports.handler = async (event, context) => {
    console.log("Entering the Request Handler for Example Lambda")

    return main.scanAndPost().then(res => {
        console.log("Completed processing for Example Lambda")
    })
}