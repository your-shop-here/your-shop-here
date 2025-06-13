// source https://github.com/jerrybendy/url-search-params-polyfill/

var internalParameterList = "internalParameterList";
var apiHttpParameterMap = require("dw/web/HttpParameterMap");
var self = module;
var iterable = !!(self.Symbol && self.Symbol.iterator);

/**
 * Make a URLSearchParams instance
 *
 * @param {object|string|URLSearchParams} search
 * @constructor
 */
function URLSearchParams(search) {
  search = search || "";
  // support construct object with another URLSearchParams instance
  if (search instanceof URLSearchParams) {
    search = search.toString();
  }
  this[internalParameterList] = parseToDict(search);
}

var prototype = URLSearchParams.prototype;

/**
 * Appends a specified key/value pair as a new search parameter.
 *
 * @param {string} name
 * @param {string} value
 */
prototype.append = function (name, value) {
  appendTo(this[internalParameterList], name, value);
};

/**
 * Filters the search parameters based on the allow list
 *
 * @param {Array} allowList - The allow list of parameters, RexEx and string are supported
 * @returns {URLSearchParams} The filtered URLSearchParams instance
 */
prototype.allowList = function (allowList) {
  let newSearchParams = [];
  const parameters = this;
  this.forEach((value, param) => {
    if (value) {
      if (allowList.filter(item => (typeof(item) === 'string')).indexOf(param) !== -1) {
        newSearchParams.push(`${param}=${this.get(param)}`);
      } else {
        allowList.filter(item => (item instanceof RegExp)).forEach((rule) => {
          if (rule.test(param)) {
            newSearchParams.push(`${param}=${this.get(param)}`);
          }
        });
      }
    }
  });
  return new URLSearchParams(newSearchParams.join('&'))
};

/**
 * Deletes the given search parameter, and its associated value,
 * from the list of all search parameters.
 *
 * @param {string} name
 */
prototype["delete"] = function (name) {
  delete this[internalParameterList][name];
};

/**
 * Returns the first value associated to the given search parameter.
 *
 * @param {string} name
 * @returns {string|null}
 */
prototype.get = function (name) {
  var dict = this[internalParameterList];
  return this.has(name) ? dict[name][0] : null;
};

/**
 * Returns all the values association with a given search parameter.
 *
 * @param {string} name
 * @returns {Array}
 */
prototype.getAll = function (name) {
  var dict = this[internalParameterList];
  return this.has(name) ? dict[name].slice(0) : [];
};

/**
 * Returns a Boolean indicating if such a search parameter exists.
 *
 * @param {string} name
 * @returns {boolean}
 */
prototype.has = function (name) {
  return hasOwnProperty(this[internalParameterList], name);
};

/**
 * Sets the value associated to a given search parameter to
 * the given value. If there were several values, delete the
 * others.
 *
 * @param {string} name
 * @param {string} value
 */
prototype.set = function set(name, value) {
  this[internalParameterList][name] = ["" + value];
};

/**
 * Returns a string containg a query string suitable for use in a URL.
 *
 * @returns {string}
 */
prototype.toString = function () {
  var dict = this[internalParameterList],
    query = [],
    i,
    key,
    name,
    value;
  for (key in dict) {
    name = encode(key);
    for (i = 0, value = dict[key]; i < value.length; i++) {
      query.push(name + "=" + encode(value[i]));
    }
  }
  return query.join("&");
};

// There is a bug in Safari 10.1 and `Proxy`ing it is not enough.
var useProxy = false;
var propValue = URLSearchParams;

/*
 * Apply polyfill to global object and append other prototype into it
 */
Object.defineProperty(self, "URLSearchParams", {
  value: propValue,
});

var USPProto = self.URLSearchParams.prototype;

USPProto.polyfill = true;

// Fix #54, `toString.call(new URLSearchParams)` will return correct value when Proxy not used
if (!useProxy && self.Symbol) {
  USPProto[self.Symbol.toStringTag] = "URLSearchParams";
}

/**
 *
 * @param {function} callback
 * @param {object} thisArg
 */
if (!("forEach" in USPProto)) {
  USPProto.forEach = function (callback, thisArg) {
    var dict = parseToDict(this.toString());
    Object.getOwnPropertyNames(dict).forEach(function (name) {
      dict[name].forEach(function (value) {
        callback.call(thisArg, value, name, this);
      }, this);
    }, this);
  };
}

/**
 * Sort all name-value pairs
 */
