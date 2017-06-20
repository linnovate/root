'use strict';

var Q = require('q');
var config = require('meanio').loadConfig();
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var EmailTemplate = require('../../../mail-templates/node_modules/email-templates').EmailTemplate;
var icalToolkit = require('ical-toolkit');
var path = require('path');
var URL = "http://localhost:3002"

// node modules for creating PDF files
var officegen = require('officegen');
var async = require ('async');
var fs = require('fs');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var exec = require('child_process').exec;


function send(mailOptions) {
  var options = config.mailer;
  if (config.mailer.service === 'SMTP') {
    options = smtpTransport(options);
  }
  var transport = nodemailer.createTransport(options);
  return Q.ninvoke(transport, 'sendMail', mailOptions);
}

function render(type, data) {
  var templateDir = path.join(__dirname, '..', 'templates', type);
  var template = new EmailTemplate(templateDir);

  return template.render(data);
}

function checkPath(dir,subDir){
  if (!fs.existsSync(dir)){
      fs.mkdirSync(dir);
  }
  if(!fs.existsSync(dir+"/"+subDir)){
      fs.mkdirSync(dir+"/"+subDir)
  }
}


function writeDocxToFile(docx,discussionId){
  console.log("\n\n\n\n\n=====writeDocxToFile======");
return new Promise(function (fulfill, reject){
  checkPath('files','notes');
  var path = 'files/notes/'+discussionId+".docx";
  var out = fs.createWriteStream (path);
    out.on ('error', function (err) {
    console.log (err);
    reject("error");
  });
    docx.generate ( out, {
      'finalize': function ( written ) {
          console.log ( 'Finish to create a docx file.\nTotal bytes created: ' + written + '\n' );
          exec('lowriter --headless --convert-to pdf ' + path, function (err, stout, sterr){
          if(err){
            console.log('error in lowriter');
            reject("error");
            return;
          }
          else{
            console.log("not error in lowriter");
            exec('mv ' + discussionId + '.pdf' + ' ' + 'files/notes/'+discussionId + '.pdf' , function (err, stout, sterr){
            if (err) {
              reject("error");
            } 
            else {          
              fulfill("success");
            }
          });    
          }
          });
    },
      'error': function ( err ) {
          console.log ( err );
          reject("error");
      }
  });
});
}

function addTasks(docx,tasks,discussionId,tasksNum){
  return new Promise(function (fulfill, reject){
    if(!tasks || tasks==null || tasks.length==0){
      var assigns = [];
      addTasksToDocx(docx,tasks,assigns,discussionId,tasksNum).then(
        function(result){
          if(result=='success'){
            fulfill('success');
          }
          else{
            reject('error');
          }
        }
      );
    }
    else{
    var assigns = new Array(tasks.length);
    var i = 0;
    (function func(){
      User.findOne({
      _id: tasks[i].assign
      }).exec(function (err, user) {
        if(err){
          reject("error");
          console.log("ERROR");
          return;
        }
        else{
          var assign = (user&&user.name)?user.name:'';
          assigns[i] = assign;
          i++;
          if(i<tasks.length){
            func();
          }
          else{
            addTasksToDocx(docx,tasks,assigns,discussionId,tasksNum).then(
              function(result){
                if(result=='success'){
                  fulfill('success');
                }
                else{
                  reject('error');
                }
              }
            );
          }
        }
    });
  })();
  }

});

}

