//-----------------------------------------------------------------------------
// settingswheel.js
// Copyright (c) 2012 - 2013, Rovi Corporation.  All rights reserved.
//-----------------------------------------------------------------------------
 
/**
 * @author tjmchattie
 */
var SettingsWheelControl = new Class({
	Extends: WheelControl,
	Implements: WheelControl,
	id: 'SettingsWheelControl',
	initialize: function(params){
		this.parent();		
	},
	loadSettingsMenu: function(initialSelection) {
		var master = []; 
		master.push({
			name: application.resource.SettingsWheelOptionStrings.General,
			iD: "General",
			parentID: 0
		});
		
		// Only show wheel item if there are 2 or more audio types. Since stereo is always supported 
		// if the $cn.data.AllowedAudioProfiles is greater than 0 then we show the wheel item. 
		if($cn.data.AllowedAudioProfiles && $cn.data.AllowedAudioProfiles.length > 0) {
			master.push({
				name: application.resource.SettingsWheelOptionStrings.Audio,
				iD: "Audio",
				parentID: 0
			});
		}
		
		master.push({
			name: application.resource.SettingsWheelOptionStrings.Family,
			iD: "Family",
			parentID: 0
		});
		
		if(application.debugMode){
			master.push({
				name: application.resource.SettingsWheelOptionStrings.Debug,
				iD: "Debug",
				parentID: 0
			});	
		}
//[Removing since cannot get WS changed]		
//		if($cn.data.EnableAccountLink) {
//			master.push({
//				name: application.resource.SettingsWheelOptionStrings.Library,
//				iD: "Library",
//				parentID: 0
//			});
//		}


		var generalOptions = [];
		
		generalOptions.push({
			name: application.resource.SettingsWheelOptionStrings.Activate,
			iD: "Activate",
			parentID: "General"
		});	
		
		if($cn.config.EnableGiftCertificates) {
			generalOptions.push({
				name: application.resource.SettingsWheelOptionStrings.GiftCards,
				iD: "GiftCards",
				parentID: "General"
			});
		}

        if($cn.config.EnableUV) {
            generalOptions.push({
                name: application.resource.SettingsWheelOptionStrings.UV,
                iD: "UV",
                parentID: "General"
            });
        }
		
		generalOptions.push({
			name: application.resource.SettingsWheelOptionStrings.About,
			iD: "About",
			parentID: "General"
		});
		
		if($cn.config.EnableSystemStatus) {
			generalOptions.push({
				name: application.resource.SettingsWheelOptionStrings.SystemStatus,
				iD: "SystemStatus",
				parentID: "General"
			});
		}
		
		var slaveData = {General: generalOptions, Audio: [{
				name: application.resource.SettingsWheelOptionStrings.Format,
				iD: "Format",
				parentID: "Audio"
			}],Family: [{
				name: application.resource.SettingsWheelOptionStrings.Parental,
				iD: "Parental",
				parentID: "Family"
			},{
				name: application.resource.SettingsWheelOptionStrings.RequirePIN,
				iD: "RequirePIN",
				parentID: "Family"
			}],Library: [{
				name: application.resource.SettingsWheelOptionStrings.RoxioNow,
				iD: "RoxioNow",
				parentID: "Library"
			}]};
			
			if(application.debugMode){
				slaveData.Debug = [];
				
				slaveData.Debug.push({
					name: application.resource.SettingsWheelOptionStrings.DeviceInfo,
					iD: "DeviceInfo",
					parentID: "Debug"
				});	
				slaveData.Debug.push({
					name: application.resource.SettingsWheelOptionStrings.ChangeEnvironment,
					iD: "ChangeEnvironment",
					parentID: "Debug"
				});	
				slaveData.Debug.push({
					name: application.resource.SettingsWheelOptionStrings.ConfigurationValues,
					iD: "ConfigurationValues",
					parentID: "Debug"
				});	
				slaveData.Debug.push({
					name: application.resource.SettingsWheelOptionStrings.AudioSupport,
					iD: "AudioSupport",
					parentID: "Debug"
				});	
			}
			
		this.loadData(master, slaveData, initialSelection);
	},
	loadData: function(masterCollection, slaveCollection, startingPos) {
		
		this.cleanUI();
		this._masterSource = masterCollection;
		this._slaveSource = slaveCollection;		
		this.wheelChangedTimeout = 200; //We can set a custom timeout for each wheel. Some require more time than others.
		
		if(masterCollection.length > 0) {
			this._renderWheel($(this.masterSourceElement), this._masterSource, (startingPos) ? startingPos : 0);
		}		
	},
	navigate: function(payload){
		this.parent(payload);
		
		if(BrowseView.DockControl.selection == "dock-settings") {
			if((application.element.current && application.element.current != '') && document.getElementById(application.element.current)  && application.element.current == "selectedmaster"){
				if(payload.args[0].direction == "left"){
					payload.preventDefault();
					application.navigator.setFocus("dock-settings");
				}
				else if(payload.args[0].direction == "right"){
					payload.preventDefault();
					application.navigator.setFocus("selectedslave");					
				}
			}
			else if((application.element.current && application.element.current != '') && document.getElementById(application.element.current)  && application.element.current == "selectedslave") {
				if(payload.args[0].direction == "right"){
					//Set up the focus to always select the first button on the pane
					if(BrowseView.SettingsPanel.activePanelId) {
						payload.preventDefault();					
					
						if (!this.isNavigating && !BrowseView.SettingsPanel.isProcessing) {
							var anchors = document.getElementById(BrowseView.SettingsPanel.activePanelId).getElementsByTagName('a');
							
							if(anchors.length > 0) {
								var isSet = false;
								var idx = 0;
								
								while(!isSet) {
									if(anchors[idx]) {
										if(document.getElementById(anchors[idx].id).offsetWidth != 0 && document.getElementById(anchors[idx].id).offsetHeight != 0) {
											application.navigator.setFocus(anchors[idx].id);
											//alert(anchors[idx].id);
											isSet = true;
										}
										idx++;
									}
									else { isSet = true; } 
								}
							}	
						}
					}
				}
				else if(payload.args[0].direction == "down"){
					if(BrowseView.SettingsPanel.activePanelId) {
						if(BrowseView.SettingsPanel.isProcessing){
							payload.preventDefault();
						}
					}
				}
			}
		}
		
	}
});
