# Micro-toolkit Event Storage MongoDB

A mongodb implementation of the event storage interface.

## Install

    $ npm install micro-toolkit-event-storage-mongo --save

## Usage

```javascript
var factory = require('micro-toolkit-event-storage-mongo')

var instance = factory.getInstance('mongodb://localhost/event_sample')

var promises = [
  // receives the sequence number and the raw data
  // and returns a promise
  instance.insert(1, { id: 100, something: true }),
  instance.insert(2, { id: 101, something: true }),
  instance.insert(3, { id: 102, something: true }),
  instance.insert(4, { id: 103, something: true }),
  instance.insert(5, { id: 104, something: true })
]

Promise.all(promises)
  .then(function () {
    return instance.get(0)
  })
  .then(console.log)
  .then(function () {
    return instance.get(1)
  })
  .then(console.log)
  .then(function () {
    return instance.get(4)
  })
  .then(console.log)
  .then(function () {
    return instance.get(5)
  })
  .then(console.log)
```
