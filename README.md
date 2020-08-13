#README
Simple app to show how to read a table of items from dynamoDB and post them to SQS

##Running Locally
###Setting local env with docker
Docker-compose is set up with a local DynamoDB, local SQS instance 
`cd ./docker
docker-compose up -d`

To create and populate the table in DynamoDB you must have a local aws profile called [local_testing_1] configured, use `aws configure local_testing_1` to set this up, the secret and password can be anything, set location to local and output to json

Run the table create and populate script
`./createTable.sh`
`./populateTable.sh`


Then to run the application you need to use this testing AWS Profile, the easiest way to do that is using this command:
`AWS_PROFILE=local_testing_1 node localRun.js`

This hasn't been run on AWS