const HookMgr = require('dw/system/HookMgr');

const arrayPrototype = Array.prototype;
const hasOnResponseHook = HookMgr.hasHook('dw.custom.response.onResponse');
/**
 * Retrieves session locale info
 *
 * @param {string} locale - Session locale code, xx_XX
 * @param {dw.util.Currency} currency - Session currency
 * @return {Object} - Session locale info
 */
function getCurrentLocale(locale, currency) {
    return {
        id: locale,
        currency: {
            currencyCode: currency.currencyCode,
            defaultFractionDigits: currency.defaultFractionDigits,
            name: currency.name,
            symbol: currency.symbol,
        },
    };
}

/**
 * get a local instance of the geo location object
 * @param {Object} request - Global request object
 * @returns {Object} object containing geo location information
 */
function getGeolocationObject(request) {
    const Locale = require('dw/util/Locale');
    const currentLocale = Locale.getLocale(request.locale);

    return {
        countryCode: request.geolocation ? request.geolocation.countryCode : currentLocale.country,
        latitude: request.geolocation ? request.geolocation.latitude : 90.0000,
        longitude: request.geolocation ? request.geolocation.longitude : 0.0000,
    };
}

/**
 * Get request body as string if it is a POST or PUT
 * @param {Object} request - Global request object
 * @returns {string|Null} the request body as string
 */
function getRequestBodyAsString(request) {
    let result = null;

    if (request
        && (request.httpMethod === 'POST' || request.httpMethod === 'PUT')
        && request.httpParameterMap
    ) {
        result = request.httpParameterMap.requestBodyAsString;
    }

    return result;
}

/**
 * Get a local instance of the pageMetaData object
 * @param {Object} pageMetaData - Global request pageMetaData object
 * @returns {Object} object containing pageMetaData information
 */
function getPageMetaData(pageMetaData) {
    const pageMetaDataObject = {
        title: pageMetaData.title,
        description: pageMetaData.description,
        keywords: pageMetaData.keywords,
        pageMetaTags: pageMetaData.pageMetaTags,
        addPageMetaTags(pageMetaTags) {
            pageMetaData.addPageMetaTags(pageMetaTags);
        },
        setTitle(title) {
            pageMetaData.setTitle(title);
        },
        setDescription(description) {
            pageMetaData.setDescription(description);
        },
        setKeywords(keywords) {
            pageMetaData.setKeywords(keywords);
        },
    };

    return pageMetaDataObject;
}

/**
 * @constructor
 * @classdesc Local instance of request object with customer object in it
 *
 * Translates global request and customer object to local one
 * @param {Object} request - Global request object
 * @param {dw.customer.Customer} customer - Global customer object
 * @param {dw.system.Session} session - Global session object
 */
function Request(request, customer, session) {
    this.setLocale = function (localeID) {
        return request.setLocale(localeID);
    };

    Object.defineProperty(this, 'raw', {
        get() {
            return request;
        },
    });

    Object.defineProperty(this, 'httpParameterMap', {
        get() {
            return request.httpParameterMap;
        },
    });

    Object.defineProperty(this, 'body', {
        get() {
            return getRequestBodyAsString(request);
        },
    });

    Object.defineProperty(this, 'geolocation', {
        get() {
            return getGeolocationObject(request);
        },
    });

    Object.defineProperty(this, 'locale', {
        get() {
            return getCurrentLocale(request.locale, session.currency);
        },
    });

    Object.defineProperty(this, 'remoteAddress', {
        get() {
            return request.getHttpRemoteAddress();
        },
    });

    Object.defineProperty(this, 'referer', {
        get() {
            return request.getHttpReferer();
        },
    });

    Object.defineProperty(this, 'pageMetaData', {
        get() {
            return getPageMetaData(request.pageMetaData);
        },
    });
}

/**
 * @constructor
 * @classdesc Creates writtable response object
 *
 * @param {Object} response - Global response object
 */
function Response(response) {
    this.view = null;
    this.viewData = {};
    this.redirectUrl = null;
    this.redirectStatus = null;
    this.messageLog = [];
    this.base = response;
    this.cachePeriod = null;
    this.cachePeriodUnit = null;
    this.personalized = false;
    this.renderings = [];

    if (hasOnResponseHook) {
        HookMgr.callHook('dw.custom.response.onResponse', 'onResponse', response);
    }
}

