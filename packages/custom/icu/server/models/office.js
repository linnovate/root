'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  archive = require('./archive.js'),
  modelUtils = require('./modelUtils'),
  config = require('meanio').loadConfig() ;


var OfficeSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date
  },
  title: {
    type: String
  },
  recycled: {
    type: Date,
  },
  parent: {
    type: Schema.ObjectId,
    ref: 'Office'
  },
  discussion: {
    type: Schema.ObjectId,
    ref: 'Discussion'
  },
  creator: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  manager: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  signature: {
    circles: {},
    codes: {}
  },
  color: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['new', 'in-progress', 'canceled', 'completed', 'archived'],
    default: 'new'
  },
  description: {
    type: String
  },
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
  room: {
    type: String
  },
  hasRoom: {
    type: Boolean,
    default: false
  },
  sources: [String],
  circles: {
    type: Schema.Types.Mixed
  },
  WantRoom: {
    type: Boolean,
    default: false
  },
  unit: {
    type: String
  },
  tel: {
    type: String
  }
});

var starVirtual = OfficeSchema.virtual('star');
starVirtual.get(function() {
  return this._star;
});
starVirtual.set(function(value) {
  this._star = value;
});
OfficeSchema.set('toJSON', {
  virtuals: true
});
OfficeSchema.set('toObject', {
  virtuals: true
});

/**
 * Validations
 */
OfficeSchema.path('color').validate(function(color) {
  return /^([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/i.test(color);
}, 'Invalid HEX color.');

/**
 * Statics
 */
OfficeSchema.statics.load = function(id, cb) {
  this.findOne({
    _id: id
  }).populate('creator', 'name username').exec(cb);
};

/**
 * middleware
 */
var elasticsearch = require('../controllers/elasticsearch');


// Will not execute until the first middleware calls `next()`
OfficeSchema.pre('save', function(next) {
  let entity = this ;
  config.superSeeAll ? modelUtils.superSeeAll(entity,next) : next() ;
});


OfficeSchema.post('save', function(req, next) {
  elasticsearch.save(this, 'office', this.room);
  next();
});

OfficeSchema.pre('remove', function(next) {
  elasticsearch.delete(this, 'office', this.room, next);
  next();
});

OfficeSchema.plugin(archive, 'office');

module.exports = mongoose.model('Office', OfficeSchema);
