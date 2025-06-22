//-----------------------------------------------------------------------------
// librarytitleview.js
// Copyright (c) 2012 - 2013, Rovi Corporation.  All rights reserved.
//-----------------------------------------------------------------------------
 
/**
 * @author tjmchattie
 */
var TitleViewControl = new Class({
	id: 'librarytitleviewcontrol',
	persist: {},
    controls:{},
    tv:false,
    episode:true,
    layoutIsDirty: true,
    tpl: null,
    initialize: function(){
    	
		application.events.subscribe(this, 'elementfocus', this.updateSeparator);

    },
	updateSeparator: function() {
		$('WheelThumb').erase('class');
		if($(application.element.current).getPosition().x > $('WheelSeparator').getPosition().x) {
			$('WheelThumb').addClass('wheel-thumb-left');
		} else {
			$('WheelThumb').addClass('wheel-thumb-right');
		}
	},
    init: function(params, direction){
		log.write('titleviewcontrol.init()');		
        var self = this;
        
        //Persist Params
        if(params) {
            this.persist = params;               
        }      
		
	},
	cleanUI: function(){
		if($('titledetailscontainer')) {
			if($('titledetailscontainer').getChildren().length > 0){
				$('titledetailscontainer').getChildren().destroy();
			}
		}
	},
	/*
	 * Load data will:
	 * 1) Set the data source for the grid view
	 * 2) Render the local controls
	 * 3) set the data for the first item.  
	 */
	loadData: function(title) {
		this.saveHistory();
		
		var template;
		this.persist.title = title;

		this.tv = title.showTitleID && title.showTitleID > 0 && title.titleID == title.showTitleID;
		this.episode = title.showTitleID && title.showTitleID > 0 && title.titleID != title.showTitleID;
		template = this.tv ? "titleview.tvtitle" : "titleview.title";
		
		
		this.tpl = new ui.template("titledetailscontainer", application.ui.loadTpl(template));
    	
    	this.tpl.compile();
    	
		this.draw();		
	},
	drawMeta: function(key){
		log.write('Getting meta for: ' + key);
		return $cn.utilities.getMeta(key, this.persist.title.metaValues);
	},
	drawStarRating: function(key, idx){
		var rating = parseFloat($cn.utilities.getMeta(key, this.persist.title.metaValues));
		var val = '';

		if(rating >= idx){
			val = 'fullstar';
		}
		else if(rating < idx && rating > (idx - 1)) {
			val = 'halfstar';
		}
		
		return val;
	},
	getTrailer: function() {
		
	},
	getPurchaseButtonText: function() {
		var retString = '',
		preorder = false,
		buy = false,
		rent = false;
		
		this.persist.title.availableProducts.each(function(item){
			switch(item.purchaseType)
			{
				case "rent":
					rent = true;
					break;
				case "buy":
					buy = true;
					break;
				case "preorder":
					preorder = true;
					break;
					
			}
		});
			if(preorder)
			{
				retString = "Pre-order";
			}
			else if (rent && buy)
			{
				retString = "Rent or Buy";
			}
			else if (rent)
			{
				retString = "Rent";
			}
			else if (buy)
			{
				retString = "Buy";
			}
		
		return retString;
	},
	getRateButtonText: function() {
		var rating = parseFloat($cn.utilities.getMeta('YourRating', this.persist.title.metaValues));
		var retString = 'Rate it';
		if(rating > 0) {
			retString = 'Change Rating';
		} 
		return retString;
	},
	displayBonusAsset: function(key){
		
		var val = 'hideextra';
		this.persist.title.bonusAssets.each(function(item){
			if(item.bonusType == key)
			{
				val = 'showextra';
			}
		});
		return val;
	},
	displayExtra: function(key, invert){
		var b = $cn.utilities.getMeta(key, this.persist.title.metaValues);
		var val = 'hideextra';
		if((b == "True" && !invert) || (b == "False" && invert)){
			val = 'showextra';
		}
		
		return val;
	},
	/* Read config values and render grid */
	draw: function(){
        var watchStatus;
		this.cleanUI();
		
		/*
		 *  1) Create elements for titles
		 *  2) Attach a focus
		 */		
		log.write(this.persist.title);
		
		this.tpl.append(this.persist.title);
		this.tpl.apply();
		
		//SHOW HIDE BITS
		if(this.episode)
		{
			$("tdbuttonEpisodes").removeClass("hideextra");
			$("tdbuttonWatchTrailer").addClass("hideextra");
		}
		
		watchStatus = $cn.utilities.getMeta("WatchStatus", this.persist.title.metaValues);
		if(watchStatus)
		{
			switch(watchStatus)
			{
				case "Available":
					$('titlemeta_duration').show();
					$('titlemeta_dateintheathers').hide();
					$('titlemeta_flixterrating').show();
					$('titlemeta_criticrating').show();
					$('ratingstar').show();
					break;
				case "ComingSoon":
					$('titlemeta_duration').hide();
					$('titlemeta_dateintheathers').show();
					$('titlemeta_flixterrating').hide();
					$('titlemeta_criticrating').hide();
					$('ratingstar').hide();
					break;
				case "InTheaters":
					$('titlemeta_duration').show();
					$('titlemeta_dateintheathers').hide();
					$('titlemeta_flixterrating').show();
					$('titlemeta_criticrating').show();
					$('ratingstar').show();
					break;
				case "Library":
					$('titlemeta_duration').show();
					$('titlemeta_dateintheathers').hide();
					$('titlemeta_flixterrating').show();
					$('titlemeta_criticrating').show();
					$('ratingstar').show();
					break;
				
			}
		}
		
		application.currentView.layoutIsDirty = true;
	},
	saveHistory: function(){},
	loadPrevious: function(){}	
});
