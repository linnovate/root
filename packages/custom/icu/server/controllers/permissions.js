'use strict';

var q = require('q');

var TaskModel = require('../models/task.js');
var ProjectModel = require('../models/project.js');
var DiscussionModel = require('../models/discussion.js');
var OfficeDocumentsModel = require('../models/document.js');

var _ = require('lodash') ;
var entityNameMap = {
  'task': {
    mainModel: TaskModel,
//      archiveModel: TaskArchiveModel,
    name: 'task'
  },
  'project': {
    mainModel: ProjectModel,
//      archiveModel: ProjectArchiveModel,
    name: 'project'
  },
  'discussion': {
    mainModel: DiscussionModel,
//      archiveModel: DiscussionArchiveModel,
    name: 'discussion'
  },
  'officeDocuments':{
    mainModel: OfficeDocumentsModel,
//      archiveModel: OfficeDocumentsArchiveModel,
    name: 'officeDocument'
  },
  'officeDocument': {
    mainModel: OfficeDocumentsModel,
//      archiveModel: OfficeDocumentsArchiveModel,
    name: 'officeDocument'
  },
};

exports.permError = 
{
  denied: "permission denied",
  granted: "permission granted",
  system: "update problem in occured",
  db: "db issue occured",
  allowUpdateWatcher: "update permissions for user",
  allowAssign: "assignee update",
  allowUpdateContent: "content update",
  allowCreateContent: "content create"
} ;

/*
    function: search if value exist in array in the format of arraItem.id
    return: the index in which the value exist, or null otherwise.
*/
exports.searchIdIndex = function(idVal, arr) {
  for (let i = 0; i < arr.length; i++) {
    if (String(arr[i].id) === String(idVal)) {
      //  console.log("user EXISTS!!!");
      return i;
    }
  }
  return null;
};

/*
    function: return the values that exist in both input arrays, 
    and the values that exist only in the first array.
    input: 2 arrays.
    return: the index in which the value exist, or null otherwise.
*/
function leftIntersect(arr1, arr2) {
  let filtered = arr1.filter(function(i) {
    return arr2.indexOf(i) == -1 ? true : false;
  });
  return filtered;
}

/*
    function: check if there is an id in arr2, that is not present in 1.    
    input: 2 arrays.
    return: true if id is found in arr2 and arr1, false otherwise.
*/
function isDifferentArray(arr1, arr2) {
  // console.log(JSON.stringify(arr1)) ;
  // console.log(JSON.stringify(arr2)) ;
  let result = [] ;

  if(arr1.length != arr2.length) {
    return true ;
  }

  arr1.forEach(function(a1) {
    if(arr2[a1]) {
      result++ ;
    }
  })

  arr2.forEach(function(a2) {
    if(arr1[a2]) {
      result++ ;
    }
  })

  if (result == 0) {
    return false ;
  }

  return true;
}


/*
  update permission array
  input: old Document, new Document
  output: permissions array
*/
exports.updateContent = function(user, oldDoc, newDoc) {

  console.log("updateContent" ) ;

  
  if(oldDoc.profile) {
    // hack the type of content to update is user 
    // since it has a profile...
    // since we do not have user update permission always return true
    return true ;
  }
  
  let newPerms = doc && Array.isArray(newDoc['permissions']) ? newDoc['permissions'].slice() : [];

  // is user allowed to update content?    
  if(!exports.allowUpdateContent(user, newPerms, {})) {
    console.log("updated content - not allowed");
    return false ;
  }

  // user can update cuntent - check what field is being updated.
  // if (!isFieldEditable(user, oldDoc, newDoc)) {
  //   return false ;
  // }

  return true ;
}

exports.syncPermsArray = function(user, doc) { 
  // console.log("syncPermsArray >>>>") ;
  // console.log(doc) ;
  return true ;
}


