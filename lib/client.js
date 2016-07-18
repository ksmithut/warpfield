'use strict'

const Promise = require('bluebird')
const request = require('request-promise')
const url = require('url')
const Service = require('./service')
const load = require('./load')
const assert = require('./utils/assert')

class Client {

  constructor(protobufService, remoteOptions) {
    assert(
      protobufService && protobufService.type === load.TYPES.SERVICE,
      `expected protobufService, got ${protobufService}`,
      TypeError
    )
    this._service = protobufService
    this._request = createRequest(this._service, remoteOptions)
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

function createRequest(service, serviceOptions) {
  const serviceName = service.name
  if (serviceOptions instanceof Service) {
    return serviceOptions.call.bind(serviceOptions)
  }
  const agent = request.defaults({
    baseUrl: url.format(serviceOptions),
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream'
    }
  })
  return (method, data) => {
    return agent({
      uri: `/${serviceName}/${method}`,
      body: data
    }).then((output) => new Buffer(output))
  }
}

module.exports = Client
