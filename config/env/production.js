"use strict";
console.log("************ PRODUCTION MODE *****************");
module.exports = {
  db: process.env.MONGODB_URI || "mongodb://localhost/icu",
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
    name: "MEAN - A Modern Stack - Production"
  },
  logging: {
    format: "combined"
  },
  emailFrom: "SENDER EMAIL ADDRESS", // sender address like ABC <abc@example.com>
  mailer: {
    service: "SERVICE_PROVIDER",
    auth: {
      user: "EMAIL_ID",
      pass: "PASSWORD"
    }
  },
  secret: "SOME_TOKEN_SECRET"
};
