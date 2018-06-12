'use strict';
const path         = require('path');
const childProcess = require('child_process');
const Promise      = require('bluebird');
const uuid         = require('node-uuid');
const mime         = require('mime');
const phantomjs    = require('phantomjs');

const binPath    = phantomjs.path;
const scriptPath = path.join(__dirname, '..', 'tools/phantomjs_render.js');

Promise.promisifyAll(childProcess);

exports.parse = function (options) {
  const extname = options.extname || '.jpeg';
  /**
   * 截取远程网页
   *
   * @name /images/webpage GET
   * @method GET
   * @whocanuse
   *
   * @param req
   * @param {Array.<String>|String} req.query.urls    - 远程页面地址
   * @param res
   * @param next
   */
  return function (req, res, next) {
    let urls = req.query.urls;
    if (!Array.isArray(req.query.urls)) {
      urls = [urls];
    }
    let imageInfos = req.imageInfos = [];
    return Promise.map(urls, (url) => {
      let fileName   = uuid.v1().replace(/-/gim, '') + extname;
      let filePath   = path.join(options.uploadDir, fileName);
      let hash;

      //let customOpts = {
      //  viewportSize: {
      //    width : 800,
      //    height: 1300
      //  },
      //  clipRect : {
      //    top   : 0,
      //    left  : 0,
      //    width : 800,
      //    height: 1300
      //  }
      //};

      return childProcess.execFileAsync(binPath, [scriptPath, decodeURIComponent(url), filePath/*, customOpts*/])
        .tap((stdout, stderr)=> {
          if (stdout || stderr) {
            throw new Error('pageOpenFail');
          }
        })
        .then(()=> {
          let imageInfo = {path: filePath, type: mime.lookup(extname), hash};
          imageInfos.push(imageInfo);
          next();
        })
        .catch((err)=> {
          if (err.message === 'pageOpenFail') {
            return next({status: 'error', err: `pageOpenFail for url:${url}`});
          }
          next({status: 'error', err: err})
        });
    });
  }
};
