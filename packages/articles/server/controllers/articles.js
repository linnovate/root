'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Article = mongoose.model('Article'),
	Actions = require('../../../custom/actions/server/providers/actions').Actions,
	Actions = new Actions(),
	tasks = require('./tasks'),
  _ = require('lodash');
//import {actions} from '../../../custom/actions/server/providers/actions.js';
//Actions = new Actions();
//import Actions from '../../../custom/actions/server/providers/actions.js';
//let Actions = new Actions();


/**
 * Find article by id
 */
exports.article = function(req, res, next, id) {
  Article.load(id, function(err, article) {
    if (err) return next(err);
    if (!article) return next(new Error('Failed to load article ' + id));
    req.article = article;
    next();
  });
};

/**
 * Create an article
 */
exports.create = function(req, res) {
  var article = new Article(req.body);
  article.user = req.user;

  article.save(function(err) {
    if (err) {
      return res.status(500).json({
        error: 'Cannot save the article'
      });
    }

	  Actions.save('action', 'create', 'project', article);

    res.json(article);

  });
};

/**
 * Update an article
 */
exports.update = function(req, res) {
  var article = req.article;

	if (article.task) return tasks.create(req, res);

  article = _.extend(article, req.body);

  article.save(function(err) {
    if (err) {
      return res.status(500).json({
        error: 'Cannot update the article'
      });
    }

	  article.user = req.user._id;
	  Actions.save('action', 'update', 'project', article);
    res.json(article);

  });
};

/**
 * Delete an article
 */
exports.destroy = function(req, res) {
  var article = req.article;

  article.remove(function(err) {
    if (err) {
      return res.status(500).json({
        error: 'Cannot delete the article'
      });
    }
	  article.user = req.user._id;
	  Actions.save('action', 'delete', 'project', article);
    res.json(article);

  });
};

/**
 * Show an article
 */
exports.show = function(req, res) {
  res.json(req.article);
};

/**
 * List of Articles
 */
exports.all = function(req, res) {
  Article.find().sort('-created').populate('user', 'name username').exec(function(err, articles) {
    if (err) {
      return res.status(500).json({
        error: 'Cannot list the articles'
      });
    }
    res.json(articles);

  });
};
