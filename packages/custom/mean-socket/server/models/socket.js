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
    ref: 'User'
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
  //OHAD
  name: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
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
  }
});

mongoose.model('Message', MessageSchema);