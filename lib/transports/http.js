'use strict'

const http = require('http')
const https = require('https')
const Promise = require('bluebird')
const express = require('express')
const bodyParser = require('body-parser')
const request = require('request-promise')
const assert = require('../utils/assert')

function createServer(options, callService) {
  options = Object.assign({
    port: null,
    parserOptions: null,
    ssl: null
  }, options)
  assert(options.port, 'port is required', ReferenceError)

  const app = express()
  const server = options.ssl
    ? https.createServer(options.ssl, app)
    : http.createServer(app)

  app.use(bodyParser.raw(options.parserOptions))
  app.post('/:service/:method', (req, res, next) => {
    const service = req.params.service
    const method = req.params.method
    callService(service, method, req.body)
      .then((data) => res.send(data))
      .catch(next)
  })

  return {
    listen() {
      return new Promise((resolve, reject) => {
        server.listen(options.port, resolve)
          .on('error', reject)
      })
    },
    close() {
      return Promise.fromCallback((cb) => server.close(cb))
    }
  }
}

function createClient(options) {
  const agent = request.defaults({
    baseUrl: options.host,
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream'
    }
  })
  return (serviceName, method, data) => {
    return agent({
      uri: `/${serviceName}/${method}`,
      body: data
    }).then((output) => new Buffer(output))
  }
}

exports.createServer = createServer
exports.createClient = createClient
