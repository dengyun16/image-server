/**
 * Created by admin on 2016/3/24.
 */
'use strict';
const Promise        = require('bluebird');
const fs             = require('fs-extra');
const path           = require('path');
const crypto         = require('crypto');
const Download       = require('download');
const downloadStatus = require('download-status');

//Promise.promisifyAll(Download.prototype);

const downloader = new Download();


function down(urls, uploadDir) {
  let imageInfos = [];
  return Promise.each(urls, (url)=> {
    url = decodeURIComponent(url);
    let name = path.basename(url);
    return new Promise((resolve, reject)=>{
      return downloader.get(url).run((err, cb) => {
        if (err) {
          return reject(err);
        }
        let fullPath = path.join(uploadDir, name);
        imageInfos.push({originUrl: url, name: name, path: fullPath});
        return resolve();
      });
    });
  }).return(imageInfos);
}

/**
 *
 * @param options
 * @returns {Function}
 */
module.exports = function (options) {
  downloader.use(downloadStatus);
  downloader.runAsync = Promise.promisify(downloader.run);

  let uploadDir = options.uploadDir;
  downloader.dest(uploadDir);

  return (req, res, next)=> {
    let urls = req.query.urls;

    if (!Array.isArray(urls)) {
      urls = [urls];
    }

    down(urls, uploadDir).then((imageInfos)=> {
      req.imageInfos = imageInfos;
      next();
    }).catch(next);
  }
};
