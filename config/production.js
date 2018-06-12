'use strict';

module.exports = {
  vhostInfos : [
    {
      hostname : '45.79.108.203',
      host : 'https://img.ubuy365.com',
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
};

