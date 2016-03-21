'use strict';

var mean = require('meanio'),
  utils = require('./utils');

exports.save = function (doc, docType, room, title) {
    console.log("===================================icu==================");
  mean.elasticsearch.index({
    index: docType,
    type: docType,
    id: doc._id.toString(),
    body: doc
  }, function (error, response) {
    // utils.checkAndHandleError(error, res);
    if (error)
      return error;
    //if (room)
    //    if (docType === 'attachment')
    //        notifications.sendFile({entityType: docType, title: title, room:room, method: 'uploaded', path: doc.path, issue:doc.issue});
    //    else
           //notifications.sendFromApi({entityType: docType, title: doc.title, room:room, method: (response.created ? 'created' : 'updated')});
    return doc;
  });
};

exports.delete = function (doc, docType, room, next) {
  mean.elasticsearch.delete({
    index: docType,
    type: docType,
    id: doc._id.toString()
  }, function (error, response) {
    if (error)
      return error;

    // utils.checkAndHandleError(error, res);
    //if (room)
    //  notifications.sendFromApi({entityType: docType, title: doc.title, room: room, method: 'deleted'});
    return next();
  });
};

function buildSearchResponse(type, obj) {
  var groups = {};
  if (type === 'aggs') {
    obj.forEach(function (i) {
      groups[i.key] =
        i.top.hits.hits.map(function (j) {
          return j._source;
        });
    });
  }
  else {
    obj.map(function (i) {
      if (!groups.hasOwnProperty(i._index))
        groups[i._index] = [];
      groups[i._index].push(i._source);
    })
  }
  return groups;
}

exports.search = function (req, res, next) {
  if (!req.query.term) {
    return;
  }

  var query = {
    query: {
      'multi_match': {
        'query': req.query.term.replace(',', ' '),
        'type': 'cross_fields',
        'fields': ['title^3', 'color', 'name', 'tags', 'description'],
        'operator': 'or'
      }
    },
    aggs: {
      group_by_index: {
        terms: {
          field: '_index'
        },
        aggs: {
          top: {
            top_hits: {}
          }
        }
      }
    }
  };

  var options = {
    index: req.query.index ? req.query.index.split(',') : ['project', 'task', 'discussion', 'user', 'attachment'],
    ignore_unavailable: true,
    from: 0,
    size: 3000,
    body: query
  };

  mean.elasticsearch.search(options, function (err, result) {
    utils.checkAndHandleError(err, 'Failed to find entities', next);
    if (req.query.term)
      res.send(buildSearchResponse('aggs', result.aggregations.group_by_index.buckets))
    else
      res.send(buildSearchResponse('simple', result.hits.hits))
  })
};

exports.advancedSearch = function (query) {
  var queries = [], jsonQuery;
  for (var i in query) {
    var isArray = query[i].indexOf(',') > -1;
    if (isArray) {
      var terms = query[i].split(',');
      jsonQuery = {terms: {minimum_should_match: terms.length}};
      jsonQuery.terms[i] = terms;
      queries.push(jsonQuery);
    }
    else {
      jsonQuery = {term: {}};
      jsonQuery.term[i] = query[i];
      queries.push(jsonQuery);
    }
  }
  return {
    query: {
      filtered: {
        query: {
          bool: {must: queries}
        }
      }
    }
  }
};
