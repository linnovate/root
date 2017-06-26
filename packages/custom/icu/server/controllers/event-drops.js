'use strict';

var mean = require('meanio'),
    elasticCtrl = require('./elasticsearch'),
    utils = require('./utils'),
    system = require('./system');

exports.getMyEvents = function (req, res, next) {

    if (req.locals.error) {
        return next();
    }

    var query = {
        query: {
            match: {
                creator: req.user._id
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
                          size: 3000
                        }
                    }
                }
            }
        }
    };

    var options = {
        from: 0,
        size: 0,
        body: query
    };

    mean.elasticsearch.search(options, function (err, result) {
      console.log('orit13');
      console.log(JSON.stringify(result));
        if (err) {
            system.sendMessage({
                service: 'event-drops',
                message: result
            });
        }
        utils.checkAndHandleError(err, 'Failed to find entities', next);
        res.send(elasticCtrl.buildSearchResponse('aggs', result.aggregations.group_by_index.buckets))

    });
};
