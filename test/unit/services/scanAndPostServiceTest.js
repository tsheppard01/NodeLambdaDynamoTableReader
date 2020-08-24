const expect = require('chai').expect
const assert = require('chai').assert
const sinon = require('sinon')
const proxyquire = require('proxyquire')

var readAndPostAddress
var queueClient
var usersClient

beforeEach(function() {
    queueClient = sinon.stub()
    usersClient = sinon.stub()
    queueClient.postItem = sinon.stub()
    queueClient.postAllItems = sinon.stub()
    usersClient.scanAllItems = sinon.stub()
    usersClient.scanNextItems = sinon.stub()

    readAndPostAddress = proxyquire.noCallThru().load("../../../app/services/scanAndPostService",
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
    new Promise((resolve, reject) => {
        resolve({MessageId: "123", Email: "abc@abc.com"})
    }),
    new Promise((resolve, reject) => {
        resolve({MessageId: "123", Email: "abc2@abc.com"})
    }),
    new Promise((resolve, reject) => {
        resolve({MessageId: "123", Email: "abc3@abc.com"})
    }),
]

const resolvedAllItemsResult = [
    {MessageId: "123", Email: "abc@abc.com"},
    {MessageId: "123", Email: "abc2@abc.com"},
    {MessageId: "123", Email: "abc3@abc.com"}
]

describe('services/scanAndPostService', function() {

    it('should read users and post emails to queue', function() {
        
        usersClient.scanAllItems.resolves(users)
        queueClient.postAllItems.returns(postAllItemsResult)

        return readAndPostAddress.scanAllThenPost().then(res => {
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
        
        return readAndPostAddress.scanAndPost().then(res => {
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
})