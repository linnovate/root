let config = require('meanio').loadConfig();
const { DocumentPlugin } = require('./classes/documents.class.plugin');

class DefaultDocumentPlugin extends DocumentPlugin {
  constructor() {  
    super() ;  
    
    this.overridenFunctions = [] ; // will override default crud in this class.
    Object.keys(this).forEach((methodName)  => {
      // override default crud methods as part of this class.
      if(this.overridenFunctions.includes(methodName)) {
        delete this[methodName];
      }
    });
  }

  type(req, res, next) {
    console.log("DefaultDocumentPlugin") ; 
    next() ;
  }
}

module.exports = DefaultDocumentPlugin;