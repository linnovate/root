'use strict';

require('../models/circle');
var mongoose = require('mongoose'),
  Circle = mongoose.model('Circle');

var config = require('meanio').loadConfig(),
  actionSettings = require(process.cwd() + '/config/actionSettings') || {};

var request = require('request'),
  qs = require('querystring');

var getCircles = exports.getCircles = function(type, user, callback) {
  var query = qs.stringify({
    user: user
  });
  var api = '/api/v1/circles/' + type + '?' + query;
  Circle.findOne({
    key: api
  }, function(err, circle) {
    var date = new Date();
    if (circle && circle.created > new Date(date.getTime() - 60000 * actionSettings.cacheTime)) return callback(null, circle.value);
    request(config.circles.uri + api, function(error, response, body) {
      if (error || response.statusCode !== 200) return callback(error || response.statusCode);
      Circle.findOneAndUpdate({
        key: api
      }, {
        key: api,
        value: body,
        created: date
      }, {
        upsert: true
      }, function() {})
      return callback(null, body);
    });
  });
};

exports.all = function(req, res, next) {
  getCircles('all', req.user.id, function(err, data) {
    return res.send(data);
  })
};

exports.sources = function(req, res, next) {
  getCircles('sources', req.user.id, function(err, data) {
    return res.send(data);
  })
};

exports.mine = function(req, res, next) {
  getCircles('mine', req.user.id, function(err, data) {
    return res.send(data);
  })
};

exports.upsertUser = function(id, callback) {
  var api = '/api/v1/users/' + id;
  request.post(config.circles.uri + api, function(error, response, body) {
    callback(response);
  });
};