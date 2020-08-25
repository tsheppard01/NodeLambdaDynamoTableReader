const expect = require('chai').expect
const assert = require('chai').assert
const sinon = require('sinon')
const proxyquire = require('proxyquire')
const lodash = require('lodash')

var scanAndPost
var queueClient
var usersClient

beforeEach(function() {
    queueClient = sinon.stub()
    usersClient = sinon.stub()
    queueClient.postItem = sinon.stub()
    queueClient.postAllItems = sinon.stub()
    usersClient.scanAllItems = sinon.stub()
    usersClient.scanNextItems = sinon.stub()

    scanAndPost = proxyquire.noCallThru().load("../../../app/services/scanAndPostService",
    {
        "../clients/usersClient": usersClient,
        "../clients/queueClient": queueClient
    })
})

const users = [
    { 
        UserId: "1",
        Email: "abc@abc.com"
    },
    {
        UserId: "2",
        Email: "abc2@abc.com"
    }
]

const postAllItemsResult = [
    Promise.resolve({MessageId: "123", Email: "abc@abc.com"}),
    Promise.resolve({MessageId: "123", Email: "abc2@abc.com"}),
    Promise.resolve({MessageId: "123", Email: "abc3@abc.com"})
]

const resolvedAllItemsResult = [
    {MessageId: "123", Email: "abc@abc.com"},
    {MessageId: "123", Email: "abc2@abc.com"},
    {MessageId: "123", Email: "abc3@abc.com"}
]

const postAllItemsRejectResult = [
    Promise.resolve({MessageId: "123", Email: "abc@abc.com"}),
    Promise.reject({MessageId: "123", Email: "abc2@abc.com"}),
    Promise.resolve({MessageId: "123", Email: "abc3@abc.com"})
]

describe('services/scanAndPostService', function() {

    it('should read users and post emails to queue', function() {
        
        usersClient.scanAllItems.resolves(users)
        queueClient.postAllItems.returns(postAllItemsResult)

        return scanAndPost.scanAllThenPost().then(res => {
            return Promise.all(res).then( collatedRes => {
                expect(usersClient.scanAllItems.callCount).to.eql(1)
                expect(queueClient.postAllItems.callCount, 1)
                expect(collatedRes).to.eql(resolvedAllItemsResult)
            })
        })
    })

    it('should post items per scan page to queue', function() {

        usersClient.scanNextItems.onFirstCall().resolves({Items: users, LastEvaluatedKey: "lastKey"})
        usersClient.scanNextItems.onSecondCall().resolves({Items: users, LastEvaluatedKey: "lastSecondKey"})
        usersClient.scanNextItems.onThirdCall().resolves({Items: users})
        queueClient.postAllItems.returns(postAllItemsResult)
        
        return scanAndPost.scanAndPost().then(res => {
            return Promise.all(res).then( collatedRes => {
                expect(usersClient.scanNextItems.callCount).to.eql(3)
                expect(queueClient.postAllItems.callCount).to.eql(3)
                expect(collatedRes).to.eql(
                    resolvedAllItemsResult
                    .concat(resolvedAllItemsResult)
                    .concat(resolvedAllItemsResult)
                )
            })
        })
    })

    it('should handle error in postAllItems, all other posts should be unaffected', function() {
        usersClient.scanNextItems.onFirstCall().resolves({Items: users, LastEvaluatedKey: "lastKey"})
        usersClient.scanNextItems.onSecondCall().resolves({Items: users, LastEvaluatedKey: "lastSecondKey"})
        usersClient.scanNextItems.onThirdCall().resolves({Items: users})
        queueClient.postAllItems.onFirstCall().returns(postAllItemsResult)
        queueClient.postAllItems.onSecondCall().returns(postAllItemsResult)
        queueClient.postAllItems.onThirdCall().returns(postAllItemsRejectResult)
        
        return scanAndPost.scanAndPost().then(res => {
            return Promise.allSettled(res).then( collatedRes => {
                expect(usersClient.scanNextItems.callCount).to.eql(3)
                expect(queueClient.postAllItems.callCount).to.eql(3)

                const results = lodash.groupBy(collatedRes, 'status')
                expect(
                    results.fulfilled.map(item => {
                        return item.value
                    })
                ).to.eql(
                    resolvedAllItemsResult
                    .concat(resolvedAllItemsResult)
                    .concat([
                        {MessageId: "123", Email: "abc@abc.com"},
                        {MessageId: "123", Email: "abc3@abc.com"}
                    ])
                )

                expect(
                    results.rejected.map(item => {
                        return item.reason
                    })
                ).to.eql([
                    {MessageId: "123", Email: "abc2@abc.com"}
                ])
            })
        })
    })

    it('should only process 1 batch when the second scan fails', function () {
        usersClient.scanNextItems.onFirstCall().resolves({Items: users, LastEvaluatedKey: "lastKey"})
        usersClient.scanNextItems.onSecondCall().rejects("Something happened")
        queueClient.postAllItems.returns(postAllItemsResult)

        return scanAndPost.scanAndPost().then( res => {
            return Promise.allSettled(res).then( collatedRes => {
                const results = lodash.groupBy(collatedRes, 'status')
                expect(usersClient.scanNextItems.callCount).to.eql(2)
                expect(queueClient.postAllItems.callCount).to.eql(1)
                expect(
                    results.fulfilled.map(item => {
                        return item.value
                    })
                ).to.eql(resolvedAllItemsResult)
            })
            
        })
    })

    it('should handle to first failure of a scan', function () {
        usersClient.scanNextItems.onFirstCall().rejects("Something happened")
        queueClient.postAllItems.returns(postAllItemsResult)

        return scanAndPost.scanAndPost().catch( err => {
            expect(usersClient.scanNextItems.callCount).to.eql(1)
            expect(queueClient.postAllItems.callCount).to.eql(0)
        })
    })
})