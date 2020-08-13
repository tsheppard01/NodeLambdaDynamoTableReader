/**
 * This file store the config, can read from env or consul 
 */

 module.exports = {
    
    LOGGING_PATH: process.env.LOGGING_PATH || 'logs/example.log',
    LOGGING_LEVEL: process.env.LOGGING_LEVEL || 'DEBUG',

    REGION: process.env.AWS_REGION || 'local',
    IS_LOCAL: process.env.IS_LOCAL || 'true',

    LOCAL_DYNAMO_ENDPOINT: process.env.DYNAMO_ENDPOINT || 'http://localhost:8000',
    LOCAL_SQS_ENDPOINT: process.env.SQS_ENDPOINT || 'http://localhost:9324',
    SQS_MESSAGE_QUEUE_URL: process.env.SQS_MESSAGE_QUEUE_URL || "http://localhost:9324/queue/service-queue"
 }