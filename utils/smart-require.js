/* global global */
'use strict';

var path = require('path');

/**
 * defaultGlobalPaths
 * @type {string[]}
 */
var defaultGlobalPaths = [
  'api', 'cache', 'common', 'config',
  'controllers', 'cron', 'enums', 'lib',
  'middlewares', 'models', 'proxy', 'routes',
  'servers', 'services', 'tools', 'utils'
];

/**
 * smartRequireCache
 * @type {{}}
 */
var smartRequireCache = {};

/**
 * smartRequire
 * @param  {String} modulePath [module path]
 * @type {[type]}
 */
function smartRequire(modulePath){
  if (typeof modulePath !== 'string') {
    throw new TypeError('modulePath must be a string');
  }
  
  if (typeof global.ROOT_PATH !== 'string') {
    throw new TypeError('modulePath must be a path string');
  }

  var moduleCache = smartRequireCache[modulePath];
  if (moduleCache) {
    return moduleCache;
  }

  var len = defaultGlobalPaths.length;
  for (var i = 0; i < len; i++) {
    if (modulePath.indexOf(defaultGlobalPaths[i]) === 0) {
      break;
    }
  }

  if (i <= len - 1) {
    modulePath = path.join(global.ROOT_PATH, modulePath);
  }
  
  var m = require(modulePath);

  smartRequireCache[modulePath] = m;

  return m;
};

global.smartRequire = smartRequire;

module.exports = smartRequire;
