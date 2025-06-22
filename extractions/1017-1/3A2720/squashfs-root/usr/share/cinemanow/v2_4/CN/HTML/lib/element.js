//-----------------------------------------------------------------------------
// element.js
// Copyright (c) 2012 - 2013, Rovi Corporation.  All rights reserved.
//-----------------------------------------------------------------------------
 
/**
 * @author tjmchattie
 */
var element = {
		_spatial: [],
		/* Current is the element that currently has focus. */
		current: null,
		registeredControls: [],
		/* The buildPositions method will build a control array with the element and coordinates of a specific view. */
		buildPositions: function(){
			/* Only do this is the layout has been changed. If it has not changed ignore call for performance reasons. */
			if(application.currentView.layoutIsDirty) {
				log.write("Building screen positions of elements");
				delete application.currentView.controls;
				application.currentView.controls = [];
				
				var elements = $(application.currentView.id).getElements("a"), 
					pos = null, 
					elem = null
                    x;
				
				for(x = 0; x < elements.length; x++){
					elem = elements[x]; 
					
					if(elem) {
						pos = elem.getPosition();	
						if(elem.offsetWidth /*elem.getStyle("display") != "none"*/){
							application.currentView.controls[application.currentView.controls.length] = {elemid: elem.id, x: pos.x, y: pos.y};							
						}
					}
				}	
				application.currentView.layoutIsDirty = false;
				elements = null;
				pos = null;
				elem = null;
			}
		},
		
		/* bindActions will attach methods to be called in reference to elements in certain events. */
		bindActions: function(elemid, incremental){
			log.write(elemid);
			if(document.getElementById(elemid)){
				var elms = document.getElementById(elemid).getElementsByTagName('a');
				
				/* Generate ids for all of the elements */
				for(var x = 0; x < elms.length; x++){
					/* Add to spacial map. The spacial map is just an array of elements on the current view */
					if(!elms[x].id){
						elms[x].id = application.utility.generate.id(elms[x]);
					}
				}
			}
		},
		registerControl: function(ctl){
			this.registeredControls.push(ctl);
		}
};
