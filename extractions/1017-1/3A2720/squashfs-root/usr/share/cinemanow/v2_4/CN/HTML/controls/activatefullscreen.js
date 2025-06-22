//-----------------------------------------------------------------------------
// activatefullscreen.js
// Copyright (c) 2012 - 2013, Rovi Corporation.  All rights reserved.
//-----------------------------------------------------------------------------
 
var ActivationPcView = new Class({
    id: 'activateview',
    persist: {},
    controls:{},
    layoutIsDirty: true,
    tpl: null,
    code: '',
    pollTimer: null,
    pollTimerStarted: false,
    inPolling: false,
    activeFromWelcome:true,
    payload: null,
    focusElement:'',
    
    initialize: function(){
        log.write('activate.init()');
    },
    cancel: function(){
        $('activatefullscreen').hide();
        application.navigator.setFocus('leftbutton');
        this.pollTimer.Stop();
        this.pollTimerStarted = false;
        this.inPolling = false;
    },
    startBase: function() {
        this.loadData();
        
        if(document.getElementById('activationintro')){
        	$('activationintro').hide();
        }
        
        $('activationbody').show();
    },
    start: function(){
        this.startBase();
        application.navigator.setFocus('generatenewcodebutton');
    },
    startFirstTime: function(){
        this.startBase();
        application.navigator.setFocus('activationbodycancelbutton');
    },
    loadData: function() {
        var self = this;
        
        this.displayCode();
        
        if(this.pollTimer == null) {
            this.pollTimer = new Timer();
            this.pollTimer.Interval = 5000;
            this.pollTimer.Tick = function(){
                if(document.getElementById('ActivateContent').style.display == "none"){
                    log.write("Activate panel is not displayed but is still polling. Stop it!");
                    self.pollTimer.Stop();      
                    self.pollTimerStarted = false;
                }
                else {
                    // Poll for token after previous polling finishes.
                    if (self.inPolling) {
                        return;
                    }
                    
                    log.write("Polling for auth token...");
                    self.inPolling = true;

                    $cn.methods.pollForToken(function(callback){  
                        self.inPolling = false; 
                        
                        if(callback.authToken){     
                            
                            if(callback.authToken.length > 0) {
                                /* Auth Token delivered write auth file and set necessary values. Fire authenticated event when finished. */
                                
                                $cn.utilities.setParentalSettings(callback);
                                
                                self.pollTimerStarted = false;
                                self.pollTimer.Stop();
                                
                            	self.showActivateSuccessPage();
                            }
                        }
                    });
                }
            }; 
        }
    },
    showActivateSuccessPage: function() {
		var self = this;
		
    	if(!this.activeFromWelcome){
    		$('activatefullscreen').show();
			$('activationintro').hide();
    	}
        
    	$('activationdevicename').innerHTML = '"' + $cn.data.DeviceName + '"';
    	
    	//Reset information to avoid reactivate issue
        $('acctCredit').innerHTML = '';
        $('accountCredit').hide();
        $('accountCreditNoBilling').hide();
        $('noBilling').hide();
        
        $cn.methods.getBillingInfo(function(billingInfo){
        	if (billingInfo.giftCertificateBalance > 0) {
        	    $('acctCredit').innerHTML = application.resource.currency_symbol + $cn.utilities.formatAsMoney(billingInfo.giftCertificateBalance);
                $('accountCredit').show();
                if ( billingInfo.cCLast4 == "") {
                    $('accountCreditNoBilling').show();
                }
        	} else if (billingInfo.cCLast4 == "") {
        	    $('noBilling').show();
        	} 
        	
        	if ($cn.config.EnableUV) {
        		$('activationsuccesscontent').addClass('successuvbg');
        	} else {
        		$('uvNotifyMessage').hide();
        	}
        	$('activationbody').hide();
        	$('activationsuccess').show();
			self.focusElement = application.element.current;
        	application.navigator.setFocus('activationcontinuebutton');	
        });
    },
    displayCode: function() {
        var self = this,
            x,
            timer;
        timer = $cn.utilities.showLoadingModal(2000, "Loading Activation String...");
        application.TempKeyBlock = true;
        $cn.methods.getActivationString(function(res) {
            application.TempKeyBlock = false;
            $cn.utilities.clearLoadingSpinner(timer);
            log.write('activation string: ' + res);
            
            self.code = res;
            for(x = 0; x < res.length; x++) {
                try {
                    $("Code" + x).innerHTML = res.substring(x, x + 1);
                }
                catch (e){ 
                    log.write(log.dumpObj(e));
                    return;
                }
            }
            
            if(application.authSupported){
                if(!self.pollTimerStarted) {
                    self.pollTimerStarted = true;
                    self.pollTimer.Start();                 
                }
            }
            
        });
    },
    show: function() {
        var $intro = $('activationintro'),
            $body = $('activationbody');

        //document.getElementById('ModalWindow').className = 'show7';
        
        $('activatefullscreen').show();
        $('Code0').innerHTML = '';
        $('Code1').innerHTML = '';
        $('Code2').innerHTML = '';
        $('Code3').innerHTML = '';
        $('Code4').innerHTML = '';
        $('Code5').innerHTML = '';
        $('Code6').innerHTML = '';                      

        application.currentView.layoutIsDirty = true;

		// Substitute activation url
		$$('#activationintro .content .url').set('html', $cn.data.ActivationURL);
		$$('#activationbody span.url').set("html", $cn.data.ActivationURL);
		
        // Show and activation explanation if enabled in the tmeplates
        if($intro) {
        	$body.hide();
        	$intro.show();
        	application.navigator.setFocus('okaybuttonactivation');
        }
        else {
        	$body.show();
        	this.startFirstTime();
        }
        
    },
    hide: function(){
        log.write("Hiding activate");
        
        if(this.activeFromWelcome){        
	        if(application.authSupported) {
	            log.write("Stopping Activation timer.");
	            if(this.pollTimer){
	                this.pollTimer.Stop();
	                this.pollTimerStarted = false;
	                this.inPolling = false;
	            }
	        }
            BrowseView.WelcomeControl.hide(function() { $('activatefullscreen').hide(); });
        }
        else{
			application.element.current = this.focusElement;
            $('activatefullscreen').hide();
            application.events.publish("activated", (this.payload) ? this.payload : {
            });
			if(!this.payload){
				application.navigator.setFocus(this.focusElement);
			}
        }
        application.currentView.layoutIsDirty = true;
    },
    poll: function(){
        $cn.methods.pollForToken(function(callback){
            log.write(log.dumpObj(callback.data.result));
        });
    },
    onBack: function(payload) {
        
        this.parent(payload);
        log.write('onBack getting called');
        
        //application.events.publish('authenticationcancelled', () payload);
        if (this.payload && this.payload.onCancel) {
            log.write('onBack with payload getting called');
            this.payload.onCancel.call();
        }
        else {
            application.events.publish('activatecancelled',{})
        }
    }
});
