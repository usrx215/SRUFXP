//-----------------------------------------------------------------------------
// modal.js
// Copyright (c) 2012 - 2013, Rovi Corporation.  All rights reserved.
//-----------------------------------------------------------------------------
 
/**
 * @author jmccabe
 */
var ModalControlProperties = {
	id: 'modalcontrol',
	persist: {},
    controls:{},
    buttons:[],
    layoutIsDirty: true,
	_data: [],
    tpl: null,
    scroll:false,
	lastFocus: null,
	firstFocus: null,
	contentControlId: '',
    isNowVisible: false,
    contentId: 'ModalContent',
    initialize: function(id, newContentId){
		this.id = id;
		//log.write(this.id + ".tpl");
		if(newContentId) {
			this.contentId = newContentId;
		}
    
		this.tpl = new ui.template(this.contentId, application.ui.loadTpl(this.id + ".tpl"));
		this.tpl.compile();
		//log.write(log.dump(this.tpl));
		
    },
    setCssClass: function(id) {
		$('modalcontrol').erase('class');
		$('modalcontrol').addClass(id);
		
		if(id != this.id) {
			$('modalcontrol').addClass(this.id);
		}
    },
    init: function(params, direction){
		log.write('modalcontrol.init()');		
        this.hide();
        //Persist Params
        if(params) {
            this.persist = params;               
        }      
	},
	cleanUI: function(){
//		if($('titledetailscontainer')) {
//			if($('titledetailscontainer').getChildren().length > 0){
//				$('titledetailscontainer').getChildren().destroy();
//			}
//		}
	},
	/*
	 * Load data will:
	 * 1) Set the HTML source and buttons for the modal view
	 * 2) Render the local controls
	 */
	loadData: function(content) {
        log.write("loadData modal.js");
		this._data = [];
		//this.saveHistory();
		this._data = content;		
		this.draw();
	},
	/* Apply the template */
	draw: function(){
		log.write("draw modal.js");
//		if(document.getElementById('ModalWindow')) {
//			var v = document.getElementById('ModalWindow');
//	        var p = v.parentNode;
//	        
//	        application.putInnerHTML(v, '');
//	        p.removeChild(v);
//			
//			/* Add fresh div to work with. This should keep the dom clean */
//			var newViewContainer = document.createElement('div');
//			newViewContainer.setAttribute('id','ModalWindow');
//			p.appendChild(newViewContainer);
//			
//			this.tpl = new ui.template(this.contentId, application.ui.loadTpl(this.id + ".tpl"));
//			this.tpl.compile();
//		}
		
		var self = this;
		this.cleanUI();
		this.tpl.empty();
		this._data.each(function(item) {
			
			//log.write("modal item: "+ log.dump(item));
			self.tpl.append(item);
			
		});
		var tplStatus = this.tpl.apply();

		if (!this.firstFocus) {
			var defaultFocus = $(this.contentId).getElement(".default");
			if (defaultFocus) 
				this.firstFocus = defaultFocus.id;
		}
	},
	html: function(content) {
		$(this.contentId).set('html', content);
	},
    resetFocus: function() {

        log.write("resetting modal focus");
        if(application.element.current != null && application.element.current != '' && document.getElementById(application.element.current)) {
            this.lastFocus = application.element.current;
        }
    },
	show: function() {
        this.isNowVisible = true;
		log.write("showing a modal");
		if(application.element.current != null && application.element.current != '' && document.getElementById(application.element.current)) {
			this.lastFocus = application.element.current;			
		}
	
		if(this.firstFocus) {
			navigation.setFocus(this.firstFocus);
		}
		
		this.setCssClass(this.id);
		
		//Custom style handler to ensure that styles always get overridden.
		var styles = (application.resource.modalConfig[this.id]) ? application.resource.modalConfig[this.id] : (application.resource.modalConfig["default"]);
		
		for (style in styles) {
		    $("ModalWindow").setStyle(style, styles[style]);
		}

        log.write("making modalcontrol visible");
		$("modalcontrol").show();
        //log.write(XML.toString(document.getElementById("modalcontainer")));
        
		application.events.subscribe(this, 'back', this.onBack.bind(this));
	},
	hide: function() {
        this.isNowVisible = false;
        log.write("..... hiding modal .....");
		application.events.unsubscribe(this, "back");
		
		if(this.lastFocus) {
            if (this.lastFocus === "playerctl" && (!$('playerctl') || ! $('playerctl').style || ! $('playerctl').style.display || $('playerctl').style.display === "none")) {
                log.write("modal title view set focus");
                BrowseView.TitleViewControl.setFocus();
            } else {
                log.write("modal title view nav focus");
			    navigation.setFocus(this.lastFocus);
            }
		} else {
			navigation.setFocus('dock-home');
		}
		
		$("modalcontrol").hide();
		var modalWindow = document.getElementById("ModalWindow");
	    modalWindow.removeAttribute("style");	    
	},
	onBack: function(payload) {
		if (payload)
			payload.preventDefault();
			
		this.hide();
	},
    startPlay: function(titleid, passid) {
        log.write("start play");
        //If this is a rental then show purchase warning
        var self = this;
        var timer = $cn.utilities.showLoadingModal(2000, "Loading Title...");
        $cn.methods.getPurchasedTitle(passid, titleid, function(cb){
            $cn.utilities.clearLoadingSpinner(timer);
            /* If this title is not in the pass cache then add it. The pass cache is used to see if the HD stream is available */
            log.write("Current Pass: " + passid);
            if(!$cn.data.PassCache[passid]){
                log.write("Adding pass to pass cache");
                $cn.data.PassCache[passid] = cb;
            }

            var showRentalWarning = false,
                rentalPeriod = "24";
            for(x = 0; x < cb.availableProducts.length; x++){
                if(cb.availableProducts[x].purchaseType == "rent"){
                    if($cn.utilities.getMeta("LicensesDelivered", cb.metaValues) == "0"){
                        showRentalWarning = true;
                        rentalPeriod = cb.availableProducts[x].rentalPeriod;
                        break;
                    }
                }
            }
            if(showRentalWarning) {
                log.write("---- rental pathway -----");
                var messagepath = application.resource.checkout_messages.Rental_Warning;
                var data = {
                    Message: messagepath.Message.replace("##name##", cb.name),
                    Content: messagepath.Content.replace("##rentalperiod##", rentalPeriod).replace("##expirationmessage##", cb.expirationMessage.replace("Expires", "")),
                    Close:  "No",
                    OK: "Yes",
                    callback: function(result) {
                        if(result) {
                            self.hide();
                            BrowseView.showPlay(titleid, passid, 0);
                        }
                    }
                };
                BrowseView.showMessage("message_okcancel", data);
            }
            else {
                log.write("---- not rental pathway -----");
                BrowseView.showPlay(titleid, passid, 0);
            }

        }.bind(this));
    }
},
ModalControl = new Class(ModalControlProperties);
