//-----------------------------------------------------------------------------
// Notifications.js
// Copyright (c) 2012 - 2013, Rovi Corporation.  All rights reserved.
//-----------------------------------------------------------------------------
 
//
// Nofications.js
//
// Manage notifications to and from SDK
//

var Notifications = {
    callbacks: [],
    initialized: false,
    initialize: function() {
        var self = this;
        if("WebSocketManager" in window) {
            WebSocketManager.addHandler("Notification", this,
                function(xmldom) {
                    // Notification (from Host App) handler
                    // Parse and see if we have a callback registered for the notice.
                    log.write("Notifications: websocketmanager notice: dom: " + XML.toString(xmldom));
                    
                    for(var index = 0; index < self.callbacks.length; index++) {
                        var cb = self.callbacks[index];
                        log.write("Notifications: websocketmanager notice: cb object token: " + cb.token);
                        
                        var nodes = xmldom.getElementsByTagName(cb.token);
                        if(nodes.length == 1) {
                            // Pass node to callback
                            log.write("Notifications: websocketmanager notice: sending token node [" + cb.token + "] to handler");
                            cb.callback.call(cb.context, nodes[0]);
                        }
                    }
                }
            );
            this.initialized = true;
        }
    },
    registerCallback: function(token, context, callback) {
        if(!this.initialized) {
            this.initialize();
            if(!this.initialized)
                return;
        }
        
        log.write("Notifications.registerCallback: token: " + token);
        this.callbacks.push({token: token, context: context, callback: callback});
    },
    sendNotification: function(message) {
        // Send a notification to Host App
        if("WebSocketManager" in window) {
            var request = "<RNONotificationCall>$$REQUESTID$$<Notification>" + message + "</Notification></RNONotificationCall>";
            WebSocketManager.send(request, this, 
                function(response) {
                    log.write("Notifications.sendNotification: response: " + response);
                }
            );
        }
    }
};
