//-----------------------------------------------------------------------------
// searchwheel.js
// Copyright (c) 2012 - 2013, Rovi Corporation.  All rights reserved.
//-----------------------------------------------------------------------------
 

var SearchWheelControl = new Class({
	Extends: WheelControl,
	id: 'SearchWheelControl',
	container: 'singlewheel',
	singleWheel: true,
	MetaData: [],
    masterSourceElement: 'singlemasterdatasource',
    masterSelectedElement: 'singleselectedmaster',
	cleanUI: function() {
		$('singlewheel').show();
		if($('singleselectedmaster')) {
			$('singleselectedmaster').label = '';
		}

		if($('singlemasterdatasource')) {
			if($('singlemasterdatasource').getChildren().length > 0){

				$('singlemasterdatasource').getChildren().destroy();
			}
		}
	},
	handleWheelItemChange: function(payload){		
		log.write(payload);
		
		if(payload.context === ActiveWheel) {
			var p = payload.args[0];
			log.write("Search Wheel Item changed. Now fire custom method. " + payload.args[0].wheelinstance);
			/* If the source is the master column then load the slave wheel with the child elements from the new selection */
			application.events.publish('searchwheelchanged', {
				selectedvalue: p.selectedvalue
			});
		}
	},
	loadSearchMenu: function() {

		this.layoutIsDirty = true;
		//this.saveHistory();
		this.cleanUI();
		
		var menu = [];
		menu.push({
				name: "Title",
				iD: "Title",
				parentID: 0,
				list: 0
		});
		
		//Only include cast searching if baseline is enabled.
		if($cn.data.baselineEnable) {
			
			menu.push({
				name: "Actor",
				iD: "Actor",
				parentID: 0,
				list: 1
			});
			
			menu.push({
				name: "Director",
				iD: "Director",
				parentID: 0,
				list: 1
			});
			
			menu.push({
				name: "Writer",
				iD: "Writer",
				parentID: 0,
				list: 1
			});
			
		}
		
		menu.push({
			name: "Keyword",
			iD: "Keyword",
			parentID: 0,
			list: 0
		});
		
		this.loadData(menu, [{}]);	
	},
	navigate: function(payload){
		if(payload.context === ActiveWheel) {
			if(document.getElementById(application.element.current)  && application.element.current == "singleselectedmaster"){
				if(payload.args[0].direction == "left"){
					payload.preventDefault();
					application.navigator.setFocus("dock-search");
				}
				else if(payload.args[0].direction == "right"){
					payload.preventDefault();
					if ($('FirstKey').style.display != 'none')
						application.navigator.setFocus("FirstKey");
					else
						application.navigator.setFocus("KeyboardKey1");
				}
				else {
					this.parent(payload);
				}
			}
		}
	}
});
