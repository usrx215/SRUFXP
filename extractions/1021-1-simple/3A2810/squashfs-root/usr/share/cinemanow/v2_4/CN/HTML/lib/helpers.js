1/**
 * @author tjmchattie
 * General helper methods
 */
//-----------------------------------------------------------------------------
// helpers.js
// Copyright (c) 2012 - 2013, Rovi Corporation.  All rights reserved.
//-----------------------------------------------------------------------------
 
var helpers = {
	extend: function(a,b) {
		for (var k in (b||{})) {
            a[k] = b[k];
        }
        return a;
    }
};

helpers.extend(Element.prototype, {
	isParentOf: function(childNode) {
		if (childNode.getParent() == this) {
			return true;
		} else if (childNode.getParent() != null) {
			return this.isParentOf(childNode.getParent(), this);
		}
		return false;
	},
	intersects: function(element) {
		if ((this.offsetLeft == element.offsetLeft)  ||
			((this.offsetLeft > element.offsetLeft) && this.offsetLeft + this.offsetWidth <= element.offsetLeft + element.offsetWidth))
			return true;
		else
			return false;
	}
});

Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] == obj) {
            return true;
        }
    }
    return false;
};

helpers.extend(String.prototype, {
	reverse: function() {
		return String(Array.slice(this).reverse().join(''));
	},
    trim: function() {
		return this.replace(/^\s+|\s+$/g, '');
    },
    endsWith: function(str) {
        var lastIndex = this.lastIndexOf(str);
        return (lastIndex != -1) && (lastIndex + str.length == this.length);
    },
	repeat: function (count) {
		var str = '';
		for (var i=0; i < count; i++) str += this;
		return str;
	},
    camelize: function() {
		return this.replace(/-\D/g, function(match) {
            return match.charAt(1).toUpperCase();
        });
    },
    hyphenate: function() {
		return this.replace(/[A-Z]/g, function(match) {
            return '-' + match.charAt(0).toLowerCase();
        });
    },
    capitalize: function() {
		return this.replace(/\b[a-z]/g, function(match) {
            return match.toUpperCase();
        });
    },
    clean: function() {
		return this.trim(this.replace(/\s{2,}/g, ' '));
    },
    
    toElement: function() {
        return new Element('div', {html:this}).getFirst();
    },
    stripHTML: function() {
    	var matchTag = /<(?:.|\s)*?>/g;
    	return this.replace(matchTag, "");
    },
    first: function(length){
    	var tmp = this;
    	
    	if(this.length > length) {
    		tmp = tmp.substring(0, length);
    	}
    	
    	return tmp;
    },
    firstWithEllips: function(length){
    	var tmp = this;
    	
    	if(this.length > length) {
    		tmp = tmp.substring(0, length) + "...";
    	}
    	
    	return tmp;
    },
    visualLength: function() {
        var ruler = $("ruler");
        ruler.innerHTML = this;
        log.write("Ruler Width: " + ruler.offsetWidth);
        return ruler.offsetWidth;
    },
    ellipsToPixels: function(length) {
    	//NOTE: This should NOT be used for large strings but works fine for short strings. 
        var tmp = this;
        var trimmed = this;
        if (tmp.visualLength() > length)
        {
            trimmed += "...";
            while (trimmed.visualLength() > length)
            {
                tmp = tmp.substring(0, tmp.length-1);
                trimmed = tmp + "...";
            }
        }

        return trimmed;
    }
});

function $_(key) {
	if (arguments.length < 1) {
		return widget.getLocalizedString(key);
	} else {
		return KONtx.utility.vsprintf(widget.getLocalizedString(key), arguments);
	}
}

