'use strict';
//var request = require('request');
var async = require('async');
//var dateFormat = require('dateformat');
var Q = require('q');
var config = require('meanio').loadConfig();
var mongoose = require('mongoose'),
    db = mongoose.connections[0].db;
//var kue = require('kue');
//var changeCase = require('change-case');
//kue.app.listen(3005);
//var queue = kue.createQueue();


var mean = require('meanio');
// // var esConfig = mean.loadConfig().elasticsearch;
// var Module = mean.Module;
// // var elasticsearch = require('Elasticsearch');

// var elasticsearch = new Module('elasticsearch');

// var Elasticsearch = new Module('elasticsearch');

//           var host = esConfig.host;
//           var port = esConfig.port;
//           var log = esConfig.log ? esConfig.log : 'trace';

//           Elasticsearch.settings({host:host,port:port,log:log});

//           Elasticsearch.client = new elasticsearch.Client({
//               host: host + ':' + port,
//               log: log
//           });


var elasticsearchCount = 0;
var elasticHostName = config.elasticHost;
var elasticObj = mean.elasticsearch;
// var elasticObj = new elasticsearch.Client({
//     host: elasticHostName,
//     requestTimeout: 300000
// });
//var elasticObj = mean.elasticsearch;

function indexBulk(body,elastic ,callback) {
    console.log("body");
    console.log(body);
    mean.elasticsearch.bulk({
        body: body
    }, function (err, res) {
        return callback(err, res);
    });
}

function indexCollectionElastic(collectionName,nodes,elastic) {

    var deferred = Q.defer();
    var body = [];
    nodes.forEach(function(node){
        var obj = node;
        var type =  obj.type;
        delete obj.type;
        var id = obj.id;
        delete obj.id;
        var typespecific = obj.typespecific; 
        
        // Made by OHAD  
        // In need to delete the mapping and indexes from the elastic, there is shell script called "icu-elasticsearch.sh". 
        // It's needed to run first of all. To run it: "sudo ./icu-elasticsearch.sh dev"
        // To run this command we need to run this command in this path : "as@ubuntu:~/Desktop/redis/redis-3.2.0/src$ redis-server "
        // Also need to install the redis: "wget http://download.redis.io/releases/redis-3.2.0.tar.gz" ...
        // And download "kue" : "as@ubuntu:~/Desktop/redis/redis-3.2.0/src$ sudo npm install kue "
        // To run the functions of this page (that index the data from mongoDB to elastic), 
        // you need to run this command : "curl -XPOST http://localhost:3000/api/index-data/[schema name from mongoDB]"
        // Example: "curl -XPOST http://localhost:3000/api/index-data/updates"
        // The "index-data" called by the routes
        //
        // The function need to have _index and _type, it get diffrent with each schema we take from the mongoDB to the elastic.
        // So we have this 5 schemas (5 body.push(....)) that need to run sepratly with each command from the terminal (curl -XPOST ....).
        //
        //
        // body.push({index: { _index: 'project', _type : 'project', _id:id }});
        // body.push({index: { _index: 'task', _type : 'task', _id:id }});
        // body.push({index: { _index: 'attachment', _type : 'attachment', _id:id }});
        // body.push({index: { _index: 'discussion', _type : 'discussion', _id:id }});
        // body.push({index: { _index: 'update', _type : 'update', _id:id }});
        
        // This the origin code
        //body.push({index: { _index: type, _type : typespecific, _id:id }});
        
        body.push(obj);
    });
    indexBulk(body,elastic ,function(err,res){
        if(err){
            deferred.reject(err);
        }

        var result = [];
        if(res && res.items) {
            result = res.items;
        }

        deferred.resolve(result);
     });
    return deferred.promise;
}

function insertOffsetToIndexKue(schema)  {
    var limit = 100;
    var offset = 0;
    console.log('******************schema' + schema);
    var Collection = db.collection(schema);
    console.log('-------------------------------------------');
    console.log('Index Collection Elastic : ' + schema);
    Collection.count(function (err, count)  {
        var countItem = count;
        console.log('countItem in mongoDB: ' + countItem);
        for (offset = 0 ;offset < countItem;)  {
            queue.create('index', {schema: schema, offset: offset}).priority('high').removeOnComplete(true).save();
            offset = limit + offset;
        }
        if ((offset - countItem) < limit)
            queue.create('index', {schema: schema, offset: offset}).priority('high').removeOnComplete(true).save();
    });
}

