'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;


var DiscussionSchema = new Schema({
  created: {
    type: Date
  },
  updated: {
    type: Date
  },  
  title: {
    type: String,
    required: true    
  },
  content: {
    type: String,
    required: true    
  },
  creator: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  manager: {
    type: Schema.ObjectId,
    ref: 'User'
  },

  //should we maybe have finer grain control on this

  /*
  Should we do roles or have set structure - how do we grow this

  Should eg membership/watchers be separate and and stored in user or in the model itself of the issue etc

  */
  members : [{
    type: Schema.ObjectId,
    ref: 'User'
  }],
  //should we maybe have finer grain control on this
  watchers : [{
    type: Schema.ObjectId,
    ref: 'User'
  }]
});

/**
 * Validations
 */
DiscussionSchema.path('title').validate(function(title) {
  return !!title;
}, 'Title cannot be blank');

DiscussionSchema.path('content').validate(function(content) {
  return !!content;
}, 'Content cannot be blank');

/**
 * Statics
 */
DiscussionSchema.statics.load = function(id, cb) {
  this.findOne({
    _id: id
  }).populate('creator', 'name username').exec(cb);
};

mongoose.model('Discussion', DiscussionSchema);
