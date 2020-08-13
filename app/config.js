/**
 * This file store the config, can read from env or consul 
 */

 module.exports = {
    
    LOGGING_PATH: process.env.LOGGING_PATH || 'logs/example.log',
    LOGGING_LEVEL: process.env.LOGGING_LEVEL || 'DEBUG',

    REGION: process.env.AWS_REGION || 'local',
    IS_LOCAL: process.env.IS_LOCAL || 'true' 
 }