/**
 * Created by admin on 2016/3/23.
 */
'use strict';
const Promise    = require('bluebird');
const fs         = require('fs-extra');
const fspro      = require('node-fs');
const path       = require('path');
const mime       = require('mime');
const gm         = require('gm');
const _          = require('lodash');
const config     = require('config');
const formidable = require('formidable');
const hasha      = require('hasha');

const logger     = require('../tools/logger');
const imageTools = require('../tools/image');

const models = require('../models');

const imageFieldsPick = ['name', 'date', 'hash', 'size', 'format', 'mime', 'url'];

Promise.promisifyAll(gm.prototype);
Promise.promisifyAll(fs);

let hashFileAsync = Promise.promisifyAll(hasha.fromFile);

function saveAsFile(file, rootDir) {
  let pathName   = file.path;
  let ext        = path.extname(pathName).toLowerCase();
  let fileName   = path.basename(pathName, ext).replace(/^upload_/, '');
  let firstFile  = fileName.substring(0, 2);
  let secondFile = fileName.substring(2, 4);

  let realExt = '.' + file.format.toLowerCase();

  fileName += '-' + file.size + '-' + file.geometry + ext;

  if (ext !== realExt) {
    // JPEG: .jpg .jpeg
    if (ext !== '.jpg' || realExt !== '.jpeg') {
      fileName += realExt;
    }
  }

  let filePath    = '/' + firstFile + '/' + secondFile + '/' + fileName;
  let newFilePath = path.join(rootDir, filePath);

  fspro.mkdirSync(path.dirname(newFilePath), 755, true);

  fs.renameSync(pathName, newFilePath);
  return filePath;
}

function saveImageToDB(headers, vhostInfo, fileDir, file, date) {
  return exports.attchFileInfo(file).then(()=> {
    return models.Image.getImgInfoAsync(vhostInfo, file).then(function (result) {
      date = date || new Date();

      let imageInfo  = {};
      imageInfo.name = file.name;
      imageInfo.hash = file.hash;
      imageInfo.size = file.size;
      imageInfo.mime = file.type;
      imageInfo.host = vhostInfo.host;
      imageInfo.ua   = headers['user-agent'];
      imageInfo.root = fileDir;
      imageInfo.date = date;

      if (result) {
        imageInfo.url    = result.url;
        imageInfo.format = result.format;
        return Promise.resolve(imageInfo);
      }
      else {
        return gm(file.path).autoOrient().writeAsync(file.path).then(()=> {
          return gm(file.path).identifyAsync().then((identify)=> {
            file.format = imageInfo.format = identify.format;
            file.mime = file.type = mime.lookup(file.format.toLowerCase());
            file.geometry = imageInfo.geometry = identify.Geometry;
            imageInfo.url = vhostInfo.host + config.upload.imgUrlPath + saveAsFile(file, fileDir);
            return Promise.resolve(imageInfo);
          });
        });
      }
    });
  });
}

exports.attchFileInfo = function (file) {
  let filePath = file.path;
  return Promise.resolve().then(()=> {
    if (!file.hash) {
      return hashFileAsync(filePath, {algorithm: 'md5'}).then((hash)=>(file.hash = hash));
    }
  }).then(()=> {
    if (!file.name) {
      file.name = file.hash;
    }
  }).then(()=> {
    if (!file.size) {
      return fs.statAsync(filePath).then((stat)=> {
        file.size = stat.size;
      })
    }
  });
};

exports.handleImage = function (headers, vhostInfo, files, fileDir) {
  let date       = new Date();
  let images     = [];
  let imageInfos = [];
  return Promise.resolve(files).each((file)=> {
    return saveImageToDB(headers, vhostInfo, fileDir, file, date).then((imageInfo)=> {
      imageInfos.push(_.pick(imageInfo, imageFieldsPick));
      images.push(imageInfo);
    });
  }).return({imageInfos}).finally(()=> {
    models.Image.create(images);
  });
};

exports.handleFormImage = function (headers, vhostInfo, fields, files, fileDir) {
  let imageInputNames = fields['imageInputName'] || 'image';

  let date       = new Date();
  let images     = [];
  let imageInfos = [];

  return Promise.resolve(imageInputNames.split(',')).each(function (filename) {
    let file = files[filename];
    if (!file) {
      return Promise.reject(`找不到文件：${filename}`);
    }

    if (file.size === 0) {
      return Promise.reject(`文件为空：${filename}`);
    }

    return saveImageToDB(headers, vhostInfo, fileDir, file, date).then((imageInfo)=> {
      imageInfos.push(_.pick(imageInfo, imageFieldsPick));
      images.push(imageInfo);
    });
  }).return({imageInfos}).finally();
};
