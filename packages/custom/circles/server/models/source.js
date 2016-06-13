'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var SourceSchema = new Schema({
  created: Date,
  updated: Date,
  name: {
    type: String,
    required: true,
    unique: true
  },
  sourceId: String,
  circleName: {
    type: String
  }
});

mongoose.model('Source', SourceSchema);