//-----------------------------------------------------------------------------
// merch.js
// Copyright (c) 2012 - 2013, Rovi Corporation.  All rights reserved.
//-----------------------------------------------------------------------------
 
/**
 * @author tmchattie
 */
var MerchControlProperties = {
	id: 'merchcontrol',
	persist: {},
    controls:{},
    buttons:[],
    layoutIsDirty: true,
	_data: [],
    tpl: null,
    tplTvShows: null,
    tplNewMovies: null,
    tplFeature: null,
    tplCollection: null,
    tplActions: null,
    scroll:false,
	lastFocus: null,
	firstFocus: null,
	contentControlId: '',
    contentId: 'merchcontrol',
    "initialize": function(id, newContentId) {
        application.events.subscribe(this, 'restorestate', this.onRestoreState.bind(this));

		this.id = id;

        // Setup template for new TV shows - bottom right
        this.tplTvShows = new ui.template("newtvshows", application.ui.loadTpl("merch_newtvshows.tpl"));
        this.tplTvShows.compile();

        // Setup template for new movies - top right
        this.tplNewMovies = new ui.template("newmovies", application.ui.loadTpl("merch_newmovies.tpl"));
        this.tplNewMovies.compile();

        // Setup template for featured promo - top left
        this.tplFeature = new ui.template("featuredpromotion", application.ui.loadTpl("merch_feature.tpl"));
        this.tplFeature.compile();

        // Setup template for new collections - bottom left
        this.tplCollection = new ui.template("newcollections", application.ui.loadTpl("merch_collection.tpl"));
        this.tplCollection.compile();

        // Setup button - below grid on the right
        this.tplActions = new ui.template("actionbuttoncontainer", application.ui.loadTpl("merchactionbuttons.tpl"));
        this.tplActions.compile();
    },
    init: function(params, direction){
        log.write('merchcontrol.init()');

        //Persist Params
        if(params) {
            this.persist = params;               
        }      
	},
	cleanUI: function(){

	},
	/*
	 * Load data will:
	 * 1) Set the HTML source and buttons for the modal view
	 * 2) Render the local controls
	 */
	loadData: function(content) {
		this._data = [];
		this._data = content;		
	},
	show: function() {
        var self = this,
            x,
            maxThumbs = $cn.config.MaxMerchThumbs || 5;
        log.write("Showing Merch Page.");
        application.events.subscribe(this, "navigate", this.navigate.bind(this));
        application.events.subscribe(this, "displaytitledetails", this.loadtitleview.bind(this));
        application.events.subscribe(this, "loadgenreview", this.loadgenreview.bind(this));

        if(application.element.current != null && application.element.current != '' && document.getElementById(application.element.current)) {
            this.lastFocus = application.element.current;
        }

        // No longer in specs - $('featureditleheader').set('text', $cn.data.Merch.featuredPromotion.name);
        $('newcollectionheader').set('text', $cn.data.Merch.newCollectionHeader);
        $('newmovieheader').set('text', $cn.data.Merch.newMovieHeader);
        $('newtvshowheader').set('text', $cn.data.Merch.newTVShowHeader);
        $("merchpage").show();

        this.tplNewMovies.empty();
        this.tplTvShows.empty();
        this.tplFeature.empty();
        this.tplCollection.empty();
        this.tplActions.empty();

        this.tplFeature.append($cn.data.Merch.featuredPromotion);

        if ($('featuredtitleheader'))
            $('featuredtitleheader').set('text', $cn.data.Merch.featuredPromotion.name);

        // Go through and append movies to each section of the grid:
        x = 0;
        $cn.data.Merch.newMovies.each(function(item){
            if (x < maxThumbs) {
                item.titleidx = x++;
                if (typeof $cn.config.CustomDefaultGridImage == 'function') {
                    item.defaultImageClass = $cn.config.CustomDefaultGridImage();
                }
                self.tplNewMovies.append(item);
            }
        });

        x = 0;
        $cn.data.Merch.newTVShows.each(function(item){
            if (x < maxThumbs) {
                item.titleidx = x++;
                if (typeof $cn.config.CustomDefaultGridImage == 'function') {
                    item.defaultImageClass = $cn.config.CustomDefaultGridImage();
                }
                self.tplTvShows.append(item);
            }
        });

        // The following is to smoothly handle whether newC is array or single object
        // TODO: integrate with dixons which only has 1 new collection in the layout
        //       this will have to update the navigation too
        x = 0;
        if ($cn.data.Merch.newCollections.length) {
            log.write("we have new collections length");
            for (x = 0; x < $cn.data.Merch.newCollections.length; x += 1) {
                if ($cn.config.MaxMerchCollections && $cn.data.Merch.newCollections.length > $cn.config.MaxMerchCollections)
                    $cn.data.Merch.newCollections.length = $cn.config.MaxMerchCollections;
                $cn.data.Merch.newCollections[x].titleidx = x;
                self.tplCollection.append($cn.data.Merch.newCollections[x]);
            }
        } else {
            log.write("we do NOT have new collections length");
            self.tplCollection.append($cn.data.Merch.newCollections);
        }

        x = 0;
        $cn.data.Merch.actionButtons.each(function(item){
            item.titleidx = x++;
            self.tplActions.append(item);
        });

        this.tplNewMovies.apply();
        this.tplTvShows.apply();
        this.tplFeature.apply();
        this.tplCollection.apply();
        this.tplActions.apply();

        navigation.setFocus("f_button");
	
	},
	keydown: function(method){
		
		switch(method){
			case "Store":
				this.hide();
				BrowseView.goHome();
				break;
			case "MyLibrary":
				this.hide();
				navigation.setFocus('dock-library');
				BrowseView.goLibrary(function () { $('mainstage').hide(); }, function () { $('mainstage').show(); });
				break;
			default:
				break;
		}
		
	},
    // In which how focus is moved on the merch page is defined.
	navigate: function(payload){
        var idx,
		    elem = $(application.element.current).get('class').replace('hover', '').replace('default', '').trim(),
            numNewMovies = $cn.config.MaxMerchThumbs < $cn.data.Merch.newMovies.length ? $cn.config.MaxMerchThumbs : $cn.data.Merch.newMovies.length,
            numNewTVShows = $cn.config.MaxMerchThumbs < $cn.data.Merch.newTVShows.length ? $cn.config.MaxMerchThumbs : $cn.data.Merch.newTVShows.length,
            numNewCollections = $cn.data.Merch.newCollections.length;
            direction = payload.args[0].direction;
		
		
		if(elem.indexOf('activate') == -1 && document.getElementById('modalcontrol').style.display != 'block') {
			
			if(BrowseView.currentState == "merch-view"){
				log.write("Merch page listening.");
				
				payload.preventDefault();
			
				switch(elem){
					case "featuredpromotion":
						if(direction === 'up'){
							navigation.setFocusElement($('newcollections').getElement("a[titleidx='" + (numNewCollections - 1) + "']"));
						}
						if(direction === 'down'){
							navigation.setFocusElement($('newcollections').getElement("a[titleidx='0']"));
						}
						else if(direction === 'right') {
							navigation.setFocusElement($('newmovies').getElement("a[titleidx='0']"));
						}
						else if(direction === 'left') {
							navigation.setFocusElement($('newmovies').getElement("a[titleidx='" + (numNewMovies - 1) + "']"));
						}
						break;
					case "newmovie":
						idx = parseInt($(application.element.current).get('titleidx'));
						
						if(direction === 'down'){
							navigation.setFocusElement($('newtvshows').getElement("a[titleidx='" + idx + "']"));
						}
						if(direction === 'up'){
							if(idx < 2){
								navigation.setFocusElement($('actionbuttoncontainer').getElement("a[titleidx='0']"));
							}
							else {
								navigation.setFocusElement($('actionbuttoncontainer').getElement("a[titleidx='1']"));
							}
						}
						else if(direction === 'right') {
							if(numNewMovies > idx + 1) {
								navigation.setFocusElement($('newmovies').getElement("a[titleidx='" + (idx + 1) + "']"));
							}
							else {
								navigation.setFocusElement($('featuredpromotion').getElement("a"));
							}
						}
						else if(direction === 'left') {
							if(idx > 0){
								navigation.setFocusElement($('newmovies').getElement("a[titleidx='" + (idx - 1) + "']"));
							}
							else{
								navigation.setFocusElement($('featuredpromotion').getElement("a"));
							}
						}
						break;
					case "newtvshows":
						idx = parseInt($(application.element.current).get('titleidx'));
						
						if(direction === 'up'){
							navigation.setFocusElement($('newmovies').getElement("a[titleidx='" + idx + "']"));
						}
						else if(direction === 'down'){
							if(idx < 2) {
								navigation.setFocusElement($('actionbuttoncontainer').getElement("a[titleidx='0']"));
							}
							else {
								navigation.setFocusElement($('actionbuttoncontainer').getElement("a[titleidx='1']"));
							}
						}
						else if(direction === 'right') {
							if(numNewTVShows > idx + 1){
								navigation.setFocusElement($('newtvshows').getElement("a[titleidx='" + (idx + 1) + "']"));
							}
							else {
								navigation.setFocusElement($('newcollections').getElement("a"));
							}
						}
						else if(direction === 'left') {
							if(idx > 0){
								navigation.setFocusElement($('newtvshows').getElement("a[titleidx='" + (idx - 1) + "']"));
							}
							else{
								navigation.setFocusElement($('newcollections').getElement("a"));
							}
						}
						break;
					case "button":
						idx = parseInt($(application.element.current).get('titleidx'));
						
						if(direction === 'up'){
							navigation.setFocusElement($('newtvshows').getElement("a[titleidx='" + (idx === 0 ? 0 : 2) + "']"));
						}
						if(direction === 'down'){
							navigation.setFocusElement($('newmovies').getElement("a[titleidx='" + (idx === 0 ? 0 : 2) + "']"));
						}
						else if(direction === 'right') {
							if($cn.data.Merch.actionButtons.length > (idx + 1)){
								navigation.setFocusElement($('actionbuttoncontainer').getElement("a[titleidx='" + (idx + 1) + "']"));
							}
							else {
								navigation.setFocusElement($('actionbuttoncontainer').getElement("a[titleidx='0']"));
							}
						}
						else if(direction === 'left') {
						    navigation.setFocusElement($('actionbuttoncontainer').getElement("a[titleidx='" + (idx ? 0 : 1) + "']"));
						}
						break;
                    // Bottom left
					case "collection":
                        idx = parseInt($(application.element.current).get('titleidx'));

                        if(direction === 'right') {
                            navigation.setFocusElement($('newtvshows').getElement("a[titleidx='0']"));
                        } else if(direction === 'left') {
                            navigation.setFocusElement($('newtvshows').getElement("a[titleidx='" + (numNewTVShows - 1) + "']"));
                        } else if (idx === 0 && direction === 'up') {
                            // Off top
                            navigation.setFocusElement($('featuredpromotion').getElement("a"));
                        } else if (idx + 1 === numNewCollections && direction === 'down') {
                            // Off bottom
                            navigation.setFocusElement($('actionbuttoncontainer').getElement("a[titleidx='0']"));
                        } else if (direction === 'up') {
                            // Up within collection
                            navigation.setFocusElement($('newcollections').getElement("a[titleidx='" + (idx - 1) + "']"));
                        } else if(direction === 'down'){
                            // Down within collection
                            navigation.setFocusElement($('newcollections').getElement("a[titleidx='" + (idx + 1) + "']"));
                        }
						break;
					default:
						break;
				}
			}
		}
		

	},
	/* Event handler that handles loading specific genres in the wheels (primary/secondary) */
	loadgenreview: function(payload){
		var p = payload.args[0],
		parent = null,
		child = null,
		childCollection = null,
		idx = 0,
		parentidx = 0,
		childidx = 0,
		parentid = 0;

        // First check that the genre id is available
        // If it is not, go to the default wheel (new releases) instead of showing an error
        if (! $cn.utilities.haveGenreId(p.id)) {
            //BrowseView.showMessage("message_content", application.resource.merch_messages.genre_unavailable);
            $("merchpage").hide();
            BrowseView.goHome();
            return;
        }

        // Hide merchpage, do not use this.hide, since we have overriden some things
        $("merchpage").hide();
        
		//Loop all the child collections
		for(var item in $cn.data.slaveWheel) {
			
			// Loop the slave wheel items to find the selected genre and set some default values	
			$cn.data.slaveWheel[item].each(function(genre){
				if(genre.iD == p.id){
					parentid = genre.parentId;
					childCollection = $cn.data.slaveWheel[item];
					child = genre;
					
					//Loop the selected child collection to find the selected genre
					childCollection.each(function(item){			
						if(child.iD == item.iD){
							childidx = idx;
						}
						idx++;
					});
				}
			});
		
		}
		
		//Loop the master wheel to find the wheel index and set the parent element
		idx = 0;
		$cn.data.masterWheel.each(function(item){
			
			if(parentid == item.iD){
				parentidx = idx;
				parent = item;
			}
			idx++;
		});

		BrowseView.goHome();
			
	    BrowseView.WheelControl.loadData($cn.data.masterWheel, $cn.data.slaveWheel, parentidx);
	    BrowseView.WheelControl._slaveWheel.render(childCollection, childidx);

		/* Fire wheel events that will set the wheel and display the correct titles in the grid */
		application.events.publish('wheelrendered', {
			sourceid: "WheelControl",
			source: "slavedatasource",
			selectedidx: childidx,
			selectedvalue:  child.iD
		});	    	

		application.events.publish('wheelitemchanged', {
			wheelinstance: "WheelControl",
			sourceid: "WheelControl",
			source: "slavedatasource",
			selectedidx:  childidx,
			selectedvalue:  child.iD
		});
		
		// Set Focus to first element in grid
		var anchors = $('titlegrid').getElementsByTagName("a");
		if (anchors.length > 0) {
			navigation.setFocusElement($('titlegrid').getElement(anchors[0].id));
		}
		else
			navigation.setFocus('selectedslave');


	},
	loadtitleview: function(payload){

		//$('dock').show();
		$("merchpage").hide();

	},
	hide: function(){
		
		BrowseView.hideExtras();
		$('titlegrid').show();
		$('wheel').show();
		$('dock').show();
		navigation.setFocus('selectedmaster');
		$("merchpage").hide();
		
	},
	onBack: function(payload) {
		if (payload) {
			payload.preventDefault();
        }

	},
    onRestoreState: function() {
        if (BrowseView.currentState === 'merch-view') {
            $('merchpage').show();
        }
    }
},
MerchControl = new Class(MerchControlProperties);
