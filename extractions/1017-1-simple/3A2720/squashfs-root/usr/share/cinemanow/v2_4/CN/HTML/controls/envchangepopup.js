//-----------------------------------------------------------------------------
// envchangepopup.js
// Copyright (c) 2012 - 2013, Rovi Corporation.  All rights reserved.
//-----------------------------------------------------------------------------
 
var EnvironmentPopup = new Class({
	Extends:ModalControl,
	popuptype: '',
    initialize: function(){
    	this.parent("envchange");
	},
    show: function() {
		this.parent();
		var self = this,
            x;
		
		document.getElementById('envchangebtns').innerHTML = '';
		
		for(x = 0; x < application.Environments.length; x++){
			document.getElementById('envchangebtns').innerHTML += '<p>Select (' + x + ') for ' + application.Environments[x].name + '</p>';
		}

		application.events.subscribe(this, "back", this.handleBack.bind(this));
		
		setTimeout(function(){
			application.events.subscribe(self, "keydown", self.handleKeyPress.bind(self));
		}, 500);
	},
	unsubEvents: function(){
		application.events.unsubscribe(this, "back");
		application.events.unsubscribe(this, "keydown");
	},
	handleBack: function(payload){
		payload.preventDefault();
		this.unsubEvents();
		this.hide();
	},	
	setCurrentVal: function(env){
		application.CurrentEnvironment = env;		
		application.endPointServer = env + ".cinemanow.com";
		application.apiUrl = "https://" + env + ".cinemanow.com";
		
		log.write("Changing config (application.CurrentEnvironment): " + application.CurrentEnvironment);
		log.write("Changing config (application.endPointServer): " + application.endPointServer);
		log.write("Changing config (application.apiUrl): " + application.apiUrl);
		this.unsubEvents();
		this.hide();
		BrowseView.reset();
		
		configuration.writeValue("CustomEndPoint", env);
	},
	handleKeyPress: function(payload){
		switch(payload.args[0].event.keyCode){
			case application.keys.KEY_1:
				this.setCurrentVal(application.Environments[1].key);
				break;
			case application.keys.KEY_2:
				this.setCurrentVal(application.Environments[2].key);
				break;
			case application.keys.KEY_3:
				this.setCurrentVal(application.Environments[3].key);
				break;
			case application.keys.KEY_4:
				this.setCurrentVal(application.Environments[4].key);
				break;
			case application.keys.KEY_5:
				this.setCurrentVal(application.Environments[5].key);
				break;
			case application.keys.KEY_6:
				this.setCurrentVal(application.Environments[6].key);
				break;
			case application.keys.KEY_7:
				this.setCurrentVal(application.Environments[7].key);
				break;
			case application.keys.KEY_8:
				this.setCurrentVal(application.Environments[8].key);
				break;
			case application.keys.KEY_9:
				this.setCurrentVal(application.Environments[9].key);
				break;
			case application.keys.KEY_0:
				this.setCurrentVal(application.Environments[0].key);
				break;
			default:
				break;				 
		}
	}
});
