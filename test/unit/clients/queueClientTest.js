const expect = require('chai').expect
const assert = require('chai').assert
const sinon = require('sinon')
const proxyquire = require('proxyquire')
const lodash = require('lodash')

var sqsClient
var config

beforeEach(function (){
    
    sqsClient = sinon.stub()
    sqsClient.sendMessage = sinon.stub()

    config = sinon.stub()
    config.SQS_MESSAGE_QUEUE_URL = "TESTURL"

    queueService = proxyquire.noCallThru().load('../../../app/clients/queueClient',
    {
        './aws/sqsClient': sqsClient,
        '../config': config
    })
})

describe('clients/queueClient', function() {

    it('should post multiple items to sqs', function () {

        sqsClient.sendMessage.resolves({MessageId: "123"})

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
            
            assert(sqsClient.sendMessage.calledWith(
                {MessageBody: "TestEvent1", QueueUrl: "TESTURL"}
            ))
            assert(sqsClient.sendMessage.calledWith(
                {MessageBody: "TestEvent2", QueueUrl: "TESTURL"}
            ))
            assert(sqsClient.sendMessage.calledWith(
                {MessageBody: "TestEvent3", QueueUrl: "TESTURL"}
            ))
        })
    })

    it('should handle when one post failed', function () {

        sqsClient.sendMessage.onFirstCall().resolves({MessageId: "123"})
        sqsClient.sendMessage.onSecondCall().rejects("Something happened")
        sqsClient.sendMessage.onThirdCall().resolves({MessageId: "1234"})

        return Promise.allSettled(
            queueService.postAllItems(["TestEvent1", "TestEvent2", "TestEvent3"])
        ).then(res => {
            const results = lodash.groupBy(res, 'status')
            expect(
                results.fulfilled.map(item => {
                    return item.value
                })
            ).to.eql([
                {Email: "TestEvent1", MessageId: "123"},
                {Email: "TestEvent3", MessageId: "1234"}
            ])
            expect(
                results.rejected.map(item => {
                    return item.reason
                })
            ).to.eql([{Email: "TestEvent2", MessageId: undefined}])
            
            assert(sqsClient.sendMessage.calledWith(
                {MessageBody: "TestEvent1", QueueUrl: "TESTURL"}
            ))
            assert(sqsClient.sendMessage.calledWith(
                {MessageBody: "TestEvent2", QueueUrl: "TESTURL"}
            ))
            assert(sqsClient.sendMessage.calledWith(
                {MessageBody: "TestEvent3", QueueUrl: "TESTURL"}
            ))
        })

    })
})