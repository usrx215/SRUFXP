if (document.location.hostname.indexOf('youtube.com') > -1) {
	opera.addEventListener('BeforeScript',function(ev){
		var name=ev.element.src; 
		if(!name){return;}
		if(name.indexOf('tv-player')>-1){
			ev.element.text = ev.element.text.replace(
				'function Qh(){return document.createElement("video")}',
				'function Qh(){return document.querySelector("video") || document.createElement("video")}'
			);
		}
	},false);
}
