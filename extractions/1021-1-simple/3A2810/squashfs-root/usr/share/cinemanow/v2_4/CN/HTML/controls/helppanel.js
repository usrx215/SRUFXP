//-----------------------------------------------------------------------------
// helppanel.js
// Copyright (c) 2012 - 2013, Rovi Corporation.  All rights reserved.
//-----------------------------------------------------------------------------
 
var HelpPanelControl = new Class({
	id: 'helppanel',
	persist: {},
    controls:{},
    layoutIsDirty: true,
    contentId: "helppanel",
    tpl: null,
    initialize: function(){
    	$('helppanel').hide();

		log.write('helppanel.init()');		
	    application.events.subscribe(this, 'wheelitemchanged', this.handleSettingWheelChange.bind(this));
	 
	    this.tpl = new ui.template(this.contentId, application.ui.loadTpl(this.id + ".tpl"));
		this.tpl.compile();

    },
    handleSettingWheelChange: function(payload) {
    	
    	var data = payload.args[0];
    	
    	if(data.wheelinstance == 'HelpWheelControl') {
    		log.write('Help Panel (wheel changed)');
    		log.write(data);
        	
    		//this.loadView(data.selectedvalue);
    		$$("#helppanel .panel").each(function(item) { item.hide(); });
    		log.write('selected: ' + data.selectedvalue);
    		if($(data.selectedvalue))
    		{
    			$(data.selectedvalue).show();
    		}
    
    	}
    },
    hideIfNoBaseline: function(i){
    	var val = "";
    	
    	if(!$cn.data.baselineEnable) {
    		val = "hide";
    	}
    	
    	return val;
    },
    showIfNoBaseline: function(i){
    	var val = "";
    	
    	if($cn.data.baselineEnable) {
    		val = "hide";
    	}
    	
    	return val;
    },
    hideIfNoJinni: function(i){
    	var val = "";
    	
    	if(!$cn.data.jinniEnable) {
    		val = "hide";
    	}
    	
    	return val;
    },
    showIfNoJinni: function(i){
    	var val = "";
    	
    	if($cn.data.jinniEnable) {
    		val = "hide";
    	}
    	
    	return val;
    },
    show: function() {
    	$('helppanel').show();
    	this.tpl.append({'custom': ''});
    	this.tpl.apply();
    },
    hide: function(){
    	$('helppanel').hide();
    },
    getAccountLinkUrl: function() {
        return $cn.data.AccountLinkUrl;
    },
    tm: function() {
        return '&#0153;';
    }
});
