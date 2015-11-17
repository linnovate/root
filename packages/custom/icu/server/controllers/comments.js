'use strict';

var utils = require('./utils');

var mongoose = require('mongoose'),
  ObjectId = require('mongoose').Types.ObjectId;

var CommentModel = require('../models/comment'),
  CommentArchive = mongoose.model('comment_archive'),
  mean = require('meanio'),
  _ = require('lodash'),
  elasticsearch = require('./elasticsearch');

exports.read = function (req, res, next) {
  CommentModel.findById(req.params.id).populate('assign').exec(function (err, comments) {
    utils.checkAndHandleError(err, 'Failed to read comment', next);
    res.status(200);
    return res.json(comments);
  });
};

exports.all = function (req, res) {
  var query = {};
  if (!(_.isEmpty(req.query))) {
    query = elasticsearch.advancedSearch(req.query);
  }

  mean.elasticsearch.search({
    index: 'comment',
    'body': query
  }, function (err, response) {
    if (err)
      res.status(500).send('Failed to found documents');
    else
      res.send(response.hits.hits.map(function (item) {
        return item._source
      }))
  });
};

exports.create = function (req, res, next) {
  var comment = {
    creator: req.user._id
  };
  comment = _.extend(comment, req.body);
  new CommentModel(comment).save({
    user: req.user,
    discussion: req.body.discussion
  }, function (err, comment) {
    utils.checkAndHandleError(err, 'Failed to create comment');
    res.status(200);
    return res.json(comment);
  });
};

exports.update = function (req, res, next) {

  if (!req.params.id) {
    return res.send(404, 'Cannot update comment without id');
  }
  CommentModel.findById(req.params.id, function (err, comment) {
    if (err) utils.checkAndHandleError(err, 'Failed to find comment: ' + req.params.id, next);
    else {
      if (!comment) utils.checkAndHandleError(true, 'Cannot find comment with id: ' + req.params.id, next);
      else {
        comment = _.extend(comment, req.body);
        comment.updated = new Date();
        comment.save({
          user: req.user,
          discussion: req.body.discussion
        }, function (err, comment) {
          utils.checkAndHandleError(err, 'Failed to update comment', next);
          res.status(200);
          return res.json(comment);
        });
      }
    }
  });
};

exports.destroy = function (req, res, next) {

  if (!req.params.id) {
    return res.send(404, 'Cannot destroy comment without id');
  }
  CommentModel.findById(req.params.id, function (err, comment) {
    if (err) utils.checkAndHandleError(err, 'Failed to find comment: ' + req.params.id, next);
    else {
      if (!comment) utils.checkAndHandleError(true, 'Cannot find comment with id: ' + req.params.id, next);
      else
        comment.remove({
          user: req.user,
          discussion: req.body.discussion
        }, function (err, success) {
          utils.checkAndHandleError(err, 'Failed to destroy comment', next);
          res.status(200);
          return res.send({message: (success ? 'Comment deleted' : 'Failed to delete comment')});
        });
    }
  });
};

exports.readHistory = function (req, res, next) {
  if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    var Query = CommentArchive.find({
      'c._id': new ObjectId(req.params.id)
    });
    Query.populate('u');
    Query.exec(function (err, comments) {
      utils.checkAndHandleError(err, 'Failed to read history for comment ' + req.params.id, next);

      res.status(200);
      return res.json(comments);
    });
  } else
    utils.checkAndHandleError(req.params.id + ' is not a mongoose ObjectId', 'Failed to read history for comment ' + req.params.id, next);
};
