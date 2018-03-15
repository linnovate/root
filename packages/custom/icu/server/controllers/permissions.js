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
  'officeDocument': {
    mainModel: OfficeDocumentsModel,
//      archiveModel: OfficeDocumentsArchiveModel,
    name: 'officeDocument'
  },
};

exports.permError = 
{
  denied: "permission denied",
  allowUpdateWatcher: "update permissions for user",
  allowAssign: "assignee update",
  allowUpdateContent: "content update"
} ;

/*
    function: search if value exist in array in the format of arraItem.id
    return: the index in which the value exist, or null otherwise.
*/
exports.searchIdIndex = function(idVal, arr) {
  console.log("searchIdIndex");
  // console.log(JSON.stringify(arr));
  // console.log(JSON.stringify(idVal));
  // console.log("searchIdIndex<<<");
  for (let i = 0; i < arr.length; i++) {
    // console.log(arr[i].id);
    // console.log(idVal);
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
  console.log(JSON.stringify(arr1)) ;
  console.log(JSON.stringify(arr2)) ;
  let result = [] ;

  if(arr1.length != arr2.length) {
    return true ;
  }

  arr1.forEach(function(a1) {
    // console.log("arr2[a1]") ;
    // console.log(arr2[a1]) ;
    // console.log("--------") ;
    if(arr2[a1]) {
      result++ ;
    }
  })

  arr2.forEach(function(a2) {
    // console.log("arr2[a1]") ;
    // console.log(arr1[a2]) ;
    // console.log("--------") ;
    if(arr1[a2]) {
      result++ ;
    }
  })


  // let result = arr1.filter(function(o1){
  //   let someRes = !arr2.some(function(o2){
  //       console.log(o1) ;
  //       console.log(o2) ;
  //       let equal1 = (String(o1) === String(o2)) ;
  //       let equal2 = (String(o1._id) === String(o2)) ; 
  //       console.log(equal1) ;
  //       console.log(equal2) ;
  //       console.log("====") ;
  //       let resx = equal1 || equal2 ;
  //       console.log("res x") ;
  //       console.log(resx) ;
  //       return resx ;
  //   });
  //   console.log("some res:") ;
  //   console.log(JSON.stringify(someRes)) ; 
  //   return someRes ;
  // })
  // console.log("final result:") ;
  // console.log(JSON.stringify(result))
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
  console.log("updateContent") ;

  let newPerms = Array.isArray(newDoc['permissions']) ? newDoc['permissions'].slice() : [];
  
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

exports.createContent = function(user, oldDoc, newDoc) {
  console.log("createContent") ;

  console.log(JSON.stringify(newDoc)) ;
  if (newDoc.type == 'comment') {
    
    var Model = entityNameMap[newDoc.issue].mainModel;    
    var deffered = q.defer();
    
      return Model.findOne({'_id': oldDoc.issueId},function(err,doc){
      console.log("doc") ;
      console.log(doc) ;
      let newPerms = Array.isArray(doc['permissions']) ? doc['permissions'].slice() : [];
      
      if(!exports.allowUpdateContent(user, newPerms, {})) {
        console.log("updated comments - not allowed");
        deffered.reject("err");
        return deffered.promise;
//        return false ;
      }  
      console.log("updated comments - allowed");      
      return true ;  
    }); 
    
  return deffered.promise;        
  }
  
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
  console.log("updatePermsArray") ;
  console.log("// check if the added watcher is the assignee:") ;
      console.log(JSON.stringify(newDoc)) ;
      

  let oldWatchers = oldDoc.watchers.map(function (item) {
    return String(item._doc._id) ;
  }) ;

  let newWatchers = newDoc.watchers.map(function (item) {
    return String(item);
  }) ;

  newWatchers = cleanArray(newWatchers) ;

  // permissions array update needed? check if watchers changed.  
  console.log("DIFF PERMS ARRAY:") ;
  let diff = isDifferentArray(oldWatchers,newWatchers);
  console.log(diff) ;
  if(diff == false) {
    return true ; // not different (users not added or removed), noop.
  }

  let newPerms = Array.isArray(newDoc['permissions']) ? newDoc['permissions'].slice() : [];
  
  // is user allowed to update Perms?    
  console.log("newPerms:") ;
  console.log(JSON.stringify(newPerms));
  if(!exports.allowUpdateWatcher(user, newPerms)) {
    console.log("updated perms array - not allowed");
    return false ;
  }  


  console.log("updating perms...") ;                
  console.log("original perms array:");
  console.log(newPerms);
  console.log("--------------------");

  // watcher added
  let watcherAdded = leftIntersect(newWatchers,oldWatchers) ;

  if(watcherAdded.length > 0) {
    // check if the added watcher is the assignee:      
    console.log("ASSIGNEE:") ;
    console.log(JSON.stringify(newDoc.assign)) ;
    let permLevel = String(watcherAdded[0]) == String(newDoc.assign) ? 'commenter' : 'viewer' ;
    console.log("LEVEL:") ;
    console.log(permLevel) ; 
        
    let watcherAddedPerms = {id:String(watcherAdded[0]),level:permLevel} ; // default watcher perms
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