/**
 * Stores a list of rendering steps.
 * @param {Array} renderings - The array of rendering steps
 * @param {Object} object - An object containing what type to render
 * @returns {void}
 */
function appendRenderings(renderings, object) {
    let hasRendering = false;

    if (!object.force && renderings.length) {
        for (let i = renderings.length - 1; i >= 0; i--) {
            if (renderings[i].type === 'render') {
                renderings[i] = object; // eslint-disable-line no-param-reassign
                hasRendering = true;
                break;
            }
        }
    }

    if (!hasRendering) {
        renderings.push(object);
    }
}

Response.prototype = {
    /**
     * Stores template name and data for rendering at the later time
     * @param {string} name - Path to a template
     * @param {Object} data - Data to be passed to the template
     * @returns {void}
     */
    renderPartial: function renderPartial(name, data) {
        this.view = name;
        this.viewData[name] = data;

        appendRenderings(this.renderings, { type: 'render', subType: 'partial', view: name });
    },

    /**
     * Stores template name and data for rendering at the later time
     * @param {string} name - Path to a template
     * @param {Object} data - Data to be passed to the template
     * @returns {void}
     */
    appendPartial: function renderPartial(name, data) {
        this.view = name;
        this.viewData[name] = data;

        appendRenderings(this.renderings, {
            type: 'render', subType: 'partial', view: name, force: true,
        });
    },
    /**
     * Stores template name and data for rendering at the later time
     * @param {string} name - Path to a template
     * @param {Object} data - Data to be passed to the template
     * @returns {void}
     */
    render: function render(name, data) {
        this.view = name;
        this.viewData = Object.assign(this.viewData, data);

        appendRenderings(this.renderings, { type: 'render', subType: 'isml', view: name });
    },
    /**
     * Stores data to be rendered as json
     * @param {Object} data - Data to be rendered as json
     * @returns {void}
     */
    json: function json(data) {
        this.isJson = true;
        this.viewData = Object.assign(this.viewData, data);

        appendRenderings(this.renderings, { type: 'render', subType: 'json' });
    },
    /**
     * Stores data to be rendered as XML
     * @param {string} xmlString - The XML to print.
     * @returns {void}
     */
    xml: function xml(xmlString) {
        this.isXml = true;
        this.viewData = Object.assign(this.viewData, { xml: xmlString });

        appendRenderings(this.renderings, { type: 'render', subType: 'xml' });
    },
    /**
     * Stores data to be rendered as a page designer page
     * @param {string} page - ID of the page to be rendered
     * @param {Object} data - Data to be passed to the template
     * @param {dw.util.HashMap} aspectAttributes - (optional) aspect attributes to be passed to the PageMgr
     * @returns {void}
     */
    page(page, data, aspectAttributes) {
        this.viewData = Object.assign(this.viewData, data);
        appendRenderings(this.renderings, {
            type: 'render', subType: 'page', page, aspectAttributes,
        });
    },
    /**
     * Redirects to a given url right away
     * @param {string} url - Url to be redirected to
     * @returns {void}
     */
    redirect: function redirect(url) {
        this.redirectUrl = url;
    },
    /**
     * Sets an optional redirect status, standard cases being 301 or 302.
     * @param {string} redirectStatus - HTTP redirect status code
     * @returns {void}
     */
    setRedirectStatus: function setRedirectStatus(redirectStatus) {
        this.redirectStatus = redirectStatus;
    },
    /**
     * Get data that was setup for a template
     * @returns {Object} Data for the template
     */
    getViewData() {
        return this.viewData;
    },
    /**
     * Updates data for the template
     * @param {Object} data - Data for template
     * @returns {void}
     */
    setViewData(data) {
        this.viewData = Object.assign(this.viewData, data);
    },
    /**
     * Logs information for output on the error page
     * @param {string[]} arguments - List of items to be logged
     * @returns {void}
     */
    log: function log() {
        const args = Array.prototype.slice.call(arguments);

        const output = args.map((item) => {
            if (typeof item === 'object' || Array.isArray(item)) {
                return JSON.stringify(item);
            }
            return item;
        });

        this.messageLog.push(output.join(' '));
    },
    /**
     * Set content type for the output
     * @param {string} type - Type of the output
     * @returns {void}
     */
    setContentType: function setContentType(type) {
        this.base.setContentType(type);
    },

    /**
     * Set status code of the response
     * @param {int} code - Valid HTTP return code
     * @returns {void}
     */
    setStatusCode: function setStatusCode(code) {
        this.base.setStatus(code);
    },

    /**
     * creates a print step to the renderings
     * @param {string} message - Message to be printed
     * @returns {void}
     */
    print: function print(message) {
        this.renderings.push({ type: 'print', message });
    },

    /**
     * Sets current page cache expiration period value in hours
     * @param  {int} period Number of hours from current time
     * @return {void}
     */
    cacheExpiration: function cacheExpiration(period) {
        this.cachePeriod = period;
    },

    /**
     * Adds a response header with the given name and value
     * @param  {string} name - the name to use for the response header
     * @param  {string} value - the value to use
     * @return {void}
     */
    setHttpHeader: function setHttpHeader(name, value) {
        this.base.setHttpHeader(name, value);
    },

};

