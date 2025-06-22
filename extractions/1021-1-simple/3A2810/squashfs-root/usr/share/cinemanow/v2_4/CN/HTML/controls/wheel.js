//-----------------------------------------------------------------------------
// wheel.js
// Copyright (c) 2012 - 2013, Rovi Corporation.  All rights reserved.
//-----------------------------------------------------------------------------
 
/**
 * @author tjmchattie
 */


var ItemAnimationMap = [ 
	'tertiary',
	'secondary', 
	'primary', 
	'secondary', 
	'tertiary'
];

var Wheel = new Class({
    source: [],
	container: null,
	itemHeight: 0,
	padding: 0,
	selection: 0,
	topPosition: 0,
	wheelChangedTimeout: 1000,
	initialize: function (id, element) {
		this.id = id;
		this.container = element;

		application.events.subscribe(this, 'savestate', this.onSaveState.bind(this));
		application.events.subscribe(this, 'restorestate', this.onRestoreState.bind(this));
	},
/*	cleanItem: function(item){
		item.removeClass('wheelitemprimary');
		item.removeClass('wheelitemsecondary');
		item.removeClass('wheelitemondeck');
		item.removeClass('wheelitemhidden');
	},*/
	clean: function(){
		
		var container = $(this.container);
		
		if(container) {
			if(container.getChildren().length > 0){
				container.getChildren().destroy();
			}
		}

		this.selection = 0;
	},
	indexOf: function(position) {
		var index = this.selection + (position - 2);
		
		if (index < 0)
			index = (this.source.length < 5 ? -1 : index + this.source.length);
		else if (index >= this.source.length)
			index = (this.source.length < 5 ? -1 : index - this.source.length);
			
		return index;
	},
	// Measure the height of element's sub text element.
	measureElement: function(elem) {
        var nodes = elem.getElements('td'),
            textElement = null,
            height = 0;

        if (nodes && nodes.length && nodes[0] && nodes[0].firstChild) {
            textElement = nodes[0].firstChild;
        }

        if (textElement) {
        	// Require CSSOM View Module support.
            var range = document.createRange();
            range.selectNodeContents(textElement);
            if (range.getBoundingClientRect) {
                var rect = range.getBoundingClientRect();
                if (rect) {
                    height = rect.bottom - rect.top;
                }
            }
        }

        //log.write('measureElement: height(' + height + ')');
	    return {y: height};
	},
	move: function (direction) {
		//log.write("Wheel: move -- enter");
		var isMoving = false;
		var index = this.indexOf(2 + direction);
		
		if (index != -1) {

			if (direction < 0) {
				var topIndex = this.indexOf(-1);
				if (topIndex != -1)
					this.renderItem(topIndex, -1);
			}
			else {
				var botIndex = this.indexOf(5);
				if (botIndex != -1)
					this.renderItem(botIndex, 5);
			}
		
			var self = this;
			var items = $(this.container).getChildren();
			this.selection = index;
			//log.write("Wheel: Moving Top Position from " + this.topPosition + " to " + (this.topPosition - direction));
			this.topPosition -= direction;

			var o = {};
			var animation = application.loadAnimation("wheel");
					
			for(x = 0; x < items.length; x++) {
				
				var item = items[x];
				
				//log.write("Wheel: moving " + item.innerHTML + " from: " + item.slot + " to: " + (this.topPosition + x));
				item.slot = this.topPosition + x; //direction;
				item.idx = this.indexOf(item.slot);

				var propType = (item.slot < 0 || item.slot >= ItemAnimationMap.length) ? ItemAnimationMap[0] : ItemAnimationMap[item.slot];
				o[x] = $extend({}, animation.properties[propType]);
				o[x].top = item.slot * this.itemHeight + (this.padding / 2);
				
				if(item.slot == 2){
                    item.addClass('hover');
                    o[x].color = o[x].focus;
                } else{
                    item.removeClass('hover');
				}
			}

			if (animation) {
				var options = $extend({}, animation.options);
				
				if(device.getDeviceSoc() != "BCOM") {
					if(((1000 / options.fps) * 2) >= options.duration) {
						options.duration = 100;
						options.fps = 1000 / options.duration;
					}

					options.onComplete = function(obj) {
							for (var x = 0; x < items.length; ++x)
								this.onComplete(items[x]);
						}.bind(this);
					
					new Fx.Elements(items, options).start(o);
					isMoving = true;	
				}
				else {
					//
					for (var x = 0; x < items.length; ++x) {
						items[x].setStyles(o[x]);
						this.onComplete(items[x]);
					}
					
				}
			}
		}			

		//log.write("Wheel: move -- exit");
		return isMoving;
	},
	onComplete: function(obj) {
		
		//log.write("Wheel: onComplete(" + obj.slot + ")");
		var self = this;
		
		if (obj.slot < 0 || obj.slot > 4) {
			//log.write("Wheel: Destroying object " + obj.slot);
			
			if (obj.slot == this.topPosition) {
				obj.destroy();
				this.topPosition = $(this.container).getFirst().slot;
				//log.write("Wheel: Updating first position to " + this.topPosition);
			}
			else	
				obj.destroy();
		}
		else {
			
			if (obj.slot == 2 && obj.idx == this.selection) {
			    
				if (this.onWheelChanged){					
					var key = this.source[this.selection].iD;
					this.lastKey = this.source[this.selection].iD; // Last key is used to validate the callback in the settimeout					
					
					// 1 second delay after wheel item stopped animating to fire the changed event. This gives the user time to make a different selection
					setTimeout(function(){
						if(key == self.lastKey) {
							log.write('onWheelchanged');
							log.write("key: " + key + ", lastKey: " + self.lastKey);
							self.onWheelChanged({
								sourceid: self.container,
								source: self.source,
								selectedidx: self.selection,
								selectedvalue:  self.source[self.selection].iD
							});
						}
					}, self.wheelChangedTimeout);					
				}
			}
		}
	},
	render: function (source, index) {
		this.clean();
		this.source = source;
		this.selection = (index ? index : 0);
		this.itemHeight = ($cn.utilities.measure($(this.container)).y - this.padding) / 5;
		this.topPosition = 2;	

		for (var pos = 0; pos < 5; ++pos) {
			index = this.indexOf(pos);
			
			if (index != -1)
				this.renderItem(index, pos);
		}
        // If slave is selected, focus will be lost when it is re-rendered, so have to manually refocus it
        if (application.element.current === 'selectedslave') {
            navigation.setFocusElement($('selectedslave'));
        }
	},
	renderItem: function (index, position) {
		var container = $(this.container),
		    elem =  new Element('div', { 'class': 'wheelitem' }),
		    y = Math.floor(this.itemHeight * position + (this.padding / 2)),
		    source,
		    html,
		    lineHeight,
		    subText,
		    height,
		    fullName,
		    animation,
            centerWheel,
		    propType;
		
		elem.set('genreid', this.source[index].iD);
		elem.setStyle('visibility','hidden');
		elem.slot = position;
        centerWheel = $cn.config.CenterWheel ? "align='center'": '';
	
		if (position < this.topPosition)
			this.topPosition = position;
				
		if (position < 0) {
			y = container.getFirst().style.top.toInt() - this.itemHeight;
			elem.inject(container, 'top');
		}
		else {
			if (container.getLast())
				y = container.getLast().style.top.toInt() + this.itemHeight;
				
			elem.inject($(this.container));
		}
			
		source = this.source[index];
		if (source.name) {
			fullName = source.name;
			if (typeof ($cn.config.CustomTextCasing) == 'function') {
			    fullName = $cn.config.CustomTextCasing(fullName);
			}
			html = "<table class='item-holder'><tr><td " + centerWheel + ">" + fullName + "</td></tr></table>";
			application.putInnerHTML(elem, html);

	    	height = this.measureElement(elem).y;
        	//log.write("height: " + height + ", item height: " + this.itemHeight + ", text: " + fullName);
		
			if (height > this.itemHeight) {
				fullName = this.truncateText(elem, fullName, this.itemHeight, 0, fullName.length, centerWheel).trim();
				//log.write("$$$$$$$$$$$$$$$ " + fullName);

				if(fullName.endsWith('-')) {
					fullName = fullName.substring(0, fullName.length - 1);
				}
				//log.write("$$$$$$$$$$$$$$$ " + fullName);
				
				html = "<table class='item-holder'><tr><td " + centerWheel + ">" + fullName + "</td></tr></table>";
				//log.write(html);
				application.putInnerHTML(elem, html);
			}
		}						

		animation = application.loadAnimation("wheel");
		propType = (position < 0 || position >= ItemAnimationMap.length) ? ItemAnimationMap[0] : ItemAnimationMap[position];
	
		new Fx.Morph(elem, animation.options).set(animation.properties[propType]);	
		
		elem.setStyle('top', y + "px");
		//elem.setStyle('padding-top', (this.itemHeight / 2) - (height / 2) + 5);	// Center the element
		elem.setStyle('visibility', "visible");
		//log.write("Wheel: Rendering " + elem.innerHTML + " at " + position);
        if(position == 2){
            elem.addClass('hover');
        }
        
	},
	truncateText: function(item, text, height, start, stop, centerWheel){
		if (start < stop - 1) {
			var pos = Math.round((start + stop) / 2);
            var html = "<table class='item-holder'><tr><td " + centerWheel + ">" + $cn.utilities.ellipsis(text, pos) + "</td></tr></table>";
            
            //log.write("truncateText, pos: " + pos + ", text: " + $cn.utilities.ellipsis(text, pos));
			application.putInnerHTML(item,  html);
			
			if (this.measureElement(item).y <= height) {
                //log.write("too short, pos: " + pos + ", stop: " + stop);
				return this.truncateText(item, text, height, pos, stop, centerWheel);
            } else {
                //log.write("too long, pos: " + pos + ", start: " + start);
				return this.truncateText(item, text, height, start, pos, centerWheel);
            }
		} else {
            //log.write("found start: " + start);
			return $cn.utilities.ellipsis(text, start);
		}
	},
	onSaveState: function(payload){
		var state = payload.args[0];

		state[this.id] = {
			source: this.source,
			selection: this.selection,
			topPosition: this.topPosition
		};
	},
	onRestoreState: function(payload){
		var state = payload.args[0];
		$extend(this, state[this.id]);
	}
	
});

