//-----------------------------------------------------------------------------
// log.js
// Copyright (c) 2012 - 2013, Rovi Corporation.  All rights reserved.
//-----------------------------------------------------------------------------
 
/**
 * @author tjmchattie
 */

var log = {
		write: function(object){
            var output,
                consoleMock = "alert() : ";
			application.remotelog += String(object) + "\n";
						
			if($cn.config.Debug){
                output = $cn.data.RuntimeId + ' ROVI ' + $cn.config.CurrentTheme + ' : ' + object;
				try{
					if (device.logToDisplay) {
						alert(output);
                        this.debug(object);
					}
					else {
						console.log(consoleMock + output);
					}
				}
				catch(ex){ alert("Caught")}
			}
			
		},
		debug: function(object){
			if($cn.config.Debug){
				if($('debugger').getStyle('display') == "block"){
					$('debugger').innerHTML = object + "<br />" + $('debugger').innerHTML;	
				}
				
			} 
		},
		session: {
			_doc: '',
			lastSync: null,
			sessionLimitMinutes: null,
			sessionLimitRows: 5,
			currentRows: 0,
			checkinTimer: new Timer(),
			addActivity: function(viewName, optionalData){
				device.addLogSessionActivity(this, viewName, optionalData);
			},
			sync: function(l){
				
				if(l.length < 3024){
					webservices.makeLogRequest(l, this, function(callback){
						application.remotelog = "";
					});	
				}
				else {
					var entry = l.substring(0, 3024);
					
					webservices.makeLogRequest(entry, this, function(callback){
						application.remotelog = l.substring(3024, l.length);
						log.session.sync(application.remotelog);
					});
				}
				
			},
			upload: function(){
				device.uploadLogSession();
			}
		},
		/**
	    Returns a simple string representation of the object or array.
	    Other types of objects will be returned unprocessed.  Arrays
	    are expected to be indexed.  Use object notation for
	    associative arrays.
	    
	    Example
	        var list = [1,2,3,{a:'a',b:{aa:'aa',bb:'bb',cc:{a:'a',b:'b'}}},{a:function aFun(k,v){}}]; $dump(list);
	    
	    @method dump
	    @param object {Object} The object to dump
	    @param depth {Integer} (optional) How deep to recurse child objects, (default 1)
	    @param pretty {Boolean | Integer} (optional) if true then pretty print is on, then passed recursively as a stepping/indentation value(integer) (default true)
	    @returns {String} A string of the dump result
	    */
	    dump: function(obj, depth, pretty) {
			//pretty = false;
	        var cType = null,
	            oType = $type(obj),
	            vType = ['array', 'object'];
	        
	        var key,
	            value,
	            stack = [];
	        
	        var _pretty = ($type(pretty) == 'number') ? (pretty ? true : false) : (($type(pretty) == 'boolean') ? pretty : true),
	            _depth = $empty(depth) ? 2 : depth,
	            indent = 3,
	            step = ($type(pretty) == 'boolean') ? 1 : (pretty || 1);
	        
	        var COMMA = ',',
	            ARROW = ' => ',
	            BREAK = _pretty ? '\n' : '',
	            TAB = {
	                pre: (_pretty ? (' '.repeat(indent * step)) : ''),
	                post: (_pretty ? (' '.repeat(indent * (step - 1))) : '')
	            },
	            CAP = {
	                pre: ((oType == 'array') ? '[' : '{'),
	                post: ((oType == 'array') ? ']' : '}')
	            },
	            REP = {
	                'function': 'function(){...}',
	                'array': '[...]',
	                'object': '{...}'
	            };
	        
	        var format = function(value, type) {
	            switch (type) {
	                case 'function' :
	                    value = value.toString();
	                    return value.substring(0, (value.indexOf(')') + 1)) + ' {...}';
	            }
	            return value;
	        };
	        
	        switch (oType) {
	            case false :
	                return oType;
	            case 'date':
	            case 'element':
	            case 'regexp':
	                return obj;
	        }
	        
	        if (vType.indexOf(oType) != -1) {
	            stack.push(CAP.pre + BREAK);
	            for (key in obj) {
	            	try {
		                value = obj[key];
		                cType = $type(value);
		                stack.push(TAB.pre + key + ARROW);
		                if (vType.indexOf(cType) != -1) {
		                    if (_depth > 1) {
		                        stack.push(log.dump(value, (_depth - 1), (_pretty ? (step + 1) : _pretty)));
		                    } else {
		                        stack.push(REP[cType]);
		                    }
		                } else {
		                    stack.push(format(value, cType));
		                }
		                stack.push(COMMA + BREAK);
		            }
		            catch(ex){}
	            }
	            if (stack.length > 1) {
	                stack.pop();
	            }
	            stack.push(BREAK + TAB.post + CAP.post);
	        } else {
	            stack.push(format(obj, oType));
	        }
	        
	        return stack.join('');
	    },
	    dumpObj: function (arr,level) {
	    	var dumped_text = "";
	    	if(!level) level = 0;
	    	
	    	//The padding given at the beginning of the line.
	    	var level_padding = "";
	    	for(var j=0;j<level+1;j++) level_padding += "    ";
	    	
	    	if(typeof(arr) == 'object') { //Array/Hashes/Objects 
	    		for(var item in arr) {
	    			var value = arr[item];
	    			
	    			if(typeof(value) == 'object') { //If it is an array,
	    				dumped_text += level_padding + "'" + item + "' ... ";
	    				
	    			} else {
	    				dumped_text += level_padding + "'" + item + "' => \"" + value + ", ";
	    			}
	    		}
	    	} else { //Stings/Chars/Numbers etc.
	    		dumped_text = "===>"+arr+"<===("+typeof(arr)+")";
	    	}
	    	return dumped_text;
	    },
	    getStackTrace: function() {
			try {
				intentionally.causing.an.exception.to.occur();
			} catch (e) {
				var stack = e.stack.trim().split("\n");
				stack.shift(); // removing this method from the stack
				return stack;
			}
		},
	    repeat: function (count) {
			var str = '';
			for (var i=0; i < count; i++) str += this;
			return str;
		}
};