/**
 * @param {Object} req - Request object
 * @returns {Object} object containing the querystring of the loaded page
 */
function getPageMetadata(req) {
    const pageMetadata = {};
    const action = request.httpPath.split('/');

    pageMetadata.action = action[action.length - 1];
    pageMetadata.queryString = request.httpQueryString;
    pageMetadata.locale = req.locale.id;

    return pageMetadata;
}

/**
 * @constructor
 * @param {string} name - Name of the route, corresponds to the second part of the URL
 * @param {Function[]} chain - List of functions to be executed
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
function Route(name, chain, req, res) {
    this.name = name;
    this.chain = chain;
    this.req = req;
    this.res = res;
    res.setViewData(getPageMetadata(req));
    EventEmitter.call(this);
}

Route.prototype = EventEmitter.prototype;

/**
 * Create a single function that chains all of the calls together, one after another
 * @returns {Function} Function to be executed when URL is hit
 */
Route.prototype.getRoute = function () {
    const me = this;
    return (function (err) {
        let i = 0;

        if (err && err.ErrorText) {
            const system = require('dw/system/System');
            const showError = system.getInstanceType() !== system.PRODUCTION_SYSTEM;
            me.req.error = {
                errorText: showError ? err.ErrorText : '',
                controllerName: showError ? err.ControllerName : '',
                startNodeName: showError ? err.CurrentStartNodeName || me.name : '',
            };
        }

        // freeze request object to avoid mutations
        Object.freeze(me.req);

        /**
         * Go to the next step in the chain or complete the chain after the last step
         * @param {Object} error - Error object from the prevous step
         * @returns {void}
         */
        function next(error) {
            if (error) {
                // process error here and output error template
                me.res.log(error);
                throw new Error(error.message, error.fileName, error.lineNumber);
            }

            if (me.res.redirectUrl) {
                // if there's a pending redirect, break the chain
                me.emit('route:Redirect', me.req, me.res);
                if (me.res.redirectStatus) {
                    me.res.base.redirect(me.res.redirectUrl, me.res.redirectStatus);
                } else {
                    me.res.base.redirect(me.res.redirectUrl);
                }
                return;
            }

            if (i < me.chain.length) {
                me.emit('route:Step', me.req, me.res);
                me.chain[i++].call(me, me.req, me.res, next);
            } else {
                me.done.call(me, me.req, me.res);
            }
        }

        i++;
        me.emit('route:Start', me.req, me.res);
        me.chain[0].call(me, me.req, me.res, next);
    });
};

/**
 * Append a middleware step into current chain
 *
 * @param {Function} step - New middleware step
 * @return {void}
 */
Route.prototype.append = function append(step) {
    this.chain.push(step);
};

/**
 * Last step in the chain, this will render a template or output a json string
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {void}
 */
Route.prototype.done = function done(req, res) {
    this.emit('route:BeforeComplete', req, res);
    this.emit('route:Complete', req, res);
};

/**
 * Middleware filter for get requests
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next call in the middleware chain
 * @returns {void}
 */
function get(req, res, next) {
    if (request.httpMethod === 'GET') {
        res.setHttpHeader('Access-Control-Allow-Origin', 'https://api.cquotient.com');
        res.setHttpHeader('Access-Control-Allow-Headers', 'x-requested-with');
        next();
    } else if (request.httpMethod === 'OPTIONS') {
        const Response = require('dw/system/Response');

        res.setStatusCode(204);
        res.setHttpHeader(Response.ALLOW, 'OPTIONS,GET');
        res.print('');
        this.emit('route:Complete', req, res);

        next();
    } else {
        next(new Error('Params do not match route'));
    }
}

