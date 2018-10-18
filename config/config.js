'use strict';

var path = require('path'),
  rootPath = path.normalize(__dirname + '/..');

let mode, loggingFormat;

switch(process.env.NODE_ENV){
  case 'test':
    mode = 'Test';
    loggingFormat = 'short';
    break;
  case 'prod':
    mode = 'Production';
    loggingFormat = 'combined';
    break;
  case 'dev':  
  default:
    mode = 'Development';
    loggingFormat = 'tiny'
    break;
}

console.log(`************ ${mode} MODE *****************`);

module.exports = {

  // general settings

  app: {
    name: process.env.APP_NAME || 'ICU'
  },
  root: rootPath,
  attachmentDir: rootPath + '/files',
  secret: process.env.SECRET,
  debug: process.env.DEBUG || process.env.NODE_ENV === 'dev',
  logging: {
    format: loggingFormat,
    options: {
      skip: (req,res) => res.statusCode < 400 
    }
  },


  // network

  http: {
    port: process.env.PORT || 3002
  },
  https: {
    port: process.env.SSL_PORT || false,
    // Paths to key and cert as string
    ssl: {
      key: process.env.SSL_KEY || '',
      cert: process.env.SSL_CERT || ''
    }
  },
  hostname: process.env.HOST || 'http://localhost',
  host: process.env.HOST || 'http://localhost',
  socketPort: process.env.SOCKET_PORT || 3003,


  // db

  db: process.env.MONGODB_URI || `mongodb://localhost/icu-${process.env.NODE_ENV}`,
  dbOptions: {},
  aggregate: process.env.AGGREGATE || false,
  mongoose: {
    debug: process.env.MONGOOSE_DEBUG || false
  },
  elasticsearch: {
    hosts: [
      (process.env.ELASTICSEARCH_IP || 'localhost') + ':9200',
    ],
    port: process.env.ELASTICSEARCH_PORT || 9200,
    log: process.env.ELASTICSEARCH_LOG || 'error',
    keepAlive: false,
    sniffOnConnectionFault: true,
    maxRetries: 50
  },


  // session settings

  sessionSecret: process.env.SESSION_SECRET,
  // The name of the MongoDB collection to store sessions in
  sessionCollection: 'sessions',
  // The session cookie settings
  sessionCookie: {
    path: '/',
    httpOnly: process.env.SESSION_COOKIE_HTTP_ONLY,
    secure: process.env.SESSION_COOKIE_HTTPS_ONLY,
    maxAge: process.env.SESSION_COOKIE_MAX_AGE
  },
  // The session cookie name
  sessionName: 'connect.sid',


  //language

  languages: [{
    name: 'en',
    direction: 'ltr',
  }, {
    name: 'he',
    direction: 'rtl',
  }],
  currentLanguage: process.env.LANGUAGE || 'he',


  // version

  version: process.env.VERSION,
  whatsNew: JSON.parse(process.env.WHATS_NEW),
  /* Example: 
  [
    {
      content: 'content',
      header: 'header',
      img: "/path/to/demonstration/image"
    }
  ]
  */
  

  // cron schedules

  ScheduledMailSendWeekly: process.env.WEEKLY_CRON_SCHEDULE,
  ScheduledMailSendDaly: process.env.DAYLY_CRON_SCHEDULE,


  // external accounts app auth data

  facebook: {
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL 
      || 'http://localhost:3000/api/auth/facebook/callback'
  },
  twitter: {
    clientID: process.env.TWITTER_CLIENT_ID,
    clientSecret: process.env.TWITTER_SECRET,
    callbackURL: process.env.TWITTER_CALLBACK_URL 
      || 'http://localhost:3000/api/auth/twitter/callback'
  },
  github: {
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL 
      || 'http://localhost:3000/api/auth/github/callback'
  },
  google: {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL 
      || 'http://localhost:3000/api/auth/google/callback'
  },
  linkedin: {
    clientID: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_SECRET,
    callbackURL: process.env.LINKEDIN_CALLBACK_URL 
      || 'http://localhost:3000/api/auth/linkedin/callback'
  },
  saml: {
    strategy: {
      options: {
        samlOptions: ''
      }
    },
    clientID: process.env.SAML_CLIENT_ID || undefined,
    clientSecret: process.env.SAML_SECRET || undefined,
    callbackURL: process.env.SAML_SECRET != null
      && process.env.SAML_CLIENT_ID != null ?
      process.env.SAML_CALLBACK_URL || 
        'http://localhost/metadata.xml/callback' : undefined
  },


  // mail configs

  emailFrom: process.env.EMAIL_FROM, // sender address like ABC <abc@example.com>
  mailer: {
    service: process.env.MAILER_SERVICE || 'SMTP', // Gmail, SMTP
    host: process.env.MAILER_HOST || 'smtp.gmail.com', //in case of SMTP
    port: process.env.MAILER_PORT || 465, // in case of SMTP
    secure: process.env.MAILER_SERVICE === 'SMTP'
      || process.env.MAILER_SERVICE === undefined, // in case of SMTP
    auth: {
      user: process.env.MAILER_USER,
      pass: process.env.MAILER_PASSWORD
    }
  },
  system: {
    recipients: process.env.SYSTEM_MAILS_RECIPIENTS.split(','), //recipients of system mail
    seconds: process.env.SYSTEM_MAILS_IGNORING_TIME || 10 * 60  //ignore mails for 10 minutes
  },


  // other libraries config

  SPHelper: {
    uri: process.env.SP_HELPER_URI,
    SPSiteUrl: process.env.SP_HELPER_SITE_URL,
    username: process.env.SP_HELPER_USERNAME,
    password: process.env.SP_HELPER_PASSWORD,
    libraryName: process.env.SP_HELPER_LIB_NAME,
    isWorking: process.env.SP_HELPER_IS_WORKING | false
  },
  circles: {
    uri: process.env.CIRCLES_URI || 'http://localhost:3005'
  },
  circleSettings: require('../circleSettings') || {},
  letschat: {
    owner: process.env.LETSCHAT_OWNER
  },
  rocketChat: {
    uri: process.env.ROCKET_CHAT_URI,
    username: process.env.ROCKET_CHAT_USERNAME,
    password: process.env.ROCKET_CHAT_PASSWORD,
    authToken: process.env.ROCKET_CHAT_AUTH_TOKEN,
    userId: process.env.ROCKET_CHAT_USER_ID,
    active: process.env.ROCKET_CHAT_ACTIVE || false
  },


  // more config variables

  templateEngine: 'swig',
  activeProvider: process.env.ACTIVE_PROVIDER || 'local', // local, google etc.
  activeStatus: require('../activeStatusSettings'),
  //  fill with special url (for instance in users mail domains)
  //  in order to take some unique actions
  specialUrl: process.env.SPECIAL_URL_EXTENSION || '',
  superSeeAll: process.env.SUPER_SEE_ALL || false,
  isPortNeeded: process.env.IS_PORT_NEEDED || false
};
