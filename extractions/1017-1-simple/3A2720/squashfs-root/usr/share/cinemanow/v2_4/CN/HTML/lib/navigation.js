//-----------------------------------------------------------------------------
// navigation.js
// Copyright (c) 2012 - 2013, Rovi Corporation.  All rights reserved.
//-----------------------------------------------------------------------------
 
/**
 * @author tjmchattie
 */
var navigation = {
	buildNavigation: function(elements) {
		
		elements.sort(navigation.sortElemByY);
		
		var rows = [], 
			row = -1, 
			col = 0,
			y = -1,
			i = 0,
			prevRow,
			nextRow;
		
		elements.each(function(el){
			
			if (el.offsetHeight) { // Visible items only
				if (el.offsetTop > y) {
					y = el.offsetTop + el.offsetHeight;
					rows[++row] = [];
				}
				
				rows[row].push(el);
			}
		});
 
		rows.each(function(r){
			r.sort(navigation.sortElemByX);
			
			// Connect elements
			for (i = r.length - 2; i >= 1; --i) {
				r[i].setProperties({
					left: r[i].hasAttribute("left") ? r[i].getAttribute("left") : r[i - 1].id,
					right: r[i].hasAttribute("right") ? r[i].getAttribute("right") : r[i + 1].id
				});
			}	
			
			if (r.length > 1) {
				r[0].setProperty("right", r[1].id);
				r[r.length - 1].setProperty("left", r[r.length - 2].id);
			}
		});
		
		// Connect columns 
		for (row = 0; row < rows.length; ++row) {

			prevRow = rows[row - 1] 
			nextRow = rows[row + 1]; 
			
			rows[row].each(function(el) {
				
				if (prevRow) {
					for (col = 0; col < prevRow.length; ++col) {
						// Use first interesecting element for now.
						// Needs to be updated to compare first intersecting
						// element with next element in row to see which 
						// is closer.
						if (el.intersects(prevRow[col]) && (!el.hasAttribute("up") || el.hasAttribute("data-builtUp"))) {
                            log.write(el.id + " BUILT UP");
							el.setProperty("up", prevRow[col].id);
                            el.setProperty("data-builtUp", "true");
						}
					}
				}
				
				if (nextRow) {
					for (col = 0; col < nextRow.length; ++col) {
						if (el.intersects(nextRow[col]) && (!el.hasAttribute("down") || el.hasAttribute("data-builtDown"))) {
                            log.write(el.id + " BUILT Down");
							el.setProperty("down", nextRow[col].id);
                            el.setProperty("data-builtDown", "true");
						}
					}
				}
			});
		}
		log.write("buildNavigation - exit");		

	},
	/* Method to build the navigatable element index and set focus to the first control that can accept it. */
	setFirstFocusableElement: function(){
		log.write("No element has focus yet. Try to set initial focus.");
		application.element.buildPositions();
		application.currentView.controls.sort(this.sortByX);
		
		if(application.currentView.controls[0] && application.currentView.controls[0].elemid) {
			application.element.current = application.currentView.controls[0].elemid;
			var tmp = $(application.element.current);
			
			log.write("Current focused element is: " + application.currentView.controls[0].elemid);
		
			if (typeof tmp.setFocus == 'function') {		
				tmp.setFocus({});
				tmp.addClass("hover");
			}
			else { log.write("ERROR: first element on this view has a focusable attribute"); }
		}
		else {
			log.write(application.currentView.controls);
		}
			
	},
	/* Method that will move the current focus up from the current element to the next focusable element. */
	up: function(payload){
		log.write("Navigate Up");
		if((application.element.current == null || application.element.current == '') || (application.element.current != '' && !document.getElementById(application.element.current))) { 
			/* If focus is not set yet for some reason then set it. If the default focus is set then there should not be any up action. */
			this.setFirstFocusableElement();
		}
		
		var focusedElement = null, 
			focusedId = $(application.element.current).attributes["up"],
			contenders = [],
			currentPos = null,
			element = null,
			x = 0,
			y = 0;
		
			
		if (focusedId != null) {
			focusedElement = $(focusedId.value);
		}

		if (!focusedElement) {
			currentPos = $(application.element.current).getPosition();

			application.element.buildPositions();
			
			//if(application.currentView.layoutIsDirty) {
				application.currentView.controls.sort(this.sortByYDesc);
			//}
			
			/* Logic for moving up is to take the element that is above the selected element and is closest to the X position. */
			for (x = 0; x < application.currentView.controls.length; x++) {
			
				if (this.isVisible(application.currentView.controls[x])) {
				
					if (application.currentView.controls[x].x == currentPos.x) {
					
						//Is the item 
						if (currentPos.y - 4 > application.currentView.controls[x].y) {
						
							element = $(application.currentView.controls[x].elemid);
							
							//if (typeof element.setFocus == 'function') {					
							/* log.write("this.currentView.controls[x].elemid: " + this.currentView.controls[x].elemid + ", this.currentView.controls[x].y: " + this.currentView.controls[x].y + ", currentPos.y: " + currentPos.y); */
							contenders[contenders.length] = application.currentView.controls[x];
							//log.write(application.currentView.controls[x].elemid+" logged: "+application.currentView.controls[x].x + ", " + currentPos.x)
							/* If the Xpos is equal. Then we can assume it is directly underneath because we are still in the loop. */
							
							/* log.write("Elem has set x pos: " + application.currentView.controls[x].elemid); */
							/* Check to see if the element has a focus method (all elements that can have focus should have this method */
							focusedElement = element;
							break;
						}
					//}
					}
				}
			}
			
			/* If a direct match was not found then try to find the nearest x neighbor. */
			if (!focusedElement) {
				/* contenders.sort(this.sortByXDesc); [TODO: THIS NEEDS SOME WORK] */
				contenders.sort(this.sortByXDesc);
				
				for (y = 0; y < contenders.length; y++) {
				
					/* Check to see if the element has a focus method (all elements that can have focus should have this method. */
					element = $(contenders[y].elemid);
					
					if (typeof element.setFocus == 'function') {
						focusedElement = element;
						break;
					}
				}
			}
		}
		if(focusedElement){
			this.setFocusElement(focusedElement);
		}
	},
	/* Default method for moving focus down to the next available element. */
	down: function(payload){
		log.write("Navigate Down");
		if((application.element.current == null || application.element.current == '') || (application.element.current != '' && !document.getElementById(application.element.current))) { 
			/* If focus is not set yet for some reason then set it. */
			application.setFirstFocusableElement();
		}
		
		var focusedElement = null,
			focusedId = $(application.element.current).attributes["down"],
			contenders = [],
			currentPos = null,
			currentSize = null,
			element = null,
			x = 0,
			y = 0;
		
		if (focusedId != null) {
			focusedElement = $(focusedId.value);
		}

		if (!focusedElement) {
			currentPos = $(application.element.current).getPosition();
			currentSize = $(application.element.current).getSize();

			application.element.buildPositions();
			
			//if(application.currentView.layoutIsDirty) {
				application.currentView.controls.sort(this.sortByY);
			//}
			
			/*Logic for moving down is to take the element that is beneath the selected element and is closest to the X position*/
			for (x = 0; x < application.currentView.controls.length; x++) {
				if (this.isVisible(application.currentView.controls[x])) {
					/* If the test control's y position is greater then the current control's y position + the current control's height then it is a contender */
					
					if (application.currentView.controls[x].y + 5 >= (currentPos.y + currentSize.y)) {
						contenders[contenders.length] = application.currentView.controls[x];
						
						/*If the Xpos is equal. Then we can assume it is directly underneath because we are still in the loop.*/
						if (application.currentView.controls[x].x == currentPos.x) {
						
							/*Check to see if the element has a focus method (all elements that can have focus should have this method) */
							element = $(application.currentView.controls[x].elemid);
							
							//if (typeof element.setFocus == 'function') {
							focusedElement = element;
							break;
						//}
						
						}
					}
				}
			}
			
			/* If a direct match was not found then try to find the nearest x neighbor. */
			if (!focusedElement) {
				contenders.sort(this.sortByX);
				
				for (y = 0; y < contenders.length; y++) {
					/* Check to see if the element has a focus method (all elements that can have focus should have this method */
					element = $(contenders[y].elemid);
					
					//if (typeof element.setFocus == 'function') {
					focusedElement = element;
					break;
				//}
				}
			}
		}
				
		if(focusedElement){
			this.setFocusElement(focusedElement);
		}
		
	},
	/* Default method for moving focus right to the next available element. */
	right: function(payload){
		log.write("Navigate Right");
		if((application.element.current == null || application.element.current == '') || (application.element.current != '' && !document.getElementById(application.element.current))) { 
			/* If focus is not set yet for some reason then set it. */
			application.setFirstFocusableElement();
		}
		
		var focusedElement = null,
			focusedId = $(application.element.current).attributes["right"],
			contenders = [],
			currentPos = null,
			currentSize = null,
			element = null,
			x = 0,
			y = 0;
		
		if (focusedId != null) {
			focusedElement = $(focusedId.value);
		}

		if (!focusedElement) {
			currentPos = $(application.element.current).getPosition();
			currentSize = $(application.element.current).getSize();

			application.element.buildPositions();
			
			//if(application.currentView.layoutIsDirty) {
				application.currentView.controls.sort(this.sortByX);
			//}
			
			/*Logic for moving right is to take the element that is right the selected element and is closest to the y position*/
			for (x = 0; x < application.currentView.controls.length; x++) {
				if (this.isVisible(application.currentView.controls[x])) {
					/* If the test control's y position is greater then the current control's y position + the current control's height then it is a contender */
					if (application.currentView.controls[x].x >= (currentPos.x + currentSize.x)) {
						contenders[contenders.length] = application.currentView.controls[x];
						
						/*If the Ypos is within 3 pixels of the currentPos (accounting for any borders), then we can assume it is directly to the right because we are still in the loop.*/
						if (application.currentView.controls[x].y > currentPos.y - 3 && application.currentView.controls[x].y < currentPos.y + 3) {
						
							/*Check to see if the element has a focus method (all elements that can have focus should have this method) */
							element = $(application.currentView.controls[x].elemid);
							
							//if (typeof element.setFocus == 'function') {
							focusedElement = element;
							log.write("Focused element: " + focusedElement.id);
							break;
						//}
						
						}
					}
				}
			}
			
			/* If a direct match was not found then try to find the nearest x neighbor. */
			if (!focusedElement) {
				//contenders.sort(this.sortByY);
				
				for (y = 0; y < contenders.length; y++) {
					/* Check to see if the element has a focus method (all elements that can have focus should have this method */
					element = $(contenders[y].elemid);
					
					//if (typeof element.setFocus == 'function') {
					focusedElement = element;
					log.write("Focused element: " + focusedElement.id);
					break;
				//}
				}
			}
		}
		
		if(focusedElement){
			this.setFocusElement(focusedElement);
		}
		
	},
	/* Default method for moving focus left to the next available element. */
	left: function(payload){
		log.write("Navigate Left");
		if((application.element.current == null || application.element.current == '') || (application.element.current != '' && !document.getElementById(application.element.current))) { 
			/* If focus is not set yet for some reason then set it. */
			application.setFirstFocusableElement();
		}
		
		var focusedElement = null,
			focusedId = $(application.element.current).attributes["left"],
			contenders = [],
			currentPos = null,
			currentSize = null,
			element = null,
			x = 0,
			y = 0;
		
		if (focusedId != null) {
			focusedElement = $(focusedId.value);
		}

		if (!focusedElement) {
			currentPos = $(application.element.current).getPosition();
			currentSize = $(application.element.current).getSize();
			
			application.element.buildPositions();
			
			//if(application.currentView.layoutIsDirty) {
				application.currentView.controls.sort(this.sortByXDesc);
			//}
			
			/*Logic for moving down is to take the element that is beneath the selected element and is closest to the X position*/
			for (x = 0; x < application.currentView.controls.length; x++) {
				/* If the test control's y position is greater then the current control's y position + the current control's height then it is a contender */
				if (this.isVisible(application.currentView.controls[x])) {
					if (application.currentView.controls[x].x < currentPos.x) {
						contenders[contenders.length] = application.currentView.controls[x];
						
						/*If the Ypos is within 3 pixels of the currentPos (accounting for any borders), then we can assume it is directly to the right because we are still in the loop.*/
						if (application.currentView.controls[x].y > currentPos.y - 3 && application.currentView.controls[x].y < currentPos.y + 3) {
						
							/*Check to see if the element has a focus method (all elements that can have focus should have this method) */
							element = $(application.currentView.controls[x].elemid);
							
							//if (typeof element.setFocus == 'function') {
							focusedElement = element;
							break;
						//}
						
						}
					}
				}
			}
			
			/* If a direct match was not found then try to find the nearest x neighbor. */
			if (!focusedElement) {
				//contenders.sort(this.sortByYDesc);
				
				for (y = 0; y < contenders.length; y++) {
					/* Check to see if the element has a focus method (all elements that can have focus should have this method */
					element = $(contenders[y].elemid);
					
					//if (typeof element.setFocus == 'function') {
					focusedElement = element;
					break;
				//}
				}
			}
		}
		
				
		if(focusedElement){
			this.setFocusElement(focusedElement);
		}
		
	},
	setFocus: function(elemid) {
		this.setFocusElement($(elemid));
	},
	setFocusElement: function(focusedElement) {
		
		if (application.element.current != null && application.element.current != '' && document.getElementById(application.element.current)) {
			var elem = $(application.element.current);
			
			if(elem.get("blur")){
				eval('(' + elem.get("blur")   + ')');
			}
			
			application.events.publish('elementblur', { bluredelem: application.element.current	});
			elem.removeClass("hover");
			log.write("Lose Focus: " + application.element.current);
		}
		
		application.element.current = (focusedElement) ? focusedElement.id : null;
				
		if(focusedElement){
			var elem = $(application.element.current);
			
			if(elem.get("focus")){
				eval('(' + elem.get("focus")   + ')');
			}
			
			application.events.publish('elementfocus',{focusedelem: application.element.current});
			elem.addClass("hover");
			log.write("Get Focus: " + application.element.current);
		}
	},
	isVisible: function(elem) {
		var e = $(elem.elemid);
		if (e && e.offsetWidth)
			return this.isInBounds(elem);
			
		return false;

	},
	isInBounds: function(elem) {
		var b = true;
		
		if(elem.x < 0 || elem.x > 960 || elem.y < 0 || elem.y > 540 || $(elem.elemid).getStyle('display') == 'none') {
			b = false;
		}
		//log.write(elem.elemid + ": x(" + elem.x + "), y(" + elem.y + "), inBounds (" + b + ")");
		return b;
	},
	/* Sort controll array by xPosition Asc */
	sortByX: function (a, b) {
		var x = a.x, 
			y = b.x;
		return ((x < y) ? -1 : ((x > y) ? 1 : 0));
	},
	/* Sort controll array by xPosition Desc */
	sortByXDesc: function (a, b) {
		var x = a.x,
			y = b.x;
		return ((x > y) ? -1 : ((x < y) ? 1 : 0));
	},
	/* Sort controll array by yPosition Asc */
	sortByY: function (a, b) {
		var x = a.y,
			y = b.y;
		return ((x < y) ? -1 : ((x > y) ? 1 : 0));
	},
	/* Sort controll array by yPosition Desc */
	sortByYDesc: function (a, b) {
		var x = a.y,
			y = b.y;
		return ((x > y) ? -1 : ((x < y) ? 1 : 0));
	},
	sortElemByX: function (a, b) {
		var x = a.offsetLeft,
			y = b.offsetLeft;
		return ((x < y) ? -1 : ((x > y) ? 1 : 0));
	},
	/* Sort controll array by yPosition Asc */
	sortElemByY: function (a, b) {
		var x = a.offsetTop,
			y = b.offsetTop;
		return ((x < y) ? -1 : ((x > y) ? 1 : 0));
	}
};

