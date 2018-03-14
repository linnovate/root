'use strict';
var _ = require('lodash') ;

exports.permError = 
{
  denied: "permission denied",
  allowUpdateWatcher: "update permissions for user",
  allowAssign: "content update",
  allowUpdateContent: "content update"
} ;

exports.searchIdIndex = function(idVal, arr) {
  console.log("searchIdIndex");
  console.log(JSON.stringify(arr));
  console.log(JSON.stringify(idVal));
  console.log("searchIdIndex<<<");
  for (let i = 0; i < arr.length; i++) {
    console.log(arr[i].id);
    console.log(idVal);
    if (String(arr[i].id) === String(idVal)) {
      console.log("EXISTS!!!");
      return i;
    }
  }
  return null;
};


function leftIntersect(arr, a) {
  let filtered = arr.filter(function(i) {
    return a.indexOf(i) == -1 ? true : false;
  });
  return filtered;
}

function isDifferentArray(arr1, arr2) {
  console.log(arr1) ;
  console.log(arr2) ;
  var result = arr1.filter(function(o1){
    return !arr2.some(function(o2){
        console.log(o1.id) ;
        console.log(o2.id) ;
        console.log("====") ;
        return String(o1.id) === String(o2.id);
    });
  })
  if (result.length == 0) {
    return false ;
  }
  console.log(result) ;
  return true;

}


/*
  update permission array
  input: old Document, new Document
  output: permissions array
*/
exports.updatePermsArray = function(user, oldDoc, newDoc) {
  console.log("updatePerms") ;

  // permissions array update neded?
  let oldPerms = Array.isArray(oldDoc['permissions']) ? oldDoc['permissions'].slice() : [];
  let newPerms = Array.isArray(newDoc['permissions']) ? newDoc['permissions'].slice() : [];
  console.log("DIFF PERMS:") ;
  let diff = isDifferentArray(oldPerms,newPerms, _.isEqual) ;
  console.log(diff) ;
  if(diff == false) return null ;

    
    // is user allowed to update Perms?    
    console.log(newPerms) ;
    if(!exports.allowUpdateWatcher(user, newPerms)) {
      console.log("updated perms array - not allowed");
      return null ;
    }  
  
    let oldWatchers = oldDoc.watchers.map(function (item) {
      // console.log(JSON.stringify(item._doc)) ;
      // console.log(item._doc._id) ;
      return String(item._doc._id) ;
    }) ;
  
    let newWatchers = newDoc.watchers.map(function (item) {
      return String(item);
    }) ;
  
    // watcher added
    let watcherAdded = leftIntersect(newWatchers,oldWatchers) ;
  
    console.log("updating perms...") ;
                  
    console.log("original perms array:");
    console.log(newPerms);
    console.log("--------------------");
  
    if(watcherAdded.length > 0) {      
      let watcherAddedPerms = {id:String(watcherAdded[0]),level:"viewer"} ; // default watcher perms
      newPerms.push(watcherAddedPerms);
    }                        
    // console.log("old-->");
    // console.log(JSON.stringify(oldWatchers));
    // console.log("new-->");
    // console.log(JSON.stringify(newWatchers));
    // console.log("added ->>");
    // console.log(JSON.stringify(watcherAdded));
  
    // watcher removed
    let watcherRemoved = leftIntersect(oldWatchers,newWatchers) ;
    // console.log("old-->");
    // console.log(JSON.stringify(oldWatchers));
    // console.log("new-->");
    // console.log(JSON.stringify(newWatchers));
    // console.log("removed ->>");
    // console.log(JSON.stringify(watcherRemoved));    
    if(watcherRemoved.length > 0) {      
      let index = exports.searchIdIndex(watcherRemoved[0], newDoc.permissions) ;// remove from permissions array
      newPerms.splice(index,1);
    }

  console.log("updated perms array:");
  console.log(newPerms);
  console.log("--------------------");

  return newPerms ;
};


/*
  allow assign
*/
exports.allowAssign = function(user, perms) {
  console.log("permissions assign true");
  return true ;
};


/*
  allow update of entity info.
*/
exports.allowUpdateContent = function(user, perms, field) {
  console.log("permissions update true");
  return true ;
};

/*
  allow update watchers
*/
exports.allowUpdateWatcher = function(user, perms) {
  let index = exports.searchIdIndex(user._id,perms) ;
  if(index && perms[index].level == editor) {
  console.log("permissions 'update watcher' true");
  return true ;
  }
  console.log("permissions 'update watcher' false");
  return false ;
};

