'use strict'

const assert = require('assert')

const AssertionError = assert.AssertionError

function customAssert(condition, message, ErrorType) {
  if (typeof condition === 'function') condition = condition()
  if (condition) return condition
  if (!ErrorType) {
    ErrorType = AssertionError
    message = { message }
  }
  throw new ErrorType(message)
}

module.exports = customAssert
