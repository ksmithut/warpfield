'use strict'

const fs = require('fs')
const path = require('path')
const expect = require('chai').expect
const supertest = require('supertest-as-promised')
const Server = require('./server')
const Service = require('./service')
const load = require('./load')

const FIXTURES = path.resolve(__dirname, '..', 'test', 'fixtures')

const TEST_PORT = 8765

const testProto = load.loadFile(FIXTURES, 'test.proto').test

const service = new Service(testProto.Greeter, {
  sayHello(request) {
    return { message: `Hello ${request.name}` }
  }
})

describe('Server', () => {

  it('registers and calls services', () => {
    const server = new Server()
    server.use(service)
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
    server.use(service)
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

  it('starts with https server', () => {
    const server = new Server()
    server.use(service)
    const input = testProto.HelloRequest.serialize({
      name: 'Jack Bliss'
    })
    const request = supertest(`https://localhost:${TEST_PORT}`)
    const prevEnv = process.env.NODE_TLS_REJECT_UNAUTHORIZED
    return server
      .listen({
        port: TEST_PORT,
        ssl: {
          key: fs.readFileSync(path.resolve(FIXTURES, 'key.pem')), // eslint-disable-line no-sync
          cert: fs.readFileSync(path.resolve(FIXTURES, 'cert.pem')) // eslint-disable-line no-sync
        }
      })
      .then(() => {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
        return request.post('/Greeter/sayHello')
          .set('Content-type', 'application/octet-stream')
          .send(input)
      })
      .then((res) => {
        const body = new Buffer(res.text)
        expect(testProto.HelloResponse.deserialize(body))
          .to.be.eql({ message: 'Hello Jack Bliss' })
      })
      .finally(() => {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = prevEnv
        return server.close()
      })
  })

  it('exports client options', () => {
    const server = new Server()
    server.use(service)
    return server
      .listen({
        port: TEST_PORT
      })
      .then(() => {
        return expect(server.export('foo.bar')).to.be.eql({
          type: 'http',
          host: `http://foo.bar:${TEST_PORT}`
        })
      })
      .finally(() => server.close())
  })

  it('fails to export client options if server is not listening', () => {
    const server = new Server()
    expect(() => server.export('foo.bar'))
      .to.throw('Server is not active')
  })

})
