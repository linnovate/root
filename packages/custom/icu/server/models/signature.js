"use strict";

var mongoose = require("mongoose"),
  Schema = mongoose.Schema;

var SignatureSchema = new Schema({
  fullName: {
    type: String,
    default: "noFullName"
  },
  message: {
    type: String,
    default: "noMessage"
  },
  unit: {
    type: String,
    default: "noUnit"
  },
  role: {
    type: String,
    default: "noRole"
  },
  rank: {
    type: String,
    default: "noRank"
  },
  office: {
    type: Schema.ObjectId,
    ref: "Office"
  }
});

module.exports = mongoose.model("Signature", SignatureSchema);
