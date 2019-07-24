"use strict";

module.exports = {
  db:
    "mongodb://" +
    (process.env.DB_PORT_27017_TCP_ADDR || "localhost") +
    "/mean-test",
  logging: {
    format: "short"
  },
  app: {
    name: "MEAN - A Modern Stack - Test"
  },
  saml: {
    strategy: {
      options: {
        samlOptions: ""
      }
    },
    clientID: "DEFAULT_APP_ID",
    clientSecret: "APP_SECRET",
    callbackURL: "http://localhost/metadata.xml/callback"
  },
  facebook: {
    clientID: "APP_ID",
    clientSecret: "APP_SECRET",
    callbackURL: "http://localhost:3000/auth/facebook/callback"
  },
  twitter: {
    clientID: "CONSUMER_KEY",
    clientSecret: "CONSUMER_SECRET",
    callbackURL: "http://localhost:3000/auth/twitter/callback"
  },
  github: {
    clientID: "APP_ID",
    clientSecret: "APP_SECRET",
    callbackURL: "http://localhost:3000/auth/github/callback"
  },
  google: {
    clientID: "APP_ID",
    clientSecret: "APP_SECRET",
    callbackURL: "http://localhost:3000/auth/google/callback"
  },
  linkedin: {
    clientID: "API_KEY",
    clientSecret: "SECRET_KEY",
    callbackURL: "http://localhost:3000/auth/linkedin/callback"
  },
  emailFrom: "SENDER EMAIL ADDRESS", // sender address like ABC <abc@example.com>
  mailer: {
    service: "SERVICE_PROVIDER",
    auth: {
      user: "EMAIL_ID",
      pass: "PASSWORD"
    }
  },
  secret: "SOME_TOKEN_SECRET",
  api: {
    uri: "http://192.168.245.152:3003"
  },
  elasticsearch: {
    host: "http://localhost",
    port: 9200,
    log: "error",
    keepAlive: false,
    sniffOnConnectionFault: true,
    maxRetries: 50
  },
  circles: {
    uri: "http://localhost:3005"
  },
  rocketChat: {
    uri: "http://localhost:3000",
    authToken: "authToken",
    userId: "userId"
  }
};
