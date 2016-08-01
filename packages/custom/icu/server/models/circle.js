'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var CircleSchema = new Schema({
  key: {
    type: String
  },
  value: {
    type: Schema.Types.Mixed
  },
  created: {
    type: Date
  }
});

module.exports = mongoose.model('Circle', CircleSchema);