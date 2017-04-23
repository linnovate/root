'use strict';

module.exports = {
 db: (process.env.MONGODB_URI || 'mongodb://localhost/icu-dev'),
  debug: true,
  logging: {
    format: 'tiny'
  },
  //  aggregate: 'whatever that is not false, because boolean false value turns aggregation off', //false
  aggregate: false,
  mongoose: {
    debug: false
  },
  app: {
    name: 'MEAN - FullStack JS - Development'
  },
  host: 'http://localhost:3000',
  facebook: {
    clientID: 'DEFAULT_APP_ID',
    clientSecret: 'APP_SECRET',
    callbackURL: 'http://localhost:3000/api/auth/facebook/callback'
  },
  twitter: {
    clientID: 'DEFAULT_CONSUMER_KEY',
    clientSecret: 'CONSUMER_SECRET',
    callbackURL: 'http://localhost:3000/api/auth/twitter/callback'
  },
  github: {
    clientID: 'DEFAULT_APP_ID',
    clientSecret: 'APP_SECRET',
    callbackURL: 'http://localhost:3000/api/auth/github/callback'
  },
  google: {
    clientID: 'DEFAULT_APP_ID',
    clientSecret: 'APP_SECRET',
    callbackURL: 'http://localhost:3000/api/auth/google/callback'
  },
  linkedin: {
    clientID: 'DEFAULT_API_KEY',
    clientSecret: 'SECRET_KEY',
    callbackURL: 'http://localhost:3000/api/auth/linkedin/callback'
  },
  emailFrom: 'SENDER EMAIL ADDRESS', // sender address like ABC <abc@example.com>
  mailer: {
    service: 'SMTP', // Gmail, SMTP
    host: 'localhost', //in case of SMTP
    port: 25, // in case of SMTP
    secure: false, // in case of SMTP
    tls: false, // in case of SMTP
    ignoreTLS: true
  },
  system: {
    recipients: [], //recipients of system mail
    seconds: 10 * 60 //ignore mails for 10 minutes
  },
  secret: 'SOME_TOKEN_SECRET',
  api: {
    uri: 'localhost:3003'
  },
  elasticsearch: {
    host: 'http://localhost',
    port: 9200,
    log: 'trace'
	},
  letschat: {
    owner: '562334ccea168c4f323a1be8'
  }
};
