var EventModel = require('../../lib/event_model')

function create(model) {
  return new EventModel(model).save()
}

module.exports = {
  create: create
}
