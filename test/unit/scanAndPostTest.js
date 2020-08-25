const expect = require('chai').expect
const assert = require('chai').assert
const sinon = require('sinon')
const proxyquire = require('proxyquire')

var scanAndPostService

beforeEach(function() {
    scanAndPostService = sinon.stub()
    scanAndPostService.scanAllThenPost = sinon.stub()
    scanAndPostService.scanAndPost = sinon.stub()

    scanAndPost = proxyquire.noCallThru().load("../../app/scanAndPost",
    {
        "./services/scanAndPostService": scanAndPostService
    })
})

const scanAndPostServiceResult = [
    Promise.resolve({MessageId: "123", Email: "abc@abc.com"}),
    Promise.resolve({MessageId: "123", Email: "abc2@abc.com"}),
    Promise.resolve({MessageId: "123", Email: "abc3@abc.com"})
]

const scanAndPostServiceRejectResult = [
    Promise.reject({MessageId: "123", Email: "abc@abc.com"}),
    Promise.resolve({MessageId: "123", Email: "abc2@abc.com"}),
    Promise.resolve({MessageId: "123", Email: "abc3@abc.com"})
]

describe("scanAndPost", function() {
    it("should return an array of Promises when scanAllThenPost called", function() {

        scanAndPostService.scanAllThenPost.resolves(scanAndPostServiceResult)
        return scanAndPost.scanAllThenPost().then(res => {
            expect(res).to.eql({Success: 3, Fail: 0})
        })
    })

    it("should return an array of Promises when scanAndPost called", function() {

        scanAndPostService.scanAndPost.resolves(scanAndPostServiceResult)
        return scanAndPost.scanAndPost().then(res => {
            expect(res).to.eql({Success: 3, Fail: 0})
        })
    })

    it("should return an array of Promises some of which are rejected when scanAllThenPost called", function() {

        scanAndPostService.scanAllThenPost.resolves(scanAndPostServiceRejectResult)
        return scanAndPost.scanAllThenPost().then(res => {
            expect(res).to.eql({Success: 2, Fail: 1})
        })
    })

})