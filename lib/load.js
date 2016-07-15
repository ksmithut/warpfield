'use strict'

const path = require('path')
const fs = require('fs')
const protobuf = require('protocol-buffers')

const TYPES = {
  MESSAGE: Symbol('message'),
  SERVICE: Symbol('service')
}

function createPackage(schema, messages) {
  const packagedMessages = Object.keys(messages).reduce((hash, key) => {
    hash[key] = createMessage(messages[key])
    return hash
  }, {})
  const pkg = schema.services.reduce((hash, service) => {
    hash[service.name] = createService(service, packagedMessages)
    return hash
  }, packagedMessages)

  if (!schema.package) return pkg
  return { [schema.package]: pkg }
}

function createMessage(message) {
  return {
    type: TYPES.MESSAGE,
    name: message.name,
    serialize: message.encode,
    deserialize: message.decode
  }
}

function createService(service, messages) {
  return {
    type: TYPES.SERVICE,
    name: service.name,
    methods: service.methods.reduce((methods, method) => {
      const name = method.name
      const lowerName = name.charAt(0).toLowerCase() + name.substr(1)
      methods[lowerName] = {
        request: messages[method.input_type],
        response: messages[method.output_type]
      }
      return methods
    }, {})
  }
}

exports.TYPES = TYPES

exports.load = function load(str) {
  const messages = protobuf(str)
  const schema = messages.toJSON()
  return createPackage(schema, messages)
}

exports.loadFile = function loadFile() {
  const absPath = path.resolve.apply(path, arguments)
  return exports.load(fs.readFileSync(absPath)) // eslint-disable-line no-sync
}
