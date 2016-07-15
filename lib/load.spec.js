/* eslint-disable no-sync */
'use strict'

const path = require('path')
const fs = require('fs')
const expect = require('chai').expect
const load = require('./load')

const FIXTURES = path.resolve(__dirname, '..', 'test', 'fixtures')
const TEST_PKG_PATH = path.join(FIXTURES, 'test.proto')
const TEST_BARE_PATH = path.join(FIXTURES, 'test.1.proto')

describe('load', () => {

  it('loads file from string with package', () => {
    const proto = load.load(fs.readFileSync(TEST_PKG_PATH).toString())
    expect(proto.test.Greeter).to.be.eql({
      type: load.TYPES.SERVICE,
      name: 'Greeter',
      methods: {
        sayHello: {
          request: proto.test.HelloRequest,
          response: proto.test.HelloResponse
        }
      }
    })
  })

  it('loads file from buffer with package', () => {
    const proto = load.load(fs.readFileSync(TEST_PKG_PATH))
    expect(proto.test.Greeter).to.be.eql({
      type: load.TYPES.SERVICE,
      name: 'Greeter',
      methods: {
        sayHello: {
          request: proto.test.HelloRequest,
          response: proto.test.HelloResponse
        }
      }
    })
  })

  it('loads file from path with package', () => {
    const proto = load.loadFile(TEST_PKG_PATH)
    expect(proto.test.Greeter).to.be.eql({
      type: load.TYPES.SERVICE,
      name: 'Greeter',
      methods: {
        sayHello: {
          request: proto.test.HelloRequest,
          response: proto.test.HelloResponse
        }
      }
    })
  })

  it('loads file from string', () => {
    const proto = load.load(fs.readFileSync(TEST_BARE_PATH).toString())
    expect(proto.Greeter).to.be.eql({
      type: load.TYPES.SERVICE,
      name: 'Greeter',
      methods: {
        sayHello: {
          request: proto.HelloRequest,
          response: proto.HelloResponse
        }
      }
    })
  })

  it('loads file from buffer', () => {
    const proto = load.load(fs.readFileSync(TEST_BARE_PATH))
    expect(proto.Greeter).to.be.eql({
      type: load.TYPES.SERVICE,
      name: 'Greeter',
      methods: {
        sayHello: {
          request: proto.HelloRequest,
          response: proto.HelloResponse
        }
      }
    })
  })

  it('loads file from path', () => {
    const proto = load.loadFile(TEST_BARE_PATH)
    expect(proto.Greeter).to.be.eql({
      type: load.TYPES.SERVICE,
      name: 'Greeter',
      methods: {
        sayHello: {
          request: proto.HelloRequest,
          response: proto.HelloResponse
        }
      }
    })
  })

})
