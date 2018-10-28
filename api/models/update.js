const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const archive = require('../../packages/custom/icu/server/models/archive');
// const socket = require('../../packages/custom/mean-socket/server');


var UpdateSchema = new Schema({
  created: {
    type: Date
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  entity: {
    type: String,
    enum: ['Task', 'Project'],
    required: true
  },
  entityId: {
    type: Schema.Types.ObjectId,
    refPath: 'entity',
    required: true
  },
  updateField: {
    type: String,
    required: true
  },
  from: Schema.Types.Mixed,
  to: Schema.Types.Mixed,
});

var attachmentsVirtual = UpdateSchema.virtual('attachments');
attachmentsVirtual.get(function() {
  return this._attachments;
});
attachmentsVirtual.set(function(value) {
  this._attachments = value;
});
UpdateSchema.set('toJSON', {virtuals: true});
UpdateSchema.set('toObject', {virtuals: true});

/**
 * Statics
 */
UpdateSchema.statics.load = function(id, cb) {
  this.findOne({
    _id: id
  }).populate('creator', 'name username').exec(cb);
};

/**
 * Post middleware
 */

UpdateSchema.post('save', function(req, next) {
  // TODO: logic for getting all users to be notified
  // socket.notify(req.creator, req);
  next();
});

UpdateSchema.plugin(archive, 'update');

module.exports = mongoose.model('Update', UpdateSchema);
