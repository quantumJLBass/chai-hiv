(function($) {
$(document).ready(function() {
	function setup_tabs(){
		var tabContents = $(".tab_content").hide(), 
			tabs = $("ul.tabs li");
		tabs.addClass("tabed");
		tabs.first().addClass("active").show();
		tabContents.first().show();
		
		tabs.on("click",function(e) {
			e.preventDefault();
			e.stopPropagation();
			var $this = $(this), 
				activeTab = $this.find('a').attr('href');
			
			if(!$this.hasClass('active')){
				$this.addClass('active').siblings().removeClass('active');
				tabContents.hide().filter(activeTab).fadeIn();
			}
			return false;
		});	
		if($( ".uitabs" ).length>0){
			var uitabs = $( ".uitabs" ).tabs();
		}
		
	};


// Slider  	
	if (jQuery().flexslider) {
	   $('.flexslider').flexslider({
			smoothHeight: true, 
			controlNav: false,           
			directionNav: true,  
			prevText: "&larr;",
			nextText: "&rarr;",
			selector: ".slides > .slide"
		});
	};
	
		
		
	// Smooth scrolling - css-tricks.com
	function filterPath(string){return string.replace(/^\//,'').replace(/(index|default).[a-zA-Z]{3,4}$/,'').replace(/\/$/,'');}var locationPath=filterPath(location.pathname);var scrollElem=scrollableElement('html','body');$('a[href*=#nav]').each(function(){var thisPath=filterPath(this.pathname)||locationPath;if(locationPath==thisPath&&(location.hostname==this.hostname||!this.hostname)&&this.hash.replace(/#/,'')){var $target=$(this.hash),target=this.hash;if(target){var targetOffset=$target.offset().top;$(this).click(function(event){event.preventDefault();$(scrollElem).animate({scrollTop:targetOffset},'slow',function(){location.hash=target;});});}}});function scrollableElement(els){for(var i=0,argLength=arguments.length;i<argLength;i++){var el=arguments[i],$scrollElement=$(el);if($scrollElement.scrollTop()>0){return el;}else{$scrollElement.scrollTop(1);var isScrollable=$scrollElement.scrollTop()>0;$scrollElement.scrollTop(0);if(isScrollable){return el;}}}return[];}
	
	
	
	// TOGGLES
	$('.toggle-view li').click(function () {
		var text = $(this).children('.toggle');
		
		if (text.is(':hidden')) {
			text.slideDown('fast');
			$(this).children('.toggle-title').addClass('tactive');      
		} else {
			text.slideUp('fast');
			$(this).children('.toggle-title').removeClass('tactive');       
		}       
	});
		
		
			
	//TABS
	setup_tabs();	

	});
})(jQuery);
/*
	Masked Input plugin for jQuery
	Copyright (c) 2007-2010 Josh Bush (digitalbush.com)
	Licensed under the MIT license (http://digitalbush.com/projects/masked-input-plugin/#license) 
	Version: 1.2.3
*/
(function($) {
	var pasteEventName = ($.browser.msie ? 'paste' : 'input') + ".mask";
	var iPhone = (window.orientation != undefined);

	$.mask = {
		//Predefined character definitions
		definitions: {
			'9': "[0-9]",
			'a': "[A-Za-z]",
			'*': "[A-Za-z0-9]"
		},
		dataName:"rawMaskFn"
	};

	$.fn.extend({
		//Helper Function for Caret positioning
		caret: function(begin, end) {
			if (this.length == 0) return;
			if (typeof begin == 'number') {
				end = (typeof end == 'number') ? end : begin;
				return this.each(function() {
					if (this.setSelectionRange) {
						this.setSelectionRange(begin, end);
					} else if (this.createTextRange) {
						var range = this.createTextRange();
						range.collapse(true);
						range.moveEnd('character', end);
						range.moveStart('character', begin);
						range.select();
					}
				});
			} else {
				if (this[0].setSelectionRange) {
					begin = this[0].selectionStart;
					end = this[0].selectionEnd;
				} else if (document.selection && document.selection.createRange) {
					var range = document.selection.createRange();
					begin = 0 - range.duplicate().moveStart('character', -100000);
					end = begin + range.text.length;
				}
				return { begin: begin, end: end };
			}
		},
		unmask: function() { return this.trigger("unmask"); },
		mask: function(mask, settings) {
			if (!mask && this.length > 0) {
				var input = $(this[0]);
				return input.data($.mask.dataName)();
			}
			settings = $.extend({
				placeholder: "_",
				completed: null
			}, settings);

			var defs = $.mask.definitions;
			var tests = [];
			var partialPosition = mask.length;
			var firstNonMaskPos = null;
			var len = mask.length;

			$.each(mask.split(""), function(i, c) {
				if (c == '?') {
					len--;
					partialPosition = i;
				} else if (defs[c]) {
					tests.push(new RegExp(defs[c]));
					if(firstNonMaskPos==null)
						firstNonMaskPos =  tests.length - 1;
				} else {
					tests.push(null);
				}
			});

			return this.trigger("unmask").each(function() {
				var input = $(this);
				var buffer = $.map(mask.split(""), function(c, i) { if (c != '?') return defs[c] ? settings.placeholder : c });
				var focusText = input.val();

				function seekNext(pos) {
					while (++pos <= len && !tests[pos]);
					return pos;
				};
				function seekPrev(pos) {
					while (--pos >= 0 && !tests[pos]);
					return pos;
				};

				function shiftL(begin,end) {
					if(begin<0)
					   return;
					for (var i = begin,j = seekNext(end); i < len; i++) {
						if (tests[i]) {
							if (j < len && tests[i].test(buffer[j])) {
								buffer[i] = buffer[j];
								buffer[j] = settings.placeholder;
							} else
								break;
							j = seekNext(j);
						}
					}
					writeBuffer();
					input.caret(Math.max(firstNonMaskPos, begin));
				};

				function shiftR(pos) {
					for (var i = pos, c = settings.placeholder; i < len; i++) {
						if (tests[i]) {
							var j = seekNext(i);
							var t = buffer[i];
							buffer[i] = c;
							if (j < len && tests[j].test(t))
								c = t;
							else
								break;
						}
					}
				};

				function keydownEvent(e) {
					var k=e.which;

					//backspace, delete, and escape get special treatment
					if(k == 8 || k == 46 || (iPhone && k == 127)){
						var pos = input.caret(),
							begin = pos.begin,
							end = pos.end;
						
						if(end-begin==0){
							begin=k!=46?seekPrev(begin):(end=seekNext(begin-1));
							end=k==46?seekNext(end):end;
						}
						clearBuffer(begin, end);
						shiftL(begin,end-1);

						return false;
					} else if (k == 27) {//escape
						input.val(focusText);
						input.caret(0, checkVal());
						return false;
					}
				};

				function keypressEvent(e) {
					var k = e.which,
						pos = input.caret();
					if (e.ctrlKey || e.altKey || e.metaKey || k<32) {//Ignore
						return true;
					} else if (k) {
						if(pos.end-pos.begin!=0){
							clearBuffer(pos.begin, pos.end);
							shiftL(pos.begin, pos.end-1);
						}

						var p = seekNext(pos.begin - 1);
						if (p < len) {
							var c = String.fromCharCode(k);
							if (tests[p].test(c)) {
								shiftR(p);
								buffer[p] = c;
								writeBuffer();
								var next = seekNext(p);
								input.caret(next);
								if (settings.completed && next >= len)
									settings.completed.call(input);
							}
						}
						return false;
					}
				};

				function clearBuffer(start, end) {
					for (var i = start; i < end && i < len; i++) {
						if (tests[i])
							buffer[i] = settings.placeholder;
					}
				};

				function writeBuffer() { return input.val(buffer.join('')).val(); };

				function checkVal(allow) {
					//try to place characters where they belong
					var test = input.val();
					var lastMatch = -1;
					for (var i = 0, pos = 0; i < len; i++) {
						if (tests[i]) {
							buffer[i] = settings.placeholder;
							while (pos++ < test.length) {
								var c = test.charAt(pos - 1);
								if (tests[i].test(c)) {
									buffer[i] = c;
									lastMatch = i;
									break;
								}
							}
							if (pos > test.length)
								break;
						} else if (buffer[i] == test.charAt(pos) && i!=partialPosition) {
							pos++;
							lastMatch = i;
						}
					}
					if (!allow && lastMatch + 1 < partialPosition) {
						input.val("");
						clearBuffer(0, len);
					} else if (allow || lastMatch + 1 >= partialPosition) {
						writeBuffer();
						if (!allow) input.val(input.val().substring(0, lastMatch + 1));
					}
					return (partialPosition ? i : firstNonMaskPos);
				};

				input.data($.mask.dataName,function(){
					return $.map(buffer, function(c, i) {
						return tests[i]&&c!=settings.placeholder ? c : null;
					}).join('');
				})

				if (!input.attr("readonly"))
					input
					.one("unmask", function() {
						input
							.unbind(".mask")
							.removeData($.mask.dataName);
					})
					.bind("focus.mask", function() {
						focusText = input.val();
						var pos = checkVal();
						writeBuffer();
						var moveCaret=function(){
							if (pos == mask.length)
								input.caret(0, pos);
							else
								input.caret(pos);
						};
						($.browser.msie ? moveCaret:function(){setTimeout(moveCaret,0)})();
					})
					.bind("blur.mask", function() {
						checkVal();
						if (input.val() != focusText)
							input.change();
					})
					.bind("keydown.mask", keydownEvent)
					.bind("keypress.mask", keypressEvent)
					.bind(pasteEventName, function() {
						setTimeout(function() { input.caret(checkVal(true)); }, 0);
					});

				checkVal(); //Perform initial check for existing values
			});
		}
	});
})(jQuery);
/*!
 * ZeroClipboard
 * The ZeroClipboard library provides an easy way to copy text to the clipboard using an invisible Adobe Flash movie and a JavaScript interface.
 * Copyright (c) 2014 Jon Rohan, James M. Greene
 * Licensed MIT
 * http://zeroclipboard.org/
 * v2.1.6
 */
(function(window, undefined) {
  "use strict";
  /**
 * Store references to critically important global functions that may be
 * overridden on certain web pages.
 */
  var _window = window, _document = _window.document, _navigator = _window.navigator, _setTimeout = _window.setTimeout, _encodeURIComponent = _window.encodeURIComponent, _ActiveXObject = _window.ActiveXObject, _Error = _window.Error, _parseInt = _window.Number.parseInt || _window.parseInt, _parseFloat = _window.Number.parseFloat || _window.parseFloat, _isNaN = _window.Number.isNaN || _window.isNaN, _round = _window.Math.round, _now = _window.Date.now, _keys = _window.Object.keys, _defineProperty = _window.Object.defineProperty, _hasOwn = _window.Object.prototype.hasOwnProperty, _slice = _window.Array.prototype.slice, _unwrap = function() {
    var unwrapper = function(el) {
      return el;
    };
    if (typeof _window.wrap === "function" && typeof _window.unwrap === "function") {
      try {
        var div = _document.createElement("div");
        var unwrappedDiv = _window.unwrap(div);
        if (div.nodeType === 1 && unwrappedDiv && unwrappedDiv.nodeType === 1) {
          unwrapper = _window.unwrap;
        }
      } catch (e) {}
    }
    return unwrapper;
  }();
  /**
 * Convert an `arguments` object into an Array.
 *
 * @returns The arguments as an Array
 * @private
 */
  var _args = function(argumentsObj) {
    return _slice.call(argumentsObj, 0);
  };
  /**
 * Shallow-copy the owned, enumerable properties of one object over to another, similar to jQuery's `$.extend`.
 *
 * @returns The target object, augmented
 * @private
 */
  var _extend = function() {
    var i, len, arg, prop, src, copy, args = _args(arguments), target = args[0] || {};
    for (i = 1, len = args.length; i < len; i++) {
      if ((arg = args[i]) != null) {
        for (prop in arg) {
          if (_hasOwn.call(arg, prop)) {
            src = target[prop];
            copy = arg[prop];
            if (target !== copy && copy !== undefined) {
              target[prop] = copy;
            }
          }
        }
      }
    }
    return target;
  };
  /**
 * Return a deep copy of the source object or array.
 *
 * @returns Object or Array
 * @private
 */
  var _deepCopy = function(source) {
    var copy, i, len, prop;
    if (typeof source !== "object" || source == null) {
      copy = source;
    } else if (typeof source.length === "number") {
      copy = [];
      for (i = 0, len = source.length; i < len; i++) {
        if (_hasOwn.call(source, i)) {
          copy[i] = _deepCopy(source[i]);
        }
      }
    } else {
      copy = {};
      for (prop in source) {
        if (_hasOwn.call(source, prop)) {
          copy[prop] = _deepCopy(source[prop]);
        }
      }
    }
    return copy;
  };
  /**
 * Makes a shallow copy of `obj` (like `_extend`) but filters its properties based on a list of `keys` to keep.
 * The inverse of `_omit`, mostly. The big difference is that these properties do NOT need to be enumerable to
 * be kept.
 *
 * @returns A new filtered object.
 * @private
 */
  var _pick = function(obj, keys) {
    var newObj = {};
    for (var i = 0, len = keys.length; i < len; i++) {
      if (keys[i] in obj) {
        newObj[keys[i]] = obj[keys[i]];
      }
    }
    return newObj;
  };
  /**
 * Makes a shallow copy of `obj` (like `_extend`) but filters its properties based on a list of `keys` to omit.
 * The inverse of `_pick`.
 *
 * @returns A new filtered object.
 * @private
 */
  var _omit = function(obj, keys) {
    var newObj = {};
    for (var prop in obj) {
      if (keys.indexOf(prop) === -1) {
        newObj[prop] = obj[prop];
      }
    }
    return newObj;
  };
  /**
 * Remove all owned, enumerable properties from an object.
 *
 * @returns The original object without its owned, enumerable properties.
 * @private
 */
  var _deleteOwnProperties = function(obj) {
    if (obj) {
      for (var prop in obj) {
        if (_hasOwn.call(obj, prop)) {
          delete obj[prop];
        }
      }
    }
    return obj;
  };
  /**
 * Determine if an element is contained within another element.
 *
 * @returns Boolean
 * @private
 */
  var _containedBy = function(el, ancestorEl) {
    if (el && el.nodeType === 1 && el.ownerDocument && ancestorEl && (ancestorEl.nodeType === 1 && ancestorEl.ownerDocument && ancestorEl.ownerDocument === el.ownerDocument || ancestorEl.nodeType === 9 && !ancestorEl.ownerDocument && ancestorEl === el.ownerDocument)) {
      do {
        if (el === ancestorEl) {
          return true;
        }
        el = el.parentNode;
      } while (el);
    }
    return false;
  };
  /**
 * Get the URL path's parent directory.
 *
 * @returns String or `undefined`
 * @private
 */
  var _getDirPathOfUrl = function(url) {
    var dir;
    if (typeof url === "string" && url) {
      dir = url.split("#")[0].split("?")[0];
      dir = url.slice(0, url.lastIndexOf("/") + 1);
    }
    return dir;
  };
  /**
 * Get the current script's URL by throwing an `Error` and analyzing it.
 *
 * @returns String or `undefined`
 * @private
 */
  var _getCurrentScriptUrlFromErrorStack = function(stack) {
    var url, matches;
    if (typeof stack === "string" && stack) {
      matches = stack.match(/^(?:|[^:@]*@|.+\)@(?=http[s]?|file)|.+?\s+(?: at |@)(?:[^:\(]+ )*[\(]?)((?:http[s]?|file):\/\/[\/]?.+?\/[^:\)]*?)(?::\d+)(?::\d+)?/);
      if (matches && matches[1]) {
        url = matches[1];
      } else {
        matches = stack.match(/\)@((?:http[s]?|file):\/\/[\/]?.+?\/[^:\)]*?)(?::\d+)(?::\d+)?/);
        if (matches && matches[1]) {
          url = matches[1];
        }
      }
    }
    return url;
  };
  /**
 * Get the current script's URL by throwing an `Error` and analyzing it.
 *
 * @returns String or `undefined`
 * @private
 */
  var _getCurrentScriptUrlFromError = function() {
    var url, err;
    try {
      throw new _Error();
    } catch (e) {
      err = e;
    }
    if (err) {
      url = err.sourceURL || err.fileName || _getCurrentScriptUrlFromErrorStack(err.stack);
    }
    return url;
  };
  /**
 * Get the current script's URL.
 *
 * @returns String or `undefined`
 * @private
 */
  var _getCurrentScriptUrl = function() {
    var jsPath, scripts, i;
    if (_document.currentScript && (jsPath = _document.currentScript.src)) {
      return jsPath;
    }
    scripts = _document.getElementsByTagName("script");
    if (scripts.length === 1) {
      return scripts[0].src || undefined;
    }
    if ("readyState" in scripts[0]) {
      for (i = scripts.length; i--; ) {
        if (scripts[i].readyState === "interactive" && (jsPath = scripts[i].src)) {
          return jsPath;
        }
      }
    }
    if (_document.readyState === "loading" && (jsPath = scripts[scripts.length - 1].src)) {
      return jsPath;
    }
    if (jsPath = _getCurrentScriptUrlFromError()) {
      return jsPath;
    }
    return undefined;
  };
  /**
 * Get the unanimous parent directory of ALL script tags.
 * If any script tags are either (a) inline or (b) from differing parent
 * directories, this method must return `undefined`.
 *
 * @returns String or `undefined`
 * @private
 */
  var _getUnanimousScriptParentDir = function() {
    var i, jsDir, jsPath, scripts = _document.getElementsByTagName("script");
    for (i = scripts.length; i--; ) {
      if (!(jsPath = scripts[i].src)) {
        jsDir = null;
        break;
      }
      jsPath = _getDirPathOfUrl(jsPath);
      if (jsDir == null) {
        jsDir = jsPath;
      } else if (jsDir !== jsPath) {
        jsDir = null;
        break;
      }
    }
    return jsDir || undefined;
  };
  /**
 * Get the presumed location of the "ZeroClipboard.swf" file, based on the location
 * of the executing JavaScript file (e.g. "ZeroClipboard.js", etc.).
 *
 * @returns String
 * @private
 */
  var _getDefaultSwfPath = function() {
    var jsDir = _getDirPathOfUrl(_getCurrentScriptUrl()) || _getUnanimousScriptParentDir() || "";
    return jsDir + "ZeroClipboard.swf";
  };
  /**
 * Keep track of the state of the Flash object.
 * @private
 */
  var _flashState = {
    bridge: null,
    version: "0.0.0",
    pluginType: "unknown",
    disabled: null,
    outdated: null,
    unavailable: null,
    deactivated: null,
    overdue: null,
    ready: null
  };
  /**
 * The minimum Flash Player version required to use ZeroClipboard completely.
 * @readonly
 * @private
 */
  var _minimumFlashVersion = "11.0.0";
  /**
 * Keep track of all event listener registrations.
 * @private
 */
  var _handlers = {};
  /**
 * Keep track of the currently activated element.
 * @private
 */
  var _currentElement;
  /**
 * Keep track of the element that was activated when a `copy` process started.
 * @private
 */
  var _copyTarget;
  /**
 * Keep track of data for the pending clipboard transaction.
 * @private
 */
  var _clipData = {};
  /**
 * Keep track of data formats for the pending clipboard transaction.
 * @private
 */
  var _clipDataFormatMap = null;
  /**
 * The `message` store for events
 * @private
 */
  var _eventMessages = {
    ready: "Flash communication is established",
    error: {
      "flash-disabled": "Flash is disabled or not installed",
      "flash-outdated": "Flash is too outdated to support ZeroClipboard",
      "flash-unavailable": "Flash is unable to communicate bidirectionally with JavaScript",
      "flash-deactivated": "Flash is too outdated for your browser and/or is configured as click-to-activate",
      "flash-overdue": "Flash communication was established but NOT within the acceptable time limit"
    }
  };
  /**
 * ZeroClipboard configuration defaults for the Core module.
 * @private
 */
  var _globalConfig = {
    swfPath: _getDefaultSwfPath(),
    trustedDomains: window.location.host ? [ window.location.host ] : [],
    cacheBust: true,
    forceEnhancedClipboard: false,
    flashLoadTimeout: 3e4,
    autoActivate: true,
    bubbleEvents: true,
    containerId: "global-zeroclipboard-html-bridge",
    containerClass: "global-zeroclipboard-container",
    swfObjectId: "global-zeroclipboard-flash-bridge",
    hoverClass: "zeroclipboard-is-hover",
    activeClass: "zeroclipboard-is-active",
    forceHandCursor: false,
    title: null,
    zIndex: 999999999
  };
  /**
 * The underlying implementation of `ZeroClipboard.config`.
 * @private
 */
  var _config = function(options) {
    if (typeof options === "object" && options !== null) {
      for (var prop in options) {
        if (_hasOwn.call(options, prop)) {
          if (/^(?:forceHandCursor|title|zIndex|bubbleEvents)$/.test(prop)) {
            _globalConfig[prop] = options[prop];
          } else if (_flashState.bridge == null) {
            if (prop === "containerId" || prop === "swfObjectId") {
              if (_isValidHtml4Id(options[prop])) {
                _globalConfig[prop] = options[prop];
              } else {
                throw new Error("The specified `" + prop + "` value is not valid as an HTML4 Element ID");
              }
            } else {
              _globalConfig[prop] = options[prop];
            }
          }
        }
      }
    }
    if (typeof options === "string" && options) {
      if (_hasOwn.call(_globalConfig, options)) {
        return _globalConfig[options];
      }
      return;
    }
    return _deepCopy(_globalConfig);
  };
  /**
 * The underlying implementation of `ZeroClipboard.state`.
 * @private
 */
  var _state = function() {
    return {
      browser: _pick(_navigator, [ "userAgent", "platform", "appName" ]),
      flash: _omit(_flashState, [ "bridge" ]),
      zeroclipboard: {
        version: ZeroClipboard.version,
        config: ZeroClipboard.config()
      }
    };
  };
  /**
 * The underlying implementation of `ZeroClipboard.isFlashUnusable`.
 * @private
 */
  var _isFlashUnusable = function() {
    return !!(_flashState.disabled || _flashState.outdated || _flashState.unavailable || _flashState.deactivated);
  };
  /**
 * The underlying implementation of `ZeroClipboard.on`.
 * @private
 */
  var _on = function(eventType, listener) {
    var i, len, events, added = {};
    if (typeof eventType === "string" && eventType) {
      events = eventType.toLowerCase().split(/\s+/);
    } else if (typeof eventType === "object" && eventType && typeof listener === "undefined") {
      for (i in eventType) {
        if (_hasOwn.call(eventType, i) && typeof i === "string" && i && typeof eventType[i] === "function") {
          ZeroClipboard.on(i, eventType[i]);
        }
      }
    }
    if (events && events.length) {
      for (i = 0, len = events.length; i < len; i++) {
        eventType = events[i].replace(/^on/, "");
        added[eventType] = true;
        if (!_handlers[eventType]) {
          _handlers[eventType] = [];
        }
        _handlers[eventType].push(listener);
      }
      if (added.ready && _flashState.ready) {
        ZeroClipboard.emit({
          type: "ready"
        });
      }
      if (added.error) {
        var errorTypes = [ "disabled", "outdated", "unavailable", "deactivated", "overdue" ];
        for (i = 0, len = errorTypes.length; i < len; i++) {
          if (_flashState[errorTypes[i]] === true) {
            ZeroClipboard.emit({
              type: "error",
              name: "flash-" + errorTypes[i]
            });
            break;
          }
        }
      }
    }
    return ZeroClipboard;
  };
  /**
 * The underlying implementation of `ZeroClipboard.off`.
 * @private
 */
  var _off = function(eventType, listener) {
    var i, len, foundIndex, events, perEventHandlers;
    if (arguments.length === 0) {
      events = _keys(_handlers);
    } else if (typeof eventType === "string" && eventType) {
      events = eventType.split(/\s+/);
    } else if (typeof eventType === "object" && eventType && typeof listener === "undefined") {
      for (i in eventType) {
        if (_hasOwn.call(eventType, i) && typeof i === "string" && i && typeof eventType[i] === "function") {
          ZeroClipboard.off(i, eventType[i]);
        }
      }
    }
    if (events && events.length) {
      for (i = 0, len = events.length; i < len; i++) {
        eventType = events[i].toLowerCase().replace(/^on/, "");
        perEventHandlers = _handlers[eventType];
        if (perEventHandlers && perEventHandlers.length) {
          if (listener) {
            foundIndex = perEventHandlers.indexOf(listener);
            while (foundIndex !== -1) {
              perEventHandlers.splice(foundIndex, 1);
              foundIndex = perEventHandlers.indexOf(listener, foundIndex);
            }
          } else {
            perEventHandlers.length = 0;
          }
        }
      }
    }
    return ZeroClipboard;
  };
  /**
 * The underlying implementation of `ZeroClipboard.handlers`.
 * @private
 */
  var _listeners = function(eventType) {
    var copy;
    if (typeof eventType === "string" && eventType) {
      copy = _deepCopy(_handlers[eventType]) || null;
    } else {
      copy = _deepCopy(_handlers);
    }
    return copy;
  };
  /**
 * The underlying implementation of `ZeroClipboard.emit`.
 * @private
 */
  var _emit = function(event) {
    var eventCopy, returnVal, tmp;
    event = _createEvent(event);
    if (!event) {
      return;
    }
    if (_preprocessEvent(event)) {
      return;
    }
    if (event.type === "ready" && _flashState.overdue === true) {
      return ZeroClipboard.emit({
        type: "error",
        name: "flash-overdue"
      });
    }
    eventCopy = _extend({}, event);
    _dispatchCallbacks.call(this, eventCopy);
    if (event.type === "copy") {
      tmp = _mapClipDataToFlash(_clipData);
      returnVal = tmp.data;
      _clipDataFormatMap = tmp.formatMap;
    }
    return returnVal;
  };
  /**
 * The underlying implementation of `ZeroClipboard.create`.
 * @private
 */
  var _create = function() {
    if (typeof _flashState.ready !== "boolean") {
      _flashState.ready = false;
    }
    if (!ZeroClipboard.isFlashUnusable() && _flashState.bridge === null) {
      var maxWait = _globalConfig.flashLoadTimeout;
      if (typeof maxWait === "number" && maxWait >= 0) {
        _setTimeout(function() {
          if (typeof _flashState.deactivated !== "boolean") {
            _flashState.deactivated = true;
          }
          if (_flashState.deactivated === true) {
            ZeroClipboard.emit({
              type: "error",
              name: "flash-deactivated"
            });
          }
        }, maxWait);
      }
      _flashState.overdue = false;
      _embedSwf();
    }
  };
  /**
 * The underlying implementation of `ZeroClipboard.destroy`.
 * @private
 */
  var _destroy = function() {
    ZeroClipboard.clearData();
    ZeroClipboard.blur();
    ZeroClipboard.emit("destroy");
    _unembedSwf();
    ZeroClipboard.off();
  };
  /**
 * The underlying implementation of `ZeroClipboard.setData`.
 * @private
 */
  var _setData = function(format, data) {
    var dataObj;
    if (typeof format === "object" && format && typeof data === "undefined") {
      dataObj = format;
      ZeroClipboard.clearData();
    } else if (typeof format === "string" && format) {
      dataObj = {};
      dataObj[format] = data;
    } else {
      return;
    }
    for (var dataFormat in dataObj) {
      if (typeof dataFormat === "string" && dataFormat && _hasOwn.call(dataObj, dataFormat) && typeof dataObj[dataFormat] === "string" && dataObj[dataFormat]) {
        _clipData[dataFormat] = dataObj[dataFormat];
      }
    }
  };
  /**
 * The underlying implementation of `ZeroClipboard.clearData`.
 * @private
 */
  var _clearData = function(format) {
    if (typeof format === "undefined") {
      _deleteOwnProperties(_clipData);
      _clipDataFormatMap = null;
    } else if (typeof format === "string" && _hasOwn.call(_clipData, format)) {
      delete _clipData[format];
    }
  };
  /**
 * The underlying implementation of `ZeroClipboard.getData`.
 * @private
 */
  var _getData = function(format) {
    if (typeof format === "undefined") {
      return _deepCopy(_clipData);
    } else if (typeof format === "string" && _hasOwn.call(_clipData, format)) {
      return _clipData[format];
    }
  };
  /**
 * The underlying implementation of `ZeroClipboard.focus`/`ZeroClipboard.activate`.
 * @private
 */
  var _focus = function(element) {
    if (!(element && element.nodeType === 1)) {
      return;
    }
    if (_currentElement) {
      _removeClass(_currentElement, _globalConfig.activeClass);
      if (_currentElement !== element) {
        _removeClass(_currentElement, _globalConfig.hoverClass);
      }
    }
    _currentElement = element;
    _addClass(element, _globalConfig.hoverClass);
    var newTitle = element.getAttribute("title") || _globalConfig.title;
    if (typeof newTitle === "string" && newTitle) {
      var htmlBridge = _getHtmlBridge(_flashState.bridge);
      if (htmlBridge) {
        htmlBridge.setAttribute("title", newTitle);
      }
    }
    var useHandCursor = _globalConfig.forceHandCursor === true || _getStyle(element, "cursor") === "pointer";
    _setHandCursor(useHandCursor);
    _reposition();
  };
  /**
 * The underlying implementation of `ZeroClipboard.blur`/`ZeroClipboard.deactivate`.
 * @private
 */
  var _blur = function() {
    var htmlBridge = _getHtmlBridge(_flashState.bridge);
    if (htmlBridge) {
      htmlBridge.removeAttribute("title");
      htmlBridge.style.left = "0px";
      htmlBridge.style.top = "-9999px";
      htmlBridge.style.width = "1px";
      htmlBridge.style.top = "1px";
    }
    if (_currentElement) {
      _removeClass(_currentElement, _globalConfig.hoverClass);
      _removeClass(_currentElement, _globalConfig.activeClass);
      _currentElement = null;
    }
  };
  /**
 * The underlying implementation of `ZeroClipboard.activeElement`.
 * @private
 */
  var _activeElement = function() {
    return _currentElement || null;
  };
  /**
 * Check if a value is a valid HTML4 `ID` or `Name` token.
 * @private
 */
  var _isValidHtml4Id = function(id) {
    return typeof id === "string" && id && /^[A-Za-z][A-Za-z0-9_:\-\.]*$/.test(id);
  };
  /**
 * Create or update an `event` object, based on the `eventType`.
 * @private
 */
  var _createEvent = function(event) {
    var eventType;
    if (typeof event === "string" && event) {
      eventType = event;
      event = {};
    } else if (typeof event === "object" && event && typeof event.type === "string" && event.type) {
      eventType = event.type;
    }
    if (!eventType) {
      return;
    }
    if (!event.target && /^(copy|aftercopy|_click)$/.test(eventType.toLowerCase())) {
      event.target = _copyTarget;
    }
    _extend(event, {
      type: eventType.toLowerCase(),
      target: event.target || _currentElement || null,
      relatedTarget: event.relatedTarget || null,
      currentTarget: _flashState && _flashState.bridge || null,
      timeStamp: event.timeStamp || _now() || null
    });
    var msg = _eventMessages[event.type];
    if (event.type === "error" && event.name && msg) {
      msg = msg[event.name];
    }
    if (msg) {
      event.message = msg;
    }
    if (event.type === "ready") {
      _extend(event, {
        target: null,
        version: _flashState.version
      });
    }
    if (event.type === "error") {
      if (/^flash-(disabled|outdated|unavailable|deactivated|overdue)$/.test(event.name)) {
        _extend(event, {
          target: null,
          minimumVersion: _minimumFlashVersion
        });
      }
      if (/^flash-(outdated|unavailable|deactivated|overdue)$/.test(event.name)) {
        _extend(event, {
          version: _flashState.version
        });
      }
    }
    if (event.type === "copy") {
      event.clipboardData = {
        setData: ZeroClipboard.setData,
        clearData: ZeroClipboard.clearData
      };
    }
    if (event.type === "aftercopy") {
      event = _mapClipResultsFromFlash(event, _clipDataFormatMap);
    }
    if (event.target && !event.relatedTarget) {
      event.relatedTarget = _getRelatedTarget(event.target);
    }
    event = _addMouseData(event);
    return event;
  };
  /**
 * Get a relatedTarget from the target's `data-clipboard-target` attribute
 * @private
 */
  var _getRelatedTarget = function(targetEl) {
    var relatedTargetId = targetEl && targetEl.getAttribute && targetEl.getAttribute("data-clipboard-target");
    return relatedTargetId ? _document.getElementById(relatedTargetId) : null;
  };
  /**
 * Add element and position data to `MouseEvent` instances
 * @private
 */
  var _addMouseData = function(event) {
    if (event && /^_(?:click|mouse(?:over|out|down|up|move))$/.test(event.type)) {
      var srcElement = event.target;
      var fromElement = event.type === "_mouseover" && event.relatedTarget ? event.relatedTarget : undefined;
      var toElement = event.type === "_mouseout" && event.relatedTarget ? event.relatedTarget : undefined;
      var pos = _getDOMObjectPosition(srcElement);
      var screenLeft = _window.screenLeft || _window.screenX || 0;
      var screenTop = _window.screenTop || _window.screenY || 0;
      var scrollLeft = _document.body.scrollLeft + _document.documentElement.scrollLeft;
      var scrollTop = _document.body.scrollTop + _document.documentElement.scrollTop;
      var pageX = pos.left + (typeof event._stageX === "number" ? event._stageX : 0);
      var pageY = pos.top + (typeof event._stageY === "number" ? event._stageY : 0);
      var clientX = pageX - scrollLeft;
      var clientY = pageY - scrollTop;
      var screenX = screenLeft + clientX;
      var screenY = screenTop + clientY;
      var moveX = typeof event.movementX === "number" ? event.movementX : 0;
      var moveY = typeof event.movementY === "number" ? event.movementY : 0;
      delete event._stageX;
      delete event._stageY;
      _extend(event, {
        srcElement: srcElement,
        fromElement: fromElement,
        toElement: toElement,
        screenX: screenX,
        screenY: screenY,
        pageX: pageX,
        pageY: pageY,
        clientX: clientX,
        clientY: clientY,
        x: clientX,
        y: clientY,
        movementX: moveX,
        movementY: moveY,
        offsetX: 0,
        offsetY: 0,
        layerX: 0,
        layerY: 0
      });
    }
    return event;
  };
  /**
 * Determine if an event's registered handlers should be execute synchronously or asynchronously.
 *
 * @returns {boolean}
 * @private
 */
  var _shouldPerformAsync = function(event) {
    var eventType = event && typeof event.type === "string" && event.type || "";
    return !/^(?:(?:before)?copy|destroy)$/.test(eventType);
  };
  /**
 * Control if a callback should be executed asynchronously or not.
 *
 * @returns `undefined`
 * @private
 */
  var _dispatchCallback = function(func, context, args, async) {
    if (async) {
      _setTimeout(function() {
        func.apply(context, args);
      }, 0);
    } else {
      func.apply(context, args);
    }
  };
  /**
 * Handle the actual dispatching of events to client instances.
 *
 * @returns `undefined`
 * @private
 */
  var _dispatchCallbacks = function(event) {
    if (!(typeof event === "object" && event && event.type)) {
      return;
    }
    var async = _shouldPerformAsync(event);
    var wildcardTypeHandlers = _handlers["*"] || [];
    var specificTypeHandlers = _handlers[event.type] || [];
    var handlers = wildcardTypeHandlers.concat(specificTypeHandlers);
    if (handlers && handlers.length) {
      var i, len, func, context, eventCopy, originalContext = this;
      for (i = 0, len = handlers.length; i < len; i++) {
        func = handlers[i];
        context = originalContext;
        if (typeof func === "string" && typeof _window[func] === "function") {
          func = _window[func];
        }
        if (typeof func === "object" && func && typeof func.handleEvent === "function") {
          context = func;
          func = func.handleEvent;
        }
        if (typeof func === "function") {
          eventCopy = _extend({}, event);
          _dispatchCallback(func, context, [ eventCopy ], async);
        }
      }
    }
    return this;
  };
  /**
 * Preprocess any special behaviors, reactions, or state changes after receiving this event.
 * Executes only once per event emitted, NOT once per client.
 * @private
 */
  var _preprocessEvent = function(event) {
    var element = event.target || _currentElement || null;
    var sourceIsSwf = event._source === "swf";
    delete event._source;
    var flashErrorNames = [ "flash-disabled", "flash-outdated", "flash-unavailable", "flash-deactivated", "flash-overdue" ];
    switch (event.type) {
     case "error":
      if (flashErrorNames.indexOf(event.name) !== -1) {
        _extend(_flashState, {
          disabled: event.name === "flash-disabled",
          outdated: event.name === "flash-outdated",
          unavailable: event.name === "flash-unavailable",
          deactivated: event.name === "flash-deactivated",
          overdue: event.name === "flash-overdue",
          ready: false
        });
      }
      break;

     case "ready":
      var wasDeactivated = _flashState.deactivated === true;
      _extend(_flashState, {
        disabled: false,
        outdated: false,
        unavailable: false,
        deactivated: false,
        overdue: wasDeactivated,
        ready: !wasDeactivated
      });
      break;

     case "beforecopy":
      _copyTarget = element;
      break;

     case "copy":
      var textContent, htmlContent, targetEl = event.relatedTarget;
      if (!(_clipData["text/html"] || _clipData["text/plain"]) && targetEl && (htmlContent = targetEl.value || targetEl.outerHTML || targetEl.innerHTML) && (textContent = targetEl.value || targetEl.textContent || targetEl.innerText)) {
        event.clipboardData.clearData();
        event.clipboardData.setData("text/plain", textContent);
        if (htmlContent !== textContent) {
          event.clipboardData.setData("text/html", htmlContent);
        }
      } else if (!_clipData["text/plain"] && event.target && (textContent = event.target.getAttribute("data-clipboard-text"))) {
        event.clipboardData.clearData();
        event.clipboardData.setData("text/plain", textContent);
      }
      break;

     case "aftercopy":
      ZeroClipboard.clearData();
      if (element && element !== _safeActiveElement() && element.focus) {
        element.focus();
      }
      break;

     case "_mouseover":
      ZeroClipboard.focus(element);
      if (_globalConfig.bubbleEvents === true && sourceIsSwf) {
        if (element && element !== event.relatedTarget && !_containedBy(event.relatedTarget, element)) {
          _fireMouseEvent(_extend({}, event, {
            type: "mouseenter",
            bubbles: false,
            cancelable: false
          }));
        }
        _fireMouseEvent(_extend({}, event, {
          type: "mouseover"
        }));
      }
      break;

     case "_mouseout":
      ZeroClipboard.blur();
      if (_globalConfig.bubbleEvents === true && sourceIsSwf) {
        if (element && element !== event.relatedTarget && !_containedBy(event.relatedTarget, element)) {
          _fireMouseEvent(_extend({}, event, {
            type: "mouseleave",
            bubbles: false,
            cancelable: false
          }));
        }
        _fireMouseEvent(_extend({}, event, {
          type: "mouseout"
        }));
      }
      break;

     case "_mousedown":
      _addClass(element, _globalConfig.activeClass);
      if (_globalConfig.bubbleEvents === true && sourceIsSwf) {
        _fireMouseEvent(_extend({}, event, {
          type: event.type.slice(1)
        }));
      }
      break;

     case "_mouseup":
      _removeClass(element, _globalConfig.activeClass);
      if (_globalConfig.bubbleEvents === true && sourceIsSwf) {
        _fireMouseEvent(_extend({}, event, {
          type: event.type.slice(1)
        }));
      }
      break;

     case "_click":
      _copyTarget = null;
      if (_globalConfig.bubbleEvents === true && sourceIsSwf) {
        _fireMouseEvent(_extend({}, event, {
          type: event.type.slice(1)
        }));
      }
      break;

     case "_mousemove":
      if (_globalConfig.bubbleEvents === true && sourceIsSwf) {
        _fireMouseEvent(_extend({}, event, {
          type: event.type.slice(1)
        }));
      }
      break;
    }
    if (/^_(?:click|mouse(?:over|out|down|up|move))$/.test(event.type)) {
      return true;
    }
  };
  /**
 * Dispatch a synthetic MouseEvent.
 *
 * @returns `undefined`
 * @private
 */
  var _fireMouseEvent = function(event) {
    if (!(event && typeof event.type === "string" && event)) {
      return;
    }
    var e, target = event.target || null, doc = target && target.ownerDocument || _document, defaults = {
      view: doc.defaultView || _window,
      canBubble: true,
      cancelable: true,
      detail: event.type === "click" ? 1 : 0,
      button: typeof event.which === "number" ? event.which - 1 : typeof event.button === "number" ? event.button : doc.createEvent ? 0 : 1
    }, args = _extend(defaults, event);
    if (!target) {
      return;
    }
    if (doc.createEvent && target.dispatchEvent) {
      args = [ args.type, args.canBubble, args.cancelable, args.view, args.detail, args.screenX, args.screenY, args.clientX, args.clientY, args.ctrlKey, args.altKey, args.shiftKey, args.metaKey, args.button, args.relatedTarget ];
      e = doc.createEvent("MouseEvents");
      if (e.initMouseEvent) {
        e.initMouseEvent.apply(e, args);
        e._source = "js";
        target.dispatchEvent(e);
      }
    }
  };
  /**
 * Create the HTML bridge element to embed the Flash object into.
 * @private
 */
  var _createHtmlBridge = function() {
    var container = _document.createElement("div");
    container.id = _globalConfig.containerId;
    container.className = _globalConfig.containerClass;
    container.style.position = "absolute";
    container.style.left = "0px";
    container.style.top = "-9999px";
    container.style.width = "1px";
    container.style.height = "1px";
    container.style.zIndex = "" + _getSafeZIndex(_globalConfig.zIndex);
    return container;
  };
  /**
 * Get the HTML element container that wraps the Flash bridge object/element.
 * @private
 */
  var _getHtmlBridge = function(flashBridge) {
    var htmlBridge = flashBridge && flashBridge.parentNode;
    while (htmlBridge && htmlBridge.nodeName === "OBJECT" && htmlBridge.parentNode) {
      htmlBridge = htmlBridge.parentNode;
    }
    return htmlBridge || null;
  };
  /**
 * Create the SWF object.
 *
 * @returns The SWF object reference.
 * @private
 */
  var _embedSwf = function() {
    var len, flashBridge = _flashState.bridge, container = _getHtmlBridge(flashBridge);
    if (!flashBridge) {
      var allowScriptAccess = _determineScriptAccess(_window.location.host, _globalConfig);
      var allowNetworking = allowScriptAccess === "never" ? "none" : "all";
      var flashvars = _vars(_globalConfig);
      var swfUrl = _globalConfig.swfPath + _cacheBust(_globalConfig.swfPath, _globalConfig);
      container = _createHtmlBridge();
      var divToBeReplaced = _document.createElement("div");
      container.appendChild(divToBeReplaced);
      _document.body.appendChild(container);
      var tmpDiv = _document.createElement("div");
      var oldIE = _flashState.pluginType === "activex";
      tmpDiv.innerHTML = '<object id="' + _globalConfig.swfObjectId + '" name="' + _globalConfig.swfObjectId + '" ' + 'width="100%" height="100%" ' + (oldIE ? 'classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000"' : 'type="application/x-shockwave-flash" data="' + swfUrl + '"') + ">" + (oldIE ? '<param name="movie" value="' + swfUrl + '"/>' : "") + '<param name="allowScriptAccess" value="' + allowScriptAccess + '"/>' + '<param name="allowNetworking" value="' + allowNetworking + '"/>' + '<param name="menu" value="false"/>' + '<param name="wmode" value="transparent"/>' + '<param name="flashvars" value="' + flashvars + '"/>' + "</object>";
      flashBridge = tmpDiv.firstChild;
      tmpDiv = null;
      _unwrap(flashBridge).ZeroClipboard = ZeroClipboard;
      container.replaceChild(flashBridge, divToBeReplaced);
    }
    if (!flashBridge) {
      flashBridge = _document[_globalConfig.swfObjectId];
      if (flashBridge && (len = flashBridge.length)) {
        flashBridge = flashBridge[len - 1];
      }
      if (!flashBridge && container) {
        flashBridge = container.firstChild;
      }
    }
    _flashState.bridge = flashBridge || null;
    return flashBridge;
  };
  /**
 * Destroy the SWF object.
 * @private
 */
  var _unembedSwf = function() {
    var flashBridge = _flashState.bridge;
    if (flashBridge) {
      var htmlBridge = _getHtmlBridge(flashBridge);
      if (htmlBridge) {
        if (_flashState.pluginType === "activex" && "readyState" in flashBridge) {
          flashBridge.style.display = "none";
          (function removeSwfFromIE() {
            if (flashBridge.readyState === 4) {
              for (var prop in flashBridge) {
                if (typeof flashBridge[prop] === "function") {
                  flashBridge[prop] = null;
                }
              }
              if (flashBridge.parentNode) {
                flashBridge.parentNode.removeChild(flashBridge);
              }
              if (htmlBridge.parentNode) {
                htmlBridge.parentNode.removeChild(htmlBridge);
              }
            } else {
              _setTimeout(removeSwfFromIE, 10);
            }
          })();
        } else {
          if (flashBridge.parentNode) {
            flashBridge.parentNode.removeChild(flashBridge);
          }
          if (htmlBridge.parentNode) {
            htmlBridge.parentNode.removeChild(htmlBridge);
          }
        }
      }
      _flashState.ready = null;
      _flashState.bridge = null;
      _flashState.deactivated = null;
    }
  };
  /**
 * Map the data format names of the "clipData" to Flash-friendly names.
 *
 * @returns A new transformed object.
 * @private
 */
  var _mapClipDataToFlash = function(clipData) {
    var newClipData = {}, formatMap = {};
    if (!(typeof clipData === "object" && clipData)) {
      return;
    }
    for (var dataFormat in clipData) {
      if (dataFormat && _hasOwn.call(clipData, dataFormat) && typeof clipData[dataFormat] === "string" && clipData[dataFormat]) {
        switch (dataFormat.toLowerCase()) {
         case "text/plain":
         case "text":
         case "air:text":
         case "flash:text":
          newClipData.text = clipData[dataFormat];
          formatMap.text = dataFormat;
          break;

         case "text/html":
         case "html":
         case "air:html":
         case "flash:html":
          newClipData.html = clipData[dataFormat];
          formatMap.html = dataFormat;
          break;

         case "application/rtf":
         case "text/rtf":
         case "rtf":
         case "richtext":
         case "air:rtf":
         case "flash:rtf":
          newClipData.rtf = clipData[dataFormat];
          formatMap.rtf = dataFormat;
          break;

         default:
          break;
        }
      }
    }
    return {
      data: newClipData,
      formatMap: formatMap
    };
  };
  /**
 * Map the data format names from Flash-friendly names back to their original "clipData" names (via a format mapping).
 *
 * @returns A new transformed object.
 * @private
 */
  var _mapClipResultsFromFlash = function(clipResults, formatMap) {
    if (!(typeof clipResults === "object" && clipResults && typeof formatMap === "object" && formatMap)) {
      return clipResults;
    }
    var newResults = {};
    for (var prop in clipResults) {
      if (_hasOwn.call(clipResults, prop)) {
        if (prop !== "success" && prop !== "data") {
          newResults[prop] = clipResults[prop];
          continue;
        }
        newResults[prop] = {};
        var tmpHash = clipResults[prop];
        for (var dataFormat in tmpHash) {
          if (dataFormat && _hasOwn.call(tmpHash, dataFormat) && _hasOwn.call(formatMap, dataFormat)) {
            newResults[prop][formatMap[dataFormat]] = tmpHash[dataFormat];
          }
        }
      }
    }
    return newResults;
  };
  /**
 * Will look at a path, and will create a "?noCache={time}" or "&noCache={time}"
 * query param string to return. Does NOT append that string to the original path.
 * This is useful because ExternalInterface often breaks when a Flash SWF is cached.
 *
 * @returns The `noCache` query param with necessary "?"/"&" prefix.
 * @private
 */
  var _cacheBust = function(path, options) {
    var cacheBust = options == null || options && options.cacheBust === true;
    if (cacheBust) {
      return (path.indexOf("?") === -1 ? "?" : "&") + "noCache=" + _now();
    } else {
      return "";
    }
  };
  /**
 * Creates a query string for the FlashVars param.
 * Does NOT include the cache-busting query param.
 *
 * @returns FlashVars query string
 * @private
 */
  var _vars = function(options) {
    var i, len, domain, domains, str = "", trustedOriginsExpanded = [];
    if (options.trustedDomains) {
      if (typeof options.trustedDomains === "string") {
        domains = [ options.trustedDomains ];
      } else if (typeof options.trustedDomains === "object" && "length" in options.trustedDomains) {
        domains = options.trustedDomains;
      }
    }
    if (domains && domains.length) {
      for (i = 0, len = domains.length; i < len; i++) {
        if (_hasOwn.call(domains, i) && domains[i] && typeof domains[i] === "string") {
          domain = _extractDomain(domains[i]);
          if (!domain) {
            continue;
          }
          if (domain === "*") {
            trustedOriginsExpanded.length = 0;
            trustedOriginsExpanded.push(domain);
            break;
          }
          trustedOriginsExpanded.push.apply(trustedOriginsExpanded, [ domain, "//" + domain, _window.location.protocol + "//" + domain ]);
        }
      }
    }
    if (trustedOriginsExpanded.length) {
      str += "trustedOrigins=" + _encodeURIComponent(trustedOriginsExpanded.join(","));
    }
    if (options.forceEnhancedClipboard === true) {
      str += (str ? "&" : "") + "forceEnhancedClipboard=true";
    }
    if (typeof options.swfObjectId === "string" && options.swfObjectId) {
      str += (str ? "&" : "") + "swfObjectId=" + _encodeURIComponent(options.swfObjectId);
    }
    return str;
  };
  /**
 * Extract the domain (e.g. "github.com") from an origin (e.g. "https://github.com") or
 * URL (e.g. "https://github.com/zeroclipboard/zeroclipboard/").
 *
 * @returns the domain
 * @private
 */
  var _extractDomain = function(originOrUrl) {
    if (originOrUrl == null || originOrUrl === "") {
      return null;
    }
    originOrUrl = originOrUrl.replace(/^\s+|\s+$/g, "");
    if (originOrUrl === "") {
      return null;
    }
    var protocolIndex = originOrUrl.indexOf("//");
    originOrUrl = protocolIndex === -1 ? originOrUrl : originOrUrl.slice(protocolIndex + 2);
    var pathIndex = originOrUrl.indexOf("/");
    originOrUrl = pathIndex === -1 ? originOrUrl : protocolIndex === -1 || pathIndex === 0 ? null : originOrUrl.slice(0, pathIndex);
    if (originOrUrl && originOrUrl.slice(-4).toLowerCase() === ".swf") {
      return null;
    }
    return originOrUrl || null;
  };
  /**
 * Set `allowScriptAccess` based on `trustedDomains` and `window.location.host` vs. `swfPath`.
 *
 * @returns The appropriate script access level.
 * @private
 */
  var _determineScriptAccess = function() {
    var _extractAllDomains = function(origins) {
      var i, len, tmp, resultsArray = [];
      if (typeof origins === "string") {
        origins = [ origins ];
      }
      if (!(typeof origins === "object" && origins && typeof origins.length === "number")) {
        return resultsArray;
      }
      for (i = 0, len = origins.length; i < len; i++) {
        if (_hasOwn.call(origins, i) && (tmp = _extractDomain(origins[i]))) {
          if (tmp === "*") {
            resultsArray.length = 0;
            resultsArray.push("*");
            break;
          }
          if (resultsArray.indexOf(tmp) === -1) {
            resultsArray.push(tmp);
          }
        }
      }
      return resultsArray;
    };
    return function(currentDomain, configOptions) {
      var swfDomain = _extractDomain(configOptions.swfPath);
      if (swfDomain === null) {
        swfDomain = currentDomain;
      }
      var trustedDomains = _extractAllDomains(configOptions.trustedDomains);
      var len = trustedDomains.length;
      if (len > 0) {
        if (len === 1 && trustedDomains[0] === "*") {
          return "always";
        }
        if (trustedDomains.indexOf(currentDomain) !== -1) {
          if (len === 1 && currentDomain === swfDomain) {
            return "sameDomain";
          }
          return "always";
        }
      }
      return "never";
    };
  }();
  /**
 * Get the currently active/focused DOM element.
 *
 * @returns the currently active/focused element, or `null`
 * @private
 */
  var _safeActiveElement = function() {
    try {
      return _document.activeElement;
    } catch (err) {
      return null;
    }
  };
  /**
 * Add a class to an element, if it doesn't already have it.
 *
 * @returns The element, with its new class added.
 * @private
 */
  var _addClass = function(element, value) {
    if (!element || element.nodeType !== 1) {
      return element;
    }
    if (element.classList) {
      if (!element.classList.contains(value)) {
        element.classList.add(value);
      }
      return element;
    }
    if (value && typeof value === "string") {
      var classNames = (value || "").split(/\s+/);
      if (element.nodeType === 1) {
        if (!element.className) {
          element.className = value;
        } else {
          var className = " " + element.className + " ", setClass = element.className;
          for (var c = 0, cl = classNames.length; c < cl; c++) {
            if (className.indexOf(" " + classNames[c] + " ") < 0) {
              setClass += " " + classNames[c];
            }
          }
          element.className = setClass.replace(/^\s+|\s+$/g, "");
        }
      }
    }
    return element;
  };
  /**
 * Remove a class from an element, if it has it.
 *
 * @returns The element, with its class removed.
 * @private
 */
  var _removeClass = function(element, value) {
    if (!element || element.nodeType !== 1) {
      return element;
    }
    if (element.classList) {
      if (element.classList.contains(value)) {
        element.classList.remove(value);
      }
      return element;
    }
    if (typeof value === "string" && value) {
      var classNames = value.split(/\s+/);
      if (element.nodeType === 1 && element.className) {
        var className = (" " + element.className + " ").replace(/[\n\t]/g, " ");
        for (var c = 0, cl = classNames.length; c < cl; c++) {
          className = className.replace(" " + classNames[c] + " ", " ");
        }
        element.className = className.replace(/^\s+|\s+$/g, "");
      }
    }
    return element;
  };
  /**
 * Attempt to interpret the element's CSS styling. If `prop` is `"cursor"`,
 * then we assume that it should be a hand ("pointer") cursor if the element
 * is an anchor element ("a" tag).
 *
 * @returns The computed style property.
 * @private
 */
  var _getStyle = function(el, prop) {
    var value = _window.getComputedStyle(el, null).getPropertyValue(prop);
    if (prop === "cursor") {
      if (!value || value === "auto") {
        if (el.nodeName === "A") {
          return "pointer";
        }
      }
    }
    return value;
  };
  /**
 * Get the zoom factor of the browser. Always returns `1.0`, except at
 * non-default zoom levels in IE<8 and some older versions of WebKit.
 *
 * @returns Floating unit percentage of the zoom factor (e.g. 150% = `1.5`).
 * @private
 */
  var _getZoomFactor = function() {
    var rect, physicalWidth, logicalWidth, zoomFactor = 1;
    if (typeof _document.body.getBoundingClientRect === "function") {
      rect = _document.body.getBoundingClientRect();
      physicalWidth = rect.right - rect.left;
      logicalWidth = _document.body.offsetWidth;
      zoomFactor = _round(physicalWidth / logicalWidth * 100) / 100;
    }
    return zoomFactor;
  };
  /**
 * Get the DOM positioning info of an element.
 *
 * @returns Object containing the element's position, width, and height.
 * @private
 */
  var _getDOMObjectPosition = function(obj) {
    var info = {
      left: 0,
      top: 0,
      width: 0,
      height: 0
    };
    if (obj.getBoundingClientRect) {
      var rect = obj.getBoundingClientRect();
      var pageXOffset, pageYOffset, zoomFactor;
      if ("pageXOffset" in _window && "pageYOffset" in _window) {
        pageXOffset = _window.pageXOffset;
        pageYOffset = _window.pageYOffset;
      } else {
        zoomFactor = _getZoomFactor();
        pageXOffset = _round(_document.documentElement.scrollLeft / zoomFactor);
        pageYOffset = _round(_document.documentElement.scrollTop / zoomFactor);
      }
      var leftBorderWidth = _document.documentElement.clientLeft || 0;
      var topBorderWidth = _document.documentElement.clientTop || 0;
      info.left = rect.left + pageXOffset - leftBorderWidth;
      info.top = rect.top + pageYOffset - topBorderWidth;
      info.width = "width" in rect ? rect.width : rect.right - rect.left;
      info.height = "height" in rect ? rect.height : rect.bottom - rect.top;
    }
    return info;
  };
  /**
 * Reposition the Flash object to cover the currently activated element.
 *
 * @returns `undefined`
 * @private
 */
  var _reposition = function() {
    var htmlBridge;
    if (_currentElement && (htmlBridge = _getHtmlBridge(_flashState.bridge))) {
      var pos = _getDOMObjectPosition(_currentElement);
      _extend(htmlBridge.style, {
        width: pos.width + "px",
        height: pos.height + "px",
        top: pos.top + "px",
        left: pos.left + "px",
        zIndex: "" + _getSafeZIndex(_globalConfig.zIndex)
      });
    }
  };
  /**
 * Sends a signal to the Flash object to display the hand cursor if `true`.
 *
 * @returns `undefined`
 * @private
 */
  var _setHandCursor = function(enabled) {
    if (_flashState.ready === true) {
      if (_flashState.bridge && typeof _flashState.bridge.setHandCursor === "function") {
        _flashState.bridge.setHandCursor(enabled);
      } else {
        _flashState.ready = false;
      }
    }
  };
  /**
 * Get a safe value for `zIndex`
 *
 * @returns an integer, or "auto"
 * @private
 */
  var _getSafeZIndex = function(val) {
    if (/^(?:auto|inherit)$/.test(val)) {
      return val;
    }
    var zIndex;
    if (typeof val === "number" && !_isNaN(val)) {
      zIndex = val;
    } else if (typeof val === "string") {
      zIndex = _getSafeZIndex(_parseInt(val, 10));
    }
    return typeof zIndex === "number" ? zIndex : "auto";
  };
  /**
 * Detect the Flash Player status, version, and plugin type.
 *
 * @see {@link https://code.google.com/p/doctype-mirror/wiki/ArticleDetectFlash#The_code}
 * @see {@link http://stackoverflow.com/questions/12866060/detecting-pepper-ppapi-flash-with-javascript}
 *
 * @returns `undefined`
 * @private
 */
  var _detectFlashSupport = function(ActiveXObject) {
    var plugin, ax, mimeType, hasFlash = false, isActiveX = false, isPPAPI = false, flashVersion = "";
    /**
   * Derived from Apple's suggested sniffer.
   * @param {String} desc e.g. "Shockwave Flash 7.0 r61"
   * @returns {String} "7.0.61"
   * @private
   */
    function parseFlashVersion(desc) {
      var matches = desc.match(/[\d]+/g);
      matches.length = 3;
      return matches.join(".");
    }
    function isPepperFlash(flashPlayerFileName) {
      return !!flashPlayerFileName && (flashPlayerFileName = flashPlayerFileName.toLowerCase()) && (/^(pepflashplayer\.dll|libpepflashplayer\.so|pepperflashplayer\.plugin)$/.test(flashPlayerFileName) || flashPlayerFileName.slice(-13) === "chrome.plugin");
    }
    function inspectPlugin(plugin) {
      if (plugin) {
        hasFlash = true;
        if (plugin.version) {
          flashVersion = parseFlashVersion(plugin.version);
        }
        if (!flashVersion && plugin.description) {
          flashVersion = parseFlashVersion(plugin.description);
        }
        if (plugin.filename) {
          isPPAPI = isPepperFlash(plugin.filename);
        }
      }
    }
    if (_navigator.plugins && _navigator.plugins.length) {
      plugin = _navigator.plugins["Shockwave Flash"];
      inspectPlugin(plugin);
      if (_navigator.plugins["Shockwave Flash 2.0"]) {
        hasFlash = true;
        flashVersion = "2.0.0.11";
      }
    } else if (_navigator.mimeTypes && _navigator.mimeTypes.length) {
      mimeType = _navigator.mimeTypes["application/x-shockwave-flash"];
      plugin = mimeType && mimeType.enabledPlugin;
      inspectPlugin(plugin);
    } else if (typeof ActiveXObject !== "undefined") {
      isActiveX = true;
      try {
        ax = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.7");
        hasFlash = true;
        flashVersion = parseFlashVersion(ax.GetVariable("$version"));
      } catch (e1) {
        try {
          ax = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.6");
          hasFlash = true;
          flashVersion = "6.0.21";
        } catch (e2) {
          try {
            ax = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
            hasFlash = true;
            flashVersion = parseFlashVersion(ax.GetVariable("$version"));
          } catch (e3) {
            isActiveX = false;
          }
        }
      }
    }
    _flashState.disabled = hasFlash !== true;
    _flashState.outdated = flashVersion && _parseFloat(flashVersion) < _parseFloat(_minimumFlashVersion);
    _flashState.version = flashVersion || "0.0.0";
    _flashState.pluginType = isPPAPI ? "pepper" : isActiveX ? "activex" : hasFlash ? "netscape" : "unknown";
  };
  /**
 * Invoke the Flash detection algorithms immediately upon inclusion so we're not waiting later.
 */
  _detectFlashSupport(_ActiveXObject);
  /**
 * A shell constructor for `ZeroClipboard` client instances.
 *
 * @constructor
 */
  var ZeroClipboard = function() {
    if (!(this instanceof ZeroClipboard)) {
      return new ZeroClipboard();
    }
    if (typeof ZeroClipboard._createClient === "function") {
      ZeroClipboard._createClient.apply(this, _args(arguments));
    }
  };
  /**
 * The ZeroClipboard library's version number.
 *
 * @static
 * @readonly
 * @property {string}
 */
  _defineProperty(ZeroClipboard, "version", {
    value: "2.1.6",
    writable: false,
    configurable: true,
    enumerable: true
  });
  /**
 * Update or get a copy of the ZeroClipboard global configuration.
 * Returns a copy of the current/updated configuration.
 *
 * @returns Object
 * @static
 */
  ZeroClipboard.config = function() {
    return _config.apply(this, _args(arguments));
  };
  /**
 * Diagnostic method that describes the state of the browser, Flash Player, and ZeroClipboard.
 *
 * @returns Object
 * @static
 */
  ZeroClipboard.state = function() {
    return _state.apply(this, _args(arguments));
  };
  /**
 * Check if Flash is unusable for any reason: disabled, outdated, deactivated, etc.
 *
 * @returns Boolean
 * @static
 */
  ZeroClipboard.isFlashUnusable = function() {
    return _isFlashUnusable.apply(this, _args(arguments));
  };
  /**
 * Register an event listener.
 *
 * @returns `ZeroClipboard`
 * @static
 */
  ZeroClipboard.on = function() {
    return _on.apply(this, _args(arguments));
  };
  /**
 * Unregister an event listener.
 * If no `listener` function/object is provided, it will unregister all listeners for the provided `eventType`.
 * If no `eventType` is provided, it will unregister all listeners for every event type.
 *
 * @returns `ZeroClipboard`
 * @static
 */
  ZeroClipboard.off = function() {
    return _off.apply(this, _args(arguments));
  };
  /**
 * Retrieve event listeners for an `eventType`.
 * If no `eventType` is provided, it will retrieve all listeners for every event type.
 *
 * @returns array of listeners for the `eventType`; if no `eventType`, then a map/hash object of listeners for all event types; or `null`
 */
  ZeroClipboard.handlers = function() {
    return _listeners.apply(this, _args(arguments));
  };
  /**
 * Event emission receiver from the Flash object, forwarding to any registered JavaScript event listeners.
 *
 * @returns For the "copy" event, returns the Flash-friendly "clipData" object; otherwise `undefined`.
 * @static
 */
  ZeroClipboard.emit = function() {
    return _emit.apply(this, _args(arguments));
  };
  /**
 * Create and embed the Flash object.
 *
 * @returns The Flash object
 * @static
 */
  ZeroClipboard.create = function() {
    return _create.apply(this, _args(arguments));
  };
  /**
 * Self-destruct and clean up everything, including the embedded Flash object.
 *
 * @returns `undefined`
 * @static
 */
  ZeroClipboard.destroy = function() {
    return _destroy.apply(this, _args(arguments));
  };
  /**
 * Set the pending data for clipboard injection.
 *
 * @returns `undefined`
 * @static
 */
  ZeroClipboard.setData = function() {
    return _setData.apply(this, _args(arguments));
  };
  /**
 * Clear the pending data for clipboard injection.
 * If no `format` is provided, all pending data formats will be cleared.
 *
 * @returns `undefined`
 * @static
 */
  ZeroClipboard.clearData = function() {
    return _clearData.apply(this, _args(arguments));
  };
  /**
 * Get a copy of the pending data for clipboard injection.
 * If no `format` is provided, a copy of ALL pending data formats will be returned.
 *
 * @returns `String` or `Object`
 * @static
 */
  ZeroClipboard.getData = function() {
    return _getData.apply(this, _args(arguments));
  };
  /**
 * Sets the current HTML object that the Flash object should overlay. This will put the global
 * Flash object on top of the current element; depending on the setup, this may also set the
 * pending clipboard text data as well as the Flash object's wrapping element's title attribute
 * based on the underlying HTML element and ZeroClipboard configuration.
 *
 * @returns `undefined`
 * @static
 */
  ZeroClipboard.focus = ZeroClipboard.activate = function() {
    return _focus.apply(this, _args(arguments));
  };
  /**
 * Un-overlays the Flash object. This will put the global Flash object off-screen; depending on
 * the setup, this may also unset the Flash object's wrapping element's title attribute based on
 * the underlying HTML element and ZeroClipboard configuration.
 *
 * @returns `undefined`
 * @static
 */
  ZeroClipboard.blur = ZeroClipboard.deactivate = function() {
    return _blur.apply(this, _args(arguments));
  };
  /**
 * Returns the currently focused/"activated" HTML element that the Flash object is wrapping.
 *
 * @returns `HTMLElement` or `null`
 * @static
 */
  ZeroClipboard.activeElement = function() {
    return _activeElement.apply(this, _args(arguments));
  };
  /**
 * Keep track of the ZeroClipboard client instance counter.
 */
  var _clientIdCounter = 0;
  /**
 * Keep track of the state of the client instances.
 *
 * Entry structure:
 *   _clientMeta[client.id] = {
 *     instance: client,
 *     elements: [],
 *     handlers: {}
 *   };
 */
  var _clientMeta = {};
  /**
 * Keep track of the ZeroClipboard clipped elements counter.
 */
  var _elementIdCounter = 0;
  /**
 * Keep track of the state of the clipped element relationships to clients.
 *
 * Entry structure:
 *   _elementMeta[element.zcClippingId] = [client1.id, client2.id];
 */
  var _elementMeta = {};
  /**
 * Keep track of the state of the mouse event handlers for clipped elements.
 *
 * Entry structure:
 *   _mouseHandlers[element.zcClippingId] = {
 *     mouseover:  function(event) {},
 *     mouseout:   function(event) {},
 *     mouseenter: function(event) {},
 *     mouseleave: function(event) {},
 *     mousemove:  function(event) {}
 *   };
 */
  var _mouseHandlers = {};
  /**
 * Extending the ZeroClipboard configuration defaults for the Client module.
 */
  _extend(_globalConfig, {
    autoActivate: true
  });
  /**
 * The real constructor for `ZeroClipboard` client instances.
 * @private
 */
  var _clientConstructor = function(elements) {
    var client = this;
    client.id = "" + _clientIdCounter++;
    _clientMeta[client.id] = {
      instance: client,
      elements: [],
      handlers: {}
    };
    if (elements) {
      client.clip(elements);
    }
    ZeroClipboard.on("*", function(event) {
      return client.emit(event);
    });
    ZeroClipboard.on("destroy", function() {
      client.destroy();
    });
    ZeroClipboard.create();
  };
  /**
 * The underlying implementation of `ZeroClipboard.Client.prototype.on`.
 * @private
 */
  var _clientOn = function(eventType, listener) {
    var i, len, events, added = {}, handlers = _clientMeta[this.id] && _clientMeta[this.id].handlers;
    if (typeof eventType === "string" && eventType) {
      events = eventType.toLowerCase().split(/\s+/);
    } else if (typeof eventType === "object" && eventType && typeof listener === "undefined") {
      for (i in eventType) {
        if (_hasOwn.call(eventType, i) && typeof i === "string" && i && typeof eventType[i] === "function") {
          this.on(i, eventType[i]);
        }
      }
    }
    if (events && events.length) {
      for (i = 0, len = events.length; i < len; i++) {
        eventType = events[i].replace(/^on/, "");
        added[eventType] = true;
        if (!handlers[eventType]) {
          handlers[eventType] = [];
        }
        handlers[eventType].push(listener);
      }
      if (added.ready && _flashState.ready) {
        this.emit({
          type: "ready",
          client: this
        });
      }
      if (added.error) {
        var errorTypes = [ "disabled", "outdated", "unavailable", "deactivated", "overdue" ];
        for (i = 0, len = errorTypes.length; i < len; i++) {
          if (_flashState[errorTypes[i]]) {
            this.emit({
              type: "error",
              name: "flash-" + errorTypes[i],
              client: this
            });
            break;
          }
        }
      }
    }
    return this;
  };
  /**
 * The underlying implementation of `ZeroClipboard.Client.prototype.off`.
 * @private
 */
  var _clientOff = function(eventType, listener) {
    var i, len, foundIndex, events, perEventHandlers, handlers = _clientMeta[this.id] && _clientMeta[this.id].handlers;
    if (arguments.length === 0) {
      events = _keys(handlers);
    } else if (typeof eventType === "string" && eventType) {
      events = eventType.split(/\s+/);
    } else if (typeof eventType === "object" && eventType && typeof listener === "undefined") {
      for (i in eventType) {
        if (_hasOwn.call(eventType, i) && typeof i === "string" && i && typeof eventType[i] === "function") {
          this.off(i, eventType[i]);
        }
      }
    }
    if (events && events.length) {
      for (i = 0, len = events.length; i < len; i++) {
        eventType = events[i].toLowerCase().replace(/^on/, "");
        perEventHandlers = handlers[eventType];
        if (perEventHandlers && perEventHandlers.length) {
          if (listener) {
            foundIndex = perEventHandlers.indexOf(listener);
            while (foundIndex !== -1) {
              perEventHandlers.splice(foundIndex, 1);
              foundIndex = perEventHandlers.indexOf(listener, foundIndex);
            }
          } else {
            perEventHandlers.length = 0;
          }
        }
      }
    }
    return this;
  };
  /**
 * The underlying implementation of `ZeroClipboard.Client.prototype.handlers`.
 * @private
 */
  var _clientListeners = function(eventType) {
    var copy = null, handlers = _clientMeta[this.id] && _clientMeta[this.id].handlers;
    if (handlers) {
      if (typeof eventType === "string" && eventType) {
        copy = handlers[eventType] ? handlers[eventType].slice(0) : [];
      } else {
        copy = _deepCopy(handlers);
      }
    }
    return copy;
  };
  /**
 * The underlying implementation of `ZeroClipboard.Client.prototype.emit`.
 * @private
 */
  var _clientEmit = function(event) {
    if (_clientShouldEmit.call(this, event)) {
      if (typeof event === "object" && event && typeof event.type === "string" && event.type) {
        event = _extend({}, event);
      }
      var eventCopy = _extend({}, _createEvent(event), {
        client: this
      });
      _clientDispatchCallbacks.call(this, eventCopy);
    }
    return this;
  };
  /**
 * The underlying implementation of `ZeroClipboard.Client.prototype.clip`.
 * @private
 */
  var _clientClip = function(elements) {
    elements = _prepClip(elements);
    for (var i = 0; i < elements.length; i++) {
      if (_hasOwn.call(elements, i) && elements[i] && elements[i].nodeType === 1) {
        if (!elements[i].zcClippingId) {
          elements[i].zcClippingId = "zcClippingId_" + _elementIdCounter++;
          _elementMeta[elements[i].zcClippingId] = [ this.id ];
          if (_globalConfig.autoActivate === true) {
            _addMouseHandlers(elements[i]);
          }
        } else if (_elementMeta[elements[i].zcClippingId].indexOf(this.id) === -1) {
          _elementMeta[elements[i].zcClippingId].push(this.id);
        }
        var clippedElements = _clientMeta[this.id] && _clientMeta[this.id].elements;
        if (clippedElements.indexOf(elements[i]) === -1) {
          clippedElements.push(elements[i]);
        }
      }
    }
    return this;
  };
  /**
 * The underlying implementation of `ZeroClipboard.Client.prototype.unclip`.
 * @private
 */
  var _clientUnclip = function(elements) {
    var meta = _clientMeta[this.id];
    if (!meta) {
      return this;
    }
    var clippedElements = meta.elements;
    var arrayIndex;
    if (typeof elements === "undefined") {
      elements = clippedElements.slice(0);
    } else {
      elements = _prepClip(elements);
    }
    for (var i = elements.length; i--; ) {
      if (_hasOwn.call(elements, i) && elements[i] && elements[i].nodeType === 1) {
        arrayIndex = 0;
        while ((arrayIndex = clippedElements.indexOf(elements[i], arrayIndex)) !== -1) {
          clippedElements.splice(arrayIndex, 1);
        }
        var clientIds = _elementMeta[elements[i].zcClippingId];
        if (clientIds) {
          arrayIndex = 0;
          while ((arrayIndex = clientIds.indexOf(this.id, arrayIndex)) !== -1) {
            clientIds.splice(arrayIndex, 1);
          }
          if (clientIds.length === 0) {
            if (_globalConfig.autoActivate === true) {
              _removeMouseHandlers(elements[i]);
            }
            delete elements[i].zcClippingId;
          }
        }
      }
    }
    return this;
  };
  /**
 * The underlying implementation of `ZeroClipboard.Client.prototype.elements`.
 * @private
 */
  var _clientElements = function() {
    var meta = _clientMeta[this.id];
    return meta && meta.elements ? meta.elements.slice(0) : [];
  };
  /**
 * The underlying implementation of `ZeroClipboard.Client.prototype.destroy`.
 * @private
 */
  var _clientDestroy = function() {
    this.unclip();
    this.off();
    delete _clientMeta[this.id];
  };
  /**
 * Inspect an Event to see if the Client (`this`) should honor it for emission.
 * @private
 */
  var _clientShouldEmit = function(event) {
    if (!(event && event.type)) {
      return false;
    }
    if (event.client && event.client !== this) {
      return false;
    }
    var clippedEls = _clientMeta[this.id] && _clientMeta[this.id].elements;
    var hasClippedEls = !!clippedEls && clippedEls.length > 0;
    var goodTarget = !event.target || hasClippedEls && clippedEls.indexOf(event.target) !== -1;
    var goodRelTarget = event.relatedTarget && hasClippedEls && clippedEls.indexOf(event.relatedTarget) !== -1;
    var goodClient = event.client && event.client === this;
    if (!(goodTarget || goodRelTarget || goodClient)) {
      return false;
    }
    return true;
  };
  /**
 * Handle the actual dispatching of events to a client instance.
 *
 * @returns `this`
 * @private
 */
  var _clientDispatchCallbacks = function(event) {
    if (!(typeof event === "object" && event && event.type)) {
      return;
    }
    var async = _shouldPerformAsync(event);
    var wildcardTypeHandlers = _clientMeta[this.id] && _clientMeta[this.id].handlers["*"] || [];
    var specificTypeHandlers = _clientMeta[this.id] && _clientMeta[this.id].handlers[event.type] || [];
    var handlers = wildcardTypeHandlers.concat(specificTypeHandlers);
    if (handlers && handlers.length) {
      var i, len, func, context, eventCopy, originalContext = this;
      for (i = 0, len = handlers.length; i < len; i++) {
        func = handlers[i];
        context = originalContext;
        if (typeof func === "string" && typeof _window[func] === "function") {
          func = _window[func];
        }
        if (typeof func === "object" && func && typeof func.handleEvent === "function") {
          context = func;
          func = func.handleEvent;
        }
        if (typeof func === "function") {
          eventCopy = _extend({}, event);
          _dispatchCallback(func, context, [ eventCopy ], async);
        }
      }
    }
    return this;
  };
  /**
 * Prepares the elements for clipping/unclipping.
 *
 * @returns An Array of elements.
 * @private
 */
  var _prepClip = function(elements) {
    if (typeof elements === "string") {
      elements = [];
    }
    return typeof elements.length !== "number" ? [ elements ] : elements;
  };
  /**
 * Add a `mouseover` handler function for a clipped element.
 *
 * @returns `undefined`
 * @private
 */
  var _addMouseHandlers = function(element) {
    if (!(element && element.nodeType === 1)) {
      return;
    }
    var _suppressMouseEvents = function(event) {
      if (!(event || (event = _window.event))) {
        return;
      }
      if (event._source !== "js") {
        event.stopImmediatePropagation();
        event.preventDefault();
      }
      delete event._source;
    };
    var _elementMouseOver = function(event) {
      if (!(event || (event = _window.event))) {
        return;
      }
      _suppressMouseEvents(event);
      ZeroClipboard.focus(element);
    };
    element.addEventListener("mouseover", _elementMouseOver, false);
    element.addEventListener("mouseout", _suppressMouseEvents, false);
    element.addEventListener("mouseenter", _suppressMouseEvents, false);
    element.addEventListener("mouseleave", _suppressMouseEvents, false);
    element.addEventListener("mousemove", _suppressMouseEvents, false);
    _mouseHandlers[element.zcClippingId] = {
      mouseover: _elementMouseOver,
      mouseout: _suppressMouseEvents,
      mouseenter: _suppressMouseEvents,
      mouseleave: _suppressMouseEvents,
      mousemove: _suppressMouseEvents
    };
  };
  /**
 * Remove a `mouseover` handler function for a clipped element.
 *
 * @returns `undefined`
 * @private
 */
  var _removeMouseHandlers = function(element) {
    if (!(element && element.nodeType === 1)) {
      return;
    }
    var mouseHandlers = _mouseHandlers[element.zcClippingId];
    if (!(typeof mouseHandlers === "object" && mouseHandlers)) {
      return;
    }
    var key, val, mouseEvents = [ "move", "leave", "enter", "out", "over" ];
    for (var i = 0, len = mouseEvents.length; i < len; i++) {
      key = "mouse" + mouseEvents[i];
      val = mouseHandlers[key];
      if (typeof val === "function") {
        element.removeEventListener(key, val, false);
      }
    }
    delete _mouseHandlers[element.zcClippingId];
  };
  /**
 * Creates a new ZeroClipboard client instance.
 * Optionally, auto-`clip` an element or collection of elements.
 *
 * @constructor
 */
  ZeroClipboard._createClient = function() {
    _clientConstructor.apply(this, _args(arguments));
  };
  /**
 * Register an event listener to the client.
 *
 * @returns `this`
 */
  ZeroClipboard.prototype.on = function() {
    return _clientOn.apply(this, _args(arguments));
  };
  /**
 * Unregister an event handler from the client.
 * If no `listener` function/object is provided, it will unregister all handlers for the provided `eventType`.
 * If no `eventType` is provided, it will unregister all handlers for every event type.
 *
 * @returns `this`
 */
  ZeroClipboard.prototype.off = function() {
    return _clientOff.apply(this, _args(arguments));
  };
  /**
 * Retrieve event listeners for an `eventType` from the client.
 * If no `eventType` is provided, it will retrieve all listeners for every event type.
 *
 * @returns array of listeners for the `eventType`; if no `eventType`, then a map/hash object of listeners for all event types; or `null`
 */
  ZeroClipboard.prototype.handlers = function() {
    return _clientListeners.apply(this, _args(arguments));
  };
  /**
 * Event emission receiver from the Flash object for this client's registered JavaScript event listeners.
 *
 * @returns For the "copy" event, returns the Flash-friendly "clipData" object; otherwise `undefined`.
 */
  ZeroClipboard.prototype.emit = function() {
    return _clientEmit.apply(this, _args(arguments));
  };
  /**
 * Register clipboard actions for new element(s) to the client.
 *
 * @returns `this`
 */
  ZeroClipboard.prototype.clip = function() {
    return _clientClip.apply(this, _args(arguments));
  };
  /**
 * Unregister the clipboard actions of previously registered element(s) on the page.
 * If no elements are provided, ALL registered elements will be unregistered.
 *
 * @returns `this`
 */
  ZeroClipboard.prototype.unclip = function() {
    return _clientUnclip.apply(this, _args(arguments));
  };
  /**
 * Get all of the elements to which this client is clipped.
 *
 * @returns array of clipped elements
 */
  ZeroClipboard.prototype.elements = function() {
    return _clientElements.apply(this, _args(arguments));
  };
  /**
 * Self-destruct and clean up everything for a single client.
 * This will NOT destroy the embedded Flash object.
 *
 * @returns `undefined`
 */
  ZeroClipboard.prototype.destroy = function() {
    return _clientDestroy.apply(this, _args(arguments));
  };
  /**
 * Stores the pending plain text to inject into the clipboard.
 *
 * @returns `this`
 */
  ZeroClipboard.prototype.setText = function(text) {
    ZeroClipboard.setData("text/plain", text);
    return this;
  };
  /**
 * Stores the pending HTML text to inject into the clipboard.
 *
 * @returns `this`
 */
  ZeroClipboard.prototype.setHtml = function(html) {
    ZeroClipboard.setData("text/html", html);
    return this;
  };
  /**
 * Stores the pending rich text (RTF) to inject into the clipboard.
 *
 * @returns `this`
 */
  ZeroClipboard.prototype.setRichText = function(richText) {
    ZeroClipboard.setData("application/rtf", richText);
    return this;
  };
  /**
 * Stores the pending data to inject into the clipboard.
 *
 * @returns `this`
 */
  ZeroClipboard.prototype.setData = function() {
    ZeroClipboard.setData.apply(this, _args(arguments));
    return this;
  };
  /**
 * Clears the pending data to inject into the clipboard.
 * If no `format` is provided, all pending data formats will be cleared.
 *
 * @returns `this`
 */
  ZeroClipboard.prototype.clearData = function() {
    ZeroClipboard.clearData.apply(this, _args(arguments));
    return this;
  };
  /**
 * Gets a copy of the pending data to inject into the clipboard.
 * If no `format` is provided, a copy of ALL pending data formats will be returned.
 *
 * @returns `String` or `Object`
 */
  ZeroClipboard.prototype.getData = function() {
    return ZeroClipboard.getData.apply(this, _args(arguments));
  };
  if (typeof define === "function" && define.amd) {
    define(function() {
      return ZeroClipboard;
    });
  } else if (typeof module === "object" && module && typeof module.exports === "object" && module.exports) {
    module.exports = ZeroClipboard;
  } else {
    window.ZeroClipboard = ZeroClipboard;
  }
})(function() {
  return this || window;
}());
(function($) {
	$.chai={
		ini:function (options){
			return $.chai.ready(options);
		},
		core:{
		}
	};
})(jQuery);
(function($) {
	$.chai.core.util = {
		autosaved:false,
		t:null,
		autoSaver:function(){
			$.chai.core.util.t=window.setInterval(function() {
				$.each($('form.autosave'),function() {
					var self = $(this);
					if($(".dialog_message.autosave").length<=0){
						$("body").append("<div class='dialog_message ui-state-highlight autosave'>");
					}
					$(".dialog_message.autosave").html("Auto saving");
					$(".dialog_message.autosave").show();
					$.ajax({
						url: $(this).attr("action"),
						data: "autosave=true&autosaved="+$.chai.core.util.autosaved+"&"+$(this).serialize(),
						type: "POST",
						success: function(data){
							$(".dialog_message.autosave").removeClass('ui-state-error');
							if(data && data === "success") {
								$.chai.core.util.autosaved=true;
								$(".dialog_message.autosave").html("Auto saved form");
								self.trigger('reinitialize.areYouSure');
								$(".dialog_message.autosave").show();
								setTimeout(function(){$(".dialog_message.autosave").fadeOut("500");},"1000");
							}else if(data && data === "unsaved") {
								window.clearInterval($.chai.core.util.t);
								$.chai.core.util.t=null;
								$(".dialog_message.autosave").html("Will not auto save untill the item is saved.");
								$(".dialog_message.autosave").show();
								setTimeout(function(){$(".dialog_message.autosave").fadeOut("500");},"4000");
								return;
							}else{
								$(".dialog_message.autosave").addClass('ui-state-error');
								$(".dialog_message.autosave").html("Failed to auto save.  Will try again in 10sec.");
								$(".dialog_message.autosave").show();
								setTimeout(function(){$(".dialog_message.autosave").fadeOut("500");},"4000");
							}

						},
						statusCode: {
							500: function() {
								window.clearInterval($.chai.core.util.t);
								$.chai.core.util.t=null;
								$(".dialog_message.autosave").addClass('ui-state-error');
								$(".dialog_message.autosave").html("Failed to auto save - 500 error");
								$(".dialog_message.autosave").show();
								setTimeout(function(){$(".dialog_message.autosave").fadeOut("500");},"4000");
							}
						}
					});
				});
			}, 10 * 1000);	
			
		},
		start_autoSaver:function(){
			$('form.autosave').areYouSure({
				'silent':true,
				change: function() {
					// Enable save button only if the form is dirty. i.e. something to save.
					if ($(this).hasClass('dirty')) {
						$.chai.core.util.autoSaver();
					} else {
						window.clearInterval($.chai.core.util.t);
						$.chai.core.util.t=null;
					}
				}
			});
		},
		
		unhighlight:function(){
			$('.highlighted').animate({
				"background-color":"#FFF",
				},1500,function(){
					$(this).removeClass("highlighted");
			});
		},
		
		
		alais_scruber:function (input,jObj){
			var str = input.val();
				str=str.split(' ').join('-');
				str=str.split('&').join('-and-');
				str=str.replace(/[^A-Za-z0-9\-_]/g, "");
				str=str.split('--').join('-');
				str=str.split('__').join('_');
				str=str.split('/').join('');
			jObj.val(str.toLowerCase());
		},
		turnon_alias:function (input,jObj){
			input.off().on("keyup",function(){
				$.chai.core.util.alais_scruber(input,jObj);
			});
		},
		make_maskes:function (){
			$.mask.definitions['~'] = "[+-]";
			$('[type="date"],[rel="date"]').mask("99/99/9999",{completed:function(){ }});
			$('#tab_date').mask("9999",{completed:function(){ }});
			/*
			$("#phone").mask("(999) 999-9999");
			$("#phoneExt").mask("(999) 999-9999? x99999");
			$("#iphone").mask("+33 999 999 999");
			$("#tin").mask("99-9999999");
			$("#ssn").mask("999-99-9999");
			$("#product").mask("a*-999-a999", { placeholder: " " });
			$("#eyescript").mask("~9.99 ~9.99 999");
			$("#po").mask("PO: aaa-999-***");
			$("#pct").mask("99%");
			*/
			$("input").blur(function() {
				//$("#info").html("Unmasked value: " + $(this).mask());
			}).dblclick(function() {
				$(this).unmask();
			});
			$( "label i[title]" ).tooltip();
			$( '[type="date"],[rel="date"]' ).datepicker();
		},

		set_up_list_deletion:function(){
			$('.deletion').off().on("click",function(e){
				e.preventDefault();
				e.stopPropagation();
				var targ = $(this);
				$.chai.core.util.confirmation_message("Are you sure you want send this item to the trashbin?",{
					"yes":function(){
						window.location=targ.attr("href");
					},
					"no":function(){}
				});
			});
		},



		setup_viewlog:function(){
			$('#viewlog').on('click',function(e){
				e.preventDefault();
				e.stopPropagation();
				$.get('/center/retriveLog.castle',{'id':$(this).data('item_id')},function(html){
					if($('#view_log_area').length<=0){
						$('body').append('<div id="view_log_area">');	
					}
					$('#view_log_area').html(html);
					$( "#view_log_area" ).dialog({
						autoOpen: true,
						resizable: false,
						width: $(window).width()*0.8,
						height:$(window).height()*0.8,
						modal: true,
						draggable : false,
						buttons: {
							Close: function() {
								$( this ).dialog( "close" );
							}
						},
						create:function(){
							$('body').css({overflow:"hidden"});
							//$(".ui-dialog-buttonpane").remove();
						},
						close: function() {
							$.chai.core.util.close_dialog_modle($( "#view_log_area" ));
						}
					});
				});
			});
		},
		
		setup_curate:function(){
			/*$('#curate').on('click',function(e){
				e.preventDefault();
				e.stopPropagation();
				//$.get('/center/curate.castle',{'id':$(this).data('item_id'),'type':$(this).data('type')},function(){});
				window.location = '/center/curate.castle?id='+$(this).data('item_id')+'&type='+$(this).data('type');
			});*/
		},		
		
		
		
		setup_refs:function(){
			$('.add_ref').on("click",function(e){
				e.preventDefault();
				e.stopPropagation();
				//var targetrow = $(this).closest("grid");
				
				var datatable = $(this).closest('.datagrid').dataTable({
					"aaSorting": [[1,'asc']],
					"columnDefs": [ {
					  "targets"  : 'no-sort',
					  "orderable": false,
					}]
				});
				//var count = datatable.find("tbody").find("tr").length;
				datatable.dataTable().fnAddData( [
					'$part.baseid',
					'<input type="hidden" name="references[$count].baseid" value="$part.baseid" class="drug_item"/>$part.type',
					'$part.name',
					'<a href="$item.url" class="ref_link"><i class="icon-external-link"></i></a>',
					'$item.note',
					'<a href="substance.castle?id=$part.baseid" class="button small inline_edit" data-type="substance">Edit</a> | <a href="#" class="button xsmall crimson defocus removal">Remove</a>' ]
				);
				$.chai.core.util.setup_ref_copy();
			});
		},
		setup_ref_copy:function(){
			$.each($(".ref_text:not(.cp_ready)"),function(){
				var ref_btn = this;
				$(ref_btn).on('click',function(e){
					e.preventDefault();
					e.stopPropagation();
					$('.active_copy').removeClass('active_copy');
					$(ref_btn).next('.copy_area').addClass('active_copy');
					$(ref_btn).next('.copy_area').find('.icon-copy').on('click',function(){
						$('.active_copy').removeClass('active_copy');
					});
					
					
					
				});
				
				/*var client = new ZeroClipboard( ref_btn );
				client.on( "ready", function(  ) {
					$(ref_btn).addClass("cp_ready");
					client.on( "aftercopy", function( event ) {
						alert("Copied text to clipboard: " + event.data["text/plain"] );
					});
				});*/
			});
		},
		
		
		setting_item_pub:function(parentObj){
			parentObj.find( ".pubstate" ).buttonset();
			if(parentObj.find('.pubstate :radio:checked').val()<1){
				parentObj.find('#noting').next("label").show();
			}else{
				parentObj.find('#noting').next("label").hide();
			}
			parentObj.find('.pubstate :radio').change(function () {
				parentObj.find('.pubstate :radio').next("label").find("i").removeClass("icon-check-empty").removeClass("icon-check");
				parentObj.find('.pubstate :radio').not(":checked").next("label").find("i").addClass("icon-check-empty");
				parentObj.find('.pubstate :radio:checked').next("label").find("i").addClass("icon-check");
				if(parentObj.find('.pubstate :radio:checked').val()<1){
					parentObj.find('#noting').next("label").show();
				}else{
					parentObj.find('#noting').next("label").hide();
				}
				if(parentObj.find(".notearea").find("textarea").val()!==""){
					parentObj.find('#noting').next("label").find("i").addClass("icon-file-text-alt");
				}else{
					parentObj.find('#noting').next("label").find("i").addClass("icon-file-alt");
				}
				
			});
			parentObj.find('#noting').button();
			parentObj.find('#noting').change(function () {
				parentObj.find( ".notearea" ).dialog({
					autoOpen: true,
					height: 300,
					width: 350,
					modal: true,
					buttons: {
						"CLEAR Note": function() {
							$(this).find("textarea").val( "" );
							$( this ).dialog( "close" );
						},
						Accept: function() {
							$( this ).dialog( "close" );
						},
						Cancel: function() {
							$( this ).dialog( "close" );
						}
					},
					close: function() {
						parentObj.find('.noted').find("label").removeClass("ui-state-active");
						var value=$(this).find("textarea").val();
						parentObj.find("[name='item.content']").val(value);
						parentObj.find( "#noting" ).attr("checked",false);
						parentObj.find('#noting').next("label").find("i").removeClass("icon-file-text-alt").removeClass("icon-file-alt");
						if(value!==""){
							parentObj.find('#noting').next("label").find("i").addClass("icon-file-text-alt");
						}else{
							parentObj.find('#noting').next("label").find("i").addClass("icon-file-alt");
						}
						$( this ).dialog( "destroy" );
					}
				});
			});
		},
	
		popup_message:function (html_message,clean){
			if(typeof(clean)==="undefined"){
				clean=false;
			}
			if($("#mess").length<=0){
				$('body').append('<div id="mess">');
			}
			$("#mess").html( (typeof html_message === 'string' || html_message instanceof String) ? html_message : html_message.html() );
			$( "#mess" ).dialog({
				autoOpen: true,
				resizable: false,
				width: 350,
				minHeight: 25,
				modal: true,
				draggable : false,
				create:function(){
					if(clean){
						$('.ui-dialog-titlebar').remove();
						$(".ui-dialog-buttonpane").remove();
					}
					$('body').css({overflow:"hidden"});
				},
				buttons:{
					Ok:function(){
						$( this ).dialog( "close" );
					}
				},
				close: function() {
					$.chai.core.util.close_dialog_modle($( "#mess" ));
				}
			});
		},
		
		
		confirmation_message:function (html_message,callback){
			if($("#mess").length<=0){
				$('body').append('<div id="mess">');
			}
			$("#mess").html( (typeof html_message === 'string' || html_message instanceof String) ? html_message : html_message.html() );
			$( "#mess" ).dialog({
				autoOpen: true,
				resizable: false,
				width: 350,
				minHeight: 25,
				modal: true,
				draggable : false,
				create:function(){
					$("#mess").find('.ui-dialog-titlebar').remove();
					$('body').css({overflow:"hidden"});
				},
				buttons:{
					Yes:function(){
						if($.isFunction(callback.yes)){
							callback.yes();
						}
						$( this ).dialog( "close" );
					},
					No: function() {
						if($.isFunction(callback.no)){
							callback.no();
						}
						$( this ).dialog( "close" );
					}
				},
				close: function() {
					$.chai.core.util.close_dialog_modle($( "#mess" ));
				}
			});
		},

		add_item_popup:function (type,inlist,use,id){
			if(typeof(use)==="undefined"){ 
				use = ["new","list"];
			}
			if($("#drug_form").length===0){
				$("#staging").append("<div id='drug_form'><div id='drug_list'></div><div id='drug_item'></div></div>");
			}
	
			var buttons = "";
	
	
			$.ajax({cache: false,
			   url:"/center/"+type+"s.castle",
			   data:{"skiplayout":1,"exclude":inlist,typed_ref:$('[name="typed_ref"]').val()},
			   success: function(data){
					if($.inArray("list", use)>-1){
						$("#drug_list").html(data);
						buttons += "<a href='#drug_list' id='drug_list_tab' class='popuptab button med active'>List</a>";
					}
					$.ajax({cache: false,
					   url:"/center/"+type+".castle",
					   data:{"skiplayout":1,"id":typeof(id)==="undefined"?"":id,typed_ref:$('[name="typed_ref"]').val()},
					   success: function(data){
							if($.inArray("new", use)>-1){
								$("#drug_item").html(data);
								buttons += "<a href='#drug_item' id='drug_item_tab' class='popuptab button med'>New</a>";
							}
							$( "#drug_form" ).dialog({
								autoOpen: true,
								resizable: false,
								width: $(window).width()-50,
								height: $(window).height()-50,
								modal: true,
								draggable : false,
								buttons: {
									Cancel: function() {
										$( this ).dialog( "close" );
									}
								},
								create:function(){

									$( "#mess" ).dialog( "destroy" );
									$( "#mess" ).remove();
									if($("#drug_item").html()!=="" && $("#drug_list").html()!==""){
										$("#drug_form").closest('.ui-dialog').find('.ui-dialog-title').append(buttons);
										$("#drug_item").hide();
									}
									//setup_tabs();
									
									$('body').css({overflow:"hidden"});
									$(".ui-dialog-buttonpane").remove();
									
									if($("#drug_list").html().length>0){
										$.chai.core.util.make_popup_datatable(type);
									}
				
									$(".popuptab").off().on("click",function(e){
										e.preventDefault();
										e.stopPropagation();
										var id = $(".popuptab.active").attr("href");
										$(id).hide();
										$(".popuptab.active").removeClass('active');
										$(this).addClass('active');
										id = $(this).attr("href");
										$(id).show();	
										
									});
									$.chai.core.util.set_up_form(type,inlist,use);
									$.chai.clinical.activate_adverse_ui();
								},
								close: function() {
									$.chai.core.util.close_dialog_modle($( "#drug_form" ));
									$.chai.core.util.last_datatable=null;
								}
							});
							$.chai.core.util.set_diamodle_resizing($( "#drug_form" ));	
						}
					});
				}
			});
		},
		set_diamodle_resizing:function(jObj){
			$(window).resize(function(){
				jObj.dialog('option', {
					width: $(window).width()-50,
					height: $(window).height()-50
				});
			});
		},
		close_dialog_modle: function(jObj){
			jObj.dialog( "destroy" );
			jObj.remove();
			if($(".ui-dialog.ui-widget.ui-widget-content").length<=0){
				$('body').css({overflow:"auto"});
			}
		},

		moa_dmpk_setup:function (){
			$.each($('.has_moa_dmpk:not(.activated)'),function(){
				var tar = $(this);
				$(this).addClass('activated');
				var dep = tar.closest('.moa_dmpk_block').find('.moa_dmpk');
				if(tar.val()===""){
					dep.hide();
				}
				tar.on("keyup",function(){
					if(tar.val()===""){
						dep.find(':selected').attr('selected',false);
						dep.hide();
					}else{
						dep.show();
					}
				});
			});
		},

		apply_a_taxed_add:function (type,select_target,make_tax){
			$('a.tax_add').on('click',function(e){
				e.preventDefault();
				e.stopPropagation();
				$.chai.core.util.start_taxed_add(type,select_target,make_tax);
			});
		},
		start_taxed_add:function (type,select_target,make_tax){
	
			if(select_target==="undefined"){
				select_target = $($(this).data('select'));
			}
			if($( "#taxonomyitem" ).length<=0){
				$('body').append("<div id='taxonomyitem'>");
			}
			var dialog_obj = $("#taxonomyitem");
			if(type==="undefined"){
				type = $(this).data('type');
			}
	
			$.ajax({cache: false,
			   url:"/admin/edit_taxonomy.castle",
			   data:{"skiplayout":1,"type":type},
			   success: function(data){
					dialog_obj.html(data);
					dialog_obj.dialog({
						autoOpen: true,
						resizable: false,
						//width: $(window).width()*.40,
						//height: $(window).height()*.50,
						modal: true,
						draggable : false,
						create:function(){
							$('body').css({overflow:"hidden"});
							$("#taxonomyitem .ui-dialog-buttonpane").remove();
							dialog_obj.find('input[name$=".alias"]').closest('p').css({"display":"none"});
						},
						open:function(){
							$.chai.core.util.turnon_alias(dialog_obj.find('input[name$=".name"]'),dialog_obj.find('input[name$=".alias"]'));
							if(typeof(make_tax)==="undefined"){
								$.chai.core.util.make_a_tax_form(select_target,function(){
									$.chai.core.util.alais_scruber(dialog_obj.find('input[name$=".name"]'),dialog_obj.find('input[name$=".alias"]'));
								});
							}
							if(typeof(make_tax)==="function"){
								make_tax(select_target);
							}
							},
						close: function() {
							$.chai.core.util.close_dialog_modle($( "#taxonomyitem" ));
						}
					});
					$(window).resize(function(){
						var w = $(window).width() * (0.25);
						var h = $(window).height() * (0.25);
						$("#taxonomyitem" ).dialog('option', { width: w,  height: h });
					});
				}
			});
		
		},
		make_tax_form:function (select_target,callback,secselect_target){
			var target_form = $("#taxonomyitem form");
			target_form.find('[type="submit"]').on("click",function(e){
				e.preventDefault();
				e.stopPropagation();
				$('#taxonomyitem form').on("change",function(){
					var test_empty = true;
					$.each($('input,select'),function(){
						if($(this).not(":hidden").val()!==""&&$(this).not(":hidden").find(":selected").val()!==""){
							test_empty = false;
						}
					});
					$('#taxonomyitem form input[name="empty"]').val(test_empty+"");
				});
		
				if(!target_form.find('input[name="empty"]').val()){
					if(typeof(callback)!=="undefined"){
						callback();
					}
					var form_data = target_form.find( "input, textarea, select" ).serializeArray();
					$.ajax({cache: false,
					   url:"/admin/update_taxonomy.castle?ajax=true",
					   data:form_data,
					   dataType : "json",
					   success: function(returndata){
							if(returndata.alias!==""){
								var op = '<option value="'+ returndata.alias +'" '+(select_target.is(secselect_target)?"selected":"")+' '+(select_target.is(secselect_target)?"selected":"")+' data=" -- '+ returndata.alias +'" selected>'+returndata.name +'</option>';
								
								if(select_target.is('.adverse_events')){
									op = '<option value="'+ returndata.baseid +'" data-baseid="'+ returndata.baseid +'" data-alias="'+ returndata.alias +'" data-content=""  selected >'+returndata.name +'</option>';
								}
								select_target.find('.add').before(op);
								$( "#taxonomyitem" ).dialog( "destroy" );
								$( "#taxonomyitem" ).remove();
								$.chai.core.util.popup_message($("<span><h5>You have added a  new taxonomy!</h5>It has also selected for you</span>"));
								if(select_target.is('.adverse_events')){
									select_target.find(':selected:not([value="'+ returndata.baseid +'"])').removeAttr('selected');
									select_target.trigger('change');
								}
								$('form[name="entry_form"] :input:first').trigger("click");
							}else{
								$.chai.core.util.popup_message($("<span>failed to save, try again.</span>"));
							}
						}
					});
				}
			});
		},
		make_a_tax_form:function (select_target,callback){
			var target_form = $("#taxonomyitem form");
			
				$('#taxonomyitem form').on("change",function(){
					var test_empty = true;
					$.each($('input,select'),function(){
						if($(this).not(":hidden").val()!==""&&$(this).not(":hidden").find(":selected").val()!==""){
							test_empty = false;
						}
					});
					$('#taxonomyitem form input[name="empty"]').val(test_empty+"");
				});
			
			target_form.find('[type="submit"]').on("click",function(e){
				e.preventDefault();
				e.stopPropagation();
	
		
				if(!target_form.find('input[name="empty"]').val()){
					if(typeof(callback)==="function"){
						callback();
					}
					var form_data = target_form.find( "input, textarea, select" ).serializeArray();
	
					$.ajax({cache: false,
					   url:"/center/update_taxonomy.castle?ajax=true",
					   data:form_data,
					   dataType : "json",
					   success: function(returndata){
							if(returndata.alias!==""){
								if(typeof(select_target)==="function"){
									select_target(returndata);
								}
								
								if(typeof(select_target)!=="undefined" && typeof(select_target)!=="function"){
									select_target.find('option:first').before('<option value="'+ returndata.alias +'" selected>'+returndata.name +'</option>');
								}
								$( "#taxonomyitem" ).dialog( "destroy" );
								$( "#taxonomyitem" ).remove();
								$.chai.core.util.popup_message($("<span><h5>You have added a  new taxonomy!</h5>It has also selected for you</span>"));
								$('form[name="entry_form"] :input:first').trigger("change");
							}else{
								$.chai.core.util.popup_message($("<span>failed to save, try again.</span>"));
							}
						}
					});
				}
			});
		},
		apply_tax_request:function (){
			$.each($('.requested_taxed:not(.activated)'),function(){
				var tar = $(this);
				tar.addClass('activated');
				if(tar.find('.add').length<=0){
					tar.find('option:last').after('<option value="" class="add">Request new option</option>');
				}
			});
		
			$('.requested_taxed').on('change',function(){
					var select_target = $(this);
					var target = $(this).find('option:selected');
					if(!target.hasClass("add")){
						return;
					}
			
					target.removeAttr("selected");
					
					
					if($( "#taxonomyitem" ).length<=0){
						$('body').append("<div id='taxonomyitem'>");
					}
					var data='<h3>Make a request for a new item</h3><lable>Name:</lable><input type="text" value=""/><br/><br/><input type="submit" value="Subbmit Request"/>';
					var dialog_obj = $("#taxonomyitem");
						dialog_obj.html(data);
						dialog_obj.dialog({
								autoOpen: true,
								resizable: false,
								width: 450,
								//height: $(window).height()*.50,
								modal: true,
								draggable : false,
								create:function(){
									$('body').css({overflow:"hidden"});
									$(".ui-dialog-buttonpane").remove();
									dialog_obj.find('input[name$=".alias"]').closest('p').css({"display":"none"});
									$.chai.core.util.make_tax_form(select_target,function(){
										$.chai.core.util.alais_scruber(dialog_obj.find('input[name$=".name"]'),dialog_obj.find('input[name$=".alias"]'));
									});
								},
								open:function(){
									$.chai.core.util.turnon_alias(dialog_obj.find('input[name$=".name"]'),dialog_obj.find('input[name$=".alias"]'));
									},
								close: function() {
									$.chai.core.util.close_dialog_modle($( "#taxonomyitem" ));
								}
							});
							
			});
		},
		apply_taxed_add:function (){
			/* add taxonomy */
			$.each($('.taxed:not(.activated)'),function(){
				var tar = $(this);
				tar.addClass('activated');
				if(tar.find('.add').length<=0){
					tar.find('option:last').after('<option value="" class="add">Add new option</option>');
				}
			});
			$('.taxed').on('change',function(){
				var select_target = $(this);
				var target = $(this).find('option:selected');
				if(!target.hasClass("add")){
					return;
				}
		
				target.removeAttr("selected");
				
				
				if($( "#taxonomyitem" ).length<=0){
					$('body').append("<div id='taxonomyitem'>");
				}
				var dialog_obj = $("#taxonomyitem");
				
				var secselect_target;
				var rel = select_target.attr("rel");
				var s_id = select_target.attr("id");
				var type = rel !=="" && typeof rel !=="undefined" ? rel : s_id;
				var attr=select_target.attr("rel");
				if (typeof attr !== typeof undefined && attr !== false) {
					secselect_target = $('[rel="'+type+'"]');
				}
				$.ajax({cache: false,
				   url:"/admin/edit_taxonomy.castle",
				   data:{"skiplayout":1,"type":type},
				   success: function(data){
						dialog_obj.html(data);
						dialog_obj.dialog({
								autoOpen: true,
								resizable: false,
								modal: true,
								draggable : false,
								create:function(){
									$('body').css({overflow:"hidden"});
									$(".ui-dialog-buttonpane").remove();
									dialog_obj.find('input[name$=".alias"]').closest('p').css({"display":"none"});
									$.chai.core.util.make_tax_form(select_target,function(){
										$.chai.core.util.alais_scruber(dialog_obj.find('input[name$=".name"]'),dialog_obj.find('input[name$=".alias"]'));
									},secselect_target);
								},
								open:function(){
									$.chai.core.util.turnon_alias(dialog_obj.find('input[name$=".name"]'),dialog_obj.find('input[name$=".alias"]'));
									},
								close: function() {
									$.chai.core.util.close_dialog_modle($( "#taxonomyitem" ));
								}
							});
						$(window).resize(function(){
							$("#taxonomyitem" ).dialog('option', { width: $(window).width()*0.25,  height: $(window).height()*0.25,});																													
						});
					}
				});
			});
		},




		get_table_ids:function (datagrid){
			var inlist ="";
			var nNodes = datagrid.dataTable().fnGetNodes( );
			$.each(nNodes,function(i,v){
				var item = $(v).find('input.list_item');
				inlist+=(inlist===""?"":",")+item.val();
			});
			return inlist;
		},
		get_select_ids:function (select){
			var inlist ="";
			$.each(select.find('option'),function(){
				inlist+=(inlist===""?"":",")+$(this).val();
			});
			return inlist;
		},

		set_up_form:function (type){
			$.chai.core.util.make_maskes();
			$.chai.core.util.moa_dmpk_setup();
			$.chai.core.util.apply_tax_request();
			$.chai.core.util.apply_taxed_add();
			$.chai.core.util.setting_item_pub($(".ui-dialog"));
			$('input[name^="post"]').val($('input[name="item.baseid"]').val());
	
			$("#load_file").on("click",function(){ $(".load_file").toggleClass("active"); });
			
			$("#drug_form [type='submit']").on("click",function(e){
				var form = $(this).closest("form");
				if (form.find(':invalid').length<=0) {
					e.preventDefault();
					e.stopPropagation();
					$.post(form.attr("action")+"?skiplayout=1&ajaxed_update=1",form.serialize(),function(){//(data){
						//var parts= data.split(',');
						$( "#drug_form" ).dialog( "destroy" );
						$( "#drug_form" ).remove();
						$(".add_to_list[data-type='"+type+"']").trigger("click");
					});
				}
			});	
		},

		ini_modaltable_to_table:function (datatable,type){
			$('.additem').off().on('click',function(e){
				e.preventDefault();
				e.stopPropagation();
				var trigger = $(this);
				var targetrow = trigger.closest('tr');
				var baseid = targetrow.data("baseid");
				
				var count = datatable.find("tbody").find("tr").length+1;
				if(type==="reference"){
					count = $(".main .ref.dataTable tbody tr").length + 1;
					if($(".main .ref.dataTable tbody tr td.dataTables_empty").length){
						count--;
					}
				}
				var tdCount = targetrow.find("td").length;
				//alert(tdCount);
				var tableData = [];
				var name = (type==="reference"?"":"item.")+type+'s['+(count-1)+'].baseid';
				var html = targetrow.find("td:first").text() + '<input type="hidden" name="'+name+'" value="'+baseid+'" class="drug_item list_item"/>';
				tableData.push( html );
				tableData.push( targetrow.find("td:first").next('td').text() ); 
				if(tdCount>3){
					tableData.push( targetrow.find("td:first").next('td').next('td').text() ); 
				}
				if(tdCount>4){
					tableData.push( targetrow.find("td:first").next('td').next('td').next('td').text() ); 
				}
				var cp_btn;
				if(type==="reference"){
					var id = targetrow.find("td:first").text();
					cp_btn='<button class="ref_text" data-clipboard-text="#{{REF '+id+'}}" title="Click to copy me.">Copy Ref</button>';
				}
				tableData.push(
					'<a href="#" class="button xsmall crimson defocus removal"><i class="icon-remove" title="Remove"></i></a>'+cp_btn
				); 
	
	
				if(type==="reference"){
					if($('.main .ref.dataTable [value="'+baseid+'"]').length<=0){
						$(".main .ref.dataTable").dataTable().fnAddData( tableData );
						$('.main .ref.dataTable [value="'+baseid+'"]').closest('tr').find('td:eq(2),td:eq(3)').addClass('no_overflow');
					}
				}else{
					if($('[data-active_grid="true"] [value="'+baseid+'"]').length<=0){
						$("[data-active_grid='true']").dataTable().fnAddData( tableData );
					}
				}
				
				targetrow.fadeOut( "75" ,function(){ datatable.fnDeleteRow( datatable.fnGetPosition( targetrow.get(0) ) ); });
				
				$("#drug_form").append("<span class='dialog_message ui-state-highlight'>Added to this "+$("#header_title").text()+"</span>");
				
				setTimeout(function(){$(".dialog_message").fadeOut("500");},"1000");
				if(type==="reference"){
					$.chai.core.util.setup_ref_copy();
				}
				$("ul .display.datagrid.dataTable .removal").off().on("click",function(e){
					e.preventDefault();
					e.stopPropagation();
					var targ = $(this);
					$.chai.core.util.confirmation_message("Are you sure?",{
						"yes":function(){
							$.chai.core.util.remove_datatable_current_row(targ);
						},
						"no":function(){}
					});
				});
			});
		},

		//var parent_datagrid = null;
		last_datatable:null,
		make_popup_datatable:function (type){
			$.each($('.datagrid:not(.dataTable)'),function(){
				var datatable = $(this);
				datatable.dataTable({ 
					"bJQueryUI": true,
					"sPaginationType": "full_numbers",
					"fnDrawCallback": function() {//(oSettings ) {
						$.chai.core.util.ini_modaltable_to_table(datatable,type);
					},
					"columnDefs": [ {
					  "targets"  : 'no-sort',
					  "orderable": false,
					}]
				});
				datatable.on( 'draw.dt', function () {
					$.chai.core.util.ini_modaltable_to_table(datatable,type);
				});

				$.chai.core.util.last_datatable=datatable;
				$.chai.core.util.ini_modaltable_to_table(datatable,type);
			});
		},
		make_dataTables:function(){
			if($('.datagrid:not(.dataTable)').length){
				var datagrids = $('.datagrid:not(.dataTable)');
				$.each(datagrids,function(){
					var datatable = $(this);
					datatable.dataTable( {
						"bJQueryUI": true,
						"bAutoWidth": false,
						"sPaginationType": "full_numbers",
						"aaSorting": [[1,'asc']],
						"columnDefs": [ {
						  "targets"  : 'no-sort',
						  "orderable": false,
						}]
					});
					datatable.on( 'draw.dt', function () {
						$.chai.core.util.ini_modaltable_to_table(datatable,datagrids.closest('.dataTables_wrapper').next(".add_to_list").data('type'));
						$.chai.core.util.ini_dataTable_removals(datatable.find(".removal"));
						$.chai.core.util.set_up_list_deletion();
					});
				});
				
				var addTos = $(".add_to_list");
				$.each(addTos,function(){
					var targ = $(this);
					targ.on("click",function(e){
						e.preventDefault();
						e.stopPropagation();
						var targ = $(this);
						var type = targ.data('type');
						
						var focused_grid = targ.prev('.dataTables_wrapper').find('.datagrid');
						$("[data-active_grid='true']").attr("data-active_grid",false);
						focused_grid.attr("data-active_grid",true);
		
						var list ="";
						if(focused_grid.find(".dataTables_empty").length<=0){
							list = $.chai.core.util.get_table_ids( focused_grid );
						}
						$.chai.core.util.popup_message('<span style="font-size: 28px;"><i class="icon-spinner icon-spin icon-large"></i> loading ... </span>',true);
						$.chai.core.util.add_item_popup(type, list, ["new","list"]);
					});
				});
				$.chai.core.util.set_up_list_deletion();
				$.chai.core.util.ini_dataTable_removals();
				
			}

		},
		ini_dataTable_removals:function(removals){
			removals = removals || $(".display.datagrid.dataTable .removal");
			$.each(removals,function(){
				$.chai.core.util.build_general_removal_button($(this));
			});
		},
		build_general_removal_button:function(jObj){
			jObj.off().on("click",function(e){
				e.preventDefault();
				e.stopPropagation();
				var targ = $(this);
				$.chai.core.util.confirmation_message("Are you sure?",{
					"yes":function(){
						$.chai.core.util.remove_datatable_current_row(targ);
					},
					"no":function(){}
				});
			});
		},
		remove_datatable_current_row:function(targ){
			var targetrow = targ.closest("tr");
			var datatable = targ.closest('table').dataTable();
			targetrow.fadeOut( "75" ,function(){ 
				var row = targetrow.get(0);
				datatable.fnDeleteRow( datatable.fnGetPosition( row ) );
			});
		}
	};

})(jQuery);

