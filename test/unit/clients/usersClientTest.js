const expect = require("chai").expect
const assert = require("chai").assert
const sinon = require("sinon")
const proxyquire = require("proxyquire")

var usersService
var awsClients
var config

beforeEach(function() {
    awsClients = sinon.stub()
    awsClients.dynamoDb = sinon.stub()

    config = sinon.stub()
    config.USERS_TABLE_NAME = "TESTTABLE"

    awsClients.dynamoDb.scan = sinon.stub()
    awsClients.dynamoDb.scan.onFirstCall().callsFake(function (){
        return {
            promise: function () {
                return Promise.resolve({Items: ["123", "456", "789"], LastEvaluatedKey: "lastKey"})
            }
        }
    })
    awsClients.dynamoDb.scan.onSecondCall().callsFake(function (){
        return {
            promise: function () {
                return Promise.resolve({Items: ["321", "654", "987"], LastEvaluatedKey: "lastSecondKey"})
            }
        }
    })
    awsClients.dynamoDb.scan.onThirdCall().callsFake(function (){
        return {
            promise: function () {
                return Promise.resolve({Items: ["231", "564", "897"]})
            }
        }
    })

    usersService = proxyquire.noCallThru().load("../../../app/clients/usersClient", 
    {
        './awsClients': awsClients,
        '../config': config
    })
})

describe("clients/usersClient", function() {
    
    it("should scan the next items in table", function() {

        return usersService.scanNextItems("LastKeyEvaulated").then(res => {
            assert(awsClients.dynamoDb.scan.called)
            expect(res).to.eql({Items: ["123", "456", "789"], LastEvaluatedKey: "lastKey"})
        })
    })

    it("should scan all items in the table recursively", function() {

        return usersService.scanAllItems().then( res => {
            expect(awsClients.dynamoDb.scan.callCount).to.eql(3)
            assert(awsClients.dynamoDb.scan.calledWith({
                TableName: "TESTTABLE",
                ProjectionExpression: "UserId, Email",
                ExclusiveStartKey: undefined
            }))
            assert(awsClients.dynamoDb.scan.calledWith({
                TableName: "TESTTABLE",
                ProjectionExpression: "UserId, Email",
                ExclusiveStartKey: "lastKey"
            }))
            assert(awsClients.dynamoDb.scan.calledWith({
                TableName: "TESTTABLE",
                ProjectionExpression: "UserId, Email",
                ExclusiveStartKey: "lastSecondKey"
            }))

            expect(res).to.eql(["123", "456", "789", "321", "654", "987", "231", "564", "897"])
        })
    })

    it("should scan all items in the table when there is only a single page of results", function() {

        awsClients.dynamoDb.scan.onFirstCall().callsFake(function (){
            return {
                promise: function () {
                    return Promise.resolve({Items: ["123", "456", "789"]})
                }
            }
        })

        return usersService.scanAllItems().then( res => {
            expect(awsClients.dynamoDb.scan.callCount).to.eql(1)
            expect(res).to.eql(["123", "456", "789"])
        })

    })
})