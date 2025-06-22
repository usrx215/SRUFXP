//-----------------------------------------------------------------------------
// contentgrid.js
// Copyright (c) 2012 - 2013, Rovi Corporation.  All rights reserved.
//-----------------------------------------------------------------------------
 
var ContentGridProperties = {
		id: 'contentgrid',
		tplKey: null,
		tpl: null,
		_data: [],
		scroll: false,
		scrollBuffer: 30,
		imageTimer: null,
		imageTimerTicking: false,
	    initialize: function(id){
			this.id = id;
			this.tplKey = this.id;
			//log.write(this.id + ".tpl");
			
			this.tpl = new ui.template(this.id, application.ui.loadTpl(this.id + ".tpl"));
			this.tpl.compile();
			
			this.imageTimer = new Timer();
			this.imageTimer.Interval = 200;	
			
			log.write(this.id + ".init()");		
			
			application.events.subscribe(this, "navigate", this.navigate.bind(this));
			application.events.subscribe(this, 'scroll', function(payload){
				if ($(this.id).offsetWidth)
					this.onScroll(payload.args[0].direction, payload.args[0].scrollbar);
			}.bind(this));
		},
		initImageTimer: function(){
			log.write('Init Image Timer');
			this.imageTimer.Tick = this.validateImages.bind(this);
			this.imageTimerTime = new Date();
	        if(!this.imageTimerTicking) {
	        	this.imageTimer.Start();
	        	this.imageTimerTicking = true;
	        }       
		},
		deinitImageTimer: function(){
			this.imageTimer.Stop();
			this.imageTimerTicking = false;		
		},
		validateImages: function(){
			log.write("Images Validating...");
			
			/* Handle Image sizing */
			var imgs = document.getElementById(this.id).getElementsByTagName('img');
			var imageCount = imgs.length,
                x;
			
			if(imgs.length > 0) {			
				for(x = 0; x < imgs.length; x++){
					var img = imgs[x];
					
					if(img.complete) {
						if(img.width > 0) {
							imageCount--;
							log.write("Image loaded.");
						}
						else {
							log.write("0 Width detected. Swap img.");
							if(document.getElementById('griddefaultbg')) {
								$('griddefaultbg').show();
								img.style.display = "none";
							}
							imageCount--;
						}
					}
					else {
						if($cn.utilities.testDuration(this.imageTimerTime, 3)) {
							if(document.getElementById('griddefaultbg')) {
								$('griddefaultbg').show();
								img.style.display = "none";
							}
							imageCount--;
						}					
					}
				}
				
				if(imageCount == 0) {
					log.write("All Images Loaded.");
					this.onLoad();
					this.deinitImageTimer();
				}
			}
			else {
				log.write('image loading error');
				this.deinitImageTimer();
				this.onLoad();
				
			}
		},
		cleanUI: function(){
			this.tpl.empty();
			BrowseView.ScrollBar.setRange(0);
		},
		loadData: function(content, columns, template) {
			if(template && template != this.tplKey)
			{
				this.tpl = new ui.template(this.id, application.ui.loadTpl(template + ".tpl"));
				this.tpl.compile();
				this.tplKey = template;
			}
			
			this._data = [];
			//this.saveHistory();
			this._data = content;	
			this.draw();
			
		},
		scaleDefaultImage:function(){
			alert(this.style.width);
		},
		onScroll: function(direction, scrollbar)
		{
			var theGrid = $(this.id),
			    visibleheight = '';
			
			if(theGrid)
			{
				var theContent = theGrid.childNodes[0];
				if(theContent)
				{	
					visibleheight = theGrid.clientHeight-this.scrollBuffer;
		
					var newPosition = scrollbar.getPosition() + (direction == "down" ? 1 : -1);
						
					newPosition = Math.min(Math.max(0, newPosition), scrollbar.range);
		
					if (newPosition != scrollbar.getPosition()) {
						var top = -(newPosition * visibleheight) + 5; 
//						log.write("Top position: " + top);
//						var elem1 = new Fx.Elements(theContent, {
//							duration: 200,
//							transition: Fx.Transitions.Sine.easeOut,
//						});
//						
//						var o = {};
//						o[0] =  {'margin-top': top};
//						elem1.start(o);
						theContent.setStyle('margin-top', top);
						scrollbar.setPosition(newPosition);
					}
				}
			}
		},
		imgResize: function(imgObj){
			if(imgObj) {
				if(imgObj.className.indexOf("resize") > -1){
					log.write(imgObj);
					if(document.getElementById('griddefaultbg')){
						
						document.getElemetById('griddefaultbg').style.display = "none";
					}
				}			
			}
		},
		imgLoad: function(){
			this.imageCount--;
			if (this.imageCount == 0)
				this.onLoad();
		},
		imgError: function(error){
			log.write('image loading error');
			
			if(document.getElementById('griddefaultbg')) {
				$('griddefaultbg').show();
				error.target.style.display = "none";
			}

			this.imageCount--;
			if (this.imageCount == 0)
				this.onLoad();
		},
		draw: function(){
			var self = this,
                imgSource;
			this.cleanUI();
		
			application.events.publish('gridloading', {grid: this.id});
			$(this.id).setStyle('visibility', 'hidden');
			
			//[NOTE] DO NOT CHANGE THIS WITHOUT SPEAKING TO TRAVIS.M
			//Writing custom tpl.appy handle so that we can append a container div inside of the grid. This is here because it is the only place that does this also the production and credits create a log of elements and it can be rather slow.
			var html = "<div>";
			
			this._data.each(function(item) {
				html = html + self.tpl.applyTemplate(item);  
				//self.tpl.append(item);
			});
			
			//this.tpl.apply();
			//The extra div is added so that the appropriate amount of math can be done so that scrolling is accurate.
			html = html + "</div>";
			
			var tempDiv = html.toElement();
	    	
	    	if(tempDiv){
	    		document.getElementById(this.id).appendChild(tempDiv);			
	    	}
	    	
			
			/* Handle Image sizing */

			var imgs = document.getElementById(this.id).getElementsByTagName('img');
			this.imageCount = 0;
			
			for(var i = 0; i < imgs.length; i++) {
                imgSource = imgs[i].getAttribute("src");
	            log.write("image source " + imgSource);
	            if(imgs[i].src.indexOf('localhost') > -1 || imgSource == "") {
					$('griddefaultbg').show();
					$(imgs[i]).hide();
	            }
				imgs[i].onerror = function() {
					log.write('!!image load error');
					log.write(this);
					$('griddefaultbg').show();
					$(this).hide();
				}
			}
			this.onLoad();
		/*
			if(imgs.length > 0) {
				//Start Image Loading timer
				this.initImageTimer();
			}
			
			if (this.imageCount == 0) {
				this.onLoad();
			}*/
			
		},
		navigate: function(payload){
			if ((application.element.current && application.element.current != '') && document.getElementById(application.element.current) && application.element.current == BrowseView.ScrollBar.thumb) {
				if (payload.args[0].direction == 'left' && $(this.id).getSize().y) {
					payload.preventDefault();
					navigation.setFocus('selectedslave');
				}
			}
		},
		onLoad: function() {
			
			application.events.publish('gridloaded', {grid: this.id });
			$(this.id).setStyle('visibility', 'inherit');
		
			//hide/show/disable scrollbar 
			var theGrid = $(this.id);
			var scrollRange = 0,
                cHeight;
			if(theGrid)
			{
				var theContent = theGrid.childNodes[0];
				if(theContent)
				{	
					cHeight =  theContent.clientHeight;				
					if(cHeight > theGrid.clientHeight)
					{
						scrollRange = Math.ceil(cHeight / theGrid.clientHeight) - 1;
						
						//Adjust the scrollrange for the scroll buffer.  The buffer is there so that pages overlap when scrolling.
						if(((cHeight % theGrid.clientHeight) + (scrollRange * this.scrollBuffer)) > theGrid.clientHeight)
						{
							scrollRange = scrollRange + 1;
						}
						
						this.scroll = true;
					}
				}
			}

			BrowseView.ScrollBar.setPosition(0);
			BrowseView.ScrollBar.setRange(scrollRange);
//			BrowseView.ScrollBar.draw();
		}
	}, 
	ContentGrid = new Class(ContentGridProperties);
