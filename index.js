var mongoose = require('mongoose')
var Promise = require('bluebird')
var _ = require('lodash')
var util = require('util')

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

function insert(EventModel, sequence, raw) {
  return new EventModel({
    sequence: sequence,
    raw: raw || null //mixed type does not deal with undefined
  }).save().catch(function (error) {
    var isMongooseError = _.get(error, 'name') === 'ValidationError'

    if (isMongooseError) {
      var propertiesInvalid = _.keys(_.get(error, 'errors'))
      var propertiesInvalidText = propertiesInvalid.join(',')
      var message = util.format('The following parameters were missing or invalid: %s',
        propertiesInvalidText)
      throw new Error(message)
    }
    throw error
  })
}

function getInstance(url) {
  mongoose.connect(url)

  return {
    get: _.partial(get, EventModel),
    insert: _.partial(insert, EventModel)
  }
}

module.exports = {
  getInstance: getInstance
}
