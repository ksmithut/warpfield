'use strict'

const Promise = require('bluebird')
const restify = require('restify')
const Service = require('./service')
const assert = require('./utils/assert')

class Server {

  constructor(options) {
    this._app = restify.createServer(options)
    this._services = {}
    this._app.post('/:service/:method', (req, res, next) => {
      const service = req.params.service
      const method = req.params.method
      this.call(service, method, req.body)
        .then((data) => res.send(data))
        .catch(next)
    })
  }

  register(service) {
    assert(
      service instanceof Service,
      'expected service to be of type Service',
      TypeError
    )
    this._services[service.name] = service
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

  start(port) {
    return new Promise((resolve, reject) => {
      this._app.listen(port, resolve)
        .on('error', reject)
    })
  }

  stop() {
    return Promise.fromCallback((cb) => this._app.close(cb))
  }

}

module.exports = Server
