const expect = require("chai").expect
const assert = require("chai").assert
const sinon = require("sinon")
const proxyquire = require("proxyquire")

var usersClient
var dynamoDbClient
var config

beforeEach(function() {
    dynamoDbClient = sinon.stub()
    dynamoDbClient.scan = sinon.stub()

    config = sinon.stub()
    config.USERS_TABLE_NAME = "TESTTABLE"

    dynamoDbClient.scan.onFirstCall().resolves({Items: ["123", "456", "789"], LastEvaluatedKey: "lastKey"})
    dynamoDbClient.scan.onSecondCall().resolves({Items: ["321", "654", "987"], LastEvaluatedKey: "lastSecondKey"})
    dynamoDbClient.scan.onThirdCall().resolves({Items: ["231", "564", "897"]})


    usersClient = proxyquire.noCallThru().load("../../../app/clients/usersClient", 
    {
        './aws/dynamoDbClient': dynamoDbClient,
        '../config': config
    })
})

describe("clients/usersClient", function() {
    
    it("should scan the next items in table", function() {

        return usersClient.scanNextItems("LastKeyEvaulated").then(res => {
            assert(dynamoDbClient.scan.called)
            expect(res).to.eql({Items: ["123", "456", "789"], LastEvaluatedKey: "lastKey"})
        })
    })

    it("should scan all items in the table recursively", function() {

        return usersClient.scanAllItems().then( res => {
            expect(dynamoDbClient.scan.callCount).to.eql(3)
            assert(dynamoDbClient.scan.calledWith({
                TableName: "TESTTABLE",
                ProjectionExpression: "UserId, Email",
                ExclusiveStartKey: undefined
            }))
            assert(dynamoDbClient.scan.calledWith({
                TableName: "TESTTABLE",
                ProjectionExpression: "UserId, Email",
                ExclusiveStartKey: "lastKey"
            }))
            assert(dynamoDbClient.scan.calledWith({
                TableName: "TESTTABLE",
                ProjectionExpression: "UserId, Email",
                ExclusiveStartKey: "lastSecondKey"
            }))

            expect(res).to.eql(["123", "456", "789", "321", "654", "987", "231", "564", "897"])
        })
    })

    it("should scan all items in the table when there is only a single page of results", function() {
        dynamoDbClient.scan.onFirstCall().resolves({Items: ["123", "456", "789"]})
        return usersClient.scanAllItems().then( res => {
            expect(dynamoDbClient.scan.callCount).to.eql(1)
            expect(res).to.eql(["123", "456", "789"])
        })
    })
})