/**
 * Middleware filter for post requests
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next call in the middleware chain
 * @returns {void}
 */
function post(req, res, next) {
    if (request.httpMethod === 'POST') {
        next();
    } else if (request.httpMethod === 'OPTIONS') {
        res.setStatusCode(204);
        res.setHttpHeader(Response.ALLOW, 'OPTIONS,POST');
        res.print('');
        this.emit('route:Complete', req, res);

        next();
    } else {
        next(new Error('Params do not match route'));
    }
}

/**
 * Middleware filter for https requests
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next call in the middleware chain
 * @returns {void}
 */
function https(req, res, next) {
    if (request.isHttpSecure()) {
        next();
    } else {
        next(new Error('Params do not match route'));
    }
}

/**
 * Middleware filter for http requests
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next call in the middleware chain
 * @returns {void}
 */
function http(req, res, next) {
    if (!request.isHttpSecure()) {
        next();
    } else {
        next(new Error('Params do not match route'));
    }
}

/**
 * Middleware to filter for remote includes
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next call in the middleware chain
 * @returns {void}
 */
function include(req, res, next) {
    if (request.includeRequest) {
        next();
    } else {
        next(new Error('Params do not match route'));
    }
}

const middleware = {
    get,
    post,
    https,
    http,
    include,
};

/**
 * Render an ISML template
 * @param {string} view - Path to an ISML template
 * @param {Object} viewData - Data to be passed as pdict
 * @returns {void}
*/
function template(view, viewData) {
    const ISML = require('dw/template/ISML');
    // create a shallow copy of the data
    const data = viewData;
    data.translate = function (key) {
        return dw.web.Resource.msg(key, 'translations', `Translation missing: ${key}`);
    };
    data.lang = require('dw/util/Locale').getLocale(request.getLocale()).getLanguage();
    try {
        ISML.renderTemplate(view, data);
    } catch (e) {
        throw new Error(`${e.javaMessage} \n ${e.stack} ${e.fileName} ${e.lineNumber}`);
    }
}

/**
 * Render JSON as an output
 * @param {Object} data - Object to be turned into JSON
 * @param {Object} response - Response object
 * @returns {void}
 */
function json(data, response) {
    response.setContentType('application/json');
    response.base.writer.print(JSON.stringify(data, null, 2));
}

/**
 * Render a page designer page
 * @param {string} pageID - Path to an ISML template
 * @param {dw.util.HashMap} aspectAttributes - aspectAttributes to be passed to the PageMgr
 * @param {Object} data - Data to be passed
 * @returns {void}
 */
function page(pageID, aspectAttributes, data) {
    const PageMgr = require('dw/experience/PageMgr');
    if (aspectAttributes && !aspectAttributes.isEmpty()) {
        response.writer.print(PageMgr.renderPage(pageID, aspectAttributes, JSON.stringify(data)));
    } else {
        response.writer.print(PageMgr.renderPage(pageID, JSON.stringify(data)));
    }
}

/**
 * Determines what to render
 * @param {Object} res - Response object
 * @returns {void}
 */
function applyRenderings(res) {
    if (res.renderings.length) {
        res.renderings.forEach((element) => {
            if (element.type === 'render') {
                switch (element.subType) {
                    case 'partial':
                        require('*/api/partials').create(element.view).render(res.viewData[element.view] ? res.viewData[element.view].object : {});
                        break;
                    case 'isml':
                        template(element.view, res.viewData);
                        break;
                    case 'json':
                        json(res.viewData, res);
                        break;
                    case 'xml':
                        xml(res.viewData, res);
                        break;
                    case 'page':
                        page(element.page, element.aspectAttributes, res.viewData, res);
                        break;
                    default:
                        break;
                        throw new Error('Cannot render template without name or data');
                }
            } else if (element.type === 'print') {
                res.base.writer.print(element.message);
            } else {
                throw new Error('Cannot render template without name or data');
            }
        });
    } else {
        throw new Error('Cannot render template without name or data');
    }
}

const render = {
    applyRenderings,
};

/* eslint-disable */

