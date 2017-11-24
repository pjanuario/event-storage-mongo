var target = require('../index')

var repoHelper = require('./support/repository_helper')
var blueprints = require('./support/blueprints/index')

var chai = require('chai')
var chaiAsPromised = require('chai-as-promised')
var Promise = require('bluebird')
var _ = require('lodash')

chai.should()
chai.use(chaiAsPromised)

var DB_URI = 'mongodb://localhost/event_storage_test'

var mongoose = require('mongoose')
require('mocha-mongoose')(DB_URI)

describe('Event Storage Test', function () {
  afterEach(function (done) {
    mongoose.connection.close()
    done()
  })

  describe('getInstance', function () {
    it('returns an object containing the get and insert functions', function () {
      var instance = target.getInstance(DB_URI)
      instance.should.have.property('insert')
      instance.should.have.property('get')
      instance.should.have.property('lastSequence')
    })
  })

  describe('getInstance#get', function () {
    describe('when no events exist', function () {
      it('should return an empty resultset', function () {
        var instance = target.getInstance(DB_URI)
        return instance.get(0).should.eventually.eql([])
      })
    })

    describe('when no events exists under the given sequence', function () {
      var instance

      beforeEach(function () {
        instance = target.getInstance(DB_URI)
        return repoHelper.create(blueprints.event)
      })

      it('should return an empty ruleset', function () {
        return instance.get(2).should.eventually.eql([])
      })
    })

    describe('when no events exists equal to the given sequence', function () {
      var instance

      beforeEach(function () {
        instance = target.getInstance(DB_URI)
        return repoHelper.create(blueprints.event)
      })

      it('should return an empty ruleset', function () {
        return instance.get(1).should.eventually.eql([])
      })
    })

    describe('when an event exists above the given sequence', function () {
      var instance

      beforeEach(function () {
        instance = target.getInstance(DB_URI)
        return repoHelper.create(blueprints.event)
      })

      it('should return the event', function () {
        return instance.get(0).should.eventually.eql(['message'])
      })
    })

    describe('when multiple events exists above the given sequence', function () {
      var instance

      beforeEach(function () {
        instance = target.getInstance(DB_URI)
        var firstEvent = _.cloneDeep(blueprints.event)
        var secondEvent = _.merge({}, firstEvent, {sequence: 2, raw: 'nomessage'})
        return Promise.map([firstEvent, secondEvent], repoHelper.create)
      })

      it('should return the events sorted by sequence', function () {
        var expected = ['message', 'nomessage']
        return instance.get(0).should.eventually.eql(expected)
      })
    })
  })

  describe('getInstance#lastSequence', function () {
    describe('when no events exist', function () {
      it('should return null', function () {
        var instance = target.getInstance(DB_URI)
        return instance.lastSequence().should.eventually.eql(null)
      })
    })

    describe('when an event exists', function () {
      var instance

      beforeEach(function () {
        instance = target.getInstance(DB_URI)
        return repoHelper.create(blueprints.event)
      })

      it('should return the event sequence', function () {
        return instance.lastSequence().should.eventually.eql(1)
      })
    })

    describe('when multiple events exists', function () {
      var instance

      beforeEach(function () {
        instance = target.getInstance(DB_URI)
        var firstEvent = _.cloneDeep(blueprints.event)
        var secondEvent = _.merge({}, firstEvent, {sequence: 2, raw: 'nomessage'})
        return Promise.map([firstEvent, secondEvent], repoHelper.create)
      })

      it('should return the last event sequence', function () {
        return instance.lastSequence().should.eventually.eql(2)
      })
    })
  })

  describe('getInstance#insert', function () {
    var instance

    beforeEach(function () {
      instance = target.getInstance(DB_URI)
    })

    describe('when the sequence payload is given', function () {
      it('should create the event', function () {
        var payload = _.pick(blueprints.event, ['raw', 'sequence'])
        return instance.insert(payload.sequence, payload.raw).then(function (event) {
          return _.pick(event, ['sequence', 'raw']).should.eql(payload)
        })
      })

      it('should track when the event was made', function () {
        var payload = _.pick(blueprints.event, ['raw', 'sequence'])

        return instance.insert(payload.sequence, payload.raw).then(function (event) {
          //It seems the default is made on the mongo side somehow, and stubbing the time does not work
          //The best way seems to equal on time with a small delta
          var expected = new Date().getTime()

          return event.created.getTime().should.be.closeTo(expected, 50)
        })
      })
    })
  })
})
