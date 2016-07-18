'use strict'

const expect = require('chai').expect
const Service = require('./service')
const load = require('./load')

const proto = load.loadFile(__dirname, '..', 'test', 'fixtures', 'test.proto')
const handlers = {
  sayHello(request) {
    return { message: `Hello ${request.name}` }
  }
}

describe('Service', () => {

  it('initializes service with handlers', () => {
    const service = new Service(proto.test.Greeter, handlers)
    expect(service).to.have.property('handle')
    expect(service).to.have.property('call')
    expect(service).to.have.property('name', 'Greeter')
  })

  it('allows addition of methods after initialization', () => {
    const service = new Service(proto.test.Greeter)
    service.handle('sayHello', handlers.sayHello)
  })

  it('fails if protobufService is not passed', () => {
    expect(() => new Service()).to
      .throw(TypeError, 'expected protobufService, got undefined')
  })

  it('fails .handle if method does not exist on service', () => {
    const service = new Service(proto.test.Greeter)
    expect(() => service.handle('sayHelloo', handlers.sayHello)).to
      .throw(ReferenceError, 'sayHelloo is not defined on the service Greeter')
  })

  it('calls service method', () => {
    const service = new Service(proto.test.Greeter, handlers)
    const sayHello = proto.test.Greeter.methods.sayHello
    const requestBuffer = sayHello.request.serialize({ name: 'Jack Bliss' })

    return service.call('sayHello', requestBuffer).then((response) => {
      expect(sayHello.response.deserialize(response)).to.be.eql({
        message: 'Hello Jack Bliss'
      })
    })
  })

  it('fails to call if method is not handled', () => {
    const service = new Service(proto.test.Greeter)
    return expect(service.call('sayHello')).to.eventually.be
      .rejectedWith('sayHello is not handled on the service Greeter')
  })

  it('catches top level errors', () => {
    const service = new Service(proto.test.Greeter)
    const sayHello = proto.test.Greeter.methods.sayHello
    const requestBuffer = sayHello.request.serialize({ name: 'Jack Bliss' })
    service.handle('sayHello', () => { throw new Error('test') })
    return expect(service.call('sayHello', requestBuffer))
      .to.eventually.be.rejectedWith('test')
  })

  it('supports promises', () => {
    const service = new Service(proto.test.Greeter)
    const sayHello = proto.test.Greeter.methods.sayHello
    const requestBuffer = sayHello.request.serialize({ name: 'Jack Bliss' })
    service.handle('sayHello', () => Promise.resolve({ message: 'Foobar' }))
    return service.call('sayHello', requestBuffer).then((response) => {
      expect(sayHello.response.deserialize(response)).to.be.eql({
        message: 'Foobar'
      })
    })
  })

})
