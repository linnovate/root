'use strict';

var mean = require('meanio'),
  path = require('path'),
  fs = require('fs'),
  mkdirp = require('mkdirp'),
  config = require('meanio').loadConfig(),
  Busboy = require('busboy'),
  q = require('q');
  
var options = {
  includes: 'creator updater'
};

var crud = require('../controllers/crud.js');
var attachment = crud('attachments', options);
var Task = require('../models/task'),
Attachment = require('../models/attachment');


Object.keys(attachment).forEach(function(methodName) {
  exports[methodName] = attachment[methodName];
});

exports.getByEntity = function (req, res) {

  var entities = {projects: 'project', tasks: 'task', discussions: 'discussion', updates: 'update'},
    entity = entities[req.params.entity];
    
var query = {
    "query": {
      "filtered" : { 
         "filter" : {
            "bool" : {
              "must" : [
                 { "term" : {"entity" : entity}}, 
                 { "term" : {"entityId" : req.params.id}} 
              ]
        
           }
         }
      }
  }
   	};


  mean.elasticsearch.search({index: 'attachment', 'body': query, size: 3000}, function (err, response) {
    if (err) {
      res.status(200).send([]);
    }
    else {
      res.send(response.hits.hits.map(function (item) {
        return item._source;
      }));
    }
  });
};

var formatDate = function(date) {
  var yyyy = date.getFullYear().toString();
  var mm = (date.getMonth() + 1).toString();
  var dd = date.getDate().toString();
  return yyyy + '/' + (mm[1] ? mm : '0' + mm[0]) + '/' + (dd[1] ? dd : '0' + dd[0]);
};

exports.upload = function (req, res, next) {
  var d = formatDate(new Date());

  req.locals.data.attachments = [];
  req.locals.data.body = {};

  var busboy = new Busboy({
    headers: req.headers
  });

  var hasFile = false;

  busboy.on('file', function (fieldname, file, filename) {
    var saveTo = path.join(config.attachmentDir, d, new Date().getTime() + '-' + path.basename(filename));
    var hostFileLocation = config.host + saveTo.substring(saveTo.indexOf('/files'));
    var fileType = path.extname(filename).substr(1).toLowerCase();
    
    mkdirp(path.join(config.attachmentDir, d), function () {
      file.pipe(fs.createWriteStream(saveTo)).on('close', function(err) {
      
        var arr = hostFileLocation.split("/files");
        var pathFor = "./files" + arr[1];
              
        var stats = fs.statSync(pathFor);
        //var stats = fs.statSync("." + saveTo.substring(saveTo.indexOf('/files')));
        
        var fileSizeInBytes = stats["size"];
        //Convert the file size to megabytes (optional)
        var fileSizeInMegabytes = fileSizeInBytes / 1000000.0;
        
        req.locals.data.body.size = fileSizeInMegabytes;

        });
      
    // });

    req.locals.data.body.name = filename;
    req.locals.data.body.path = hostFileLocation;
    req.locals.data.body.attachmentType = fileType;
    
    
    // var arr = hostFileLocation.split("/files");
    // var pathFor = "./files" + arr[1];
    
    // var stats = fs.statSync(pathFor);
    // var fileSizeInBytes = stats["size"];
    // //Convert the file size to megabytes (optional)
    // var fileSizeInMegabytes = fileSizeInBytes / 1000000.0;
    
    // req.locals.data.body.size = fileSizeInMegabytes;
       
    req.locals.data.body.size = file._readableState.length / 1000000;

    hasFile = true;
    
    //});    
    });
      
  });

  busboy.on('field', function (fieldname, val) {
    req.locals.data.body[fieldname] = val;
  });

  busboy.on('finish', function () {
    if (!hasFile) {
      req.locals.error = { message: 'No file was attached' };
    }

    next();
  });

  return req.pipe(busboy);
};

function MyTasks(req){
	 	var deffered = q.defer();

  	Task.find({
  		assign: req.user._id
  	}, function(err, tasks) {
  		if (err) {
	      deffered.reject(err);
	    } else {
	      deffered.resolve(tasks.map(function(t){return t._id}));
	    }
  	})
  	return deffered.promise

}

exports.getMyTasks  = function(req, res, next) {
	// if (req.locals.error) {
 //    	return next();
 //  	}

	 MyTasks(req).then(function(data) {
	 	/*var query = {
		    "query": {
		      "filtered" : { 
		         "filter" : {
		            "bool" : {
		              "must" : [
		                 { "term" : {"entity" : 'task'}}, 
		                 { "terms" : {"entityId" : data}} 
		              ]
		        
		           }
		         }
		      }
		  	}
	   	};

		  mean.elasticsearch.search({index: 'attachment', 'body': query, size: 3000}, function (err, response) {
		    if (err) {
		      req.locals.error = err;
		    }
		    else {
		      req.locals.result = response.hits.hits.map(function (item) {
		        return item._source;
		      });
		    }
		  });*/

		Attachment.find({entity: 'task', entityId: {$in: data} }, function(err, data) {
			if (err) {
		    	req.locals.error = err;
		    }
		    else {
		      	req.locals.result = data
		    }
		    next();
		})
	 }, function(err){
	 	req.locals.error = err;
	 	next();
	 })

}

exports.getByPath = function(req, res, next) {
  if(req.locals.error) {
    return next();
  }
  var query = req.acl.mongoQuery('Attachment');

  query.findOne({path: decodeURI(req.headers.referer)}).exec(function(err, attachment){
    if(err) {
      req.locals.error = err;
    }
    if(!attachment) {
      req.locals.error = {
        status: 404,
        message: 'Entity not found'
      };
    }
    next();
  })
};

exports.sign = function(req, res, next) {
  var entities = {projects: 'project', tasks: 'task', discussions: 'discussion'};
  Attachment.update({
    entity: entities[req.locals.data.entityName],
    entityId: req.params.id
  }, {
    circles: req.body.circles,
    watchers: req.body.watchers
  }, {
    multi: true
  }, function(err, numAffected) {
    next();
  });
}

exports.signNew = function(req, res, next) {
  var entities = {project: 'Project', task: 'Task', discussion: 'Discussion'};
  var query = req.acl.mongoQuery(entities[req.locals.data.body.entity]);
  query.findOne({_id: req.locals.data.body.entityId}).exec(function(err, entity){
    if(err) {
      req.locals.error = err;
    }
    if(!entity) {
      req.locals.error = {
        status: 404,
        message: 'Entity not found'
      };
    }
    if(entity) {
      req.locals.data.body.watchers = entity.watchers;
      req.locals.data.body.circles = entity.circles;
    }
    next();
  })
}