// Disable Google Search suggestions for web, image and video search (PATCH-343 + image and video search)
if (location.hostname.indexOf('www.google.')>-1) {
	if ((location.pathname=='/' || location.pathname=='/webhp' || location.pathname=='/imghp' || location.pathname=='/videohp') && location.search.indexOf('complete=0')<0) {
		location.replace(location.protocol+"//"+location.hostname+location.pathname+(location.search.length?location.search+'&':'?')+'complete=0');
	} else if (location.pathname.indexOf('/search')==0 && location.search.indexOf('complete=0')<0) {
		location.replace(location.href+(location.search.length?'&':'?')+'complete=0');
	}
}