var ActiveWheel = null;

var WheelControl = new Class({
	id: 'WheelControl',
	type: 'wheel',
//	activeControl: '',
	persist: {},
    controls:{},
    history: [],
    layoutIsDirty: true,
	isNavigating: false,
    singleWheel:false,
	_masterWheel:null,
	_slaveWheel:null,
    _masterSource: [],
    _slaveSource: [],
    wheelChangedTimeout: 1000,
    masterSourceElement: 'masterdatasource',
    masterSelectedElement: 'selectedmaster',
	itemHeight: 0,
    initialize: function(params){
		log.write('Initializing: ' + this.id);		
        var self = this;
        
        /* Persist Params */
        if(params) {
            this.persist = params;               
        }

		application.events.subscribe(this, 'savestate', this.onSaveState.bind(this));
		application.events.subscribe(this, 'restorestate', this.onRestoreState.bind(this));
	},
	activate: function(){
		
		if (ActiveWheel !== this) {
			
			if (ActiveWheel) {
				application.events.unsubscribe(ActiveWheel, "wheelitemchanged");
				application.events.unsubscribe(ActiveWheel, "wheelrendered");
				application.events.unsubscribe(ActiveWheel, "navigate");
			}

	    	application.events.subscribe(this, 'wheelitemchanged',this.handleWheelItemChange.bind(this));
	    	application.events.subscribe(this, 'wheelrendered',this.wheelRendered.bind(this));
			application.events.subscribe(this, "navigate", this.navigate.bind(this));
			ActiveWheel = this;
		}
	},
	cleanUI: function(){
		if($(this.masterSelectedElement)) {
			$(this.masterSelectedElement).label = '';
		}

		
		if($('selectedslave')) {
			$('selectedslave').label = '';
		}
		
		if($(this.masterSourceElement)) {
			if($(this.masterSourceElement).getChildren().length > 0){
				$(this.masterSourceElement).getChildren().destroy();
			}
		}
		
		if($('slavedatasource')) {
			if($('slavedatasource').getChildren().length > 0){
				$('slavedatasource').getChildren().destroy();
			}
		}
	},
	/*
	 * Load data will:
	 * 1) Set the internal variables with the collections of data. 
	 * 2) Create the master list items <li>.
	 * 3) Attach select events to each item that will load the slave collection.
	 * 4) Select the first item.  
	 */
	loadData: function(masterCollection, slaveCollection, selection) {
		
		//this.saveHistory();
		this.cleanUI();
		this._masterSource = masterCollection;
		this._slaveSource = slaveCollection;		
		//log.write(masterCollection);
		//log.write(slaveCollection);
		if(masterCollection.length > 0) {
			this._renderWheel($(this.masterSourceElement), this._masterSource, selection);
			
//			if (slaveCollection)		
//				this._renderWheel($('slavedatasource'), this._slaveSource[masterCollection[0].iD]);
		}
		
	},
	wheelRendered: function(payload){
		
		if(payload.context === ActiveWheel) {
			var p = payload.args[0];
			
			if(p.source.indexOf('master') > -1) {
				$('slavedatasource').getElements('div').destroy();
				payload.context._renderWheel($('slavedatasource'), payload.context._slaveSource[p.selectedvalue]);
				
				application.events.publish('wheelitemchanged', {
					wheelinstance: p.wheelinstance,
					sourceid: p.sourceid,
					source: p.source,
					selectedidx:  p.selectedidx,
					selectedvalue:  (payload.context._slaveSource[p.selectedvalue]) ? payload.context._slaveSource[p.selectedvalue][0].iD : p.selectedvalue
				});
			}
		}
	},
	handleWheelItemChange: function(payload){

		log.write('context id: ' + payload.context.id);
		log.write('active id: ' + ActiveWheel.id);
		
		if(payload.context === ActiveWheel) {
			log.write("Generic Wheel Item changed. id: " + payload.args[0].wheelinstance);
			var self = this,
                p = payload.args[0],
                x,
                masterValue = p.source[p.selectedidx].parentID,
                slaveValue = p.selectedvalue,
                index = 0;
			this.lastValue = slaveValue;
            if(p.sourceid.indexOf('slave') > -1){
                x = p.source.length;
                while(x--){
                    if(p.source[x].iD == slaveValue){
                        this.lastSlaveValue =p.source[x].name;
                    }
                }
            }
			
			/* If the source is the master column then load the slave wheel with the child elements from the new selection */
			if(p.sourceid.indexOf('master') > -1) {
				masterValue = p.selectedvalue;
                if(this.lastSlaveValue){
                    x = payload.context._slaveSource[masterValue].length;
                    while(x--){
                        if(payload.context._slaveSource[masterValue][x].name == this.lastSlaveValue){
                            slaveValue =payload.context._slaveSource[masterValue][x].iD;
                            index = x;
                        }
                    }
                }
                if(index === 0) {
                    this.lastSlaveValue = false;
                    slaveValue = payload.context._slaveSource[masterValue][0].iD;
                }
				$('slavedatasource').getElements('div').destroy();
				payload.context._renderWheel($('slavedatasource'), payload.context._slaveSource[p.selectedvalue], index);
			}
			
			BrowseView.CurrentWheelValue = masterValue + ":" + slaveValue;
			if(self.lastValue && (self.lastValue == masterValue || self.lastValue == slaveValue)) {
					/* Fire wheel value event */
					application.events.publish('wheelvaluechanged', {
							wheelinstance: self.id,
							mastervalue: masterValue,
							slavevalue: slaveValue				
					});
			}
			
		}
	},
	onWheelChanged: function (obj) {
		
		// Fire wheel change event 
		this.isNavigating = false;
		log.write("onWheelChanged::called()");
		obj.wheelinstance = this.id;
		application.events.publish('wheelitemchanged', obj);

	},
	_morph:function(item,duration,cssclass,callback) {
		
		if(!callback) 
			callback = function() {};
		
		if (item.morphInstance) {
			item.morphInstance.cancel();
		}
				
		item.morphInstance = new Fx.Morph(item, {
			duration: duration, 
			transition: Fx.Transitions.Sine.easeOut,
			onComplete: callback
		}).start(cssclass);
	},
	saveHistory: function(){
		var currentState = $(this.type);
		var currentInstance = $extend(this, {});
		this.history.push({ instance: currentInstance, dom: currentState });    
	},
	loadPrevious: function(){
		log.write("function: " + this.id + ".previousView()");
		var previousView = this.history.pop();
	},
	/*
	 * The rendering process will do the following:
	 * 1) If there are more than 5 elements in the collection then it will display the first 3 and last 2
	 * 2) If there are less than 5 then use the following logic
	 * 	  (1) - display in pole position
	 * 	  (2) - display one in pole position and one above it. on any navigate up or down they will toggle positions
	 * 	  (3) - display one in pole position, one above and below. The results should carousel as expected
	 * 	  (4) - display one in pole position, one above and below with the extra item in the top position. The results should carousel as expected
	 * 	  (5) - item in every position. The results should carousel as expected
	 */
	_renderWheel: function(parentElem, source, index){
		
		if(source && source.length > 0) {
			
			var self = this;
			if (index == null)
				index = 0;
				
			if (parentElem.id == this.masterSourceElement) {
				
				if (!this._masterWheel) {
					this._masterWheel = new Wheel(this.id + "_master", this.masterSourceElement);
					this._masterWheel.wheelChangedTimeout = this.wheelChangedTimeout;
					this._masterWheel.onWheelChanged = function(obj) { self.onWheelChanged(obj); };
				}
				
				log.write("rendering wheel");
				this._masterWheel.render(source, index);

				/* Fire wheel value event */
				application.events.publish('wheelrendered', {
					wheelinstance: self.id,
					sourceid: self.id,
					source: "masterdatasource",
					selectedidx: index,
					selectedvalue:  source[index].iD
				});
				
				return;
			}
			else if(parentElem.id == "slavedatasource") {
				
				if (!this._slaveWheel) {
					this._slaveWheel = new Wheel(this.id + "_slave", "slavedatasource");
					this._slaveWheel.wheelChangedTimeout = this.wheelChangedTimeout;
					this._slaveWheel.onWheelChanged = function(obj) { self.onWheelChanged(obj); };
				}
				
				this._slaveWheel.render(source, index);

				/* Fire wheel value event */
				application.events.publish('wheelrendered', {
					sourceid: self.id,
					source: "slavedatasource",
					selectedidx: index,
					selectedvalue:  source[index].iD
				});
				
				return;
			}
		}
	},
	navigate: function(payload){
		log.write("navigate wheel");
		var masterEl = (this.singleWheel) ? 'singleselectedmaster' : 'selectedmaster';
				
		if(payload.context === ActiveWheel) {
			if(application.element.current == masterEl ||
			   application.element.current == "selectedslave"){
				
				/* check to see if the direction is up or down, if so then navigate the list */			
				if(payload.args[0].direction == "up" ||
				   payload.args[0].direction == "down"){
					/* Prevent the default navigation so the screen does not try to navigate for you. */
					payload.preventDefault();
					if(this.lastNavigate) {
						log.write(this.lastNavigate + ", " + $cn.utilities.DateDiff(new Date(), this.lastNavigate));
					}
					
					// Code to ignore key presses that are faster than 1/2 of a second. This helps control the speed of events and make the UI more responsive
					if(!this.lastNavigate || (this.lastNavigate && $cn.utilities.DateDiff(new Date(), this.lastNavigate) > 500)){
						if (this._masterWheel) {
							this.lastNavigate = new Date();
							var direction = payload.args[0].direction == "up" ? -1 : 1;
							var wheel = application.element.current == masterEl ? this._masterWheel : this._slaveWheel;
							
							this.isNavigating = wheel.move(direction);
								
							return;
						}
					}
					else {
						log.write("Clicking too fast, ignore wheel change.");
						return;
					}
				}
				else if (payload.args[0].direction == "right" && $('titlegrid').style.display == "block") {
					if (application.element.current == "selectedslave" || (this.singleWheel)){
						if (this.isNavigating || !BrowseView.CurrentProcessLoaded) {
							payload.preventDefault();
						}
						else {
							var anchors = $('titlegrid').getElementsByTagName("a");
							if (anchors.length > 0) {
								payload.preventDefault();
								application.navigator.setFocus(anchors[0].id);
							}
						}
					}
					else if(application.element.current == "selectedmaster" && (this.isNavigating)){
						payload.preventDefault();
					}
				}		
				else if (payload.args[0].direction == "left") {
					if (application.element.current == "selectedmaster" || (this.singleWheel)){
						
						switch (BrowseView.currentState) {
							case "browse-view":
								payload.preventDefault();
								navigation.setFocus("dock-home");
								break;
							case "search-view":
								payload.preventDefault();
								navigation.setFocus("dock-search");
								break;
							case "wishlist-view":
								payload.preventDefault();
								navigation.setFocus("dock-wishlist");
								break;
							case "library-view":
								payload.preventDefault();
								navigation.setFocus("dock-library");
								break;
							case "settings-view":
								payload.preventDefault();
								navigation.setFocus("dock-settings");
								break;
							case "help-view":
								payload.preventDefault();
								navigation.setFocus("dock-help");
								break;
						}
					}					
				}				
			}
		}
	},
	render: function(){
		
	},
	split: function(text){

		var name = '',
			nameSplit = text.split(" "),
			tmpSplit = '';
		
		nameSplit.each(function(item){
			//Make sure that there is not an empty char. this causes unnecessary line breaks.
			if(item.length > 0) {
				if(item.length > 12)
				{
					if(item.indexOf('-') > -1) {
						log.write(item);
						tmpSplit = item.split('-');
						tmpSplit.each(function(item2){
							if(item2.stripHTML().length > 12) {
								name = name + item2.stripHTML().substring(0, 11) + "<br />";
								name = name + item2.stripHTML().substring(11, item.stripHTML().length)+ "<br />" ;
							}
							else {
								name = name + item2 + "<br />";
							}
						});						
					}
					else {
						if(item.stripHTML().length > 12) {
							name = name + item.substring(0, 11) + "<br />";
							name = name + item.substring(11, item.length)+ "<br />" ;
						}
						else {
							name = name + item;
						}
					}
				}
				else
				{
					name = name + item + "<br />" ;
				}
			}
		});
		
		if(name.endsWith('-<br />')) {
			//Remove trailing dash if it exists
			name = name.substring(0, name.lastIndexOf('-<br />')) + "<br />";
		}
		
		return name;
		
	},
	onSaveState: function(payload){
		var state = payload.args[0];

		state[this.id] = {
//			activeControl: this.activeControl,
			_masterSource: this._masterSource,
			_slaveSource: this._slaveSource
		};
		
		if (this === ActiveWheel)
			state["ActiveWheel"] = this;
	},
	onRestoreState: function(payload){
		var state = payload.args[0];
		$extend(this, state[this.id]);
		
		if (state["ActiveWheel"] === this)
			this.activate();
	}
});
