'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Message Schema
 */

var MessageSchema = new Schema({
  user: {
    type: Schema.ObjectId,
    ref: 'User',
    required: true
  },
  channel: {
    type: String,
    //required: true
  },
  message: {
    type: String,
    //required: true
  },
  time: {
    type: Date
  },
  expires: {
    type: Number
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  id: {
    type: String
  },
  IsWatched: {
      type: Boolean
  },
  DropDownIsWatched: {
      type: Boolean
  },
  entity: {
    type: String
  },
  type: {
    type: String
  }
});

mongoose.model('Message', MessageSchema);