function indexJob(data, done) {
    var collectionName = data.schema;
    var offset = data.offset;
    var limit = 100;


    var Collection = db.collection(collectionName);

    Collection.find().limit(limit).skip(offset).toArray(function (err, nodes) {
        if(!err)  {
            console.log("nodes1");
            console.log(nodes);
            
            indexCollectionElastic(collectionName,nodes,elasticObj).then(function (res) {
                elasticsearchCount = res.length + elasticsearchCount;
                done();
            }, function (error) {
                done(error);
            });
        }
        else {
            done(err);
        }
    });
}

function indexCollectionFromMongotoElastic(collectionName,elastic,callback){
    insertOffsetToIndexKue(collectionName);
    callback(null, collectionName);
}

queue.on('job complete', function(){
    queue.inactiveCount(function(err, count) {
        if(count < 1) {
            console.log('Complete index ', elasticsearchCount);
            console.log('-------------------------------------------');
            elasticsearchCount = 0;
        }
    });
});

queue.on('failed attempt', function(errorMessage, doneAttempts){
    console.log('Job failed');
});

queue.on('failed', function(errorMessage){
    console.log('Job failed');
});

queue.process('index', function(job, done){
    indexJob(job.data, done);
});


/*************************************************************************************/


exports.indexData = function (req, res, elastic) {
    console.log("schema");
    console.log(schema);
    
    
    var schema = req.params.schema;
    
    indexCollectionFromMongotoElastic(schema, elastic, function(err,data){
        if(err){
            res.status(500);
            return res.jsonp({'results':data, 'errors':err});
        }
        res.status(200);
        return res.jsonp({'results': data, 'errors' : err});
    });
};

exports.deleteNodeFromMongo = function (req, res) {
    var type = req.params.type;
    var query = {type : type};
    var Collection = db.collection('node');
    Collection.remove(query, function (err) {
        if (err) {
            res.status(500);
            return res.jsonp({'error':err});
        }
        res.status(200);
        return res.jsonp({'Delete All from' : type});
    });
};

exports.deleteAllScrapedUserFromMongo = function (req, res) {
    var query = {roles: 'scraped user'};
    var Collection = db.collection('user');
    Collection.remove(query, function (err) {
        if (err) {
            res.status(500);
            return res.jsonp({'error':err});
        }
        res.status(200);
        return res.jsonp({'Delete All' : 'scraped user'});
    });
};

exports.index = function (data, type, elastic,cb) {
    var obj = setDataToElastic(data, elastic);
    type =  obj.type;
    delete obj.type;
    var id = obj.id;
    delete obj.id;
    var typespecific = obj.typespecific;
    delete obj.typespecific;

    elastic.index({
        index: type,
        type: typespecific?typespecific:type,
        id:id,
        body: obj
    }, function (err, response) {
        if(!cb) {
            if (err) {
                return {'error': err.message};
            }
            return {'response': response};
        }
        cb(response,err);
    });
};

exports.indexCompletion  = function (data, type, elastic,fieldName) {
    var obj = typeof data === 'string' ? JSON.parse(data) : data;
    var objCompletion = {};
    var inputVal = [];
    inputVal[0] = data.name;
    if(data.field_ps_label && data.field_ps_label.length >0){
        if(data.field_ps_label[0]) {
            inputVal = data.field_ps_label;
        }
    }
    objCompletion.name = data.name;
    objCompletion[fieldName] = {input:inputVal,payload:{tid:data.tid},weight:data.weight};
    elastic.index({
        index: 'completion_index',
        type: type,
        id: obj.tid ,
        body: objCompletion
    }, function (err, response) {
        if (err) {
            return {'error' : err.message};
        }
        return {'response': response};
    });
};

