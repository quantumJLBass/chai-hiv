/* Global vars note: at some point mush abstract */
/* this should be only created as needed */
var ib = [];
var ibh = [];
var markerLog = [];
var markerbyid = [];
var mid = [];
var shapes = [];
var listOffset = 0;
var ibHover = false;
var currentControl="ROADMAP";
var cTo="";
var cFrom="";
var hasDirection=false;
var mapview="central";
var currentLocation = siteroot+mapview;
var cur_nav = "";
var cur_mid = 0;
var hasListing = false;
var hasDirections = false;
var mapInst = null;
/* non-abstract */
function resizeBg(obj,height,width) {
	obj.height($(window).height()-height);
	if(typeof(width)!=="undefined"&&width>0)obj.width($(window).width()-width);
} 
function geoLocate(){
	if($('.geolocation').length){
		mapInst.gmap("geolocate",true,false,function(mess, pos){
			//$('#centralMap').gmap("make_latlng_str",pos)//alert('hello');
			mapInst.gmap('addMarker', { 
					position: pos,
					icon:siteroot+"Content/images/map_icons/geolocation_icon.png"
				},function(ops,marker){
				//markerLog[i]=marker;
				//$('#centralMap').gmap('setOptions', {'zIndex':1}, markerLog[i]);
				//if($.isFunction(callback))callback(marker);
			});
		});
	}
}