if (!("sort" in USPProto)) {
  USPProto.sort = function () {
    var dict = parseToDict(this.toString()),
      keys = [],
      k,
      i,
      j;
    for (k in dict) {
      keys.push(k);
    }
    keys.sort();

    for (i = 0; i < keys.length; i++) {
      this["delete"](keys[i]);
    }
    for (i = 0; i < keys.length; i++) {
      var key = keys[i],
        values = dict[key];
      for (j = 0; j < values.length; j++) {
        this.append(key, values[j]);
      }
    }
  };
}

/**
 * Returns an iterator allowing to go through all keys of
 * the key/value pairs contained in this object.
 *
 * @returns {function}
 */
if (!("keys" in USPProto)) {
  USPProto.keys = function () {
    var items = [];
    this.forEach(function (item, name) {
      items.push(name);
    });
    return makeIterator(items);
  };
}

/**
 * Returns an iterator allowing to go through all values of
 * the key/value pairs contained in this object.
 *
 * @returns {function}
 */
if (!("values" in USPProto)) {
  USPProto.values = function () {
    var items = [];
    this.forEach(function (item) {
      items.push(item);
    });
    return makeIterator(items);
  };
}

/**
 * Returns an iterator allowing to go through all key/value
 * pairs contained in this object.
 *
 * @returns {function}
 */
if (!("entries" in USPProto)) {
  USPProto.entries = function () {
    var items = [];
    this.forEach(function (item, name) {
      items.push([name, item]);
    });
    return makeIterator(items);
  };
}

if (iterable) {
  USPProto[self.Symbol.iterator] =
    USPProto[self.Symbol.iterator] || USPProto.entries;
}

if (!("size" in USPProto)) {
  Object.defineProperty(USPProto, "size", {
    get: function () {
      var dict = parseToDict(this.toString());
      if (USPProto === this) {
        throw new TypeError(
          "Illegal invocation at URLSearchParams.invokeGetter"
        );
      }
      return Object.keys(dict).reduce(function (prev, cur) {
        return prev + dict[cur].length;
      }, 0);
    },
  });
}

function encode(str) {
  var replace = {
    "!": "%21",
    "'": "%27",
    "(": "%28",
    ")": "%29",
    "~": "%7E",
    "%20": "+",
    "%00": "\x00",
  };
  return encodeURIComponent(str).replace(
    /[!'\(\)~]|%20|%00/g,
    function (match) {
      return replace[match];
    }
  );
}

function decode(str) {
  return str
    .replace(/[ +]/g, "%20")
    .replace(/(%[a-f0-9]{2})+/gi, function (match) {
      return decodeURIComponent(match);
    });
}

function makeIterator(arr) {
  var iterator = {
    next: function () {
      var value = arr.shift();
      return { done: value === undefined, value: value };
    },
  };

  if (iterable) {
    iterator[self.Symbol.iterator] = function () {
      return iterator;
    };
  }

  return iterator;
}

function parseToDict(search) {
  var dict = {};

  if (typeof search === "object") {
    // if `search` is an array, treat it as a sequence
    if (isArray(search)) {
      for (var i = 0; i < search.length; i++) {
        var item = search[i];
        if (isArray(item) && item.length === 2) {
          appendTo(dict, item[0], item[1]);
        } else {
          throw new TypeError(
            "Failed to construct 'URLSearchParams': Sequence initializer must only contain pair elements"
          );
        }
      }
    } else if (search instanceof apiHttpParameterMap) {
      search
        .getParameterNames()
        .toArray()
        .forEach((name) => {
          appendTo(dict, name, search[name].stringValue);
        });
    } else {
      for (var key in search) {
        if (search.hasOwnProperty(key)) {
          appendTo(dict, key, search[key]);
        }
      }
    }
  } else {
    // remove first '?'
    if (search.indexOf("?") === 0) {
      search = search.slice(1);
    }

    var pairs = search.split("&");
    for (var j = 0; j < pairs.length; j++) {
      var value = pairs[j],
        index = value.indexOf("=");

      if (-1 < index) {
        appendTo(
          dict,
          decode(value.slice(0, index)),
          decode(value.slice(index + 1))
        );
      } else {
        if (value) {
          appendTo(dict, decode(value), "");
        }
      }
    }
  }

  return dict;
}

function appendTo(dict, name, value) {
  var val =
    typeof value === "string"
      ? value
      : value !== null &&
        value !== undefined &&
        typeof value.toString === "function"
      ? value.toString()
      : JSON.stringify(value);

  // #47 Prevent using `hasOwnProperty` as a property name
  if (hasOwnProperty(dict, name)) {
    dict[name].push(val);
  } else {
    dict[name] = [val];
  }
}

function isArray(val) {
  return !!val && "[object Array]" === Object.prototype.toString.call(val);
}

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = URLSearchParams;
