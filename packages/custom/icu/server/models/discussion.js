'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  archive = require('./archive.js');

var DiscussionSchema = new Schema({
  created: {
    type: Date
  },
  updated: {
    type: Date
  },
  title: {
    type: String
    //required: true
  },
  content: {
    type: String
  },
  creator: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  //manager
  assign: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  due: {
    type: Date
  },
  active: {
    type: Boolean
  },
  description: {
    type: String
  },
  status: {
    type: String,
    enum: ['new', 'scheduled', 'done', 'canceled', 'archived'],
    default: 'new'
  },
  //should we maybe have finer grain control on this

  /*
   Should we do roles or have set structure - how do we grow this

   Should eg membership/watchers be separate and and stored in user or in the model itself of the issue etc

   */
  members: [{
    type: Schema.ObjectId,
    ref: 'User'
  }],
  //should we maybe have finer grain control on this
  watchers: [{
    type: Schema.ObjectId,
    ref: 'User'
  }],
  groups: {
    type: Array
  },
  comp: {
    type: Array
  },
  project: {
    type: Schema.ObjectId,
    ref: 'Project'
  },
  circles: {
    c19n: Array,
    sources: [{
      type: Schema.ObjectId,
      ref: 'Source'
    }],
    c19nGroups: {
      type: Array
    }
  }
});

var starVirtual = DiscussionSchema.virtual('star');
starVirtual.get(function() {
  return this._star;
});
starVirtual.set(function(value) {
  this._star = value;
});
DiscussionSchema.set('toJSON', { virtuals: true });
DiscussionSchema.set('toObject', { virtuals: true });

/**
 * Statics
 */
DiscussionSchema.statics.load = function (id, cb) {
  this.findOne({
    _id: id
  }).populate('creator', 'name username').exec(cb);
};
/**
 * middleware
 */
var elasticsearch = require('../controllers/elasticsearch');

DiscussionSchema.post('save', function () {
  elasticsearch.save(this, 'discussion');
});
DiscussionSchema.pre('remove', function (next) {
   elasticsearch.delete(this, 'discussion', null, next);
  next();
});

DiscussionSchema.plugin(archive, 'discussion');

var deepPopulate = require('mongoose-deep-populate')(mongoose);
DiscussionSchema.plugin(deepPopulate);

module.exports = mongoose.model('Discussion', DiscussionSchema);
