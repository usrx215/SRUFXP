if (document.location.href.indexOf('youtube.com') > -1) {
	opera.addEventListener('BeforeScript', function(e){
		str = e.element.text;
		if (e.element.src.indexOf('app-prod.js') > -1) {
			str = str.replace(
				'a.css("background-image","url("+this.src+")")}',
				'a.css("background-image","url("+this.src+")");a.next().text(a.next().text());}'
			);
		}
		e.element.text = str;
	},false);
}