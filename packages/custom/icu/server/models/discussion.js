'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  archive = require('./archive.js'),
  modelUtils = require('./modelUtils'),
  config = require('meanio').loadConfig() ;

var DiscussionSchema = new Schema({
  created: {
    type: Date
  },
  updated: {
    type: Date
  },
  recycled: {
    type: Date,
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
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  startTime: {
    type: Date
  },
  endTime: {
    type: Date
  },
  allDay: {
    type: Boolean
  },
  active: {
    type: Boolean
  },
  description: {
    type: String
  },
  status: {
    type: String,
    enum: ['new', 'scheduled', 'waiting-approval',  'done', 'canceled', 'archived'],
    default: 'new'
  },
  tags: [String],
  location: {
    type: String
  },
  //should we maybe have finer grain control on this

  /*
   Should we do roles or have set structure - how do we grow this

   Should eg membership/watchers be separate and and stored in user or in the model itself of the issue etc

   */
  members: [
    {
      type: Schema.ObjectId,
      ref: 'User'
    }
  ],
  //should we maybe have finer grain control on this
  watchers: [
    {
      type: Schema.ObjectId,
      ref: 'User'
    }
  ],
  bolded: [
    {
      _id: false,
      id: {type: Schema.ObjectId, ref: 'User'},
      bolded: Boolean,
      lastViewed: Date
    }
  ],
  permissions: [
    {
      _id: false,
      id: {type: Schema.ObjectId, ref: 'User'},
      level: {
        type: String,
        enum: ['viewer', 'commenter', 'editor'],
        default: 'viewer'
      }
    }
  ],
  project: {
    type: Schema.ObjectId,
    ref: 'Project'
  },
  sources: [String],
  circles: {
    type: Schema.Types.Mixed
  },
  roomName: {
    type: String
  },
  WantRoom: {
    type: Boolean,
    default: false
  },
  room: {
    type: String
  },
  hasRoom: {
    type: Boolean,
    default: false
  }
});

var starVirtual = DiscussionSchema.virtual('star');
starVirtual.get(function() {
  return this._star;
});
starVirtual.set(function(value) {
  this._star = value;
});
DiscussionSchema.set('toJSON', {virtuals: true});
DiscussionSchema.set('toObject', {virtuals: true});

/**
 * Statics
 */
DiscussionSchema.statics.load = function(id, cb) {
  this.findOne({
    _id: id
  }).populate('creator', 'name username').exec(cb);
};
/**
 * middleware
 */
var elasticsearch = require('../controllers/elasticsearch');

// Will not execute until the first middleware calls `next()`
DiscussionSchema.pre('save', function(next) {
  let entity = this ;
  config.superSeeAll ? modelUtils.superSeeAll(entity,next) : next() ;
});

DiscussionSchema.post('save', function() {
  elasticsearch.save(this, 'discussion');
});
DiscussionSchema.pre('remove', function(next) {
  elasticsearch.delete(this, 'discussion', next);
  next();
});

DiscussionSchema.plugin(archive, 'discussion');

module.exports = mongoose.model('Discussion', DiscussionSchema);
