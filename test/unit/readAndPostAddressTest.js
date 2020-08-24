const expect = require('chai').expect
const assert = require('chai').assert
const sinon = require('sinon')
const proxyquire = require('proxyquire')

var readAndPostAddress
var queueService
var userService

beforeEach(function() {
    queueService = sinon.stub()
    userService = sinon.stub()
    queueService.postItem = sinon.stub()
    queueService.postAllItems = sinon.stub()
    userService.scanAllItems = sinon.stub()
    userService.scanNextItems = sinon.stub()

    readAndPostAddress = proxyquire.noCallThru().load("../../app/readAndPostAddress",
    {
        "./services/usersService": userService,
        "./services/queueService": queueService
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

describe('readAndPostAddress', function() {

    it('should read users and post emails to queue', function() {
        
        userService.scanAllItems.resolves(users)
        queueService.postAllItems.returns(postAllItemsResult)

        return readAndPostAddress.scanAllThenPost().then(res => {
            return Promise.all(res).then( collatedRes => {
                expect(userService.scanAllItems.callCount).to.eql(1)
                expect(queueService.postAllItems.callCount, 1)
                expect(collatedRes).to.eql(resolvedAllItemsResult)
            })
        })
    })

    it('should post items per scan page to queue', function() {

        userService.scanNextItems.onFirstCall().resolves({Items: users, LastEvaluatedKey: "lastKey"})
        userService.scanNextItems.onSecondCall().resolves({Items: users, LastEvaluatedKey: "lastSecondKey"})
        userService.scanNextItems.onThirdCall().resolves({Items: users})
        queueService.postAllItems.returns(postAllItemsResult)
        
        return readAndPostAddress.scanAndPost().then(res => {
            return Promise.all(res).then( collatedRes => {
                expect(userService.scanNextItems.callCount).to.eql(3)
                expect(queueService.postAllItems.callCount).to.eql(3)
                expect(collatedRes).to.eql(
                    resolvedAllItemsResult
                    .concat(resolvedAllItemsResult)
                    .concat(resolvedAllItemsResult)
                )
            })
        })
    })
})