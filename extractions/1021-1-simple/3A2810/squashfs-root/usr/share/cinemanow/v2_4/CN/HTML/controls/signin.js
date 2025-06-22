//-----------------------------------------------------------------------------
// signin.js
// Copyright (c) 2012 - 2013, Rovi Corporation.  All rights reserved.
//-----------------------------------------------------------------------------
 
/**
 * @author tmchattie
 */
var SignInControl = new Class({
	id: 'signincontrol',
	persist: {},
    controls:{},
    buttons:[],
    layoutIsDirty: true,
	_data: [],
    tpl: null,
    lastFocus: null,
	firstFocus: null,
	contentControlId: '',
    contentId: 'merchcontrol',
    /*
     * Modes: activate, accountfeature, validateuser, checkout		
     */
    initialize: function(id, newContentId){
    	
    	
		this.id = id;
		var mode = id;
		
		if(id == "accountfeature" || id == "checkout"){
			mode = "activate";
		}
	
		this.tpl = new ui.template(newContentId, application.ui.loadTpl("signin_" + mode + ".tpl"));
		this.tpl.compile();
		
    },
    init: function(params, direction){
		log.write('signincontrol.init()');		
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
		$('dock').hide();
		$('wheel').hide();
		$('gridview').hide();
		
		$("signin").show();
		
		application.events.subscribe(this, "loadforgotpassword", this.forgotpassword.bind(this));
		
		if(application.element.current != null && application.element.current != '' && document.getElementById(application.element.current)) {
			this.lastFocus = application.element.current;			
		}
	
		var msg = '',
			c = '';
		
		if(this.id == "accountfeature") {
			msg = 'You need to activate this device to use this feature.';
		}
		else if(this.id == "checkout"){
			msg = 'You need to activate this device to make purchases.';
		}
		else {
			c = 'hide';
		}
		this.tpl.empty();
		
		
		this.tpl.append({message: msg, className: c});
		this.tpl.apply();
		
		navigation.setFocus('SignInUserName');
		
	},
	signin: function(){
		alert('signin');
	},
	forgotpassword: function(payload){
		alert('forgotpassword');
	},
	createaccount: function(payload){
		alert('create account');
	},
	activate: function(payload){
		alert('activate');
	},
	hide: function(){
		//application.events.unsubscribe(this, "loadforgotpassword");
	},
	onBack: function(payload) {
		if (payload)
			payload.preventDefault();
		
	}
});