/*!
 * jQuery Cookie Plugin v1.4.0
 * https://github.com/carhartl/jquery-cookie
 *
 * Copyright 2013 Klaus Hartl
 * Released under the MIT license
 */
(function (factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as anonymous module.
		define(['jquery'], factory);
	} else {
		// Browser globals.
		factory(jQuery);
	}
}(function ($) {
	var pluses = /\+/g;
	function encode(s) {
		return config.raw ? s : encodeURIComponent(s);
	}
	function decode(s) {
		return config.raw ? s : decodeURIComponent(s);
	}
	function stringifyCookieValue(value) {
		return encode(config.json ? JSON.stringify(value) : String(value));
	}
	function parseCookieValue(s) {
		if (s.indexOf('"') === 0) {
			// This is a quoted cookie as according to RFC2068, unescape...
			s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
		}
		try {
			// Replace server-side written pluses with spaces.
			// If we can't decode the cookie, ignore it, it's unusable.
			s = decodeURIComponent(s.replace(pluses, ' '));
		} catch(e) {
			return;
		}
		try {
			// If we can't parse the cookie, ignore it, it's unusable.
			return config.json ? JSON.parse(s) : s;
		} catch(e) {}
	}
	function read(s, converter) {
		var value = config.raw ? s : parseCookieValue(s);
		return $.isFunction(converter) ? converter(value) : value;
	}
	var config = $.cookie = function (key, value, options) {
		// Write
		if (value !== undefined && !$.isFunction(value)) {
			options = $.extend({}, config.defaults, options);
			if (typeof options.expires === 'number') {
				var days = options.expires, t = options.expires = new Date();
				t.setDate(t.getDate() + days);
			}
			return (document.cookie = [
				encode(key), '=', stringifyCookieValue(value),
				options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
				options.path    ? '; path=' + options.path : '',
				options.domain  ? '; domain=' + options.domain : '',
				options.secure  ? '; secure' : ''
			].join(''));
		}
		// Read
		var result = key ? undefined : {};
		// To prevent the for loop in the first place assign an empty array
		// in case there are no cookies at all. Also prevents odd result when
		// calling $.cookie().
		var cookies = document.cookie ? document.cookie.split('; ') : [];
		for (var i = 0, l = cookies.length; i < l; i++) {
			var parts = cookies[i].split('=');
			var name = decode(parts.shift());
			var cookie = parts.join('=');
			if (key && key === name) {
				// If second argument (value) is a function it's a converter...
				result = read(cookie, value);
				break;
			}
			// Prevent storing a cookie that we couldn't decode.
			if (!key && (cookie = read(cookie)) !== undefined) {
				result[name] = cookie;
			}
		}
		return result;
	};
	config.defaults = {};
	$.removeCookie = function (key, options) {
		if ($.cookie(key) === undefined) {
			return false;
		}
		// Must not alter options, thus extending a fresh object...
		$.cookie(key, '', $.extend({}, options, { expires: -1 }));
		return !$.cookie(key);
	};
}));
(function($) {
  
  $.fn.areYouSure = function(options) {
      
    var settings = $.extend(
      {
        'message' : 'You have unsaved changes!',
        'dirtyClass' : 'dirty',
        'change' : null,
        'silent' : false,
        'addRemoveFieldsMarksDirty' : false,
        'fieldEvents' : 'change keyup propertychange input',
        'fieldSelector': ":input:not(input[type=submit]):not(input[type=button])"
      }, options);

    var getValue = function($field) {
      if ($field.hasClass('ays-ignore') || $field.hasClass('aysIgnore') || $field.attr('data-ays-ignore') || $field.attr('name') === undefined) {
        return null;
      }

      if ($field.is(':disabled')) {
        return 'ays-disabled';
      }

      var val;
      var type = $field.attr('type');
      if ($field.is('select')) {
        type = 'select';
      }

      switch (type) {
        case 'checkbox':
        case 'radio':
          val = $field.is(':checked');
          break;
        case 'select':
          val = '';
          $field.find('option').each(function() {
            var $option = $(this);
            if ($option.is(':selected')) {
              val += $option.val();
            }
          });
          break;
        default:
          val = $field.val();
      }

      return val;
    };

    var storeOrigValue = function($field) {
      $field.data('ays-orig', getValue($field));
    };

    var checkForm = function(evt) {

      var isFieldDirty = function($field) {
        var origValue = $field.data('ays-orig');
        if (undefined === origValue) {
          return false;
        }
        return (getValue($field) !== origValue);
      };

      var $form = ($(this).is('form')) ? $(this) : $(this).parents('form');

      // Test on the target first as it's the most likely to be dirty
      if (isFieldDirty($(evt.target))) {
        setDirtyStatus($form, true);
        return;
      }

      var $fields = $form.find(settings.fieldSelector);

      if (settings.addRemoveFieldsMarksDirty) {              
        // Check if field count has changed
        var origCount = $form.data("ays-orig-field-count");
        if (origCount !== $fields.length) {
          setDirtyStatus($form, true);
          return;
        }
      }

      // Brute force - check each field
      var isDirty = false;
      $fields.each(function() {
        var $field = $(this);
        if (isFieldDirty($field)) {
          isDirty = true;
          return false; // break
        }
      });
      
      setDirtyStatus($form, isDirty);
    };

    var initForm = function($form) {
      var fields = $form.find(settings.fieldSelector);
      $(fields).each(function() { storeOrigValue($(this)); });
      $(fields).unbind(settings.fieldEvents, checkForm);
      $(fields).bind(settings.fieldEvents, checkForm);
      $form.data("ays-orig-field-count", $(fields).length);
      setDirtyStatus($form, false);
    };

    var setDirtyStatus = function($form, isDirty) {
      var changed = isDirty !== $form.hasClass(settings.dirtyClass);
      $form.toggleClass(settings.dirtyClass, isDirty);
        
      // Fire change event if required
      if (changed) {
        if (settings.change){
			settings.change.call($form, $form);
		}

        if (isDirty){
			$form.trigger('dirty.areYouSure', [$form]);
		}
        if (!isDirty){
			$form.trigger('clean.areYouSure', [$form]);
		}
        $form.trigger('change.areYouSure', [$form]);
      }
    };

    var rescan = function() {
      var $form = $(this);
      var fields = $form.find(settings.fieldSelector);
      $(fields).each(function() {
        var $field = $(this);
        if (!$field.data('ays-orig')) {
          storeOrigValue($field);
          $field.bind(settings.fieldEvents, checkForm);
        }
      });
      // Check for changes while we're here
      $form.trigger('checkform.areYouSure');
    };

    var reinitialize = function() {
      initForm($(this));
    };

    if (!settings.silent && !window.aysUnloadSet) {
      window.aysUnloadSet = true;
      $(window).bind('beforeunload', function() {
        var $dirtyForms = $("form").filter('.' + settings.dirtyClass);
        if ($dirtyForms.length === 0) {
          return;
        }
        // Prevent multiple prompts - seen on Chrome and IE
        if (window.navigator.userAgent.toLowerCase().match(/msie|chrome/)) {
          if (window.aysHasPrompted) {
            return;
          }
          window.aysHasPrompted = true;
          window.setTimeout(function() {window.aysHasPrompted = false;}, 900);
        }
        return settings.message;
      });
    }

    return this.each(function() {
      if (!$(this).is('form')) {
        return;
      }
      var $form = $(this);
        
      $form.submit(function() {
        $form.removeClass(settings.dirtyClass);
      });
      $form.bind('reset', function() { setDirtyStatus($form, false); });
      // Add a custom events
      $form.bind('rescan.areYouSure', rescan);
      $form.bind('reinitialize.areYouSure', reinitialize);
      $form.bind('checkform.areYouSure', checkForm);
      initForm($form);
    });
  };
})(jQuery);







