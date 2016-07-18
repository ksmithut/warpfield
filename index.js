'use strict'

const Client = require('./lib/client')
const Server = require('./lib/server')
const Service = require('./lib/service')
const load = require('./lib/load')

exports.client = function client(protobufService, remoteOptions) {
  return new Client(protobufService, remoteOptions)
}

exports.server = function server() {
  return new Server()
}

exports.service = function service(protobufService, methods) {
  return new Service(protobufService, methods)
}

exports.load = load.load
exports.loadFile = load.loadFile