function addTasksToDocx(docx,tasks,assigns,discussionId,tasksNum){
  return new Promise(function (fulfill, reject){
    var pObj = docx.createP ({ align: 'right' });
    var prefix = URL+"/tasks/by-discussion/"+discussionId+"/";
    pObj.addText (':משימות מהדיון' , {bold:true,underline:true});
    if(tasks==null || tasks==undefined || tasks.length==0){
      writeDocxToFile(docx,discussionId).then(function(result){
      if(result=='success'){
        fulfill('success');
      }
      else{
        reject('error');
      }
      });
      return;
    }
    for(var i = 0 ; i < tasksNum ; i++){
      var pObj = docx.createP ({ align: 'right' });
      var currentTask = tasks[i];
      var flag = (currentTask.title.charAt(0)>'א' && currentTask.title.charAt(0)<'ת');
      if(flag){
        pObj.addText ((i+1)+". " , {bold:true});
        pObj.addText(currentTask.title , {bold:true,underline:true});
      }
      if(!flag){
        pObj.addText(currentTask.title , {bold:true,underline:true});
        pObj.addText (" ."+(i+1) , {bold:true});
      }
      //description
      var desc = currentTask.description?currentTask.description.substring(3,currentTask.description.length-4):'';
      var pObj = docx.createP ({ align: 'right' });
      var flag = (desc.charAt(0)>'א' && desc.charAt(0)<'ת');
      if(flag){
        pObj.addText ("פירוט:" , {bold:true,underline:true});
        pObj.addText(desc);
      }
      if(!flag){
        pObj.addText(desc);
        pObj.addText (":פירוט", {bold:true,underline:true});
      }
      //participants
      var pObj = docx.createP ({ align: 'right' });
      pObj.addText (':');
      pObj.addText ( 'משתתפים', {bold:true,underline:true});
      pObj.addLineBreak();
      for(var j = 0 ; j < tasks[i].watchers.length ; j++){
        var watcher = assigns[i+tasksNum+j]
        pObj.addText (watcher);
        if(j != tasks[i].watchers.length-1){
          pObj.addText (" , ");
        }
      }

      //URL
      var pObj = docx.createP ({ align: 'right' });
      var address = prefix+tasks[i]._id+"/activities";
      pObj.addText (":כתובת המשימה" , {bold:true,underline:true});
      pObj.addLineBreak();
      pObj.addText(address , {font_size: 10, underline:true});

      //assign
      var id = currentTask.assign;
      pObj.addLineBreak();
      var assign = assigns[i];
      var flag = (assign.charAt(0)>'א' && assign.charAt(0)<'ת');

      var pObj = docx.createP ({ align: 'left' });
      if(flag){
        pObj.addText ("אחראי:" , {bold:true,underline:true});
        pObj.addText(assign);
      }
      if(!flag){
        pObj.addText(assign);
        pObj.addText (":אחראי", {bold:true,underline:true});
      }

      //due
      var pObj = docx.createP ({ align: 'left' });
      var due = currentTask.due?currentTask.due:null;
      var due = due!=null? new Date(due) : null;
      var dateString = due!=null? due.getDate()+"/"+(due.getMonth()+1)+"/"+due.getFullYear() :'';
      var timeString = due!=null? (due.getHours().toString().length==1?"0"+
      due.getMinutes().toString():due.getMinutes().toString())+":"+(due.getMinutes().toString().length==1?"0"+due.getMinutes().toString():due.getMinutes().toString()):''; 
      pObj.addText(timeString);
      pObj.addText ("תג״ב: " , {bold:true,underline:true});
      pObj.addText(dateString);
      pObj.addText (" בשעה ");
    }
    writeDocxToFile(docx,discussionId).then(function(result){
    if(result=='success'){
      fulfill('success');
    }
    else{
      reject('error');
    }
    });
  });
}

