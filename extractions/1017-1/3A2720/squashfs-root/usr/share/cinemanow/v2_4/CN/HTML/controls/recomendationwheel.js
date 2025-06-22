//-----------------------------------------------------------------------------
// recommendationwheel.js
// Copyright (c) 2012 - 2013, Rovi Corporation.  All rights reserved.
//-----------------------------------------------------------------------------
 
/**
 * @author tjmchattie
 */
var RecomendationWheelControl = new Class({
	Extends: WheelControl,
	Implements: WheelControl,
	id: 'RecomendationWheelControl',
	returnFocus: null,
	titleID: null,
	MetaData: [],
	dataLoaded: false,
	masterIdx: 0,
	slaveIdx: 0,
	activate: function(){
		this.parent();
		this.returnFocus = application.element.current;
	},
	handleWheelItemChange: function(payload){		
		log.write(payload);
		
		if(payload.context === ActiveWheel && payload.args[0]) {
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
				var methodArgs = payload.args[0].selectedvalue.split("|");
				this.masterIdx = methodArgs[0];
				this.slaveIdx = methodArgs[1];
				
				this.loadSlaveGrid(methodArgs[0], methodArgs[1]);
				
			}
		}
	},
	loadSlaveGrid: function(method, filter){
		var isSimilar = (method.indexOf("s_") > -1);
		var pageNum = 1; //This needs to be able to go to unlimited.
		var self = this;
		
		if(isSimilar) {
			
			application.events.publish('gridloading', {grid: 'titlegrid', message: "loading",columns: 2, className: "similar"});
			BrowseView.LastGridProcess = "similar";
			$cn.methods.getBrowseListByGeneWithSimilarBy(filter, this.titleID, pageNum, function(callback){
				self.dataLoaded = true;
				BrowseView.CurrentProcessLoaded = true;
				application.events.publish('loadgrid', {grid: 'titlegrid', data: callback.data.result.items, columns: 2, altMessage: '', gridProcess: "similar", className: "similar", template: "similarlist"});
			});
		}
		else {			
			if(method == "m_cast_crew") {
				application.events.publish('gridloading', {grid: 'titlegrid', message: "loading",columns: 2, className: "similar"});
				BrowseView.LastGridProcess = "similar";
				$cn.methods.getBrowseListByCast(filter, pageNum, function(callback){
					self.dataLoaded= true;
					BrowseView.CurrentProcessLoaded = true;
					application.events.publish('loadgrid', {grid: 'titlegrid', data: callback.data.result.items, columns: 2, altMessage: '', gridProcess: "similar", className: "similar", template: "similarlist"});
				});	
			}
		}
	},
	loadSlaveDataSource: function(masterKey){
		var self = this;
		var isMethod = (masterKey.indexOf("m_") == 0);
		var isSimilar = (masterKey.indexOf("s_") == 0);

		if(this._slaveSource[masterKey]){
			application.events.publish("recommendeddataloaded");
			
			this._renderWheel($('slavedatasource'), this._slaveSource[masterKey]);
			if(isSimilar || isMethod) {
				var methodArgs = this._slaveSource[masterKey][0].iD.split('|');
				this.masterIdx = masterKey;
				this.slaveIdx = methodArgs[1];
				this.loadSlaveGrid(masterKey, methodArgs[1]);
			}
		}
		else {
			
			if(isMethod){
				switch(masterKey){
					case "m_cast_crew":
						$cn.methods.getCastAndCrew(this.titleID, function(callback){
							self.MetaData[masterKey] = callback.castMembers;
							self._slaveSource[masterKey] = [];
							
							callback.castMembers.each(function(item){
								self._slaveSource[masterKey].push({
									name: self.split(item.name),
									iD: masterKey + "|" + item.castID,
									parentID: 0
								});	
								
							});
							
							//Render will with results
							self._renderWheel($('slavedatasource'), self._slaveSource[masterKey]);
							
							//Load the first grid items
							var methodArgs = self._slaveSource[masterKey][0].iD.split('|');
							application.events.publish("recommendeddataloaded");
							
							self.loadSlaveGrid(masterKey, methodArgs[1]);
						});
						break;
					default:
						break;
				}
			}
		}
		
		
	},
	loadSlave: function(masterKey,gridFilter) {
		
		if(gridFilter) {
			this.loadSlaveGrid(masterKey, gridFilter);
		}
		else {
			this.loadSlaveGrid(masterKey, this._slaveSource[masterKey][0].iD.split('|')[1]);
		}
	},
	
	loadData: function(titleID, callback) {
		var self = this;

		$cn.methods.getGenesByWheelOptionPlural(titleID, function(res) {
            var x,
                y;
			log.write("recommendationswheel.loadData Debug: BrowseView.currentState: " + BrowseView.currentState);
			
			// If we go in there when this gets called title view is still active
			if((BrowseView.currentState == "titleview_wheel" || BrowseView.currentState == "titleview") && 
				res && (res.responseCode == 0 || res.responseCode == 22) && res.wheelOptions) {
		
				var masterKey = '';
				
				self.saveHistory();
				self.cleanUI();
				self.titleID = titleID;
				self._masterSource = [];
				self._slaveSource = {};
				self.dataLoaded = false;
				BrowseView.CurrentProcessLoaded = false;
								
				// Block return key until data is loaded. 
		        application.events.publish('gridloading', {
		            grid : 'titlegrid', className : "similar"
		        });
		        
		        self.activate(); 
		        
		        //For avoid unnecessary data from server when jinni is disable.
		        if ($cn.data.jinniEnable) {
    				for(x = 0; x < res.wheelOptions.length; x++) {
    					var item = res.wheelOptions[x];
    					
    					if(item.geneList.length > 0) {
    						if(masterKey == '') {
    							masterKey = item.wheelOption;
    						}
    						
    						//Set master wheel item. Name is looked up in the enumeration
    						var title = $cn.data.TitleDetailCache[titleID],
    							masterWheelName;
    						
    						if (item.wheelOption == "s_all" && title.titleType == "TV_Show"){
    							masterWheelName = application.resource.td_similar["s_all_" + title.titleType];
    						}
    						else{
    							masterWheelName = application.resource.td_similar[item.wheelOption];
    						}
    						
    						self._masterSource[self._masterSource.length] = {
    								name: masterWheelName,
    								iD: item.wheelOption,
    								parentID: 0
    						};	
    						
    						self._slaveSource[item.wheelOption] = [];
    						for(y = 0; y < item.geneList.length; y++) {
    							var gene = item.geneList[y];
    							
    							self._slaveSource[item.wheelOption].push({
    									name: gene.name,
    									iD: item.wheelOption + "|" + gene.geneId,
    									parentID: item.wheelOption
    							});	
    						}					
    					}
    				}
		        }
				// TODO: Does this 'if' make sense? It seems like it would be set from 
				// TODO: previous run and is therefore incorrect... 
				// Only do this if there is a cast and crew wheel option
				if ($cn.data.baselineEnable) {
    				if(BrowseView.currentTitle) {
    					for (var i = 0; i < BrowseView.currentTitle.wheelItems.length; i++) {
    						
    						if (BrowseView.currentTitle.wheelItems[i].indexOf("m_cast_crew") > -1) {
    							//All movies have cast and crew. If no similar options are available then set the master key to cast and crew item
    							masterKey = (masterKey != '') ? masterKey : "m_cast_crew";
    							self._masterSource[self._masterSource.length] = {
    									name: application.resource.td_similar["m_cast_crew"],
    									iD: "m_cast_crew",
    									parentID: 0
    							};
    							break;
    						}
    					}
    					
    					self._renderWheel($('masterdatasource'), self._masterSource);			
    					self.loadSlaveDataSource(masterKey);
    				}
    				else {
    
    					$cn.methods.getTitleListing(titleID, true, function(cb){
    						BrowseView.currentTitle = cb;
    						
    						for (var i = 0; i < BrowseView.currentTitle.wheelItems.length; i++) {
    							
    							if (BrowseView.currentTitle.wheelItems[i].indexOf("m_cast_crew") > -1) {
    								//All movies have cast and crew. If no similar options are available then set the master key to cast and crew item
    								masterKey = (masterKey != '') ? masterKey : "m_cast_crew";
    								self._masterSource[self._masterSource.length] = {
    										name: application.resource.td_similar["m_cast_crew"],
    										iD: "m_cast_crew",
    										parentID: 0
    								};
    								break;
    							}
    						}
    						
    						self._renderWheel($('masterdatasource'), self._masterSource);			
    						self.loadSlaveDataSource(masterKey);
    					}.bind(this));
    				}
    				
    			}
			}
			if (res.responseCode == 22) {
				callback.call(self, 0, "Cast and Crew added");
			}
			else {
				callback.call(self, res.responseCode, res.responseMessage);
			}
		});
	},
	
	navigate: function(payload){
		
		var p = payload.args[0];
		
		if(payload.context === ActiveWheel) {
			if (p.current && (p.current == "selectedmaster")){
				if(p.direction == "left"){
					if(this.dataLoaded) {
						payload.preventDefault();
						BrowseView.expandTitleDetails();
						BrowseView.TitleViewControl.enableButtons();
						navigation.setFocus("tdbuttonSimilar");
					}
					else {
						payload.preventDefault();
					}
				}
				else {
					this.parent(payload);
				}
			}
			else {
				this.parent(payload);
			}
		}
	}
});
