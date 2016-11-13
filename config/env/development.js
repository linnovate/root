'use strict';

module.exports = {
 db: (process.env.MONGODB_URI || 'mongodb://localhost/icu-dev3'),
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
    //Made By OHAD - name: 'MEAN - FullStack JS - Development'
    name: 'ICU'
  },
  //hostname: 'http://192.168.245.152:3000',
  host: 'http://localhost:3002',
  facebook: {
    clientID: 'DEFAULT_APP_ID',
    clientSecret: 'APP_SECRET',
    callbackURL: 'http://localhost:3000/api/auth/facebook/callback'
  },
  saml: {
    strategy : {
      options :{
        samlOptions: ''
      }
    },
    clientID: 'DEFAULT_APP_ID',
    clientSecret: 'APP_SECRET',
    callbackURL: 'http://localhost/metadata.xml/callback'
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
    host: 'smtp.gmail.com', //in case of SMTP
    port: 465, // in case of SMTP
    secure: true, // in case of SMTP
    auth: {
      user: 'EMAIL_ID',
      pass: 'PASSWORD'
    }
  }, 
//   mailer: {
//     service: 'SMTP', // Gmail, SMTP
//     host: 'localhost', //in case of SMTP
//     port: 25, // in case of SMTP
//     secure: false, // in case of SMTP
//     tls: false, // in case of SMTP
//     ignoreTLS: true
//   },
//   mailer: {
//     service: 'SERVICE_PROVIDER', // Gmail, SMTP
//     auth: {
//       user: 'EMAIL_ID',
//       pass: 'PASSWORD'
//     }
//   }, 
  secret: 'SOME_TOKEN_SECRET',
    api: {
      uri: 'http://192.168.245.152:3003'
    },
//   elasticsearch: {
//     host: 'http://192.168.245.255',
//     port: 9200,
//     log: 'trace'
//     },
  elasticsearch: {
    host: 'http://localhost',
    port: 9200,
    log: 'trace',
    keepAlive: false,
    sniffOnConnectionFault:true,
    maxRetries:50
  },
//   elasticsearch: {
//     host: 'http://192.168.245.152',
//     port: 3003,
//     log: 'trace'
//   },
//   elasticsearch: {
//     host: 'http://192.168.245.152',
//     port: 9300,
//     log: 'trace'
//   },
  letschat: {
    owner: '562334ccea168c4f323a1be8'
  },
  circles: {
    // uri: 'http://192.116.82.36:2230'
    uri: 'http://localhost:3005'
  },
  // circles: {
  //   uri: 'http://192.116.82.36:2230'
  // },
  rocketChat: {
    uri: 'http://localhost:3000',
    "authToken": "Op74zz0GMtvf36aD36rfJ3ZnC7VhPtiLvRGwePVQniV",
    "userId": "EkiPDu2PuvNb5x9vt"
  }
};
