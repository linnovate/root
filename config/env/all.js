'use strict';


var path = require('path'),
  rootPath = path.normalize(__dirname + '/../..');

module.exports = {
  root: rootPath,
  http: {
    port: process.env.PORT || 3002
  },
  https: {
    //port: null,
    port: false,

    // Paths to key and cert as string
    ssl: {
      key: '',
      cert: ''
    }
  },
  hostname: process.env.HOST || process.env.HOSTNAME,
  db: process.env.MONGOHQ_URL,
  socketPort: process.env.SOCKETPORT || 3003,
  templateEngine: 'swig',

  // The secret should be set to a non-guessable string that
  // is used to compute a session hash
  sessionSecret: 'MEAN',

  // The name of the MongoDB collection to store sessions in
  sessionCollection: 'sessions',

  // The session cookie settings
  sessionCookie: {
    path: '/',
    httpOnly: true,
    // If secure is set to true then it will cause the cookie to be set
    // only when SSL-enabled (HTTPS) is used, and otherwise it won't
    // set a cookie. 'true' is recommended yet it requires the above
    // mentioned pre-requisite.
    secure: false,
    // Only set the maxAge to null if the cookie shouldn't be expired
    // at all. The cookie will expunge when the browser is closed.
    maxAge: null
  },
  languages: [{
    name: 'en',
    direction: 'ltr',
  }, {
    name: 'he',
    direction: 'rtl',
  }],
   currentLanguage: 'en',
   // currentLanguage: 'he',
  // The session cookie name
  sessionName: 'connect.sid',
  attachmentDir: rootPath + '/files',
//  activeProvider: 'google',
  activeProvider: 'local',
  circleSettings: require('../circleSettings') || {},

  version: '1.0.7',
  whatsNew:[
    {
      content:'fix document...bla bla',
      header:'hjghjghj', 
      img:"/icu/assets/img/whatsNew/t.png" 
    },
    {
      content:'fix document... hahaha',
      header:'hjghjghj', 
      img:"" 
    }
  ],
  ScheduledMailSendWeekly: '59 1 * * 0',
  ScheduledMailSendDaly: '59 1 * * 0-5',
  activeStatus: require('../activeStatusSettings'),
  
};
