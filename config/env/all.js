'use strict';

const PORT = process.env.PORT || 3000;
const ROOT_PATH = require('path').join(__dirname, '../..');

module.exports = {
  root: ROOT_PATH,
  http: {
    port: PORT
  },
  https: {
    port: process.env.HTTPS ? PORT : false,
    ssl: {
      key: process.env.HTTPS_KEY_PATH,
      cert: process.env.HTTPS_CERT_PATH
    }
  },
  hostname: process.env.HOST || process.env.HOSTNAME,
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
  currentLanguage: process.env.ROOT_LANG || 'en',
  // The session cookie name
  sessionName: 'connect.sid',
  attachmentDir: ROOT_PATH + '/files',

  // Auth providers
  activeProvider: process.env.AUTH_PROVIDER || 'local',
  facebook: {
    clientID: 'DEFAULT_APP_ID',
    clientSecret: 'APP_SECRET',
    callbackURL: '/api/auth/facebook/callback'
  },
  saml: {
    strategy : {
      options :{
        samlOptions: ''
      }
    },
    clientID: 'DEFAULT_APP_ID',
    clientSecret: 'APP_SECRET',
    callbackURL: '/metadata.xml/callback'
  },
  twitter: {
    clientID: 'DEFAULT_CONSUMER_KEY',
    clientSecret: 'CONSUMER_SECRET',
    callbackURL: '/api/auth/twitter/callback'
  },
  github: {
    clientID: 'DEFAULT_APP_ID',
    clientSecret: 'APP_SECRET',
    callbackURL: '/api/auth/github/callback'
  },
  google: {
    clientID: process.env.GOOGLE_CLIENT_ID || 'APP_ID',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'APP_SECRET',
    callbackURL: '/api/auth/google/callback'
  },
  linkedin: {
    clientID: 'DEFAULT_API_KEY',
    clientSecret: 'SECRET_KEY',
    callbackURL: '/api/auth/linkedin/callback'
  },

  circleSettings: require('../circleSettings') || {},

  version: '1.0.7',
  whatsNew:[{
    content:'fix document...bla bla',
    header:'hjghjghj', 
    img:"/icu/assets/img/whatsNew/t.png" 
  }, {
    content:'fix document... hahaha',
    header:'hjghjghj', 
    img:"" 
  }],
  defaultTab: 'activities', // one of 'activities', 'documents'
  ScheduledMailSendWeekly: '59 1 * * 0',
  ScheduledMailSendDaly: '59 1 * * 0-5',
  activeStatus: require('../activeStatusSettings'),
  ftp: {
    host: process.env.FTP_IP,
    user: process.env.FTP_USER_NAME,
    password: process.env.FTP_USER_PASS
  }
};
