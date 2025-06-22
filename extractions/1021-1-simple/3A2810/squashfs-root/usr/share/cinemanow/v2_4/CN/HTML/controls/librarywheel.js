//-----------------------------------------------------------------------------
// librarywheel.js
// Copyright (c) 2012 - 2013, Rovi Corporation.  All rights reserved.
//-----------------------------------------------------------------------------
 
/**
 * @author atumminaro
 */
var LibraryWheelControl = new Class({
	DEBUG: false,
	Extends: WheelControl,
	Implements: WheelControl,
	id: 'LibraryWheelControl',
	currentMasterValue: 'Movies',
	currentSlaveValue: '',
	masterWheelOptionList: [],
	libraryItems : {},
	MOVIE_GENRES : ["Action", "Adventure", "Animation", "Comedy", "Drama", "Family", "Horror", "Romance", "Sci-Fi", "Thriller", "Westerns"],
	TV_GENRES : ["Action", "Adventure", "Animation and Cartoons", "Comedy", "Drama", "Family", "Food and Leisure", "Home and Garden", "Horror", "Music", "Other", "Reality and Game Shows", "Romance", "Sci-Fi", "Sports", "Thriller", "Westerns"],

	//For Determining Orders
	MasterWheel_ORDER: ["Movies", "Movie_Rentals", "HD_Movies", "HD_TV_Shows", "TV_Shows"],
	MOVIES_ORDER : ["All", "UltraViolet", "Never_Watched", "Unavailable", "Action", "Adventure", "Animation", "Comedy", "Drama", "Family", "Horror", "Romance", "Sci-Fi", "Thriller"],
	MOVIES_RENTALS_ORDER : ["All", "Never_Watched", "Unavailable", "Action", "Adventure", "Animation", "Comedy", "Drama", "Family", "Horror", "Romance", "Sci-Fi", "Thriller", "Expired", "Expiring_Soon"],
	TV_ORDER : ["All", "Never_Watched", "Unavailable", "Action", "Adventure", "Animation and Cartoons", "Comedy", "Drama", "Family", "Food and Leisure", 
									"Home and Garden", "Horror", "Music", "Other", "Reality and Game Shows", "Romance", "Sci-Fi", "Sports", "Talk and Interview", "Thriller", "Westerns"],	
	processRawData: function(response, callback) {
		var currentItem;
		this.libraryItems = {};

        this.UV = new $cn.utilities.UserUVManager();
        this.UV.checkUVAccount(function(uvProperlyLinked) {
            for (var i = 0; i < response.items.length; i++) {
            	
                var masterWheelOptions = [];
                var slaveWheelOptions = [];
                currentItem = response.items[i];
				
				if(! uvProperlyLinked && $cn.utilities.isTrue(currentItem.isPassUV)){
                	continue;
                }
				
                switch(currentItem.titleClassification) {
                    case "Movie":
                    	if (masterWheelOptions.indexOf("Movies") < 0) {
                    		masterWheelOptions.push("Movies");
                    	}
                        break;
                    case "TV_Show":
                    case "TV_Season":
                    case "TV_Episode":
                    	if (masterWheelOptions.indexOf("TV_Shows") < 0) {
                    		masterWheelOptions.push("TV_Shows");
                    	}
                        break;
                    default:
                        break;
                }
                
                if (currentItem.isHD == true && masterWheelOptions.indexOf("HD_Movies") < 0 && currentItem.titleClassification == "Movie") {
                    masterWheelOptions.push("HD_Movies");
                }

                if (currentItem.isHD == true && masterWheelOptions.indexOf("HD_TV_Shows") < 0 && currentItem.titleClassification != "Movie") {
                    masterWheelOptions.push("HD_TV_Shows");
                }
                
                if (currentItem.purchaseType == "rent") {
                	if (masterWheelOptions.indexOf("Movie_Rentals") < 0) {
                		masterWheelOptions.push("Movie_Rentals");
                	}
                    //Videos that will expire within the next 7days.
                    if (currentItem.minutesToExpire > 0 && currentItem.minutesToExpire < 7 * 24 * 60 && slaveWheelOptions.indexOf("Expiring_Soon") < 0)
                    {
                        slaveWheelOptions.push("Expiring_Soon");
                    }
                }
                
                if (uvProperlyLinked && $cn.utilities.isTrue(currentItem.isPassUV) && (-1 === $cn.utilities.inArray("UltraViolet", slaveWheelOptions))) {
                	if (slaveWheelOptions.indexOf("UltraViolet") < 0) {
                		slaveWheelOptions.push("UltraViolet");
                	}
                }
                
                var needBreak = false;
                switch(currentItem.watchStatus) {
                    case "WatchNow": {
                    	if (slaveWheelOptions.indexOf("All") < 0) {
                    		slaveWheelOptions.push("All");
                    	}
                        break;
                    }
                    case "ExpiredRental": {
                    	if (slaveWheelOptions.indexOf("All") < 0) {
                    		slaveWheelOptions.push("All");
                    	}
                    	if (slaveWheelOptions.indexOf("Expired") < 0) {
                    		slaveWheelOptions.push("Expired");
                    	}
                        break;
                    }
                    default: {
                    	if (slaveWheelOptions.indexOf("All") < 0) {
                    		slaveWheelOptions.push("All");
                    	}
                    	if (slaveWheelOptions.indexOf("Unavailable") < 0) {
                    		slaveWheelOptions.push("Unavailable");
                    	}
                        this.configObject(masterWheelOptions, slaveWheelOptions, currentItem);
                        needBreak = true;
                        break;
                	}
                }
                if (needBreak)
                    continue;
                
                if ($cn.utilities.getMeta("LicensesDelivered", currentItem.metaValues) == "0" && slaveWheelOptions.indexOf("Never_Watched") < 0) {
                    slaveWheelOptions.push("Never_Watched");
                }
                
    			if (currentItem.genres)
    			{
    				var currentGenre;
    				var targetGenres = (currentItem.titleClassification == "Movie") ? this.MOVIE_GENRES : this.TV_GENRES;
    				for (var genreIndex = 0;  genreIndex < currentItem.genres.length; genreIndex++)
    				{
    					currentGenre = currentItem.genres[genreIndex];
    					for (var targetGenreIndex = 0;  targetGenreIndex < targetGenres.length; targetGenreIndex++)
    					{
    						if (targetGenres[targetGenreIndex] == currentGenre.name && slaveWheelOptions.indexOf(currentGenre.name) < 0)
    						{
    							slaveWheelOptions.push(currentGenre.name);
    							break;
    						}
    					}
    				}
    			}
                
                this.configObject(masterWheelOptions, slaveWheelOptions, currentItem);
            }
            
            callback(this);
        }.bind(this), true);
	},
	
	configObject: function(masterWheelOptions, slaveWheelOptions, targetItem) {
		if (this.DEBUG) log.write("librarywheel.configObject Debug: Enter with " + masterWheelOptions + ", " + slaveWheelOptions + ", " + targetItem);
		for (var i = 0; i < masterWheelOptions.length; i++)
		{
			if (!this.libraryItems[masterWheelOptions[i]])
			{
				this.libraryItems[masterWheelOptions[i]] = { };
			}
			for (var j = 0; j < slaveWheelOptions.length; j++)
			{
				//Expired and  Expiring_Soon should display only under Movie_Rentals
				if (masterWheelOptions[i] == "Movie_Rentals" || (slaveWheelOptions[j] != "Expired" &&  slaveWheelOptions[j] != "Expiring_Soon")) 
				{
					if (!this.libraryItems[masterWheelOptions[i]][slaveWheelOptions[j]])
					{
						this.libraryItems[masterWheelOptions[i]][slaveWheelOptions[j]] = [];
					}
					if (this.DEBUG) log.write("librarywheel.configObject Debug: About to push targetItem " + targetItem + " into " + masterWheelOptions[i] + ", " + slaveWheelOptions[j]);
					this.libraryItems[masterWheelOptions[i]][slaveWheelOptions[j]].push(targetItem);
				}
			}
		}
	},
	
	getMasterWheelOptions : function() {
		var retArray = [];
	
		for (var i = 0; i < this.MasterWheel_ORDER.length; i++)
		{
			for (var key in this.libraryItems)
			{
				if (key == this.MasterWheel_ORDER[i]) 
				{
					retArray.push(key);
					break;
				}
			}
		}
		
		return retArray;
		
	},
	
	getSlaveWheelOptionsbyMasterWheel: function(masterWheelOption) {
		var targetArray = [];
		switch(masterWheelOption)
		{
			case "Movies":
			case "HD_Movies":
				targetArray = this.MOVIES_ORDER;
			break;
			case "Movie_Rentals":
				targetArray = this.MOVIES_RENTALS_ORDER;
			break;
			case "TV_Shows":
			case "HD_TV_Shows":
				targetArray = this.TV_ORDER;
			break;
		}
		var retArray = [];
		var sortArray = [];
		for (var key in this.libraryItems[masterWheelOption])
		{
			for (var sortIndex = 0; sortIndex < targetArray.length; sortIndex++)
			{
				if (key == targetArray[sortIndex])
				{
					sortArray[sortIndex] = true;
					break;
				}
			}
		}
		for (var i = 0; i < sortArray.length; i++)
		{
			if (sortArray[i])
			{
			    // See if there is a replacement for this string in the resource file.
			    var s = application.resource.LibSlaveWheelOptions[targetArray[i]];
			    if (!s) {
			        // Just use the name as is, but replacing "_" with a line break.
			        s = targetArray[i].replace("_", "<br/>");
			    }
				retArray.push({ name: s, iD: targetArray[i] });

			}
		}
		
		return retArray;
				
	},
	
	getContentbyWheelOptions: function(masterWheelOption, slaveWheelOption) {
		return this.libraryItems[masterWheelOption][slaveWheelOption];
	},
	
	loadLibraryMenu: function(result, masterSelection) {
		this.processRawData(result, function(){
            var options = this.getMasterWheelOptions();

            var data = [],
                selection = 0;
            if($cn.config.EnableD2D && $cn.config.DeviceD2DEnabled){
                options.push("D2D_Movies"); //push on d2d wheeloption for info
            }
            for (var i = 0; i < options.length; ++i) {
                var item = options[i];
                log.write(options[i]);

                if (item == masterSelection) {
                    selection = i;
                }
                
                data.push({
                    iD: item,
                    name: application.resource.LibMasterWheelOptions[item]
                });
            }
            
            this.currentMasterValue = options[selection];	
            this.loadData(data, {}, selection);
            this.loadSlaveDataSource(this.currentMasterValue);
            navigation.setFocus("selectedmaster");
        }.bind(this));
	},
	handleWheelItemChange: function(payload){	
		if(payload.context === ActiveWheel) {			
			var self = this,
			    p = payload.args[0],
                masterValue = p.source[p.selectedidx].parentID,
                slaveValue = p.selectedvalue;
			
			/* If the source is the master column then load the slave wheel with the child elements from the new selection */
			if(p.sourceid.indexOf('master') > -1) {
				masterValue = p.selectedvalue;
				this.currentMasterValue = p.selectedvalue;
				
				$('slavedatasource').getElements('div').destroy();
				//payload.context._renderWheel($('slavedatasource'), payload.context._slaveSource[p.selectedvalue]);
				payload.context.loadSlaveDataSource(this.currentMasterValue);
			}
			
			this.lastValue = slaveValue;
			BrowseView.CurrentWheelValue = masterValue + ":" + slaveValue;
			
			if(p.sourceid.indexOf('slave') > -1){
                masterValue = payload.context.currentMasterValue;
                this.lastSlaveValue = slaveValue;
				log.write('The slave wheel item has changed. Update results.');
                if(masterValue == "D2D_Movies" && slaveValue == "Info"){
                    var d2dData = [{'title' : application.resource.lib_d2d_info.title,
                        'step1' : application.resource.lib_d2d_info.step1,
                        'step2' : application.resource.lib_d2d_info.step2,
                        'step3' : application.resource.lib_d2d_info.step3
                    }];
                    BrowseView.LastGridProcess = "d2dinfo";
                    application.events.publish('loadgrid', {grid: 'disctodigitalgrid', gridProcess: 'd2dinfo', data: d2dData, columns: 1, template: 'disctodigitalgrid'});
                } else if(self.lastValue && (self.lastValue == masterValue || self.lastValue == slaveValue)) {
					/* Fire wheel value event */
					application.events.publish('gridloading', {grid: 'titlegrid', message: "loading", columns: 3});
					BrowseView.CurrentLibraryGenreID = this.lastValue;
					
					setTimeout(function(){
						if(self.lastValue && (self.lastValue == masterValue || self.lastValue == slaveValue)){
							self.loadSlaveGrid(p.source[p.selectedidx]);
						}
					}, 1000);
				}
			}			
		}
	},
	loadSlaveDataCallback: function(masterKey){
        this._slaveSource[masterKey] = this.getSlaveWheelOptionsbyMasterWheel(masterKey);

        var itemLength = this._slaveSource[masterKey].length;
        var lastSlaveIndex = 0;
        if(this.lastSlaveValue){
            while(itemLength--){
                if(this._slaveSource[masterKey][itemLength].iD == this.lastSlaveValue){
                    lastSlaveIndex = itemLength;
                    log.write("FOuND IT at index" + itemLength);
                }
            }
        }
        if(lastSlaveIndex === 0) {
            this.lastSlaveValue = false;
        }
        this._renderWheel($('slavedatasource'),this._slaveSource[masterKey], lastSlaveIndex);
		
		application.events.publish('gridloading', {grid: 'titlegrid', message: "loading", columns: 3});
		this.loadSlaveGrid(this._slaveSource[masterKey][lastSlaveIndex]);

	},
	loadSlaveDataSource: function(masterKey){
        var self= this,
            lastSlaveIndex = 0;
            
		BrowseView.CurrentProcessLoaded = false;
		log.write("masterKey: " + masterKey);
		this._slaveSource[masterKey] = [];

        // add info to d2d since it won't come back in the api call
        if(masterKey == "D2D_Movies"){
            this._slaveSource[masterKey].push({
                name: application.resource.LibSlaveWheelOptions.Info,
                iD: "Info"
            });
            var d2dData = [{'title' : application.resource.lib_d2d_info.title,
                'step1' : application.resource.lib_d2d_info.step1,
                'step2' : application.resource.lib_d2d_info.step2,
                'step3' : application.resource.lib_d2d_info.step3
            }];
            this._renderWheel($('slavedatasource'),this._slaveSource[masterKey], lastSlaveIndex);
            BrowseView.LastGridProcess = "d2dinfo";
            application.events.publish('loadgrid', {grid: 'disctodigitalgrid', gridProcess: 'd2dinfo', data: d2dData, columns: 1, template: 'disctodigitalgrid'});

        } else {
            self.loadSlaveDataCallback(masterKey);
        }
	},
	loadSlaveGrid: function(slaveValue){

		BrowseView.LastGridProcess = "librarylist";
		
		var items = this.getContentbyWheelOptions(this.currentMasterValue, slaveValue.iD );
		if(items.length > 0)
		{	
			//Load Grid
			application.events.publish('loadgrid', {grid: 'titlegrid', data: items, columns: 3, gridProcess: 'librarylist', template: 'librarylist', cssClass: 'library'});
		}
		else
		{
			application.events.publish('loadgrid', {grid: 'titlegrid', data: null, template: 'librarylist', gridProcess: 'librarylist', cssClass: 'library'});
		}
		BrowseView.CurrentProcessLoaded = true;
		
	}
});
