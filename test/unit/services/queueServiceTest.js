const expect = require('chai').expect
const assert = require('chai').assert
const sinon = require('sinon')
const proxyquire = require('proxyquire')

var awsClients
var config

beforeEach(function (){
    
    awsClients = sinon.stub()
    awsClients.dynamoDb = sinon.stub()
    awsClients.sqsClient = sinon.stub()
    awsClients.sqsClient.sendMessage = sinon.stub().callsFake(function (){
        return {
            promise: function () {
                return Promise.resolve({MessageId: "123"})
            }
        }
    })

    config = sinon.stub()
    config.SQS_MESSAGE_QUEUE_URL = "TESTURL"

    queueService = proxyquire.noCallThru().load('../../../app/services/queueService',
    {
        '../clients/awsClients': awsClients,
        '../config': config
    })
})

describe('services/queueService', function() {

    it('should post multiple items to sqs', function () {
        
        return Promise.allSettled(
            queueService.postAllItems(["TestEvent1", "TestEvent2", "TestEvent3"])
        ).then( res => {
            expect(
                res.map(item => {
                    return item.value
                })
            ).to.eql([
                {Email: "TestEvent1", MessageId: "123"},
                {Email: "TestEvent2", MessageId: "123"},
                {Email: "TestEvent3", MessageId: "123"}
            ])
            
            assert(awsClients.sqsClient.sendMessage.calledWith(
                {MessageBody: "TestEvent1", QueueUrl: "TESTURL"}
            ))
            assert(awsClients.sqsClient.sendMessage.calledWith(
                {MessageBody: "TestEvent2", QueueUrl: "TESTURL"}
            ))
            assert(awsClients.sqsClient.sendMessage.calledWith(
                {MessageBody: "TestEvent3", QueueUrl: "TESTURL"}
            ))
        })
    })
})