'use strict'

const Promise = require('bluebird')
const assert = require('./utils/assert')
const load = require('./load')

class Service {

  constructor(protobufService, methods) {
    assert(
      protobufService && protobufService.type === load.TYPES.SERVICE,
      `expected protobufService, got ${protobufService}`,
      TypeError
    )
    this._service = protobufService
    this._handlers = {}
    if (methods) {
      Object.keys(methods).forEach((methodName) => {
        this.handle(methodName, methods[methodName])
      })
    }
  }

  handle(methodName, handler) {
    const serviceMethod = assert(
      this._service.methods[methodName],
      `${methodName} is not defined on the service ${this._service.name}`,
      ReferenceError
    )
    this._handlers[methodName] = (buffer) => {
      return Promise
        .try(() => serviceMethod.request.deserialize(buffer))
        .then(handler)
        .then(serviceMethod.response.serialize)
    }
  }

  call(methodName, buffer) {
    if (!this._handlers[methodName]) {
      return Promise.reject(new ReferenceError(
        `${methodName} is not handled on the service ${this._service.name}`
      ))
    }
    return this._handlers[methodName](buffer)
  }

  get name() {
    return this._service.name
  }

}

module.exports = Service
