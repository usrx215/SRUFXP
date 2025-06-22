//-----------------------------------------------------------------------------
// episodepanel.js
// Copyright (c) 2012 - 2013, Rovi Corporation.  All rights reserved.
//-----------------------------------------------------------------------------
 
/**
 * @author Lance_Wilson
 */
var EpisodePanelControl = new Class({
	id: 'episodepanel',
	title: null,
    initialize: function(){
    },
    show: function()
    {
        // Clear any previous titles that would show in the grid
        $('titlelist').innerHTML = "";

    	this.title = BrowseView.TitleViewControl.persist.title;
        this.title.show = $cn.utilities.ellipsis(this.title.show, 30);

		BrowseView.GridControl.loadHeader("episode_header.tpl", this.title);
		
		if(!this.TvSeasonsWheelControl) {
			this.TvSeasonsWheelControl = new TvSeasonsWheelControl(); 
		}

		this.TvSeasonsWheelControl.isLibrary = this.title.passID != null;
		this.TvSeasonsWheelControl.isSeasonal = this.title.seasonal;
		
		if (this.title.passID != null) {

			if (this.title.seasonal)	 {
			
				$cn.methods.getBundleListingPurchased(this.title.showTitleID,function(callback){
		        	log.write(callback.bundleItems.length);
		       
		        	this.TvSeasonsWheelControl.activate();
		        	this.TvSeasonsWheelControl.loadData(callback.bundleItems, this.title.seasonTitleID); 
					BrowseView.shrinkTitleDetails("episode-panel", null);
							
		        }.bind(this)); 
			}
			else {

	        	this.TvSeasonsWheelControl.activate();
	        	this.TvSeasonsWheelControl.loadData([{ titleID: this.title.showTitleID }]);
				BrowseView.shrinkTitleDetails("episode-panel", null);		
			}		
		}
		else {

			var className = this.title.seasonal ? 'episodegrid' : 'episodegrid-wide';
			application.events.publish('gridloading', {grid: 'titlegrid', message:"tvloading", className: className,  cssClass:"tv"});
			
			$cn.methods.getBundleListing(this.title.showTitleID,function(callback){
	        	log.write(callback.bundleItems.length);
	       
	        	application.currentView.layoutIsDirty = true;
	        	
	        	if(callback.bundleItems.length == 0){
                    log.write("##### ERROR - Empty bundle listing ######");
                    application.events.publish("error", {type: "system_error", "method": "getBundleListing" });
                    // Episodes button will not be shown instead of throwing error
	        		return;
	        	}

                BrowseView.shrinkTitleDetails("episode-panel", null);

                if (!this.title.seasonal) {
					$('titlegrid').show();
					BrowseView.LastGridProcess = "episodelist";
					application.events.publish('loadgrid', {
						grid: 'titlegrid',
						data: [],//callback.bundleItems,
						columns: 1,
						template: 'listgrid',
						gridProcess: 'episodelist',
						className: 'episodegrid-wide',
						returnFocus: application.element.current
					});
					
					navigation.setFocusElement($("titlelist").getElements("a")[0]);
				}
				else {
		        	this.TvSeasonsWheelControl.activate();
		        	this.TvSeasonsWheelControl.loadData(callback.bundleItems, this.title.seasonTitleID);
				}
	

				
	        }.bind(this)); 
		}
    },
    hide: function() {
    },
	onItemSelected: function(titleID) {
		
		if (this.TvSeasonsWheelControl.isLibrary) {
			$cn.methods.lookupPurchaseDetailsForTitle(titleID, function(result){
				application.events.publish('loadtitleview', {id: titleID, passID: parseInt(result.passID), type: 'library'});		
			});
		}
		else
			application.events.publish('loadtitleview', {id: titleID, checklibrary: true});		
	}
});
