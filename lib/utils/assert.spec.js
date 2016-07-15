'use strict'

const coreAssert = require('assert')
const expect = require('chai').expect
const assert = require('./assert')

describe('utils/assert', () => {

  it('throws error if condition is falsy', () => {
    expect(() => assert(false)).to.throw(coreAssert.AssertionError)
  })

  it('throws error with message', () => {
    expect(() => assert(false, 'test')).to.throw('test')
  })

  it('throws custom error type', () => {
    expect(() => assert(false, 'foo', TypeError)).to.throw(TypeError, 'foo')
  })

  it('returns value of condition if truthy', () => {
    expect(assert('foobar')).to.be.equal('foobar')
  })

  it('allows condition to be a function', () => {
    expect(() => assert(() => false)).to.throw(coreAssert.AssertionError)
    expect(assert(() => 'hellothere')).to.be.equal('hellothere')
  })

})
