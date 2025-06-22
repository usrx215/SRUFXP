//-----------------------------------------------------------------------------
// titlecheckoutwheel.js
// Copyright (c) 2012 - 2013, Rovi Corporation.  All rights reserved.
//-----------------------------------------------------------------------------
 
/**
 * @author atumminaro
 */
var TitleCheckOutWheelControl = new Class(
		{
			Extends : WheelControl,
			Implements : WheelControl,
			id : 'TitleCheckOutWheelControl',
			container : 'singlewheel',
			singleWheel : true,
			MetaData : [],
			persist : {},
			masterSourceElement : 'singlemasterdatasource',
			masterSelectedElement : 'singleselectedmaster',

			cleanUI : function() {
				if ($('singleselectedmaster')) {
					$('singleselectedmaster').label = '';
				}

				if ($('singlemasterdatasource')) {
					if ($('singlemasterdatasource').getChildren().length > 0) {

						$('singlemasterdatasource').getChildren().destroy();
					}
				}
			},
			handleWheelItemChange : function(payload) {

				if (payload.context === ActiveWheel) {

					var p = payload.args[0];
					log.write("Title Wheel Item changed. Now fire custom method. "
									+ payload.args[0].wheelinstance);

					application.events.publish('titlecheckoutwheelchanged', {
						selectedvalue : p.selectedvalue,
						titleID : this.persist.title.titleID
					});

                    BrowseView.CurrentWheelValue = p.selectedvalue + ':';

				}

			},
			loadCheckOutData : function(titleid) {

				this.layoutIsDirty = true;
				this.cleanUI();
				var title = $cn.data.TitleDetailCache[titleid];
				this.persist.title = title;
				this.wheelChangedTimeout = 200; //We can set a custom timeout for each wheel. Some require more time than others.
				
				if (title) {
					var purchaseTypes = title.availableProducts,
					    wheelOptions = [],
                        x;
                        //checkOutOptions = [];
					for (x = 0; x < purchaseTypes.length; x++) {
						var typeText = "";

						//Make sure that a title has an available asset before adding to the list. This is 
						//here because some data has an available product but no available assets.
						if(purchaseTypes[x].availableAssets.length > 0) {
							switch (purchaseTypes[x].purchaseType) {
								case "any":
									typeText = "Buy";
									break;
								case "buy":
                                    typeText = $cn.utilities.getBuyTextForTitle(title);
                                    if(purchaseTypes[x].skuType.indexOf("Upgrade") != -1){
                                        this.disctodigital = true;
                                        typeText += " Disc to Digital"
                                    }
                                    typeText += "<br/>" + application.resource.currency_symbol + purchaseTypes[x].price;
									break;
								case "rent":
									typeText = "Rent " + purchaseTypes[x].rentalPeriod
											+ " Hr<br />" + application.resource.currency_symbol + purchaseTypes[x].price;
									break;
								case "subscription":
									typeText = "Subscription";
									break;
							}
	
							var isHD = false;
//                                x1;
//							for (x1 = 0; x1 < purchaseTypes[x].availableAssets.length; x1++) {
//								if (purchaseTypes[x].availableAssets[x1].file_FileProfile
//										&& purchaseTypes[x].availableAssets[x1].file_FileProfile == "HIGH_DEFINITION") {
//									isHD = true;
//								}
//							}
                            if (purchaseTypes[x].skuType.indexOf('HD') > -1) {
                                isHD = true;
                            }
	
							if (isHD) {
								typeText = typeText + "<div id=\"hdbadge\" ></div>"
	
							}
                            if(purchaseTypes[x].skuType.indexOf("Upgrade") == -1 || // NO d2d sku
                                (purchaseTypes[x].skuType.indexOf("Upgrade") != -1 && title.titleID == $cn.data.d2dTitleInfo.id)){
                                //If there is a D2d SKU it must match the disc in the tray
                                wheelOptions.push( {
                                    name : typeText,
                                    iD : purchaseTypes[x].skuID,
                                    parentID : 0,
                                    purchaseType : purchaseTypes[x],
                                    titleID : title.titleID
                                });
                            }
						}
					}
					this.loadData(wheelOptions, [ {} ]);
					if (wheelOptions.length > 1 || this.disctodigital) {
						$('singlewheel').show();
						$('checkout_container').removeClass('nowheel');
						navigation.setFocus('singleselectedmaster');
					} else {
						$('singlewheel').hide();
						$('checkout_container').addClass('nowheel');
						BrowseView.CheckoutPanel.activate();
					}

				}
				/*
				 * else {
				 * 
				 * this.loadData([{ name: "Rent 48 Hr<br />$3.99", iD:
				 * "Rent48", parentID: 0, list: 0 },{ name: "Rent 24 Hr<br />$2.99",
				 * iD: "Rent24", parentID: 0, list: 0 },{ name: "Free Preview",
				 * iD: "FreePreview", parentID: 0, list: 1 },{ name: "Rent 24 Hr<br />$3.49
				 * HD", iD: "Rent24HD", parentID: 0, list: 1 },{ name: "Rent 48
				 * Hr<br />$4.49 HD", iD: "Rent48HD", parentID: 0, list: 1 }],
				 * [{}] );
				 * application.events.publish('titlecheckoutwheelchanged', {
				 * selectedvalue: 0, name: rent, title: title }); }
				 */
			},
			navigate: function(payload){
				
				if (payload.context === ActiveWheel) {
				
					var p = payload.args[0];
					
					if (p.current == "singleselectedmaster") {
						if (p.direction == "left") {
							payload.preventDefault();
							navigation.setFocus('tdbuttonCheckout');
						}
						else if (p.direction == "right") {
							payload.preventDefault();
	                         //The titlecheckout wheel item should remove hover.
                            if ($('singlemasterdatasource')) {
                                var items = $('singlemasterdatasource').getChildren();
                                if (items.length > 0) {
                                   var item = items[this._masterWheel.selection];
                                   if (item) {
                                    item.removeClass('hover');
                                    item.addClass('hdHighlight');
                                   }
                                }
                            }
							if(!this.isNavigating) {
								BrowseView.CheckoutPanel.activate();
							}								
						}												
						else { 
							this.parent(payload);
						}
					} else {
					    if (p.current == 'checkout_order' || p.current == 'checkout_redeem'
					        || p.current == 'checkout_payment' || p.current == 'checkout_cancel') {
                            if (p.direction == "left") {
                                //Should add hover to proper item when titlecheckoutwheel getfocus.
                                if ($('singlemasterdatasource')) {
                                    var items = $('singlemasterdatasource').getChildren();
                                    if (items.length > 0) {
                                        var item = items[this._masterWheel.selection];
                                        if (item) item.addClass('hover');
                                        if (p.current != 'checkout_cancel') {
                                          item.removeClass('hdHighlight');
                                        }
                                    }
                                }					    
                            }
					    }
					}
				}
			}
		});
