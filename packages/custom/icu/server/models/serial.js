"use strict";

var mongoose = require("mongoose"),
  Schema = mongoose.Schema;

var SerialSchema = new Schema({
  _id: {
    type: String,
    default: "serialSeq"
  },
  seq: {
    type: Number,
    default: 5000
  },
  availableSerials: {
    type: Array,
    default: []
  }
});

var model = mongoose.model("Serial", SerialSchema);
module.exports = model;

//var serial = new model();
//serial.save();
