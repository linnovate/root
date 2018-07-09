let config = require('meanio').loadConfig();
const { DocumentPlugin } = require('./classes/documents.class.plugin');

class DefaultDocumentPlugin extends DocumentPlugin {
  constructor() {  
    super() ;  
  }

  type(req, res, next) {
    console.log("DefaultDocumentPlugin") ; 
    next() ;
  }
}

module.exports = DefaultDocumentPlugin;