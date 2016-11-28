var mongoose = require('mongoose')
var Promise = require('bluebird')
var _ = require('lodash')
var mongooseSchema = mongoose.Schema

mongoose.Promise = Promise

var schema = mongooseSchema({
  sequence: { type: Number, min: 1, index: true },
  created: { type: Date, default: Date.now },
  raw: mongoose.Schema.Types.Mixed
})

function get(EventModel, sequence) {
  return EventModel.find()
    .where('sequence').gt(sequence)
    .sort('sequence')
    .select('raw')
    .exec()
    .then(function (entries) {
      return entries.map(function (entry) {
        return entry.raw
      })
    })
}

function insert(EventModel, sequence, raw) {
  return new EventModel({
    sequence: sequence,
    raw: raw
  }).save()
}

function getInstance(url) {
  var EventModel = mongoose.model('Event', schema)
  mongoose.connect(url)

  return {
    get: _.partial(get, EventModel),
    insert: _.partial(insert, EventModel)
  }
}

module.exports = {
  getInstance: getInstance
}
