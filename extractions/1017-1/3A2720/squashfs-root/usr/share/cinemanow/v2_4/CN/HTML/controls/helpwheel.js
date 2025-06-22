//-----------------------------------------------------------------------------
// helpwheel.js
// Copyright (c) 2012 - 2013, Rovi Corporation.  All rights reserved.
//-----------------------------------------------------------------------------
 
/**
 * @author atumminaro
 */
var HelpWheelControl = new Class({
	Extends: WheelControl,
	id: 'HelpWheelControl',
	container: 'singlewheel',
	singleWheel: true,
	MetaData: [],
    masterSourceElement: 'singlemasterdatasource',
    masterSelectedElement: 'singleselectedmaster',
	handleWheelItemChange: function(payload){		
		log.write(payload);
		
		if(payload.context === ActiveWheel) {
			var p = payload.args[0];
			log.write("Search Wheel Item changed. Now fire custom method. " + payload.args[0].wheelinstance);
			/* If the source is the master column then load the slave wheel with the child elements from the new selection */
			application.events.publish('wheelvaluechanged', {
				selectedvalue: p.selectedvalue,
				wheelinstance: this.id
			});
		}
	},
	loadHelpMenu: function() {
		application.currentView.layoutIsDirty = true;
		this.cleanUI();
		
        if ($cn.config.EnableUV) {
            this.loadData([{
                    name: application.resource.HelpWheelOptionStrings.GettingStarted,
                    iD: "GettingStarted",
                    parentID: 0,
                    list: 1
                },{
                    name: application.resource.HelpWheelOptionStrings.BrowsingStore,
                    iD: "BrowsingStore",
                    parentID: 0,
                    list: 0
                },{
                    name: application.resource.HelpWheelOptionStrings.Searching,
                    iD: "Searching",
                    parentID: 0,
                    list: 0
                },{
                    name: application.resource.HelpWheelOptionStrings.WishList,
                    iD: "WishList",
                    parentID: 0,
                    list: 0
                },{
                    name: application.resource.HelpWheelOptionStrings.Library,
                    iD: "Library",
                    parentID: 0,
                    list: 1
                },{
                    name: application.resource.HelpWheelOptionStrings.ParentalControls,
                    iD: "ParentalControls",
                    parentID: 0,
                    list: 1
                },{
                    name: application.resource.HelpWheelOptionStrings.OnscreenControls,
                    iD: "OnscreenControls",
                    parentID: 0,
                    list: 1
                },{
                    name: application.resource.HelpWheelOptionStrings.CustomerSupport,
                    iD: "CustomerSupport",
                    parentID: 0,
                    list: 1
                },{
                    name: application.resource.HelpWheelOptionStrings.RentingBuying,
                    iD: "RentingBuying",
                    parentID: 0,
                    list: 1
                },{
                    name: application.resource.HelpWheelOptionStrings.Ultraviolet,
                    iD: "Ultraviolet",
                    parentID: 0,
                    list: 1
                }], [{}]
            );	
        } else {
            this.loadData([{
                name: application.resource.HelpWheelOptionStrings.GettingStarted,
                iD: "GettingStarted",
                parentID: 0,
                list: 1
            },{
                name: application.resource.HelpWheelOptionStrings.BrowsingStore,
                iD: "BrowsingStore",
                parentID: 0,
                list: 0
            },{
                name: application.resource.HelpWheelOptionStrings.Searching,
                iD: "Searching",
                parentID: 0,
                list: 0
            },{
                name: application.resource.HelpWheelOptionStrings.WishList,
                iD: "WishList",
                parentID: 0,
                list: 0
            },{
                name: application.resource.HelpWheelOptionStrings.Library,
                iD: "Library",
                parentID: 0,
                list: 1
            },{
                name: application.resource.HelpWheelOptionStrings.ParentalControls,
                iD: "ParentalControls",
                parentID: 0,
                list: 1
            },{
                name: application.resource.HelpWheelOptionStrings.OnscreenControls,
                iD: "OnscreenControls",
                parentID: 0,
                list: 1
            },{
                name: application.resource.HelpWheelOptionStrings.CustomerSupport,
                iD: "CustomerSupport",
                parentID: 0,
                list: 1
            },{
                name: application.resource.HelpWheelOptionStrings.RentingBuying,
                iD: "RentingBuying",
                parentID: 0,
                list: 1
            }], [{}]
            );
        }
	
		application.events.publish('wheelvaluechanged', {
			selectedvalue: "GettingStarted",
			wheelinstance: this.id
		});
		
	}
});
