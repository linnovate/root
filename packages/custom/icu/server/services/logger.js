var winston = require("winston");
require("winston-daily-rotate-file");
var os = require("os");

var logDir = "log";

var logger = new winston.Logger({
  rewriters: [
    (level, msg, meta) => {
      meta.server = os.hostname();
      return meta;
    }
  ],
  transports: [
    new winston.transports.Console({}),
    new winston.transports.DailyRotateFile({
      name: "info",
      filename: `${logDir}/-results.log`,
      datePattern: "yyyy-MM-dd",
      prepend: true,
      json: false,
      maxsize: 10000000,
      maxFiles: 20,
      prettyPrint: false,
      level: "info"
      // colorize: true
    })
  ]
});

logger.add(winston.transports.DailyRotateFile, {
  name: "error",
  filename: `${logDir}/-error.log`,
  datePattern: "yyyy-MM-dd",
  prepend: true,
  json: false,
  level: "error",
  maxsize: 10000000,
  maxFiles: 20,
  prettyPrint: false
  // colorize: true
});
module.exports = logger;
