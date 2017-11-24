var mongoose = require('mongoose')
var Promise = require('bluebird')
var _ = require('lodash')

var EventModel = require('./lib/event_model')

mongoose.Promise = Promise

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

function lastSequence(EventModel) {
  return EventModel.find()
    .sort('-sequence')
    .limit(1)
    .select('sequence')
    .exec()
    .then(function (entries) {
      var entry = _.first(entries, null) || null
      return _.get(entry, 'sequence') || null
    })
}

function insert(EventModel, sequence, raw) {
  return new EventModel({
    sequence: sequence,
    raw: raw
  }).save()
}

function getInstance(url) {
  mongoose.connect(url)

  return {
    get: _.partial(get, EventModel),
    lastSequence: _.partial(lastSequence, EventModel),
    insert: _.partial(insert, EventModel)
  }
}

module.exports = {
  getInstance: getInstance
}
