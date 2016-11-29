var mongoose = require('mongoose')
var mongooseSchema = mongoose.Schema
var Promise = require('bluebird')

mongoose.Promise = Promise

var schema = mongooseSchema({
  sequence: { type: Number, min: 1, index: true },
  created: { type: Date, default: Date.now },
  raw: { type: mongoose.Schema.Types.Mixed }
})

var EventModel = mongoose.model('Event', schema)

module.exports = EventModel
