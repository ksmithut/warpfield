'use strict'

const expect = require('chai').expect
const warpfield = require('../')

describe('warpfield', () => {

  it('loads a .proto file', () => {
    const proto = warpfield.loadFile(__dirname, 'fixtures', 'test.proto')
    expect(proto).to.have.deep.property('test.HelloRequest')
    expect(proto).to.have.deep.property('test.HelloResponse')
    expect(proto).to.have.deep.property('test.Greeter')
  })

  it('loads a .proto string', () => {
    const proto = warpfield.load(`
      syntax = "proto3";
      package test;

      message HelloRequest {
        string name = 1;
      }

      message HelloResponse {
        string message = 1;
      }

      service Greeter {
        rpc SayHello(HelloRequest) returns (HelloResponse);
      }
    `)
    expect(proto).to.have.deep.property('test.HelloRequest')
    expect(proto).to.have.deep.property('test.HelloResponse')
    expect(proto).to.have.deep.property('test.Greeter')
  })

  it('should create a service', () => {
    const proto = warpfield.loadFile(__dirname, 'fixtures', 'test.proto')
    const greeter = warpfield.service(proto.test.Greeter, {
      sayHello(call) { return { message: `Hello ${call.name}` } }
    })
    const input = proto.test.HelloRequest.serialize({ name: 'Jack Bliss' })
    const output = proto.test.HelloResponse.serialize({
      message: 'Hello Jack Bliss'
    })
    return expect(greeter.call('sayHello', input))
      .to.eventually.eql(output)
  })

  it('should create a client', () => {
    const proto = warpfield.loadFile(__dirname, 'fixtures', 'test.proto')
    const greeterService = warpfield.service(proto.test.Greeter, {
      sayHello(call) { return { message: `Hello ${call.name}` } }
    })
    const greeterClient = warpfield.client(proto.test.Greeter, greeterService)
    return expect(greeterClient.sayHello({ name: 'Jack Bliss' }))
      .to.eventually.eql({ message: 'Hello Jack Bliss' })
  })

  it('should create a server', () => {
    const proto = warpfield.loadFile(__dirname, 'fixtures', 'test.proto')
    const greeterService = warpfield.service(proto.test.Greeter, {
      sayHello(call) { return { message: `Hello ${call.name}` } }
    })
    const server = warpfield.server()
    const greeterClient = warpfield.client(proto.test.Greeter, {
      host: 'http://localhost:8765'
    })
    server.use(greeterService)
    return server
      .listen({ port: '8765' })
      .then(() => {
        return expect(greeterClient.sayHello({ name: 'Jack Bliss' }))
          .to.eventually.eql({ message: 'Hello Jack Bliss' })
      })
      .finally(() => server.close())
  })

})
