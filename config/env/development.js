'use strict';
console.log("************ DEVELOPMENT MODE *****************")
module.exports = {
 db: (process.env.MONGODB_URI || 'mongodb://localhost/icu-dev'),
  debug: true,
  logging: {
    format: 'tiny',
    options: {skip:function(req,res){
      return res.statusCode < 400 ;
    }}
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
//  host: 'http://root.demo.linnovate.net:3008',
  host: 'http://localhost',
  isPortNeeded: false,
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
    clientID: '1065843995383-l0f0a740nenvn4vk3id9nur2pdlu4ktf.apps.googleusercontent.com',
    clientSecret: 'SmulksiTH_XZY519GgSEIocF',
    callbackURL: 'http://root.projects.linnovate.net/api/auth/google/callback'
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
      user: 'admin@linnovate.net',
      pass: 'dockerzebra1'
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

  elasticsearch: {
    hosts: [
      (process.env.ELASTICSEARCH_IP || 'localhost') + ':9200',
    ],
    port: 9200,
    log: 'trace',
    keepAlive: false,
    sniffOnConnectionFault:true,
    maxRetries:50
  },

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
    uri: 'http://hi.hrm.demo.linnovate.net',
    username: "username",
    password: "password",
    authToken: "vMSm0F6NCtQHf_Tx_JOuI1iESqolspJ1BRMKwEZjcz2",
    userId: "BGsnKv7b59nP4JTzb",
    active:false
  },
  system: {
    recipients: ['rivkat@linnovate.net','moshe@linnovate.net','lior@linnovate.net'], //recipients of system mail
    seconds: 10 * 60 //ignore mails for 10 minutes
  },
  specialUrl:'', //fill with special url
  SPHelper: {
    uri:"uri",
    SPSiteUrl:"SPSiteUrl",
    username:"username",
    password:"password",
    libraryName:"libraryName",
    isWorking:false
  },
  usersDomain:"@domain",
  documentPlugin: 'sp',
//  documentPlugin: 'default',
  
};
