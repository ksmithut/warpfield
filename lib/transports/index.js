'use strict'

const httpTransport = require('./http')
const assert = require('../utils/assert')

const transports = {
  http: httpTransport
}

module.exports = function getTransport(options) {
  options = Object.assign({
    type: 'http'
  }, options)
  return assert(
    transports[options.type],
    `${options.type} is not a valid transport`,
    ReferenceError
  )
}
