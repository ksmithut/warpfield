'use strict'

const Promise = require('bluebird')
const request = require('request-promise')
const Service = require('./service')
const load = require('./load')
const assert = require('./utils/assert')

class Client {

  constructor(serviceLocation, protobufService) {
    assert(
      protobufService && protobufService.type === load.TYPES.SERVICE,
      `expected protobufService, got ${protobufService}`,
      TypeError
    )
    this._service = protobufService
    this._request = createRequest(serviceLocation, this._service)
    Object.keys(protobufService.methods).forEach((methodName) => {
      this[methodName] = this._call.bind(this, methodName)
    })
  }

  _call(methodName, data) {
    return Promise.try(() => {
      const method = assert(
        this._service.methods[methodName],
        `${methodName} is not a method for ${this._service.name}`,
        ReferenceError
      )
      const input = method.request.serialize(data)
      return this._request(methodName, input)
        .then(method.response.deserialize)
    })
  }

}

function createRequest(serviceLocation, service) {
  const serviceName = service.name
  if (serviceLocation instanceof Service) {
    return serviceLocation.call.bind(serviceLocation)
  }
  if (typeof serviceLocation === 'string') {
    const agent = request.defaults({
      baseUrl: serviceLocation,
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream'
      }
    })
    return (method, data) => {
      return agent({
        uri: `/${serviceName}/${method}`,
        body: data
      })
        .then((output) => new Buffer(output))
    }
  }
  throw new TypeError('expected serviceLocation to be a string or slipstream'
    + ` service. got ${service}`)
}

module.exports = Client
