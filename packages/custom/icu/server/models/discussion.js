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
  project: {
    type: Schema.ObjectId,
    ref: 'Project'
  },
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

DiscussionSchema.pre('find', function (next) {
	if (this._conditions.currentUser) {
		var ObjectId = mongoose.Types.ObjectId; 
		var userId = new ObjectId(this._conditions.currentUser._id);
		this._conditions['$or'] = [ {'creator':userId}, {'manager':userId}, {'assign':userId}, {'members':userId}, {'watchers':userId} ];
		delete this._conditions.currentUser;
	}
	console.log('--------------------------------------------Discussion----------------------------------------------------------')
	console.log(JSON.stringify(this._conditions))
	next();
})

DiscussionSchema.pre('count', function (next) {
	if (this._conditions.currentUser) {
		var ObjectId = mongoose.Types.ObjectId; 
		var userId = new ObjectId(this._conditions.currentUser._id);
		this._conditions['$or'] = [ {'creator':userId}, {'manager':userId}, {'assign':userId}, {'members':userId}, {'watchers':userId} ];
		delete this._conditions.currentUser;
	}
	console.log('--------------------------------------------Count----------------------------------------------------------')
	console.log(JSON.stringify(this._conditions))
	next();
})

DiscussionSchema.plugin(archive, 'discussion');

module.exports = mongoose.model('Discussion', DiscussionSchema);
