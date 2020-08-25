# README
Simple app to show how to read a table of items from dynamoDB and post them to SQS

  

## Running Locally

Can get this up and running locally for testing using docker and node

### Setting local env with docker

Docker-compose is set up with a local DynamoDB, local SQS instance.

```
cd ./docker
docker-compose up -d
```
I usually start up docker-compose to run in the background (`-d`) and view the container logs using Kitematic.

### Populating the local DynamoDB  

To create and populate the table in DynamoDB you must have a local aws profile called `[local_testing_1]` configured.  Easiest way to set this up is to run the command:

 `aws configure local_testing_1` 
 
 This will run through a little wizard, the access key id and secret access key an be set to anything, set the region to local and output to json.

Run the table create and populate scripts

`./createTable.sh`

`./populateTable.sh`

  
 ### Running the Application
To run the application you need to use this testing AWS Profile.  The environment variable `AWS_PROFILE` should be set to the profile name.  The quickest way to run is to use this command:

`AWS_PROFILE=local_testing_1 node localRun.js`

## Things needed to get running on AWS
This hasn't been run on AWS so far, just locally.  To get running on AWS the following things needs to be done:

- create the DynamoDB table

- create the SQS queue

- create IAM with permissions to read from dynamo table, permissions to read/write from the SQS


## Code Hints
The entry point for the lambda is the `handler.js` file.  This module should export a function 

`exports.handler = async (event, context) => {}`

Best practice is to not have any business logic in this file, you should only perform tasks that are specific to AWS Lambdas, eg parsing input or output parameters, or any logging associated with lambda startup/shutdown.  This function should call on to a function in another module where the business logic lives.  This allows for portable testable code.

I think there are a few options you could use to run the lambda locally.  The most basic option I've described above is running directly using node:
 - call onto the handler function directly, passing in any event as necessary
 - call directly on to the secondary module where the business logic lives, although this may not be possible in every situation

With either of these methods you could create a script in package.json to do this for you.  There are also other methods available such as using SAM local.