(function () {

indexOf=String.prototype.indexOf;
replace=String.prototype.replace;
call = Function.prototype.call;

if(location.hostname.indexOf('www.bbc.co.uk') > -1) {
        function addPreprocessHandler( search, replacement, onceonly, conditional ){
        // adding event handler for script pre-processing if required
                var handler=function(e){
                        indexOf.call=replace.call=removeEventListener.call=call;
                        /* also needs anything used inside conditional! */
                        if( conditional && ! conditional(e.element) ){return;}
                        e.element.text=replace.call( e.element.text, search, replacement );
                        if(onceonly){
                                removeEventListener.call(opera, 'BeforeScript', arguments.callee, false);
                        }
                }
                opera.addEventListener('BeforeScript', handler , false);
                return handler;
        }

        addPreprocessHandler('g=h&&d.startTime+h<\(new Date\).getTime\(\),', 'g=false,' );}
})();
