'use strict'

const expect = require('chai').expect
const Client = require('./client')
const Service = require('./service')
const Server = require('./server')
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

describe('Client', () => {

  it('makes calls to local services', () => {
    const client = new Client(testProto.Greeter, service)
    return expect(client.sayHello({ name: 'Jack Bliss' }))
      .to.eventually.eql({ message: 'Hello Jack Bliss' })
  })

  it('makes calls to remote services', () => {
    const server = new Server()
    server.register(service)
    const client = new Client(testProto.Greeter, {
      host: `http://localhost:${TEST_PORT}`
    })
    return server.listen({ port: TEST_PORT })
      .then(() => {
        return expect(client.sayHello({ name: 'Jack Bliss' }))
          .to.eventually.eql({ message: 'Hello Jack Bliss' })
      })
      .finally(() => server.close())
  })

})