exports.indexCategories  = function (data, type, elastic,fieldName) {
    var obj = typeof data === 'string' ? JSON.parse(data) : data;
    obj = {};
    var inputVal = [];
    inputVal[0] = data.name;
    if(data.field_ps_label && data.field_ps_label.length >0){
        if(data.field_ps_label[0]) {
            inputVal = data.field_ps_label;
        }
    }
    obj.tid = data.tid;
    obj.id = data.tid + '_' + data.lang;
    obj.lang = data.lang;
    obj.text = inputVal;
    //obj.textString = (inputVal[0]) ? changeCase.lowerCase(inputVal[0]) : '';
    obj.parents = [];
    obj.counter = (data.counter === undefined) ? 0 : data.counter;
    obj.field_approved = data.field_approved;
    if(data.parents_all.length)
        data.parents_all.forEach(function(parent) {
            if(obj.parents.indexOf(parent.tid) === -1 && data.tid !== parent.tid)
                obj.parents.push(parent.tid);
        });
    if(data.parentsText){
        obj.parentsText = data.parentsText;
    }
    if (data.label_list)  {
        obj.label_list = data.label_list;
    }
    if (data.description) {
            obj.description = data.description;
        }
    if(type === 'pc_s') {
        if (data.category_parents) {
            obj.category_parents = data.category_parents;
        }
        if(data.textWithGroup) obj.textWithGroup = data.textWithGroup;
        obj.vid = data.vid;
        obj.featureParent = data.field_features && data.field_features.length ? data.field_features[0].tid:'';
        obj.field_ps_field_type = data.field_ps_field_type ? data.field_ps_field_type :'';
        obj.parentFeatureText = data.parentFeatureText ? data.parentFeatureText :'';

    }
    if(type === 'leaveCategory'){
        obj.featureParent = data.field_features && data.field_features.length ? data.field_features[0].tid:'';
    }
    // obj.weight = data.weight;
    elastic.index({
        index: 'categories',
        type: type,
        id: obj.id ,
        body: obj
    }, function (err, response) {
        if (err) {
            return {'error' : err.message};
        }
        return {'response': response};
    });
};

exports.remove = function (data,elastic) {
    var idObj = {};
    if(data.nid) {
        idObj.nid = data.nid;
    }
    else if(data.uid) {
        idObj.uid = data.uid;
    }
    else if (data.tid) {
        idObj.tid = data.tid;
    }
    var query ={'query': { 'term': idObj}};
    elastic.search({
        'from': 0,
        'size': 3000,
        'body': query
    }).then(function (body) {
        if (body.hits.hits.length > 0){
            body.hits.hits.forEach(function(hit) {
                elastic.deleteByQuery({
                    index: hit._index,
                    body: query
                }).then(function (response) {
                    return response;
                }, function (error) {
                    console.log('cannot remove the node' + data.nid);
                });
            });
        }

    }, function(error){
        console.log('cannot find the node' + data.nid);
    });
};

exports.updateTaxonomyCounter = function(data, elastic)  {
    var Collection = db.collection('node');
    var CollectionTax = db.collection('taxonomy');
    var query = {'nid' : data.nid};
    var queryField = {field_ps_categories : 1, field_categories_features : 1, status: 1, old_status: 1};

    Collection.findOne(query, queryField, function(err, doc) {
        var tids = [];
        var i;
        var flag = doc.status;
        if (!flag)
            flag = -1;
        if (doc.status !== doc.old_status)  {
            if (doc.field_ps_categories !== undefined)  {
                for (i = 0; i < doc.field_ps_categories.length; i++) {
                    tids.push(doc.field_ps_categories[i].tid);
                }
            }
            if (doc.field_categories_features !== undefined)  {
                for (i = 0; i < doc.field_categories_features.length; i++) {
                    tids.push(doc.field_categories_features[i].tid);
                }
            }
            CollectionTax.update({'tid': {'$in' : tids}}, {$inc: {counter : flag}}, {multi: true},function (err, status){
                CollectionTax.find({'tid': {'$in' : tids}}).toArray(function(err, tidsObj) {
                    tidsObj.forEach(function(tidObj) {
                        exports.index(tidObj, null, elastic);
                    });
                });   
            });          
        } 
    });    
};

/************************************************************************************/