/* createContent
   returns a deffered promise: resolved / err
*/
exports.createContent = function(user, oldDoc, newDoc) {
  console.log("permissions createContent") ;
  console.log(JSON.stringify(newDoc)) ;
  let deffered = q.defer();
  
  if (newDoc.type == 'comment') {    
    let Model = entityNameMap[newDoc.issue].mainModel;    

    Model.findOne({'_id': oldDoc.issueId},function(err,doc){
      // console.log("doc") ;
      // console.log(doc) ;
      let newPerms = doc && Array.isArray(doc['permissions']) ? doc['permissions'].slice() : [];      
      if(!exports.allowUpdateContent(user, newPerms, {})) {
        console.log("updated comments - not allowed");
        deffered.reject(exports.permError.denied + ":" + exports.permError.allowCreateContent);
        return deffered.promise;
      }  
      console.log("updated comments - allowed");      
      deffered.resolve("OK") ;  
      return deffered.promise;        
    })
    return deffered.promise;            
  }
  if(newDoc.type == 'assign' && newDoc.issue == 'officeDocuments') {
    // this piece of code is designed to UPDATE watchers/permissions for new officeDoc assign.
    // console.log("assign");
    // console.log(JSON.stringify(newDoc));
    let Model = entityNameMap['officeDocument'].mainModel;
    let assigneeAdded = String(newDoc.userObj) ;     
    
    Model.findOne({'_id': newDoc.issueId},function(err,doc){
      // push assignee permissions
      let exist = exports.searchIdIndex(String(assigneeAdded),doc['permissions']) ;

      if(exist == null) {
//        console.log("adding assignee") ;      
        let tmp = doc['permissions'].slice() ;
        tmp.push({"id":String(assigneeAdded),"level":"commenter"});
        doc['permissions'] = tmp ;

        // we need to add assignee as watcher if the assignee is not a watcher already
        let tmp2 = doc['watchers'] ;
        tmp2.push(String(doc.assign))
        doc['watchers'] = tmp2 ;
      }
      else {
        // update the level of assignee permission to editor
//        console.log("updating assignee") ;
        // console.log("perms array before:");
        // console.log(JSON.stringify(doc['permissions']));
        // console.log("--------------------");
  
        let tmp = doc['permissions'] ;
        tmp.splice(exist,1) ;
        tmp.push({"id":String(assigneeAdded),"level":"commenter"});
        doc['permissions'] = tmp ;
        // console.log("perms array after:");
        // console.log(JSON.stringify(doc['permissions']));
        // console.log("--------------------");
      }
      doc.save(function(err,result){
        //         todo        
        //         if(err){
        //         }
        //         else{          
        //         }
        //         return deffered.promise;
      });
      deffered.resolve(newDoc);
      return deffered.promise;       
      })
    return deffered.promise;                
  }
  if(newDoc.type == 'updateWatcher' && newDoc.issue == 'officeDocuments') {
    // this piece of code is designed to UPDATE watchers/permissions for new officeDoc watchers.
    let newUid = newDoc.userObj._id ? newDoc.userObj._id : newDoc.userObj ;
    let Model = entityNameMap['officeDocument'].mainModel;
    Model.findOne({'_id': newDoc.issueId},function(err,doc){
      // console.log("doc") ;
      // console.log(doc) ;
      let newPerms = doc && Array.isArray(doc['permissions']) ? doc['permissions'].slice() : [];
      console.log(newPerms) ;

      
      let watcherAdded = String(newUid) ;      
      // console.log("updateWatcher:"); 
      // console.log(watcherAdded);

      let permLevel = String(watcherAdded) == String(newDoc.assign) ? 'commenter' : 'viewer' ;
      let watcherAddedPerms = {id:String(watcherAdded),level:permLevel} ; // default watcher perms      

      newPerms.push(watcherAddedPerms);
      // console.log("updated perms array:");
      // console.log(JSON.stringify(newPerms));
      // console.log("--------------------");
      doc.permissions = newPerms ;  
      // console.log(JSON.stringify(doc));      
      
      doc.save(function(err,result){
//         todo        
//         if(err){
//         }
//         else{          
//         }
//         return deffered.promise;
      });
      deffered.resolve(newDoc) ;  
      return deffered.promise;        
    })
    return deffered.promise;        
  }
  if(newDoc.type == 'removeWatcher' && newDoc.issue == 'officeDocuments') {
    // this piece of code is designed to REMOVE watchers/permissions for new officeDoc watchers.
    let newUid = newDoc.userObj._id ? newDoc.userObj._id : newDoc.userObj ;
//    console.log("remove watcher perms...");
    let Model = entityNameMap['officeDocument'].mainModel;
    Model.findOne({'_id': newDoc.issueId},function(err,doc){
      console.log("doc");
      console.log(doc) ;
      let newPerms = doc && Array.isArray(doc['permissions']) ? doc['permissions'].slice() : [];
      console.log(newPerms) ;
      let watcherRemoved = String(newUid);      
      let exist = exports.searchIdIndex(String(watcherRemoved),newPerms) ;
      // console.log("perms array before:");
      // console.log(JSON.stringify(doc['permissions']));
      // console.log("--------------------");

      if(exist == null) {
        // cannot find removed watcher - this shouldnt happen
        deffered.reject(exports.permError.system) ;  
        return deffered.promise;
      }

      doc['permissions'].splice(exist,1) ;
      // console.log("updated doc['permissions'] array:");
      // console.log(JSON.stringify(doc['permissions']));
      // console.log("--------------------");
      doc.save(function(err,result){
//         todo        
//         if(err){
//         }
//         else{          
//         }
//         return deffered.promise;
      });
      deffered.resolve(newDoc) ;  
      return deffered.promise;        
    })
    return deffered.promise;        
  }
  deffered.resolve("OK") ;  
  return deffered.promise;        
}


