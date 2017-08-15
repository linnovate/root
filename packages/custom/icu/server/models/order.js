'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  archive = require('./archive.js');

var OrderTaskSchema = new Schema({
  name:{
    type: String
  },
   ref: {
    type: Schema.ObjectId
  },
  project: {
    type: Schema.ObjectId
  },
  discussion: {
    type: Schema.ObjectId
  },
  order:{
      type: Number
  }
})

/**
 * Statics
 */
// OrderSchema.statics.load = function (id, cb) {
//   this.findOne({
//     _id: id
//   }).populate('creator', 'name username').exec(cb);
// };


//OrderSchema.plugin(archive, 'order');

module.exports = mongoose.model('OrderTask', OrderTaskSchema);
