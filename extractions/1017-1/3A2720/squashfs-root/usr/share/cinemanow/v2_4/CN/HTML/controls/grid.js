//-----------------------------------------------------------------------------
// grid.js
// Copyright (c) 2012 - 2013, Rovi Corporation.  All rights reserved.
//-----------------------------------------------------------------------------
 
/**
 * @author tjmchattie
 */
var GridControlProperties = {
		DEBUG: false,
		id: 'titlegrid',
		persist: {},
	    controls:{},
	    history: [],
	    layoutIsDirty: true,
	    template: '',
	    tpl: null,
		tplCache: {},
	    scroll: true,
	    tplMeta: null,
	 //   tplMetaCast: null,
	    altMessage: null,
	    itemidx: -1,
		isActive: false,
	    hault: 0,
	    currentId: 0,
	    currentTopLeft: 0,
	    totalRecords: 0,
	    currentPage: 0,
	    genreid: 0,
        totalPages: 0,
		rowHeight: 0,
	    gridLoaded: false,
	    itemsRequested: false,
		metaRequest: null,
	    spinnerPos: 1,
	    spinnerTimer: null,
	    spinnerSpinning: false,
	    lastMovement: new Date(),
	    lastNavigationDirection: '',
	    spinnerPosition: 1,
	    imgPreloader: [],
        prefetchSpinner: false,
	    config: {
	    	numRows: 3,
	    	numCols: 3,
	    	numDisplay: 9,
	    	numStartIndex: 0
	    },
	    
	    _data: [],
	    initialize: function(params){
	    	if(params && params.id)
	    	{
	    		this.id = params.id;
	    	}
            
	    	/* Setup the known templates to be ready for rendering. */

	    		//this.tplContainer = "listgrid";
			this.loadTemplate("listgrid.tpl");
			this.loadTemplate("refinementgrid.tpl");
			this.loadTemplate("librarylist.tpl");
			this.loadTemplate("titlelist.tpl");
			this.loadTemplate("similarlist.tpl");


			
			log.write('gridcontrol.init()');		
			
			/* Wheel item is registered here because the data source is changed when the wheel item is changed. 
			 * This might be good to be in the store.js file? Possibly seperate the control functionality and specific view functionality? */
			//application.events.subscribe(this, 'wheelitemchanged',this.handleWheelItemChange);
			
			/* These events handle the display of meta data when an element in the grid has focus. */
			application.element.registerControl(this);
			
			application.events.subscribe(this, 'elementfocus', this.gridFocus.bind(this));
			application.events.subscribe(this, 'elementblur', this.gridBlur.bind(this));
		    application.events.subscribe(this, 'griditemselected', this.loadMeta.bind(this));
	        application.events.subscribe(this, "navigate", this.navigate.bind(this));
	        application.events.subscribe(this, 'wheelvaluechanged',this.handleWheelItemChange.bind(this));
	        //application.events.subscribe(this, 'wheelitemchangedinit',this.handleWheelItemChangeInit.bind(this));        
	        application.events.subscribe(this, 'viewchanged', this.onViewChange.bind(this));
			application.events.subscribe(this, 'savestate', this.onSaveState.bind(this));
			application.events.subscribe(this, 'restorestate', this.onRestoreState.bind(this));
    		application.events.subscribe(this, 'error', this.onHandleError.bind(this));

			application.events.subscribe(this, 'scroll', function(payload){
				if ($('titlelist').offsetWidth) {
					this.movegrid(payload.args[0].direction, this.config.numRows);				
				}
			}.bind(this));
	    },
	    init: function() { },
		cleanUI: function(){
	    	if($('titlelist').getChildren().length > 0){
				$('titlelist').getChildren().destroy();
			}

//			$("titlegrid_container").removeClass("refinementgrid");
			document.getElementById('titlelist').className = '';
			
			if (this.tplMeta) {
				this.tplMeta.empty();
				this.tplMeta = null;		
			}
			
//			this.tplMetaCast.empty();
			BrowseView.ScrollBar.deactivate();
		},
		handleWheelItemChangeInit: function(payload){
			log.write("WheelItemChangedInit Called.");
			
			var wheelid = payload.args[0].wheelinstance;
			
			if(wheelid != "SearchWheelControl" && wheelid != "SettingsWheelControl" && wheelid != "TitleCheckOutWheelControl" && wheelid != "TvSeasonsWheelControl" && wheelid != "HelpWheelControl") {
				var columns = 3;
				
				if(payload.context.activeControl == "TitleMetaWheelControl")
				{
					columns = 2;
				}

				if(payload.args[0].slavevalue != payload.context.currentId) {
					application.events.publish('gridloading', {grid: 'titlegrid', message: "loading", columns: columns});
				}
			}
		},
		/*
		 * When the wheel item is changed the grid should update itself with fresh data. 
		 */
		handleWheelItemChange: function(payload){
			log.write("grid.handleWheelItemChange Debug: Enter with payload:")
			log.write(payload);
			var self = this,
                wheelid = payload.args[0].wheelinstance,
                slaveValue = payload.args[0].slavevalue,
                columns;
			
			if(wheelid != "SearchWheelControl" && wheelid != "SettingsWheelControl" && wheelid != "TitleCheckOutWheelControl" && wheelid != "TvSeasonsWheelControl" && wheelid != "HelpWheelControl") {
				columns = 3;
			
				if(payload.context.activeControl == "TitleMetaWheelControl")
				{
					columns = 2;
				}

				if(slaveValue != payload.context.currentId) {
					payload.context.currentId = slaveValue;
					if (this.DEBUG) log.write("grid.WheelItemChanged Debug: About to call publish with gridloading");
					application.events.publish('gridloading', {grid: 'titlegrid', message: "loading", columns: columns});
					
					//Timeout was implemented to let the slave wheel have some time to finish animating and potentially make a different selection.
					setTimeout(function(){
						//Verify if the current wheel value matches the current payload. This is needed because of the set timeout
						if(BrowseView.CurrentWheelValue.indexOf(String(slaveValue)) > -1) {
							if (this.DEBUG) log.write("grid.WheelItemChanged Debug: About to call getTitlesByGenreId.");
							$cn.methods.getTitlesByGenreId(slaveValue, 1, function(callback){
								if (this.DEBUG) log.write("grid.WheelItemChanged Debug: Back from getTitlesByGenreId with callback " + callback);
								//Verify if the current wheel value matches the current payload. This is needed because of the async call						
								if(BrowseView.CurrentWheelValue.indexOf(String(slaveValue)) > -1) {
									var altMessage = null;
									if ($cn.data.RecomendedGenreIds && $cn.data.RecomendedGenreIds.contains(callback.data.result.genreID.toString())) {
										altMessage = "recommended_empty"
									}	
									BrowseView.LastGridProcess = "titlelist";								
									if (this.DEBUG) log.write("grid.WheelItemChanged Debug: About to call publish with loadGrid");
									application.events.publish('loadgrid', {grid: 'titlegrid', data: callback.data.result.items, genreid: callback.data.result.genreID.toString(), customLength: callback.data.result.totalItems, customPages: callback.data.result.totalPages ,  columns: columns, altMessage: altMessage, gridProcess: 'titlelist', cssClass: ''});
								}
								else {
									if (this.DEBUG) log.write("[CALLBACK] Current wheel value does not match payload. Ignore request.");
								}
						    });
						}
					}, 1000);  //Requests will be made 1 second after receiving the event
				}		 
			}
		},
		/*
		 * Callback that is responsible for adding the "hover" class to the title list when the current element
		 * has focus of an element in the titlelist. The idea is to display the gradient overlay when a box art is
		 * selected.
		 */
		gridFocus: function(payload){
			if(document.getElementById(payload.args[0].focusedelem)){
				if($('titlelist').isParentOf($(payload.args[0].focusedelem))){
					log.write('gridfocus');
					$('titlemeta').setStyle("visibility", "visible");
					this.itemidx = parseInt($(application.element.current).get('titleidx'));
					this.isActive = true;
				} else {

					$('titlemeta').setStyle("visibility", "hidden");
					$('titlemeta').setStyle("top", "");
					$('titlelist').setStyle("height", "470px");
					if($('titlegrid').hasClass("episodegrid")) {
						$('titlelist').setStyle("height", "352px");
					}
					this.itemidx = -1;
					this.isActive = false;
				}
			}
		},
		gridBlur: function(){
			
		},
		/*
		 * Load data will:
		 * 1) Set the data source for the grid view
		 * 2) Render the local controls
		 * 3) set the data for the first item.  
		 */
		loadData: function(titles, columns, template, position, totalRecords, totalPages,genreid) {
            this.numColumns = columns;
			this.cleanUI();
			this.currentPage = 1;
			this.totalRecords = totalRecords;
			this.totalPages = totalPages;
			this.genreid = genreid;
			this.itemsRequested = false;
			this.template = (template) ? template : "titlelist";
			this.tpl = this.loadTemplate(this.template + ".tpl");
			switch(this.template)
			{
				case "refinementgrid":
				case "listgrid":
					$("titlelist").addClass("listgrid");
					break;
				case "librarylist":
				case "similarlist":
				default:
					$("titlelist").removeClass("listgrid");
					break;
			}
			
			this.config.numStartIndex = position == null ? 0 : position;
			this.config.numCols = typeof(columns) != 'undefined' ? columns : 3;
//			this.resize(this.config.numCols);
			
			this.hideAltMessage();
			
			this._data = [];
			
			if(titles)
			{
				this._data = titles;
			}
			this.draw();
			
			application.events.publish('gridloaded', {grid: this.id});
			
		},
		loadMeta: function(payload){
			var timeout = (this.lastNavigationDirection == "up" || this.lastNavigationDirection == "down") ? 250 : 1;

			var metakey = payload.args[0].id;
			this.lastMetakey = payload.args[0].id;

			log.write(this.lastMetakey +":"+metakey);

			setTimeout(function(){
                var y,
                    z;

				if(metakey == this.lastMetakey) {
					/* If the current view is still relevant then continue */
					if(payload.context.id == "titlegrid") {
						
						this.tplMeta = this.loadTemplate("titlelist." + payload.args[0].type + "meta", "titlemetacontainer");

						$("titlemetacontainer").erase('class');
						$("titlemetacontainer").addClass(payload.args[0].type + "meta");
		
						if(payload.args[0].type == 'cast')
						{
							log.write("Cast Bio: loading id: " + payload.args[0].id);
							this.tplMeta.emptyAndAppend({});
							
							$cn.methods.getCastBio(payload.args[0].id, function(callback){
								
								if(metakey == this.lastMetakey) {
									callback.bio = (callback.bio) ? callback.bio.firstWithEllips(150) : '';									
									this.tplMeta.emptyAndAppend(callback);
									this.tplMeta.apply();
		
									$('castmeta').setStyle('visibility', 'inherit');
								}
								
							}.bind(this));
						}
						else if(payload.args[0].type == "episode") {
							//Set titlelist height according to the number of episode
							var episodeCount = this.totalRecords;
							// +1 is for Season Details row
							var episodeCountHeight = (episodeCount + 1) * 32;
							if(episodeCount < 10) {
								$('titlelist').setStyle("height", episodeCountHeight + "px");
								$('titlemeta').setStyle("top", (episodeCountHeight + 34) + "px");
							} else {
								$('titlelist').setStyle("height", "352px");
								$('titlemeta').setStyle("top", "386px");
							}
							title = $cn.data.TitleSummaryCache[payload.args[0].id];
							this.loadTitleSummary(title, payload, payload.args[0].passID);
						}
						else if(payload.args[0].type == 'similar' && $cn.data.TitlesBySimilar[BrowseView.RecomendationWheelControl.titleID + "-" + BrowseView.RecomendationWheelControl.slaveIdx + "-1"])
						{
							var results = $cn.data.TitlesBySimilar[BrowseView.RecomendationWheelControl.titleID + "-" + BrowseView.RecomendationWheelControl.slaveIdx + "-1"].data.result,
							title = $cn.data.TitleSummaryCache[payload.args[0].id];
							this.loadTitleSummary(title, payload.args[0], undefined);
							
	                        // Find why similar
                            for(x = 0; x < results.similarTitles.length; x++){
                                if(payload.args[0].id == results.similarTitles[x].keyName){
                                    title.synopsys = "Similar because: " + results.similarTitles[x].keyValue;
                                    break;
                                }
                            }
						}
						else
						{
							title = $cn.data.TitleSummaryCache[payload.args[0].id];
							
							if(!title){
							    if(payload.args[0].type == "library"){
									$cn.methods.getPurchasedTitle(payload.args[0].passID, payload.args[0].id, function(result) {
							        	if(result){
								        	if(result.responseCode == 0){
												this.updateTitleSummary(metakey, this.lastMetakey, result, payload);
											}
											else{
												this.updateTitleSummary(metakey, this.lastMetakey, null, payload);
												result.errorHandled = true;
											}
							        	}
							        }.bind(this));
							   }
							   else{
									$cn.methods.getShortSummary(payload.args[0].id, function(result) {
							        	if(result){
								        	if(result.responseCode == 0){
												this.updateTitleSummary(metakey, this.lastMetakey, result, payload);
											}
											else{
												this.updateTitleSummary(metakey, this.lastMetakey, null, payload);
												result.errorHandled = true;
											}
							        	}
							        }.bind(this));
							   }
							}
							else
							{	 
							    // Before setting HTML to an element make sure that the element is still present and also check that the current title is selected.
							    if(metakey == this.lastMetakey) {
							        log.write("grid: Else processing, about to call loadTitleSummary on title " + title);
								    this.loadTitleSummary(title, payload, payload.args[0].passID);
							        log.write("grid: Else processing, back from loadTitleSummary on title " + title);
							    }
							}
						}
					}
				}
			}.bind(this),timeout);
		},
		updateTitleSummary: function(metakey, lastMetakey, result, payload){
			if(metakey == lastMetakey){
				this.loadTitleSummary(result, payload, payload.args[0].passID);
				if(result){
					$cn.data.TitleSummaryCache[payload.args[0].id] = result;
				}
			}
			
		},
		loadTitleSummary: function(title, payload, passID){
		    log.write('grid.loadTitleSummary: Entered with title ' + title);
		    
		    //When the title is not exist in store, should hide summary
		    if (!title)	{
				$('titlemetacontainer').getElement('.metapanel').setStyle('display', 'none');
				return;
		    }   
		    
			var name = title.name;
			var episode = '',
			//This function was taken out of the template and added here since it applied to all short summaries.
			    synopsys = $cn.utilities.highlightKeywordForSynopsis(title.synopsys, BrowseView.SearchKeyboard.getkeyword()),
                hasUv;
            if(BrowseView.currentState === "library-view"){
                if ($cn.data.isPassUVCache && $cn.data.isPassUVCache[passID]) {
                    hasUv = $cn.data.isPassUVCache[passID].isPassUV;
                } else {
                    hasUv = false;
                }
            } else {
                hasUv = $cn.utilities.getMeta("HasUV", title.metaValues);
            }

            hasUv = $cn.utilities.isTrue(hasUv) && $cn.config.EnableUV;

            log.write("hasUv is: " + hasUv + " from " + BrowseView.currentState);
			
			if (title.titleType == "TV_Episode" && payload.args[0].type != 'episode') {
				name = $cn.utilities.getMeta("TVSeasonHeader", title.metaValues);
				episode = $cn.utilities.getMeta("TVEpisodeHeader", title.metaValues);
				
				//[Remove in library as well] if (payload.args[0].type == 'title')
				synopsys = '';
			}
			else if (title.titleType == "TV_Season") {
				name = $cn.utilities.getMeta("TVSeasonHeader", title.metaValues);
			}

			if(this.tplMeta) {
				this.tplMeta.emptyAndAppend({
					titleID: title.titleID,
					name: name,
					mPAARating: title.mPAARating,
                    UVAvailable: (hasUv ? "yesUV" : "noUV"),
					Episode: episode,
					synopsys: synopsys
				});
				
				var titleElem = $('titlemeta_title');
				
				
				if(titleElem) {
					
					var maxWidth = titleElem.getParent().getSize().x;
					if(titleElem.getNext()) {
						maxWidth = maxWidth - (titleElem.getNext().offsetWidth) - 11;
                        if(titleElem.getNext().getNext()){
                            maxWidth = maxWidth - (titleElem.getNext().getNext().offsetWidth);
                        }
					}
					//log.write('Title Width: ' + titleElem.getDimensions().width);
					titleElem.setStyle('width', Math.min(titleElem.offsetWidth, maxWidth) + 2);
					
					if(titleElem.getNext()) {
						titleElem.getNext().setStyle('padding-left', '3px');
					}
					//log.write('Title Parent Width: ' + titleElem.getParent().getDimensions().width);
					//log.write('Max Width: ' + maxWidth);
					//log.write('Final Width: ' + titleElem.getStyle('width'));
				}
				
				this.tplMeta.apply();
				$('titlemetacontainer').getElement('.metapanel').setStyle('visibility', 'inherit');
				
				log.debug("Title: " + name + ", mPAARating: " + title.mPAARating);
	        	log.debug("############################");
			}
		},
		loadHeader: function(template, data) {

			application.putInnerHTML($('titlegrid_header'), "");
			var tpl = new ui.template("titlegrid_header", application.ui.loadTpl(template));

			tpl.compile();
			tpl.append(data);
			tpl.apply();
			
			$('titlegrid_container').addClass("header");
			
		},
		getElipsisLength: function() {
			
			if (BrowseView.DockControl.selection == 'dock-search') {
				return 95;
			}
			else if(this.config.numCols == 2) {
				return 65;
			}
			else {
				return 95;
			}
		},
		loadTemplate: function(template, container) {
			
			var tpl = this.tplCache[template];
			
			if (tpl == null) {
				if (container == null)
					container = "titlelist";
					
	    		tpl = new ui.template(container, application.ui.loadTpl(template));
	    		tpl.compile();
				this.tplCache[template] = tpl;
			}
			
			return tpl;
		},
		configure: function(){
			var container = $('titlelist'),
                containerHeight;

			if(container != null)
			{
	/*			if(this.template == "listgrid")
				{
					titleWidth = 235;
					this.rowHeight = 25;		// TODO: Get from element
				}*/
				if (this._data && this._data.length)
				{
					container.show();
					var index = this.config.numStartIndex;
					
					if(this._data[index]){
						this._data[index].titleidx = index;
						this.tpl.append(this._data[index]);
					
						// TODO: add margins
						var item = container.getFirst();
						this.configure.titleWidth = item.offsetWidth;
						this.rowHeight = item.offsetHeight + parseInt(item.getStyle('margin-top')) + parseInt(item.getStyle('margin-bottom'));
					}
				}
				else {
//					titleWidth = 130;
					this.rowHeight = 150;
				}

//				containerWidth = container.clientWidth > 0 ? container.clientWidth : this.config.numCols * titleWidth;
				containerHeight= container.clientHeight > 0 ? container.clientHeight : this.config.numRows * this.rowHeight;

//				this.config.numCols = Math.floor(containerWidth / titleWidth);
				this.config.numRows = Math.floor(containerHeight / this.rowHeight);
				this.config.numDisplay = this.config.numCols * this.config.numRows;
			}
		},
		/* Read config values and render grid */
		resize: function(columns) {
			if(this.template == "listgrid")
			{
				// TODO: Widths need to be style based
				log.write("Singlewheel display: " + $('singlewheel').getStyle("display"));
			}

			$("titlemeta").setStyle("width", $('titlelist').offsetWidth);
		},
		redraw: function(titles){
			
			var items = $('titlelist').getChildren();
	    	if(items.length > 0){
				items.destroy();
			}
			
			var maxStartIndex = Math.floor((titles.length - this.config.numCols) / this.config.numCols) * this.config.numCols;
			var titleId = this.itemidx >= 0 ? this._data[this.itemidx].titleID : 0;
			 
			if (this.config.numStartIndex > maxStartIndex) {
				this.config.numStartIndex = maxStartIndex;
			}
			
			this._data = titles;
			this.resize();
			this.draw();
			
			var selection = $('titlelist').getElement("a[titleid='" + titleId + "']");
			
			if (selection)
				navigation.setFocusElement(selection);
				
			application.events.publish('gridloaded', {grid: this.id});
		},
		draw: function(){
//			this.cleanUI();
	/*		switch(this.template)
			{
				case "refinementgrid":
					$("titlelist").addClass("listgrid");
					break;
				case "listgrid":
					$("titlelist").addClass("listgrid");
					break;
				default:
					$("titlelist").removeClass("listgrid");
					break;
			}*/
			
			/*
			 *  1) Create elements for titles
			 *  2) Attach a focus
			 */
			var x,
                endCount;
			//get width of parent and reset numCols
			$('titlegrid').show();
			this.configure();
			this.resize(this.config.numCols);
			
			endCount = Math.min(this.totalRecords, this.config.numStartIndex + this.config.numDisplay);
			var self = this;

			if(this.totalRecords > 0)
			{
				
			
				this.scroll = !(this.totalRecords < this.config.numDisplay);
//				BrowseView.ScrollBar.activate(this);
				log.write("totalRecords: " + this.totalRecords + " numDisplay: " + this.config.numDisplay + " numCols: " + this.config.numCols + " this.scroll: " + this.scroll);
				
				
				for(x = this.config.numStartIndex + 1; x < endCount; x++){		
					
					if(this._data[x]){
						var tmpImgArr = [], imgPreloaderIdx=0;
						this._data[x].titleidx = x;
						this.tpl.append(this._data[x]);
						
						//Preload next image
						if(this._data[x + 9]) {
							tmpImgArr[imgPreloaderIdx] = new Image();
							tmpImgArr[imgPreloaderIdx].src = "http://cache.cinemanow.com/images/boxart/v2_107/" + this._data[x + 9].boxartPrefix + "v2_107.jpg";
							imgPreloaderIdx++;
						}
						
						tmpImgArr = null;
						delete tmpImgArr;
						
						/* If title is not on the global title list then add it */
						if(!$cn.data.TitleCache[this._data[x].titleID]) {
							$cn.data.TitleCache[this._data[x].titleID] = this._data[x];
						}
					}
				}

				this.tpl.apply();
                $$('#titlelist .title img').each(function(item){
                    item.onerror = function(e){
                        log.write("IMAGE ERROR");
                        item.hide();
                    }
                });

                //Custom default image function for themes that want more than 1 default image
                if (typeof $cn.config.CustomDefaultGridImage == 'function') {
                    $$('#titlelist .title .title-text').each(function(item) {
                        var className = $cn.config.CustomDefaultGridImage(item);
                        item.addClass(className);
                    });
                }

                var titlelist = $('titlelist');
				var item = titlelist.getFirst();
//				var rowSize = item.getSize().y + parseInt(item.getStyle('margin-top')) + parseInt(item.getStyle('margin-bottom'));
				var visibleRows = Math.min(Math.floor(($('titlemeta').getPosition().y - titlelist.getPosition().y) / this.rowHeight), this.config.numRows);
				var rows = Math.ceil(this.totalRecords / this.config.numCols);
				var isEpisodes = $('store').hasClass('episode-panel');

				if(isEpisodes) {
                    log.write("##### adjusting tv episodes scrollbar ########");
					$('scrollbar').setStyles({ 'margin-top': '33px', 'height': titlelist.offsetHeight });
					$('scrollbar').getElement('.scrollarea').setStyle('height', 320);
				} else {
				// TODO: Move scrollbar into grid container
				$('scrollbar').setStyles({ 'height': titlelist.offsetHeight });
				$('scrollbar').getElement('.scrollarea').setStyle('height', 419);
				}
				//Added to only draw the scroll bar in the event that there is one visible page or more
				if(Math.max(0, rows - visibleRows) > 0) {
					BrowseView.ScrollBar.setPosition(Math.floor(this.config.numStartIndex / this.config.numCols));
					BrowseView.ScrollBar.setRange(Math.max(0, rows - visibleRows));
					BrowseView.ScrollBar.draw();
				}
				
			}
			else { //NO RESULTS MESSAGE
				this.showAltMessage();
			}

			application.currentView.layoutIsDirty = true; 
		},
		itemCount: function() {
			return this.totalRecords;
		},
		getPosition: function() {
			return BrowseView.ScrollBar.getPosition() * this.config.numCols;
		},
		remove: function(index) {
			
	/*		if (index >= 0 && index < this._data.length) {
				var list = $('titlelist');
				
				this._data.splice(index, 1);
				this.config.numStartIndex = parseInt(list.getFirst().getElement('a').get('titleidx'));
				this.draw();
				
				var nextIndex = Math.min(this._data.length - 1, this.itemidx);
				navigation.setFocusElement(list.getElement("a[titleidx='" + nextIndex + "']"));
			}*/
			
//				if (this.conig.numStartIndex / this.config.numCols)

		
			if (index >= 0 && index < this.totalRecords) {
				var list = $('titlelist'),
				    items = list.getChildren(),
                    x;
				
				this._data.splice(index, 1);
				
				if (items.length) {
					
					var firstIndex = parseInt(items[0].getElement('a').get('titleidx')),
						nextIndex = firstIndex + items.length;
					
					if (index >= firstIndex && index < nextIndex) {
						
						this.tpl.empty();
						for(x = firstIndex; x < nextIndex; x++){
							if(this._data[x]) {
								this._data[x].titleidx = x;
								this.tpl.append(this._data[x]);
							}	
							
						}
						this.tpl.apply();
						
						if (index == this.itemidx) {
							var itemidx = Math.min(this.totalRecords - 2, index);
							navigation.setFocusElement(list.getElement("a[titleidx='" + itemidx + "']"));
						}
						
						this.totalRecords--;
					}
				}

				// Update the scrollbar
				var pos = BrowseView.ScrollBar.getPosition();
				BrowseView.ScrollBar.setRange(this.totalRecords < (this.config.numDisplay - this.config.numCols) ? 0 : 
					Math.ceil((this.totalRecords - (this.config.numDisplay - this.config.numCols)) / this.config.numCols));
				
				if (pos > 0 && pos > BrowseView.ScrollBar.range)
					this.movegrid("up", 1);
			
				//Reset navigation
				application.currentView.layoutIsDirty = true; 
			}
		},
		showAltMessage: function(){
			var template = ''; 
			if (this.altMessage) {
				template = this.altMessage;
			} else {
				if (BrowseView.DockControl.selection == 'dock-search') {
					if (BrowseView.SearchKeyboard._currentValue.length >= 1)
						template = "search_empty";
					else
						return;
				} else
					template = "empty";
			}
			
			var tpl = new ui.template("altmessage", application.ui.loadTpl(template + ".tpl"));
			tpl.compile();

			tpl.empty();
			tpl.append();
			tpl.apply();
			
			$('titlelist').hide();
			$('altmessage').show();
		},
		hideAltMessage: function() {
			$('altmessage').hide();
			$('altmessage').set('html', '');
			
		},
		onViewChange: function(payload){
			this.currentView = payload.args[0];
		},
		loadPage: function(page) {
			$cn.methods.getTitlesByGenreId(this.genreid, page, function(callback){
			    self = this.self;
			    log.write('Got title response. itemsRequested=' + self.itemsRequested + ', page=' + this.page + ', currentPage=' + self.currentPage);
			    if (self.itemsRequested && self.currentPage == this.page) {
				    self.itemsRequested = false;
				    log.write('before concat: ' + self._data.length + ' result items. ->' + callback.data.result.items.length);
				    self._data = self._data.concat(callback.data.result.items);
				    log.write('after concat ' + callback.data.result.items.length + ' items, yielding ' + self._data.length);
					
				    // At one time we were setting $cn.data TitlesByGenre here by doing this  
				    //   $cn.data.TitlesByGenre[this.genreid].data.result.items = 
				    //      $cn.data.TitlesByGenre[this.genreid].data.result.items.concat(callback.data.result.items);
				    //   $cn.data.TitlesByGenrePages[this.genreid + "-" + this.currentPage] = true;
				    // But all setting of TitlesByGenre[] and TitlesByGenrePages[] are done in 
				    // the callback inside getTitlesByGenreId after it issues WS GetBrowseList.
					
                    if (self.prefetchSpinner) {
                        self.movegrid("down", 0);
                        application.events.publish('gridloaded', {grid: self.id});
                    }
                 }
		    }.bind({self:this, page:page}));
		},
		movegrid: function(direction, rows){
			log.write("hault: " + this.hault);
			// JS Hoisting: http://www.adequatelygood.com/2010/2/JavaScript-Scoping-and-Hoisting	
			// good to put vars at top of function so that there is no "stealth" shadowing of globals through hoisting.
			var animation = application.loadAnimation("grid"),
				animationDuration = animation.options.duration,
				cleanupFocus, 
				cols,
				currentAnchor,	
				currentposition,
                currentLength = this._data.length,
				elem1,
				end,
				finalIndex,
				i,
				imgPreloaderIdx,
				items,
				list,
				maxItems,
				o,
				pagingModifier,
				pos,
				row,
				spamming = false, //$cn.utilities.DateDiff(new Date(), this.lastMovement) < 750;
				start,
				tmpImgArr,
				top,
				topLeft,
				totalheight, 
				visibleheight,  				
				x,
				animationFPS = animation.options.fps,
				animationTransition = animation.options.transition;
			
			this.lastMovement = new Date();
			
			if(this.hault == 0)
			{
				currentposition = '';
				list 			= $('titlelist');
				items 			= list.getChildren();
				totalheight 	= this.totalRecords;
				currentAnchor 	= (items[0]) ? items[0].getElements('a')[0] : null;
				cols 			= this.config.numCols;
				maxItems 		= this.config.numDisplay;
				finalIndex 		= parseInt(this.totalRecords) -1; //Last Index of Current Dataset
				pagingModifier 	= rows;
				visibleheight 	= items.length;
				cleanupFocus 	= false; // This is here in case the focus is lost. It will be set to the last item in the list if there is no currentAnchor.
				
				this.currentTopLeft = (currentAnchor) ? 
						(currentAnchor.get('titleidx') != null ? parseInt(currentAnchor.get('titleidx')) : -1) :
						(finalIndex  + 1);
				cleanupFocus = (!currentAnchor);
				
				row = Math.floor(this.currentTopLeft / cols);
                log.write("============== items requested is: " + this.itemsRequested);
				if(direction == "up")
				{
                    log.write("===== moving on up ========");
                    // Removing loading spinner for prefetch if we move up as a user experience detail
                    if (this.prefetchSpinner) {
                        application.events.publish('gridloaded', {grid: this.id});
                        this.prefetchSpinner = false;
                    }

					if (row > 0) {
						
						this.hault = 1;
						//var pos = (pagingModifier != 1) ? Math.min(0, row - rows) : Math.max(0, row - rows),
						// pos = 
						// Even out the rows for optimal scrolling back up and stopping on first row
						pos = Math.max(-rows, row - rows); // ???
						
						while (pos % rows !== 0) {
							++pos;
							--pagingModifier;
						}
						topLeft = pos * cols;
						animationDuration = (pagingModifier == 1) ? animationDuration : animationDuration * 2;

						if(((1000 / animationFPS) * 2) >= animationDuration) {
							animationDuration = 100;
							animationFPS = 1000 / animationDuration;
						}
						
						
						for (i = parseInt(this.currentTopLeft) - 1; i >= topLeft; --i) {
							//log.write("Adding title at " + i);
							if(this._data[i]) {
								this._data[i].titleidx = i;
								this.tpl.prepend(this._data[i]);
							}
						}						
						
						this.tpl.apply();
                        $$('#titlelist .title img').each(function(item){
                            item.onerror = function(e){
                                log.write("IMAGE ERROR");
                                item.hide();
                            }
                        });

                        //Custom default image function for themes that want more than 1 default image
                        if (typeof $cn.config.CustomDefaultGridImage == 'function') {
                            $$('#titlelist .title .title-text').each(function(item) {
                                var className = $cn.config.CustomDefaultGridImage(item);
                                item.addClass(className);
                            });
                        }
                        items = list.getChildren();												
						top = (pos - row) * (this.rowHeight) + 1;						
						for (i = 0; i < (cols * pagingModifier) && (i < items.length); i++) {							
							items[i].setStyle("margin-top", top);							
						}
						
						o = {};
						
						for(i=0; i <  (cols*pagingModifier); i++) {
							if(i < items.length) {
								o[i] = {'margin-top': '1px'};
							}
						}
						
						if(device.getDeviceSoc() != "BCOM") {
					
						    // We need to block the enter key until the scroll finishes.
						    // This prevents bugs when the user enters Title Details before the
						    // scroll finishes. We'll set the TempKeyBlockDuration to some time
						    // *greater* than the animation duration, as setting it exactly equal
						    // doesn't always allow the animation to finish (too close or a delay
						    // somewhere perhaps). We make it exact by turning the block back off
						    // once the animation completes anyway.
							application.TempKeyBlockEnter = true;
							application.TempKeyBlockDuration = animationDuration*2;     // as a maximum
							elem1 = new Fx.Elements(items, {
								duration: (spamming) ? 0 : animationDuration, 
                        					fps: animationFPS,
								transition: animationTransition,
								onComplete: function(obj){
                                    // Re-enable the enter key now that the shift is done.			
	    							application.TempKeyBlockEnter = false;

									//Hide the top fade on the first row
									if(this.currentTopLeft == 0 && this.showFade){
										$('HorizontalFadeTop').hide();
									}
								
									if(cleanupFocus) {
										if(items[items.length] && items[items.length].id) {
											navigation.setFocus(items[items.length].id);
										}
										else {
											navigation.setFocus("singleselectedmaster");
										}
									}
									
									setTimeout(function(){
										var i;
										application.currentView.layoutIsDirty = true; 
										
										for (i = items.length - 1; i >= maxItems; --i) {
											log.write("Removing title at " + i);
											items[i].destroy();
										}
											
										this.config.numStartIndex = topLeft;
										this.hault = 0;
										
									}.bind(this),200);
									
								}.bind(this)
							});

							elem1.start(o);
						}
						else {
							for (var x = 0; x < items.length; ++x) {
								items[x].setStyles(o[x]);
								
								//Hide the top fade on the first row
								if(this.currentTopLeft == 0 && this.showFade){
									$('HorizontalFadeTop').hide();
								}
							
								if(cleanupFocus) {
									if(items[items.length] && items[items.length].id) {
										navigation.setFocus(items[items.length].id);
									}
									else {
										navigation.setFocus("singleselectedmaster");
									}
								}
								
								setTimeout(function(){
									var i;
									application.currentView.layoutIsDirty = true; 
									
									for (i = items.length - 1; i >= maxItems; --i) {
										log.write("Removing title at " + i);
										items[i].destroy();
									}
										
									this.config.numStartIndex = topLeft;
									this.hault = 0;
									
								}.bind(this),200);
							}
							
						}
						this.currentTopLeft = topLeft;
						BrowseView.ScrollBar.setPosition(pos);
						
						//Cleanup
						elem1 = null;						
					}
				}
				else if(direction == "down")
				{
                    log.write("============ prefetch spinner is: " + this.prefetchSpinner);
					if (row < BrowseView.ScrollBar.range) {
						log.write("row: " + row + " range: " + BrowseView.ScrollBar.range);		
						//Hide the top fade on the first row
						if(this.showFade){
							$('HorizontalFadeTop').show();
						}
						
						this.hault = 1;
						//
						
						//var pos = (pagingModifier != 1) ? Math.max(BrowseView.ScrollBar.range, row + rows) : Math.min(BrowseView.ScrollBar.range, row + rows),
						pos = Math.min(BrowseView.ScrollBar.range, row + rows);
						topLeft = pos * this.config.numCols;
						animationDuration = (pagingModifier == 1) ? animationDuration : animationDuration * 2;
						start = parseInt(this.currentTopLeft) + items.length; //parseInt(items[items.length - 1].getElement('a').get('titleidx')) + 1;
						end = Math.min(finalIndex, topLeft + this.config.numDisplay);
						//log.write("start=" + start + ", end=" + end + ", currentTopLeft=" + this.currentTopLeft + ", items.length=" + items.length + ", finalIndex=" + finalIndex + ", topLeft=" + topLeft + ", this.config.numDisplay=" + this.config.numDisplay);
						
						//This is here to handle the case where the user modifies the grid by scrolling a single row then moves over to the scrollbar and tries to page down. 
						//Before this check we could over-run the bounds and show an empty grid.
						if(start >= end) {

							pagingModifier = 1;
							pos = Math.min(BrowseView.ScrollBar.range, row + pagingModifier);
							topLeft = pos * this.config.numCols;
							animationDuration = (pagingModifier == 1) ? animationDuration : animationDuration * 2;
							start = parseInt(this.currentTopLeft) + items.length;
							end = Math.min(finalIndex, topLeft + this.config.numDisplay);
						}

						if(((1000 / animationFPS) * 2) >= animationDuration) {
							animationDuration = 100;
							animationFPS = 1000 / animationDuration;
						}

                        // things got updated while we were on the page
                        //log.write('end = ' + end + ', currentLength = ' + currentLength);
                        if (end > currentLength) {
                            // Stop scrolling
                            pagingModifier = rows = 0;
                            log.write("======= user scrolled to end of page =======================");
                            if (this.itemsRequested) {
                                this.prefetchSpinner = true;
                                application.events.publish('gridloading', {grid: 'titlegrid', message: "loading", columns: this.numColumns});
                            }
                        }
						
						log.write("this.currentTopLeft: " + this.currentTopLeft + " finalIndex: " + finalIndex + " pos: " + pos + " topLeft: " + topLeft + " start: " + start + " end: " + end + " items.length: " + items.length);
						//Check if we can do this. This removes the limitation for only displaying 999 titles and loads them in a chunk at a time.
						if(!this._data[end + $cn.data.PAGE_PRE_FETCH]){
                            log.write("===== Getting ready to make pre fetch page call (itemsRequested=" + this.itemsRequested + ") ========");
							if(this.currentPage < this.totalPages) {
								//Has a request been made recently
								if(!this.itemsRequested) {
									this.currentPage++;
									this.itemsRequested = true;
									log.write('before method. currentPage = ' + this.currentPage + ', items = ' + this._data.length);
									
									this.loadPage(this.currentPage);
								}
							} else {
							    log.write('pre-fetch call not made. currentPage:' + this.currentPage + ' is >= totalPages:' + this.totalPages);
							}
						}
						
						//Passed test...proceed
						log.write("Rendering items " + start + " to " + end);
						tmpImgArr = [];
						
						if (start <= end)
						{
							imgPreloaderIdx = 0;
							
							// Guessing x should not be global, so vared it, up top [3/14/2012 change x<=end to x<end found that it was rendering one extra images under the visible bounds.]
                            // < causes a one off error by displaying one less item than there actually is
							for(x = start; x <= end; x++) {
								//log.write("Adding title at " + x);
								if(this._data[x]) {
									this._data[x].titleidx = x;
									this.tpl.append(this._data[x]);	
									
									if(!spamming) {
										//Preload next image
										if(this._data[x + (pagingModifier * cols)]) {
											tmpImgArr[imgPreloaderIdx] = new Image();
											tmpImgArr[imgPreloaderIdx].src = "http://cache.cinemanow.com/images/boxart/v2_107/" + this._data[x + (pagingModifier * cols)].boxartPrefix + "v2_107.jpg";
											imgPreloaderIdx++;
										}
									}
								}
							}
		
							this.tpl.apply();
                            $$('#titlelist .title img').each(function(item){
                                item.onerror = function(e){
                                    log.write("IMAGE ERROR");
                                    item.hide();
                                }
                            });

                            //Custom default image function for themes that want more than 1 default image
                            if (typeof $cn.config.CustomDefaultGridImage == 'function') {
                                $$('#titlelist .title .title-text').each(function(item) {
                                    var className = $cn.config.CustomDefaultGridImage(item);
                                    item.addClass(className);
                                });
                            }

                            items = list.getChildren();

						}
						
						tmpImgArr = null;
						o = {};
						for(i=0; i < (cols*pagingModifier); i++) {
							if(i < items.length) {
								o[i] =  {'margin-top': -(this.rowHeight*pagingModifier)};
							}
						}
						
						if(device.getDeviceSoc() != "BCOM") {
						    // We need to block the enter key until the scroll finishes.
						    // This prevents bugs when the user enters Title Details before the
						    // scroll finishes. We'll set the TempKeyBlockDuration to some time
						    // *greater* than the animation duration, as setting it exactly equal
						    // doesn't always allow the animation to finish (too close or a delay
						    // somewhere perhaps). We make it exact by turning the block back off
						    // once the animation completes anyway.
							application.TempKeyBlockEnter = true;
							application.TempKeyBlockDuration = animationDuration*2;     // as a maximum
							elem1 = new Fx.Elements(items, {
								duration: (spamming) ? 0 : animationDuration, 
								fps: animationFPS,
								transition: animationTransition,
								onComplete: function(obj){
                                    // Re-enable the enter key now that the shift is done.			
	    							application.TempKeyBlockEnter = false;

									application.currentView.layoutIsDirty = true; 
									this.hault = 0;
									
									for(i=0; i < items.length; i++) {
										if(items[i].style.marginTop && parseInt(items[i].style.marginTop.replace("px", '')) < 0){
											items[i].destroy();		
										}
									}
									
	//								for (var x = topLeft - this.currentTopLeft - 1; x >= 0; --x) {
	//									log.write("Deleting title at " + x);
	//									items[x].destroy();								
	//								}
	
									log.write("Deleted overflow titles.");
									
									this.config.numStartIndex = topLeft;
					
								}.bind(this)
							});
							
							elem1.start(o);
						}
						else {
							for (var x = 0; x < items.length; ++x) {
								items[x].setStyles(o[x]);
							}
							
							application.currentView.layoutIsDirty = true; 
							this.hault = 0;
							
							for(i=0; i < items.length; i++) {
								if(items[i].style.marginTop && parseInt(items[i].style.marginTop.replace("px", '')) < 0){
									items[i].destroy();		
								}
							}

							log.write("Deleted overflow titles.");
							
							this.config.numStartIndex = topLeft;
						}


                        var currentIndex = parseInt($(application.element.current).get('titleidx'), 10);
                        if (currentIndex + 1 + cols >= this.totalRecords - cols) {
                            log.write("*********** bottom of page *****************");
                            pos = BrowseView.ScrollBar.range;
                        }

						BrowseView.ScrollBar.setPosition(pos);
						
						//Cleanup
						elem1 = null;
					}
				}
				
				list = null; 
				currentAnchor = null;			
			}
		},
		navigate: function(payload){

			if(this.isActive){
				
				this.lastNavigationDirection = payload.args[0].direction;
				
				if(payload.args[0].direction == 'up'|| payload.args[0].direction== 'down') 
				{
					payload.preventDefault();
					log.write("hault: " + this.hault);
					if(this.hault != 1) {
		                var cancel = false,
                            list = $('titlelist'),
                            items = list.getChildren(),
                            direction = payload.args[0].direction,
                            currentIndex = parseInt($(application.element.current).get('titleidx'), 10),
                            nextIndex = currentIndex + (direction == "up" ? -this.config.numCols : this.config.numCols);
						
						if (nextIndex >= this.totalRecords ) {
							if (Math.floor((this.totalRecords - 1) / this.config.numCols) > Math.floor(currentIndex / this.config.numCols))
								nextIndex = this.totalRecords - 1;
						} 
		
						if (nextIndex >= 0 && nextIndex < this.totalRecords) {
							this.currentTopLeft = parseInt(items[0].getElements('a')[0].get('titleidx'));

							if (nextIndex < this.currentTopLeft) {
								this.movegrid("up", 1)
							}
							else if ((nextIndex >= this.currentTopLeft + this.config.numDisplay)) {
                                if (this.prefetchSpinner) {
                                    cancel = true;
                                } else {
								    this.movegrid("down", 1);
                                }
							}
							else {
								var item = items[nextIndex - this.currentTopLeft]; //list.getElement("a[titleidx='"+nextIndex+"']");

                                // Bail if things are going to get ugly
                                if (!item)
                                    return;

								if ((item.getPosition().y + item.getSize().y) > $('titlemeta').getPosition().y){
									this.movegrid("down", 1);
							}
							}

                            if (!cancel) {
							    var focusElement = list.getElement("a[titleidx='"+nextIndex+"']");
							    navigation.setFocus(focusElement);
                            }
						}
					} //end this.hault check
				}
				else if(payload.args[0].direction == 'left') {
					if (this.itemidx % this.config.numCols == 0) {
						if (this.returnFocus) {
							navigation.setFocus(this.returnFocus);
							payload.preventDefault();
						}
					}
					else {
						nextIndex = this.itemidx - 1;
						navigation.setFocusElement($('titlelist').getElement("a[titleidx='"+nextIndex+"']"));	
						payload.preventDefault();
						
						/*
						 * var nextIndex = parseInt(application.element.current.replace('app-gen-', '')) - 1;
						var elem = document.getElementById('app-gen-' + nextIndex);
						
						if(elem) {
							navigation.setFocus(elem.id);	
							payload.preventDefault();
						}
						 */
					}
				} 
				else if(payload.args[0].direction == 'right') {
					
					payload.preventDefault();

					if (this.itemidx % this.config.numCols == this.config.numCols - 1 || this.itemidx == this.totalRecords - 1) { 
						if (document.getElementById('scrollbar') && document.getElementById('scrollbar').style.display == "block") {
							navigation.setFocus(BrowseView.ScrollBar.thumb);
						}
					}
					else {
						nextIndex = this.itemidx + 1;
						var nextElem = $('titlelist').getElement("a[titleidx='"+nextIndex+"']"); 
						
						if(nextElem) {
							navigation.setFocusElement($('titlelist').getElement("a[titleidx='"+nextIndex+"']"));
						}
					}
				} 
			}
			else if ((application.element.current && application.element.current != '') && document.getElementById(application.element.current) && application.element.current == BrowseView.ScrollBar.thumb) {
				if (payload.args[0].direction == 'left' && $('titlelist').getSize().y) {
					
					if(this.hault == 0) {
						var results = $('titlelist').getElementsByTagName("a");
						var idx = Math.min(results.length - 1, this.config.numCols - 1);

						if (results.length > idx)
						 {
							application.navigator.setFocusElement(results[idx]);
							payload.preventDefault();
						}
					}
					else {
						payload.preventDefault();
					}
				}
			}
		},
		onSaveState: function(payload){
			var state = payload.args[0];
			state[this.id] = {
				_data: this._data,
				tpl: this.tpl,
				isActive: this.isActive,
				rowHeight: this.rowHeight,
				returnFocus: this.returnFocus,
				hault: 0,
				currentPage: this.currentPage,
				totalRecords: this.totalRecords,
                totalPages: this.totalPages,
				itemidx: this.itemidx,
                genreid: this.genreid,
				config: $extend({}, this.config),
				showFade: this.showFade,
				itemsRequested: this.itemsRequested
			};
			this.itemsRequested = false;    // resume on restore.
		},
		onRestoreState: function(payload){
			var state = payload.args[0];
			$extend(this, state[this.id]);
            this.config = $extend({}, state[this.id].config);
			//alert(state[this.id].returnFocus);
			if (this.itemsRequested) {
			    // If a request was pending, kick it off again.
			    this.loadPage(this.currentPage);
			}
		},
		onHandleError: function(payload){
		    // If items were requested, reset the variables so they can load again.
		    // This is not an ideal solution: if the user hits "Try Again", which
		    // happens after this, then the call will complete, but the results will
		    // be thrown away. Of course, they will be cached, so the next call
		    // will be quick, but it is still a bit of a waste.
		    // The ultimate solution would be to use different calls for the background
		    // calls so that errors can be handled directly.
		    if (this.itemsRequested) {
		        this.currentPage--;
		        this.itemsRequested = false;
		    }
		}
		
	},
	GridControl = new Class(GridControlProperties);
