var sensor=false;
var lang='';
var vbtimer;
var ibOpen=false;
var reopen=false;



/* fix by removing the hardcoded id */
/*rework
function detectBrowser() {
	var useragent = navigator.userAgent;
	var mapdiv = document.getElementById("map_canvas");
	if (isTouch()) {
		addMetaSupport();
		mapdiv.style.width = '100%';
		mapdiv.style.height = '100%';
		sensor=true;
	}
}
function loadingLang(){
    if($("meta[name=locale]").length>0){
        var meta_lang = $("meta[name=locale]").attr("content").split('_');
        var lang=meta_lang[0]!='en'?'&language='+meta_lang[0]:'';
    }
}
function addMetaSupport(){
    var mt = $('meta[name=viewport]');
    mt = mt.length ? mt : $('<meta name="viewport" />').appendTo('head');
    mt.attr('content', 'initial-scale=1.0, user-scalable=no');
}
function loadScript(){
    detectBrowser();
    loadingLang();  
  	async_load_js("http://maps.googleapis.com/maps/api/js?sensor="+sensor+"&callback=initialize"+lang,function(){
		async_load_js(url,callback);
	});
    
}

function set_up_addThis(){
	$('.addthis').clone().appendTo('#main').removeClass('hideThis');
	var title = $('#main h1.title').text();
	if(typeof(addthis) === 'undefined'||typeof(addthis) == null){
		var script = 'http://s7.addthis.com/js/250/addthis_widget.js#pubid=ra-4d8da66e286a0475#domready=1';
		$.getScript( script );
	}
	addthis.update('share', 'url', url);
	addthis.update('share', 'title', title);
}
*/
/* doesn't work look into
function empty_input_recursive(obj){
	(typeof obj.val() === 'function')
		?obj.val(''):(typeof obj.find(':input').val() === 'function')
			?obj.find(':input').val(''):null;
}
*/
/* set up parts of the map NOTE: should be worked into the jquery plugin jMaps
function setGeoCoder(){
	if(typeof(geocoder)==='undefined'){geocoder = new google.maps.Geocoder();}
	return geocoder;
}*/

/*
function setDirectionsRenderer(){
	if(typeof(directionsDisplay)==='undefined'){
		directionsDisplay = new google.maps.DirectionsRenderer({ 
			map: map, 
			suppressPolylines:true,
			suppressMarkers:true
			//markerOptions: markerOptions
		}); 
		google.maps.event.addListener(directionsDisplay, 'directions_changed', function(){});
	}
	return directionsDisplay;
}
*/
/* SET */
/*
function mapzoom(){
    var mapZoom = map.getZoom();
    gob("myzoom").value = mapZoom;
}

function mapcenter(){
    var mapCenter = map.getCenter();
    var latLngStr = mapCenter.lat().toFixed(6) + ', ' + mapCenter.lng().toFixed(6);
    gob("centerofmap").value = latLngStr;
}
*/
/* GET */
/*
function get_mapzoom(){
    var mapZoom = map.getZoom();
    return mapZoom;
}
*/











//-------------------------------------------------------------------------------------------------------------------------------------------------------------
// jeremy's map controls
//-------------------------------------------------------------------------------------------------------------------------------------------------------------





