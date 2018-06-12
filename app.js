'use strict';
const path = require('path');

const config     = require('config');
const fs         = require('fs-extra');
const express    = require('express');
const compression= require('compression');
const bodyParser = require('body-parser');
const log4js     = require('log4js');
const vhost      = require('vhost');

const connectLogger = require('./middlewares/connect-logger');
const finallyResp   = require('./middlewares/finally-resp');
const logger        = require('./tools/logger');
const createRouter  = require('./routes');

fs.mkdirsSync(config.fileDir);
fs.mkdirsSync(config.upload.rootDir);
fs.mkdirsSync(config.upload.uploadDir);
fs.mkdirsSync(config.formidableConf.uploadDir);

const app = express();

app.use(connectLogger(logger, config.format));
app.use(bodyParser.json({limit: '80mb'}));
app.use(bodyParser.urlencoded({extended: false, limit: '80mb'}));
app.use(compression({
  filter: ()=>true,
  level: 1,
  threshold: '10kb'
}));
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With,X_Requested_With');
  res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
  next();
});

routeVhosts(config.vhostInfos)(app);
function routeVhosts(vhostInfos) {
  return function (app) {
    for (let vhostInfo of vhostInfos) {
      logger.info('-----------------------------------------');
      logger.info(`hostname:${vhostInfo.hostname}`);
      logger.info(`dir     :${vhostInfo.dir}`);
      app.use(vhost(vhostInfo.hostname, createRouter(vhostInfo)));

      // 允许通过其他服务端转发过来，由于转发请求时Host是原Web服务的Host。
      if (Array.isArray(vhostInfo.servers)) {
        for (let server of vhostInfo.servers) {
          logger.info(`allow hostname: ${server.hostname}`);
          app.use(vhost(server.hostname, createRouter(vhostInfo)));
        }
      }

      if (vhostInfo.statics) {
        app.use(vhost(vhostInfo.hostname, express.static(vhostInfo.statics.dir, {maxAge: vhostInfo.statics.maxAge})));
      }
      logger.info('-----------------------------------------');
    }
  };
}

app.use(finallyResp({format: 'JSON', encoding: 'utf8', views: {}}));

app.listen(config.bindPort, function () {
  logger.info(`image service start, listen on：${config.bindPort}`);
});