function indexJobUserPublishedFields(data, done) {
    var offset = data.offset;
    var limit = 100;
    var Collection = db.collection('user');
    Collection.find().limit(limit).skip(offset).toArray(function (err, users) {
        if(!err && users.length)  {
            users.forEach(function(user) {

                /*update published field*/
                if (!user.publishFields)
                    user.publishFields = {};

                user.publishFields = {
                    'firstName' :               user.publishFields.firstName !== undefined               ? user.publishFields.firstName               : true,
                    'lastName' :                user.publishFields.lastName !== undefined                ? user.publishFields.lastName                : true,
                    'companyName' :             user.publishFields.companyName !== undefined             ? user.publishFields.companyName             : true,
                    'companyWebsite' :          user.publishFields.companyWebsite !== undefined          ? user.publishFields.companyWebsite          : true,
                    'companyLogo' :             user.publishFields.companyLogo !== undefined             ? user.publishFields.companyLogo             : true,
                    'mail' :                    user.publishFields.mail !== undefined                    ? user.publishFields.mail                    : false,
                    'field_address_text' :      user.publishFields.field_address_text !== undefined      ? user.publishFields.field_address_text      : user.commercial ? true : false,
                    'field_geo_points' :        user.publishFields.field_geo_points !== undefined        ? user.publishFields.field_geo_points        : user.commercial ? true : false,
                    'allAddress' :              user.publishFields.allAddress !== undefined              ? user.publishFields.allAddress              : user.commercial ? true : false,
                    'field_address_guidlines' : user.publishFields.field_address_guidlines !== undefined ? user.publishFields.field_address_guidlines : user.commercial ? true : false,
                    'field_groups' :            user.publishFields.field_groups !== undefined            ? user.publishFields.field_groups            : true,
                    'field_organizations' :     user.publishFields.field_organizations !== undefined     ? user.publishFields.field_organizations     : true,
                    'picture' :                 user.publishFields.picture !== undefined                 ? user.publishFields.picture                 : true,
                    'about' :                   user.publishFields.about !== undefined                   ? user.publishFields.about                   : true,
                    'main_business' :           user.publishFields.main_business !== undefined           ? user.publishFields.main_business           : true,
                    'google' :                  user.publishFields.google !== undefined                  ? user.publishFields.google                  : true,
                    'facebook' :                user.publishFields.facebook !== undefined                ? user.publishFields.facebook                : true
                };



                /*update contact phones*/
                if (user.phone === undefined) {
                    if (user.field_phone !== undefined) {
                        user.phone = user.field_phone;
                        delete user.field_phone;
                    }
                    else user.phone = [];
                }

                user.phone.forEach(function(phone) {
                    if(phone.publishPhone === undefined)
                        phone.publishPhone = true;
                });

                /*company name*/
                if (user.companyName === undefined) {
                    if (user.field_company_name !== undefined) {
                        user.companyName = user.field_company_name;
                        //delete user.field_company_name;
                    }
                    else user.companyName = null;
                }

                /*company website*/
                if (user.companyWebsite === undefined) {
                    if (user.field_company_website !== undefined) {
                        user.companyWebsite = user.field_company_website;
                        //delete user.field_company_website;
                    }
                    else user.companyWebsite = null;
                }

                /*address text*/
                if (user.about === undefined) {
                    if (user.field_about !== undefined) {
                        user.about = user.field_about;
                        //delete user.field_about;
                    }
                    else user.about = null;
                }

                /*about*/
                if (user.field_address_text === undefined) {
                    if (user.addressText !== undefined) {
                        user.field_address_text = user.addressText;
                        //delete user.addressText;
                    }
                    else user.field_address_text = null;
                }

                Collection.update({'uid': user.uid}, user,function (err, status){
                });

            });
            console.log('indexJobUserPublishedFields',users.length);
            done();
        }
        else  {
            done(err);
        }
    });
}

queue.process('userPublishedFields', function(job, done){
    indexJobUserPublishedFields(job.data, done);
});

exports.setUserPublishedFields = function(req, res)  {
    var CollectionUser = db.collection('user');
    var limit = 100;
    var offset = 0;
    var countItem;
    CollectionUser.count(function (err, count)  {
        countItem = count;
        console.log('countItem in mongoDB: ',countItem);
        for (offset = 0 ;offset < countItem;)  {
            queue.create('userPublishedFields', {offset: offset}).priority('high').removeOnComplete(true).save();
            offset = limit + offset;
        }
        if ((offset - countItem) < limit)
            queue.create('userPublishedFields', {offset: offset}).priority('high').removeOnComplete(true).save();
    });
    res.status(200);
    return res.jsonp({'createUserPublishedFields' : ''});
};