/*

The MIT License (MIT)

Copyright (c) 2014 Arnout Kazemier

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

//
// We store our EE objects in a plain object whose properties are event names.
// If `Object.create(null)` is not supported we prefix the event names with a
// `~` to make sure that the built-in object properties are not overridden or
// used as an attack vector.
// We also assume that `Object.create(null)` is available when the event name
// is an ES6 Symbol.
//
var prefix = typeof Object.create !== 'function' ? '~' : false;

/**
 * Representation of a single EventEmitter function.
 *
 * @param {Function} fn Event handler to be called.
 * @param {Mixed} context Context for function execution.
 * @param {Boolean} [once=false] Only emit once
 * @api private
 */
function EE(fn, context, once) {
  this.fn = fn;
  this.context = context;
  this.once = once || false;
}

/**
 * Minimal EventEmitter interface that is molded against the Node.js
 * EventEmitter interface.
 *
 * @constructor
 * @api public
 */
function EventEmitter() { /* Nothing to set */ }

/**
 * Holds the assigned EventEmitters by name.
 *
 * @type {Object}
 * @private
 */
EventEmitter.prototype._events = undefined;

/**
 * Return a list of assigned event listeners.
 *
 * @param {String} event The events that should be listed.
 * @param {Boolean} exists We only need to know if there are listeners.
 * @returns {Array|Boolean}
 * @api public
 */
EventEmitter.prototype.listeners = function listeners(event, exists) {
  var evt = prefix ? prefix + event : event
    , available = this._events && this._events[evt];

  if (exists) {
        return !!available;
  }
  if (!available) {
      return [];
  }
  if (available.fn) {
      return [available.fn];
  }

  for (var i = 0, l = available.length, ee = new Array(l); i < l; i++) {
    ee[i] = available[i].fn;
  }

  return ee;
};

/**
 * Emit an event to all registered event listeners.
 *
 * @param {String} event The name of the event.
 * @returns {Boolean} Indication if we've emitted an event.
 * @api public
 */
EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
  var evt = prefix ? prefix + event : event;

  if (!this._events || !this._events[evt]) {
      return false;
  }

  var listeners = this._events[evt]
    , len = arguments.length
    , args
    , i;

  if ('function' === typeof listeners.fn) {
    if (listeners.once) {
        this.removeListener(event, listeners.fn, undefined, true);
    }

    switch (len) {
      case 1: return listeners.fn.call(listeners.context), true;
      case 2: return listeners.fn.call(listeners.context, a1), true;
      case 3: return listeners.fn.call(listeners.context, a1, a2), true;
      case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
      case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
      case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
    }

    for (i = 1, args = new Array(len - 1); i < len; i++) {
      args[i - 1] = arguments[i];
    }

    listeners.fn.apply(listeners.context, args);
  } else {
    var length = listeners.length
      , j;

    for (i = 0; i < length; i++) {
      if (listeners[i].once) {
          this.removeListener(event, listeners[i].fn, undefined, true);
      }

      switch (len) {
        case 1: listeners[i].fn.call(listeners[i].context); break;
        case 2: listeners[i].fn.call(listeners[i].context, a1); break;
        case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
        default:
          if (!args) {
              for (j = 1, args = new Array(len - 1); j < len; j++) {
                args[j - 1] = arguments[j];
              }
          }

          listeners[i].fn.apply(listeners[i].context, args);
      }
    }
  }

  return true;
};

/**
 * Register a new EventListener for the given event.
 *
 * @param {String} event Name of the event.
 * @param {Function} fn Callback function.
 * @param {Mixed} [context=this] The context of the function.
 * @api public
 */
EventEmitter.prototype.on = function on(event, fn, context) {
  var listener = new EE(fn, context || this)
    , evt = prefix ? prefix + event : event;

  if (!this._events) {
      this._events = prefix ? {} : Object.create(null);
  }
  if (!this._events[evt]) {
      this._events[evt] = listener;
  } else {
    if (!this._events[evt].fn) {
        this._events[evt].push(listener);
    } else {
        this._events[evt] = [
            this._events[evt], listener
        ];
    }
  }

  return this;
};

/**
 * Add an EventListener that's only called once.
 *
 * @param {String} event Name of the event.
 * @param {Function} fn Callback function.
 * @param {Mixed} [context=this] The context of the function.
 * @api public
 */
