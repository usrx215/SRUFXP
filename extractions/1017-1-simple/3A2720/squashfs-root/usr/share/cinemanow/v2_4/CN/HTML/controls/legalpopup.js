//-----------------------------------------------------------------------------
// legalpopup.js
// Copyright (c) 2012 - 2013, Rovi Corporation.  All rights reserved.
//-----------------------------------------------------------------------------
 
var LegalPopup = new Class({
	Extends:ModalControl,
	scrollview: null,
    initialize: function(id){
    	this.parent(id);
	},
    setCssClass: function(id) {
        var cssClass = (id == "uvtermsofservice" ? id : 'legal');
		this.parent(cssClass);
    },
	draw: function(){
		this.parent();
		var scrollview = $(this.contentId).getElement(".scroll");
			
		if (scrollview) 
			this.scrollview = new ScrollView(scrollview);
	},
	show: function(theCallback) {
        if (theCallback) {
            this.theCallback = theCallback;
        }
		this.parent();

		// Scrollbar must be drawn after the call to show() 
		// in order to correctly determine scrolling extents
		if (this.scrollview)  {
			this.scrollview.draw();
		}
	},
	hide: function(){
		this.parent();

		if (this.scrollview)
			this.scrollview.destroy();

        if (this.theCallback) {
            this.theCallback();
        }
	},
	onBack: function(payload){
		
		if (this.id == "eula") {
			payload.preventDefault();
		}
		else {
			this.parent(payload);
		}
	}
});
