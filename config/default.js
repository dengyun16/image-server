'use strict';
module.exports = {
  bindPort: 19999,

  log: {
    dir           : '/raid/image_service/log/',
    format        : ':remote-addr :method :url :status :response-time ms :user-agent :content-length',
    replaceConsole: true,
    level         : 'AUTO',
    console       : true
  },

  vhostInfos : [
    {
      hostname : '127.0.0.1',
      host : 'http://127.0.0.1:19999',
      dir : 'cms2',
      statics : {
        "dir": "/raid/img.bbs.duoyi.com",
        "maxAge": 3600
      },
      servers : [
        {
          hostname: "127.0.0.1"
        },
        {
          hostname: "45.79.108.203"
        },
        {
          hostname: "www.img.com"
        },
        {
          hostname: "*.image.com"
        },
        {
          hostname: "*.bbs.duoyi.com"
        }
      ]
    },
  ],

  fileDir  : '/raid/image_service',
  thumbnail: '/raid/image_service/thumbnail',

  formidableConf: {
    uploadDir     : '/raid/image_service/tmp',
    encoding      : 'utf-8',
    maxFieldsSize : 1024 * 1024 * 128, //128M
    keepExtensions: true,
    hash          : 'md5'
  },

  upload: {
    uploadDir : '/raid/image_service/tmp',
    rootDir   : '/raid/image_service',
    miscDir   : 'misc',
    imgUrlPath: '/images'
  },

/*  mongodb: {
    url: 'mongodb://127.0.0.1:27017/image'
  },*/

  /**
   * format:
   * imgSizes: {
   *   '64x64'    : true,
   *   '96x96'    : true
   * },
   */
  imgSizes: undefined
};