EventEmitter.prototype.once = function once(event, fn, context) {
  var listener = new EE(fn, context || this, true)
    , evt = prefix ? prefix + event : event;

  if (!this._events) {
      this._events = prefix ? {} : Object.create(null);
  }
  if (!this._events[evt]) {
      this._events[evt] = listener;
  } else {
    if (!this._events[evt].fn) {
        this._events[evt].push(listener);
    } else {
        this._events[evt] = [
            this._events[evt], listener
        ];
    }
  }

  return this;
};

/**
 * Remove event listeners.
 *
 * @param {String} event The event we want to remove.
 * @param {Function} fn The listener that we need to find.
 * @param {Mixed} context Only remove listeners matching this context.
 * @param {Boolean} once Only remove once listeners.
 * @api public
 */
EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
  var evt = prefix ? prefix + event : event;

  if (!this._events || !this._events[evt]) {
      return this;
  }

  var listeners = this._events[evt]
    , events = [];

  if (fn) {
    if (listeners.fn) {
      if (listeners.fn !== fn ||
        (once && !listeners.once) ||
        (context && listeners.context !== context)) {
        events.push(listeners);
      }
    } else {
      for (var i = 0, length = listeners.length; i < length; i++) {
        if (listeners[i].fn !== fn ||
            (once && !listeners[i].once) ||
            (context && listeners[i].context !== context)) {
            events.push(listeners[i]);
        }
      }
    }
  }

  //
  // Reset the array, or remove it completely if we have no more listeners.
  //
  if (events.length) {
    this._events[evt] = events.length === 1 ? events[0] : events;
  } else {
    delete this._events[evt];
  }

  return this;
};

/**
 * Remove all listeners or only the listeners for the specified event.
 *
 * @param {String} event The event want to remove all listeners for.
 * @api public
 */
EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
  if (!this._events) {
      return this;
  }

  if (event) {
      delete this._events[prefix ? prefix + event : event];
  }
  else {
      this._events = prefix ? {} : Object.create(null);
  }

  return this;
};

//
// Alias methods names because people roll like that.
//
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.addListener = EventEmitter.prototype.on;

//
// This function doesn't apply anymore.
//
EventEmitter.prototype.setMaxListeners = function setMaxListeners() {
  return this;
};

//
// Expose the prefix.
//
EventEmitter.prefixed = prefix;

//--------------------------------------------------
// Private helpers
//--------------------------------------------------

/**
 * Validate that first item is a string and all of the following items are functions
 * @param {string} name - Arguments that were passed into function
 * @param {Array} middlewareChain - middleware chain
 * @returns {void}
 */
function checkParams(name, middlewareChain) {
    if (typeof name !== 'string') {
        throw new Error('First argument should be a string');
    }

    if (!middlewareChain.every(function (item) { return typeof item === 'function'; })) {
        throw new Error('Middleware chain can only contain functions');
    }
}

var url = request.httpURL.relative().toString().split('?')[0];
var currentController = url.split('-').pop();
/**
 *  checks if the request matches the route the server need to serve
 *  Since commerce cloud builds out the server chain with each request
 *  we can keep it relevant to the current request
 *  @param {Object} name The name of the route
 *  @returns {string} skip if the route to check doesn't match the incoming request
 */
function checkRequest(name) {
    if (currentController !== name) {
        return false;
    }

    return true;
}

//--------------------------------------------------
// Public Interface
//--------------------------------------------------

/**
 * @constructor
 * @classdesc Server is a routing solution
 */
function Server() {
    this.routes = {};
}

