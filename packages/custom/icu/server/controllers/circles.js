'use strict';

var config = require('meanio').loadConfig(),
  actionSettings = require(process.cwd() + '/config/actionSettings') || {};

var request = require('request'),
  qs = require('querystring');

var redis = require('redis'),
  client = redis.createClient();

client.on('error', function(err) {
  console.log('Error ' + err);
});


var getCircles = exports.getCircles = function(type, user, callback) {
  var query = qs.stringify({
    user: user
  })
  var api = '/api/v1/circles/' + type + '?' + query;
  client.get(api, function(err, reply) {
    if (reply) return callback(null, reply);
    request(config.circles.uri + api, function(error, response, body) {
      if (error || response.statusCode !== 200) return callback(error || response.statusCode);
      client.setex(api, actionSettings.cacheTime, body, redis.print);
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