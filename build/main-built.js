/**
 * @license text 2.0.16 Copyright jQuery Foundation and other contributors.
 * Released under MIT license, http://github.com/requirejs/text/LICENSE
 */
/*jslint regexp: true */
/*global require, XMLHttpRequest, ActiveXObject,
  define, window, process, Packages,
  java, location, Components, FileUtils */

define('text',['module'], function (module) {
    'use strict';

    var text, fs, Cc, Ci, xpcIsWindows,
        progIds = ['Msxml2.XMLHTTP', 'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.4.0'],
        xmlRegExp = /^\s*<\?xml(\s)+version=[\'\"](\d)*.(\d)*[\'\"](\s)*\?>/im,
        bodyRegExp = /<body[^>]*>\s*([\s\S]+)\s*<\/body>/im,
        hasLocation = typeof location !== 'undefined' && location.href,
        defaultProtocol = hasLocation && location.protocol && location.protocol.replace(/\:/, ''),
        defaultHostName = hasLocation && location.hostname,
        defaultPort = hasLocation && (location.port || undefined),
        buildMap = {},
        masterConfig = (module.config && module.config()) || {};

    function useDefault(value, defaultValue) {
        return value === undefined || value === '' ? defaultValue : value;
    }

    //Allow for default ports for http and https.
    function isSamePort(protocol1, port1, protocol2, port2) {
        if (port1 === port2) {
            return true;
        } else if (protocol1 === protocol2) {
            if (protocol1 === 'http') {
                return useDefault(port1, '80') === useDefault(port2, '80');
            } else if (protocol1 === 'https') {
                return useDefault(port1, '443') === useDefault(port2, '443');
            }
        }
        return false;
    }

    text = {
        version: '2.0.16',

        strip: function (content) {
            //Strips <?xml ...?> declarations so that external SVG and XML
            //documents can be added to a document without worry. Also, if the string
            //is an HTML document, only the part inside the body tag is returned.
            if (content) {
                content = content.replace(xmlRegExp, "");
                var matches = content.match(bodyRegExp);
                if (matches) {
                    content = matches[1];
                }
            } else {
                content = "";
            }
            return content;
        },

        jsEscape: function (content) {
            return content.replace(/(['\\])/g, '\\$1')
                .replace(/[\f]/g, "\\f")
                .replace(/[\b]/g, "\\b")
                .replace(/[\n]/g, "\\n")
                .replace(/[\t]/g, "\\t")
                .replace(/[\r]/g, "\\r")
                .replace(/[\u2028]/g, "\\u2028")
                .replace(/[\u2029]/g, "\\u2029");
        },

        createXhr: masterConfig.createXhr || function () {
            //Would love to dump the ActiveX crap in here. Need IE 6 to die first.
            var xhr, i, progId;
            if (typeof XMLHttpRequest !== "undefined") {
                return new XMLHttpRequest();
            } else if (typeof ActiveXObject !== "undefined") {
                for (i = 0; i < 3; i += 1) {
                    progId = progIds[i];
                    try {
                        xhr = new ActiveXObject(progId);
                    } catch (e) {}

                    if (xhr) {
                        progIds = [progId];  // so faster next time
                        break;
                    }
                }
            }

            return xhr;
        },

        /**
         * Parses a resource name into its component parts. Resource names
         * look like: module/name.ext!strip, where the !strip part is
         * optional.
         * @param {String} name the resource name
         * @returns {Object} with properties "moduleName", "ext" and "strip"
         * where strip is a boolean.
         */
        parseName: function (name) {
            var modName, ext, temp,
                strip = false,
                index = name.lastIndexOf("."),
                isRelative = name.indexOf('./') === 0 ||
                             name.indexOf('../') === 0;

            if (index !== -1 && (!isRelative || index > 1)) {
                modName = name.substring(0, index);
                ext = name.substring(index + 1);
            } else {
                modName = name;
            }

            temp = ext || modName;
            index = temp.indexOf("!");
            if (index !== -1) {
                //Pull off the strip arg.
                strip = temp.substring(index + 1) === "strip";
                temp = temp.substring(0, index);
                if (ext) {
                    ext = temp;
                } else {
                    modName = temp;
                }
            }

            return {
                moduleName: modName,
                ext: ext,
                strip: strip
            };
        },

        xdRegExp: /^((\w+)\:)?\/\/([^\/\\]+)/,

        /**
         * Is an URL on another domain. Only works for browser use, returns
         * false in non-browser environments. Only used to know if an
         * optimized .js version of a text resource should be loaded
         * instead.
         * @param {String} url
         * @returns Boolean
         */
        useXhr: function (url, protocol, hostname, port) {
            var uProtocol, uHostName, uPort,
                match = text.xdRegExp.exec(url);
            if (!match) {
                return true;
            }
            uProtocol = match[2];
            uHostName = match[3];

            uHostName = uHostName.split(':');
            uPort = uHostName[1];
            uHostName = uHostName[0];

            return (!uProtocol || uProtocol === protocol) &&
                   (!uHostName || uHostName.toLowerCase() === hostname.toLowerCase()) &&
                   ((!uPort && !uHostName) || isSamePort(uProtocol, uPort, protocol, port));
        },

        finishLoad: function (name, strip, content, onLoad) {
            content = strip ? text.strip(content) : content;
            if (masterConfig.isBuild) {
                buildMap[name] = content;
            }
            onLoad(content);
        },

        load: function (name, req, onLoad, config) {
            //Name has format: some.module.filext!strip
            //The strip part is optional.
            //if strip is present, then that means only get the string contents
            //inside a body tag in an HTML string. For XML/SVG content it means
            //removing the <?xml ...?> declarations so the content can be inserted
            //into the current doc without problems.

            // Do not bother with the work if a build and text will
            // not be inlined.
            if (config && config.isBuild && !config.inlineText) {
                onLoad();
                return;
            }

            masterConfig.isBuild = config && config.isBuild;

            var parsed = text.parseName(name),
                nonStripName = parsed.moduleName +
                    (parsed.ext ? '.' + parsed.ext : ''),
                url = req.toUrl(nonStripName),
                useXhr = (masterConfig.useXhr) ||
                         text.useXhr;

            // Do not load if it is an empty: url
            if (url.indexOf('empty:') === 0) {
                onLoad();
                return;
            }

            //Load the text. Use XHR if possible and in a browser.
            if (!hasLocation || useXhr(url, defaultProtocol, defaultHostName, defaultPort)) {
                text.get(url, function (content) {
                    text.finishLoad(name, parsed.strip, content, onLoad);
                }, function (err) {
                    if (onLoad.error) {
                        onLoad.error(err);
                    }
                });
            } else {
                //Need to fetch the resource across domains. Assume
                //the resource has been optimized into a JS module. Fetch
                //by the module name + extension, but do not include the
                //!strip part to avoid file system issues.
                req([nonStripName], function (content) {
                    text.finishLoad(parsed.moduleName + '.' + parsed.ext,
                                    parsed.strip, content, onLoad);
                }, function (err) {
                    if (onLoad.error) {
                        onLoad.error(err);
                    }
                });
            }
        },

        write: function (pluginName, moduleName, write, config) {
            if (buildMap.hasOwnProperty(moduleName)) {
                var content = text.jsEscape(buildMap[moduleName]);
                write.asModule(pluginName + "!" + moduleName,
                               "define(function () { return '" +
                                   content +
                               "';});\n");
            }
        },

        writeFile: function (pluginName, moduleName, req, write, config) {
            var parsed = text.parseName(moduleName),
                extPart = parsed.ext ? '.' + parsed.ext : '',
                nonStripName = parsed.moduleName + extPart,
                //Use a '.js' file name so that it indicates it is a
                //script that can be loaded across domains.
                fileName = req.toUrl(parsed.moduleName + extPart) + '.js';

            //Leverage own load() method to load plugin value, but only
            //write out values that do not have the strip argument,
            //to avoid any potential issues with ! in file names.
            text.load(nonStripName, req, function (value) {
                //Use own write() method to construct full module value.
                //But need to create shell that translates writeFile's
                //write() to the right interface.
                var textWrite = function (contents) {
                    return write(fileName, contents);
                };
                textWrite.asModule = function (moduleName, contents) {
                    return write.asModule(moduleName, fileName, contents);
                };

                text.write(pluginName, nonStripName, textWrite, config);
            }, config);
        }
    };

    if (masterConfig.env === 'node' || (!masterConfig.env &&
            typeof process !== "undefined" &&
            process.versions &&
            !!process.versions.node &&
            !process.versions['node-webkit'] &&
            !process.versions['atom-shell'])) {
        //Using special require.nodeRequire, something added by r.js.
        fs = require.nodeRequire('fs');

        text.get = function (url, callback, errback) {
            try {
                var file = fs.readFileSync(url, 'utf8');
                //Remove BOM (Byte Mark Order) from utf8 files if it is there.
                if (file[0] === '\uFEFF') {
                    file = file.substring(1);
                }
                callback(file);
            } catch (e) {
                if (errback) {
                    errback(e);
                }
            }
        };
    } else if (masterConfig.env === 'xhr' || (!masterConfig.env &&
            text.createXhr())) {
        text.get = function (url, callback, errback, headers) {
            var xhr = text.createXhr(), header;
            xhr.open('GET', url, true);

            //Allow plugins direct access to xhr headers
            if (headers) {
                for (header in headers) {
                    if (headers.hasOwnProperty(header)) {
                        xhr.setRequestHeader(header.toLowerCase(), headers[header]);
                    }
                }
            }

            //Allow overrides specified in config
            if (masterConfig.onXhr) {
                masterConfig.onXhr(xhr, url);
            }

            xhr.onreadystatechange = function (evt) {
                var status, err;
                //Do not explicitly handle errors, those should be
                //visible via console output in the browser.
                if (xhr.readyState === 4) {
                    status = xhr.status || 0;
                    if (status > 399 && status < 600) {
                        //An http 4xx or 5xx error. Signal an error.
                        err = new Error(url + ' HTTP status: ' + status);
                        err.xhr = xhr;
                        if (errback) {
                            errback(err);
                        }
                    } else {
                        callback(xhr.responseText);
                    }

                    if (masterConfig.onXhrComplete) {
                        masterConfig.onXhrComplete(xhr, url);
                    }
                }
            };
            xhr.send(null);
        };
    } else if (masterConfig.env === 'rhino' || (!masterConfig.env &&
            typeof Packages !== 'undefined' && typeof java !== 'undefined')) {
        //Why Java, why is this so awkward?
        text.get = function (url, callback) {
            var stringBuffer, line,
                encoding = "utf-8",
                file = new java.io.File(url),
                lineSeparator = java.lang.System.getProperty("line.separator"),
                input = new java.io.BufferedReader(new java.io.InputStreamReader(new java.io.FileInputStream(file), encoding)),
                content = '';
            try {
                stringBuffer = new java.lang.StringBuffer();
                line = input.readLine();

                // Byte Order Mark (BOM) - The Unicode Standard, version 3.0, page 324
                // http://www.unicode.org/faq/utf_bom.html

                // Note that when we use utf-8, the BOM should appear as "EF BB BF", but it doesn't due to this bug in the JDK:
                // http://bugs.sun.com/bugdatabase/view_bug.do?bug_id=4508058
                if (line && line.length() && line.charAt(0) === 0xfeff) {
                    // Eat the BOM, since we've already found the encoding on this file,
                    // and we plan to concatenating this buffer with others; the BOM should
                    // only appear at the top of a file.
                    line = line.substring(1);
                }

                if (line !== null) {
                    stringBuffer.append(line);
                }

                while ((line = input.readLine()) !== null) {
                    stringBuffer.append(lineSeparator);
                    stringBuffer.append(line);
                }
                //Make sure we return a JavaScript string and not a Java string.
                content = String(stringBuffer.toString()); //String
            } finally {
                input.close();
            }
            callback(content);
        };
    } else if (masterConfig.env === 'xpconnect' || (!masterConfig.env &&
            typeof Components !== 'undefined' && Components.classes &&
            Components.interfaces)) {
        //Avert your gaze!
        Cc = Components.classes;
        Ci = Components.interfaces;
        Components.utils['import']('resource://gre/modules/FileUtils.jsm');
        xpcIsWindows = ('@mozilla.org/windows-registry-key;1' in Cc);

        text.get = function (url, callback) {
            var inStream, convertStream, fileObj,
                readData = {};

            if (xpcIsWindows) {
                url = url.replace(/\//g, '\\');
            }

            fileObj = new FileUtils.File(url);

            //XPCOM, you so crazy
            try {
                inStream = Cc['@mozilla.org/network/file-input-stream;1']
                           .createInstance(Ci.nsIFileInputStream);
                inStream.init(fileObj, 1, 0, false);

                convertStream = Cc['@mozilla.org/intl/converter-input-stream;1']
                                .createInstance(Ci.nsIConverterInputStream);
                convertStream.init(inStream, "utf-8", inStream.available(),
                Ci.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER);

                convertStream.readString(inStream.available(), readData);
                convertStream.close();
                inStream.close();
                callback(readData.value);
            } catch (e) {
                throw new Error((fileObj && fileObj.path || '') + ': ' + e);
            }
        };
    }
    return text;
});


define('text!templates/coffee-order.html',[],function () { return '<li class="media my-2 coffee-order" data-orderId="{{id}}">\n  <!-- <i\n    class="fa fa-coffee fa-4x mr-3"\n    aria-hidden="true"\n    style="color : {{iconColor}}"\n  ></i> -->\n  <img\n    src="{{image}}"\n    class="rounded mr-3"\n    alt="coffee"\n    width="70rem"\n    height="70rem"\n  />\n  <div class="media-body">\n    <h5 class="mt-0 mb-1 text-primary">{{coffeeName}}</h5>\n    <div class="d-flex justify-content-between">\n      <span>\n        <span class="font-weight-bold">Order By :</span> {{personName}}\n      </span>\n      <span>\n        <span class="font-weight-bold">Time :</span> {{submittedAt}}\n      </span>\n    </div>\n    <div class="progress">\n      <div\n        class="progress-bar progress-bar-striped progress-bar-animated"\n        role="progressbar"\n        aria-valuenow="0"\n        aria-valuemin="0"\n        aria-valuemax="100"\n        style="width: 0%;"\n      ></div>\n    </div>\n  </div>\n  <button type="button" class="close remove-coffee" aria-label="Close">\n    <span aria-hidden="true">&times;</span>\n  </button>\n</li>\n';});

define('app/constants',{
  coffee: {
    latte: 'Latte',
    expresso: 'Expresso',
    mocha: 'Mocha',
    black: 'Black',
  },
  events: {
    coffee: {
      new: 'new-coffee',
      completed: 'coffee-completed',
      cancel: 'coffee-cancel',
    },
  },
});

define('app/coffee',[
  'jquery',
  'mustache',
  'text!templates/coffee-order.html',
  'app/constants',
  'bootstrap',
], function ($, mustache, template, constants) {
  let $coffeeList = $('#coffee-list');
  let $placeholder = $('.placeholder-empty-orders');
  let maxProgressJump = 50;
  let timers = [];
  let onCoffeeAddedCallback = null;
  let onCoffeeCompletedCallback = null;
  let onCoffeeCancelCallback = null;

  $coffeeList.delegate('.remove-coffee', 'click', handleRemoveCoffee);

  function handleAddCoffee(coffee) {
    $coffeeList.append(mustache.render(template, coffee));

    let $order = $coffeeList.find('.coffee-order').last();

    let timer = setInterval(function () {
      incrementCoffeeProgress($order, coffee);
    }, Math.floor(Math.random() * 5000 + 1000));

    timers.push({ for: coffee.id, timer });

    if (onCoffeeAddedCallback) {
      onCoffeeAddedCallback(coffee.id);
    }

    checkEmptyOrders();
  }

  function incrementCoffeeProgress($order, coffee) {
    let $progressBar = $order.find('.progress-bar');
    let currentValue = parseInt($progressBar.attr('aria-valuenow'));
    let increase = Math.floor(Math.random() * maxProgressJump);
    let newValue = currentValue + increase;
    let stopTimer = false;
    if (newValue >= 100) {
      newValue = 100;
      stopTimer = true;
    }
    $progressBar.css({ width: `+=${newValue}%` });
    $progressBar.attr('aria-valuenow', newValue);
    if (stopTimer) {
      // let animation finish, $.animate(cb) still won't work
      setTimeout(function () {
        $order.find('.remove-coffee').trigger('click');
        if (onCoffeeCompletedCallback) onCoffeeCompletedCallback(coffee.id);
      }, 500);
    }
  }

  function removeTimer(id) {
    let record = timers.find((t) => t.for === id);
    clearInterval(record.timer);
    timers = timers.filter((t) => t.for !== id);
  }

  function handleRemoveCoffee() {
    let $order = $(this).closest('.coffee-order');
    removeTimer($order.attr('data-orderId'));
    $order.slideUp('fast', function () {
      $(this).remove();
      if (onCoffeeCancelCallback) {
        let id = $order.attr('data-orderId');
        onCoffeeCancelCallback(id);
      }
      checkEmptyOrders();
    });
  }

  function checkEmptyOrders() {
    $coffeeList.find('li').length < 1
      ? $placeholder.show(500)
      : $placeholder.hide(500);
  }

  function on(eventType, fn) {
    let event = constants.events.coffee;
    switch (eventType) {
      case event.new:
        onCoffeeAddedCallback = fn;
        return true;
      case event.completed:
        onCoffeeCompletedCallback = fn;
        return true;
      case event.cancel:
        onCoffeeCancelCallback = fn;
        return true;
      default:
        return false;
    }
  }

  return { handleAddCoffee, on };
});

define('app/chooseCoffee',['jquery', 'moment', 'app/constants'], function ($, moment, constants) {
  let $modal = $('#chooseCoffeeModal');
  let $form = $modal.find('form');

  let $orderBy = $form.find('#inputOrderBy');
  let $selectCoffee = $form.find('#selectCoffeeDrink');
  let defaultCoffee = $form.find('option:first').val();

  let onCoffeeChosenCallback = function () {
    console.error('handleAddCoffee not registered yet');
  };

  $form.submit(function (e) {
    e.preventDefault();
    let order = {
      id: `${Date.now()}`,
      personName: $orderBy.val() || 'Guest',
      coffeeName: $selectCoffee.val(),
      submittedAt: moment().format('h:mma'),
      image: getImageByCoffee($selectCoffee.val()),
    };
    $modal.modal('hide');
    onCoffeeChosenCallback(order);
  });

  $modal.find('.add-coffee').click(function () {
    $form.trigger('submit');
  });

  $modal.on('hidden.bs.modal', function () {
    $orderBy.val('');
    $selectCoffee.val(defaultCoffee);
  });

  function onCoffeeChosen(callback) {
    onCoffeeChosenCallback = callback;
  }

  function getImageByCoffee(coffeeName) {
    switch (coffeeName) {
      case constants.coffee.latte:
        return 'img/latte.jpg';
      case constants.coffee.expresso:
        return 'img/expresso.jpg';
      case constants.coffee.black:
        return 'img/black.jpg';
      case constants.coffee.mocha:
        return 'img/mocha.jpg';
      default:
        return null;
    }
  }

  return {
    onCoffeeChosen,
  };
});


define('text!templates/coffee-toast.html',[],function () { return '<div\n  class="toast"\n  style="width: 15rem; white-space: nowrap;"\n  role="alert"\n  aria-live="assertive"\n  aria-atomic="true"\n>\n  <div class="toast-header">\n    <i class="fa fa-coffee mr-3" aria-hidden="true"></i>\n    <strong class="mr-auto">{{title}}</strong>\n    <small>{{ago}}</small>\n    <button\n      type="button"\n      class="ml-2 mb-1 close-toast close"\n      aria-label="Close"\n      aria-label="Close"\n    >\n      <span aria-hidden="true">&times;</span>\n    </button>\n  </div>\n  <div class="toast-body">\n    {{message}}\n  </div>\n</div>\n';});

define('app/notification',[
  'jquery',
  'mustache',
  'text!templates/coffee-toast.html',
  'jqueryui',
], function ($, mustache, view) {
  const $toastContainer = $('#toast-container');
  $toastContainer.delegate('.close-toast', 'click', function () {
    removeToast($(this));
  });
  const options = {
    autohide: false,
    animation: false,
  };
  const delay = 5000;

  function showToast(data, toastOptions = {}) {
    let html = mustache.render(view, data);
    $toastContainer.append(html);
    let $toast = $toastContainer.find('.toast').last();

    if (toastOptions.theme)
      $toast.find('.toast-header').addClass(toastOptions.theme);
    if (toastOptions.textColor) {
      $toast.find('.toast-header').addClass(toastOptions.textColor);
      $toast.find('.close-toast').addClass(toastOptions.textColor);
    }
    $toast.toast(options);
    // $toast.hide(); // overrides bs toast default behaviour
    $toast.toast('show');
    $toast.css('width', '0px');
    $toast.animate({ width: '15rem' }, 500);
    setTimeout(function () {
      removeToast($toast);
    }, delay);
  }

  function removeToast($toast = null) {
    let $target = $(this);
    if ($toast) {
      $target = $toast;
    }

    $target.closest('.toast').slideUp('slow', function () {
      $(this).remove();
    });
  }

  return { showToast };
});

define('app/coffeeNotification',['app/notification', 'app/constants'], function (
  notification,
  constants
) {
  function notify(eventType, coffee) {
    let event = constants.events.coffee;
    switch (eventType) {
      case event.new:
        notifyNewOrder(coffee);
        return true;
      case event.completed:
        notifyOrderCompleted(coffee);
        return true;
      case event.cancel:
        notifyOrderCancelled(coffee);
      default:
        return false;
    }
  }

  function notifyNewOrder(coffee) {
    let data = {
      title: 'New Order',
      ago: 'just now',
      message: `${coffee.personName} ordered a ${coffee.coffeeName}.`,
    };
    let options = {
      theme: 'bg-primary',
      textColor: 'text-white',
    };
    notification.showToast(data, options);
  }

  function notifyOrderCompleted(coffee) {
    let data = {
      title: 'Completed',
      ago: 'just now',
      message: `${coffee.coffeeName} is done!`,
    };
    let options = {
      theme: 'bg-success',
      textColor: 'text-white',
    };
    notification.showToast(data, options);
  }

  function notifyOrderCancelled(coffee) {
    let data = {
      title: 'Cancelled',
      ago: 'just now',
      message: `Order for ${coffee.personName} was cancelled`,
    };
    let options = {
      theme: 'bg-danger',
      textColor: 'text-white',
    };
    notification.showToast(data, options);
  }

  return { notify };
});

define('app/coffeeStore',[], function () {
  let coffees = {};

  function add(coffee) {
    if (coffee.hasOwnProperty('id')) coffees[coffee.id] = coffee;
  }

  function pop(id) {
    if (exist(id)) {
      // shallow copy object
      let coffee = {};
      Object.assign(coffee, coffees[id]);
      remove(id);
      return coffee;
    } else return null;
  }

  function remove(id) {
    delete coffees[id];
  }

  function find(id) {
    if (exist(id)) {
      return coffees[id];
    } else return null;
  }

  function exist(id) {
    return coffees.hasOwnProperty(id);
  }

  return { add, remove, pop, find };
});

define('app/app',[
  'jquery',
  'app/coffee',
  'app/chooseCoffee',
  'app/coffeeNotification',
  'app/constants',
  'app/coffeeStore',
], function ($, coffee, coffeeModal, coffeeNotification, constants, store) {
  function start() {
    $(document).ready(setupActions);
  }

  function setupActions() {
    coffeeModal.onCoffeeChosen(function (order) {
      store.add(order);
      coffee.handleAddCoffee(order);
    });

    let coffeeEvents = constants.events.coffee;
    let handleEvents = [
      coffeeEvents.new,
      coffeeEvents.completed,
      coffeeEvents.cancel,
    ];
    handleEvents.forEach(function (e) {
      coffee.on(e, function (id) {
        let coffee = null;
        if (e !== coffeeEvents.new) {
          coffee = store.pop(id);
        } else {
          coffee = store.find(id);
        }
        if (coffee) coffeeNotification.notify(e, coffee);
      });
    });
  }
  return { start };
});

requirejs.config({
  paths: {
    app: 'app',
    jquery: 'https://code.jquery.com/jquery-3.5.1.min',
    jqueryui: 'https://code.jquery.com/ui/1.12.1/jquery-ui.min',
    popper: 'https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min',
    bootstrap:
      'https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/js/bootstrap.min',
    mustache:
      'https://cdnjs.cloudflare.com/ajax/libs/mustache.js/4.0.1/mustache.min',
    moment:
      'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.19.1/moment.min',
  },
  shim: {
    bootstrap: ['jquery'],
    // jqueryui: ['jquery'],
  },
  map: {
    '*': {
      'popper.js': 'popper',
    },
  },
});

requirejs(['app/app'], function (app) {
  app.start();
});

define("main", function(){});

