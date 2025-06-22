//-----------------------------------------------------------------------------
// ui.js
// Copyright (c) 2012 - 2013, Rovi Corporation.  All rights reserved.
//-----------------------------------------------------------------------------
 
/**
 * @author tjmchattie
 */
var ui = {
		_rootLayout: null,
		_controlCollection: [],
		_viewCollection: [],
		_styleCollection: [],
		_tplCollection: [],
		sprite: null,
		spriteCustom: null,
		spriteVideo: null,
		spriteVideoBlue: null,
        wasInitialized: false,
		init: function(cb, cancelReady){
			var self = this;
            log.write("=== initializing ui ===");
            log.write("cancelReady is: " + cancelReady);
            self.wasInitialized = true;
			/*
			 * All UI changes take place here. Validation of the update package should be checked here as well.
			 * Items that are to be loaded in are:
			 * 		1) Template
			 * 		2) Resources
			 * 		3) Sprites
			 */
			
			XML.rootFromFile("theme/" + $cn.config.CurrentTheme + "/template.xml",function(xml){

				// set splash loading to 99%
                updateSplash(95);
                currPerc = (currPerc < 95 ? 95 : currPerc);
				
				self._rootLayout = xml;
				self.initUI();

                if (cancelReady) {
                    cb();
                    return;
                }
				
				self.sprite = new Image();
				self.sprite.onload = function(){

					self.spriteVideo = new Image();
					self.spriteVideo.onload = function(){

						log.write('Player sprite loaded.');
						
						self.spriteCustom = new Image();
						self.spriteCustom.onload = function(){

							self.spriteButtons = new Image();
							self.spriteButtons.onload = function(){
								
								self.spriteBackgrounds = new Image();
								self.spriteBackgrounds.onload = function(){
									// set splash loading to 100%
                                    currPerc = 100;
                                    setTimeout(function(){
                                        updateSplash(100);
                                    },400);
										
									log.write('Extras sprite loaded.');
									application.loadView(BrowseView);
									log.write('Publish ready event.');


									application.events.publish('ready');


									if(cb){
										cb.call(this);
									}
								};
								self.spriteBackgrounds.src = "theme/" + $cn.config.CurrentTheme + "/Orbit960_backgrounds.png";
							};
							self.spriteButtons.src = "theme/" + $cn.config.CurrentTheme + "/Orbit960_buttons.png";


						};
						self.spriteCustom.src = "theme/" + $cn.config.CurrentTheme + "/Orbit960_extras.png";
							
						self.spriteCustom.onerror = function(e){
							log.write(e);
						}
					};
					self.spriteVideo.src = "theme/" + $cn.config.CurrentTheme + "/Orbit960RedVideo.png";
						
				};
				self.sprite.src = "theme/" + $cn.config.CurrentTheme + "/Orbit960.png";
				
				self.sprite.onerror = function(e){
					log.write(e);
				}
						
			});
			
		},
		initUI: function(){
            var x,
                y,
                z;
			if(!$cn.config.PrecompiledApplication){
					
				var layouts = this._rootLayout.childNodes[0].childNodes;
				var layout = null;
				
				for(x = 0; x < layouts.length; x++){
					
					/* Load in VIEWS and CONTROLS to the collections */
					if(layouts[x].nodeName.toLowerCase() == "views" || layouts[x].nodeName.toLowerCase() == "controls"){
						
						var views = layouts[x].childNodes;
						
						for(y = 0; y < views.length; y++) {
							
							if(views[y].nodeName.toLowerCase() == "view" || views[y].nodeName.toLowerCase() == "control"){
								var uiType = (views[y].nodeName.toLowerCase() == "control") ? 'control' : '';
								
								var elems = views[y].childNodes;
									
								for(z = 0; z < elems.length; z++) {
									if(elems[z].nodeName.toLowerCase() == "layout") {
										var hash = XML.nodeToHash(elems[z]);
										var elm = XML.hashToElement(hash, "div");
										
										if(views[y].nodeName.toLowerCase() == "control") {
											this._controlCollection[views[y].attributes["id"].nodeValue.toLowerCase()] = elm;
										}
										else {
											this._viewCollection[views[y].attributes["id"].nodeValue.toLowerCase()] = elm;
										}
									}
								}
							}
						}
					}
				}	
			}
		},
		destroyLayout: function(){
			if(!$cn.config.PrecompiledApplication){ 
				/* Cleanup old html */
		        var v = document.getElementById('uicontainer');
		        v.parentNode.removeChild(v);
				
				/* Add fresh div to work with. This should keep the dom clean */
				var newViewContainer = document.createElement('div');
				newViewContainer.setAttribute('id','uicontainer');
				document.getElementById('detention').appendChild(newViewContainer);
				
			//this.css.clear();
			}
		},
		loadLayout: function(layoutName){
            var elm,
                v,
                p,
                c,
                ctls,
                x;
			if(!$cn.config.PrecompiledApplication){
				/* Try to load in the view */
				if(this._viewCollection[layoutName.toLowerCase()]) {
					
					elm = this._viewCollection[layoutName.toLowerCase()];
					elm.setAttribute('id', layoutName.toLowerCase());
		            
					application.putInnerHTML('uicontainer', '');
				    v = document.getElementById('uicontainer');
		            p = v.parentNode;
		            p.removeChild(v);
		            
		            c =  document.createElement('div');
		            c.setAttribute('id', 'uicontainer');
		            c.appendChild(elm);							            
		            p.appendChild(c);
				}
				
				/* If there are controls render them in */
				ctls = $('uicontainer').getElements('control');
				for(x = 0; x < ctls.length; x++) {
					
					var ctl = this._controlCollection[ctls[x].id.toLowerCase()];
					if(ctl){
						ctl.setAttribute('id', ctls[x].id.toLowerCase());
						
						var c = document.getElementById(ctls[x].id.toLowerCase());
						c.parentNode.replaceChild(ctl,c);
					}
				}			
				
				var tpls = $('uicontainer').getElements('tpl');
				
				this._tplCollection = [];
				for(x = 0; x < tpls.length; x++) {
					
					/* Add Template definitions if they exist */
					var tempDiv = new Element('div');
					tempDiv.set('id', tpls[x].getFirst().get('id'));
					tempDiv.set('class', tpls[x].getFirst().get('class'));				
					tpls[x].getFirst().inject(tempDiv);
				    
					var html = tempDiv.get('html');
					
					//ctls = $(html).getElements('control');
					
					//log.write(tpls[x].getFirst().get('id') + ": " + ctls.length);
					
					this._tplCollection[tpls[x].get("id").toLowerCase()] = tempDiv.get('html');
					
				}	
				tpls.destroy();
				
			}
		},
		loadTpl: function(key){
			return String(this._tplCollection[key]);
		}
};


