//-----------------------------------------------------------------------------
// tvseasonwheel.js
// Copyright (c) 2012 - 2013, Rovi Corporation.  All rights reserved.
//-----------------------------------------------------------------------------
 

var TvSeasonsWheelControl = new Class({
	Extends: WheelControl,
	Implements: WheelControl,
	id: 'TvSeasonsWheelControl',
	container: 'searchwheel',
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

		if(payload.context === ActiveWheel) {
			var p = payload.args[0];
			var selectedItem = this._masterSource[p.selectedidx];
			
			application.events.publish('gridloading', {grid: 'titlegrid', message:"tvloading", className: "episodegrid", cssClass:"tv"});
			
			if (this.isLibrary) {
				$cn.methods.getBundleListingPurchased(p.selectedvalue, function(callback){
				
					log.write(callback.bundleItems.length);
					var items = callback.bundleItems;
					
					if (this.isSeasonal) {

						// Add in 'All Episodes' item
						items = items.slice();
						items.unshift({
							titleID: selectedItem.iD,
							name: application.resource.all_episodes,
							itemNumber: selectedItem.season
						});
					}
					
					if (selectedItem.watchFilter) {
						
						var filtered = [];
						items.each(function(item){
							if (!item.hasWatched)
								filtered.push(item);
						});	
						
						items = filtered;
					}
					
					BrowseView.LastGridProcess = "tvseasons";
					application.events.publish('loadgrid', {
						grid: 'titlegrid',
						data: items,
						columns: 1,
						template: 'listgrid',
						gridProcess: 'tvseasons',
						className: 'episodegrid',
						returnFocus: 'singleselectedmaster'
					});
					
				}.bind(this));
			}
			else {
				
				$cn.methods.getBundleListing(p.selectedvalue, function(callback){
				
					log.write(callback.bundleItems.length);
					//	        	application.currentView.layoutIsDirty = true;
					var items = callback.bundleItems;

					if (this.isSeasonal) {

						// Add in 'All Episodes' item
						items = items.slice();
						items.unshift({
							titleID: selectedItem.iD,
							name: application.resource.all_episodes,
							itemNumber: selectedItem.name
						});
						$('titlelist').setStyle("height", "352px");
					}
					
					BrowseView.LastGridProcess = "tvepisodes";
					application.events.publish('loadgrid', {
						grid: 'titlegrid',
						data: items,
						columns: 1,
						template: 'listgrid',
						gridProcess: 'tvepisodes',
						className: 'episodegrid',
						returnFocus: 'singleselectedmaster'
					});
					
				}.bind(this));
			}  
		}
	},
	loadData: function(masterCollection, seasonTitleID) {
		var index = 0;
		var masterKey = '';
		this.layoutIsDirty = true;
		this.saveHistory();
		this.cleanUI();
		
		
		this._masterSource = [];

		if (this.isLibrary) {

			if (this.isSeasonal) {
			
				for (var x = 0; x < masterCollection.length; x++) {
					if (seasonTitleID == masterCollection[x].titleID) 
						index = this._masterSource.length;
					
					this._masterSource.push({
						name: masterCollection[x].name ,
						season: masterCollection[x].name,
						iD: masterCollection[x].titleID
					});
					if (!masterCollection[x].hasWatched) {
						this._masterSource.push({
							name: masterCollection[x].name + "<br/>" + application.resource.unwatched_episodes,
							season: masterCollection[x].name,
							iD: masterCollection[x].titleID,
							watchFilter: true
						});
					}
				}
			}
			else {
	        	this._masterSource = [{
						name: application.resource.all_episodes,
						iD: masterCollection[0].titleID
					}, {
						name: application.resource.unwatched_episodes,
						iD: masterCollection[0].titleID,
						watchFilter: true
					}];
			}
		}
		else {
			
			for(var x = 0; x < masterCollection.length; x++)
			{
				this._masterSource.push({
					name: masterCollection[x].name,
					iD: masterCollection[x].titleID
				});
				if (seasonTitleID == masterCollection[x].titleID)
					index = x;
			}
		}

		if (this._masterSource.length > 0) {
		
			$('titlegrid').show();
			$('singlewheel').show();
			this._renderWheel($('singlemasterdatasource'), this._masterSource, index);
			navigation.setFocus('singleselectedmaster');
		}	

	},
	navigate: function(payload){
	
		if (payload.context === ActiveWheel && payload.args[0].current == "singleselectedmaster")
		{
			if (payload.args[0].direction == "left") {
				navigation.setFocus('tdbuttonEpisodes');
				payload.preventDefault();
			}
			else
				this.parent(payload);
		}
	},
	onSaveState: function(payload){
		this.parent(payload);
		
		var state = payload.args[0][this.id];
		state.isLibrary = this.isLibrary;
		state.isSeasonal = this.isSeasonal;
	}

});
