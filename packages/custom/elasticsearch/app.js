"use strict";

var mean = require("meanio");
var esConfig = mean.loadConfig().elasticsearch;
var Module = mean.Module;
var elasticsearch = require("elasticsearch");

var Elasticsearch = new Module("elasticsearch");

Elasticsearch.register(function(app, auth, database) {
  Elasticsearch.routes(app, auth, database);

  Elasticsearch.connect = function() {
    delete Elasticsearch.client;

    Elasticsearch.settings(function(err, config) {
      if (err) {
        return console.log("error retrieving Elasticsearch settings");
      }

      var log = esConfig.log ? esConfig.log : "trace";

      var hosts = [];
      for (var i = 0; i < Object.keys(esConfig.hosts).length; ++i) {
        hosts.push(esConfig.hosts[i]);
      }

      Elasticsearch.client = new elasticsearch.Client({
        hosts: hosts,
        log: log,
        keepAlive: esConfig.keepAlive,
        sniffOnConnectionFault: esConfig.sniffOnConnectionFault,
        maxRetries: esConfig.maxRetries
      });
    });
  };

  Elasticsearch.connect();

  Elasticsearch.ping = function(callback) {
    Elasticsearch.client.ping(
      {
        requestTimeout: 100,
        hello: "elasticsearch!"
      },
      function(error) {
        if (error) {
          callback(error);
        } else {
          callback(null, "OK");
        }
      }
    );
  };

  Elasticsearch.index = function(options, callback) {
    Elasticsearch.client.index(options, function(error, response) {
      if (error) {
        callback(error);
      } else {
        callback(null, response);
      }
    });
  };

  Elasticsearch.create = function(options, callback) {
    Elasticsearch.client.create(options, function(error, response) {
      if (error) {
        callback(error);
      } else {
        callback(null, response);
      }
    });
  };

  Elasticsearch.bulk = function(options, callback) {
    Elasticsearch.client.bulk(options, function(error, response) {
      if (error) {
        callback(error);
      } else {
        callback(null, response);
      }
    });
  };

  Elasticsearch.delete = function(options, callback) {
    Elasticsearch.client.delete(options, function(error, response) {
      if (error) {
        callback(error);
      } else {
        callback(null, response);
      }
    });
  };

  Elasticsearch.search = function(options, callback) {
    Elasticsearch.client.search(options, function(error, response) {
      if (error) {
        callback(error);
      } else {
        callback(null, response);
      }
    });
  };

  return Elasticsearch;
});

mean.elasticsearch = Elasticsearch;