function ini_map_view(map_ele_obj,callback){
	var map_op = {'center': campus_latlng_str , 'zoom':15 };
	//map_op = $.extend(map_op,{"mapTypeControl":false,"panControl":false});
	if($('#runningOptions').length){
		if($('#runningOptions').html()=="{}"||$('#runningOptions').html()==""){
	
		}else{
			//map_op= {}
			$('#runningOptions').html($('#runningOptions').html().replace(/(\"mapTypeId\":"\w+",)/g,''));
			var jsonStr = $('#runningOptions').html();
			var mapType = jsonStr.replace(/.*?(\"mapTypeId\":"(\w+)".*$)/g,"$2");
			jsonStr = jsonStr.replace(/("\w+":\"\",)/g,'').replace(/(\"mapTypeId\":"\w+",)/g,'');
			$.extend(map_op,pos,base,$.parseJSON(jsonStr));
		}
	}

	map_ele_obj.gmap(map_op).bind('init', function() { 
		var map = map_ele_obj.gmap("get","map");
		ini_GAtracking('UA-22127038-5');
		geoLocate();
		callback();
	});
}

function iniMap(url,callback){
	var winH = $(window).height()-130;
	var winW = $(window).width();
	var zoom = 15;
	if(winW>=500 && winH>=200){zoom = 15;}
	if(winW>=700 && winH>=400){zoom = 16;}
	if(winW>=900 && winH>=600){zoom = 17;}
	var _load = false;
	var url='http://images.wsu.edu/javascripts/campus_map_configs/pick.asp';			
	$.getJSON(url+'?callback=?'+(_load!=false?'&loading='+_load:''), function(data) {
		if( $.isEmptyObject( data.mapOptions )){
			var map_op = {'center': campus_latlng_str , 'zoom':zoom };
		}else{
			var map_op = data.mapOptions;
			if(winW>=500 && winH>=300){map_op.zoom = map_op.zoom;}
			if(winW>=700 && winH>=500){map_op.zoom = map_op.zoom+1;}
			if(winW>=900 && winH>=700){map_op.zoom = map_op.zoom;}
		}
		
		map_op = $.extend(map_op,{"mapTypeControl":false,"panControl":false});
		
		if($('#runningOptions').length){
			if($('#runningOptions').html()=="{}"||$('#runningOptions').html()==""){
		
			}else{
				//map_op= {}
				$('#runningOptions').html($('#runningOptions').html().replace(/(\"mapTypeId\":"\w+",)/g,''));
				var jsonStr = $('#runningOptions').html();
				var mapType = jsonStr.replace(/.*?(\"mapTypeId\":"(\w+)".*$)/g,"$2");
				jsonStr = jsonStr.replace(/("\w+":\"\",)/g,'').replace(/(\"mapTypeId\":"\w+",)/g,'');
				//$.extend(map_op,base,$.parseJSON(jsonStr));
				//map_op = $.parseJSON(jsonStr);
				//$(this).val().replace(/[^a-zA-Z0-9-_]/g, '-'); 
				//alert(dump(map_op));
			}
		}
		$('#centralMap').gmap(map_op).bind('init', function() { 
			ini_GAtracking('UA-22127038-5');
			poi_setup($('#centralMap'));
			addCentralControlls();
			if(typeof(data)!=='undefined') loadData($('#centralMap'),data);
			if($('.mobile').length==0)geoLocate();
			callback();
			$(window).trigger('resize');
			$('.gmnoprint[controlheight]:first').css({'margin-left':'21px'});
			/* addthis setup */
			ini_addthis("mcwsu");
		});
	});
}


function ini_GAtracking(gacode){
			var data = [
				{
					"element":"a[href^='http']:not([href*='wsu.edu'])",
					"options":{
						"mode":"event,_link",
						"category":"outbound"
						}
				},{
					"element":"a[href*='wsu.edu']:not([href^='/'],[href*='**SELF_DOMAIN**'])",
					"options":{
						"skip_internal":"true",
						"category":"internal",
						"overwrites":"true"
						}
				},{
					"element":"a[href*='.rss']",
					"options":{
						"category":"Feed",
						"action":"RSS",
						"overwrites":"true"
						}
				},{
					"element":"a[href*='mailto:']",
					"options":{
						"category":"email",
						"overwrites":"true"
						}
				}
			];
			$.jtrack.defaults.debug.run = false;
			$.jtrack.defaults.debug.v_console = false;
			$.jtrack.defaults.debug.console = true;
			$.jtrack({load_analytics:{account:gacode}, trackevents:data }); 	
}
function ini_addthis(username){
	if(typeof(username)=="unfined"){username="mcwsu";}
	var addthis_config = {
		  services_compact: 'email, facebook, twitter, myspace, google, more',
		  services_exclude: 'print',
		  ui_click: true
	};
	var addthis_share ={
		templates: {twitter: 'check out {{url}} '}
	};
	if($('body.addthis').length==0){
		getSmUrl("",function(url){
			$('#addthisScript').attr('src', "http://s7.addthis.com/js/250/addthis_widget.js#async=1&username="+username+"&" + Math.random() );
			$.getScript( "http://s7.addthis.com/js/250/addthis_widget.js#async=1&username="+username+"&" + Math.random());
			addthis.init(); 
			
			addthis.ost = 0;
			addthis.update('share', 'url', url);
			addthis.ready();
			$('body').addClass('addthis');
		});
	}
	addthis.addEventListener('addthis.menu.open', function(){
		getSmUrl("",function(url){
			addthis.ost = 0; 
			addthis.update('share', 'url', url); // new url 
			//addthis.update('share', 'title', window.document.title); // new title. 
			addthis.ready(); 	
		});
	});
}



/* non-abstract */
function addCentralControlls(){
	if($('.mapControl').length==0){
		// Set CSS for the control border.
		var controlUI = document.createElement('div');
	
		controlUI.title = 'Click Get Aerial photos';
		controlUI.className = 'mapControl TOP';
		
		
		if(!$('.embeded').length && campus=="Pullman"){
			// Set CSS for the control interior.
			var controlText = document.createElement('div');
			controlText.className = 'text';
			controlText.innerHTML = 'Aerial Views';
			controlUI.appendChild(controlText);
			$('#centralMap').gmap("addControl", controlUI, google.maps.ControlPosition.RIGHT_TOP);
			google.maps.event.addDomListener(controlUI, 'click', function() {
					$('.mapControl').removeClass('activeControl');
					$(this).addClass('activeControl');
				 //$('#centralMap').gmap("setOptions",{'mapTypeId':google.maps.MapTypeId.ROADMAP});
					$('[rel="aerial_gouped"]').colorbox({
						photo:true,
						scrolling:false,
						scalePhotos:true,
						opacity:0.7,
						maxWidth:"75%",
						maxHeight:"75%",
						transition:"none",
						slideshow:true,
						slideshowAuto:false,
						open:true,
						current:"<span id='cur'>{current}</span><span id='ttl'>{total}</span>",
						onClosed:function(){
							$('.activeControl').removeClass('activeControl');
							$('#'+currentControl).addClass('activeControl');
							//$('#'+currentControl).trigger('click');
							//$('#centralMap').gmap("setOptions",{'mapTypeId':currentControl.toLowerCase()});
						},
						onComplete:function(){
							if($('#colorbox #cb_nav').length)$('#colorbox #cb_nav').html("");	
							if($('#ttl').length){
								var t=parseInt($('#ttl').text());
								var li="";
								if(t>1){
									for(j=0; j<t; j++){
										li+="<li><a href='#'></a></li>";
									}
									if($('#colorbox #cb_nav').length==0){
										$('#cboxCurrent').after('<ul id="cb_nav">'+li+'</ul>');
									}else{
										$('#colorbox #cb_nav').html(li);
									}
								}
								if($('#colorbox #cb_nav').length){
									$('#colorbox #cb_nav .active').removeClass('active');
									$('#colorbox #cb_nav').find('li:eq('+ (parseInt($('#cboxCurrent #cur').text())-1) +')').addClass('active');
								}
							}
						}
					});
			});
		}
	
	
		// Set CSS for the control border.
		var controlUI = document.createElement('div');
	
		controlUI.title = 'Switch map to Roadmap';
		controlUI.className = 'mapControl TYPE activeControl';
		controlUI.id="ROADMAP";
		
		// Set CSS for the control interior.
		var controlText = document.createElement('div');
		controlText.className = 'text';
		controlText.innerHTML = 'Map';
		controlUI.appendChild(controlText);
		$('#centralMap').gmap("addControl", controlUI, google.maps.ControlPosition.RIGHT_TOP);
		google.maps.event.addDomListener(controlUI, 'click', function() {
				$('.mapControl').removeClass('activeControl');
				$(this).addClass('activeControl');
			 $('#centralMap').gmap("setOptions",{'mapTypeId':google.maps.MapTypeId.ROADMAP});
			 currentControl="ROADMAP";
		});
		
		
		
	
		// Set CSS for the control border.
		var controlUI = document.createElement('div');
		controlUI.title = 'Switch map to Satellite';
		controlUI.className = 'mapControl';
		controlUI.id="SATELLITE";
		
		// Set CSS for the control interior.
		var controlText = document.createElement('div');
		controlText.className = 'text';
		controlText.innerHTML = 'Satellite';
		controlUI.appendChild(controlText);
		$('#centralMap').gmap("addControl", controlUI, google.maps.ControlPosition.RIGHT_TOP);
		google.maps.event.addDomListener(controlUI, 'click', function() {
				$('.mapControl').removeClass('activeControl');
				$(this).addClass('activeControl');
			 $('#centralMap').gmap("setOptions",{'mapTypeId':google.maps.MapTypeId.SATELLITE});
			 currentControl="SATELLITE";
		});
		
		
		
			
	
		// Set CSS for the control border.
		var controlUI = document.createElement('div');
		controlUI.title = 'Switch map to Hybrid (satellite + roadmap)';
		controlUI.className = 'mapControl';
		controlUI.id="HYBRID";
		
		// Set CSS for the control interior.
		var controlText = document.createElement('div');
		controlText.className = 'text';
		
		controlText.innerHTML = 'Hybrid';
		controlUI.appendChild(controlText);
		$('#centralMap').gmap("addControl", controlUI, google.maps.ControlPosition.RIGHT_TOP);
		google.maps.event.addDomListener(controlUI, 'click', function() {
				$('.mapControl').removeClass('activeControl');
				$(this).addClass('activeControl');
			 $('#centralMap').gmap("setOptions",{'mapTypeId':google.maps.MapTypeId.HYBRID});
			 currentControl="HYBRID";
		});
	}
	/**/
}
function poi_setup(jObj){
	var map = jObj.gmap("get","map");
	//google.maps.event.addListener(map, "rightclick",function(event){showContextMenu(event.latLng);});
	google.maps.event.addListener(map, "mouseup",function(event){ 
		hideContextMenu(); 
		setInterval(function(){$('[src="http://maps.gstatic.com/mapfiles/mv/imgs8.png"]').trigger('click'); },1);
	});
	google.maps.event.addListener(map, "dragstart",function(event){ 
		hideContextMenu(); 
		setInterval(function(){$('[src="http://maps.gstatic.com/mapfiles/mv/imgs8.png"]').trigger('click'); },1);
	});
	google.maps.event.trigger(map, 'mouseup');
	/*google.maps.event.addListener(map, "click",function(event){ 
	hideContextMenu(); 
	$('[src="http://maps.gstatic.com/mapfiles/mv/imgs8.png"]').trigger('click'); 
	});*/
	google.maps.event.addListener(map, "drag",function(event){
		hideContextMenu();
		setInterval(function(){$('[src="http://maps.gstatic.com/mapfiles/mv/imgs8.png"]').trigger('click'); },1); 
	});
}


function clearHereToThere(){
	if(hasDirection){
		hasDirection=false;
		cFrom="";
		cTo="";
		$('#centralMap').gmap('clear','overlays');
		$('#centralMap').gmap('clear','serivces');
	}
}

function display_directions(jObj,results){
	
	autoOpenListPanel(function(){
		
		
		if($('#directions-panel').length==0){$('#selectedPlaceList_area').append('<div id="directions-panel">')}
		if($('#directions_area').length==0){$('#directions-panel').append('<div id="directions_area">')}
		destroy_Dirscrollbar();
		listTabs("directions");
		var directionsDisplay = jObj.gmap('get','services > DirectionsRenderer')
		directionsDisplay.setPanel(document.getElementById('directions_area'));
		directionsDisplay.setDirections(results);
									
		if($('#directions-panel #output').length==0)$('#directions-panel').prepend('<div id="output"><a href="#" id="printDir">Print</a><a href="#" id="emailDir">Email</a></div>');
		google.maps.event.addListener(directionsDisplay, 'directions_changed', function() {destroy_Dirscrollbar();setup_Dirscrollbar($('#directions-panel'));}); 
		setup_Dirscrollbar($('#directions-panel'));
		addEmailDir();
	});
}



function hereToThere(jObj){
	if(cTo==""||cFrom =="")return false
	clearHereToThere();
	
	$.colorbox.remove();
	$.colorbox({
		rel:'gouped',
		html:function(){
			return '<div id="modeArea"><h2>Choose Mode</h2><select id="trasMode"><option value="Walk">Walk</option><option value="Bike">Bike</option><option value="Car">Car</option><option value="Transit">Transit</option></select><br/><input type="Submit" value="Continue" name="modeSubmit"/></div>';
		},
		scrolling:false,
		opacity:0.7,
		transition:"none",
		width:275,
		open:true,
		onComplete:function(){
			//if($('#colorbox #cb_nav').length)$('#colorbox #cb_nav').html("");
			$('#modeArea [type="Submit"]').off().on('click',function(e){
				$.colorbox.close();
				e.stopPropagation();
				e.preventDefault();
				switch($('#trasMode').val()){
					case "Walk":
						var mode = google.maps.DirectionsTravelMode.WALKING;
						break;
					case "Bike":
						var mode = google.maps.DirectionsTravelMode.BICYCLING;
						break;
					case "Car":
						var mode = google.maps.DirectionsTravelMode.DRIVING;
						break;
					case "Transit":
						var mode = google.maps.DirectionsTravelMode.TRANSIT;
						break;
				}
				jObj.gmap('displayDirections',
					{origin:cFrom,destination:cTo,travelMode: mode},
					{draggable: true},
					function(results){
						cFrom="";
						cTo="";
						hasDirection=true;
						$('#loading').remove();
						display_directions(jObj,results);
						
				});
			});
		}
	});	

}
function showContextMenu(caurrentLatLng  ){
	/* this need to be abstracked out into the jMap plugin */
	function setMenuXY(caurrentLatLng){
		function getCanvasXY(caurrentLatLng){
			var map = $('#centralMap').gmap("get","map");
			var scale = Math.pow(2, map.getZoom());
			var nw = new google.maps.LatLng(
				map.getBounds().getNorthEast().lat(),
				map.getBounds().getSouthWest().lng()
			);
			var worldCoordinateNW = map.getProjection().fromLatLngToPoint(nw);
			var worldCoordinate = map.getProjection().fromLatLngToPoint(caurrentLatLng);
			var caurrentLatLngOffset = new google.maps.Point(
				Math.floor((worldCoordinate.x - worldCoordinateNW.x) * scale),
				Math.floor((worldCoordinate.y - worldCoordinateNW.y) * scale)
			);
			return caurrentLatLngOffset;
		}
		var mapWidth = $('#centralMap').width();
		var mapHeight = $('#centralMap').height();
		var menuWidth = $('.contextmenu').width();
		var menuHeight = $('.contextmenu').height();
		var clickedPosition = getCanvasXY(caurrentLatLng);
		var x = clickedPosition.x ;
		var y = clickedPosition.y ;
		
		if((mapWidth - x ) < menuWidth)
			x = x - menuWidth;
		if((mapHeight - y ) < menuHeight)
			y = y - menuHeight;
		
		$('.contextmenu').css('left',x  );
		$('.contextmenu').css('top',y );
	};
	var map = $('#centralMap').gmap("get","map");
	var projection;
	var contextmenuDir;
	projection = map.getProjection();
	hideContextMenu();
	contextmenuDir = document.createElement("div");
	contextmenuDir.className  = 'contextmenu';
	contextmenuDir.innerHTML = '<a id="from">Directions from here...</a><a id="to">Directions to here...</a>';
	$(map.getDiv()).append(contextmenuDir);
	setMenuXY(caurrentLatLng);
	contextmenuDir.style.visibility = "visible";
	if(cTo=="" && cFrom ==""){clearHereToThere();}
	

	if(cTo!=""){$('.contextmenu #to').addClass('active');}
	if(cFrom!=""){$('.contextmenu #from').addClass('active');}
	$('.contextmenu #to').click(function(){
		cTo=caurrentLatLng.lat()+","+caurrentLatLng.lng();
		//alert(cTo);
		$(this).addClass('active');
		 hideContextMenu();
		 if(cTo=="" || cFrom =="")return false
		 clearHereToThere();
		 hereToThere($('#centralMap'));
	});
	$('.contextmenu #from').click(function(){
		cFrom=caurrentLatLng.lat()+","+caurrentLatLng.lng();
		//alert(cFrom);
		$(this).addClass('active');
		 hideContextMenu();
		 if(cTo=="" || cFrom =="")return false
		 clearHereToThere();
		 hereToThere($('#centralMap'));
	});
}
function hideContextMenu() {
	$('.contextmenu').remove();
}


function updateMap(jObj,_load,showSum,callback){
	if(typeof(_load)==='undefined') var _load = false;
	if(typeof(showSum)==='undefined') var showSum = false;
	if(typeof(callback)==='undefined') var callback = false;
	cur_mid = 0;
	cur_nav = _load;

	if($.isNumeric(_load)){
		var url=siteroot+"public/get_place.castle";
	}else{
		var url=siteroot+"public/get_place_by_category.castle";	
	}
	$.getJSON(url+'?callback=?'+(_load!=false && !$.isNumeric(_load)?'&cat[]='+_load:($.isNumeric(_load)?'&id='+_load:'')), function(data) {
		if(!$.isNumeric(_load))autoOpenListPanel();
		var cleanedData = [];
		cleanedData.markers = [];
		if(typeof(data.markers)!=='undefined' &&  !$.isEmptyObject( data.markers )){
			$.each( data.markers, function(i, marker) {
				if($.isNumeric(_load))marker.bounds=true;
				if(typeof(marker.id)==='undefined'){
					delete data.markers[i];
				}else if(typeof(marker.error)!=='undefined'){
					delete data.markers[i]; 
				}else{
					cleanedData.markers.push(data.markers[i]);		
				}
			});
			if(typeof(cleanedData)!=='undefined')loadData(jObj,cleanedData,callback);
			loadListings(cleanedData,showSum);
		}
		prep();
	});
}
function updateUrl(nav,pid){
	cur_nav = nav;
	cur_mid = pid;
}
function getUrl(query){
	return siteroot+getUrlPath(query);
}
function getUrlPath(query){
	var url = mapview
	
	url+=(cur_nav!=false?'?cat[]='+cur_nav:'');
	url+=(cur_mid>0?(url.indexOf('?')>-1?'&':'?')+'pid='+cur_mid:'');
	url+=(typeof(query)!=="undefined"?(url.indexOf('?')>-1?'&':'?')+query:'');

	return url;
}
function getSmUrl(query,callback){
	
	var url = getUrlPath(query);
	
	$.get('/public/get_sm_url.castle?_url=/'+encodeURIComponent(url),function(data){
		if(data!="false"){
			//alert(data)
			url = "t/"+data;
		}
		if(typeof(callback)!="undfined")callback(siteroot+url);
		return siteroot+url;
	});
	
}



function open_info(jObj,i,marker){
	if(ib.length>0){
		$.each(ib, function(i) {
			ib[i].close();
			jObj.gmap('setOptions', {'zIndex':1}, markerLog[i]);
		});
		if(typeof(ib[i])!=="undefined")ib[i].open(jObj.gmap('get','map'), markerLog[i],function(){ cur_mid = mid[i]; });
		jObj.gmap('setOptions', {'zIndex':9}, markerLog[i]);
		$('#selectedPlaceList_area .active').removeClass('active');
		$('#selectedPlaceList_area a:eq('+i+')').addClass('active');
		cur_mid = mid[i];
	}
	ibHover =  false;		
}
function open_toolTip(jObj,i){
	if(ibh.length>0){
		$.each(ibh, function(i) {ibh[i].close();});
		$('.infoBox').hover( 
			function() { ibHover =  true; }, 
			function() { ibHover =  false;  } 
		); 
		if(ibHover!=true && typeof(ibh[i])!=="undefined")ibh[i].open(jObj.gmap('get','map'), markerLog[i]);
	}
}
function close_toolTips(){
	if(ibh.length>0){
		$.each(ibh, function(i) {ibh[i].close();});
	}
}

function addShapeToMap(jObj,i,shape){
	var pointHolder = {};
	if(typeof(shape.latlng_str)=="undefined" && shape.latlng_str!='' && shape.type=='polyline'){ 
		var pointHolder = {'path' : shape.latlng_str };
	}
	if(typeof(shape.latlng_str)=="undefined" && shape.latlng_str!='' && shape.type=='polygon'){ 
		var pointHolder = {'paths' : shape.latlng_str };
	}
	if(typeof(shape.encoded)!="undefined"){ 
		var pointHolder = {'paths' : shape.encoded };
	}
	if(typeof(shape.style)=="undefined"||shape.style==''){
		var style = shape.type=='polygon'? {'fillOpacity':.99,'fillColor':'#981e32','strokeColor':'#262A2D','strokeWeight':1}:{'strokeOpacity':.99,'strokeColor':'#262A2D','strokeWeight':2};
	}else{
		var style =  shape.style.events.rest;
	}
	if(!$.isEmptyObject(pointHolder)){
		var style = $.extend( style , pointHolder );
	}else{
		var style = {};
	}
	
	if(typeof(shape.style)=="undefined"||shape.style==''){
		jObj.gmap('addShape',(shape.type[0].toUpperCase() + shape.type.slice(1)), style);
	}else{
		// $('#place_drawing_map').gmap('addShape',(shape.type[0].toUpperCase() + shape.type.slice(1)), style)
		jObj.gmap('addShape', (shape.type[0].toUpperCase() + shape.type.slice(1)), style, function(shape_obj){
		$(shape_obj).click(function(){
			if(typeof(shape.style.events.click)!="undefined" && shape.style.events.click != ""){
				jObj.gmap('setOptions',shape.style.events.click,this);
				if(typeof(shape.style.events.click.onEnd)!="undefined" && shape.style.events.click.onEnd != ""){
					(function(){
						window['jObj']=jObj; window['i']=i;
						var p= shape.style.events.click.onEnd.replace('\u0027',"'"); 
						var f=  new Function(p); 
						f();
					})();
				}
			}
		 }).mouseover(function(){
			 if(typeof(shape.style.events.mouseover)!="undefined" && shape.style.events.mouseover != ""){
				 jObj.gmap('setOptions',shape.style.events.mouseover,this);
				if(typeof(shape.style.events.mouseover.onEnd)!="undefined" && shape.style.events.mouseover.onEnd != ""){
					(function(){
						window['jObj']=jObj; window['i']=i;
						var p= shape.style.events.mouseover.onEnd.replace('\u0027',"'"); 
						var f=  new Function(p); 
						f();
					})();
				}		
			 }
		}).mouseout(function(){
			if(typeof(shape.style.events.rest)!="undefined" && shape.style.events.rest != ""){
				jObj.gmap('setOptions',shape.style.events.rest,this);
				if(typeof(shape.style.events.rest.onEnd)!="undefined" && shape.style.events.rest.onEnd != ""){
					(function(){
						window['jObj']=jObj; window['i']=i;
						var p= shape.style.events.rest.onEnd.replace('\u0027',"'"); 
						var f=  new Function(p); 
						f();
					})();
				}
			}
		}).dblclick(function(){
			if(typeof(shape.style.events.dblclick)!="undefined" && shape.style.events.dblclick != ""){
				jObj.gmap('setOptions',shape.style.events.dblclick,this);
					(function(){
						window['jObj']=jObj; window['i']=i;
						var p= shape.style.events.dblclick.onEnd.replace('\u0027',"'"); 
						var f=  new Function(p); 
						f();
					})();
			}
		})
		.trigger('mouseover')
		.trigger('mouseout');
		});
	}	
}
var api = null;
var apiL = null;
var apiD = null;
function make_InfoWindow(jObj,i,marker){
	if($.isArray(marker.info.content)){
		var nav='';
		$.each( marker.info.content, function(j, html) {	
			nav += '	<li class="ui-state-default ui-corner-top '+( j==0 ?'first ui-tabs-selected ui-state-active':'')+'"><a href="#tabs-'+j+'" hideFocus="true">'+html.title+'</a></li>';
		});
		var content='';
		$.each( marker.info.content, function(j, html) {
			content += '<div id="tabs-'+j+'" class="ui-tabs-panel ui-widget-content ui-corner-bottom  '+( j>0 ?' ui-tabs-hide':'')+'"><div class="content '+html.title.replace(' ','_').replace("'",'_').replace('/','_')+'">'+html.block+'</div><a class="errorReporting" href="?reportError=&place=' + marker.id + '" >Report&nbsp;&nbsp;error</a></div>';
		});				
	
	}else{
		var nav = '	<li class="ui-state-default ui-corner-top  ui-tabs-selected ui-state-active first"><a href="#tabs-1" hideFocus="true">Overview</a></li>';
		var content='<div id="tabs-" class="ui-tabs-panel ui-widget-content ui-corner-bottom  "><div class="content overview">'+marker.info.content+'</div><a class="errorReporting" href="?reportError=&place=' + marker.id + '" >Report&nbsp;&nbsp;error</a></div>';
	}
	var box='<div id="taby'+i+'" class="ui-tabs ui-widget ui-widget-content ui-corner-all">'+
				'<ul class="ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all">'+nav+'</ul>'+
				content+
				'<div class="ui-tabs-panel-cap ui-corner-bottom"><span class="arrow L5"></span><span class="arrow L4"></span><span class="arrow L3"></span><span class="arrow L2"></span></div>'+
			'</div>';

	/* so need to remove this and create the class for it */
	var boxText = document.createElement("div");
	boxText.style.cssText = "border: 1px solid black; margin-top: 8px; background: yellow; padding: 5px;";
	boxText.innerHTML = marker.info.content;
	var myOptions = {
		alignBottom:true,
		 content: box//boxText
		,disableAutoPan: false
		,maxWidth: 0
		,height:"340px"
		,pixelOffset: new google.maps.Size(-200, -103)
		,zIndex: 999
		,boxStyle: {
		  width: "400px"
		 }
		,closeBoxHTML:"<span class='tabedBox infoClose'></span>"
		,infoBoxClearance: new google.maps.Size(50,50)
		,isHidden: false
		,pane: "floatPane"
		,enableEventPropagation: false
		,onClose:function(){
			ibHover =  false;
			if(typeof($.fn.cycle)!=="undefined" && $('.cWrap .items li').length>1){$('.cWrap .items').cycle('destroy');}
			if(typeof($.jtrack)!=="undefined")$.jtrack.trackEvent(pageTracker,"infowindow","manually closed",marker.title);
			$('#taby'+i).tabs('destroy').tabs();
		}
		,onOpen:function(){
			if(jObj.gmap("hasPanorama")){
				var pano = jObj.gmap("getPanorama");
				pano.setPosition(new google.maps.LatLng(marker.position.latitude, marker.position.longitude));
				google.maps.event.addListener(pano, 'position_changed', function() {
					if(jObj.gmap("hasPanorama")){
						var pov = pano.getPov();
						var heading = google.maps.geometry.spherical.computeHeading(pano.getPosition(),new google.maps.LatLng(marker.position.latitude, marker.position.longitude));
						pov.heading = heading>360?(heading)-360:heading<0?(heading)+360:heading;
						pano.setPov(pov);
					}
				});
			}else{
				
			}
				needsMoved=0;
				ibHover =  true;
				$('#taby'+i).tabs('destroy').tabs({
						select: function(event, ui) {
							if(typeof($.jtrack)!=="undefined")$.jtrack.trackEvent(pageTracker,"infowindow tab",marker.title,$(ui.tab).text());
						}
					});
				if($('.cWrap .items li').length>1 && typeof($.fn.cycle)!=="undefined"){
					var currSlide=0; 
					$('.cWrap .items').cycle('destroy');
					$('.cWrap .items').cycle({
						fx:     'scrollHorz',
						delay:  -2000,
						pauseOnPagerHover: 1,
						pause:1,
						timeout:0, 
						pager:'.cNav',
						prev:   '.prev',
						next:   '.next', 
						onPagerEvent:function(i,ele){
							if(currSlide-i<0){ 
								if(typeof($.jtrack)!=="undefined")$.jtrack.trackEvent(pageTracker,"infowindow views", "next", marker.title);
							}else{ 
								if(typeof($.jtrack)!=="undefined")$.jtrack.trackEvent(pageTracker,"infowindow views", "previous", marker.title);
							} 
							currSlide = i; 
						},
						onPrevNextEvent:function(isNext,i,ele){
								if(isNext){
									if(typeof($.jtrack)!=="undefined")$.jtrack.trackEvent(pageTracker,"infowindow views", "next", marker.title);	
								}else{
									if(typeof($.jtrack)!=="undefined")$.jtrack.trackEvent(pageTracker,"infowindow views", "previous", marker.title);	
								}
							},
						
						pagerAnchorBuilder: function(idx, slide) { return '<li><a href="#" hidefocus="true">'+idx+'</a></li>';} 
					});/*	*/
				}
				$('.infoBox .ui-tabs-panel a').attr('target','_blank');
				$('.infoBox .ui-tabs-panel a[target="_blank"]:not(.ui-tabs-nav a,a[href="#"])').on('click',function(){
					if(typeof($.jtrack)!=="undefined")$.jtrack.trackEvent(pageTracker,"infowindow link", "clicked", $(this).attr('href'));
				});
				
				
				
				$('a.gouped').off().on('click',function(e){
					e.preventDefault();
					e.stopPropagation();
					$('a.gouped').colorbox({
						photo:true,
						scrolling:false,
						scalePhotos:true,
						opacity:0.7,
						maxWidth:"75%",
						maxHeight:"75%",
						transition:"none",
						slideshow:true,
						slideshowAuto:false,
						open:true,
						current:"<span id='cur'>{current}</span><span id='ttl'>{total}</span>",
						onOpen:function(){
							
							if(typeof($.jtrack)!=="undefined")$.jtrack.trackEvent(pageTracker,"infowindow gallery", "opened", marker.title);
						},
						onClosed:function(){
							if(typeof($.jtrack)!=="undefined")$.jtrack.trackEvent(pageTracker,"infowindow gallery", "closed", marker.title);
							$('#colorbox #cb_nav').html("");
							$('#ttl').text(0);
							$('#ttl').text(1);
						},
						onComplete:function(){
							if($('#colorbox #cb_nav').length)$('#colorbox #cb_nav').html("");	
							if($('#ttl').length){
								var t=parseInt($('#ttl').text());
								var li="";
								if(t>1){
									for(j=0; j<t; j++){
										li+="<li><a href='#'></a></li>";
									}
									if($('#colorbox #cb_nav').length==0){
										$('#cboxCurrent').after('<ul id="cb_nav">'+li+'</ul>');
									}else{
										$('#colorbox #cb_nav').html(li);
									}
								}
								if($('#colorbox #cb_nav').length){
									$('#colorbox #cb_nav .active').removeClass('active');
									$('#colorbox #cb_nav').find('li:eq('+ (parseInt($('#cboxCurrent #cur').text())-1) +')').addClass('active');
										if(needsMoved<0||needsMoved>0){
											//alert(needsMoved);
											if(needsMoved<0){
												$.colorbox.next();
												if(needsMoved==-1 && typeof($.jtrack)!=="undefined")$.jtrack.trackEvent(pageTracker,"infowindow gallery", "next", marker.title+' - media id:'+$('.cboxPhoto').attr('src').split('&id=')[1]);
												needsMoved++;
											}else{
												$.colorbox.prev();
												if(needsMoved==1 && typeof($.jtrack)!=="undefined")$.jtrack.trackEvent(pageTracker,"infowindow gallery", "previous", marker.title+' - media id:'+$('.cboxPhoto').attr('src').split('&id=')[1]);
												needsMoved--;
											}
										}
									$('#colorbox #cb_nav li').off().on('click',function(){
										var cur=(parseInt($('#cboxCurrent #cur').text())-1);
										var selected=$(this).index('#cb_nav li');
										var dif=cur-selected;
										needsMoved=dif;
										if(dif<0||dif>0){
											if(dif<0){
												$.colorbox.next();
												//if(dif>-2)$.jtrack.trackEvent(pageTracker,"infowindow gallery", "next", marker.title);
												needsMoved++;
											}else{
												$.colorbox.prev();
												//if(dif<2)$.jtrack.trackEvent(pageTracker,"infowindow gallery", "previous", marker.title);
												needsMoved--;
											}
										}
									});
									$('#cboxNext,#cboxLoadedContent').off('click.track').on('click.track',function(){
										if(typeof($.jtrack)!=="undefined")$.jtrack.trackEvent(pageTracker,"infowindow gallery", "next", marker.title+' - media id:'+$('.cboxPhoto').attr('src').split('&id=')[1]);
									});
									$('#cboxPrevious').off('click.track').on('click.track',function(){
										if(typeof($.jtrack)!=="undefined")$.jtrack.trackEvent(pageTracker,"infowindow gallery", "previous", marker.title+' - media id:'+$('.cboxPhoto').attr('src').split('&id=')[1]);
									});
								}
							}
						}
					});
				});
				addErrorReporting(marker);

				$('.ui-tabs-panel').hover(function(){
					ib[i].setOptions({enableEventPropagation: true});
					jObj.gmap('stop_scroll_zoom');
				},function(){
					ib[i].setOptions({enableEventPropagation: false});
					jObj.gmap('set_scroll_zoom');
				});
				ib[i].rePosition();
				ibHover =  false;
				
				

				var minHeight=0;
				$.each($('#taby'+i+' .ui-tabs-panel'),function() {
					minHeight = Math.max(minHeight, $(this).find('.content').height())+3; 
					
				}).css('min-height',minHeight); 
				var settings = {
					verticalDragMinHeight: 50
					//showArrows: true
				};
				var pane = $('#campusmap .ui-tabs .ui-tabs-panel .content:not(".Views")');
				if(minHeight>235){
				pane.bind(
					'jsp-scroll-y',
					function(event, scrollPositionY, isAtTop, isAtBottom)
					{
							var isAtBottom= isAtBottom;	
							var isAtTop= isAtTop;			
						pane.mousewheel(function(event,delta){ 
							var media = $(this).find('.mediaPanel'); 
							if (delta > 0) { 
								if(isAtTop) return false;
							} else { 
								if(isAtBottom) return false;
							}         
						});  		
					}
	
				).jScrollPane(settings);
				api = pane.data('jsp');
				}
								
				
				prep();
			}
	};
	ib[i] = new InfoBox(myOptions,function(){
		//$('#taby'+i).tabs();
		//alert('tring to tab it, dabnab it, from the INI');
	});
}
function make_ToolTip(jObj,i,marker){
	//end of the bs that is well.. bs of a implamentation
	/* so need to remove this and create the class for it */
	var boxText = document.createElement("div");
	boxText.style.cssText = "border: 1px solid rgb(102, 102, 102); background: none repeat scroll 0% 0% rgb(226, 226, 226); padding: 2px; display: inline-block; font-size: 10px !important; font-weight: normal !important;";
	boxText.innerHTML = "<h3 style='font-weight: normal !important; padding: 0px; margin: 0px;'>"+marker.title+"</h3>";
	var myHoverOptions = {
		alignBottom:true,
		 content: boxText//boxText
		,disableAutoPan: false
		,pixelOffset: new google.maps.Size(15,-15)
		,zIndex: 999
		,boxStyle: {
			minWidth: "250px"
		 }
		,infoBoxClearance: new google.maps.Size(1, 1)
		,isHidden: false
		,pane: "floatPane"
		,boxClass:"hoverbox"
		,enableEventPropagation: false
		,disableAutoPan:true
		,onOpen:function(){}
		
	};
	ibh[i] = new InfoBox(myHoverOptions,function(){});
}
function make_Marker(jObj,i,id,marker,markerCallback){	
	if(marker.style.icon){marker.style.icon = marker.style.icon.replace('{$i}',i+1);}
	jObj.gmap('addMarker', $.extend({ 
			'position': new google.maps.LatLng(marker.position.latitude, marker.position.longitude),
			'z-index':1,
			'title':marker.title
		},marker.style),function(ops,marker){
			markerLog[i]=marker;
			markerbyid[id] = markerLog[i];
			 // these too are needing to be worked together
			jObj.gmap('setOptions', {'zIndex':1}, markerLog[i]);
			if(typeof(markerCallback)!=="undefined" && $.isFunction(markerCallback))markerCallback(marker);
		})
	.click(function() {
			open_info(jObj,i,marker);
			if(typeof($.jtrack)!=="undefined")$.jtrack.trackEvent(pageTracker,"infowindow via marker", "opened", marker.title);
		})
	.rightclick(function(event){showContextMenu(event.latLng);})
	.mouseover(function(event){
		open_toolTip(jObj,i,marker);
	})
	.mouseout(function(event){
		close_toolTips();
	});
}

var needsMoved=0;
function loadData(jObj,data,callback,markerCallback){
	if(typeof(data.shapes)!=='undefined' && !$.isEmptyObject(data.shapes)){
		$.each( data.shapes, function(i, shape) {
			if(typeof(shape)!=='undefined' && !$.isEmptyObject(shape))addShapeToMap(jObj,i,shape);
		});
	}
	if(typeof(data.markers)!=='undefined' &&  !$.isEmptyObject( data.markers )){
		//var l = data.markers.length;
		$.each( data.markers, function(i, marker) {	
			if(typeof(marker.shapes)!=='undefined' && !$.isEmptyObject(marker.shapes)){
				$.each( marker.shapes, function(index, shape) {	
					if(typeof(shape)!=='undefined' && !$.isEmptyObject(shape))addShapeToMap(jObj,i,shape);
				});
			}
			//alert(dump(marker));
			//var _mid= marker.id;
			mid[i]=marker.id;
			
			make_InfoWindow(jObj,i,marker);
			make_ToolTip(jObj,i,marker);
			make_Marker(jObj,i,marker.id,marker,markerCallback);
			
			if(i==(data.markers.length-1) && $.isFunction(callback)){callback();}
		});
		geoLocate();
	}
	//if($.isFunction(callback))callback();return;
}
function getSignlePlace(jObj,id){
	var url=siteroot+"public/get_place.castle";
	$( "#placeSearch input[type=text]" ).autocomplete("close");
	var found=false;
	
	if(!$.isNumeric(id)){
		$.get(url+''+(id!=false?'?id='+id:''), function(data) {
			if(data=="false"){
				$.colorbox({
					html:function(){
						return '<div id="noplace">'+
									'<h2>No matches</h2>'+
									'<div><p>Please try a new search as we are not finding anything for your entry.</p></div>'+
								'</div>';
					},
					width:450,
					scrolling:false,
					opacity:0.7,
					transition:"none",
					open:true,
					onComplete:function(){
						if($('#colorbox #cb_nav').length)$('#colorbox #cb_nav').html("");	
					}
				});
			}else{
				found=true;
			}
			
			if(found==true){
				$.getJSON(url+'?callback=?'+(id!=false?'&id='+id:''), function(data) {
					if(!$('#selectedPlaceList_btn').is(':visible')){
						$('#selectedPlaceList_btn').css({'display':'block'});
						//$('#selectedPlaceList_btn').trigger('click');
					}
					$.each(ib, function(i) {ib[i].close();});
					jObj.gmap('clear','markers');
					jObj.gmap('clear','overlays');
					if(typeof(data)!=='undefined')loadData(jObj,data,null,function(marker){
						ib[0].open(jObj.gmap('get','map'), marker);
						cur_mid = mid[0];
					});
					loadListings(data,true);
					prep();
				});
			}
			
		});
	}else{
		$.getJSON(url+'?callback=?'+(id!=false?'&id='+id:''), function(data) {
			if(!$('#selectedPlaceList_btn').is(':visible')){
				$('#selectedPlaceList_btn').css({'display':'block'});
				//$('#selectedPlaceList_btn').trigger('click');
			}
			$.each(ib, function(i) {ib[i].close();});
			jObj.gmap('clear','markers');
			jObj.gmap('clear','overlays');
			if(typeof(data)!=='undefined')loadData(jObj,data,null,function(marker){
				ib[0].open(jObj.gmap('get','map'), marker);
				cur_mid = mid[0];
			});
			loadListings(data,true);
			prep();
		});
	}
}






function autoOpenListPanel(callback){
	$('#selectedPlaceList').removeClass('ini');
	if(!$('#selectedPlaceList_btn').is(':visible')){
		$('#selectedPlaceList_btn').css({'display':'block'});
		$('#selectedPlaceList_btn').trigger('click');
	}
	if(typeof(callback)!=="undefined")callback();
}

function listTabs(prime){
	
	if($('#selectedPlaceList_area #listing').length>0 && $('#selectedPlaceList_area #directions-panel').length>0){
		if($('#selectedPlaceList_area #option').length==0)$('#selectedPlaceList_area').prepend('<ul id="option">');

		if($('#selectedPlaceList_area #listing').length>0 && $('#selectedPlaceList_area #option #locations').length==0){
			$('#selectedPlaceList_area #option').append('<li id="locations">Locations</li>');
		}
		if($('#selectedPlaceList_area #directions-panel').length>0 && $('#selectedPlaceList_area #option #directions').length==0){
			$('#selectedPlaceList_area #option').append('<li id="directions">Directions</li>');
		}
		
		if($('#selectedPlaceList_area #option li').length>1){
			$('#selectedPlaceList_area #option li:first').addClass('DIVIT');	
		}else{
			$('#option .DIVIT').removeClass('DIVIT');	
		}
		$('#option .active').removeClass('active');
		
		
		$('#locations').off().on('click',function(){
			$('#option .active').removeClass('active');
			$('#listing').show();
			$('#directions-panel').hide();
			$('#locations').addClass('active');
		});
		$('#directions').off().on('click',function(){
			$('#option .active').removeClass('active');
			$('#listing').hide();
			$('#directions-panel').show();
			$('#directions').addClass('active');
			$('#printDir').off().on('click',function(){
				$('#directions_area').jprint();
			});
		});
		
		if(typeof(prime)!=="undefined" && prime!=null){
			if(prime=="locations"){
				$('#option .active').removeClass('active');
				$('#listing').show();
				$('#directions-panel').hide();
				$('#locations').addClass('active');
			}
			if(prime=="directions"){
				$('#option .active').removeClass('active');
				$('#listing').hide();
				$('#directions-panel').show();
				$('#directions').addClass('active');
			};
		}
		if($('#listing').is(':visible'))$('#locations').addClass('active');
		if($('#directions').is(':visible'))$('#directions').addClass('active');
		
	}else{
		if($('#selectedPlaceList_area #option').length>0)$('#selectedPlaceList_area #option').remove();
	}

}



function loadListings(data,showSum){
	$('#selectedPlaceList').removeClass('ini');
	var listing="";
	if(data.markers.length>17)showSum=false;
	$.each( data.markers, function(i, marker) {	
		if(typeof(marker.info)!=='undefined'){
			var sum="";
			
			if(typeof(marker.summary)!=='undefined' && !$.isEmptyObject(marker.summary)){
				sum='<div '+(showSum?'':'style="display:none;"')+'>'+marker.summary+'</div>';
			}
	
			listing+='<li class="">'+
						'<a href="#" class=""><img src="'+siteroot+'Content/images/list_numbers/li_'+(i+1)+'.png"/>'+marker.title+'</a>'+
						sum+
					'</div>';
			hasListing = false;
		}
	});
	if($('#selectedPlaceList_area #listing').length==0)$('#selectedPlaceList_area').append('<div id="listing" class="cAssest">');
	destroy_Listscrollbar();
	listTabs("locations");
	
	$('#selectedPlaceList_area #listing').html('<ul class="cAssest">'+listing+'</ul>');
	setup_Listscrollbar($('#listing'));

	
	
	
	
	
	$.each($('#selectedPlaceList_area #listing a'),function(i,v){
		var btn=$(this);
		btn.live('click',function(e){
			e.stopPropagation();
			e.preventDefault();
			if(!btn.is('active') && !btn.next('div').is(':visible')){// changed hasClass for is for speed
				//$('#selectedPlaceList_area .active').next('div').toggle('showOrHide');
				$('#selectedPlaceList_area .active').removeClass('active');
				//btn.next('div').toggle('showOrHide');
				btn.addClass('active');
			}
			$.each(ib, function(i) {ib[i].close();});
			ib[i].open($('#centralMap').gmap('get','map'), markerLog[i]);
			if(typeof($.jtrack)!=="undefined")$.jtrack.trackEvent(pageTracker,"infowindow via place list", "opened",btn.text());
			cur_mid = mid[i];
		});
	});
	google.maps.event.addListener($('#centralMap').gmap('get','map'), 'zoom_changed',function(){
			$('#selectedPlaceList_area .active').trigger('click');
		});
	
	
}
function setup_listingsBar(jObj){
	/* Other after gmap ini */
	$('#selectedPlaceList_btn').off().on('click', function(e){
		e.stopPropagation();
		e.preventDefault();
		var btn=$(this);
		$('.gmnoprint[controlheight]:first').css({'margin-left':'21px'});
		if(btn.closest('#selectedPlaceList').width()<=1){
			$('#selectedPlaceList').addClass("active");
			btn.closest('#selectedPlaceList').stop().animate({
				width:"190px"
				}, 250, function() {
					btn.addClass("active");
					//$('#selectedPlaceList_area').css({'overflow-y':'auto'});
					//setup_scrollbar($('#listing'));	
					
					//$(window).trigger("resize");
			});
			$('.central_layout.public.central #centralMap').animate({
				'margin-left':'190px','width':
				$('.central_layout.public.central #centralMap').width()-190
			},
			250,
			function() {
				}).addClass("opended");
			//listOffset=190;
			//$(window).trigger("resize");
		}else{
			$('#selectedPlaceList').removeClass("active");
			btn.closest('#selectedPlaceList').stop().animate({
				width:"0px"
				}, 250, function() {
					btn.removeClass("active");
					$('#selectedPlaceList_area').css({'overflow-y':'hidden'});
					//$(window).trigger("resize");
			});
			$('.central_layout.public.central #centralMap').animate({'margin-left':'0px','width':$('.central_layout.public.central #centralMap').width()+190}, 500, function() {}).removeClass("opended");
			//$(window).trigger("resize");
			//listOffset=0;
		}
	});
}



function setup_mapsearch(jObj){
	/* Search autocomplete */
	var cur_search = "";
	var termTemplate = "<strong>%s</strong>";
	var term = "";
	$( "#placeSearch input[type=text]" ).autocomplete({
		source: function( request, response ) {
			term = request.term;
			$.ajax({
				url: siteroot+"public/keywordAutoComplete.castle",
				dataType: "jsonp",
				data: {
					featureClass: "P",
					style: "full",
					maxRows: 12,
					name_startsWith: request.term
				},
				success: function( data, status, xhr  ) {
					var matcher = new RegExp( $.ui.autocomplete.escapeRegex(request.term), "i" );
					response( $.map( data, function( item ) {
						var text = item.label;
						if ( (item.value && ( !request.term || matcher.test(text)) || item.related == "header" || item.related == "true" ) ){
							return {
								label: item.label,
								value: item.value,
								place_id: item.place_id,
								related: item.related
							}
						}
					}));
				}
			});
		},
		search: function(event, ui) {
			/**/
		},
		minLength: 2,
		select: function( e, ui ) {
			var id = ui.item.place_id;
			var term = ui.item.label;

			var url=siteroot+"public/get_place.castle";
			if ( e.which != 13 ){
				if(typeof($.jtrack)!=="undefined")$.jtrack.trackPageview(pageTracker,url+(id!=""?'?id='+id:'')+(term!=""?'&term='+term:''));
				getSignlePlace(jObj,id);
			}
			
			$( "#placeSearch input[type=text]" ).autocomplete("close");
		},
		focus: function( event, ui ) {
			$( "#placeSearch [type=text]" ).val( ui.item.label );
			return false;
		},
		open: function(e,ui) {
			$('.ui-autocomplete.ui-menu').removeClass( "ui-corner-all" );
		 }
	}).data( "autocomplete" )._renderItem = function( ul, item ) {
		var text =item.label;
		if(item.related=="header"){
			text = "<em>Related search items</em>";
		}else{
			text ="<a>" + text.replace( new RegExp( "(?![^&;]+;)(?!<[^<>]*)(" + $.ui.autocomplete.escapeRegex(this.term) + ")(?![^<>]*>)(?![^&;]+;)", "gi" ), "<strong>$1</strong>" )+"</a>";
		}
		return $( "<li></li>" )
			.data( "item.autocomplete", item )
			.append( text )
			.appendTo( ul );
	}
	$( "#placeSearch input[type='text']" ).on('keydown',function(e) {
		if ( e.which == 13 ){
			var id   = $( "#placeSearch .ui-autocomplete-input" ).val();
			var url=siteroot+"public/get_place.castle";
			if(typeof($.jtrack)!=="undefined")$.jtrack.trackPageview(pageTracker,url+(id!=""?'?id='+id:'')+(term!=""?'&term='+term:''));
			$( "#placeSearch input[type=text]" ).autocomplete("close");
			getSignlePlace(jObj,$( "#placeSearch .ui-autocomplete-input" ).val());
		}
	});	
}

/*
*
*
*
**
**
**
**
*
*
*/





function prep(){
	if($(' [placeholder] ').length())$(' [placeholder] ').defaultValue();
	$("a").each(function() {$(this).attr("hideFocus", "true").css("outline", "none");});
}




function setup_directions(jObj){
	var kStroke;
	if($('#directionsTo').is(':visible'))$('#directionsTo').slideToggle();
	$('#directionsFrom input,#directionsTo input').off().on('keyup',function(){
		if($('#directionsFrom input').val() !=''){
			if($('#directionsTo').css('display')=='none')$('#directionsTo').slideToggle();
		}
		clearTimeout(kStroke);
		kStroke=setTimeout(function(){
			fireDirections();
			},2000);
	});
	function fireDirections(){
		//$('#centralMap').gmap('clear','markers');
		//$('#centralMap').gmap('clear','overlays');
		jObj.gmap('clear','serivces');
		jObj.append('<img src="/Content/images/loading.gif" style="position:absolute; top:50%; left:50%;" id="loading"/>');
		var from=$('#directionsFrom input').val();
		var to=$('#directionsTo input').val();
		if(from!=''){
			if(to=="WSU "+campus){
				to= campus_latlng_str;
			}else{
				jObj.gmap('search',{address:to+' USA'},function(results, status){
					if (status == google.maps.GeocoderStatus.OK) {
						to = results[0].geometry.location
					} else {
						to = campus_latlng_str;
					}
				});
			}
			jObj.gmap('search',{address:from+' USA'},function(results, status){
				if (status == google.maps.GeocoderStatus.OK) {
					from = results[0].geometry.location
					jObj.gmap('displayDirections',
						{origin:from,destination:to,travelMode: google.maps.DirectionsTravelMode.DRIVING},
						{draggable: true},
						function(results, status){
							
							
							display_directions(jObj,results);
							
							
							/*
							autoOpenListPanel();
							if($('#directions-panel').length==0){$('#selectedPlaceList_area').append('<div id="directions-panel">')}
							if($('#directions').length==0){$('#directions-panel').append('<div id="directions">')}
							listTabs("directions");
							var directionsDisplay = jObj.gmap('get','services > DirectionsRenderer')
							directionsDisplay.setPanel(document.getElementById('directions'));
							directionsDisplay.setDirections(results);
							google.maps.event.addListener(directionsDisplay, 'directions_changed', function() {destroy_Dirscrollbar();setup_Dirscrollbar($('#directions-panel'));}); 	
							if($('#directions-panel #output').length==0)$('#directions-panel').prepend('<div id="output"><a href="#" id="printDir">Print</a><a href="#" id="emailDir">Email</a></div>');
							
							addEmailDir();
							*/
						});
				} else {
					$.colorbox({
						html:function(){
							return '<div id="errorReporting"><h2>Error</h2><h3>Google couldn\'t pull up the directions, Please try again</h3><h4>Google was having a hard time finding your location for this reason:'+ status +' </h4></div>';
						},
						scrolling:false,
						opacity:0.7,
						transition:"none",
						width:450,
						open:true,
						onComplete:function(){prep();
							$.colorbox.resize();
						}
					});
				}
				$('#loading').remove();
			});
		}
	}	
	
}


function reset_Listscrollbar(){
	if(apiL!=null){
		destroy_Listscrollbar(function(){
			setup_Listscrollbar($('#listing'));
			//apiL.reinitialise();
		});
	}
	
}
function reset_Dirscrollbar(){
	if(apiD!=null){
		destroy_Dirscrollbar(function(){
			setup_Dirscrollbar($('#directions-panel'));
			//apiD.reinitialise();
		});
	}
	
}

function destroy_Listscrollbar(callback){
	if(apiL!=null && !$.isEmptyObject(apiL.jObj)){apiL.destroy();apiL=null;}
	if($.isFunction(callback))callback();
}
function destroy_Dirscrollbar(callback){
	if(apiD!=null && !$.isEmptyObject(apiD.jObj)){apiD.destroy();apiD=null;}
	if($.isFunction(callback))callback();
}
function setup_Listscrollbar(jObj){
	if(typeof(jObj)!="undefined"){
		apiL!=null;
		jObj.removeAttr('height');
		
		jObj.find('.cAssest').removeAttr('style');
		
		jObj.height($('#selectedPlaceList_area').height()-(typeof(jObj.css("margin-top"))!=="undefined"?jObj.css("margin-top").split('px')[0]:0) );
		
		var settings = {
			//showArrows: true
		};
		var pane = jObj;
		pane.jScrollPane(settings);
		apiL = pane.data('jsp');
		$.extend(apiL,{jObj:jObj});
		$.extend(apiL,{settings:settings});
	}
}
function setup_Dirscrollbar(jObj){
	if(typeof(jObj)!="undefined"){
		jObj.removeAttr('height');
		jObj.find('.cAssest').removeAttr('style');
		jObj.height($('#selectedPlaceList_area').height()-(typeof(jObj.css("margin-top"))!=="undefined"?jObj.css("margin-top").split('px')[0]:0) );
		
		var settings = {
			//showArrows: true
		};
		var pane = jObj;
		pane.jScrollPane(settings);
		apiD = pane.data('jsp');
		$.extend(apiD,{jObj:jObj});
		$.extend(apiD,{settings:settings});
	}
}


function reset_listings(){
	if(!$('#selectedPlaceList').is($('.ini'))){
		destroy_Dirscrollbar(function(){
			destroy_Listscrollbar(function(){
				$('#selectedPlaceList').width()>0?$('#selectedPlaceList_btn').trigger('click'):null;
				$('#selectedPlaceList').addClass('ini');
				$('#selectedPlaceList_area').html("");
			});
		});
	}
	$('#selectedPlaceList_btn').css('display',"none");
}
function menuDressChild(jObj){
	if(jObj.is($('.parent'))){
		var self_active = jObj.is($('.active'));
		$('#main_nav .active').removeClass('active');
		$('.checked').removeClass('checked');
		$('.childSelected').removeClass('childSelected');
		if(!self_active)jObj.addClass('active');	
	}else{
		jObj.closest('li').toggleClass('checked');
		jObj.closest('.parent').addClass('active');
		jObj.closest('.parent').find('.parentalLink').addClass('childSelected');
		jObj.closest('.depth_3').closest('.depth_2.checked').removeClass('checked');
	}
}
function setup_nav(jObj){
	$('#main_nav li.parent:not(".altAction")').off().on('click',function(e){
		e.stopPropagation();
		e.preventDefault();
		menuDressChild($(this));
		if(ib.length>0)$.each(ib, function(i) {ib[i].close();});
		jObj.gmap('clear','markers');
		jObj.gmap('clear','overlays');
		if($(this).is($('.active'))){
			setup_Navscrollbar();
			updateMap(jObj,encodeURI($(this).find('a:first').attr('href').split('=')[1]));
		}else{
			reset_listings();
			reset_Navscrollbar();
		}
	});
	$('#main_nav .parent li a').off().on('click',function(e){
		e.stopPropagation();
		e.preventDefault();
		menuDressChild($(this));
		if(ib.length>0)$.each(ib, function(i) {ib[i].close();});
		jObj.gmap('clear','markers');
		jObj.gmap('clear','overlays');
		var params='';
		if($('li.checked a').length){
			$.each($('li.checked a'),function(){
				params=params+$(this).attr('href').split('=')[1]+',';
			});
			reset_Navscrollbar();
			updateMap(jObj,encodeURI(params.substring(0, params.length - 1)),true);
		}else{
			destroy_Navscrollbar(function(){});
			$(this).closest('.parent').find('.parentalLink').trigger('click');
		}
	});
	
}
var api_nav=null;
function setup_Navscrollbar(){
	
	var settings = {
		maintainPosition:false
		//showArrows: true
	};
	var pane = $("#navwrap");
	pane.jScrollPane(settings);
	api_nav = pane.data('jsp');
}
function reset_Navscrollbar(){
	if(api_nav!=null){
		
		destroy_Navscrollbar(function(){
			setup_Navscrollbar();
		});
	}
}
function destroy_Navscrollbar(callback){
	if(api_nav!=null && !$.isEmptyObject(api_nav.jObj)){api_nav.scrollToY(0);api_nav.destroy();api_nav=null;}
	if($.isFunction(callback))callback();
}




function makeEmbeder(){
	
		
		$.colorbox({
			rel:'gouped',
			html:function(){
				
				return '<div id="embedArea"><h2>Page Link</h2><h3 id="ebLink"><em id="linkurl">#</em> <a id="ebLink_con" class="buttons ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only" title="Copy this item" href="#" style="background:url(../../../Content/wsu_ui/images/ui-bg_glass_40_c6b8ba_1x400.png) repeat-x scroll 50% 50% #3B4044;" ><span  id="ebLink_but" class="ui-icon ui-icon-clipboard"></span></a></h3><hr/><h2> Embed code <a id="customEmbed" href="#" class=" ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only" style="display:inline-block;background:url(../../../Content/wsu_ui/images/ui-bg_glass_40_c6b8ba_1x400.png) repeat-x scroll 50% 50% #3B4044;"><span class="ui-icon ui-icon-gear"></span></a></h2><textarea id="embedCode"  style="border: medium none; resize: none;" disabled="disabled"><iframe  width="495" height="372"  frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="#" ></iframe></textarea><div id="d_clip_container" style="position:relative"><div id="d_clip_button" class="my_clip_button"><b><span class="ui-icon ui-icon-clipboard" style="float:right;"></span>Copy To Clipboard...</b></div></div><div id="custom" style="display: none;"><h2>Customize</h2><label><input type="radio" value="s" name="size"/>Small <em>(214 x 161)</em></label><br/><label><input type="radio" value="m" name="size"/>Medium <em>(354 x 266)</em></label><br/><label><input type="radio" checked="checked" name="size" value="l"/>Large <em>(495 x 372)</em></label><br/><label><input type="radio" name="size" value="xl"/>Largest <em>(731 x 549)</em></label><br/><label><input type="radio" value="c" name="size"/>Custom</label><br/><div id="cSize" style="display: none; font-size:12px;">Width:<input id="w" value="" style="width:50px;" /> Height<input id="h" value=""  style="width:50px;" /></div></div><a href="#" id="request">Request access to WSU map manager to create your own map.&raquo;</a></div>';	
			},
			scrolling:false,
			opacity:0.7,
			transition:"none",
			width:450,
			open:true,
			onComplete:function(){

				clip = new ZeroClipboard.Client();
				clip.setHandCursor( true );
				clip.setText($('#embedCode').text());
				clip.addEventListener('complete', function (client, text) {
					alert("Copied code to your clipboard: ");
				});
				clip.glue( 'd_clip_button', 'd_clip_container' );
		
				clipL = new ZeroClipboard.Client();
				clipL.setHandCursor( true );
				clipL.setText($('#ebLink').text());
				clipL.addEventListener('complete', function (client, text) {
					alert("Copied link to your clipboard: ");
				});
				clipL.glue( 'ebLink_but', 'ebLink_con' );
				getSmUrl("",function(url){
					$('#linkurl').text(url);
					clipL.setText(url);
				});
				getSmUrl("eb=true",function(url){
					$('#embedCode').text('<iframe width="495" height="372" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="'+url+'" ></iframe>');
					clip.setText($('#embedCode').text());
				});
		
				$('#customEmbed').off().on('click',function(){
					$('#custom').slideToggle('fast', function() {
					   $.colorbox.resize();
						$('input[name="size"]').off().on('change',function(){
							var val = $(this).val();
							function changeEmText(w,h){
								getSmUrl("eb=true",function(url){
										var code = '<iframe width="'+w+'" height="'+h+'" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="'+url+'" ></iframe>';
										$('#embedCode').text(code);
										clip.setText(code);
								});
							}
							function dynoSize(){
								if(!$('#cSize').is(':visible')){
									$('#cSize').slideToggle('fast', function() {
									   $.colorbox.resize();
									});
								}
								$('#cSize input').off().on('keyup',function(){
									changeEmText($('#w').val(),$('#h').val());
								});
							}
							switch(val){
								case "s":
									if($('#cSize').is(':visible'))$('#cSize').slideToggle();
									changeEmText(214,161);
									break;
								case "m":
									if($('#cSize').is(':visible'))$('#cSize').slideToggle();
									changeEmText(354,266);
									break;
								case "l":
									if($('#cSize').is(':visible'))$('#cSize').slideToggle();
									changeEmText(495,372);
									break;
								case "xl":
									if($('#cSize').is(':visible'))$('#cSize').slideToggle();
									changeEmText(731,549);
									break;
								case "c":
									dynoSize();
									break;
							}
						});
					});
				});

				
				
				makeRequestCustom();
			}
		});	
	}
function makeRequestCustom(){
		$('#request').off().on('click',function(){
			//$.colorbox.close();
			$.colorbox({
				html:function(){
					return '<div id="emailRequest"><form action="../public/emailRequest.castle" method="post">'+
								'<h2>Want to make your own map?</h2>'+
								'<h4>Please provide you email and as much information about your needs.</h4>'+
								'<lable>Your Name:<br/><input type="text" value="" required placeholder="First and Last" name="name"></lable><br/>'+
								'<lable>Your Email:<br/><input type="email" value="" required placeholder="Your email address" id="email" name="email"></lable><br/>'+
								'<lable>Deparment:<br/><select name="Deparments"><option value="">Select your department</option></select></lable><br/>'+
								'<lable>Notes on your needs: <br/>'+
								'<textarea required placeholder="Some notes" name="notes"></textarea></lable><br/>'+
								'<br/><input type="Submit" id="requestSubmit" value="Submit"/><br/>'+
								'<a href="#" id="embedback">&laquo; Back to custom embedding</a>'+
							'</from></div>';
				},
				scrolling:false,
				opacity:0.7,
				transition:"none",
				width:450,
				//height:450,
				open:true,
				onComplete:function(){prep();
					if($('#colorbox #cb_nav').length)$('#colorbox #cb_nav').html("");
					$.colorbox.resize();
					
					$('#embedback').off().on('click',function(e){
						makeEmbeder();
					});
						
					$('#emailRequest [type="Submit"]').off().on('click',function(e){
						e.stopPropagation();
						e.preventDefault();
						$('#valid').remove();
						var valid=true;
						$.each($('#emailRequest [required]'),function(){
							if($(this).val()=="")valid=false;
						});
						
						if(valid){
							$.post($('#emailRequest form').attr('action'), $('#emailRequest form').serialize(),function(data){
								if(data=="email:false"){
									$('#emailRequest').prepend("<div id='valid'><h3>Your email is not a valid email.  Please enter it again</h3></div>");
									$('#email').focus();
									$.colorbox.resize();
								}else{
									$('#emailRequest').html('<h2>You will recive an email shortly as a copy.</h2>'+'');
									$.colorbox.resize();
								}
							});
						}else{
							if($('#valid').length==0)$('#emailRequest').prepend("<div id='valid'><h3>Please completely fill out the form.</h3></div>");
							$.colorbox.resize();
						}
					});
				}
			});
		});
	}
function setup_embeder(){
	$('#embed').click(function(e){
		e.stopPropagation();
		e.preventDefault();
		var trigger=$(this);
		$.colorbox.remove();
		makeEmbeder();

		
		

	});
}

function addErrorReporting(marker){
$('.errorReporting').click(function(e){
		e.stopPropagation();
		e.preventDefault();
		var trigger=$(this);
		$.colorbox({
			html:function(){
				return '<div id="errorReporting"><form action="../public/reportError.castle" method="post">'+
							'<h2>Found an error?</h2>'+
							'<h3>Please provide some information to help us correct this issue.</h3>'+
							'<input type="hidden" value="'+marker.id+'" name="place_id"/>'+
							'<lable>Name:<br/><input type="text" value="" required placeholder="First and Last" name="name"/></lable><br/>'+
							'<lable>Email:<br/><input type="email" value="" required placeholder="Your email address"  name="email"/></lable><br/>'+
							'<lable>Type:<br/><select name="issueType" required><option value="">Choose</option><option value="tech">Technical</option><option value="local">Location</option><option value="content">Content</option></select></lable><br/>'+
							'<lable>Describe the issues: <br/>'+
							'<textarea required placeholder="Description" name="description"></textarea></lable><br/>'+
							'<br/><input type="Submit" id="errorSubmit" value="Submit"/><br/>'+
						'</from></div>';
			},
			scrolling:false,
			opacity:0.7,
			transition:"none",
			width:450,
			//height:450,
			open:true,
			onComplete:function(){prep();
				if($('#colorbox #cb_nav').length)$('#colorbox #cb_nav').html("");
				$('#errorReporting [type="Submit"]').off().on('click',function(e){
					e.stopPropagation();
					e.preventDefault();
					var valid=true;
					$.each($('#errorReporting [required]'),function(){
						if($(this).val()=="")valid=false;
					});
					
					if(valid){
						$.post($('#errorReporting form').attr('action'), $('#errorReporting form').serialize(),function(){
							$.jtrack.trackEvent(pageTracker,"error reporting", "submited", $('[name="issueType"]').val());
							$('#errorReporting').html('<h2>Thank you for reporting the error.</h2>'+'');
							$.colorbox.resize();
						});
					}else{
						if($('#valid').length==0)$('#errorReporting').prepend("<div id='valid'><h3>Please completely fill out the form so we may completely help you.</h3></div>");
					}
				});
			}
		});
	});	
	
}
function addEmailDir(){
$('#emailDir').off().on('click',function(e){
		e.stopPropagation();
		e.preventDefault();
		var trigger=$(this);
		$.colorbox({
			html:function(){
				return '<div id="emailDirs"><form action="../public/emailDir.castle" method="post">'+
							'<h2>Want to email the directions?</h2>'+
							'<h4>Please provide you email and the email of the person you wish to send the directions to.</h4>'+
							'<textarea name="directions" style="position:absolute;top:-9999em;left:-9999em;">'+$('#directions-panel').html()+'</textarea>'+
							'<lable>Your Name:<br/><input type="text" value="" required placeholder="First and Last" name="name"></lable><br/>'+
							'<lable>Your Email:<br/><input type="email" value="" required placeholder="Your email address" id="email" name="email"></lable><br/>'+
							'<lable>Recipient Name:<br/><input type="text" value="" required placeholder="First and Last" name="recipientname"></lable><br/>'+
							'<lable>Recipient Email:<br/><input type="email" value="" required placeholder="Destination email address" id="recipientemail" name="recipientemail"></lable><br/>'+
							'<lable>Notes to recipient: <br/>'+
							'<textarea required placeholder="Some notes on the directions" name="notes"></textarea></lable><br/>'+
							'<br/><input type="Submit" id="errorSubmit" value="Submit"/><br/>'+
						'</from></div>';
			},
			scrolling:false,
			opacity:0.7,
			transition:"none",
			width:450,
			//height:450,
			open:true,
			onComplete:function(){prep();
				if($('#colorbox #cb_nav').length)$('#colorbox #cb_nav').html("");
				$.colorbox.resize();	
				$('#emailDirs [type="Submit"]').off().on('click',function(e){
					e.stopPropagation();
					e.preventDefault();
					$('#valid').remove();
					var valid=true;
					$.each($('#emailDirs [required]'),function(){
						if($(this).val()=="")valid=false;
					});
					
					if(valid){
						$.post($('#emailDirs form').attr('action'), $('#emailDirs form').serialize(),function(data){
							if(data=="email:false"){
								$('#emailDirs').prepend("<div id='valid'><h3>Your email is not a valid email.  Please enter it again</h3></div>");
								$('#email').focus();
								$.colorbox.resize();
							}else if(data=="recipientemail:false"){
								$('#emailDirs').prepend("<div id='valid'><h3>The recipient's email is not a valid email.  Please enter it again</h3></div>");
								$('#recipientemail').focus();
								$.colorbox.resize();
							}else{
								$('#emailDirs').html('<h2>You will recive an email shortly as a copy.</h2>'+'');
								$.colorbox.resize();
							}
						});
					}else{
						if($('#valid').length==0)$('#emailDirs').prepend("<div id='valid'><h3>Please completely fill out the form.</h3></div>");
					}
				});
			}
		});
	});		
}

/* these are very central map items */
function setup_pdfprints(){
	$('#printPdfs').click(function(e){
		e.stopPropagation();
		e.preventDefault();
		var trigger=$(this);
		$.colorbox.remove();
		$.colorbox({
			html:function(){
				return '<div id="printPdfs">'+
							'<h2>Printable Maps</h2>'+
							'<div><h3><a href="http://www.parking.wsu.edu/utils/File.aspx?fileid=2965" target="_blank">Parking<br/><span id="parking" style="background-image:url('+siteroot+'Content/images/print/parking_icon.jpg);"></span></a></h3></div>'+
							'<div><h3><a href="http://map.wsu.edu/pdfs/areamap0406.pdf" target="_blank">Area<br/><span id="area" style="background-image:url('+siteroot+'Content/images/print/area_icon.jpg);"></span></a></h3></div>'+
							'<div class="last"><h3><a href="http://map.wsu.edu/pdfs/washingtonmap.pdf" target="_blank">Washington State<br/><span id="state" style="background-image:url('+siteroot+'Content/images/print/state_icon.jpg);"></span></a></h3></div>'+
						'</div>';
			},
			scrolling:false,
			opacity:0.7,
			transition:"none",
			width:710,
			height:350,
			open:true,
			onComplete:function(){
				if($('#colorbox #cb_nav').length)$('#colorbox #cb_nav').html("");
				$.each($('#printPdfs a'),function(){
					var self = $(this); 
					self.off().on('click',function(e){
						$.jtrack.trackEvent(pageTracker,"pdf", "clicked", self.text());
					});
				});
			}
		});
	});	
}




function setup(jObj){
	$('#loading').remove();
	if(typeof(startingUrl)!="undefined"){
		updateMap($('#centralMap'),encodeURI(startingUrl.indexOf("&")?startingUrl.split('=')[1].split('&')[0]:startingUrl.split('=')[1]),false,function(){
				if(parseInt(startingUrl.split('=')[2])>0){
					var marker = markerbyid[parseInt(startingUrl.split('=')[2])];
					//google.maps.event.trigger(marker, 'click');
					$(marker).triggerEvent('click');
				}
			});
		var link = startingUrl.split('=')[1].split('&')[0].toString(); 
		//alert(link);
		if(startingUrl.split('=')[1].indexOf(',')>0){
			$.each(startingUrl.split('=')[1].split(','),function(i,v){
				menuDressChild($('#main_nav a[href$="'+v+'"]'));
			});
		}else{
			menuDressChild($('#main_nav a[href$="'+link+'"]'));
		}		
	}


	setup_listingsBar($('#centralMap'));
	setup_directions($('#centralMap'));
	setup_nav($('#centralMap'));
	setup_embeder();
	
	
	setup_pdfprints();

	if($( "#placeSearch input[type=text]" ).length){
		setup_mapsearch($('#centralMap'));
		/* EOF Search autocomplete */
	}
	if($('.veiw_base_layout.public').length){
		function reloadPlaces(){
			var url=siteroot+"public/getPlaceJson_byIds.castle";
			if(typeof(ids)!="undefined"){
				$.getJSON(url+'?callback=?&ids[]='+ids.replace(", 0",""), function(data) {
					$.each(ib, function(i) {ib[i].close();});
					$('#centralMap').gmap('clear','markers');
					
					loadData($('#centralMap'),data,null,function(marker){
						//ib[0].open($('#centralMap').gmap('get','map'), marker);
						//cur_mid = mid[0];
					});
					prep();
				});
			}	
		}
		function reloadShapes(){
			var url=siteroot+"public/getShapesJson_byIds.castle";
			var jObj=$('#centralMap');
			
			if(typeof(ids)!="undefined"){
				$.getJSON(url+'?callback=?&ids[]='+sids.replace(", 0",""), function(data) {
					$('#centralMap').gmap('clear','overlays');
					$.each( data.shapes, function(i, shape) {	
						addShapeToMap($('#centralMap'),i, shape);
					});
				});
			}
		}
		
		reloadShapes();
		reloadPlaces();
	}
	/* EFO Other after gmap ini */
}






























$(function(){
	$(window).resize(function(){
		if($(window).width()<=320){
			$('html').removeClass('narrow');
			$('html').addClass('mobile');
		}else if($(window).width()<=600){
			$('html').addClass('narrow');
			$('html').removeClass('mobile');
		}else{
			$('html').removeClass('narrow');
			$('html').removeClass('mobile');
		}
	}).trigger("resize");
	var listOffset=0;
	
	if( $('[placeholder]').length ){ $(' [placeholder] ').defaultValue(); } // 
	
	if($('#centralMap').length){
		mapInst=$('#centralMap');
		mapInst.append('<img src="/Content/images/loading.gif" style="position:absolute; top:50%; left:50%;" id="loading"/>');
		if($('.veiw_base_layout').length){
			ini_map_view(mapInst,setup);
		}else{
			iniMap("",setup);
		}
		if(mapInst.length){
			$(window).resize(function(){
				
				// can't us mapInst here cause it's still in the admin area.  Split that.
				resizeBg($('.central_layout.public.central #centralMap'),($('.embeded').length?0:($(window).height()<=404?0:130)),($('.embeded').length?0:($(window).width()<=404?0:($(window).width()<=600?155:201))) + $('#selectedPlaceList').width())
			}).trigger("resize");
			$(window).resize(function(){
				// can't us mapInst here cause it's still in the admin area.  Split that.
				$('#navwrap').height($('#centralMap_wrap').height());
				resizeBg($('.cAssest'),($('.embeded').length?0:130));
				
				reset_Dirscrollbar();
				reset_Listscrollbar();
				reset_Navscrollbar();
				//if($('#listing').length)setup_scrollbar($('#listing'));
				
			}).trigger("resize");
		}
	}

	$('#resetmap').on('click',function(e){
		e.stopPropagation();
		e.preventDefault();
		
		reset_listings();
		$('#main_nav').find('.active').removeClass('active');
		
		if(typeof($.jtrack)!=="undefined")$.jtrack.trackEvent(pageTracker,"Map status", "Reset");
		//google.maps.event.clearListeners(mapInst.gmap("get","map")); 
		//$('.mapControl').remove();
		mapInst.gmap("destroy",function(ele){
			mapInst.html('');
			$('.mapControl').remove(); 
			if($('.veiw_base_layout').length){
				ini_map_view(mapInst,setup);
			}else{
				iniMap("",setup);
			}
			$(window).trigger("resize");
			//alert("done");
		});
	});
});