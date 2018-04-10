'use strict';
console.log("************ PRODUCTION MODE *****************")
module.exports = {
 db: (process.env.MONGODB_URI || 'mongodb://localhost/icu'),
  /**
   * Database options that will be passed directly to mongoose.connect
   * Below are some examples.
   * See http://mongodb.github.io/node-mongodb-native/driver-articles/mongoclient.html#mongoclient-connect-options
   * and http://mongoosejs.com/docs/connections.html for more information
   */
  dbOptions: {
    /*
    server: {
        socketOptions: {
            keepAlive: 1
        },
        poolSize: 5
    },
    replset: {
      rs_name: 'myReplicaSet',
      poolSize: 5
    },
    db: {
      w: 1,
      numberOfRetries: 2
    }
    */
  },
  app: {
    name: 'MEAN - A Modern Stack - Production'
  },
  logging: {
    format: 'combined'
  },
  elasticsearch: { //from dev
    host: (process.env.ELASTICSEARCH_IP || 'localhost'),
    port: 9200,
    log: 'trace',
    keepAlive: false,
    sniffOnConnectionFault:true,
    maxRetries:50
  },
  omerElastic: ['localhost:9200', 'localhost:9201', 'localhost:9202'], // Add all master nodes of the elastic cluster to the array
  saml: { // from dev
    strategy : {
      options :{
        samlOptions: ''
      }
    },
    clientID: 'DEFAULT_APP_ID',
    clientSecret: 'APP_SECRET',
    callbackURL: 'http://localhost/metadata.xml/callback'
  },
  facebook: {
    clientID: 'APP_ID',
    clientSecret: 'APP_SECRET',
    callbackURL: 'http://localhost:3000/api/auth/facebook/callback'
  },
  twitter: {
    clientID: 'CONSUMER_KEY',
    clientSecret: 'CONSUMER_SECRET',
    callbackURL: 'http://localhost:3000/api/auth/twitter/callback'
  },
  github: {
    clientID: 'APP_ID',
    clientSecret: 'APP_SECRET',
    callbackURL: 'http://localhost:3000/api/auth/github/callback'
  },
  google: {
    clientID: 'APP_ID',
    clientSecret: 'APP_SECRET',
    callbackURL: 'http://localhost:3000/api/auth/google/callback'
  },
  linkedin: {
    clientID: 'API_KEY',
    clientSecret: 'SECRET_KEY',
    callbackURL: 'http://localhost:3000/api/auth/linkedin/callback'
  },
  emailFrom: 'SENDER EMAIL ADDRESS', // sender address like ABC <abc@example.com>
  mailer: {
    service: 'SERVICE_PROVIDER',
    auth: {
      user: 'EMAIL_ID',
      pass: 'PASSWORD'
    }
  },
  secret: 'SOME_TOKEN_SECRET',
  circles: { // from dev
    // uri: 'http://192.116.82.36:2230'
    uri: 'http://localhost:3005'
  },
  api: { // from dev
    uri: 'http://192.168.245.152:3003'
  },
};

