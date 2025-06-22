//-----------------------------------------------------------------------------
// wishlist.js
// Copyright (c) 2012 - 2013, Rovi Corporation.  All rights reserved.
//-----------------------------------------------------------------------------
 
var WishListProperties = {
		id: 'wishlistpanel',
		isActive: false,
		currentFilter: null,
		currentPosition: 0,
		tpl: null,
		initialize: function(){
			log.write(this.id + ".init()");
			application.events.subscribe(this, 'wheelitemchanged', this.handleWheelItemChange.bind(this));
			application.events.subscribe(this, 'gridloaded', this.handleGridLoaded.bind(this));
			application.events.subscribe(this, 'wishlistitem', this.showOptions.bind(this));
			application.events.subscribe(this, 'savestate', this.onSaveState.bind(this));
			application.events.subscribe(this, 'restorestate', this.onRestoreState.bind(this));
		},
		//New to handle lost focus issue when coming back to the wish list
		handleGridLoaded: function(payload){
			if(BrowseView.currentState == "wishlist-view") {
				//Last selected item means that if it is set that we have come back from a return action and the state has been restored.
				if(this.lastSelectedItem && this.lastSelectedItem != ''){
					var list = $('titlelist'); 				
					var title = list.getElement("a[titleid='" + this.lastSelectedItem + "']");
					
					if(title) {
						navigation.setFocus(title.id);
					}	
					else {
						log.write("handling grid loaded by setting focuse to wheel");
						navigation.setFocus("singleselectedmaster");
					}
					
					this.lastSelectedItem = ''; //Clear this value out since it has been set or had the opportunity to be set.
				}
			}
		},
		handleWheelItemChange: function(payload){		
			
			if (this.WishlistWheelControl === ActiveWheel) {
				var p = payload.args[0];

				log.write('Selected value: ' + p.selectedvalue);
				this.loadList(p.selectedvalue);
			}
		},
		hide: function(){
			this.isActive = false;
		},
		loadList: function(filter) {
			if(BrowseView.currentState == "wishlist-view") {
				var self = this;
				this.filter = filter;
				
				if ($cn.data.AuthToken != '') {
		
					if (this.data && this.data[filter]) {
						this.currentFilter = filter;
						BrowseView.LastGridProcess = "wishlist";
						application.events.publish('loadgrid', {
							grid: 'titlegrid',
							data: this.data[filter],
							gridProcess: "wishlist",
							position: this.currentPosition,
							columns: 4,
							template: 'wishlist',
							className: 'wishlistgrid'
						});
						$("messagepanel").hide();
						$('titlegrid').show();
					}
					else {
						$('titlegrid').hide();
						self.showMessage("wishlist_empty");
					}
				}
				else {
					$('singlewheel').hide();
					$('titlegrid').hide();	
					this.showMessage("wishlist_notactivated");
				} 
				
				this.currentPosition = 0;
			}
		},
		loadWheel: function () {
			
			var data = {},
                timer;
			
			//If state as been restored then get the title that is currently selected. This is used to later set focus.
			this.lastSelectedItem = '';
			if(this.stateRestored == true) {
				if(application.element.current != null && application.element.current != '' && document.getElementById(application.element.current)){
					this.lastSelectedItem = $(application.element.current).get('titleid');				
				}
			}

            // This is a continuation of a store spinner, so it should show right away
			timer = $cn.utilities.showLoadingModal(0, application.resource.loading_enum.loadingwishlist);
			$cn.methods.getWishlist("Movie", function(result){

				log.write("getWishList callback is being executed");
				//Always check the view in the callbacks so that the UI only updates if the current view is still valid
				if(BrowseView.currentState == "wishlist-view") {
				
					if (result.items && result.items.length) 
						data.Movie = result.items;
		
					$cn.methods.getWishlist("TV_Show", function(result){
                        // Clear timer for loading modal
                        $cn.utilities.clearLoadingSpinner(timer);

						if(BrowseView.currentState == "wishlist-view") {
							
							if (result.items && result.items.length) 
								data.TV_Show = result.items;
						
                            var wheelItems = [];
			
							if (data.Movie) 
								wheelItems.push({ name: "Movies", iD: "Movie", parentID: 0 });
			
							if (data.TV_Show) 
								wheelItems.push({ name: "TV Shows", iD: "TV_Show", parentID: 0 });
			
							if (wheelItems.length) {
								log.write("Loading wishlist wheel!");
								this.data = data;
								
								$('singlewheel').show();
								this.WishlistWheelControl.activate();
								this.WishlistWheelControl.loadData(wheelItems, this.currentFilter);								
								if (application.element.current === "singleselectedmaster") {
									navigation.setFocus("singleselectedmaster");
								}
							}
							else {
								$('singlewheel').hide();
								this.showMessage("wishlist_empty");
							}
						
						}
					}.bind(this));
				} else {
                    // Clear timer for loading modal
                    $cn.utilities.clearLoadingSpinner(timer);
                }
				
			}.bind(this));
		},
		loadWheelExt: function () {
		
			var data = {},
				timer = null;
		
			//If state as been restored then get the title that is currently selected. This is used to later set focus.
			this.lastSelectedItem = '';
			if(this.stateRestored == true) {
				if(application.element.current != null && application.element.current != '' && document.getElementById(application.element.current)){
					this.lastSelectedItem = $(application.element.current).get('titleid');				
				}
			}
		
			timer = $cn.utilities.showLoadingModal(0, application.resource.loading_enum.loadingwishlist);
			$cn.methods.getWishlistExt("All", function(result){
				$cn.utilities.clearLoadingSpinner(timer);
				
				//Always check the view in the callbacks so that the UI only updates if the current view is still valid
				if(BrowseView.currentState == "wishlist-view") {	
														
					var wheelItems = [];										
					if (result.items && result.items.length) {  															
						data.Movie = []; 
						data.TV_Show = [];						
						
						var i;						
						for (i = 0; i < result.items.length; i++) {
							if (result.items[i].titleClassification == "Movie") {
								data.Movie.push(result.items[i]);
							}
							else {
								data.TV_Show.push(result.items[i]);
							}							
						}
						
						if (data.Movie.length > 0) {
							wheelItems.push({ name: "Movies", iD: "Movie", parentID: 0 });
						}

						if (data.TV_Show.length > 0) {
							wheelItems.push({ name: "TV Shows", iD: "TV_Show", parentID: 0 });
						}
					}
									
					if (wheelItems.length) {
						log.write("Loading wishlist wheel!");
						this.data = data;
					
						$('singlewheel').show();
						this.WishlistWheelControl.activate();
						this.WishlistWheelControl.loadData(wheelItems, this.currentFilter);
						if (application.element.current === "singleselectedmaster") {
							navigation.setFocus("singleselectedmaster");
						}
					}
					else {						
						$('singlewheel').hide();
						this.showMessage("wishlist_empty");
					}
				}				
			}.bind(this));
		},
		setFocus: function() {
			setTimeout(function(){
				if ($('singlewheel').offsetWidth)
					navigation.setFocus('singleselectedmaster');
				else {
					var focus = $("messagepanel").getElement("a.default");
					if (focus) navigation.setFocus(focus);
				}	
			},100);
		},
		show: function(){

			this.isActive = true;
			this.currentFilter = null;
			this.currentPosition = 0;
			this.stateRestored = false;
			
			if(!this.WishlistWheelControl) 
				this.WishlistWheelControl = new WishlistWheelControl();

			if ($cn.data.AuthToken != '') {
				navigation.setFocus('singleselectedmaster');
				//this.loadWheel();
				this.loadWheelExt();
			}
			else {
				this.showMessage("wishlist_notactivated");
			}
		},
		showMessage: function(template_id) {
			
			if (this.tpl != null)
				this.tpl.empty();
				
			this.tpl = new ui.template("messagepanel", application.ui.loadTpl(template_id + ".tpl")); 
			this.tpl.compile();
			this.tpl.append();
			this.tpl.apply();
			
			var message = $("messagepanel_container");
			message.erase('class');
			message.addClass(template_id);

			log.write("showing message panel (" + template_id +")");	
			$("messagepanel").show();
			this.setFocus();	
		},
		showOptions: function(payload){		

	   		$cn.methods.getTitleListing(payload.args[0].id, true, function(title){

				var name = title.name,
				    season = '',
				    episode = '',
					purchaseText = null,
					template = (title.availableProducts.length) ? "wishlist_options_buy" : "wishlist_options",
					promoString,
					highlightColor = $cn.config.HighlightColor ? $cn.config.HighlightColor : "#FFFFFF";
				
				if (title.titleType == "Movie") 
					purchaseText = $cn.utilities.purchaseText(title);
				else {
					purchaseText = application.resource.buy_text[title.titleType];
					
					if (title.titleType == "TV_Episode") {
						name = $cn.utilities.getMeta("ShowName", title.metaValues);
						season = $cn.utilities.getMeta("SeasonName", title.metaValues);
						
						if (season.length > 0)
							season += ", ";
							
						season += $cn.utilities.getMeta("EpisodeNumber", title.metaValues);
						episode = '"' + title.name + '"';
					}
					else if (title.titleType == "TV_Season") {
						name = $cn.utilities.getMeta("ShowName", title.metaValues);
						season = title.name;
					}
				}

				promoString = $cn.utilities.getMeta("PromoString", title.metaValues);
				
				if (promoString.length)
					purchaseText = purchaseText + " " + promoString;

				name = $cn.utilities.ellipsis(name, 30);
				BrowseView.showMessage(template, {
					Title: '<span style="color:' + highlightColor + '">' + name + '</span>',
					Season: season,
					Episode: episode,
					TitleID: title.titleID,
					mPAARating: title.mPAARating,
					PurchaseText: purchaseText,
					Index: BrowseView.GridControl.itemidx
				});
				
				
			});
		},
		showPurchase: function(titleId){		
			BrowseView.MessagePopup.hide();		
			
			//This is here to prevent buttons to be clicked for a short period of time. This is nessecary to give the device time to load and maintain it's state
			application.TempKeyBlock = true;
			application.TempKeyBlockDuration = 2500;
			
			application.events.publish('loadtitleview', {id: titleId, action: "checkout"});
		},
		showDetail: function(titleId){
			BrowseView.MessagePopup.hide();		
			
			//This is here to prevent buttons to be clicked for a short period of time. This is nessecary to give the device time to load and maintain it's state
			application.TempKeyBlock = true;
			application.TempKeyBlockDuration = 2500;
			
			
			application.events.publish('loadtitleview', {id: titleId});
		},
		remove: function(titleId, index){
			
			BrowseView.MessagePopup.hide();
            
            var responseFunc = function(result) {
				if (result.responseCode == 0) {
					BrowseView.GridControl.remove(index);

					if (BrowseView.GridControl.itemCount() == 0) {
						$('titlegrid').hide();
						this.show();
					}
				}
            };
            
            log.write("Wishlist.remove: titleId: " + titleId + "   index: " + index + "   count: " + BrowseView.GridControl.itemCount());
            $cn.methods.removeItemFromWishList(titleId, responseFunc.bind(this));
		},
		onActivate : function() {
//			this.loadWheel();
			
			BrowseView.showActivate({
				callback: function(){
					this.show();
					this.setFocus();
				}.bind(this)
			});
		}, 
		onSaveState: function(payload){
			
			var state = payload.args[0];
			var currentPosition = 0;
			
			if (this.isActive && this.currentFilter) {
				currentPosition = BrowseView.GridControl.getPosition();			
			}

			state[this.id] = {
				isActive: this.isActive,
				currentFilter: this.currentFilter,
				currentPosition: currentPosition
			};
		},
		onRestoreState: function(payload){
			var state = payload.args[0];
			
			if (state.store.currentState == "wishlist-view") {
				
				state = state[this.id];
				$extend(this, state);

				if (this.isActive) {
				
					$('messagepanel').hide();
					$('scrollbar').hide();
					$('titlegrid').hide();
					$('singlewheel').hide();
					
					if ($cn.data.AuthToken != '') {
						this.stateRestored = true;
						//this.loadWheel();
						this.loadWheelExt();
						
						if (application.element.current == null) {
							navigation.setFocus('singleselectedmaster');
						}					
					}
					else 
						this.showMessage("wishlist_notactivated");
				} 
			}
			else {
				this.isActive = false;
			}
		}
	},
	WishList = new Class(WishListProperties);