function createPDF(discussion , tasks){
  return new Promise(function (fulfill, reject){
    var docx = officegen('docx');
    docx.on ( 'finalize', function ( written ) {
    console.log ( 'Finish to create a docx file.\nTotal bytes created: ' + written + '\n' );
    });
    docx.on ( 'error', function ( err ) {
      console.log ( err );
    });

    //Today's date
    var date = new Date();
    var dateString = date.getDate()+"/"+(date.getMonth()+1)+"/"+date.getFullYear();
    var header = docx.getHeader ().createP ({ align: 'left' });
    header.addText (dateString+" ");
    header.addText (':');
    header.addText ('תאריך' , {bold:true,underline:true});
    var header = docx.getHeader ().createP ({ align: 'center' });
    //Discussion title
    var flag = (discussion.title.charAt(0)>'א' && discussion.title.charAt(0)<'ת');
    if(flag){
      header.addText ("דיון:" , {bold:true,underline:true});
      header.addText(discussion.title , {underline:true});
    }
    if(!flag){
      header.addText(discussion.title , {underline:true});
      header.addText (":דיון" , {bold:true,underline:true});
    }
    //asign
    var pObj = docx.createP ({ align: 'right' });
    var flag = (discussion.assign.name.charAt(0)>'א' && discussion.assign.name.charAt(0)<'ת');

    if(flag){
      pObj.addText ("אחראי הדיון:" , {bold:true,underline:true});
      pObj.addText(discussion.assign.name);
    }
    if(!flag){
      pObj.addText(discussion.assign.name);
      pObj.addText (":אחראי הדיון" , {bold:true,underline:true});
    }
    //participants
    var pObj = docx.createP ({ align: 'right' });
    pObj.addText (':');
    pObj.addText ( 'נוכחים', {bold:true,underline:true});
    pObj.addLineBreak();
    for(var i = 0 ; i < discussion.watchers.length ; i++){
      if(discussion.watchers[i].lastName){
        pObj.addText (discussion.watchers[i].lastName+" ");
      }
      pObj.addText (discussion.watchers[i].name);
      if(i != discussion.watchers.length-1){
        pObj.addText (" , ");
      }
    }

    //starting time
    var date = new Date(discussion.startTime);
    var hours = date.getHours().toString();
    var minutes = date.getMinutes().toString();
    hours = hours.length==1?"0"+hours:hours;
    minutes = minutes.length==1?"0"+minutes:minutes;
    var dateString = date.getDate()+"/"+(date.getMonth()+1)+"/"+date.getFullYear();
    var timeString = hours+":"+minutes;
    var pObj = docx.createP ({ align: 'right' });


    if (!discussion.allDay && discussion.hasStartTime){
      pObj.addText(timeString);
    }
    pObj.addText ("מועד התחלה: " , {bold:true,underline:true});
    pObj.addText(dateString);

    if(!discussion.allDay && discussion.hasStartTime){
    pObj.addText (" בשעה ");
  }
   if(discussion.allDay){
      pObj.addText(' כל היום');
    }

    if(!discussion.allDay){
    //ending time
    var date = new Date(discussion.endTime);
    var hours = date.getHours().toString();
    var minutes = date.getMinutes().toString();
    hours = hours.length==1?"0"+hours:hours;
    minutes = minutes.length==1?"0"+minutes:minutes;
    var dateString = date.getDate()+"/"+(date.getMonth()+1)+"/"+date.getFullYear();
    var timeString = hours+":"+minutes;
    var pObj = docx.createP ({ align: 'right' });
    if(discussion.hasEndTime){
      pObj.addText(timeString);
    }
    pObj.addText ("מועד סיום: " , {bold:true,underline:true});
    pObj.addText(dateString);
    if(discussion.hasEndTime){
      pObj.addText (" בשעה ");
  }
  }

  //location
    var pObj = docx.createP ({ align: 'right' });
    var flag = (discussion.location.charAt(0)>'א' && discussion.location.charAt(0)<'ת');
    if(flag){
      pObj.addText ("מיקום:" , {bold:true,underline:true});
      pObj.addText(discussion.location);
    }
    if(!flag){
      pObj.addText(discussion.location);
      pObj.addText (":מיקום" , {bold:true,underline:true});
    }

    //url
    var pObj = docx.createP ({ align: 'right' });
    var url = URL+"/discussions/all/"+discussion._id;
    pObj.addText(url);
    pObj.addText (":כתובת הדיון" , {bold:true,underline:true});
    var pObj = docx.createP ();
    pObj.addLineBreak();
    //tasks
    var tasks2 = [];
    for(var i = 0;i<tasks.length;i++){
      tasks2.push(tasks[i]);
    }

    for(var i = 0;i<tasks.length;i++){
      for(var j=0;j<tasks[i].watchers.length;j++){
        tasks2.push({'assign' : tasks[i].watchers[j]});
      }
    }
    addTasks(docx,tasks2,discussion._id,tasks.length).then(function(result){
      if(result=='success'){
        fulfill('success');
      }
      else{
        reject('error');
      }
    });

});
}

