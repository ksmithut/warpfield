# warpfield

An RPC framework that leverages protocol buffers to make server to server
communication fast.

# Installation

```
npm install --save warpfield
```

# Usage

server usage

```proto
// greeter.proto
message Request {
  string name = 1;
}

message Response {
  string message = 1;
}

service Greeter {
  rpc SayHello (Request) returns (Response);
}
```

```js
'use strict'

const warpfield = require('warpfield')

const proto = warpfield.loadFile('greeter.proto')
const server = warpfield.server()

const greeter = warpfield.service(proto.Greeter, {
  sayHello(request) {
    return { message: `Hello ${request.name}` }
  }
})

server.register(greeter)

server.start('8000')
```

client usage

```js
const warpfield = require('warpfield')

const proto = warpfield.loadFile('greeter.proto')
const greeter = warpfield.client('localhost:8000', proto.Greeter)

greeter.sayHello({ name: 'Jack Bliss' })
  .then((response) => {
    console.log('Greeting:', response.message)
  })
```

# API

`warpfield` is heretofore a shortcut for `require('warpfield') as far as
these docs are concerned.

## `warpfield.loadFile(path)`

Loads a `.proto` file. Services will be on the returned object with the service
names being the properties.

- `path` The path to the proto file to load. This path must be relative to cwd
  or an absolute path. Protocol buffer imports are not resolved at this time.

## `warpfield.load(protobuf)`

Loads the protocol buffer schema from a string/buffer. Services will be on the
returned object with the service names being the properties.

- `protobuf` A string/buffer of the protocol buffer definition.

## `warpfield.service(protobufService[, handlers])`

Returns a warpfield service object

- `protobufService` The protocol buffer service as returned from `.load` or
  `.loadFile`. If it's not passed, it's assumed that this will be a json
  service, rather than a protocol buffer service.
- `handlers` An object who's keys correspond with the method names of the
  service. The keys must be the lowerCamelCase version of their schema
  counterparts (if a protobuf service is passed). The values must be functions.
  Those functions can return promises so long as the promises resolve to an
  object the match the definition. Handlers can be added after this initial
  declaration.

### `service.handle(methodName, handler)`

Adds a handler to a given method name.

- `methodName` The name of the method to bind to.
- `handler` The function that should be called when the method is called.

## `warpfield.server()`

Returns a new warpfield server instance

### `server.use(service)`

Registers a service with the server

- `service` The warpfield service instance to bind to that namespace.

### `server.listen(port)`

Starts the server. Returns a promise that resolves when the server has started.

### `server.close()`

Stops the server. Returns a promise that resolves when the server has closed.

## `warpfield.client(protobufService, remoteOptions)`

Returns a new warpfield client with the methods on the given service. It will
have the methods of the service in lowerCamelCase form.

- `protobufService` The protobufService instance from warpfield.load[File].
- `remoteOptions` This can be an object or a warpfield service.
