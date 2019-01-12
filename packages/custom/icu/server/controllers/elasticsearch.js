'use strict';

const mean = require('meanio');
const utils = require('./utils');
const system = require('./system');
const logger = require('../services/logger');

exports.save = function(doc, docType) {
  try {
    let newDoc = JSON.parse(JSON.stringify(doc));
    let creator =  doc.creator._id || doc.creator;
    delete newDoc._id;

    newDoc.creator = JSON.parse(JSON.stringify(creator));
    mean.elasticsearch.index({
      index: docType,
      type: docType,
      id: doc._id.toString(),
      body: newDoc
    }, function(error, response) {

      if(error) {
        system.sendMessage({service: 'elasticsearch', message: response});
        logger.log('error', 'error saving to elastic', {error: error});
        return error;
      }

      return doc;
    });
  }
  catch (err) {
    logger.log('error', 'error saving to elastic', {error: err.message});
  }
};

exports.delete = function(doc, docType, next) {
  try {
    mean.elasticsearch.delete({
      index: docType,
      type: docType,
      id: doc._id.toString()
    }, function(error, response) {
      if(error) {
        system.sendMessage({service: 'elasticsearch', message: response});
        logger.log('error', 'error deleting from elastic', {error: error});
        return error;
      }

      return next();
    });
  }
  catch (err) {
    logger.log('error', 'error deleting from elastic', {error: err.message});
  }
};

let buildSearchResponse = exports.buildSearchResponse = function(type, result, userId) {
  let types = ['task', 'project', 'discussion', 'office', 'folder', 'officedocument', 'attachment', 'update'];
  let groups = {};
  if(type === 'aggs') {
    result.hits.hits.forEach(function(i) {
      groups[i._index] = groups[i._index] || [];
      groups[i._index].push(Object.assign(i._source, i.highlight));
    });
  }
  else {
    result.map(function(i) {
      if(!groups.hasOwnProperty(i._index))
        groups[i._index] = [];
      groups[i._index].push(i._source);
    });
  }
//
  // Go through all types.
  for(let j = 0; j < types.length; j++) {

    // If the type exists in the groups array.
    if(groups[types[j]]) {
      let res = [];

      // go through all objects of this type.
      for(let i = 0; i < groups[types[j]].length; i++) {
        // Current object.
        let obj = groups[types[j]][i];

        // If the user has permission for the obj insert it to results.
        if(obj.creator == userId || obj.assign == userId || obj.watchers.includes(userId))
          res.push(obj);
      }
      groups[types[j]] = res;
    }
  }

  return groups;
};

exports.search = function(req, res, next) {
  let userId = req.user._id,
      docType = req.query.docType;

  if(!req.query.term) {
    return;
  }

  let query,
    pagination = req.locals.data.pagination,
    term = req.query.term !== '___' ? req.query.term.replace(',', '* ') : undefined;

  query = {
    query: {
      multi_match: {
        query: term,
        type: 'cross_fields',
        fields: ['title^3', 'color', 'name', 'tags', 'description', 'file.filename', 'serial', 'folderIndex'],
        operator: 'or'
      }
    },
    highlight: {
      pre_tags: ['<bold>'],
      post_tags: ['</bold>'],
      fields: {
        title: {},
        color: {},
        name: {},
        tags: {},
        description: {},
        'file.filename': {},
        serial: {}
      }
    }
  };

  let countQuery = {
    body: {
      query: {
        multi_match: {
          query: term,
          type: 'cross_fields',
          fields: ['title^3', 'color', 'name', 'tags', 'description', 'file.filename', 'serial', 'folderIndex'],
          operator: 'or'
        }
      },
      aggs: {
        group_by_index: {
          terms: {
            field: '_index'
          },
          aggs: {
            top: {
              top_hits: {
                highlight: {
                  fields: {
                    title: {}
                  }
                },
              }
            }
          }
        }
      }
    }
  };

  let options = {
    index: docType,
    type: docType,
    from : pagination.start || 0,
    size : pagination.limit || 25,
    body: query
  };

  // let countRequest = new Promise(resolve => {
  //   mean.elasticsearch.client.count(options, function(err, result) {
  //     return resolve(result.count);
  //   });
  // });
  let countRequest = new Promise(resolve => {
    mean.elasticsearch.client.search( countQuery, (err, result) => {
      let counts = countAggregatedSearchResults(result.aggregations.group_by_index.buckets);
      return resolve(counts)
    });
  });

  let resultsRequest = new Promise(resolve => {
    mean.elasticsearch.search(options, function(err, result) {
      console.log('****************************************************result');
      if(result && result.hits) console.dir(result.hits.hits);
      console.log('****************************************************');
      if(err) {
        system.sendMessage({service: 'elasticsearch', message: result});
      }
      utils.checkAndHandleError(err, 'Failed to find entities', next);

      let type;

      if(req.query.term) {
        if(!result.hits) {
          console.log('result.aggregations=' + result.aggregations);
          return next(new Error('Can\'t find ' + req.query.term));
        }
        type = 'aggs';
      } else {
        type = 'simple';
      }
      return resolve(buildSearchResponse(type, result, userId));
    });
  });

  Promise.all([countRequest, resultsRequest])
    .then( results => {
      req.locals.result = results[1];
      req.locals.result.count = results[0];
      req.locals.data.pagination.count = results[0].total;
      return next();
    })
};

function countAggregatedSearchResults(buckets){
  let counts = {};
  counts.total = 0;

  for(let prop in buckets){
    let resultObj = buckets[prop],
      entityType = resultObj.key,
      docCount = resultObj.doc_count;
    if(entityType === 'officedocument')entityType = 'officeDocument';

    counts[entityType] = docCount;
    counts.total += docCount;
  }
  return counts;
}

exports.advancedSearch = function(query) {
  var queries = [],
    jsonQuery;
  for(var i in query) {
    var isArray = query[i].indexOf(',') > -1;
    if(isArray) {
      var terms = query[i].split(',');
      jsonQuery = {
        terms: {
          minimum_should_match: terms.length
        }
      };
      jsonQuery.terms[i] = terms;
      queries.push(jsonQuery);
    }
    else {
      jsonQuery = {
        term: {}
      };
      jsonQuery.term[i] = query[i];
      queries.push(jsonQuery);
    }
  }
  return {
    query: {
      filtered: {
        query: {
          bool: {
            must: queries
          }
        }
      }
    }
  };
};
