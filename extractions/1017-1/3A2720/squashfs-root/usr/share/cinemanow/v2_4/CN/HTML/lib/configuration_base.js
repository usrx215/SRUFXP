//-----------------------------------------------------------------------------
// configuration_base.js
// Copyright (c) 2012 - 2013, Rovi Corporation.  All rights reserved.
//-----------------------------------------------------------------------------
 
//
// Base Configuration class functions shared across implementations.
//

configuration.credentialsPath = "";
configuration.credentials_values = {};
configuration.credentials_saved_config_values = {};
configuration.credentials_loaded = false;

configuration._getPathElements = function() {
    var tmppath = this.credentialsPath.split("\\").join("/").split("/");

    for(var i=0; i<tmppath.length; i++) {
        while(tmppath[i] == "" && i < tmppath.length)
            tmppath.splice(i,1);
        //log.write("Path element " + i + ": " + tmppath[i]);
    }
    
    return tmppath;
};

configuration._parseCredentialCodes = function(element1, element2) {
    var code = element1.split("_");
    if(code.length != 2) {
        log.write("Configuration Base: _parseCredentialCodes: No _ found in second to last element!");
        return null;
    }
    
    var countryID = new Number(code[0]);
    var regionID = new String(code[1]);
    
    //We treat regionID as String
    if(isNaN(countryID)) { 
        log.write("Configuration Base: _parseCredentialCodes: CID: " + countryID + "   RID: " + regionID + "   One is not a number, so erroring");
        return null;
    }
    
    var themecode = "";
    if(element2) {
        themecode = element2.slice(0, element2.indexOf("configuration"));
    }

    //log.write("Configuration Base: _parseCredentialCodes: CID: " + countryID + "   RID: " + regionID + "   theme: " + themecode);
    
    return {cid: countryID, rid: regionID, theme: themecode};
};

configuration.getCredentialsCountryID = function() {
    if(this.credentialsPath != undefined && this.credentialsPath != "") {
        //log.write("Configuration Base: getCredentialsCountryID: parsing: " + this.credentialsPath);
        
        var elements = this._getPathElements();
        var ret = this._parseCredentialCodes(elements[elements.length - 2]);

        if(ret) {
            return ret.cid;
        }
        else {
            return -1;
        }
    }
    else {
        log.write("Configuration Base: getCredentialsCountryID: no credentialsPath set");
        return -1;
    }
};

configuration.changeCredentials = function(cid, rid) {
    var existence = true;
    
    if(this.credentialsPath != undefined && this.credentialsPath != "") {
        var elements = this._getPathElements();

        if(elements) {
            var codes = this._parseCredentialCodes(elements[elements.length - 2]);

            if(codes) {
                if(!cid) cid = codes.cid;
                if(!rid) rid = codes.rid;
                
                if(codes.cid != cid || codes.rid != rid) {
                    log.write("Configuration Base: changeCredentials: from: " + this.credentialsPath);
                    
                    var newelement = cid.toString() + "_";
                    newelement += rid.toString();
                    
                    elements[elements.length - 2] = newelement;
                    
                    var newcredentialspath = elements.join("/");
                    
                    log.write("Configuration Base: changeCredentials: to: " + newcredentialspath);
                    
                    // Try load
                    if(this.checkCredentialsFile(newcredentialspath)) {
                        // Test load is good, do it for real
                        this.credentialsPath = newcredentialspath;
                        this.loadCredentialsFile();
                    }
                    else {
                    	existence = false;
                        log.write("Configuration Base: changeCredentials: Could not load new credentials file (" + newcredentialspath + ")");
                    }
                }
            }
        }
    }
    
    return existence;
};

configuration.checkCredentialsFile = function(credentialsPath) {
    log.write("Configuration Base: checkCredentialsFile: " + credentialsPath);
    try {
        var xml = XML.rootFromFileSync(credentialsPath);
        if(xml) {
            //XML.dumpDOM(xml);
            var nodes = xml.getElementsByTagName("Value");
            var key = nodes[0].attributes.getNamedItem("Key").nodeValue;
            if(key == "XMLVersion") {
                var val = new Number($cn.utilities.getNodeText(nodes[0]));
                if(!isNaN(val) && val >= 2.0) {
                    log.write("Configuration Base: checkCredentialsFile: Success.");
                    return true;
                }
            }
        }
    } catch(e) {
        log.write("Configuration Base: checkCredentialsFile: load exception! " + e)
    }
    
    log.write("Configuration Base: checkCredentialsFile: failed!");
    return false;
};

configuration.loadCredentialsFile = function() {
    if(this.credentialsPath != undefined && this.credentialsPath != "") {
        log.write("Configuration Base: loading credential file: " + this.credentialsPath);
        var xml = XML.rootFromFileSync(this.credentialsPath);

        if(xml) {
            //XML.dumpDOM(xml);
            var nodes = xml.getElementsByTagName("Value");

            for(var i=0; i<nodes.length; i++) {
                var key = nodes[i].attributes.getNamedItem("Key").nodeValue;
                var val = $cn.utilities.getNodeText(nodes[i]);

                // Type recognition and conversion
                if(!isNaN(new Number(val))) {
                    val = new Number(val);
                } else if(val.toLowerCase() === "true" || val.toLowerCase() === "false") {
                    val = ((val.toLowerCase() === "true") ? true : false);
                }
                
                if(i == 0) {
                    if(key == "XMLVersion" && val >= 2.0) {
                        log.write("Credential file in spec (version " + val + ")");
                        
                        if(this.credentials_loaded) {
                            // restore prior config values
                            for(oldkey in this.credentials_saved_config_values) {
                                log.write("Configuration base: restoring prior $cn.config[" + oldkey + "] from: " + $cn.config[oldkey] + ", to be: " + this.credentials_saved_config_values[oldkey]);
                                $cn.config[oldkey] = this.credentials_saved_config_values[oldkey];
                            }
                            
                            this.credentials_saved_config_values = {};
                            this.credentials_values = {};
                        }
                        
                        this.credentials_loaded = true;
                        continue;
                    }
                    else {
                        log.write("credential file not in spec");
                        break;
                        throw(-1);
                    }
                }
                
                //log.write("configuration_base.loadCredentialsFile: node " + i + ": " + key + " : " + val);
                this.credentials_values[key] = val;
                
                if($cn.config[key] && ($cn.config[key] != val)) {
                    log.write("Configuration Base: overwriting $cn.config[" + key + "] from: " + $cn.config[key] + ", to be: " + val);
                    this.credentials_saved_config_values[key] = $cn.config[key];
                    $cn.config[key] = val;
                }
            }
        }
    }
};

configuration.loadConfigFile = function(configPath) {
    log.write("Configuration Base: Loading config file: " + configPath);
    var xml = XML.rootFromFileSync(configPath);

    if (xml) {
        var nodes = xml.childNodes[0].childNodes;

        for (var i = 0;i < nodes.length;i++) {
            if (nodes[i].nodeName.toLowerCase() == "ver" && (this.version == "" || this.version == undefined)) {
                this.version = $cn.utilities.getNodeText(nodes[i]);
            }
            else if(nodes[i].nodeName.toLowerCase() == "build" && (this.build == "" || this.build == undefined)) {
                this.build = $cn.utilities.getNodeText(nodes[i]);
            }
        }
    }
};

configuration.setCredentialsFile = function(credentialsPath) {
	if (credentialsPath)
		configuration.credentialsPath = credentialsPath;
};

//To get Prefixed SettingKey by given keyname.
configuration.getPrefixedSettingKey = function(keyname) {
	return configuration.getCredentialsCountryID() + '_' + keyname;
};
