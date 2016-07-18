'use strict'

const http = require('http')
const Promise = require('bluebird')
const express = require('express')
const bodyParser = require('body-parser')
const Service = require('./service')
const assert = require('./utils/assert')

class Server {

  constructor() {
    this._services = {}
    const app = express()
    app.use(bodyParser.raw())
    app.post('/:service/:method', (req, res, next) => {
      const service = req.params.service
      const method = req.params.method
      this.call(service, method, req.body)
        .then((data) => res.send(data))
        .catch(next)
    })
    this._app = app
    this._server = http.createServer(app)
  }

  register(service) {
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

  listen(port) {
    return new Promise((resolve, reject) => {
      this._server.listen(port, resolve)
        .on('error', reject)
    })
  }

  close() {
    return Promise.fromCallback((cb) => this._server.close(cb))
  }

}

module.exports = Server