$.fn.hideOptionGroup = function() {
	$.each($(this),function(){
		var optgroup = $(this);
		var lable= optgroup.attr("label");
		var pname = optgroup.closest("select").attr("name");
		var pindex = $("select").index(optgroup.closest("select"));
		optgroup.attr("data-pname",pname);
		if($("."+lable+"_contaner_"+pindex).length<=0){
			$("body").append("<select style='position:absolute;top:-9999em;left:-9999em;' class='"+lable+"_contaner_"+pindex+"'><select>");
		}
		var hidden = $("."+lable+"_contaner_"+pindex);
		optgroup.children().each(function(){ $(this).removeAttr("selected"); });
		optgroup.appendTo(hidden);
	});
};

$.fn.showOptionGroup = function() {
	$.each($(this),function(){
		//var _lable=$(this).attr("label");
		var pname = $(this).data("pname");
		$(this).appendTo($( "select[name='"+pname+"']" ));
	});
};


// JavaScript Document

(function($) {
	$(document).ready(function() {
		
		$('#viewonly').change(function () {
			var state = $('#viewonly:checked').length;
			$.cookie('hivviewonly', state===1?"true":"false", { expires:1, path: '/' });
			//state = "viewonly="+state;
			window.location = window.location.href;//.split('?')[0]+"?"+state;
		});
		$( ".pubstate" ).buttonset();
		$('.pubstate.menuaction :radio').on('change',function () {
			$('.pubstate :radio').attr("checked",false).removeAttr('checked').next("label").removeClass("ui-state-active");
			$(this).attr("checked",true);
			$('.pubstate :radio').next("label").find("i").removeClass("icon-check-empty").removeClass("icon-check");
			$('.pubstate :radio').not(":checked").next("label").find("i").addClass("icon-check-empty");
			$('.pubstate :radio:checked').next("label").addClass("ui-state-active").find("i").addClass("icon-check");
			
			var state = $('.pubstate [name="pub"]:checked').val();
			var trashed = $('[name="trash"]').is(':checked');
			if(!trashed){
				$.cookie('hivpubview', trashed===1 ? "" : (state===1?"true":"false"), { expires:1, path: '/' });
			}
			//state = "pub="+state;
			
			window.location = window.location.href.split('?')[0]+"?"+( trashed?"&trash=1":"&pub="+state );
		});
	
		$.chai.core.util.setting_item_pub($(".container"));

		if($(".message.ui-state-highlight").length){
			setTimeout(function(){ $(".message.ui-state-highlight").fadeOut(500); },2000);
		}


		
	});
})(jQuery);
(function($) {
	$.chai.form_base = {
		ini:function(){
	
			$.chai.core.util.start_autoSaver();
			$.chai.core.util.moa_dmpk_setup();
			$.chai.core.util.make_maskes();
			$.chai.core.util.setup_refs();
			$.chai.core.util.apply_tax_request();
			$.chai.core.util.apply_taxed_add();
			$.chai.core.util.apply_a_taxed_add();
			$.chai.clinical.activate_adverse_ui();
			$.chai.core.util.make_dataTables();
	
			$('option.add_item').on('click',function(e){
				e.preventDefault();
				e.stopPropagation();
				$(this).attr('selected',false);
				$.chai.core.util.add_item_popup($(this).closest('select').data('type'),  $.chai.core.util.get_select_ids( $(this).closest('select') ) ,["new"]);
			});
			
			$('.inline_edit').on('click',function(e){
				e.preventDefault();
				e.stopPropagation();
				$.chai.core.util.popup_message('<span style="font-size: 28px;"><i class="icon-spinner icon-spin icon-large"></i> </span>',true);
				$.chai.core.util.add_item_popup($(this).data('type'),"",["new"], $(this).closest('tr').data('baseid') );
				
			});
			
			$('.help_block').on('click',function(e){
				e.preventDefault();
				e.stopPropagation();
				var block = $( '#' + $(this).data('block') );
				if(block.is(":visible")){
					block.hide();
				}else{
					block.show();
				}
			});
			
			
		}
	};
})(jQuery);
// JavaScript Document
(function($) {	
	$.chai.family = {
		ini:function(){
			$.chai.core.util.setup_viewlog();
			$.chai.core.util.setup_curate();
			$.chai.form_base.ini();
			
			$.chai.trial.start_popup_watch();
			$.chai.family.start_popup_watch();
			
	
			$('#substances_disabled').on("click",function(e){
				e.preventDefault();
				e.stopPropagation();
					if($("#substances_disabled_mess").length<=0){
						$('body').append('<div id="substances_disabled_mess">');
					}
					$("#substances_disabled_mess").html( $(this).attr('title') );
					$( "#substances_disabled_mess" ).dialog({
						autoOpen: true,
						resizable: false,
						width: 350,
						minHeight: 25,
						modal: true,
						draggable : false,
						create:function(){
							$('.ui-dialog-titlebar').remove();
							//$(".ui-dialog-buttonpane").remove();
							$('body').css({overflow:"hidden"});
						},
						open:function(){},
						buttons:{
							Ok:function(){
								$( this ).dialog( "close" );
								window.location = '/center/substance.castle';
							}
						},
						close: function() {
							$.chai.core.util.close_dialog_modle($( "#substances_disabled_mess" ));
						}
					});
			});
		
	
			$("#sortable").sortable({
				handle: ".sortable_handle",
				placeholder: "ui-state-highlight",
				stop:function(){ $.chai.family.sortedCode(); }
			});
			
			$("#famSubAdd").on("click",function(e){
				e.preventDefault();
				e.stopPropagation();
				//var sudo_code=Math.random().toString(36).slice(2,5);
				//var baseid=Math.random();
				$.getJSON("/center/substances.castle?json=true&callback=?",function(data){
					//alert("got data");
					var html = "";
					$.each(data,function(i,v){
						if($('[name="substances['+v.baseid+'].baseid"]').length<=0){
						html+="<span class='item i"+i+"' data-baseid='"+v.baseid+"' data-name='"+v.name+"' data-abbreviated='"+v.abbreviated+"'  ><i title='edit' class='icon-plus'></i>"+v.name+" ( "+v.abbreviated+" )<br/></span>";
						}
					});
					if(html === ""){
						html = "There are no substances to use.";	
					}
					if($("#substances_list").length<=0){
						$('body').append('<div id="substances_list">');
					}
					$("#substances_list").html( html );
					$( "#substances_list" ).dialog({
						autoOpen: true,
						resizable: false,
						width: 350,
						minHeight: 25,
						modal: true,
						draggable : false,
						create:function(){
							$('.ui-dialog-titlebar').remove();
							//$(".ui-dialog-buttonpane").remove();
							$('body').css({overflow:"hidden"});
						},
						open:function(){
							$('.item .icon-plus').on("click",function(){
								var par = $(this).closest('span');
								par.fadeOut("fast");
								var html ="<li class='substance_item'>";
								html+="<i title='edit' class='icon-trash'></i>";
								html+="<span class='sortable_handle'>handle</span> "+par.data("name")+" (<span class='sub_code'>"+par.data("abbreviated")+"</span>)";
		
								html+="<input type='hidden' name='substances["+par.data("baseid")+"].baseid' value='"+par.data("baseid")+"' class='substance'/>";
								html+="<input type='hidden' name='family_substance["+par.data("baseid")+"].baseid' value='0'  class=''/>";
								html+="<input type='hidden' name='family_substance["+par.data("baseid")+"].family.baseid' value='"+$('[name="item.baseid"]').val()+"'  class=''/>";
								html+="<input type='hidden' name='family_substance["+par.data("baseid")+"].substance_order' value='"+$(".substance_item").length+"'  class='substanceOrder'/>";
								html+="<input type='hidden' name='family_substance["+par.data("baseid")+"].substance.baseid' value='"+par.data("baseid")+"'  class=''/>";
								html+="</li>";
		
								$(html).appendTo("#sortable");
								$("#sortable").sortable("refresh");
								$.chai.family.sortedCode();
								
							});
						},
						buttons:{
							Ok:function(){
								$( this ).dialog( "close" );
							}
						},
						close: function() {
							$.chai.core.util.close_dialog_modle($( "#substances_list" ));
						}
					});
				});
				
			});
			
			$("#famSubCode .icon-edit").on("click",function(){
				if($("#subCodeEdit").is($('.open'))){
					$("#subCodeEdit").slideUp("slow", function() {
						$("#subCodeEdit").removeClass("open");
						$("#subCodeEdit").addClass("closed");
					});
				}else{
					$("#subCodeEdit").slideDown("slow", function() {
						$("#subCodeEdit").addClass("open");
						$("#subCodeEdit").removeClass("closed");
					});
				}
			});
			$("#subCodeEdit .icon-power-off").on("click",function(){
				$("#subCodeEdit").slideUp("slow", function() {
					$("#subCodeEdit").removeClass("open");
					$("#subCodeEdit").addClass("closed");
				});
			});
			$.chai.family.sortedCode();
		
		
			$.chai.drug.setup_ddi_ui();
			
			$.each($('.drpro_table:not(".dataTable")'),function(){
				var self = $(this);
				self.DataTable({ 
					"bJQueryUI": true,
					"sPaginationType": "full_numbers",
					"columnDefs": [ {
					  "targets"  : 'no-sort',
					  "orderable": false,
					}], 
					"fnDrawCallback": function() {//(oSettings ) {
		
						$("#drpro_table").find('.drpro_table .dataTables_empty').html('No drug products available. <a href="#" class="add_drPro">Add <i title="edit" class="icon-plus"></i></a>');
						$("#drpro_table").find('.add_drPro').off().on("click",function(e){
							e.preventDefault();
							e.stopPropagation();
							$.chai.family.add_drProTableRow();
						});
						//$.chai.core.util.ini_modaltable_to_table(dtable);
						
						$("#drpro_table").find('.removal').off().on("click",function(e){
							e.preventDefault();
							e.stopPropagation();
							var targ = $(this);
							$.chai.core.util.confirmation_message("Are you sure?",{
								"yes":function(){
									$.chai.core.util.remove_datatable_current_row(targ);
								},
								"no":function(){}
							});
						});
					}
				});	
			});			
	
			
		},
		start_popup_watch:function(){
			$('.drug_inline_edit').on('click',function(e){
				e.preventDefault();
				e.stopPropagation();
				$.chai.core.util.popup_message('<span style="font-size: 28px;"><i class="icon-spinner icon-spin icon-large"></i> Loading content...</span>',true);
				var id = $(this).data('baseid')||$(this).closest('tr').data('baseid');
				$.chai.drug.drug_popupForm(id);
			});
		},
		sortedCode:function(){
			$('.substance_item .icon-trash').off().on("click",function(){
				$(this).closest('.substance_item').fadeOut("fast",function(){
					$(this).remove();
					$.chai.family.sortedCode();
				});
			});
			var code="";
			$.each($(".substance_item"),function(i){
				code+= (code===""?"":"<em>:</em>") + $(this).find('.sub_code').text();
				$(this).find('.substanceOrder').val(i+1);
			});
			$("#sub_code").html(code);
		},
		add_drProTableRow:function(){
				var html = "";
				html+="<div id='drPro_additions' class='min'>";
					html+="<h4>Create new Drug</h4>";
						html+="<div id='create_drPros_stub' class='full-input'>";
							html+="<form action='/center/savedrug.castle' method='post'><input name='item.baseid' type='hidden' value='0'>";
								html+="<input type='hidden' name='item.families.substance_id' value='"+$("[name='item.baseid']").val()+"'/>";
								
								var form_block = $('#drug_forms').html();
								html+="Form: "+form_block+"<!--<input type='text' name='item.dose_form' value='' style='display: inline-block; max-width:50%;'/>-->";
								
								
								
								html+="<input type='hidden' name='item.attached' value='false'/>";
								html+="<label>Unit <select name='item.dose_unit' style='display: inline-block; max-width:50%;'><option value=''>Select Unit</option><option value='mg'>mg</option><option value='mg/ml'>mg/ml</option></select></label>";
								html+="<label>Amounts<br/>";
								$.each($(".substance_item"),function(){
									html+= "<span style='min-width:20%'>"+$(this).find('.sub_code').text()+":</span> <input type='text' class='sub_label_claim' style='width: auto; display: inline-block; max-width: 100%;' /><br/>";
								});
								html+="</label>";
								html+= "<input type='hidden' name='label_claim'/><br/>";
								html+="<label>Manufacturer<br/><select name='item.manufacturer' id='quick_drPro_manufacturer'><option value=''>Select</option></select><br/></label>";
							html+="</form>";
						html+="</div>";
				html+="</div>";
				html+="<div class='clearfix'></div>";
				
				if($("#form_list").length<=0){
					$('body').append('<div id="form_list">');
				}
				$("#form_list").html( html );
				$( "#form_list" ).dialog({
					autoOpen: true,
					resizable: false,
					width: 350,
					minHeight: 150,
					height: 'auto',
					maxHeight: $(window).height(),
					modal: true,
					draggable : false,
					create:function(){
						$('.ui-dialog-titlebar').remove();
						//$(".ui-dialog-buttonpane").remove();
						$('body').css({overflow:"hidden"});
						$(".ui-dialog-buttonset").prepend("<a href='#' id='create_drPros_stub_submit' class='button'>Add drug product stub</a>");
					},
					open:function(){
						$.getJSON('/center/get_taxonomies.castle?tax=commercial&callback=?',  function(data){
							var list="";
							$.each(data,function(i,v){
								list+="<option value='"+v.alias+"'>"+v.name+"</option>";
							});
							$('#quick_drPro_manufacturer').append(list);
						});
		
						$('#create_drPros_stub_submit').on("click",function(e){
							e.preventDefault();
							e.stopPropagation();
							
							var code = "";
							$.each($('.sub_label_claim'),function(i){
								if(i>0){
									code+=":";
								}
								code+=$.trim($(this).val());
							});	
							$('[name="label_claim"]').val(code);
							$('[name="label_claim"]').val(code);
							var form_data = $('#create_drPros_stub form').find( "input, textarea, select" ).serializeArray();
							
							$.ajax({cache: false,
							   url:$('#create_drPros_stub form').attr('action')+"?json=true&ajaxed_update=true&callback=?",
							   data:form_data,
							   dataType : "json",
							   success: function(returndata){
									if(returndata.baseid!==""){
										$.chai.core.util.popup_message($("<span><h5>You have added a new Durg Protuct!</h5> It was added to the table of products for the drug form.</span>"));
										$('#drpro_empty').remove();
										$('[href="#existing_drPros"]').trigger('click');
										$.each(returndata,function(i,v){
											var dataTable = $("#drpro_table").find('.dataTable');
											var tableData = [];
											
											var count = $(".drug_item.list_item").length;
											//var html = v.label_claim;//+ '<input type="hidden" name="drugs['+(count)+'].baseid" value="'+v.baseid+'" class="drug_item list_item"/><input type="hidden" name="drugs['+(count)+'].attached" value="1" class="drug_item list_item"/>';
											
											tableData.push( v.form ); 
											
											
											$.each(v.label_claim.split(':'),function(i,val){
												tableData.push(val);
											});
											
											//tableData.push( html );
											tableData.push( v.manufacturer ); 
											tableData.push( '<input type="hidden" name="drugs['+(count)+'].baseid" value="'+v.baseid+'" class="drug_item list_item"/><a href="#" class="button xsmall crimson defocus removal"><i class="icon-remove" title="Remove"></i></a>' ); 
											dataTable.dataTable().fnAddData( tableData );
											
											$.chai.core.util.build_general_removal_button($("ul .display.datagrid.dataTable .removal"));
		
										});
										$.chai.core.util.autoSaver();
										$( "#form_list" ).dialog( "close" );
									}else{
										$.chai.core.util.popup_message($("<span>failed to save, try again.</span>"));
									}
								}
							});
						});
					},
					buttons:{
						Close:function(){
							$( this ).dialog( "close" );
						}
					},
					close: function() {
						$.chai.core.util.close_dialog_modle($( "#form_list" ));
					}
				});
			}
			
	};
})(jQuery);
// JavaScript Document
(function($) {
	$.chai.markets = {
		ui:{
			tabs:null,
			tabTitle:null,
			tabTemplate:null,
			tabCounter:null,
		},
		ini:function(){
	
			$.chai.markets.ui.tabs = $( "#tabed" ).tabs().addClass( "ui-tabs-vertical ui-helper-clearfix" );
			//var uitabs = $( ".uitabs" ).tabs();
			
			$('.ui-state-default span.ui-icon-close').on("click", function(e){
				e.preventDefault();
				e.stopPropagation();
				var panelId = $( this ).closest( "li" ).remove().attr( "aria-controls" );
				$( "#" + panelId ).remove();
				$.chai.markets.ui.tabs.tabs( "refresh" );
				$.each( $('input[name^="markets_counts["]' ), function(i){
					$(this).attr('name','markets_counts['+ (i+1) +']');
				});
			});
			$( "#tabed li" ).removeClass( "ui-corner-top" ).addClass( "ui-corner-left" );
			$( "#newyear" ).on('click',function(e){
				e.preventDefault();
				e.stopPropagation();
				//var txt = $("#querybed").html();
				if($( "#marketdialog" ).length<=0){
					$('body').append('<div id="marketdialog" title="Tab data"><form><fieldset class="ui-helper-reset"><label for="tab_title">Year</label><input type="number" name="tab_date" id="tab_date" value="" class="ui-widget-content ui-corner-all" /></fieldset></form></div>');
				}	
				$.chai.markets.ui.tabTitle = $( "#tab_date" );
				$.chai.markets.ui.tabTemplate = "<li><a href='#{href}'>#{label}</a> <span class='ui-icon ui-icon-close' role='presentation'>Remove Tab</span></li>";
				$.chai.markets.ui.tabCounter = $( "#tabed li" ).length;
		
				var today = new Date();
		
				// modal dialog init: custom buttons and a "close" callback reseting the form inside
				var dialog = $( "#marketdialog" ).dialog({
					autoOpen: true,
					modal: true,
					create:function(){
						$.chai.core.util.make_maskes();
						$('#tab_date').spinner({
							min: 1980,
							max: today.getFullYear() + 2,
							create: function() {
								$('#tab_date').spinner( "value", today.getFullYear() );
							},
							change:function(){
								if( $('#tab_date').val() > today.getFullYear() + 2 ){
									$( "#marketdialog" ).append('<p style="display:block; background-color:yellow; color:red; padding: 2px 5px;" id="yearWarning">You reached the max year. Reseting the year for you.</p>');
									setTimeout(function(){ $("#yearWarning").fadeOut(500); },2000);
									$('#tab_date').val(today.getFullYear()+2);
								}
							}
						});
						
						},
					buttons: {
						Add: function() {
							$.chai.markets.addTab();
							$( this ).dialog( "close" );
						},
						Cancel: function() {
							$( this ).dialog( "close" );
						}
					},
					close: function() {
						form[ 0 ].reset();
					}
				});
		
				// addTab form: calls addTab function on submit and closes the dialog
			
				var form = dialog.find( "form" ).submit(function( event ) {
					$.chai.markets.addTab();
					dialog.dialog( "close" );
					event.preventDefault();
				});
				// actual addTab function: adds new tab using the input from the form above
			
	
			
			
				$.chai.markets.ui.tabs.delegate( "span.ui-icon-close", "click", function() {
					var panelId = $( this ).closest( "li" ).remove().attr( "aria-controls" );
					$( "#" + panelId ).remove();
					$.chai.markets.ui.tabs.tabs( "refresh" );
					$.each( $('input[name^="markets_counts["]' ), function(i){
						$(this).attr('name','markets_counts['+ (i+1) +']');
					});
				});
			
				$.chai.markets.ui.tabs.bind( "keyup", function( event ) {
					if ( event.altKey && event.keyCode === $.ui.keyCode.BACKSPACE ) {
						var panelId = $.chai.markets.ui.tabs.find( ".ui-tabs-active" ).remove().attr( "aria-controls" );
						$( "#" + panelId ).remove();
						$.chai.markets.ui.tabs.tabs( "refresh" );
					}
				});
			});
		},
		addTab:function() {
			var label = $.chai.markets.ui.tabTitle.val() || "Tab " + $.chai.markets.ui.tabCounter,
				id = "tabs-" + $.chai.markets.ui.tabCounter,
				li = $( $.chai.markets.ui.tabTemplate.replace( /#\{href\}/g, "#" + id ).replace( /#\{label\}/g, label ) );
			$.chai.markets.ui.tabs.find( ".ui-tabs-nav" ).prepend( li );
			var content = $("#querybed").html();
			var contentHtml = content.replace( /\{\{YEAR\}\}/g, label ) ;
			contentHtml = contentHtml.replace( /\{\{COUNT\}\}/g, $.chai.markets.ui.tabCounter+1 ).replace( /\{\{__\}\}/g, "" ) ;
			$.chai.markets.ui.tabs.append( "<div id='" + id + "'>" + contentHtml + "</div>" );
			$.chai.markets.ui.tabs.tabs( "refresh" );
			$.chai.markets.ui.tabs.tabs( "option", "active", $.chai.markets.ui.tabCounter );
			$.chai.markets.ui.tabCounter++;
			$.each( $('input[name^="markets_counts["]' ), function(i){
				$(this).attr('name','markets_counts['+ (i+1) +']');
			});
		},
	};
})(jQuery);
// JavaScript Document
(function($) {
	$.chai.reports = {
		ini:function(){
			$.chai.form_base.ini();
			if($('select[name^="property"],.property_selector').length){
				$("#types").on("change",function(){
		
					$.chai.reports.set_prop_sel($("#types").val());
		
					$('.input_box').removeClass("showen");
					$('.input_box.gen').addClass("showen");
					$('.input_box [name*=value]').val('');
				}).trigger("change");
			}
			$("#ADD_query").on("click",function(e){
				e.preventDefault();
				e.stopPropagation();
				$(".query_item:not('#queryBed .query_item')").last().after($("#queryBed").html());
				$(".REMOVE_query").off().on("click",function(e){
					e.preventDefault();
					e.stopPropagation();
					$(this).closest(".query_item").fadeOut("150",function(){
						$(this).remove();
						$.chai.reports.make_prop_select();
						$.chai.reports.re_index_query_items();
					});					   
				});
				$.chai.reports.make_prop_select();
				$.chai.reports.re_index_query_items();
				$.chai.reports.set_prop_sel($("#types").val());
			});
			$.chai.reports.make_prop_select();
			$('#start_save_query').on('click',function(e){
				e.preventDefault();
				e.stopPropagation();
				$('#to_save_query').slideDown();
				$('#start_save_query').slideUp();
			});
		},
		re_index_query_items:function (){
			$.each($(".query_item:not('#queryBed .query_item')"),function(i){
				$.each($(this).find("input:visible ,select:visible "),function(){
					//var name = $(this).attr('name');
					$(this).attr('name', $(this).attr('name').split('[')[0]+"["+i+"]");
				});
			});
		},
		make_prop_select:function(){
			$(".property_selector").off().on("change",function(){
				
				var prop = $(this).val();
				var query_item = $(this).closest('.query_item');
				
				//alert(prop);
				query_item.find('.input_box input,.input_box select').removeAttr("name");
				query_item.find('.input_box [name*=value]').val('');
				
				query_item.find('.input_box').removeClass("showen");
				query_item.find('.input_box.'+prop+'').addClass("showen");
				if(query_item.find('.input_box:visible').length<=0){
					query_item.find('.input_box.gen').addClass("showen");
				}
				query_item.find('.input_box:visible input,.input_box:visible select').attr("name","value[9999]");
				$.chai.reports.re_index_query_items();
			});
		},
		set_prop_sel:function (val){
			$.each( $('form select.property_selector,form select[name="selected_properties"]') ,function(){
				$(this).find('option').attr("selected",false);
				$(this).find('optgroup').hideOptionGroup();
				var pname = $(this).closest('select').attr("name");
				$('optgroup.'+val+'s[data-pname="'+pname+'"]').showOptionGroup();
			});
		}
	
	};
})(jQuery);	
// JavaScript Document
(function($) {
	$.chai.trial = {
		ini:function(){
			$.chai.core.util.setup_viewlog();
			$.chai.core.util.setup_curate();
			$.chai.form_base.ini();
			$.chai.reference.ref_popup_primer();
			$.chai.trial.trial_arm_primer();
			$.chai.trial.start_popup_watch();
			$.chai.core.util.setup_ref_copy();
		},
	
		start_popup_watch:function(){
			$('.trial_inline_edit').on('click',function(e){
				e.preventDefault();
				e.stopPropagation();
				$.chai.core.util.popup_message('<span style="font-size: 28px;"><i class="icon-spinner icon-spin icon-large"></i> Loading content...</span>',true);
				var id = $(this).data('baseid')||$(this).closest('tr').data('baseid');
				$.chai.trial.trial_arm_form(id);
			});
		},
	
	
		
		trial_arm_primer:function(){
			$(".trial_arm_form").on("click",function(e){
				e.preventDefault();
				e.stopPropagation();
				$.chai.core.util.popup_message('<span style="font-size: 28px;"><i class="icon-spinner icon-spin icon-large"></i> Loading content...</span>',true);
				$.chai.trial.trial_arm_form();
			});	
		},
		
		trial_arm_form:function (id){
			if($("#trial_arm_form").length===0){
				$("#staging").append("<div id='trial_arm_form'></div>");
			}
			$.ajax({cache: false,
			   url:"/center/clinical.castle",
			   data:{"skiplayout":1,"id":typeof(id)==="undefined"?"":id,typed_ref:$('[name="typed_ref"]').val()},
			   success: function(data){
				   var trial_arm_form_dialog = $( "#trial_arm_form" );
					trial_arm_form_dialog.html(data);
					trial_arm_form_dialog.dialog({
						autoOpen: true,
						resizable: false,
						width: $(window).width()-50,
						height: $(window).height()-50,
						modal: true,
						draggable : false,
						buttons: {
							Cancel: function() {
								$( this ).dialog( "close" );
							}
						},
						create:function(){
	
							$( "#mess" ).dialog( "destroy" );
							$( "#mess" ).remove();
							
							
							$('body').css({overflow:"hidden"});
							$(".ui-dialog-buttonpane").remove();
							/*
							$(".formstateaction").html($(".ui-dialog-buttonpane"));
							$(".ui-dialog-buttonpane:not(.formstateaction .ui-dialog-buttonpane)").remove();
							*/
							$.chai.clinical.ini();
	
							var tabContents = trial_arm_form_dialog.find(".tab_content").hide(), tabs = trial_arm_form_dialog.find("ul.tabs li");
							tabs.addClass("tabed");
							tabs.first().addClass("active").show();
							tabContents.first().show();
							
							tabs.on("click",function(e) { e.preventDefault(); e.stopPropagation();
								var $this = $(this), activeTab = $this.find('a').attr('href');
								
								if(!$this.hasClass('active')){
									$this.addClass('active').siblings().removeClass('active');
									tabContents.hide().filter(activeTab).fadeIn();
								} return false;
							});	
							$( ".uitabs" ).tabs();
	
	
							trial_arm_form_dialog.find('[name="item.trials.baseid"]').val($('.container [name="item.baseid"]').val());
	
							trial_arm_form_dialog.find("[type='submit']").on("click",function(e){
								
								var form = $(this).closest("form");
								if (form.find(':invalid').length<=0) {
									e.preventDefault();
									e.stopPropagation();
									$.chai.core.util.popup_message('<span style="font-size: 28px;"><i class="icon-spinner icon-spin icon-large"></i>Saving...</span>',true);
									$.post(form.attr("action")+"?skiplayout=1&ajaxed_update=1",form.serialize(),function(){//(data){
										//var parts= data.split(',');
										$( "#mess" ).dialog( "destroy" );
										$( "#mess" ).remove();
	
										var dataTable = $("#trial_arms.tab_content").find('.dataTable');
										
										var count = $("#trial_arms.tab_content .datagrid tbody tr").length + 1;
										if($("#trial_arms.tab_content  .datagrid tbody tr td.dataTables_empty").length){
											count--;
										}
										console.log("in list before add "+count);
										
										
										
										var tableData = [];
										var baseid = form.find('[name="item.baseid"]').val();
										if($("#trial_arms.tab_content .dataTable [value='"+baseid+"']").length<=0){
											var html =  baseid+ '<input type="hidden" name="trial_arms['+count+'].baseid" value="'+baseid+'" class="list_item drug_item">';
											tableData.push( html );
											tableData.push( form.find('[name="item.name"]').val() );
											tableData.push( "-refresh for drugs-" ); 
											tableData.push( '<a href="#" class="button xsmall crimson defocus removal"><i class="icon-remove" title="Remove"></i></a>' ); 
											dataTable.dataTable().fnAddData( tableData );
										}
										
										$.chai.core.util.build_general_removal_button($("ul .display.datagrid.dataTable .removal"));
										$.chai.core.util.close_dialog_modle($( "#trial_arm_form" ));
									});
								}
							});	
							
							//$.chai.core.util.set_up_form(type,inlist,use);
							//$.chai.core.util.activate_adverse_ui();
						},
						close: function() {
							$.chai.core.util.close_dialog_modle($( "#trial_arm_form" ));
						}
					});
					$.chai.core.util.set_diamodle_resizing($( "#trial_arm_form" ));	
					
				}
			});
	
		},
	};
})(jQuery);
(function($) {
	$.chai.trial_arm = {
		ini:function(){
			$.chai.core.util.setup_viewlog();
			$.chai.core.util.setup_curate();
			$.chai.form_base.ini();
		},
	};
})(jQuery);
// JavaScript Document
(function($) {
	$.chai.clinical = {
		ini:function(){
			$.chai.core.util.setup_viewlog();
			$.chai.core.util.setup_curate();
			$.chai.form_base.ini();
			$.chai.drug.setup_ddi_ui();
			$.chai.reference.ref_popup_primer();
			$.chai.clinical.add_state();
			$.each($('.showFeildset'),function(){
				var checks = $(this);
				checks.buttonset();
				checks.find(':radio').on('change',function () {
					$.chai.clinical.resetFeildset(checks);
				});
			});
			$('.drug_inline_edit').on('click',function(e){
				e.preventDefault();
				e.stopPropagation();
				$.chai.core.util.popup_message('<span style="font-size: 28px;"><i class="icon-spinner icon-spin icon-large"></i> Loading content...</span>',true);
				$.chai.drug.drug_popupForm($(this).closest('tr').data('baseid'));
			});
			$(".drug_pro_add_item").on('click',function(e){
				e.preventDefault();
				e.stopPropagation();
				
				if($("#drug_form").length===0){
					$("#staging").append("<div id='drug_form'><div id='drug_list'></div></div>");
				}
				$.ajax({cache: false,
				   url:"/center/drugs.castle",
				   data:{"skiplayout":1,"exclude":$.chai.clinical.get_current_drugList(),typed_ref:$('[name="typed_ref"]').val()},
				   success: function(data){
						$("#drug_list").html(data);
						$( "#drug_form" ).dialog({
							autoOpen: true,
							resizable: false,
							width: $(window).width()-50,
							height: $(window).height()-50,
							modal: true,
							draggable : false,
							buttons: {
								Cancel: function() {
									$( this ).dialog( "close" );
								}
							},
							create:function(){
								
								$( "#mess" ).dialog( "destroy" );
								$( "#mess" ).remove();
								
								$('body').css({overflow:"hidden"});
								$(".ui-dialog-buttonpane").remove();
							},
							open:function(){
								var table = $("#drug_list #data").DataTable({ 
									"bJQueryUI": true,
									"sPaginationType": "full_numbers",
									"fnDrawCallback": function() {},
									"columnDefs": [ {
									  "targets"  : 'no-sort',
									  "orderable": false,
									}]
								});
								
								$("#drug_list #data").on( 'draw.dt', function () {
									$.chai.clinical.set_drugTable_removal();
									$.chai.clinical.ini_list_to_datatable();
								});
								
								
								$.each($("#drug_list #data thead th"), function ( i ) {
									var select = $('<select><option value=""></option></select>')
										.appendTo( $(this) )
										.on( 'change', function () {
											var val = $(this).val();
							 
											table.column( i )
												.search( val, false, true, true )
												.draw();
										});
									table.column( i ).data().unique().sort().each( function ( d ) {
										select.append( '<option value="'+d+'">'+d+'</option>' );
									} );
								});
								$.chai.clinical.ini_list_to_datatable();
							},
							close: function(){
								$.chai.core.util.close_dialog_modle($( "#drug_form" ));
							}
						});
						$.chai.core.util.set_diamodle_resizing($( "#drug_form" ));	
					}
				});	
			});
		},
		add_state:function(){
			$('#add_clinical_state').off().on("click",function(e){
				e.preventDefault();
				e.stopPropagation();
				var dataTable = $('#clinical_states.dataTable');
				var tableData = [];
				var count = $("#clinical_states tbody tr").length+1;
				if($("#clinical_states tbody tr td.dataTables_empty").length){
					count=1;
				}
				//window.data_table_clinical_states
				$.each($("#local_state_stage li"),function(idx,val){
					var html=$(val).html().toString();
					html = html.split('___arm_states').join('arm_states');
					html = html.split('[0]').join('['+(count)+']');
					tableData.push( html );
					console.log( html );
				});
				dataTable.dataTable().fnAddData( tableData );
				$.chai.core.util.build_general_removal_button($("#clinical_states tbody .removal"));
			});	
		},			
		re_index_meta_items:function(){
			$.each(
			   $(".adverse_events").closest('ul').find("li[data-taxorder]"),
			   function(i){
					$(this).data('taxorder',i);
					$.each($(this).find("input,select:not([name=''])"),function(){
						//var name = $(this).attr('name');
						$(this).attr('name', $(this).attr('name').split('[')[0]+"["+i+"]");
					}); 
				}
			);
		},
		controll_meta_items:function(){
			$('.remove').hover(function(){$(this).removeClass('red');},function(){$(this).addClass('red');});
			$('.remove').on("click",function(){
				var container = $(this).closest('li');
				var option = container.find('[name^="option"]').val();
				$(".adverse_events option[value='"+option+"']").removeAttr("disabled");
				container.fadeOut(function(){ $(this).remove(); });
			});
			$.chai.clinical.re_index_meta_items();
		},
	
		activate_adverse_ui:function (){
			$(".adverse_events").on("change", function(){
				var selected = $(this).val();
				
				var selected_obj = $(this).find('option[value="'+selected+'"]');
				
				if(selected_obj.is('.add')){
					return;	
				}
				
				var container = $(this).closest('ul');
					
				var baseid = selected_obj.data('baseid');
				var content = selected_obj.data('content');
				if(typeof content !=="undefined" && content !==""){
					content = ' <i class="icon-question-sign blue" title="'+ content +'">';
				}else{
					content = "";	
				}
				var alias = selected_obj.data('alias');
				
				
				//this works by
				//tax is picked. 
				//the tax, since it's a base id can have a child.
				//that child is the 
				
				var is_none = alias ==="none"?"":"required";
				
				container.append(
					 '<li data-taxorder="9999" data-name="'+selected_obj.val()+'" class="highlighted" style="padding: 15px 10px;">'+
						'<i class="icon-remove-circle red right remove"></i>'+
						 '<label>'+ selected_obj.text() + content +
						 '</label>'+
						 '<input type="'+(alias ==="none"?"hidden":"text")+'" name="value[9999]" id="" '+is_none+' value=""/>'+//child
						 '<input type="hidden" name="option_key[9999]" value="'+baseid+'" />'+//tax_id
					 '</li>'
				);
				selected_obj.attr("disabled",true);
				$(this).val("");
				$.chai.clinical.controll_meta_items();
				$.chai.clinical.re_index_meta_items();
				$.chai.core.util.make_maskes();
				$.chai.core.util.unhighlight();
			});
			$.chai.clinical.controll_meta_items();
		},
		
		
		
		resetFeildset:function(checks){
			checks.find(':radio').next("label").find("i").removeClass("icon-check-empty").removeClass("icon-check");
			checks.find(':radio').not(":checked").next("label").find("i").addClass("icon-check-empty");
			checks.find(':radio:checked').next("label").find("i").addClass("icon-check");	
	
			var tar_area = checks.closest('fieldset').find('ul');
			if(tar_area.is('.open')){
				tar_area.hide('fast',function(){
					tar_area.removeClass('open');
				});
			}else{
				tar_area.show('fast',function(){
					tar_area.addClass('open');
					if( $('#fed_block').find('ul').is('.open') && $('#fasting_block').find('ul').is('.open') ){
						var notId;
						if(tar_area.closest('fieldset').is('#fed_block')){
							notId=$('#fasting_block');
						}else{
							notId=$('#fed_block');
						}
						notId.find('ul').hide('fast',function(){
							notId.find('ul').removeClass('open');
							
							notId.find('.showFeildset :radio[value="yes"]').removeAttr('checked');
							notId.find('.showFeildset :radio[value="yes"]').next("label").removeClass('ui-state-active');
							notId.find('.showFeildset :radio[value="yes"]').next("label").find("i").addClass("icon-check-empty").removeClass("icon-check");
							
							notId.find('.showFeildset :radio[value="no"]').next("label").find("i").addClass("icon-check").removeClass("icon-check-empty");
							notId.find('.showFeildset :radio[value="no"]').next("label").addClass('ui-state-active');
							notId.find('.showFeildset :radio[value="no"]').attr('checked','checked');
						});
					}	
				});
			}
	
		},
		set_drugTable_removal:function(){
			$.chai.core.util.build_general_removal_button($("#Drugdata .removal"));
		},
		ini_list_to_datatable:function(){
			
			$('.additem').off().on('click',function(e){
				e.preventDefault();
				e.stopPropagation();
				var table = $("#drug_list #data").dataTable();
				var trigger = $(this);
				var targetrow = trigger.closest('tr');
				var baseid = targetrow.data("baseid");
				
				var count = $("#drug_products .datagrid tbody tr").length + 1;
				if($("#drug_products .datagrid tbody tr td.dataTables_empty").length){
					count--;
				}
				console.log("in list before add "+count);
				var tdCount = targetrow.find("td").length;
				var tableData = [];
				
				var html = targetrow.find("td:first").text() + '<input type="hidden" name="drugs['+count+'].baseid" data-baseid="'+baseid+'" value="'+baseid+'" class="drug_item list_item"/>';
				tableData.push( html );
				
				for (var i = 1; i < tdCount-1; i++) { 
					console.log("td "+i);
					tableData.push( targetrow.find("td:eq("+(i)+")").text() ); 
				}
	
				tableData.push(
					'<a href="#" class="button xsmall crimson defocus removal"><i class="icon-remove" title="Remove"></i></a>'
				); 
	
				$("#drug_products .datagrid").dataTable().fnAddData( tableData );
				
				//$("#drug_products .datagrid [name='drugs["+count+"].baseid']").data('baseid',baseid);
				
				
				targetrow.fadeOut( "75" ,function(){ table.fnDeleteRow( table.fnGetPosition( targetrow.get(0) ) ); });
				
				$("#drug_form").append("<span class='dialog_message ui-state-highlight'>Added to this "+$("#header_title").text()+"</span>");
				setTimeout(function(){$(".dialog_message").fadeOut("500");},"1000");
				
				$.chai.clinical.set_drugTable_removal();
				$("#drug_list #data").on( 'draw.dt', function () {
					$.chai.clinical.set_drugTable_removal();
					$.chai.clinical.ini_list_to_datatable();
				});
				$.chai.clinical.ini_list_to_datatable();
				$.chai.core.util.autoSaver();
				console.log("in list after add "+($("#drug_products .datagrid tbody tr").length));
			});	
			
		},
		get_current_drugList:function(){
			var listing = "";
			$.each($("#drug_products tbody tr"),function(){
				listing += (listing===""?"":",") + $(this).data("baseid");
			});
			return listing;
		},
	};
})(jQuery);
// JavaScript Document
(function($) {
	$.chai.drug = {
		ini:function(){
			$.chai.core.util.setup_viewlog();
			$.chai.core.util.setup_curate();
			$.chai.form_base.ini();
	
			$("select[name*='inactive_ingredients[]']").on("change",function(){
				var sel="";
				$.each($(this).find(':selected'),function(i){
					sel+=(i>0?",":"")+$(this).val();
				});
				$("[name$='inactive_ingredients']").val(sel);
			});
			$(".claim_item").on("keyup",function(){
				var code="";
				$.each($(".claim_item"),function(){
					code+= (code===""?"":":") + $(this).val();
				});
				$("#item_label_claim").val(code);
				$("#CLAIM").text(code);
			});
			$.chai.markets.ini();
			$.chai.trial.trial_arm_primer();
			
			
			$.each($('.table_radios:not(.ui-buttonset)'),function(){
				$( this ).buttonset();
			});
			
			
			$.chai.drug.add_lmic();
			$.chai.drug.setup_ddi_ui();
		},
		
		add_lmic:function(){
			$('#add_lmic').off().on("click",function(e){
				e.preventDefault();
				e.stopPropagation();
				var dataTable = $('#LMICdata').find('.dataTable');
				var tableData = [];
				
				var count = $("#LMICdata tbody tr").length+1;
				
				//var options=$('#dirty_options select').html();
				
	
				//tableData.push( html );
				//tableData.push( 's' );
				tableData.push( '<input type="hidden" name="lmics['+(count)+'].id" value="0"/><input type="text" placeholder="label claim amount" name="lmics['+(count)+'].amount"/>' );
				tableData.push( '<label for="radio'+(count)+'-1">Yes</label><input id="radio'+(count)+'-1" type="radio" name="lmics['+(count)+'].lmic_1l" value="yes" /><label for="radio'+(count)+'-2">No</label><input id="radio'+(count)+'-2" type="radio" name="lmics['+(count)+'].lmic_1l" value="no" />' ); 
				tableData.push( '<label for="radio'+(count)+'-3">Yes</label><input id="radio'+(count)+'-3" type="radio" name="lmics['+(count)+'].lmic_2l" value="yes" /><label for="radio'+(count)+'-4">No</label><input id="radio'+(count)+'-4" type="radio" name="lmics['+(count)+'].lmic_2l" value="no" />' ); 
				tableData.push( '<label for="radio'+(count)+'-5">Yes</label><input id="radio'+(count)+'-5" type="radio" name="lmics['+(count)+'].lmic_3l" value="yes" /><label for="radio'+(count)+'-6">No</label><input id="radio'+(count)+'-6" type="radio" name="lmics['+(count)+'].lmic_3l" value="no" />' ); 
				tableData.push( '<label for="radio'+(count)+'-7">Yes</label><input id="radio'+(count)+'-7" type="radio" name="lmics['+(count)+'].tbd" value="yes" /><label for="radio'+(count)+'-8">No</label><input id="radio'+(count)+'-8" type="radio" name="lmics['+(count)+'].tbd" value="no" />' ); 
				tableData.push( '<a href="#" class="button xsmall crimson defocus removal"><i class="icon-remove" title="Remove"></i></a>' ); 
	
				dataTable.dataTable().fnAddData( tableData );
				//dataTable.find('tr:last td:not(:first,:last)').addClass('table_radios');
				$('#LMICdata table tr [type="radio"]').closest('td:not(.ui-buttonset)').addClass('table_radios');
				$.each($('.table_radios:not(.ui-buttonset)'),function(){
					$( this ).buttonset();
				});/**/
				
				$.chai.core.util.build_general_removal_button($("#LMICdata tbody .removal"));
				$.chai.drug.add_lmic();
			});	
		},
		
		
		
		apply_ddi_removal:function(){
			$.chai.core.util.build_general_removal_button($("#ddi tbody .removal"));
		},
		setup_ddi_ui:function(){
			$.chai.drug.apply_ddi_removal();
			$('#drug_interaction').on("click",function(e){
				e.preventDefault();
				e.stopPropagation();
				var dataTable = $('#ddi').find('.dataTable');
				var tableData = [];
				var family_list = $("#ddi_drug_product").length>0;
				var count = $("#ddi tbody select").length;
	
				var input_name = 'interactions['+(count)+']';
				
				var html = '';
				
				if(family_list){
					input_name = 'interactions['+(count)+']';
					html = '<input type="hidden" name="'+input_name+'.arm.baseid" value="'+$("[name='item.baseid']").val()+'"/><select name="'+input_name+'.drug" id="drpr_'+count+'"><option value="">Select</option></select>';
					tableData.push( html );
				}
				
				html = '<input type="hidden" name="'+input_name+'.id" value="0"/><select name="'+input_name+'.substance"  id="ddi_only_'+count+'"><option value="">Select</option></select>';
				tableData.push( html );
				
				html = '<select name="'+input_name+'.yes_no"><option value="yes">Yes</option><option value="no">No</option></select>';
				tableData.push( html );
				
				html = '<input type="text" name="'+input_name+'.dose_amount" value="" style="width:100%"/>';
				tableData.push( html );
				tableData.push( '<textarea placeholder="Describe the interaction between the two drugs" name="'+input_name+'.descriptions"  rows="1"></textarea>' );
				tableData.push( '<a href="#" class="button xsmall crimson defocus removal"><i class="icon-remove" title="Remove"></i></a>' ); 
		
				
				dataTable.dataTable().fnAddData( tableData );
	
				if(family_list){
					$.getJSON("/center/drugs.castle?json=true&callback=?",function(data){
						$.each(data,function(i,v){
							if( $("[data-baseid='"+v.baseid+"']").length > 0 ){
								$('#drpr_'+count).append("<option value='"+v.baseid+"' data-baseid='"+v.baseid+"' data-name='"+v.name+"' data-label_claim='"+v.label_claim+"' data-form='"+v.form+"' data-manufacturer='"+v.manufacturer+"'  >"+ v.form + " -- " + v.name+" ( "+v.manufacturer+" | "+v.label_claim+" )</option>");
							}
						});
					});	
				}
				$.getJSON("/center/substances.castle?json=true&callback=?",function(data){
					$('#ddi_only_'+count).append(function(){
						var ophtml="";
						ophtml+='<optgroup label="Drug Substances">';
						$.each(data,function(i,v){
							if(v.ddi!=="yes"){
								ophtml+="<option value='"+v.baseid+"' data-baseid='"+v.baseid+"' data-name='"+v.name+"' data-abbreviated='"+v.abbreviated+"'   >"+v.name+" ( "+v.abbreviated+" )</option>";
							}
						});
						ophtml+='</optgroup>';
		
						ophtml+='<optgroup label="DDI ONLY Substances">';
						$.each(data,function(i,v){
							if(v.ddi==="yes"){
								ophtml+="<option value='"+v.baseid+"' data-baseid='"+v.baseid+"' data-name='"+v.name+"' data-abbreviated='"+v.abbreviated+"'   >"+v.name+" ( "+v.abbreviated+" )</option>";
							}
						});
						ophtml+='</optgroup>';
						return ophtml;
					});
				});
				$.chai.drug.apply_ddi_removal();
			});
		},
		
		
		drug_popupForm:function (id){
			if($("#drug_form").length===0){
				$("#staging").append("<div id='drug_form'></div>");
			}
			$.ajax({cache: false,
			   url:"/center/drug.castle",
			   data:{"skiplayout":1,"id":typeof(id)==="undefined"?"":id,typed_ref:$('[name="typed_ref"]').val()},
			   success: function(data){
				   var drug_form_dialog = $( "#drug_form" );
					drug_form_dialog.html(data);
					drug_form_dialog.dialog({
						autoOpen: true,
						resizable: false,
						width: $(window).width()-50,
						height: $(window).height()-50,
						modal: true,
						draggable : false,
						buttons: {
							Cancel: function() {
								$( this ).dialog( "close" );
							}
						},
						create:function(){
	
							$( "#mess" ).dialog( "destroy" );
							$( "#mess" ).remove();
							
							
							$('body').css({overflow:"hidden"});
							$(".ui-dialog-buttonpane").remove();
							/*
							$(".formstateaction").html($(".ui-dialog-buttonpane"));
							$(".ui-dialog-buttonpane:not(.formstateaction .ui-dialog-buttonpane)").remove();
							*/
							$.chai.drug.ini();
	
							var tabContents = drug_form_dialog.find(".tab_content").hide(), tabs = drug_form_dialog.find("ul.tabs li");
							tabs.addClass("tabed");
							tabs.first().addClass("active").show();
							tabContents.first().show();
							
							tabs.on("click",function(e) { e.preventDefault(); e.stopPropagation();
								var $this = $(this), activeTab = $this.find('a').attr('href');
								
								if(!$this.hasClass('active')){
									$this.addClass('active').siblings().removeClass('active');
									tabContents.hide().filter(activeTab).fadeIn();
								} return false;
							});	
							$( ".uitabs" ).tabs();
	
	
							//drug_form_dialog.find('[name="item.trials.baseid"]').val($('.container [name="item.baseid"]').val());
	
							drug_form_dialog.find("[type='submit']").on("click",function(e){
								
								var form = $(this).closest("form");
								if (form.find(':invalid').length<=0) {
									e.preventDefault();
									e.stopPropagation();
									$.chai.core.util.popup_message('<span style="font-size: 28px;"><i class="icon-spinner icon-spin icon-large"></i>Saving...</span>',true);
									$.post(form.attr("action")+"?skiplayout=1&ajaxed_update=1",form.serialize(),function(){//(data){
										//var parts= data.split(',');
										$( "#mess" ).dialog( "destroy" );
										$( "#mess" ).remove();
	
										var dataTable = $("#drug_products.tab_content").find('.dataTable');
										
										var count = $("#drug_products.tab_content .datagrid tbody tr").length + 1;
										if($("#drug_products.tab_content  .datagrid tbody tr td.dataTables_empty").length){
											count--;
										}
										console.log("in list before add "+count);
										
										
										
										var tableData = [];
										var baseid = form.find('[name="item.baseid"]').val();
										if($("#drug_products.tab_content .dataTable [value='"+baseid+"']").length<=0){
											var html =  form.find('[name="item.dose_form"]').val() + '<input type="hidden" name="drugs['+count+'].baseid" value="'+baseid+'" class="list_item drug_item">';
											tableData.push( html );
											tableData.push( form.find('[name="item.label_claim"]').val() );
											tableData.push( form.find('header h3 > em').text() );
											tableData.push( "-refresh for drugs-" );
											tableData.push( form.find('#manufacturer_info').text() ); 
											tableData.push( '<a href="#" class="button xsmall crimson defocus removal"><i class="icon-remove" title="Remove"></i></a>' ); 
											dataTable.dataTable().fnAddData( tableData );
										}
										
										$.chai.core.util.build_general_removal_button($("ul .display.datagrid.dataTable .removal"));
										$.chai.core.util.close_dialog_modle($( "#drug_form" ));
									});
								}
							});	
							
							//$.chai.core.util.set_up_form(type,inlist,use);
							//$.chai.core.util.activate_adverse_ui();
						},
						close: function() {
							$.chai.core.util.close_dialog_modle($( "#drug_form" ));
						}
					});
					$.chai.core.util.set_diamodle_resizing($( "#drug_form" ));	
					
				}
			});
	
	
		},
		
	};
})(jQuery);
// JavaScript Document
(function($) {
	$.chai.substance = {
		ini:function(){
			$.chai.core.util.setup_viewlog();
			$.chai.core.util.setup_curate();
			$.chai.form_base.ini();
	
			$( "#ddiradio" ).buttonset();
			$('#ddiradio :radio').on('change',function () {
				$('#ddiradio :radio').next("label").find("i").removeClass("icon-check-empty").removeClass("icon-check");
				$('#ddiradio :radio').not(":checked").next("label").find("i").addClass("icon-check-empty");
				$('#ddiradio :radio:checked').next("label").find("i").addClass("icon-check");
			});
			
			
			
			
			$('#add_substance_salt').on("click",function(e){
				e.preventDefault();
				e.stopPropagation();
				var dataTable = $('#Saltdata.dataTable');
				var tableData = [];
				
				var count = $("#Saltdata tbody select").length;
		
		
				var html = '<input type="hidden" name="salts['+(count)+'].id" value="0"/><select name="salts['+(count)+'].is_salt"><option value="Yes">Yes</option><option value="No">No</option></select>';
				tableData.push( html );
				tableData.push( '<input type="text" value="" name="salts['+(count)+'].form"/>' ); 
				tableData.push( '<a href="#" class="button xsmall crimson defocus removal"><i class="icon-remove" title="Remove"></i></a>' ); 
				
				dataTable.dataTable().fnAddData( tableData );
				
				$.chai.core.util.build_general_removal_button($("#Saltdata tbody .removal"));
			});	
		
				
			$('#add_substance_prodrug').on("click",function(e){
				e.preventDefault();
				e.stopPropagation();
				var dataTable = $('#Prodrugdata.dataTable');
				var tableData = [];
				
				var count = $("#Prodrugdata tbody select").length;
		
				var html = '<input type="hidden" name="prodrugs['+(count)+'].id" value="0"/>';//<select name="prodrugs['+(count)+'].pro_drug"><option value="Yes">Yes</option><option value="No">No</option></select>';
				//tableData.push( html );
				tableData.push( html+'<input type="text" value="" name="prodrugs['+(count)+'].active_moiety"/>' ); 
				tableData.push( '<input type="text" value="" name="prodrugs['+(count)+'].active_metabolites"/>' );
				tableData.push( '<a href="#" class="button xsmall crimson defocus removal"><i class="icon-remove" title="Remove"></i></a>' ); 
		
				
				dataTable.dataTable().fnAddData( tableData );
				
				
				$.chai.core.util.build_general_removal_button($("#Prodrugdata tbody .removal"));
			});
		}
	};
})(jQuery);
// JavaScript Document
(function($) {
	$.chai.reference = {
		ini:function(){
			$.chai.form_base.ini();
			$.chai.reference.int_file();
			$.chai.core.util.setup_ref_copy();
		},
		int_file:function(){
			$("#load_file").on("click",function(){
				$(".load_file").toggleClass("active");
				$(".load_file input").removeAttr("required");
				$(".load_file:visible input").attr("required",true);
			});
		},
		ref_popup_primer:function(){
			var loading = '<span style="font-size: 28px;"><i class="icon-spinner icon-spin icon-large"></i> Loading content...</span>';
			$(".ref_form").on("click",function(e){
				e.preventDefault();
				e.stopPropagation();
				$.chai.core.util.popup_message(loading,true);
				//$.chai.reference.ref_popup_form();
				var inlist = [];
				$.chai.reference.add_item_popup(inlist,["new","list"]);
			});	
			$('.ref_inline_edit').on('click',function(e){
				e.preventDefault();
				e.stopPropagation();
				$.chai.core.util.popup_message(loading,true);
				$.chai.reference.ref_popup_form($(this).closest('tr').data('baseid'));
			});
		},
		add_item_popup:function (inlist){
			if($("#ref_form").length===0){
				$("#staging").append("<div id='ref_form'><div id='drug_list'></div><div id='drug_item'></div></div>");
			}
	
			var buttons = "";
	
	
			$.ajax({cache: false,
			   url:"/center/references.castle",
			   data:{"skiplayout":1,"exclude":inlist,typed_ref:$('[name="typed_ref"]').val()},
			   success: function(data){
					$("#drug_list").html(data);
					buttons += "<a href='#drug_list' id='drug_list_tab' class='popuptab button med active'>List</a>";
					$.ajax({cache: false,
					   url:"/center/reference.castle",
					   data:{"skiplayout":1,typed_ref:$('[name="typed_ref"]').val()},
					   success: function(data){
							$("#drug_item").html(data);
							buttons += "<a href='#drug_item' id='drug_item_tab' class='popuptab button med'>New</a>";
							$( "#ref_form" ).dialog({
								autoOpen: true,
								resizable: false,
								width: $(window).width()-50,
								height: $(window).height()-50,
								modal: true,
								draggable : false,
								buttons: {
									Cancel: function() {
										$( this ).dialog( "close" );
									}
								},
								create:function(){
									$( "#mess" ).dialog( "destroy" );
									$( "#mess" ).remove();
	
									$('body').css({overflow:"hidden"});
									$(".ui-dialog-buttonpane").remove();
									$("#ref_form").closest('.ui-dialog').find('.ui-dialog-title').append(buttons);
									$("#drug_item").hide();
									$.chai.core.util.make_popup_datatable("reference");
									$(".popuptab").off().on("click",function(e){
										e.preventDefault();
										e.stopPropagation();
										var id = $(".popuptab.active").attr("href");
										$(id).hide();
										$(".popuptab.active").removeClass('active');
										$(this).addClass('active');
										id = $(this).attr("href");
										$(id).show();	
										
									});
									$.chai.reference.ini_inline_form($( "#ref_form" ));
								},
								close: function() {
									$.chai.core.util.close_dialog_modle($( "#ref_form" ));
									$.chai.core.util.last_datatable=null;
								}
							});
							$.chai.core.util.set_diamodle_resizing($( "#ref_form" ));	
						}
					});
				}
			});
		},
		ref_popup_form:function (id){
			if($("#ref_form").length===0){
				$("#staging").append("<div id='ref_form'></div>");
			}
			$.ajax({cache: false,
			   url:"/center/reference.castle",
			   data:{"skiplayout":1,"id":typeof(id)==="undefined"?"":id,typed_ref:$('[name="typed_ref"]').val()},
			   success: function(data){
				   var ref_form_dialog = $( "#ref_form" );
					ref_form_dialog.html(data);
					ref_form_dialog.dialog({
						autoOpen: true,
						resizable: false,
						width: $(window).width()-50,
						height: $(window).height()-50,
						modal: true,
						draggable : false,
						buttons: {
							Cancel: function() {
								$( this ).dialog( "close" );
							}
						},
						create:function(){
	
							$( "#mess" ).dialog( "destroy" );
							$( "#mess" ).remove();
							
							
							$('body').css({overflow:"hidden"});
							$(".ui-dialog-buttonpane").remove();
	
							$.chai.reference.ini_inline_form(ref_form_dialog);
							
							//$.chai.core.util.set_up_form(type,inlist,use);
							//$.chai.core.util.activate_adverse_ui();
						},
						close: function() {
							$.chai.core.util.close_dialog_modle($( "#ref_form" ));
						}
					});
					$.chai.core.util.set_diamodle_resizing($( "#ref_form" ));	
					
				}
			});
	
		},
		ini_inline_form:function(ref_form_dialog){
			$.chai.reference.int_file();
			ref_form_dialog.find('[name="item.trials.baseid"]').val($('.container [name="item.baseid"]').val());
			ref_form_dialog.find("[type='submit']").on("click",function(e){
				var form = $(this).closest("form");
				if (form.find(':invalid').length<=0) {
					e.preventDefault();
					e.stopPropagation();
					$.chai.core.util.popup_message('<span style="font-size: 28px;"><i class="icon-spinner icon-spin icon-large"></i>Saving...</span>',true);
					$.post(form.attr("action")+"?skiplayout=1&ajaxed_update=1",form.serialize(),function(){//(data){
						//var parts= data.split(',');
						$( "#mess" ).dialog( "destroy" );
						$( "#mess" ).remove();
	
						var dataTable = $("#trial_arms.tab_content").find('.dataTable');
						
						var count = $("#trial_arms.tab_content .datagrid tbody tr").length + 1;
						if($("#trial_arms.tab_content  .datagrid tbody tr td.dataTables_empty").length){
							count--;
						}
						console.log("in list before add "+count);
						
						
						
						var tableData = [];
						var baseid = form.find('[name="item.baseid"]').val();
						if(baseid<=0){
							var html =  baseid+ '<input type="hidden" name="references['+count+'].baseid" value="'+baseid+'" class="drug_item">';
							tableData.push( html );
							tableData.push( form.find('[name="item.name"]').val() );
							tableData.push( "-refresh for drugs-" ); 
							tableData.push( '<a href="#" class="button xsmall crimson defocus removal"><i class="icon-remove" title="Remove"></i></a>' ); 
							dataTable.dataTable().fnAddData( tableData );
						}
	
						$.chai.core.util.build_general_removal_button($("ul .display.datagrid.dataTable .removal"));
						
						$( "#ref_form" ).dialog( "destroy" );
						$( "#ref_form" ).remove();
					});
				}
			});		
		},
	};
})(jQuery);
(function($) {
	$.chai.ready=function (options){
		$(document).ready(function() {
			var page,location;
			location=window.location.pathname;
			page=location.substring(location.lastIndexOf("/") + 1);
			page=page.substring(0,page.lastIndexOf("."));
			if(typeof($.chai[page])!=="undefined"){
				$.chai[page].ini();
				$.chai.core.util.setup_ref_copy();
			}else{
				$.chai.core.util.make_dataTables();
				$.chai.core.util.set_up_list_deletion();
			}
			return options;
		});
	};
	$.chai.ini();
})(jQuery);