exports.send = function(type, data) {
  if (type === 'comment_email') {
    return;
  }
  var rootPath='';

  var port = config.https && config.https.port ? config.https.port : config.http.port;
  data.uriRoot = config.host + ':' + port;
  data.date = new Date();
  var recipients = data.discussion.watchers;
  recipients.push(data.discussion.assign);
  var discussionStatus = data.discussion.status;
  var attendingPeople=[];
  data.attendees = [];
  var ids = [], emails = [];
  for (var i = 0; i < recipients.length; i++) {
    if (ids.indexOf(recipients[i]._id.toString()) === -1) {
      var json = {
        "name": recipients[i].name,
        "email": recipients[i].email
      };
      attendingPeople.push(json);
      ids.push(recipients[i]._id.toString());
      emails.push(recipients[i].email);
      data.attendees.push(recipients[i].name);
    }
  }
  console.log("===Emails:===");
  console.log(emails);
  var status = data.discussion.status;
  var calMethod = status=="canceled"?"CANCEL":"REQUEST";

  var path = "files/notes/"+data.discussion._id+".pdf";

  var allDay;
  if(!data.discussion.allDay){
    allDay = false;
  }
  else{
    allDay=true;
  }

  var startTime = new Date(data.discussion.startDate);
  if(data.discussion.startTime){
  startTime.setHours(data.discussion.startTime.getHours());
  startTime.setMinutes(data.discussion.startTime.getMinutes());
  data.discussion.hasStartTime = true;
  data.discussion.startTime = startTime;
}
else{
  data.discussion.hasStartTime = false;
}

   var endTime = new Date(data.discussion.endDate);
  if(data.discussion.endTime){
  endTime.setHours(data.discussion.endTime.getHours());
  endTime.setMinutes(data.discussion.endTime.getMinutes());
  data.discussion.hasEndTime = true;
  data.discussion.endTime = endTime;
}
else{
  endTime = startTime;
  data.discussion.hasEndTime = false;
  data.discussion.endTime = startTime;
}
  
  


  

  var builder = icalToolkit.createIcsFileBuilder();
  builder.spaces = true;
  builder.NEWLINE_CHAR = '\r\n';
  builder.throwError = false;
  builder.ignoreTZIDMismatch = true;
  builder.calname = data.discussion.title;
  builder.timezone = 'asia/istanbul';
  builder.tzid = 'asia/istanbul';
  builder.method = calMethod;
  builder.events.push({
    start : startTime ,
    end : endTime,
    transp : 'OPAQUE',
    summary : "ICU Event",
    additionalTags : {
      "Tag" : data.discussion.title
    },
    uid : null,
    sequence : null,
    allDay : allDay,
    stamp : new Date(),
    floating : false,
    location : data.discussion.location,
    description : "ICU EVENT",
    organizer : {
      name : "ICU",
      email : 'admin@linnovate.net'
    },
    attendees : attendingPeople,
    mathod : 'PUBLISH',
    status : 'CONFIRMED'
  });
  var content = builder.toString();
  var buffer = new Buffer(content);

  data.attendees.join(', ');
  exec("pwd | tr -d '\n'", function(error, stdout, stderr) { 
    rootPath = stdout;
    console.log("PWD:");
    console.log(rootPath);
    createPDF(data.discussion , data.additionalTasks).then(function(result){
      render(type, data).then(function(results) {
    var promises = emails.map(function(recipient) {
      console.log("====PATH====");
      var p = rootPath+'/files/notes/'+data.discussion._id+".pdf";
      var mailOptions = {
        "to" : recipient,
        "from" : config.emailFrom,
        "subject" : data.discussion.title,
        "html" : results.html,
        "text" : results.text,
        "forceEmbeddedImages" : true
      };
      if(status == "new"){
        mailOptions['alternatives'] =  [{
          contentType: "text/calendar",
          content: buffer}];
     }
     if(status == "scheduled"){
        mailOptions['attachments'] =  [{
          filename: data.discussion.title+'.pdf',
            path: p,
            contentType: 'application/pdf'
          }];
     }

      return send(mailOptions);
    });

    return Q.all(promises);
  });
  });
  }); //Creating the PDF file, and receiving its path


  return render(type, data).then(function(results) {
    var promises = emails.map(function(recipient) {
      var mailOptions = {
        "to" : 'test@test.test',
        "from" : config.emailFrom,
        "subject" : data.discussion.title,
        "html" : results.html,
        "text" : results.text,
        "forceEmbeddedImages" : true
      };
      if(status == "new"){
        mailOptions['alternatives'] =  [{
          contentType: "text/calendar",
          content: buffer}];

        mailOptions['attachments'] =  [{
          filename: data.discussion._id+'.pdf',
            path: rootPath+ '/files/notes/'+data.discussion._id+".pdf",
            contentType: 'application/pdf'
          }];
      }

      return send(mailOptions);
    });

    return Q.all(promises);
  });
};

exports.system = function(data) {
  var port = config.https && config.https.port ? config.https.port : config.http.port;
  data.uriRoot = config.host + ':' + port;
  data.date = new Date();
  var recipients = config.system.recipients;
  var r = [];
  for (var i in recipients) {
    r.push(recipients[i]);
  }

  return render('system', data).then(function(results) {
    var promises = r.map(function(recipient) {
      var mailOptions = {
        to: recipient,
        from: config.emailFrom,
        subject: 'Root System',
        html: results.html,
        text: results.text,
        forceEmbeddedImages: true
      };

      return send(mailOptions);
    });

    return Q.all(promises);
  });
};
