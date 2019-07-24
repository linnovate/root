"use strict";

/**
 * Module dependencies.
 */
var mongoose = require("mongoose"),
  User = mongoose.model("User"),
  _ = require("lodash"),
  Busboy = require("busboy"),
  fs = require("fs"),
  path = require("path"),
  utils = require("./utils"),
  config = require("meanio").loadConfig();

/**
 * Find profile by user id
 */
exports.profile = function(req, res, next) {
  User.findOne({
    _id: req.user._id
  }).exec(function(err, user) {
    if (err) return next(err);
    if (!user) return next(new Error("Failed to load user"));
    req.profile = user.profile;
    next();
  });
};

exports.updateMember = function(req, res, next) {
  next();
  if (!req.body.frequentUser) return;
  var profile = req.profile || {};
  var member = req.body.frequentUser;
  var frequent = profile.frequentUsers || {};
  //profile.frequentUsers = profile.frequentUsers || {};
  if (frequent[member]) {
    frequent[member]++;
  } else frequent[member] = 1;
  profile = _.extend(profile, { frequentUsers: frequent });
  var id = req.user._id;
  User.update({ _id: id }, { $set: { profile: profile } }, function(err) {
    if (err) next(err);
  });
};

/**
 * Update user profile
 */
exports.update = function(req, res, next) {
  req.profile = req.profile || {};
  var profile = _.extend(req.profile, req.body);

  var user = req.user;
  user.profile = profile;
  var id = user._id;
  delete user._id;
  User.update({ _id: id }, user, function(err) {
    if (err) return next(err);
    res.json(user.profile);
  });
};

/**
 * Update user avatar
 */
exports.uploadAvatar = function(req, res, next) {
  var busboy = new Busboy({
    headers: req.headers
  });

  busboy.on("file", function(fieldname, file, filename, encoding, mimetype) {
    var saveTo =
      config.root +
      "/packages/core/users/public/assets/img/avatar/" +
      req.user._id +
      "." +
      path.basename(filename.split(".").slice(-1)[0]).toLowerCase();

    file.pipe(fs.createWriteStream(saveTo));
    req.body.avatar =
      /*config.host + */ "/users/assets/img/avatar/" +
      req.user._id +
      "." +
      path.basename(filename.split(".").slice(-1)[0]).toLowerCase();
    req.file = true;
  });

  busboy.on("finish", function() {
    if (req.file) next();
    else next(new Error("Didn't find any avatar to upload"));
  });
  return req.pipe(busboy);
};
