const handler = require('./app/handler')
const main = require('./app/readAndPostAddress')

console.log('Calling the lambda directly in a node app')

// Run the lambda locally
handler.handler(null, null)

//Or run the main function directly
//main()
 