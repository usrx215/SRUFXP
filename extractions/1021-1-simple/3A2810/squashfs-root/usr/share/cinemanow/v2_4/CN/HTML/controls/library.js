//-----------------------------------------------------------------------------
// library.js
// Copyright (c) 2012 - 2013, Rovi Corporation.  All rights reserved.
//-----------------------------------------------------------------------------
 
var LibraryClass = {
		id: 'librarypanel',
		isInvalid: false,
		tplKey: null,
		tpl: null,
		_data: [],
		scroll: false,
		_timer: 600, //600 seconds = 10 minutes
		_periodical: '',
		_timerStarted: false,
		initialize: function(id){
			application.events.subscribe(this, "navigate", this.handleNavigate.bind(this));
			application.events.subscribe(this, "restorestate", this.onRestoreState.bind(this));
			
			this.id = id;
			this.tplKey = this.id;
			//log.write(this.id + ".tpl");
			
			this.tpl = new ui.template(this.id, application.ui.loadTpl(this.id + ".tpl"));
			this.tpl.compile();

			log.write(this.id + ".init()");		
		},
		cleanUI: function(){
			if($(this.id).getChildren().length > 0){
				$(this.id).getChildren().destroy();
			}
		},
		setFocus: function() {
			if($('librarypanel').getStyle("display") == "block")
			{
				if($("btnLibraryActivate").getStyle("display") == "block")
					navigation.setFocus('btnLibraryActivate');
				else
					navigation.setFocus("btnLibraryBrowseStore");
			}
			else
			{
				navigation.setFocus("selectedmaster");
			}
			//this.startRefresh();
		},
		show: function(){
			var self = this;
			log.write('triggered show');
			$('mainstage').show();
			if($cn.data.AuthToken.length == 0){
				BrowseView.hideExtras();
				$("librarypanel").show();
				$("librarytop").show();
				
				$("librarytop").getElement(".buttons").addClass("double");
				$$(".libraryActivate").show();
				this.setFocus();
                if (BrowseView.MessagePopup) {
                    BrowseView.MessagePopup.resetFocus();
                }
			}
			else {
				BrowseView.CurrentProcessLoaded = false;

                // This is a continuation of a store spinner, so it should show right away
                $cn.utilities.showSharedLoadingModal(0, application.resource.loading_enum.library);
				$cn.methods.getUserLibraryExt(function(result){

                    // Clear timer for loading modal
                    $cn.utilities.clearSharedLoadingSpinner();

					if (result.items.length > 0) {
						
						$("librarypanel").hide();
						$("librarytop").hide();
						$('wheel').show();
						$('singlewheel').hide();

						if (!BrowseView.LibraryWheelControl)
							BrowseView.LibraryWheelControl = new LibraryWheelControl();

						BrowseView.GridControl.cleanUI();
						BrowseView.LibraryWheelControl.activate();
						//set lastSlaveValue false to restore library default state
						BrowseView.LibraryWheelControl.lastSlaveValue = false;
						BrowseView.LibraryWheelControl.loadLibraryMenu(result);
						navigation.setFocus('selectedmaster');
                        if (BrowseView.MessagePopup) {
                            BrowseView.MessagePopup.resetFocus();
                        }
                        //self.checkUVTermsOfService();
					}
					else {
						BrowseView.hideExtras();
						$("librarytop").getElement(".buttons").removeClass("double");
						$("librarypanel").show();
						$("librarytop").show();
						
						$$(".libraryActivate").hide();
						navigation.setFocus('btnLibraryBrowseStore');
						application.currentView.layoutIsDirty = true;
						BrowseView.CurrentProcessLoaded = true;
					}
				});
			}
			$('uicontainer').addClass('redbuttons');
			
//			this.setFocus();
			
		},
		handleNavigate: function(payload){
			//This is necessary because of the dynamic nature in which buttons are displayed and hidded.
			if(BrowseView.currentState == "library-view"){
				//If user clicks left and the current element is on the browse store button (no titles loaded) first check to see if the activate button is present or else go to the library dock button.
				if(payload.args[0].direction == "left" && application.element.current == "btnLibraryBrowseStore"){
					payload.preventDefault();
					
					if(document.getElementById('btnLibraryActivate') && document.getElementById('btnLibraryActivate').style.display == 'block'){
						navigation.setFocus('btnLibraryActivate');
					}
					else {
						navigation.setFocus('dock-library');
					}
                    if (BrowseView.MessagePopup) {
                        BrowseView.MessagePopup.resetFocus();
                    }
				}
			}
		},
		hide: function(){
			this.stopRefresh();
			$("librarypanel").hide();
		},
		startRefresh: function() {
			
			if(!this._timerStarted)
			{
				log.write("**********start refresh: "+this._timerStarted);
				$clear(this._periodical); 
				this._timerStarted = true;
				this._periodical = this.refresh.periodical(this._timer * 1000)
				
			}
			
		},
		refresh: function() {
			
			if(BrowseView.currentState == "library-view") //Only continue if we are still in the library
			{
				log.write("**********refreshing library.....");
				BrowseView.Library.show();
			}
			else
			{
				BrowseView.Library.stopRefresh();
			}

		},
		stopRefresh: function() {
			log.write("**********stop refresh");
			$clear(BrowseView.Library._periodical); 
			BrowseView.Library._timerStarted = false;
		},
		loadData: function(content, columns, template) {

			this._data = [];
			//this.saveHistory();
			this._data = content;		
			this.draw();
			
		},
		onScroll: function(direction, scrollbar)
		{
			
		},
		draw: function(){
			var self = this;
			this.cleanUI();
			this.tpl.empty();
			
			this._data.each(function(item) {
				log.write(item);
				self.tpl.append(item);
			});
			this.tpl.apply();
		},
        checkUVTermsOfService: function() {
            var self = this;
            if( $cn.config.UVTOSEnabled){
                if($cn.data.UVTermsAcceptance == "accepted"){
                    return true
                } else {
                    $cn.methods.getUVTermsOfServiceAcceptance(function(res){
                        $cn.data.UVTermsAcceptance = res;
                        if(res != 'accepted'){
                            $cn.methods.getUVTermsOfService(self.showUVTermsOfService.bind(self));
                        } else if( res == "accepted"){
                            return true;
                        }
                    });
                }
            }
        }, showUVTermsOfService : function(termsOfService) {

            this.Legal = new LegalPopup('uvtermsofservice');
            var messagePath = application.resource.uv_messages.uvTermsOfService;
            this.Legal.loadData([{
                title : ($cn.data.UVTermsAcceptance == "changed" ? messagePath.ChangedMessage : messagePath.UnacceptedMessage),
                content : messagePath.Content,
                text : termsOfService,
                "OK"      : messagePath.OK,
                "Close"   : messagePath.Close,
                "AcceptAction"  : "BrowseView.Library.acceptUVTermsOfService(true)",
                "CloseAction"  : "BrowseView.Library.Legal.hide()"
            }]);
            this.layoutIsDirty = true;
            this.Legal.firstFocus = 'LegalOK';
            this.Legal.show();
            $('SplashScreen').hide();
        }, acceptUVTermsOfService: function(accept) {
            var self = this;

            $cn.methods.acceptUVTermsOfService(function(callback) {
                self.Legal.hide();
                //This is no longer valid.
                self.Legal.hide();
                $('Overlay').setStyle('background-color','transparent');
                $cn.data.UVTermsAcceptance = callback;
            });
        },
        onActivate: function(){
			BrowseView.showActivate({
				callback: function(){
					this.show();
					navigation.setFocus('dock-library');
                    if (BrowseView.MessagePopup) {
                        BrowseView.MessagePopup.resetFocus();
                    }
				}.bind(this)
			});
		},
        onRestoreState: function(payload){
			var state = payload.args[0];

			if (state.store.currentState == 'library-view' && application.element.current == 'selectedmaster') {
				state = state[this.id];
				$extend(this, state);
				if ($cn.data.AuthToken != '') {
					this.show();		
				}
			} 
		}
	},
	Library = new Class(LibraryClass);
