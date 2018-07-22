var crud = require('./../../../crud.js');

class DocumentPlugin {
  constructor() {
    const options = {
      includes: 'assign watchers',
      defaults: {watchers: []}
    };   
    
    this.document = crud('documents', this.options);

    // as part of constructing the document object, set the default crud behaviour.
    this.overridenFunctions = ['create','update'] ; // will override default crud in this class.
    
    Object.keys(this.document).forEach((methodName)  => {
        // make the default crud methods part of the class.        
        if(!this.overridenFunctions.includes(methodName)) {
          this[methodName] = this.document[methodName];
        }
    });
  }  

  type(req, res, next) {
    console.log("DocumentPlugin class") ;      
    next() ;
  }

  // override crud default
  create(req, res, next) {
    console.log("SAVE XXXXXXXXXXXXXXXXXXXX AAAAAAAAAAAAAA")  ;
    
    if(req.locals.error) {
      return next();
    }
    console.log("DocumentPlugin crud create override") ;
    console.log(req.body) ;
    req.locals.result = req.body ;
    // and now do the crud method...
    this.document.create(req, res, next);
  }; 
  
  // override crud default
  update(req, res, next) {
    console.log("DocumentPlugin crud update override") ;
    console.log("updated XXXXXXXXXXXXXXXXXXXX AAAAAAAAAAAAAA")  ;
    console.log(req.body) ;
    if(req.locals.error) {
      return next();
    }
    // and now do the crud method...
    this.document.update(req, res, next).then(() => {
      conosle.log("updated XXXXXXXXXXXXXXXXXXXX")  ;
    })
  };

  delete(req, res, next) {
    // call crud destroy
    this.destroy(req, res, next) ;
  }
  
  // set the document viewed == true. (called after the document is sent this document is sent)
  // todo this can be simple crud.
  distributedDocument(req, res, next) {
    officeDocument  = req.body.officeDocument;
    var id = req.params.id;
    Document.update({_id: id}, {$set: {status: 'viewed'}}, function(error, result) {
      if(error) {
        logger.log('error', '%s distributedDocument, %s', req.user.name, '  Document.update', {error: error.message});

        res.send(error);
      }
      else {
        logger.log('info', '%s distributedDocument, %s', req.user.name, 'success');

        res.send('ok');
      }
    });
  };
  

  // get user document distributed == viewed.
  // gets a list of users that read this document (in document.readBy list)
  readByDocument(req, res, next) {
    officeDocument  = req.body.officeDocument;
    var readBy = officeDocument.readBy;
    var readbyToId = [];
    readBy.forEach(function(element) {
      readbyToId.push(new mongoose.Types.ObjectId(element.user));
    });
    var id = req.params.id;
    User.find({
      _id: {$in: readbyToId}
    }, function(err, docs) {
      if(err) {
        logger.log('error', '%s readByDocument, %s', req.user.name, '   User.find', {error: err.message});
        res.send(error);
      }
      else {
        logger.log('info', '%s readByDocument, %s', req.user.name, 'success');
        res.send(docs);
      }
    });
  };



  // update user document received.
  receiveDocument(req, res, next) {
    officeDocument  = req.body.officeDocument;
    var id = req.params.id;
    Document.update({_id: officeDocument.ref}, {$push: {readBy: {date: Date.now(), user: req.user._id}}}, function(error, result) {
      if(error) {
        logger.log('error', '%s receiveDocument, %s', req.user.name, '  Document.update', {error: error.message});
      }
      else {
        logger.log('info', '%s receiveDocument, %s', req.user.name, 'success');
      }
    });

    Document.update({_id: id}, {$set: {viewed: true}}, function(error, result) {
      if(error) {
        logger.log('error', '%s receiveDocument, %s', req.user.name, '  Document.update', {error: error.message});

        res.send(error);
      }
      else {
        logger.log('info', '%s receiveDocument, %s', req.user.name, 'success');

        res.send('ok');
      }
    });
  };

  // gets the list of users this document was sent to (in document.sentTo list)
  sentToDocument(req, res, next) {
    officeDocument  = req.body.officeDocument;
    var sentTo = officeDocument.sentTo;
    var sentToId = [];
    sentTo.forEach(function(element) {
      sentToId.push(new mongoose.Types.ObjectId(element.user));
    });
    var id = req.params.id;
    User.find({
      _id: {$in: sentToId}
    }, function(err, docs) {
      if(err) {
        logger.log('error', '%s sentToDocument, %s', req.user.name, '   User.find', {error: err.message});
        res.send(error);
      }
      else {
        logger.log('info', '%s readByDocument, %s', req.user.name, 'success');
        res.send(docs);
      }
    });
  };


}
  
module.exports.DocumentPlugin = DocumentPlugin