ui.template = function(elemid, html){
    var me = this,
    	a = arguments,
    	frag = null,
    	buf = [];

    this.re = /\{([\w-]+)\}/g,
    this.refunction = /\@@([^@]+)\@@/g,
    this.refunctioninput = /\##([^#]*)\##/g,
    
    /**@private*/
    me.html = html;
    me.elemid = elemid;
    
    if (me.compiled) {
        me.compile();
    }
};
ui.template.prototype = {
    /**
     * Returns an HTML fragment of this template with the specified <code>values</code> applied.
     * @return {String} The HTML fragment
     */
    applyTemplate : function(values){
		var me = this;
		
        return me.compiled ?
        		me.compiled(values) :
				me.html.replace(me.re, function(m, name){
					//log.write(name);
					return values[name] !== undefined ? values[name] : "";
		        }).replace(me.refunction, function(m, name){
		        	return values[name] !== undefined ? values[name] : "";
		        });
	},

    /**
     * Sets the HTML used as the template and optionally compiles it.
     */
    set : function(html, compile){
	    var me = this;
        me.html = html;
        me.compiled = null;
        return compile ? me.compile() : me;
    },

    /**
     * Compiles the template into an internal function, eliminating the RegEx overhead.
     */
    compile : function(){
        var me = this,
        	sep = ",";

        function fn(m, name){                	
        	name = "values['" + name + "']";
        	//log.write(name);
        	//log.write("'"+ sep + '(' + name + " == undefined ? '' : " + name + ')' + sep + "'");
	        return  "'"+ sep + '(' + name + " == undefined ? '' : " + name + ')' + sep + "'";	        
        }
        
        function fninput(i){
        	//log.write("fninput: " + i);
        	var x = i.replace(/"/g, '\\"').replace(/####/g, "").replace(/##/g, "").replace(/'/g, "\\'");
        	//log.write("fninput_updated: " + x);
        	return x;
        }
        
        function fnscript(m, name){   
        	
        	var html = '';
        	var input = name.replace(/&quot;/g, "\"")
        	
        	try {
        		html = eval('(' + input + ')');
        	}
        	catch(e){
        		log.write(e);
        		log.write(input);
        		log.write(name);
        	}
        	
        	return html;
        }
        
        eval("this.compiled = function(values){  var html = ['" +
             me.html.replace(/\\/g, '\\\\').replace(/(\r\n|\n)/g, '\\n').replace(/'/g, "\\'").replace('%7B', "{").replace('%7D', "}").replace('%28', "(").replace('%29', ")").replace(this.re, fn) +
             "'].join('');   html = html.replace(this.refunctioninput, fninput).replace(this.refunction, fnscript); return html;};");
        return me;
    },

    /**
     * Applies the supplied values to the template and inserts the new node(s) as the first child of el.
     */
    prepend: function(values){
    	var children = document.getElementById(this.elemid).childNodes;
    	var html = this.applyTemplate(values);    
    	var tempDiv = html.toElement();
    	
    	if(tempDiv){        
    		if(children.length > 0){
	    		document.getElementById(this.elemid).insertBefore(tempDiv, document.getElementById(this.elemid).childNodes[0]);
				if (tempDiv.getElement("a"))
			    	application.currentView.layoutIsDirty = true;
	    	}    	
    		else {
    			this.append(values);
    		}
    	}
    	else {
    		log.write('Cannot append el: ' + el + " to tpl. TPL does not exist.");
    	}
    },

    /**
     * Applies the supplied values to the template and inserts the new node(s) before el.
     */
    insertAt: function(values, idx){
    	var children = document.getElementById(this.elemid).childNodes,
    	    html = this.applyTemplate(values),
    	    tempDiv = html.toElement(),
            x;
    	
    	if(tempDiv){        	
	    	for(x = 0; x< children.length; x++){
	    		if(idx == x){
	    			document.getElementById(this.elemid).insertBefore(tempDiv, document.getElementById(this.elemid).childNodes[x]);
					if (tempDiv.getElement("a"))
				    	application.currentView.layoutIsDirty = true;
					
	    			break;
	    		}
	    	}    	
    	}
    	else {
    		log.write('Cannot append el: ' + el + " to tpl. TPL does not exist.");
    	}    	
    },
    
    empty: function(){
		
		var element = $(this.elemid);
		
		if(element){
			if (application.element.current != null && document.getElementById(application.element.current) && element.isParentOf($(application.element.current)))
				navigation.setFocusElement(null);
				
			if (element && element.getElement("a"))
		    	application.currentView.layoutIsDirty = true;
			
			application.putInnerHTML(document.getElementById(this.elemid), '');
		}
    },
    emptyAndAppend: function(values){
    	var html = this.applyTemplate(values);    
    	var tempDiv = html.toElement();
    	
    	if(tempDiv){
    		
    		document.getElementById(this.elemid).innerHTML = html;
    		if (tempDiv.getElement("a"))
		    	application.currentView.layoutIsDirty = true;
    	}
    	else {
    		log.write('Cannot append el: ' + tempDiv + " to tpl. TPL does not exist.");
    	}
    },
    /**
     * Applies the supplied <code>values</code> to the template and appends
     */
    append : function(values){
        //log.write(values);
    	var html = this.applyTemplate(values);    
    	var tempDiv = html.toElement();
    	//log.write(html);
    	if(tempDiv){
    		if(document.getElementById(this.elemid)) {
    			document.getElementById(this.elemid).appendChild(tempDiv);
				if (tempDiv.getElement("a"))
			    	application.currentView.layoutIsDirty = true;
    		}
    	}
    	else {
    		log.write('Cannot append el: ' + tempDiv + " to tpl. TPL does not exist.");
    		//log.write(html);
    	}
    },
    apply: function(){
    	if(document.getElementById(this.elemid)) {
    		application.element.bindActions(this.elemid, true);
    		
			var elements = $(this.elemid).getElements('.ellipsis');
			for (var i = 0; i < elements.length; ++i) {
				
				var element = elements[i];
				var height = element.offsetHeight;
				var oldh = element.style.height;
				log.write('Ellipsis element: ');
				log.write(element);
				element.setStyle('height', 'auto');
				element.addClass('hid');
				log.write('height: ' + height + ' : ' + element.offsetHeight);
				if (element.offsetHeight > height) {
					application.putInnerHTML(element, $cn.utilities.truncateText(element, element.innerHTML, height, 0, element.innerHTML.length));
				} else {
					element.style.height = oldh;
				}
				element.removeClass('hid');
			}
    	}
    } 
};
