'use strict';

var uuid       = require('node-uuid');
var lodash     = require('lodash');
var moment     = require('moment');
var inflection = require('inflection');
var validator  = require('validator');

var smartRequire = require('./smart-require');

var Utils = module.exports = {
  uuid      : uuid,
  moment    : moment,
  validator : validator,
  inflection: inflection,
  smartRequire: smartRequire,

  _: (function () {
    var _ = lodash;

    _.mixin({
      includes     : function (str, needle) {
        if (needle === '') {
          return true;
        }
        if (str === null) {
          return false;
        }
        return String(str).indexOf(needle) !== -1;
      },
      camelizeIf   : function (string, condition) {
        var result = string;

        if (condition) {
          result = Utils.camelize(string);
        }

        return result;
      },
      underscoredIf: function (string, condition) {
        var result = string;

        if (condition) {
          result = inflection.underscore(string);
        }

        return result;
      },
      /*
       * Returns an array with some falsy values removed. The values null, "", undefined and NaN are considered falsey.
       */
      compactLite  : function (array) {
        var index  = -1,
            length = array ? array.length : 0,
            result = [];

        while (++index < length) {
          var value = array[index];
          if (typeof value === 'boolean' || value === 0 || value) {
            result.push(value);
          }
        }
        return result;
      },

      hasOwnPropertys: function (obj, props) {
        var flag = true;
        for (var i = 0, len = props.length; i < len; i++) {
          if (!obj.hasOwnProperty(props[i])) {
            flag = false;
            break;
          }
        }
        return flag;
      },
      
      randomString: function randomString(len) {
        　　len = len || 32;
        　　var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
        　　var maxPos = $chars.length;
        　　var pwd = '';
        　　for (var i = 0; i < len; i++) {
          　　　　pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
        　　}
        　　return pwd;
      }
    });

    return _;
  })(),

  // Same concept as _.merge, but don't overwrite properties that have already been assigned
  mergeDefaults: function (a, b) {
    return this._.merge(a, b, function (objectValue, sourceValue) {
      // If it's an object, let _ handle it this time, we will be called again for each property
      if (!this._.isPlainObject(objectValue) && objectValue !== undefined) {
        return objectValue;
      }
    }, this);
  },

  camelize: function (str) {
    return str.trim().replace(/[-_\s]+(.)?/g, function (match, c) {
      return c.toUpperCase();
    });
  },

  cloneDeep: function (obj, fn) {
    return lodash.cloneDeep(obj, function (elem) {
      // Unfortunately, lodash.cloneDeep doesn't preserve Buffer.isBuffer, which we have to rely on for binary data
      if (Buffer.isBuffer(elem)) {
        return elem;
      }

      return fn ? fn(elem) : undefined;
    });
  },

  inherit: function (SubClass, SuperClass) {
    if (SuperClass.constructor === Function) {
      // Normal Inheritance
      SubClass.prototype             = new SuperClass();
      SubClass.prototype.constructor = SubClass;
      SubClass.prototype.parent      = SuperClass.prototype;
    } else {
      // Pure Virtual Inheritance
      SubClass.prototype             = SuperClass;
      SubClass.prototype.constructor = SubClass;
      SubClass.prototype.parent      = SuperClass;
    }

    return SubClass;
  },

  stack: function () {
    var orig                = Error.prepareStackTrace;
    Error.prepareStackTrace = function (_, stack) {
      return stack;
    };
    var err                 = new Error();
    Error.captureStackTrace(err, this);
    var errStack            = err.stack;
    Error.prepareStackTrace = orig;
    return errStack;
  },

  tick: function (func) {
    var tick = (global.hasOwnProperty('setImmediate') ? global.setImmediate : process.nextTick);
    tick(func);
  },

  json: function (conditionsOrPath, value) {
    if (Utils._.isObject(conditionsOrPath)) {
      this.conditions = conditionsOrPath;
    } else {
      this.path = conditionsOrPath;
      if (value) {
        this.value = value;
      }
    }
  }
};

