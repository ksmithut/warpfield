'use strict'

const expect = require('chai').expect
const supertest = require('supertest-as-promised')
const Server = require('./server')
const Service = require('./service')
const load = require('./load')

const TEST_PORT = 8765

const testProto = load.loadFile(
  __dirname, '..', 'test', 'fixtures', 'test.proto'
).test

const service = new Service(testProto.Greeter, {
  sayHello(request) {
    return { message: `Hello ${request.name}` }
  }
})

describe('Server', () => {

  it('registers and calls services', () => {
    const server = new Server()
    server.register(service)
    const input = testProto.HelloRequest.serialize({
      name: 'Jack Bliss'
    })
    return server.call('Greeter', 'sayHello', input)
      .then((output) => {
        expect(testProto.HelloResponse.deserialize(output))
          .to.be.eql({ message: 'Hello Jack Bliss' })
      })
  })

  it('starts a server', () => {
    const server = new Server()
    server.register(service)
    const input = testProto.HelloRequest.serialize({
      name: 'Jack Bliss'
    })
    const request = supertest(`http://localhost:${TEST_PORT}`)
    return server.listen({ port: TEST_PORT })
      .then(() => {
        return request.post('/Greeter/sayHello')
          .set('Content-Type', 'application/octet-stream')
          .send(input)
      })
      .then((res) => {
        const body = new Buffer(res.text)
        expect(testProto.HelloResponse.deserialize(body))
          .to.be.eql({ message: 'Hello Jack Bliss' })
      })
      .finally(() => server.close())
  })

  it('still resolves promise when .close is called when no server', () => {
    const server = new Server()
    return server.close().then(() => ({}))
  })

  it('starts with https server')

})