Server.prototype = {
    middleware : middleware,
    /**
     * Creates a new route with a name and a list of middleware
     * @param {string} name - Name of the route
     * @param {Function[]} arguments - List of functions to be executed
     * @returns {void}
     */
    use: function use(name) {
        if (!checkRequest(name)) {
            return null;
        }

        var middlewareChain = arrayPrototype.slice.call(arguments, 1);
        checkParams(arguments[0], middlewareChain);
        
        var rq = new Request(request, customer, session);
        var rs = new Response(response);

        if (this.routes[name]) {
            throw new Error('Route with this name already exists');
        }

        var route = new Route(name, middlewareChain, rq, rs);
        var server = this;
        // Add event handler for rendering out view on completion of the request chain
        route.on('route:Complete', function onRouteCompleteHandler(req, res) {
            // compute cache value and set on response when we have a non-zero number

            if (res.redirectUrl) {
                // if there's a pending redirect, break the chain
                route.emit('route:Redirect', req, res);
                if (res.redirectStatus) {
                    res.base.redirect(res.redirectUrl, res.redirectStatus);
                } else {
                    res.base.redirect(res.redirectUrl);
                }
                return;
            }

            render.applyRenderings(res);
        });

        this.routes[name] = route;
        return route;
    },
    /**
     * Shortcut to "use" method that adds a check for get request
     * @param {string} name - Name of the route
     * @param {Function[]} arguments - List of functions to be executed
     * @returns {void}
     */
    get: function get(name) {
        var args = arrayPrototype.slice.call(arguments);
        args.splice(1, 0, middleware.get);
        
        return this.use.apply(this, args);
    },
    /**
     * Shortcut to "use" method that adds a check for post request
     * @param {string} name - Name of the route
     * @param {Function[]} arguments - List of functions to be executed
     * @returns {void}
     */
    post: function post() {
        var args = arrayPrototype.slice.call(arguments);
        args.splice(1, 0, middleware.post);
        return this.use.apply(this, args);
    },
    /**
     * Output an object with all of the registered routes
     * @returns {Object} Object with properties that match registered routes
     */
    exports: function exports() {
        var exportStatement = {};
        Object.keys(this.routes).forEach(function (key) {
            exportStatement[key] = this.routes[key].getRoute();
            exportStatement[key].public = true;
        }, this);
        if (!exportStatement.__routes) {
            exportStatement.__routes = this.routes;
        }
        return exportStatement;
    },
    /**
     * Extend existing server object with a list of registered routes
     * @param {Object} server - Object that corresponds to the output of "exports" function
     * @returns {void}
     */
    extend: function (server) {
        var newRoutes = {};

        Object.keys(server.__routes).forEach(function (key) {
            newRoutes[key] = server.__routes[key];
        });

        this.routes = newRoutes;
    },
    /**
     * Modify a given route by prepending additional middleware to it
     * @param {string} name - Name of the route to modify
     * @param {Function[]} arguments - List of functions to be prepended
     * @returns {void}
     */
    prepend: function prepend(name) {
        if (!checkRequest(name)) {
            return;
        }
        var middlewareChain = arrayPrototype.slice.call(arguments, 1);
        checkParams(arguments[0], middlewareChain);

        if (!this.routes[name]) {
            throw new Error('Route with this name does not exist');
        }

        this.routes[name].chain = middlewareChain.concat(this.routes[name].chain);
    }, /**
    * Modify a given route by appending additional middleware to it
    * @param {string} name - Name of the route to modify
    * @param {Function[]} arguments - List of functions to be appended
    * @returns {void}
    */
    append: function append(name) {
        if (!checkRequest(name)) {
            return;
        }
        var middlewareChain = arrayPrototype.slice.call(arguments, 1);
        checkParams(arguments[0], middlewareChain);

        if (!this.routes[name]) {
            throw new Error('Route with this name does not exist');
        }

        this.routes[name].chain = this.routes[name].chain.concat(middlewareChain);
    },

    /**
     * Replace a given route with the new one
     * @param {string} name - Name of the route to replace
     * @param {Function[]} arguments - List of functions for the route
     * @returns {void}
     */
    replace: function replace(name) {
        if (!checkRequest(name)) {
            return;
        }
        var middlewareChain = arrayPrototype.slice.call(arguments, 1);
        checkParams(arguments[0], middlewareChain);

        if (!this.routes[name]) {
            throw new Error('Route with this name does not exist');
        }

        delete this.routes[name];

        this.use.apply(this, arguments);
    },

    /**
     * Returns a given route from the server
     * @param {string} name - Name of the route
     * @returns {Object} Route that matches the name that was passed in
     */
    getRoute: function getRoute(name) {
        return this.routes[name];
    },

    applyCache: function applyCache(req, res) {
        if (res.cachePeriod) {
            var currentTime = new Date();
            if (res.cachePeriodUnit && res.cachePeriodUnit === 'minutes') {
                currentTime.setMinutes(currentTime.getMinutes() + res.cachePeriod);
            } else {
                // default to hours
                currentTime.setHours(currentTime.getHours() + res.cachePeriod);
            }
            res.base.setExpires(currentTime);
        }
        // add vary by
        if (res.personalized) {
            res.base.setVaryBy('price_promotion');
        }
    }
};

module.exports = new Server();
