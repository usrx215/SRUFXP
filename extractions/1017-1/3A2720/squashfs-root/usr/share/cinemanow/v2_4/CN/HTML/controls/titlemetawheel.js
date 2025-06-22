//-----------------------------------------------------------------------------
// titlemetawheel.js
// Copyright (c) 2012 - 2013, Rovi Corporation.  All rights reserved.
//-----------------------------------------------------------------------------
 
/**
 * @author tjmchattie
 */
var TitleMetaWheelControl = new Class({
	Extends: WheelControl,
	Implements: WheelControl,
	id: 'TitleMetaWheelControl',
	MetaData: [],
	handleWheelItemChange: function(payload){		
		log.write(payload);
		
		if(payload.context === ActiveWheel) {
			var p = payload.args[0];
			log.write("Title Wheel Item changed. Now fire custom method. " + payload.args[0].wheelinstance);
			/*
			 * If the source is the master column then load the slave wheel with
			 * the child elements from the new selection
			 */
			if(p.sourceid.indexOf('master') > -1) {
				$('slavedatasource').getElements('div').destroy();
				payload.context.loadSlaveDataSource(p.selectedvalue);
			}
			else if(p.sourceid.indexOf('slave') > -1){
				log.write('The slave wheel item has changed. Update results.');
				var methodArgs = payload.args[0].selectedvalue.split('|');
				this.loadSlaveGrid(methodArgs[0], methodArgs[1]);
				
			}
		}
	},
	loadSlaveGrid: function(method, filter){
		var data = this.MetaData[method];
		
		switch(method){
		
			case "m_cast_bios":
				data.each(function(item){
					if(item.castID == filter){
						BrowseView.LastGridProcess = "bios";
						item.bio = item.bio.firstWithEllips(4500); 
						application.events.publish('loadgrid', {grid: 'biogrid', gridProcess: 'bios', data: [item], columns: 1});
					}
				});						
				break;
			case "r_user_revs":
			case "r_critics":
				log.write(method + ":" + filter);
				data.each(function(item){
					if(item.reviewer == filter){
						var template = "reviewgrid";
						if(method == "r_user_revs")
						{
							template = "userreviewgrid";
						}
						BrowseView.LastGridProcess = "reviews";
						application.events.publish('loadgrid', {grid: 'reviewgrid', gridProcess: 'reviews', data: [item], columns: 1, template: template});
					}
				});						
				break;
			case "m_cast_crew":
				break;
			case "m_credits":
				var actor = [],
				    production = [],
                    keyString,
                    found;
				if(data)
				{
									
					if(filter == "0")
					{
						keyString = "";
						data.castMetaValues.each(function(item){
							if(item && item.keyName != '' && item.keyValue != '')
								keyString = keyString + "<p>"+item.keyName + " (" + item.keyValue + ")</p>";
							else if(item && item.keyName != '') 
								keyString = keyString + "<p>"+item.keyName + "</p>";
						});
						
						actor.push({keyName: "Actors", keyValue: keyString});
						actor.push({keyName:'', keyValue: "FBI Anti-piracy Warning: Unauthorized copying is punishable under Federal Law.<br />"});
						BrowseView.LastGridProcess = "credits";
						application.events.publish('loadgrid', {grid: 'creditsgrid', gridProcess: 'credits', data: actor, columns: 1, template: 'creditsgrid'});
					}
					else
					{
						keyString = "";
						data.productionMetaValues.each(function(item){
							found = false;
							production.each(function(prod)
							{
								if(prod.keyName == item.keyName)
								{
									prod.keyValue = prod.keyValue + item.keyValue + "<br />";
									found = true;
									
								}
							});
							if(!found)
							{
								production.push({keyName: item.keyName, keyValue: item.keyValue + "<br />"});
							}
						});
						
						production.push({keyName:'', keyValue: "FBI Anti-piracy Warning: Unauthorized copying is punishable under Federal Law.<br />"});
						BrowseView.LastGridProcess = "production";
						application.events.publish('loadgrid', {grid: 'creditsgrid', gridProcess: "production", data: production, columns: 1, template: 'creditsgrid'});
					}
				}
				break;
			case "m_technical_details":
				if(data)
				{
					var techDetails = [];
					data.technicalDetailItems.each(function(item){
						if(item.videoRecordingFormat == filter || item.name == filter)
						{
							techDetails.push(item);
						}
					});
					
					if(techDetails)
					{
						BrowseView.LastGridProcess = "tech";
						application.events.publish('loadgrid', {grid: 'techgrid', gridProcess: 'tech', data: techDetails, columns: 1, template: 'techgrid'});

						if(!techDetails[0] && !techDetails[0].audioFormat)
						{
							$('audioTech').hide();
						}
                        if(techDetails[0].name == "UltraViolet"){
                            $('uv-technical-details').removeClass('hidden');
                            if(techDetails[0].streaming){
                                $('tech-streaming').show();
                            }
                            if(techDetails[0].downloads){
                                $('tech-downloads').show();
                            }
                        }
                        else {
                            $('videoTech').removeClass('hidden');
                            $('audioTech').removeClass('hidden');
                        }
					}
				}
				break;
			default:
				break;
		}
	},
	isSpecialAudio: function(Encoding){
		
		var val = "hidden";
		log.write(Encoding);
		$cn.config.HackedDtsTitles.each(function(titleID){
			if(BrowseView.CurrentTitleID == titleID && Encoding == "1080p") {
				val = 'visible';
			}
		});
		
		return val;
	},
	loadSlaveDataSource: function(masterKey){
		log.write("masterKey: " + masterKey);
		var self = this;
		var isLoaded = false;
		
		if(this._slaveSource[this._masterSource[masterKey]]){
			this._renderWheel($('slavedatasource'), this._slaveSource[masterKey]);
		}
		else {
			var isSimilar = (masterKey.indexOf("s_") == 0),
                isReview = (masterKey.indexOf("r_") == 0),
			    isMethod = (masterKey.indexOf("m_") == 0),
			    gridFilter = null,
                idx;
			
			if(isSimilar){
				/*
				 * Similar types can be dynamically passed in as they all use
				 * the same method.
				 */
				log.write("Load Similar sub-sections. Right now only option is \"ALL\"");
				if(masterKey.indexOf('s_') == 0) {
					application.events.publish('gridloading', {grid: 'titlegrid', message: "loadinggeneric", cssClass: "meta"});
					
					$cn.methods.getBrowseListBySimilar(masterKey, BrowseView.CurrentTitleID, 1, 0, function(callback){
						self._slaveSource[masterKey] = [];
						self._slaveSource[masterKey].push({
								name: "All",
								iD: "All",
								parentID: 0
						});	
						isLoaded = true;

						self.loadSlave(masterKey, gridFilter);
						BrowseView.LastGridProcess = "similarAll";
						application.events.publish('loadgrid', {grid: 'titlegrid', gridProcess: 'similarAll', data: callback, columns: 2});
					});
				}
				
				isLoaded = true;
			}
			else if(isReview){
				/*
				 * Reviews have 2 different input params but their method is
				 * always the same.
				 */
				var filter = 'Undefined';
				if(masterKey.indexOf("critics") > 0) {
					filter = 'CritictsReview';
				}
				else if(masterKey.indexOf("user") > 0) {
					filter = 'UserReview';
				}
				
				application.events.publish('gridloading', {grid: 'reviewgrid'});
				$cn.methods.getReviews(BrowseView.CurrentTitleID, filter, function(callback){
					self.MetaData[masterKey] = callback.reviews;					
					self._slaveSource[masterKey] = [];
					
					callback.reviews.each(function(item){
						self._slaveSource[masterKey].push({
							name: self.split(item.reviewer),
							iD: masterKey + "|" + item.reviewer,
							parentID: 0
						});	
						isLoaded = true;

					});
					
					//Sort slave wheel items according to Reviewer's ascending alphabetical surname.
					var i, j;
					for(i = 0; i < self._slaveSource[masterKey].length; i++) {
						for(j = 0; j < self._slaveSource[masterKey].length; j++) {
							if(self._slaveSource[masterKey][i].name.toLowerCase() < self._slaveSource[masterKey][j].name.toLowerCase()) {
								var slaveSource = self._slaveSource[masterKey][i];
								self._slaveSource[masterKey][i] = self._slaveSource[masterKey][j];
								self._slaveSource[masterKey][j] = slaveSource;
							} 
						}
					}
					
					if(callback.reviews.length > 0) {
						gridFilter = callback.reviews[0].reviewer;
					}
					else {
						isLoaded = true;
					}
					self.loadSlave(masterKey, gridFilter);
				});
			}
			else if(isMethod){
				switch(masterKey){
					case "m_cast_bios":
						application.events.publish('gridloading', {grid: 'biogrid'});
						$cn.methods.getCastBios(BrowseView.CurrentTitleID, function(callback){
							self.MetaData[masterKey] = callback.castMembers;
							self._slaveSource[masterKey] = [];
							
							callback.castMembers.each(function(item){
								
								self._slaveSource[masterKey].push({
									name: self.split(item.name),
									subtext: item.role,
									iD: masterKey + "|" + item.castID,
									parentID: 0
								});	
								isLoaded = true;

							});
							
							if(callback.castMembers.length > 0) {
								gridFilter = callback.castMembers[0].castID;
							}

							self.loadSlave(masterKey, gridFilter);
						});
						break;
					case "m_images":
						application.events.publish('gridloading', {grid: 'titlegrid', message: "loadinggeneric"});
						
						$cn.methods.getImages(BrowseView.CurrentTitleID, function(callback){
							self.MetaData[masterKey] = [];
							idx = 0;
							callback.images.each(function(image){
								self.MetaData[masterKey].push({
									imageURL: image.imageURL,
									idx: idx
								});
								idx++;
							});
							self._slaveSource[masterKey] = [];
							self._slaveSource[masterKey].push({
									name: "All",
									iD: "All",
									parentID: 0
							});	
							isLoaded = true;

							self.loadSlave(masterKey, gridFilter);
							BrowseView.loadImagePopup(callback.images);
							BrowseView.LastGridProcess = "images";
							application.events.publish('loadgrid', {grid: 'imagegrid', gridProcess: 'images', data: self.MetaData[masterKey], columns: 1});
						});
						break;
					case "m_cast_crew":
						$cn.methods.getCastAndCrew(BrowseView.CurrentTitleID, function(callback){
							self.MetaData[masterKey] = callback.castMembers;
							self._slaveSource[masterKey] = [];
							
							callback.castMembers.each(function(item){
								
								self._slaveSource[masterKey].push({
									name: item.name,
									subtext: item.role,
									iD: masterKey + "|" + item.castID,
									parentID: 0
								});	
							});

							self.loadSlave(masterKey, gridFilter);
						});
						break;
					case "m_credits":
						application.events.publish('gridloading', {grid: 'creditsgrid'});
						$cn.methods.getCredits(BrowseView.CurrentTitleID, function(callback){
							
							var startingVal = -1;
							self.MetaData[masterKey] = callback;
							self._slaveSource[masterKey] = [];
							
							//If there are any cast values add it to the wheel
							if(callback.castMetaValues.length > 0){
								self._slaveSource[masterKey].push({
									name: "Cast",
									iD: masterKey + "|0",
									parentID: 0
								});
								startingVal = 0;
							}
							
							//If there are any production values add it to the wheel
							if(callback.productionMetaValues.length > 0){
								self._slaveSource[masterKey].push({
									name: "Production",
									iD: masterKey + "|1",
									parentID: 0
								});		
								
								startingVal = (startingVal == -1) ? 1 : 0;
							}
								
							self.loadSlave(masterKey, gridFilter);
								
							self.loadSlaveGrid("m_credits", startingVal);
								// application.events.publish('loadgrid', {grid:
								// 'creditsgrid', data: data, columns: 1,
								// template: 'creditsgrid'});
						
						});
						break;
					case "m_technical_details":
						application.events.publish('gridloading', {grid: 'techgrid'});
						$cn.methods.getTechnicalDetails(BrowseView.CurrentTitleID, function(callback){
							self._slaveSource[masterKey] = [];
							self.MetaData[masterKey] = callback;
							callback.technicalDetailItems.each(function(item){
                                if(item.name == "UltraViolet"){
                                    if($cn.config.EnableUV === true){
                                        self._slaveSource[masterKey].push({
                                            name: item.name.replace(' ', '<br />'),
                                            iD: masterKey + "|" + item.name,
                                            parentID: 0
                                        });
                                    } else {
                                        // Do not add UV wheel item if uv not enabled
                                    }
                                } else {
                                    self._slaveSource[masterKey].push({
                                        name: item.name.replace(' ', '<br />'),
                                        iD: masterKey + "|" + item.videoRecordingFormat,
                                        parentID: 0
                                    });
                                }
							});

							self.loadSlave(masterKey, gridFilter);
							self.loadSlaveGrid("m_technical_details", callback.technicalDetailItems[0].videoRecordingFormat);
						});
						break;
					default:
						break;
				}
			}
		}
		
		
	},
	loadSlave: function(masterKey,gridFilter) {
		this._renderWheel($('slavedatasource'), this._slaveSource[masterKey]);
		
		if(gridFilter) {
			this.loadSlaveGrid(masterKey, gridFilter);
		}
		else {
			log.write('error: there are no slave wheel items for this content');
			BrowseView.LastGridProcess = "emptylist";
			application.events.publish('loadgrid', {grid: 'reviewgrid', gridProcess: "emptylist", data: [], columns: 1, template: 'reviewgrid'});
		}
	},
	loadData: function(masterCollection, title) {
		var self = this;
		var masterKey = '';
		this.layoutIsDirty = true;
		this.saveHistory();
		this.cleanUI();
		
		this._masterSource = [];
		this._slaveSource = [];

		log.write('Current Title:');
		log.write(title);
		
		log.write('Current Collection');
		log.write(masterCollection);
		
		//If baselineEnable or flixsterEnable is not enable remove the data if server returns.
		if (!$cn.data.baselineEnable) {
		    masterCollection.erase('m_credits');
		    masterCollection.erase('m_cast_bios');
		    masterCollection.erase('m_cast_crew');
		}
		if (!$cn.data.flixsterEnable) {
	        masterCollection.erase('r_critics');
	        masterCollection.erase('r_user_revs');
	        masterCollection.erase('m_technical_details');
		}
        //Disable EnableTechnicalDetails Wheel Option by the config value.
        if (!configuration.readValue('EnableTechnicalDetailsWheelOption')) {
            masterCollection.erase('m_technical_details');
        }
		    
		masterCollection.each(function(item){
			if(masterKey == '') {
				masterKey = item;
			}
			
			// similar item
			if(item.indexOf("s_") == 0) {
				self._masterSource[self._masterSource.length] = {
						name: application.resource.td_similar[item],
						iD: item,
						parentID: 0
				};	
				
				self._slaveSource[item] = [];
				self._slaveSource[item].push({
						name: "All",
						iD: "all",
						parentID: item
				});	
			}
			
			// more info item
			if(item.indexOf("m_") == 0) {
				self._masterSource[self._masterSource.length] = {
						name: application.resource.td_moreinfo[item],
						iD: item,
						parentID: 0
				};
			}
			
			// review item
			if(item.indexOf("r_") == 0) {
				self._masterSource[self._masterSource.length] = {
						name: application.resource.td_reviews[item],
						iD: item,
						parentID: 0
				};
			}
			
		});
		
		if(this._masterSource.length > 0) {			
			this._renderWheel($('masterdatasource'), this._masterSource);			
			this.loadSlaveDataSource(masterKey);			
		}
		
	},
	navigate: function(payload){
		
		var p = payload.args[0];
		
		if(payload.context === ActiveWheel) {
			if ((p.current == "selectedmaster")){
				if(p.direction == "left"){
					payload.preventDefault();
					BrowseView.expandTitleDetails();
					BrowseView.TitleViewControl.enableButtons();
					navigation.setFocus("tdbuttonMoreInfo");
				}
				else {
					//Block right action if wheel is animating
					if (p.direction == "right" && (this.isNavigating || !BrowseView.CurrentProcessLoaded)) {
						payload.preventDefault();
					}
					else {
						this.parent(payload);
					}
				}
			}
			else if (p.current == "selectedslave")
			{
				if(p.direction == "right" && $('imagegrid').getStyle('display') == "block"){
					navigation.setFocus($("imagegrid").getElement('a').id);
				}
				else
				{
					this.parent(payload);
				}
			}
			else {
				this.parent(payload);
			}
		}
	}
});