var utility = {
    /**
    */
    vsprintf: function (format, args) { 
		var regex = /%%|%(\d+\$)?([-+#0 ]*)(\*\d+\$|\*|\d+)?(\.(\*\d+\$|\*|\d+))?([scboxXuidfegEG])/g;
        var a = args, i = 0;
     
        // pad()
        var pad = function(str, len, chr, leftJustify) {
            var padding = (str.length >= len) ? '' : Array(1 + len - str.length >>> 0).join(chr);
            return leftJustify ? str + padding : padding + str;
        };
     
        // justify()
        var justify = function(value, prefix, leftJustify, minWidth, zeroPad) {
            var diff = minWidth - value.length;
            if (diff > 0) {
                if (leftJustify || !zeroPad) {
                    value = pad(value, minWidth, ' ', leftJustify);
                } else {
                    value = value.slice(0, prefix.length) + pad('', diff, '0', true) + value.slice(prefix.length);
                }
            }
            return value;
        };
     
        // formatBaseX()
        var formatBaseX = function(value, base, prefix, leftJustify, minWidth, precision, zeroPad) {
            // Note: casts negative numbers to positive ones
            var number = value >>> 0;
            prefix = prefix && number && {'2': '0b', '8': '0', '16': '0x'}[base] || '';
            value = prefix + pad(number.toString(base), precision || 0, '0', false);
            return justify(value, prefix, leftJustify, minWidth, zeroPad);
        };
     
        // formatString()
        var formatString = function(value, leftJustify, minWidth, precision, zeroPad) {
            if (precision != null) {
                value = value.slice(0, precision);
            }
            return justify(value, '', leftJustify, minWidth, zeroPad);
        };
     
        // finalFormat()
        var doFormat = function(substring, valueIndex, flags, minWidth, _, precision, type) {
            if (substring == '%%') return '%';
     
            // parse flags
            var leftJustify = false, positivePrefix = '', zeroPad = false, prefixBaseX = false;
            var flagsl = flags.length;
            for (var j = 0; flags && j < flagsl; j++) switch (flags.charAt(j)) {
                case ' ': positivePrefix = ' '; break;
                case '+': positivePrefix = '+'; break;
                case '-': leftJustify = true; break;
                case '0': zeroPad = true; break;
                case '#': prefixBaseX = true; break;
            }
     
            // parameters may be null, undefined, empty-string or real valued
            // we want to ignore null, undefined and empty-string values
            if (!minWidth) {
                minWidth = 0;
            } else if (minWidth == '*') {
                minWidth = +a[i++];
            } else if (minWidth.charAt(0) == '*') {
                minWidth = +a[minWidth.slice(1, -1)];
            } else {
                minWidth = +minWidth;
            }
     
            // Note: undocumented perl feature:
            if (minWidth < 0) {
                minWidth = -minWidth;
                leftJustify = true;
            }
     
            if (!isFinite(minWidth)) {
                throw new Error('sprintf: (minimum-)width must be finite');
            }
     
            if (!precision) {
                precision = 'fFeE'.indexOf(type) > -1 ? 6 : (type == 'd') ? 0 : void(0);
            } else if (precision == '*') {
                precision = +a[i++];
            } else if (precision.charAt(0) == '*') {
                precision = +a[precision.slice(1, -1)];
            } else {
                precision = +precision;
            }
     
            // grab value using valueIndex if required?
            var value = valueIndex ? a[valueIndex.slice(0, -1)] : a[i++];
     
            switch (type) {
                case 's': return formatString(String(value), leftJustify, minWidth, precision, zeroPad);
                case 'c': return formatString(String.fromCharCode(+value), leftJustify, minWidth, precision, zeroPad);
                case 'b': return formatBaseX(value, 2, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
                case 'o': return formatBaseX(value, 8, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
                case 'x': return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
                case 'X': return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad).toUpperCase();
                case 'u': return formatBaseX(value, 10, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
                case 'i':
                case 'd': {
                            var number = parseInt(+value);
                            var prefix = number < 0 ? '-' : positivePrefix;
                            value = prefix + pad(String(Math.abs(number)), precision, '0', false);
                            return justify(value, prefix, leftJustify, minWidth, zeroPad);
                        }
                case 'e':
                case 'E':
                case 'f':
                case 'F':
                case 'g':
                case 'G':
                            {
                            var number = +value;
                            var prefix = number < 0 ? '-' : positivePrefix;
                            var method = ['toExponential', 'toFixed', 'toPrecision']['efg'.indexOf(type.toLowerCase())];
                            var textTransform = ['toString', 'toUpperCase']['eEfFgG'.indexOf(type) % 2];
                            value = prefix + Math.abs(number)[method](precision);
                            return justify(value, prefix, leftJustify, minWidth, zeroPad)[textTransform]();
                        }
                default: return substring;
            }
        };
     
        return format.replace(regex, doFormat);
    },
	
	/**
    @class timer
    @static
    */
    timer: {
        /**
        Provides an incremental timer mechanism
        @method setInterval
        @type function
        @param callback {Function} The function to execute when the poll value expires
        @param poll {Integer} the time in milliseconds before the callback is fired
        @return {Object} Reference to the timer
        */
        setInterval: function(callback, poll) {
			var timer = new Timer();
            timer.onTimerFired = callback;
            timer.interval = poll / 1000;
            timer.ticking = true;
            return timer;
        },
        
        /**
        Clears and deletes the provided timer
        @method clearInterval
        @type function
        @param timer {Object} a reference to the timer
        @return void
        */
        clearInterval: function(timer) {
			timer.ticking = false;
            delete timer;
        },
        
        /**
        setTimeout
        @method setTimeout
        @type function
        */
        setTimeout: function(callback, poll) {
			var timer = new Timer();
            timer.onTimerFired = function() {
                this.ticking = false;
                callback();
            };
            timer.interval = poll / 1000;
            timer.ticking = true;
            return timer;
        },
        
        /**
        clearTimeout
        @method clearTimeout
        @type function
        */
        clearTimeout: function(timer) {
			timer.ticking = false;
            delete timer;
        }
        
    },
    
    /**
    @class generate
    @static
    */
    generate: {
        /**
        Returns an ID and applies it to the element "el", if provided.
        */
    	counter: 0,
        id: function(element) {
    		
			// don't override existing element.id
            if (element && element.id && !$empty(element.id)) {
                return element.id;
            }
            return 'app-gen-' + application.utility.generate.counter++;                        
        },
        
        /**
        generate a random number below a certain limit
        @method generateRandomNumber
        */
        randomNumber: function(limit) {
			return Math.floor(Math.random() * (limit || 1000));
        }
        
	}
};

//Create a JSON object only if one does not already exist. We create the
//methods in a closure to avoid creating global variables.

if (!this.JSON) {
this.JSON = {};
}

(function () {

function f(n) {
    // Format integers to have at least two digits.
    return n < 10 ? '0' + n : n;
}

if (typeof Date.prototype.toJSON !== 'function') {

    Date.prototype.toJSON = function (key) {

        return isFinite(this.valueOf()) ?
               this.getUTCFullYear()   + '-' +
             f(this.getUTCMonth() + 1) + '-' +
             f(this.getUTCDate())      + 'T' +
             f(this.getUTCHours())     + ':' +
             f(this.getUTCMinutes())   + ':' +
             f(this.getUTCSeconds())   + 'Z' : null;
    };

    String.prototype.toJSON =
    Number.prototype.toJSON =
    Boolean.prototype.toJSON = function (key) {
        return this.valueOf();
    };
}

var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
    escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
    gap,
    indent,
    meta = {    // table of character substitutions
        '\b': '\\b',
        '\t': '\\t',
        '\n': '\\n',
        '\f': '\\f',
        '\r': '\\r',
        '"' : '\\"',
        '\\': '\\\\'
    },
    rep;


function quote(string) {

//If the string contains no control characters, no quote characters, and no
//backslash characters, then we can safely slap some quotes around it.
//Otherwise we must also replace the offending characters with safe escape
//sequences.

    escapable.lastIndex = 0;
    return escapable.test(string) ?
        '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string' ? c :
                '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' :
        '"' + string + '"';
}


function str(key, holder) {

//Produce a string from holder[key].

    var i,          // The loop counter.
        k,          // The member key.
        v,          // The member value.
        length,
        mind = gap,
        partial,
        value = holder[key];

//If the value has a toJSON method, call it to obtain a replacement value.

    if (value && typeof value === 'object' &&
            typeof value.toJSON === 'function') {
        value = value.toJSON(key);
    }

//If we were called with a replacer function, then call the replacer to
//obtain a replacement value.

    if (typeof rep === 'function') {
        value = rep.call(holder, key, value);
    }

//What happens next depends on the value's type.

    switch (typeof value) {
    case 'string':
        return quote(value);

    case 'number':

//JSON numbers must be finite. Encode non-finite numbers as null.

        return isFinite(value) ? String(value) : 'null';

    case 'boolean':
    case 'null':

//If the value is a boolean or null, convert it to a string. Note:
//typeof null does not produce 'null'. The case is included here in
//the remote chance that this gets fixed someday.

        return String(value);

//If the type is 'object', we might be dealing with an object or an array or
//null.

    case 'object':

//Due to a specification blunder in ECMAScript, typeof null is 'object',
//so watch out for that case.

        if (!value) {
            return 'null';
        }

//Make an array to hold the partial results of stringifying this object value.

        gap += indent;
        partial = [];

//Is the value an array?

        if (Object.prototype.toString.apply(value) === '[object Array]') {

//The value is an array. Stringify every element. Use null as a placeholder
//for non-JSON values.

            length = value.length;
            for (i = 0; i < length; i += 1) {
                partial[i] = str(i, value) || 'null';
            }

//Join all of the elements together, separated with commas, and wrap them in
//brackets.

            v = partial.length === 0 ? '[]' :
                gap ? '[\n' + gap +
                        partial.join(',\n' + gap) + '\n' +
                            mind + ']' :
                      '[' + partial.join(',') + ']';
            gap = mind;
            return v;
        }

//If the replacer is an array, use it to select the members to be stringified.

        if (rep && typeof rep === 'object') {
            length = rep.length;
            for (i = 0; i < length; i += 1) {
                k = rep[i];
                if (typeof k === 'string') {
                    v = str(k, value);
                    if (v) {
                        partial.push(quote(k) + (gap ? ': ' : ':') + v);
                    }
                }
            }
        } else {

//Otherwise, iterate through all of the keys in the object.

            for (k in value) {
                if (Object.hasOwnProperty.call(value, k)) {
                    v = str(k, value);
                    if (v) {
                        partial.push(quote(k) + (gap ? ': ' : ':') + v);
                    }
                }
            }
        }

//Join all of the member texts together, separated with commas,
//and wrap them in braces.

        v = partial.length === 0 ? '{}' :
            gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                    mind + '}' : '{' + partial.join(',') + '}';
        gap = mind;
        return v;
    }
}

//If the JSON object does not yet have a stringify method, give it one.

if (typeof JSON.stringify !== 'function') {
    JSON.stringify = function (value, replacer, space) {

//The stringify method takes a value and an optional replacer, and an optional
//space parameter, and returns a JSON text. The replacer can be a function
//that can replace values, or an array of strings that will select the keys.
//A default replacer method can be provided. Use of the space parameter can
//produce text that is more easily readable.

        var i;
        gap = '';
        indent = '';

//If the space parameter is a number, make an indent string containing that
//many spaces.

        if (typeof space === 'number') {
            for (i = 0; i < space; i += 1) {
                indent += ' ';
            }

//If the space parameter is a string, it will be used as the indent string.

        } else if (typeof space === 'string') {
            indent = space;
        }

//If there is a replacer, it must be a function or an array.
//Otherwise, throw an error.

        rep = replacer;
        if (replacer && typeof replacer !== 'function' &&
                (typeof replacer !== 'object' ||
                 typeof replacer.length !== 'number')) {
            throw new Error('JSON.stringify');
        }

//Make a fake root object containing our value under the key of ''.
//Return the result of stringifying the value.

        return str('', {'': value});
    };
}


//If the JSON object does not yet have a parse method, give it one.

if (typeof JSON.parse !== 'function') {
    JSON.parse = function (text, reviver) {

//The parse method takes a text and an optional reviver function, and returns
//a JavaScript value if the text is a valid JSON text.

        var j;

        function walk(holder, key) {

//The walk method is used to recursively walk the resulting structure so
//that modifications can be made.

            var k, v, value = holder[key];
            if (value && typeof value === 'object') {
                for (k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        v = walk(value, k);
                        if (v !== undefined) {
                            value[k] = v;
                        } else {
                            delete value[k];
                        }
                    }
                }
            }
            return reviver.call(holder, key, value);
        }


//Parsing happens in four stages. In the first stage, we replace certain
//Unicode characters with escape sequences. JavaScript handles many characters
//incorrectly, either silently deleting them, or treating them as line endings.

        cx.lastIndex = 0;
        if (cx.test(text)) {
            text = text.replace(cx, function (a) {
                return '\\u' +
                    ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            });
        }

//In the second stage, we run the text against regular expressions that look
//for non-JSON patterns. We are especially concerned with '()' and 'new'
//because they can cause invocation, and '=' because it can cause mutation.
//But just to be safe, we want to reject all unexpected forms.

//We split the second stage into 4 regexp operations in order to work around
//crippling inefficiencies in IE's and Safari's regexp engines. First we
//replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
//replace all simple value tokens with ']' characters. Third, we delete all
//open brackets that follow a colon or comma or that begin the text. Finally,
//we look to see that the remaining characters are only whitespace or ']' or
//',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

        if (/^[\],:{}\s]*$/.
test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').
replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

//In the third stage we use the eval function to compile the text into a
//JavaScript structure. The '{' operator is subject to a syntactic ambiguity
//in JavaScript: it can begin a block or an object literal. We wrap the text
//in parens to eliminate the ambiguity.
            j = eval('(' + text + ')');

//In the optional fourth stage, we recursively walk the new structure, passing
//each name/value pair to a reviver function for possible transformation.

            return typeof reviver === 'function' ?
                walk({'': j}, '') : j;
        }

//If the text is not JSON parseable, then a SyntaxError is thrown.

        throw new SyntaxError('JSON.parse');
    };
}
}());

$cn.utilities.adjustDate = function(result, replacementPattern)
{           
   if (result.expirationMessage && replacementPattern)
   {
       log.write("message is: " + result.expirationMessage);
        var regex = new RegExp("([0-9]+)/([0-9]+)/([0-9]+)");
        result.expirationMessage = result.expirationMessage.toString().replace(regex, replacementPattern);
   }
};

$cn.utilities.truncateText = function(item, text, height, start, stop) {
	if (start < stop - 1) {
		var pos = Math.floor((start + stop) / 2);
		application.putInnerHTML(item, text.substr(0, pos));
		
		
		if (item.offsetHeight <= height)
			return this.truncateText(item, text, height, pos, stop);
		else
			return this.truncateText(item, text, height, start, pos);
	} else {
		return $cn.utilities.ellipsis(text, start);
	}
};

$cn.utilities.ellipsis = function(s, l) {
    if(s.length > 3 && s.length > l) {
        
        var idx = l - 4;
        var c = s[idx];
		
        while((c == ' ' || c == '.') && idx > 0){
            
            c = s[idx];
            idx--;
        }
        
        s = s.substr(0, idx + 1) + '...';
        
    }
    if(s.indexOf("##") > -1){
    	if(s.substring(s.length - 3, 3).indexOf("##") == -1) {
    		s = s + "##";
    	}
    }
    
    return s;
};

$cn.utilities.addEpisodeColons = function(s){
    if(isNaN(s)){
        return s;
    } else {
        return s + ":";
    }
};

$cn.utilities.highlightKeywordForTitlename = function(s, keyword) {
	var str=''; 
	var style=' style="color:#FDCC4D;" ';
	var re = new RegExp('('+keyword+')', 'gi'); 
	str = s.replace(re, '<span '+style+'>$1</span>');
	return str; 
};

$cn.utilities.safeSelect = function(s) {
	
	return s.replace(/\'/g, "\\'");
};

$cn.utilities.highlightKeywordForSynopsis = function(s, keyword) {
	if (s == null || s.length == 0)
		return s;
		
	var str='';
	var len = s.length;
	var ellipsLength = BrowseView.GridControl.getElipsisLength();
	
	if (keyword && keyword.length > 0) {
		var style=' style="color:#FDCC4D;" ';
		var re = new RegExp('('+keyword+')', 'gi'); 
		var show = re.exec(s);
		
		if (show == null || show.index < 0 || BrowseView.currentState != 'search-view') // no keyword match
			str = s; //$cn.utilities.ellipsis(s, ellipsLength);
		else if (show.index < 30)
			str = s.replace(re, '<span '+style+'>$1</span>');
		else
		{
			str = "..." + s.substring(show.index - 30, len).replace(re, '<span '+style+'>' + application.resource.currency_symbol + '1</span>');
		}
	} 
	else
	{
		str = s;
	}
	log.write('highlighted string: ' + str);
	return str; 
};

$cn.utilities.getMeta = function(key, collection) {
    var val = '';
    
	collection.each(function(item){
		if(item.keyName == key){
			val = item.keyValue;
		}
	});
    
    return val;
};

$cn.utilities.setMeta = function(key, value, collection) {
	collection.each(function(item) {
		if(item.keyName == key) {
			item.keyValue = value;
		}
	});
};

$cn.utilities.haveGenreId = function(genreId) {
    var haveId = false,
        numGenres = $cn.data.Navigation.genres.length,
        i;

    for (i=0; i < numGenres; ++i) {
        if("" + $cn.data.Navigation.genres[i].iD === "" + genreId) {
            haveId = true;
            i = numGenres;
        }
    }
    return haveId;
};

$cn.utilities.recommendedForYouGuess = function(key){
	var homeNode;
	
	$cn.data.Navigation.genres.each(function(item){
		if(nav.parentId == 0){
			homeNode = item.iD;
		}

	});
};

$cn.utilities.measure = function(element){
	return element.measure(function(){ return this.getSize(); });
};

// Check whether two "string like" things are equal.
$cn.utilities.isEqual = function (valueA, valueB){
    if (valueA && valueB || ("" === valueA && "" === valueB)) {
        return valueA.toString().toLowerCase() === valueB.toString().toLowerCase();
    } else {
        return false;
    }
};

// Check whether a Server Response is "truthy"
$cn.utilities.isTrue = function(value){
    return $cn.utilities.isEqual("true", value);
};
$cn.utilities.getResponseCodeStatus = function(code){
    return application.resource.uv_responseCodes[code].status;
};

$cn.utilities.addHiddenClass = function(elementid){
	if(document.getElementById(elementid)){
    	$(elementid).addClass('hidden');
	}
};

$cn.utilities.removeHiddenClass = function(elementid){
	if(document.getElementById(elementid)){
    	$(elementid).removeClass('hidden');
	}
};

$cn.utilities.inArray = function (theNeedle, theArray) {
    var length, i;

    if (theArray) {
        length = theArray.length;

        for (i = 0; i < length; i++) {
            // Skip accessing in sparse arrays
            if (i in theArray && theArray[ i ] === theNeedle) {
                return i;
            }
        }
    }

    // If not found return -1
    // We return -1 and not false, since 0 is a possible outcome with truthy implications,
    // and false and 0 are easy to confuse.
    return -1;
};

var Timer = function() {		
	// Property: Frequency of elapse event of the timer in millisecond
	this.Interval = 1000;
	
	// Property: Whether the timer is enable or not
	this.Enable = new Boolean(false);
	
	// Event: Timer tick
	this.Tick;
	
	this.isRunning = false;
	
	var timerId = 0, // Member variable: Hold interval id of the timer
		thisObject; // Member variable: Hold instance of this class
	
	
	// Function: Start the timer
	this.Start = function()
	{
		this.Enable = new Boolean(true);

		thisObject = this;
		if (thisObject.Enable)
		{
			thisObject.timerId = setInterval(
			function()
			{
				thisObject.isRunning = true;
				thisObject.Tick(); 
			}, thisObject.Interval);
			
			
		}
	};
	
	// Function: Stops the timer
	this.Stop = function()
	{			
		if(thisObject){
			thisObject.Enable = new Boolean(false);
			clearInterval(thisObject.timerId);
			thisObject.isRunning = false;
		}
	};

};

/* Creates a new Queue. A Queue is a first-in-first-out (FIFO) data structure.
 * Functions of the Queue object allow elements to be enqueued and dequeued, the
 * first element to be obtained without dequeuing, and for the current size of
 * the Queue and empty/non-empty status to be obtained.
 */
function Queue(){

  // the list of elements, initialised to the empty array
  var queue = [];

  // the amount of space at the front of the queue, initialised to zero
  var queueSpace = 0;

  /* Returns the size of this Queue. The size of a Queue is equal to the number
   * of elements that have been enqueued minus the number of elements that have
   * been dequeued.
   */
  this.getSize = function(){

    // return the number of elements in the queue
    return queue.length - queueSpace;

  };

  /* Returns true if this Queue is empty, and false otherwise. A Queue is empty
   * if the number of elements that have been enqueued equals the number of
   * elements that have been dequeued.
   */
  this.isEmpty = function(){

    // return true if the queue is empty, and false otherwise
    return (queue.length == 0);

  };

  /* Enqueues the specified element in this Queue. The parameter is:
   *
   * element - the element to enqueue
   */
  this.enqueue = function(element){
    queue.push(element);
  };

  this.clear = function(element){
	  queue = [];
      queueSpace = 0;
  };
  
  /* Dequeues an element from this Queue. The oldest element in this Queue is
   * removed and returned. If this Queue is empty then undefined is returned.
   */
  this.dequeue = function(){

    // initialise the element to return to be undefined
    var element = undefined;

    // check whether the queue is empty
    if (queue.length){

      // fetch the oldest element in the queue
      element = queue[queueSpace];

      // update the amount of space and check whether a shift should occur
      if (++queueSpace * 2 >= queue.length){

        // set the queue equal to the non-empty portion of the queue
        queue = queue.slice(queueSpace);

        // reset the amount of space at the front of the queue
        queueSpace=0;

      }

    }

    // return the removed element
    return element;

  };

  /* Returns the oldest element in this Queue. If this Queue is empty then
   * undefined is returned. This function returns the same value as the dequeue
   * function, but does not remove the returned element from this Queue.
   */
  this.getOldestElement = function(){

    // initialise the element to return to be undefined
    var element = undefined;

    // if the queue is not element then fetch the oldest element in the queue
    if (queue.length) element = queue[queueSpace];

    // return the oldest element
    return element;

  };

  this.getElementAt = function(index){
    var element = undefined;
    if (queue.length) element = queue[index];
    return element;
  };
  
  this.getOldestIndex = function(){
    return queueSpace;
  };
  
  this.getTotalSize = function(){
    return queue.length;
  };
}

$cn.utilities.formatAsMoney = function(cents) {
	var mnt = cents;
	mnt -= 0;
	return (Math.round(mnt)/100).toFixed(2);
};

$cn.utilities.getNodeText = function(node) {
    var r = "";
    for (var x = 0;x < node.childNodes.length; x++) {
        r = r + node.childNodes[x].nodeValue;
    }
    return r;
};


function two(x) {return ((x>9)?"":"0")+x}
function three(x) {return ((x>99)?"":"0")+((x>9)?"":"0")+x}

$cn.utilities.convertMStoTime = function(ms) {
    var sec = Math.floor(ms/1000)

    var min = Math.floor(sec/60)
    sec = sec % 60
    t = two(sec) 
    
    var hr = Math.floor(min/60)
    min = min % 60
    t = two(min) + ":" + t
    
    if(hr > 0) {
        t = hr + ":" + t;
    }
    
    return t;
};

$cn.utilities.buildPlaybackURL = function(uri, streamid, drmurl, ackurl, heartbeaturl, heartbeatduration, hd, customData) {
	var url = uri + '|DEVICE_ID=' + webservices.uniqueId + '|DEVICET_TYPE_ID=' + webservices.destType + '|STREAM_ID=' + streamid + '|IP_ADDR=|DRM_URL=' + drmurl + '|ACK_URL=' + ackurl + '|HEARTBEAT_URL=' + heartbeaturl + '|HEARTBEAT_PERIOD=' + heartbeatduration + '|I_SEEK=TIME|CUR_TIME=PTS|COMPONENT=WV' + '|TITLE_PROFILE=' + (hd ? 'HD':'SD') + '|CUSTOM_DATA=' + (customData || '') + '|';
	log.write('playback url: ' + url);
	return url;
};


$cn.utilities.DateDiff = function(date1, date2){
    return date1.getTime()-date2.getTime();
};

$cn.utilities.purchaseText = function(title) {
	
	var retString = '', 
		preorder = false, 
		buy = false, 
		rent = false;
	
	title.availableProducts.each(function(item){
		switch(item.purchaseType)
		{
			case "rent":
				rent = true;
				break;
			case "buy":
				buy = true;
				break;
			case "preorder":
				preorder = true;
				break;
				
		}
	});

	if(preorder)
	{
		retString = "Pre-order";
	}
	else if (rent && buy)
	{
		retString = "Rent or Buy";
	}
	else if (rent)
	{
		retString = "Rent";
	}
	else if (buy)
	{
		retString = $cn.utilities.getBuyTextForTitle(title);
	}
		
	return retString;
};

$cn.utilities.getBuyTextForTitle = function(title){
    var retString = "Buy";
    if(title.titleType == "TV_Episode")
        retString += " Episode";

    return retString;
};

$cn.utilities.getPricingSummaryString = function(titleID, buyText, rentText) {
	retString = '';
	var title = $cn.data.TitleSummaryCache[titleID];
	if(!title)
	{
		title = $cn.data.TitleDetailCache[titleID];
	}
	if(title)
	{
		if(title.titleType == "TV_Show" || title.titleType == "TV_Season" || title.titleType == "TV_Episode")
		{
			buyText = "Buy Episodes from"
		}
	
		if(title.rentAvail)
		{
			retString += rentText + ' <span class="bluePrice">' + application.resource.currency_symbol +title.rentPrice+'</span>';
			if(!title.buyAvail && title.titleType == 'Movie')
			{
				retString+='<span class="dividerBar"> | </span>';
				retString+='Buy not available';
			}
		}
		
		if(title.buyAvail && title.rentAvail)
		{
			retString+='<span class="dividerBar"> | </span>';
		}
		
		if(title.buyAvail)
		{
			retString += buyText+' <span class="bluePrice">' + application.resource.currency_symbol + title.buyPrice+'</span>';
			if(!title.rentAvail && title.titleType == 'Movie')
			{
				retString+='<span class="dividerBar"> | </span>';
				retString+='Rent not available';
			}
		}
	}
	return retString;
};

$cn.utilities.getPricingSummaryStringNewSpec = function(titleID, buyText, rentText) {
	retString = '';
	var title = $cn.data.TitleSummaryCache[titleID];
	if(!title)
	{
		title = $cn.data.TitleDetailCache[titleID];
	}
	if(title)
	{
		if(title.titleType == "TV_Show" || title.titleType == "TV_Season" || title.titleType == "TV_Episode")
		{
			buyText = "Buy Episodes from"
		}
	
		if(title.rentAvail)
		{
			retString += rentText + ' <span class="bluePrice">' + application.resource.currency_symbol + title.rentPrice+'</span>';
			if(!title.buyAvail && title.titleType == 'Movie')
			{
				retString+='<br />';
				retString+='Buy not available';
			}
		}
		
		if(title.buyAvail && title.rentAvail)
		{
			retString+='<br />';
		}
		
		if(title.buyAvail)
		{
			retString += buyText+' <span class="bluePrice">' + application.resource.currency_symbol + title.buyPrice+'</span>';
			if(!title.rentAvail && title.titleType == 'Movie')
			{
				retString+='<br />';
				retString+='Rent not available';
			}
		}
	}
	return retString;
};
/*
 
 <div class="rentalInfo">
 	<div class="rentalPrice"></div>
 	<div class="rentalPoints"></div>
 </div>
 <div class="buyInfo">
 	<div class="buyPrice"></div>
 	<div class="buyPoints"></div>
 </div>

 */
$cn.utilities.getPointsAndPricingString = function(titleID, buyText, rentText) {	
	var title 			= $cn.data.TitleSummaryCache[titleID] || $cn.data.TitleDetailCache[titleID],
		rentalPrice		= '',
		rentalPoints	= $cn.utilities.getMeta("LoyaltyPointsForRent", title.metaValues),
		buyPrice		= '',
		buyPoints		= $cn.utilities.getMeta("LoyaltyPointsForBuy", title.metaValues);
	
	if(!title) {
		return "";
	}
		
	rentalPoints = (rentalPoints === '' || parseInt(rentalPoints, 10) <= 0) ? '' : '<div class="redStar"></div>Earn <span class="bluePrice">' + rentalPoints + '</span> pts';
	buyPoints = (buyPoints === '' || parseInt(buyPoints, 10) <= 0) ? '' : '<div class="redStar"></div>Earn <span class="bluePrice">' + buyPoints + '</span> pts';

	if(title.rentAvail)
	{
		rentalPrice  = rentText + ' <span class="bluePrice">' + application.resource.currency_symbol + title.rentPrice + '</span>';		
		if(!title.buyAvail && title.titleType == 'Movie')
		{			
			buyPrice = '<div style="text-align:center" class="notAvailable">' + application.resource.title_availability.buy_not_available + '</div>';			
			buyPoints = '';
		}
	}
	
	if(title.buyAvail)
	{
		if(title.titleType == "TV_Show" || title.titleType == "TV_Season" || title.titleType == "TV_Episode")
		{
			buyText = "Buy&nbsp;Episodes&nbsp;from";
		}
		buyPrice  = buyText + ' <span class="bluePrice">' + application.resource.currency_symbol + title.buyPrice + '</span>';	
	
		if(!title.rentAvail && title.titleType == 'Movie')
		{
			//Exchange places of rental info and buy info, since that we should place the 'Rent not available' behind.
			rentalPrice  = buyText + ' <span class="bluePrice">' + application.resource.currency_symbol + title.buyPrice + '</span>';			
			rentalPoints = buyPoints;
			buyPrice = '<div style="text-align:center" class="notAvailable">' + application.resource.title_availability.rent_not_available  + '</div>';
			buyPoints = '';
		}
	}
	return 	'<div class="verticalDivider"></div>'						+
			'<div class="rentalInfo">' 									+
 				'<div class="rentalPrice">'  + rentalPrice  + '</div>' 	+
 				'<div class="rentalPoints">' + rentalPoints + '</div>'	+
 			'</div>'													+
 			'<div class="buyInfo">'										+
 				'<div class="buyPrice">'     + buyPrice 	+ '</div>'	+
 				'<div class="buyPoints">'    + buyPoints	+ '</div>'	+
 			'</div>';
};

$cn.utilities.testDuration = function(startTime, waitSeconds){
	var dateTest = new Date(startTime);
    var time = $cn.utilities.DateDiff(new Date(), dateTest);
    var seconds = Math.floor(time / 1000);
    var valid = true;
    
    if(seconds < waitSeconds) {
    	valid = false;
    }
    
    return valid;
};

$cn.utilities.formatDate = function(date, format) {
	
	formatted = '';
	if(date)
	{
		switch(format)
		{
			case "longDate":
				try
				{
					theDate = new Date().parse(date);
					formatted = theDate.format("%B %d, %Y");
				}
				catch(e)
				{
					log.write("Called formatDate: error formatting date style: " + format);
				}
			break;
			case "shortEuropean":
			{
			    try
			    {
			        theDate = new Date().parse(date);
			        formatted = theDate.format("%d/%m/%Y");
			    }
			    catch(e)
			    {
			        log.write("Called formatDate: error formatting date style: " + format);
			    }
			}
            break;
            default:
            {
                try
                {
                    theDate = new Date().parse(date);
                    formatted = theDate.format("%x");
                }
                catch(e)
                {
                    log.write("Called formatDate: error formatting date style: " + format);
                }
            }
        }
        return formatted;
	}
};

$cn.utilities.uniqueIdentifier = function() {
   return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
};

$cn.utilities.isHdTitle = function(title, purchaseSku) {
	var purchaseType = null, hd = false;
	
	for(x = 0; x < title.availableProducts.length; x++) {		
		if(title.availableProducts[x].skuID == purchaseSku) {
			purchaseType = title.availableProducts[x];
		}
	}
	
//	for(x = 0; x < purchaseType.availableAssets.length; x++) {	
//		if(purchaseType.availableAssets[x].file_FileProfile == "HIGH_DEFINITION") {
//			hd = true;
//		}
//	}
	
    if(purchaseType.skuType.indexOf('HD') > -1)
    {
        hd = true;
    }
	return hd;
};

$cn.utilities.getPurchaseSkuProduct = function(title, purchaseSku) {
	var purchaseType = null;
	
	for(x = 0; x < title.availableProducts.length; x++) {		
		if(title.availableProducts[x].skuID == purchaseSku) {
			purchaseType = title.availableProducts[x];
		}
	}
	
	return purchaseType;
};

/*
 * Method determines if the current purchase has a profile that matches your 
 * devices capabilities.
 */
$cn.utilities.currentlyPlayingAudioProfile = function(passID){
	var val = 'Stereo_Standard',
		profile = $cn.utilities.getAudioProfileForPurchase(passID);

    if (profile[$cn.data.PreferredAudioType]) {
        val = $cn.data.PreferredAudioType;
    }
	
	return val;
};


$cn.utilities.isSurroundSoundTitle = function(title, purchaseSku) {
	var purchaseType = null, surround = false;
	
	for(x = 0; x < title.availableProducts.length; x++) {		
		if(title.availableProducts[x].skuID == purchaseSku) {
			purchaseType = title.availableProducts[x];
		}
	}
	
	for(x = 0; x < purchaseType.availableAssets.length; x++) {	
		
		for(y = 0; y < purchaseType.availableAssets[x].availableAudioProfiles.length; y++) {
			
			var audioProfile = purchaseType.availableAssets[x].availableAudioProfiles[y];
			
			for(z = 0; z < $cn.data.AllowedAudioProfiles.length; z++){
				if($cn.data.AllowedAudioProfiles[z] == audioProfile.audioAssetProfile) {
					surround = true;					
				}				
			}
		}
	}
	
	return surround;
};

/*
 * Method loops through the available products and assets of a title and identifies which audio profiles 
 * exist for a title and also if it only applies to HD titles.
 */
$cn.utilities.getAudioProfileForTitle = function(titleID) {
	var profile = {};
	profile['Stereo_Standard'] = true;
	profile['Dolby_Stereo_AC3'] = false;
	profile['Dolby_Digital_Plus_Stereo'] = false;
	profile['Dolby_Digital_Plus_51'] = false;
	profile['DTS_Express_Stereo'] = false;
	profile['DTS_Express_51'] = false;
	profile['HDOnly'] = true;
	
	if(!$cn.data.TitlesAudioProfiles[titleID]) {
		var title = $cn.data.TitleDetailCache[titleID];
		
		if(title) {
			for(a = 0; a < title.availableProducts.length; a++){
				for(b = 0; b < title.availableProducts[a].availableAssets.length; b++){
					//For all assets fo the title go through the audio profiles and build the profile object.
					var asset = title.availableProducts[a].availableAssets[b],
						isHD = (asset.file_FileProfile == "HIGH_DEFINITION");
					
					for(c = 0; c < asset.availableAudioProfiles.length; c++) {
						var audioProfile = asset.availableAudioProfiles[c];
						
						for(x = 0; x < $cn.data.AllowedAudioProfiles.length; x++){ 
							
							if($cn.data.AllowedAudioProfiles[x] == audioProfile.audioAssetProfile) {
								profile[$cn.data.AllowedAudioProfiles[x]] = true;
								
								if(!isHD){
									profile.HDOnly = false;
								}
								
							}
							
						}
					}
				}
			}
			
			$cn.data.TitlesAudioProfiles[titleID] = profile;
		}
	}
	else {
		profile = $cn.data.TitlesAudioProfiles[titleID];
	} 
	
	return profile;
};

$cn.utilities.getAudioProfileForPurchase = function(passID) {
	var profile = {};
	profile['Stereo_Standard'] = true;
	profile['Dolby_Stereo_AC3'] = false;
	profile['Dolby_Digital_Plus_Stereo'] = false;
	profile['Dolby_Digital_Plus_51'] = false;
	profile['DTS_Express_Stereo'] = false;
	profile['DTS_Express_51'] = false;
	
	if ($cn.data.PurchaseAudioProfiles[passID]) {
		profile = $cn.data.PurchaseAudioProfiles[passID];
	}
	else {
		var title = $cn.data.PassCache[passID];		
		if(title) {
			for(a = 0; a < title.availableProducts.length; a++){
				for(b = 0; b < title.availableProducts[a].availableAssets.length; b++){
					var asset = title.availableProducts[a].availableAssets[b];									
					for(c = 0; c < asset.availableAudioProfiles.length; c++) {
						var audioProfile = asset.availableAudioProfiles[c];						
						for(x = 0; x < $cn.data.AllowedAudioProfiles.length; x++){ 							
							if($cn.data.AllowedAudioProfiles[x] == audioProfile.audioAssetProfile) {
								profile[$cn.data.AllowedAudioProfiles[x]] = true;
							}								
						}		
					}
				}
			}	
					
			$cn.data.PurchaseAudioProfiles[passID] = profile;
		}
	}

	return profile;
};

$cn.utilities.getAudioProfileTypesForPurchase = function(passID) { 
    var audioProfile = $cn.utilities.getAudioProfileForPurchase(passID);
    var types = [];

    if (audioProfile['Dolby_Stereo_AC3'] || audioProfile['Dolby_Digital_Plus_Stereo'] || audioProfile['Dolby_Digital_Plus_51']) {
        types.push('Dolby');
    }

    if (audioProfile['DTS_Express_Stereo'] || audioProfile['DTS_Express_51']) {
        types.push('DTS');
    }

    return types;
}

$cn.utilities.bandwidthCheckValid = function(hd){
	var bandwidthValidated = false;
	
    log.write("$cn.data.LastBandwidthCheck: " + $cn.data.LastBandwidthCheck);
    log.write("testDuration (should be false): " + $cn.utilities.testDuration($cn.data.LastBandwidthCheck, application.appSetting("BandwidthCheckTTL")));
    log.write("BandwidthCheckTTL:" + application.appSetting("BandwidthCheckTTL"));
    log.write("LastBandwidthSpeed: " + $cn.data.LastBandwidthSpeed);
    log.write("SDMinimumBandwidth: " + application.appSetting("SDMinimumBandwidth"));
        
    //Has a bandwidth check been performed
    if( $cn.data.LastBandwidthCheck && 
        !$cn.utilities.testDuration($cn.data.LastBandwidthCheck, application.appSetting("BandwidthCheckTTL"))) {
        
        if(hd && $cn.data.LastBandwidthSpeed > application.appSetting("HDMinimumBandwidth")) {
            bandwidthValidated = true; 
        }
        else if(!hd && $cn.data.LastBandwidthSpeed > application.appSetting("SDMinimumBandwidth")) {
            bandwidthValidated = true;
        }
    }
	
	return bandwidthValidated;
};

//This method will force a line feed after a set amount of characters
$cn.utilities.forceWrap = function(str, limit, max) {
    var trimmed,
        output = '',
        i;
    if (!str) {
        return "";
    }
    trimmed = str.length > max ? str.substring(0, max) : str;
    for (i = 0; i < trimmed.length; i++) {
        if (i>0 && i%limit == 0)
            output += "<br />";
        output += trimmed.charAt(i);
    }

    return output;
};

$cn.utilities.showLoadingModal = function(delayMS, message) {
    var timer;

    if (! $cn.utilities.sharedModalShowing) {
        message = message || application.resource.loading_enum.loadinggeneric;
        timer = setTimeout(function() {
            BrowseView.showMessage("message_loading", {
                Message: message
            });
        }, delayMS);
    } else {
        log.write("Skipping showing of modal. Shared modal is already showing.");
    }

    return timer;
};

$cn.utilities.clearLoadingSpinner = function(timer){
    if (timer) {
        clearTimeout(timer);
        log.write("Clearing Spinner");
    }

    if (! $cn.utilities.sharedModalShowing) {
        $cn.utilities.hideModalPopup();
    }
};

$cn.utilities.sharedModalShowing = false;
$cn.utilities.sharedModalTimer = false;

// A method to show a spinner across a complicated pathway
$cn.utilities.showSharedLoadingModal = function(delayMS, message) {
    if (! $cn.utilities.sharedModalShowing) {
        //log.write("!!!!!!!!!!!!!!!!! Showing shared modal !!!!!!!!!!!!!!!!!!!!!!!!!!!");
        $cn.utilities.sharedModalTimer = $cn.utilities.showLoadingModal(delayMS, message);
        $cn.utilities.sharedModalShowing = true;
    } else {
        log.write("Trying to show shared modal when one is already showing. Doing nothing.")
    }
};

$cn.utilities.clearSharedLoadingSpinner = function() {
    //log.write("!!!!!!!!!!!!!!!!!!!!!! Clearing shared modal !!!!!!!!!!!!!!!!!!!!!");
    $cn.utilities.sharedModalShowing = false;
    $cn.utilities.clearLoadingSpinner($cn.utilities.sharedModalTimer);
};

$cn.utilities.hideModalPopup = function() {
    if (BrowseView && BrowseView.MessagePopup) {
        BrowseView.MessagePopup.hide();
    }
};

$cn.utilities.tm = function() {
    return '&#0153;';
}

/**
 * to use:
 * var uvManager = new $cn.utilities.UserUVManager();
 *
 * TODO: remove reliance on empty strings - should be changed to false
 *
*/
$cn.utilities.UserUVManager = new Class({
    empty: "",
    action : "",
    // State is linked or not available
    currentState: "",
    previousState: "",
    // Status is a result within get linking account
    previousStatus: "",
    currentStatus: "",
    linkingAccount: {},
    initialize: function(action){
        this.action = action;
    },
    deactivate: function() {
        this.currentStatus = "";
        this.previousState = "";
        this.currentState = "UVDeviceInactive";
    },
    getAccountLinkState : function(){
        var self = this;
        log.write("Getting Account Link State");

        $cn.methods.getAccountLinkState(function(state) {

            log.write("Link state is " + state.linkState);

            if(self.currentState === self.empty){
                self.currentState = state.linkState;
            } else {
                self.previousState = self.currentState;
                self.currentState = state.linkState;
            }
            if(self.currentState == $cn.data.uvLinkStatus.linkState.linked ||
                self.currentState == $cn.data.uvLinkStatus.linkState.pending){
                self.getLinkingAccount();
                // why is there a return statement in an anonymou function - this does nothing
                // return true;
            } else{
                // If we are not linked, then we must clear any previous linked state.
                self.currentStatus = self.empty;
                self.checkNextAction();
            }
        });
    },
    getLinkingAccount : function () {
        var status, self = this;

        log.write("Getting Linking Account");

        $cn.methods.getLinkingAccount(function (result) {

            self.linkingAccount = result;

            // if no status key then we convert responseCode to a status
            status = (result.account) ? result.account.status : $cn.utilities.getResponseCodeStatus(result.responseCode);

            if (self.currentStatus === self.empty) {
                self.currentStatus = status;
            } else {
                self.previousStatus = self.currentStatus;
                self.currentStatus = status;
            }
            //where are we? check what we need to do with results.
            self.checkNextAction();
        });
    },
    checkNextAction : function () {

        var status = this.currentStatus;

        if(status == $cn.data.uvLinkingAccount.Status.active){
            if(this.action =="CheckoutPanel"){
                this.checkStatusChange();
            } else {
                log.write("We are active and not in checkout so proceed with callback");
                $cn.utilities.clearLoadingSpinner(this.timer);
                this.fireCallback(true);
            }
        } else if (this.action == "CheckoutPanel"){
            log.write("We are in checkout and status was not active");
            this.showUVWarningModal();
        } else if (this.action == "showPlay"){
            log.write("We are in show play and status was not active");
            this.showUVWarningModal();
        } else {
            log.write("status was not active so fire false");
            $cn.utilities.clearLoadingSpinner(this.timer);
            this.fireCallback(false);
        }
    },
    fireCallback : function(arg) {
        var cache;

        cache = this.callback;
        // Delete the original callback to allow a new callback to be set on this object when this callback is triggered
        this.callback = false;
        cache(arg);
    },
    checkStatusChange : function () {

        var prevStatus = this.previousStatus,
            curStatus = this.currentStatus,
            prevState = this.previousState;

        log.write("Check status Change called");
        log.write("current is " + curStatus);
        log.write("Prev is " + prevStatus);

        // There are two situations:
        // a: getlinking account status has changed
        // b: there was no previous getLinking status and now there is and we gave it a try earlier
        if((prevStatus && prevStatus != curStatus) || (!prevStatus && curStatus && (this.previousState !== this.empty))) {
            this.showSuccessfulChange();
        } else {
            $cn.utilities.clearLoadingSpinner(this.timer);
            this.fireCallback(true);
        }
    },
    showSuccessfulChange : function(){
        log.write("Show successul Change called");
        var status,
            messagePath,
            data,
            self = this;
        switch(this.currentStatus){
            case 'Archived':
                status = 'renewed';
                break;
            case 'AcctNotAvailable':
                status = 'created';
                break;
            case 'BlockedTOU':
                status = 'updated';
                break;
            default:
                status = 'linked';
        }
        messagePath= application.resource.uv_messages.success;
        data = {
            Message: messagePath.Message.replace("##status##", status),
            Close : messagePath.OK,
            callback: function(result) {
                if (result) {
                    self.fireCallback(false);
                }
            }
        };
        $cn.utilities.clearLoadingSpinner(this.timer);
            BrowseView.showMessage("message_content_callback", data);
    },
    // This function is waived and not being used
    getTermsOfService : function(){
        log.write("Get terms of use called");
        var self = this;
        if($cn.config.UVTOSEnabled){
            $cn.methods.getUVTermsOfService(function(res){
                self.showTermsOfService(res.data);
            });
        } else {
            this.showUVWarningModal();
        }
        // TODO: build tou method
    },
    showTermsOfService : function(termsOfService){
        var messagePath = application.resource.uv_messages.uvTermsOfService,
            action = ($cn.utilities.isEqual(this.action, "CheckoutPanel")) ? "." + this.action  : '',
            self = this;
        this.Legal = new LegalPopup('uvtermsofservice');
        this.Legal.loadData([{
            title : messagePath.UnacceptedMessage,
            content : messagePath.Content,
            text : termsOfService,
            "OK"      : messagePath.OK,
            "Close"   : messagePath.Close,
            "CloseAction" : "BrowseView" + action + ".UV.Legal.hide()",
            "AcceptAction" : "BrowseView"+ action + ".UV.acceptUVTermsOfService(true)",
            callback: function(result) {
                if (result) {
                    log.write("UV TOU Accepted");
                    self.fireCallback(true);
                }
            }

        }]);
        this.layoutIsDirty = true;
        this.Legal.firstFocus = 'LegalOK';
        $cn.utilities.clearLoadingSpinner(this.timer);
        this.Legal.show();
        $('SplashScreen').hide();
    },
    showUVWarningModal: function(callback) {
        var self = this,
            status = (this.currentStatus) ? this.currentStatus : this.currentState,
            messagePath,
            messageObj,
            data,
            email = (this.linkingAccount.user) ? this.linkingAccount.user.email : '';

        this.callback = this.callback || callback;

        switch(status) {
            case "Pending":
            case "BlockedTOU":
            case "Expired":
            case "AcctNotAvailable":
            case "Server Error":
            case "Inactive":
                messagePath = "account_" + status;
                break;
            default:
                messagePath = "account_default";
        }

        messageObj = application.resource.uv_messages[messagePath];
        if (this.currentStatus == $cn.data.uvLinkingAccount.Status.pending) {
            messageObj.Content = messageObj.Content.replace(/{email}/g, email);
        }
        data = {
            Message: messageObj.Message,
            Content: messageObj.Content,
            OK: messageObj.OK,
            Close:  messageObj.Cancel,
            uvMsg : "UV",
            callback: function(result) {
                if (result) {
                    log.write("UV warning retry");
                    self.checkUVAccount();
                }
				else{
                	self.fireCallback(false);
                }
            }
        };
        $cn.utilities.clearLoadingSpinner(this.timer);
        BrowseView.showMessage("message_okcancel_vert", data);
    },
    checkUVAccount : function(callback, skipAuthVerify){
        if ($cn.config.EnableUV) {
            this.timer =  $cn.utilities.showLoadingModal(2000, "Loading...");
            this.callback = this.callback || callback;

            if (skipAuthVerify) {
                this.getAccountLinkState();
            } else {
                // First check if activated
                $cn.methods.verifyAuthToken(function(result){
                    if (result) {
                        this.getAccountLinkState();
                    } else {
                        $cn.utilities.clearLoadingSpinner(this.timer);
                        this.deactivate();
                        this.fireCallback(false);
                    }
                }.bind(this));
            }
        } else {
            if (typeof callback === 'function') {
                callback(false);
            }
        }
    }
});

$cn.utilities.setParentalSettings = function(callback) {
    //Needed for SS Media Hub
    application.createActivationFile();

    //Set global properties for user
    $cn.data.AuthToken = callback.authToken;
    $cn.data.AdultPinEnabled = callback.adultPinEnabled;
    // This has to be opted in by the user ==>
    $cn.data.ParentPinEnabled = false;
    $cn.data.DeviceName = callback.deviceFriendlyName;
    $cn.data.UserEmailAddress = callback.emailAddress;
    // This has to be opted in by the user ==>
    $cn.data.PurchasePinEnabled = false;
    $cn.data.ParentalControlsConfigured = callback.parentalControlsConfigured;
    $cn.data.CurrentRegion = $cn.data.Region;

    application.saveAuthToken();
};

$cn.data.bwTest = {};
// Don't forget to reset these
$cn.data.bwTest.calls = 1;
$cn.data.bwTest.speedBytes = 0;
// Set this to your bw test method
$cn.data.bwTest.bwCallback = null;
$cn.data.bwTest.self = null;
// The bandwidth test WILL NOT RUN unless this global function is kept!
function OnComplete(p){
    if ($cn.data.bwTest.bwCallback) {
        $cn.data.bwTest.bwCallback(p);
    }
};

function $get(key,url){
	if(arguments.length < 2) url =location.href;
	if(arguments.length > 0 && key != ""){
		if(key == "#"){
			var regex = new RegExp("[#]([^$]*)");
		} else if(key == "?"){
			var regex = new RegExp("[?]([^#$]*)");
		} else {
			var regex = new RegExp("[?&]"+key+"=([^&#]*)");
		}
		var results = regex.exec(url);
		return (results == null )? "" : results[1];
	} else {
		url = url.split("?");
		var results = {};
			if(url.length > 1){
				url = url[1].split("#");
				if(url.length > 1) results["hash"] = url[1];
				url[0].split("&").each(function(item,index){
					item = item.split("=");
					results[item[0]] = item[1];
				});
			}
		return results;
	}
};

var $UrlQueryString = function () {
	// This function is anonymous, is executed immediately and 
	// the return value is assigned to $UrlQueryString!
	var query_string = {};
	var query = window.location.search.substring(1);
	var vars = query.split("&");
	for ( var i = 0; i < vars.length; i++) {
		var pair = vars[i].split("=");
		// If first entry with this name
		if (typeof query_string[pair[0]] === "undefined") {
			query_string[pair[0]] = pair[1];
			// If second entry with this name
		} else if (typeof query_string[pair[0]] === "string") {
			var arr = [ query_string[pair[0]], pair[1] ];
			query_string[pair[0]] = arr;
			// If third or later entry with this name
		} else {
			query_string[pair[0]].push(pair[1]);
		}
	} 
	  return query_string;
}();
