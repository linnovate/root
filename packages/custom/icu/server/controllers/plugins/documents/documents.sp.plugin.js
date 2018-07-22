let config = require('meanio').loadConfig();
var crud = require('../../../controllers/crud.js');
var documentModel = require('../../../models/document');
  
//  let DocumentPlugin = require('./documents.class.plugin')
const { DocumentPlugin } = require('./classes/documents.class.plugin');

class SpDocumentPlugin extends DocumentPlugin {
  constructor() {      
    super() ; 

    this.overridenFunctions = ['all'] ; // will override default crud in this class.
    Object.keys(this).forEach((methodName)  => {
      // override default crud methods as part of this class.
      if(this.overridenFunctions.includes(methodName)) {
        delete this[methodName];
      }
    });
  }

  type(req, res, next) {
    console.log("SpDocumentPlugin") ;
    next() ;
  }
  
  /**
    * get all documents - overrides crud default get all
    * req.params.id will consist mongoDB _id of the user
    * should be a part of crud.all
  */
  all(req, res, next) {
    var start = 0, limit = 25, sort = 'created';
    if(req.query) {
      start = parseInt(req.query.start);
      limit = parseInt(req.query.limit);
      sort = req.query.sort;
    }
    documentModel.find({
      $or: [{watchers: {$in: [req.user._id]}}, {assign: req.user._id}]
    }).sort({sort: 1}).skip(start).limit(limit).populate('folder')
      .populate('creator')
      .populate('updater')
      .populate('sender')
      .populate('sendingAs')
      .populate('assign')
      .populate('relatedDocuments')
      .populate('forNotice')
      .populate('watchers')
      .populate('doneBy')
      .populate('signBy')
      .exec(function(err, data) {
        if(err) {
          logger.log('error', '%s getAll, %s', req.user.name, 'Document.find', {error: err.message});
          req.locals.error = err;
          req.status(400);
        }
        else {
          req.locals.result = data;
          res.send(data);
        }
      });
  };


  /**
  *
  * req.params.id contains document mongo id to delete
  *
  */
  deleteDocument(req, res,next) {
    // document find - not needed this.document.read(req.params.id, req.user, req.acl)
    
    Document.find({_id: req.params.id}, function(err, file) {
      if(err) {
        logger.log('error', '%s deleteDocument, %s', req.user.name, ' Document.find', {error: err.message});
      }
      else {
        var spPath = file[0]._doc.spPath;
      if(spPath) { // not needed
          var fileName = spPath.substring(spPath.lastIndexOf('/') + 1, spPath.length);
          var spPath2 = spPath.substring(0, spPath.lastIndexOf('/'));
          var folderName = spPath.substring(spPath2.lastIndexOf('/') + 1, spPath2.length);
          var spPath2 = spPath2.substring(0, spPath2.lastIndexOf('/'));
          var libraryName = spPath2.substring(spPath2.lastIndexOf('/') + 1, spPath2.length);
          var user = req.user.email.substring(0, req.user.email.indexOf('@'));
          var context = {
            siteUrl: config.SPHelper.SPSiteUrl,
            creds: {
              username: config.SPHelper.username,
              password: config.SPHelper.password,
              domain: config.SPHelper.domain
            }
          };
          var options = {
            folder: '/' + libraryName + '/' + folderName,
            filePath: '/' + fileName
          };

          var json = {
            context: context,
            options: options
          };
          request({
            url: config.SPHelper.uri + '/api/delete',
            method: 'POST',
            json: json
          }, function(error, resp, body) {
            if(error) {
              logger.log('error', '%s deleteDocument, %s', req.user.name, ' request', {error: error.message});

            }
            else {
              logger.log('info', '%s deleteDocument, %s', req.user.name, 'success with SP');

              res.sendStatus(200);

            }
          });


        }
      }
      this.document.destroy(req, res, next); // using crud
    });
  };
}  

module.exports = SpDocumentPlugin ;

