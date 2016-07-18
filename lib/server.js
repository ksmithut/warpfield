'use strict'

const Promise = require('bluebird')
const getTransport = require('./transports')
const Service = require('./service')
const assert = require('./utils/assert')

class Server {

  constructor() {
    this._services = {}
    this._server = null
  }

  use(service) {
    assert(
      service instanceof Service,
      'expected service to be of type Service',
      TypeError
    )
    this._services[service.name] = service
    return this
  }

  call(serviceName, method, buffer) {
    return Promise.try(() => {
      const service = assert(
        this._services[serviceName],
        `${serviceName} is not a registered service`,
        ReferenceError
      )
      return service.call(method, buffer)
    })
  }

  listen(options) {
    const transport = getTransport(options)
    this._server = transport.createServer(options, this.call.bind(this))
    return this._server.listen()
  }

  close() {
    if (!this._server) return Promise.resolve()
    return this._server.close()
  }

}

module.exports = Server
