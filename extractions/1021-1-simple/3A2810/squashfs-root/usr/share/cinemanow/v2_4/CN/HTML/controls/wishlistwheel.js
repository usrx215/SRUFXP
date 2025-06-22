//-----------------------------------------------------------------------------
// wishlistwheel.js
// Copyright (c) 2012 - 2013, Rovi Corporation.  All rights reserved.
//-----------------------------------------------------------------------------
 
var WishlistWheelControlProperties = {
		Extends: WheelControl,
		Implements: WheelControl,
		id: 'WishlistWheelControl',
		container: 'singlewheel',
		singleWheel: true,
		MetaData: [],
	    masterSourceElement: 'singlemasterdatasource',
	    masterSelectedElement: 'singleselectedmaster',
		cleanUI: function() {
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
		},
		loadData: function(masterCollection, selection) {
			
			var index = 0;
			
			if (selection) {
				for (var i = 0; i < masterCollection.length; ++i) {
					if (masterCollection[i].iD == selection) {
						index = i;
						break;
					}
				}
			}			
			this.cleanUI();			
			this._masterSource = masterCollection;
			this._renderWheel($(this.masterSourceElement), this._masterSource, index);						
		}
	/*	loadWishlistMenu: function() {

			this.layoutIsDirty = true;
			//this.saveHistory();
			this.cleanUI();
			
			this.loadData([{
					name: "Movies",
					iD: "Movie",
					parentID: 0
				},{
					name: "TV Shows",
					iD: "TV_Show",
					parentID: 0
				}], [{}]
			);	
		}*/	
	}, 
	WishlistWheelControl = new Class(WishlistWheelControlProperties);
