const documentPlugin = require('./../services/document.plugins.service') ;

//const documentPlugin = require('./plugins/documents.sp.plugin').documentPlugin;
//const documentPlugin = require('./plugins/documents.default.plugin').documentPlugin;
let allFunx = getAllFuncs(documentPlugin) ;
console.log(allFunx) ;

function getAllFuncs(obj) {
  return Object.keys(obj) ;
}

exports.plugin = documentPlugin ;
