var crud = require('./../../../crud.js');

class DocumentPlugin {
  constructor() {
    const options = {
      includes: 'assign watchers',
      defaults: {watchers: []}
    };   
    
    this.document = crud('documents', this.options);

    // as part of constructing the object, set the default crud behaviour.
    Object.keys(this.document).forEach((methodName)  => {
        // make the default crud methods part of the class.
        this[methodName] = this.document[methodName];
    });
  }  

  type(req, res, next) {
    console.log("DocumentPlugin class") ;      
    next() ;
  }

  create(req, res, next) {
    if(req.locals.error) {
      return next();
    }
    console.log("DocumentPlugin crud create override") ;
    console.log(req.body) ;
    req.locals.result = req.body ;
    // and now do the crud method...
    this.document.create(req, res, next);
  }; 
  
  update(req, res, next) {
    console.log("DocumentPlugin crud update override") ;
    console.log(req.body) ;
    if(req.locals.error) {
      return next();
    }
    // and now do the crud method...
    this.document.update(req, res, next);
  };

  delete(req, res, next) {
    this.destroy(req, res, next) ;
  }
  
  destroy(req, res, next) {
    if(req.locals.error) {
      return next();
    }
  }; 
}
  
module.exports.DocumentPlugin = DocumentPlugin
