'use strict'

const Promise = require('bluebird')
const getTransport = require('./transports')
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
  if (serviceOptions instanceof Service) {
    return serviceOptions.call.bind(serviceOptions)
  }
  const transport = getTransport(serviceOptions)
  const call = transport.createClient(serviceOptions)
  return call.bind(null, service.name)
}

module.exports = Client
