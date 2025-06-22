//-----------------------------------------------------------------------------
// welcome.js
// Copyright (c) 2012 - 2013, Rovi Corporation.  All rights reserved.
//-----------------------------------------------------------------------------
 
/**
 * @author tmchattie
 */
var WelcomeControlProperties = {
		id: 'welcomecontrol',
		persist: {},
	    controls:{},
	    buttons:[],
	    layoutIsDirty: true,
		_data: [],
	    lastFocus: null,
		firstFocus: null,
		contentControlId: '',
	    contentId: 'welcomecontrol',
	    initialize: function(id, newContentId){
			this.id = id;
	    },
	    getStarted: function(){
	    	$('welcomeintro').hide();
	    	$('welcomemessage').show();
            if($cn.config.EnableUV && $('uvwelcomebenefit')) {
                $('uvwelcomebenefit').removeClass('hidden');
            }
	    	application.navigator.setFocus('leftbutton');
	    },
	    startActivation: function(){
	    	//this.hide();
	    	BrowseView.ActivationPcView.activeFromWelcome = true;
	    	BrowseView.ActivationPcView.show();
	    },
	    explore: function(){
	    	
	    	this.hide();
	    	
	    	
	    },
	    init: function(params, direction){
			log.write('merchcontrol.init()');		
	        var self = this;
	       
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
			log.write("Showing Welcome Page.");
			$('welcome').show();
			//navigation.setFocus("f_button");
		
		},
		onBack: function(payload){
			log.write(payload);
			//payload.preventDefault();
			
		},
		hide: function(callback){
            if($cn.data.d2dPath) {
                log.write("D2D LOAD TITLE");
                log.write("D2D LOAD TITLE");
                log.write("D2D LOAD TITLE");
                log.write("D2D LOAD TITLE");
                log.write("D2D LOAD TITLE");
                log.write("D2D LOAD TITLE");
				$('store').set('class','browse-view');

                application.events.publish('loadtitleview', {
                    id : $cn.data.d2dTitleInfo.id,
                    action: "checkout"
                });
                setTimeout(function(){
                    if ($('welcome')) {
                        $('welcome').destroy();
                    }

                    if (callback) {
                        callback();
                    }

                }.bind(this),200);

			} else if($cn.data.EnableMerchPage){
                setTimeout(function(){
                    $('welcome').destroy();

                    if (callback) {
                        callback();
                    }

                    BrowseView.showMerch();
                    application.navigator.setFocus('f_button');
                }.bind(this),200);
            }   else {
                $('store').set('class','browse-view');
                BrowseView.showMessage("message_loading", {
                    Message: application.resource.loading_enum.loadinggeneric
                });

                BrowseView.goHome(true);

                setTimeout(function(){
                    if ($('welcome')) {
					    $('welcome').destroy();
                    }

                    if (BrowseView && BrowseView.MessagePopup) {
					    BrowseView.MessagePopup.hide();
                    }

                    if (callback) {
                        callback();
                    }

					application.navigator.setFocus('selectedmaster');
					
				}.bind(this),2000);
			}
		}
	},
	WelcomeControl = new Class(WelcomeControlProperties);