function cleanArray(actual) {
  var newArray = new Array();
  for (var i = 0; i < actual.length; i++) {
    if (actual[i] && actual[i]!="null") {
      newArray.push(actual[i]);
    }
  }
  return newArray;
}


/*
  update permission array
  input: old Document, new Document
  output: permissions array
*/
exports.updatePermsArray = function(user, oldDoc, newDoc) {

  // console.log("updatePermsArray") ;
  // console.log("// check if the added watcher is the assignee:") ;
  // console.log(JSON.stringify(newDoc)) ;
  let oldWatchers = oldDoc.watchers instanceof Array ? oldDoc.watchers.map(function (item) {
    return String(item._doc._id) ;
  }) : [];

  let newWatchers = oldDoc.watchers instanceof Array ? newDoc.watchers.map(function (item) {
    return String(item);
  }) : [] ;

  newWatchers = cleanArray(newWatchers) ;

  // permissions array update needed? check if watchers changed.  
  let diff = isDifferentArray(oldWatchers,newWatchers);
//  console.log("DIFF PERMS ARRAY:") ;
//  console.log(diff) ;
  if(diff == false) {
    return true ; // not different (users not added or removed), noop.
  }

  let newPerms = doc && Array.isArray(newDoc['permissions']) ? newDoc['permissions'].slice() : [];
  
  // is user allowed to update Perms?    
  // console.log("newPerms:") ;
  // console.log(JSON.stringify(newPerms));
  if(!exports.allowUpdateWatcher(user, newPerms)) {
    console.log("updated perms array - not allowed");
    return false ;
  }  

  // console.log("updating perms...") ;                
  // console.log("original perms array:");
  // console.log(newPerms);
  // console.log("--------------------");

  // watcher added
  let watcherAdded = leftIntersect(newWatchers,oldWatchers) ;
  if(watcherAdded.length > 0) {
    // check if the added watcher is the assignee:      
    // console.log("ASSIGNEE:") ;
    // console.log(JSON.stringify(newDoc.assign)) ;
    watcherAdded.forEach(function(watcher) {
      let permLevel = String(watcher) == String(newDoc.assign) ? 'commenter' : 'viewer' ;
      
      // console.log("LEVEL:") ;
      // console.log(permLevel) ;           
      let watcherAddedPerms = {id:String(watcher),level:permLevel} ; // default watcher perms
      newPerms.push(watcherAddedPerms);
    })
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

  // console.log("updated perms array:");
  // console.log(newPerms);
  // console.log("--------------------");
  newDoc.permissions = newPerms ;
  return true ;
};


/*
  allow update watchers
*/
exports.allowUpdateWatcher = function(user, perms) {
  let uid =  String(user.user._id);
  let index = exports.searchIdIndex(String(uid),perms) ;
  if(index != null && perms[index].level == "editor") {
    console.log("permissions 'update watcher' true");
    return true ;
  }
  console.log("permissions 'update watcher' false");
  return false ;
};


/*
  allow assign
*/
exports.allowAssign = function(user, perms) {
  return exports.allowUpdateWatcher(user, perms) ;
};


/*
  allow update watchers level
*/
exports.allowUpdateWatcherLevel = function(user, perms) {
  return exports.allowUpdateWatcher(user, perms) ;
};


/*
  allow update of entity info.
*/
exports.allowUpdateContent = function(user, perms, field) {
  let uid =  String(user.user._id);
  console.log("perms:") ;
  console.log(JSON.stringify(perms)) ;
  let index = exports.searchIdIndex(String(uid),perms) ;
  let allowed = [] ;
  let permsAllowed = ["editor", "commenter"] ;
  if (index == null) {
    return false ;
  }

  allowed = permsAllowed.filter(function(element) {
      return element == perms[index].level; // user has perm
  }) ;

  // console.log("permissions 'update content': ");
  // console.log(allowed.length > 0 ? "true" : "false");
  
  return (allowed.length > 0) ;
};