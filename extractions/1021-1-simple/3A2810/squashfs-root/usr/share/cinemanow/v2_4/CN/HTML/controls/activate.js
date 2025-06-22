//-----------------------------------------------------------------------------
// activate.js
// Copyright (c) 2012 - 2013, Rovi Corporation.  All rights reserved.
//-----------------------------------------------------------------------------
 
var ActivatePanelObject = {
    Extends : ModalControl, 
    Implements : ModalControl, 
    id : 'activate', 
    persist : {}, 
    controls : {}, 
    layoutIsDirty : true, 
    tpl : null, 
    code : '', 
    pollTimer : null, 
    pollTimerStarted : false, 
    inPolling : false, 
    
    initialize : function() {
        log.write('activate.init()');
        this.parent('activate');
    },
    loadData : function(data, code) {
        var self = this;

        log.write("code is: " + code);
        this.parent(data);

        if(this.pollTimer == null) {
            this.pollTimer = new Timer();
            this.pollTimer.Interval = 5000;
            this.pollTimer.Tick = function() {
                if(document.getElementById('ActivateContent').style.display == "none") {
                    log.write("Activate panel is not displayed but is still polling. Stop it!");
                    self.pollTimer.Stop();
                    self.pollTimerStarted = false;
                } else {
                    // Poll for token after previous polling finishes.
                    if (self.inPolling) {
                        return;
                    }
                    
                    log.write("Polling for auth token...");
                    self.inPolling = true;                    
                    
                    $cn.methods.pollForToken(function(callback) {
                        self.inPolling = false;
                        
                        if(callback.authToken) {

                            if(callback.authToken.length > 0) {
                                /* Auth Token delivered write auth file and set necessary values. Fire authenticated event when finished. */

                                $cn.utilities.setParentalSettings(callback);

                                self.hide();
                                self.pollTimerStarted = false;
                                self.pollTimer.Stop();

                                if(BrowseView.ActivationPcView == null) {
                                    BrowseView.ActivationPcView = new ActivationPcView();
                                }
                                BrowseView.ActivationPcView.activeFromWelcome = false;
                                BrowseView.ActivationPcView.payload = self.payload;
                                BrowseView.ActivationPcView.showActivateSuccessPage();
                            }
                        }
                    });
                }
            };
        }

        this.displayCode(code);
        navigation.setFocusElement($('ModalContent').getElement('.default'));
    }, displayCode : function(code, callback) {
        var self = this;
        log.write("displayCode");
        log.write(code);
        if (code) {
            self.getCodeUpdateHtml(code, self, callback)
        } else {
            log.write("code doesn't exist. Go get a code");
            $cn.methods.getActivationString(function(res) {
                self.getCodeUpdateHtml(res, self, callback);
            });
        }
    },
    getCodeUpdateHtml: function(res, self) {
        var x;
        log.write('activation string:: ' + res);

        self.code = res;
        for(x = 0; x < res.length; x++) {
            try {
                $("Code" + x).innerHTML = res.substring(x, x + 1);
            } catch (e) {
                log.write(log.dumpObj(e));
                return;
            }
        }
        if(application.authSupported) {
            if(!self.pollTimerStarted) {
                self.pollTimerStarted = true;
                self.pollTimer.Start();
            }
        }
        $('modalcontrol').addClass('show' + res.length);
        $('ModalWindow').setAttribute('style', '');

        //Custom style handler to ensure that styles always get overridden.
        var styles = (application.resource.modalConfig['activate_show' + res.length]);

        for(style in styles) {
            $("ModalWindow").setStyle(style, styles[style]);
        }

        log.write('Modal Class: ' + $('modalcontrol').className);
        $('modalcontrol').removeClass('activate');
        $$('#ActivationFooter span.url').set("html", $cn.data.ActivationURL);
    }, 
    show : function(payload) {
        log.write("showing modal");
        //document.getElementById('ModalWindow').className = 'show7';
        this.parent();
        this.payload = payload;
        application.TempKeyBlock = false;
        application.currentView.layoutIsDirty = true;

    }, hide : function() {
        this.parent();
        $cn.data.d2dPath = false;
        log.write("Hiding activate");

        if(application.authSupported) {
            log.write("Stopping Activation timer.");
            if (this.pollTimer) {
                this.pollTimer.Stop();
                this.pollTimerStarted = false;
                this.inPolling = false;
            }
        }

        application.currentView.layoutIsDirty = true;
    }, poll : function() {
        $cn.methods.pollForToken(function(callback) {
            log.write(log.dumpObj(callback.data.result));
        });
    }, onBack : function(payload) {

        this.parent(payload);
        log.write('onBack getting called');

        //application.events.publish('authenticationcancelled', () payload);
        if(this.payload && this.payload.onCancel) {
            log.write('onBack with payload getting called');
            this.payload.onCancel.call();
        } else {
            application.events.publish('activatecancelled', {
            })
        }
    }
}, ActivatePanel = new Class(ActivatePanelObject);
