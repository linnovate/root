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
  }
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
