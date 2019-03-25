'use strict';

var mongoose = require('mongoose'),
  ObjectId = require('mongoose').Types.ObjectId;

var CommentModel = require('../models/comment'),
  CommentArchive = mongoose.model('comment_archive'),
  mean = require('meanio'),
  _ = require('lodash'),
  elasticsearch = require('./elasticsearch');

exports.read = function(req, res, next) {
  CommentModel.findById(req.params.id).populate('assign').exec(function(err, comments) {
    if(err) return next(err);
    return res.json(comments);
  });
};

exports.all = function(req, res) {
  var query = {};
  if(!_.isEmpty(req.query)) {
    query = elasticsearch.advancedSearch(req.query);
  }

  mean.elasticsearch.search({
    index: 'comment',
    body: query
  }, function(err, response) {
    if(err)
      next(new Error('Failed to found documents'));
    else
      res.send(response.hits.hits.map(function(item) {
        return item._source;
      }));
  });
};

exports.create = function(req, res, next) {
  var comment = {
    creator: req.user._id
  };
  comment = _.extend(comment, req.body);
  new CommentModel(comment).save({
    user: req.user,
    discussion: req.body.discussion
  }, function(err, comment) {
    if(err) return next(err);
    return res.json(comment);
  });
};

exports.update = function(req, res, next) {

  if(!req.params.id) {
    return res.send(404, 'Cannot update comment without id');
  }
  CommentModel.findById(req.params.id, function(err, comment) {
    if(err) return next(err);
    if(!comment) return next(new Error('Cannot find comment with id: ' + req.params.id));
    comment = _.extend(comment, req.body);
    comment.updated = new Date();
    comment.save({
      user: req.user,
      discussion: req.body.discussion
    }, function(err, comment) {
      if(err) return next(err);
      return res.json(comment);
    });
  });
};

exports.destroy = function(req, res, next) {

  if(!req.params.id) {
    return res.send(404, 'Cannot destroy comment without id');
  }
  CommentModel.findById(req.params.id, function(err, comment) {
    if(err) return next(err);
    if(!comment) return next(new Error('Cannot find comment with id: ' + req.params.id, next));
    comment.remove({
      user: req.user,
      discussion: req.body.discussion
    }, function(err, success) {
      if(err) return next(err);
      return res.send({message: success ? 'Comment deleted' : 'Failed to delete comment'});
    });
  });
};

exports.readHistory = function(req, res, next) {
  if(req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    var Query = CommentArchive.find({
      'c._id': new ObjectId(req.params.id)
    });
    Query.populate('u');
    Query.exec(function(err, comments) {
      if(err) return next(err);
      return res.json(comments);
    });
  }
  else
    next(new Error(req.params.id + ' is not a mongoose ObjectId'));
};
