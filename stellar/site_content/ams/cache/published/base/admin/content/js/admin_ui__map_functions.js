
/* 
 * DEFAULT_overlay=apply_element(map,type,_option);  << that needs fixed
 * with paths: get_wsu_logo_shape(), as option
 * TODO besides listed above is circle and rec and marker
 */
function set_default_shape(mapSelector,type,op){
	var capedType=type[0].toUpperCase() + type.slice(1)
	if(typeof(op)==='undefined')op={};
	switch(type){
		case "polygon" :
			// default ploygon style
				_option = {
						rest:{
							options:$.extend((typeof(op.rest)!=='undefined'?op.rest:{strokeColor: "#5f1212",strokeOpacity:0.24,strokeWeight: 2,fillColor: "#5f1212",fillOpacity: 0.24}),{paths: get_wsu_logo_shape()})
						},
						mouseover:{
							options:typeof(op.mouseover)!=='undefined'?op.mouseover:{fillColor: "#a90533",fillOpacity: 0.35}
						},
						mouseout:{
							options:typeof(op.mouseout)!=='undefined'?op.mouseout:{fillColor: "#a90533",fillOpacity: 0.35}
						},
						click:{
							options:typeof(op.click)!=='undefined'?op.click:{fillColor: "#a90533",fillOpacity: 0.35}
						}
					}
				DEFAULT_overlay=apply_element(mapSelector,capedType,_option);
				return DEFAULT_overlay;
			break;
		case "rectangle" :
				return null;
			break;
		case "circle" :
				return null;
			break;			
		case "polyline" :
			// default ploygon style
			DEFAULT_polylines = [];
			var polyline =get_wsu_logo_shape();
					if(polyline.length){
						for(i=0; i<=polyline.length-1; i++){
							_option = {
								rest:{
									options:$.extend(typeof(op.rest)!=='undefined'?op.rest:{strokeColor: "#5f1212",strokeOpacity: 0.24,strokeWeight: 2},{path: polyline[i]})
								},	
								mouseover:{
									options:typeof(op.mouseover)!=='undefined'?op.mouseover:{strokeColor: "#a90533",strokeOpacity: 0.35}
								},	
								mouseout:{
									options:typeof(op.mouseout)!=='undefined'?op.mouseout:{strokeColor: "#a90533",strokeOpacity: 0.35}
								},	
								click:{
									options:typeof(op.click)!=='undefined'?op.click:{strokeColor: "#a90533",strokeOpacity: 0.35}
								}
							}
							DEFAULT_overlay=apply_element(mapSelector,capedType,_option);
							DEFAULT_polylines.push(DEFAULT_overlay);
							google.maps.event.addListener(DEFAULT_overlay,"mouseover",function (){
								for(i=0; i<=DEFAULT_polylines.length-1; i++){
									DEFAULT_polylines[i].setOptions({strokeColor: "#a90533"}); 
								}
							});  
							google.maps.event.addListener(DEFAULT_overlay,"mouseout",function (){
								for(i=0; i<=DEFAULT_polylines.length-1; i++){
									DEFAULT_polylines[i].setOptions({strokeColor: "#5f1212"}); 
								}
							});
						}
					}
					/*_option = {path:[
						new google.maps.LatLng("46.732537","-117.160091"),
						new google.maps.LatLng("46.732596","-117.146745")
						]
					,strokeColor: "#5f1212",strokeOpacity:1,strokeWeight:10};
					apply_element(map,capedType,_option);*/
				return polyline;
			break;				
		case "marker" :
				return null;
			break;
	};
}



/* rework to move into the default cache folder */
function get_wsu_logo_shape(){
	var Coords = [];
	var shaped = [];
	var shape = "-117.151680,46.737567,\n-117.152281,46.737390,\n-117.152753,46.737067,\n-117.153225,46.736655,\n-117.153397,46.736155,\n-117.153482,46.735449,\n-117.153268,46.734831,\n-117.153053,46.733949,\n-117.152710,46.732919,\n-117.152581,46.732331,\n-117.152538,46.731743,\n-117.152710,46.731066,\n-117.153010,46.730684,\n-117.153568,46.730390,\n-117.154341,46.730272,\n-117.155242,46.730272,\n-117.155199,46.730860,\n-117.155199,46.731301,\n-117.155800,46.730772,\n-117.156572,46.730125,\n-117.157817,46.729537,\n-117.156658,46.729448,\n-117.155199,46.729331,\n-117.153826,46.729213,\n-117.152796,46.729095,\n-117.151937,46.729125,\n-117.151251,46.729389,\n-117.150650,46.729860,\n-117.150350,46.730419,\n-117.150307,46.731184,\n-117.150650,46.732272,\n-117.150865,46.733155,\n-117.151165,46.734243,\n-117.151079,46.734978,\n-117.150693,46.735419,\n-117.150092,46.735861,\n-117.149405,46.736037,\n-117.148547,46.736008,\n-117.148204,46.735861,\n-117.147861,46.735567,\n-117.147560,46.735184,\n-117.147517,46.735684,\n-117.147646,46.736155,\n-117.147517,46.736390,\n-117.147517,46.736655,\n-117.145371,46.736684,\n-117.145371,46.736861,\n-117.147517,46.736890,\n-117.147560,46.737008,\n-117.145500,46.737272,\n-117.145543,46.737449,\n-117.147646,46.737243,\n-117.147646,46.737361,\n-117.145715,46.737831,\n-117.145844,46.738037,\n-117.147903,46.737596,\n-117.148204,46.737831,\n-117.150393,46.737714,\n-117.150092,46.738714,\n-117.150393,46.738714,\n-117.150865,46.737655,\n-117.151294,46.737655,\n-117.150865,46.738772,\n-117.151122,46.738743";
	
	var Rows=shape.split('\n');
	if(Rows.length){
		for(i=0; i<=Rows.length-1; i++){
			var cord=Rows[i].split(',');
			shaped.push(new google.maps.LatLng(parseFloat(cord[1]),parseFloat(cord[0])));
		}
	}
	Coords.push(shaped.reverse());
	var shaped = [];
	var shape = "-117.149577,46.736390,\n-117.150435,46.736537,\n-117.150908,46.736508,\n-117.151508,46.736449,\n-117.151937,46.736243,\n-117.152238,46.735949,\n-117.152367,46.735537,\n-117.152023,46.735743,\n-117.151594,46.736037,\n-117.151122,46.736184,\n-117.150564,46.736302,\n-117.150221,46.736361";
	
	var Rows=shape.split('\n');
	if(Rows.length){
		for(i=0; i<=Rows.length-1; i++){
			var cord=Rows[i].split(',');
			shaped.push(new google.maps.LatLng(parseFloat(cord[1]),parseFloat(cord[0])));
		}
	}
	Coords.push(shaped);
	var shaped = [];
	var shape = "-117.153010,46.737331,\n-117.154212,46.737037,\n-117.155070,46.736625,\n-117.156014,46.736155,\n-117.156487,46.735831,\n-117.155628,46.735214,\n-117.155328,46.735449,\n-117.155285,46.734802,\n-117.155242,46.734008,\n-117.155714,46.734449,\n-117.156143,46.734772,\n-117.155929,46.734978,\n-117.156658,46.735625,\n-117.157130,46.735214,\n-117.157688,46.734537,\n-117.157903,46.734096,\n-117.156873,46.733508,\n-117.156744,46.733772,\n-117.156487,46.733361,\n-117.156487,46.732919,\n-117.156572,46.732507,\n-117.156701,46.732213,\n-117.156959,46.732655,\n-117.157216,46.732890,\n-117.157044,46.733272,\n-117.157946,46.733802,\n-117.158418,46.733066,\n-117.158976,46.732302,\n-117.159662,46.731566,\n-117.160220,46.731154,\n-117.159019,46.731301,\n-117.158074,46.731478,\n-117.158160,46.730860,\n-117.158504,46.730095,\n-117.159019,46.729507,\n-117.158160,46.729684,\n-117.157130,46.730154,\n-117.156229,46.730860,\n-117.155457,46.731625,\n-117.155156,46.732184,\n-117.154899,46.731596,\n-117.154813,46.730566,\n-117.154427,46.730537,\n-117.153912,46.730566,\n-117.153482,46.730743,\n-117.153654,46.730713,\n-117.153225,46.731007,\n-117.153010,46.731507,\n-117.153010,46.732184,\n-117.153139,46.733008,\n-117.153397,46.733713,\n-117.153654,46.734537,\n-117.153869,46.735302,\n-117.153869,46.735919,\n-117.153783,46.736419,\n-117.153482,46.736802,\n-117.153311,46.737067,\n-117.153010,46.737331";	
	var Rows=shape.split('\n');
	if(Rows.length){
		for(i=0; i<=Rows.length-1; i++){
			var cord=Rows[i].split(',');
			shaped.push(new google.maps.LatLng(parseFloat(cord[1]),parseFloat(cord[0])));
		}
	}
	Coords.push(shaped);
	var shaped = [];
	var shape = "-117.150521,46.733684,\n-117.150435,46.733066,\n-117.150307,46.732537,\n-117.150092,46.732096,\n-117.149792,46.731596,\n-117.149448,46.731213,\n-117.148976,46.730919,\n-117.148461,46.730801,\n-117.148075,46.730772,\n-117.147689,46.730801,\n-117.147346,46.730949,\n-117.147045,46.731125,\n-117.146745,46.731449,\n-117.146616,46.731860,\n-117.146616,46.732243,\n-117.146702,46.732743,\n-117.146788,46.733213,\n-117.146916,46.733508,\n-117.147131,46.733919,\n-117.147088,46.733537,\n-117.147088,46.733155,\n-117.147217,46.732802,\n-117.147431,46.732478,\n-117.147818,46.732272,\n-117.148290,46.732184,\n-117.148719,46.732213,\n-117.149277,46.732419,\n-117.149620,46.732625,\n-117.150006,46.732919,\n-117.150221,46.733155,\n-117.150350,46.733390,\n-117.150521,46.733684";	
	var Rows=shape.split('\n');
	if(Rows.length){
		for(i=0; i<=Rows.length-1; i++){
			var cord=Rows[i].split(',');
			shaped.push(new google.maps.LatLng(parseFloat(cord[1]),parseFloat(cord[0])));
		}
	}
	Coords.push(shaped);
	var shaped = [];
	var shape = "-117.150006,46.730154,\n-117.150221,46.729684,\n-117.150693,46.729331,\n-117.151165,46.729125,\n-117.149706,46.729095,\n-117.149749,46.729566,\n-117.149835,46.729890,\n-117.150006,46.730154";	
	var Rows=shape.split('\n');
	if(Rows.length){
		for(i=0; i<=Rows.length-1; i++){
			var cord=Rows[i].split(',');
			shaped.push(new google.maps.LatLng(parseFloat(cord[1]),parseFloat(cord[0])));
		}
	}
	Coords.push(shaped);
	return Coords;
}





/*
 * puts element on map via set map 
 * mapOjb thru $(selector) set by $(selector).gmap()
 * type Marker|Polyline|etc
 *
 * style {
 * 		rest:{options:{},callback:function(){}},
 * 		hover:{options:{},callback:function(){}}
 * }
 *
*/
function apply_element(mapOjb,type,style){
	mapOjb.gmap('addShape', type, filter_map_element(type,style.rest.options), function(shape){
		$(shape).click(function(){
			if(style.click){
				if(style.click.options)mapOjb.gmap('setOptions',filter_map_element(type,style.click.options),this);
				if(style.click.callback)style.click.callback();
			}
		 }).mouseover(function(){
			 if(style.mouseover){
				 if(style.mouseover.options)mapOjb.gmap('setOptions',filter_map_element(type,style.mouseover.options),this);
				 if(style.mouseover.callback)style.mouseover.callback();
			 }
		}).mouseout(function(){
			if(style.rest){
				if(style.rest.options)mapOjb.gmap('setOptions',filter_map_element(type,style.rest.options),this);
				if(style.rest.callback)style.rest.callback();
			}
		}).dblclick(function(){
			if(style.dblclick){
				if(style.dblclick.options)mapOjb.gmap('setOptions',filter_map_element(type,style.dblclick.options),this);
				if(style.dblclick.callback)style.dblclick.callback();
			}
		})
		.trigger('mouseover')
		.trigger('mouseout');
	});
	/*,
	rightclick: function(){
		if(style.dblclick){
			if(style.rightclick.options)mapOjb.gmap('get','map').setCenter(filter_map_element(type,style.rightclick.options),this);
			if(style.rightclick.callback)style.hover.callback();
		}
	}*/
}



function rebuild_example(tabs,mapSelector,type){
	var _op={};
	$.each(tabs, function(){
		var tab = $(this);
		var mode = tab.closest('.tabed').attr('id');//.split('__')[1].split('_')[1];
		var ele = tab.find(':input').not('h3 :input,input:hidden');
		
		
		var options={}
			if(
				( ele.is(':checked') 
					|| (ele.val()!='' 
						&& ele.not(':checkbox')
						)
					) 
				&& ele.not('[type=hidden]') 
				&& typeof( ele.attr('rel') ) !== 'undefined' 
				){
			   options[ele.attr('rel')]= (ele.is($('.color_picker')) ? '#' : '') +''+ele.val();// changed hasClass for is for speed
			}
		
		_op[ mode ] = $.extend({},_op[ mode ],options); 
	});
	mapSelector.gmap('clear_map');	
	set_default_shape(mapSelector,type,_op);
}




/*
 * returns gmap element options from a possibly dirty source
 * for a type ie:polygon
 *	example:
 *		op={fillColor="#000"}
 *		but type == "polyline"
 *		filter_map_element(type,op) returns op={}
 *		as polyline doesn't support fillColor
 *	
 *	Look to abstarct build from a list may-be since it's just
 *	a filter if in proper json ---euff
*/
function filter_map_element(type,op){
	if(typeof(op)==="undefined"){
		return;
	}
	var _op={};
	typeof(op.clickable)!=="undefined"		?_op.clickable=op.clickable:null;
	typeof(op.visible)!=="undefined"		?_op.visible=op.visible:null;
	typeof(op.zIndex)!=="undefined"		?_op.zIndex=op.zIndex:null;
	
	switch(type.toLowerCase()){
		case "polygon" :
					typeof(op.editable)!=="undefined"		?_op.editable=op.editable:null;
					typeof(op.geodesic)!=="undefined"		?_op.geodesic=op.geodesic:null;
					typeof(op.paths)!=="undefined"			?_op.paths=op.paths:null;
					typeof(op.strokeColor)!=="undefined"		?_op.strokeColor=op.strokeColor:null;
					typeof(op.strokeOpacity)!=="undefined"	?_op.strokeOpacity=op.strokeOpacity:null;
					typeof(op.strokeWeight)!=="undefined"	?_op.strokeWeight=op.strokeWeight:null;
					typeof(op.fillColor)!=="undefined"		?_op.fillColor=op.fillColor:null;
					typeof(op.fillOpacity)!=="undefined"		?_op.fillOpacity=op.fillOpacity:null;
			break;
		case "rectangle" :
					typeof(op.editable)!=="undefined"		?_op.editable=op.editable:null;
					typeof(op.bounds)!=="undefined"			?_op.bounds=op.bounds:null;
					typeof(op.strokeColor)!=="undefined"		?_op.strokeColor=op.strokeColor:null;
					typeof(op.strokeOpacity)!=="undefined"	?_op.strokeOpacity=op.strokeOpacity:null;
					typeof(op.strokeWeight)!=="undefined"	?_op.strokeWeight=op.strokeWeight:null;
					typeof(op.fillColor)!=="undefined"		?_op.fillColor=op.fillColor:null;
					typeof(op.fillOpacity)!=="undefined"		?_op.fillOpacity=op.fillOpacity:null;
			break;
		case "circle" :
					typeof(op.editable)!=="undefined"		?_op.editable=op.editable:null;
					typeof(op.center)!=="undefined"			?_op.center=op.center:null;
					typeof(op.radius)!=="undefined"			?_op.radius=op.radius:null;
					typeof(op.strokeColor)!=="undefined"		?_op.strokeColor=op.strokeColor:null;
					typeof(op.strokeOpacity)!=="undefined"	?_op.strokeOpacity=op.strokeOpacity:null;
					typeof(op.strokeWeight)!=="undefined"	?_op.strokeWeight=op.strokeWeight:null;
					typeof(op.fillColor)!=="undefined"		?_op.fillColor=op.fillColor:null;
					typeof(op.fillOpacity)!=="undefined"		?_op.fillOpacity=op.fillOpacity:null;
			break;			
		case "polyline" :
					typeof(op.editable)!=="undefined"		?_op.editable=op.editable:null;
					typeof(op.geodesic)!=="undefined"		?_op.geodesic=op.geodesic:null;
					typeof(op.path)!=="undefined"		?_op.path=op.path:null;
					typeof(op.strokeColor)!=="undefined"		?_op.strokeColor=op.strokeColor:null;
					typeof(op.strokeOpacity)!=="undefined"	?_op.strokeOpacity=op.strokeOpacity:null;
					typeof(op.strokeWeight)!=="undefined"	?_op.strokeWeight=op.strokeWeight:null;
			break;				
		case "marker" :
					typeof(op.animation)!=="undefined"		?_op.animation=op.animation:null;
					typeof(op.cursor)!=="undefined"			?_op.cursor=op.cursor:null;
					typeof(op.draggable)!=="undefined"		?_op.draggable=op.draggable:null;
					typeof(op.flat)!=="undefined"		?_op.flat=op.flat:null;
					typeof(op.icon)!=="undefined"			?_op.icon=op.icon:null;
					typeof(op.optimized)!=="undefined"		?_op.optimized=op.optimized:null;
					typeof(op.position)!=="undefined"		?_op.position=op.position:null;					
					typeof(op.raiseOnDrag)!=="undefined"		?_op.raiseOnDrag=op.raiseOnDrag:null;					
					typeof(op.shadow)!=="undefined"			?_op.shadow=op.shadow:null;	
					typeof(op.shape)!=="undefined"			?_op.shape=op.shape:null;						
					typeof(op.title)!=="undefined"			?_op.title=op.title:null;	
			break;
	};
	return _op;
}




function build_infobox_content(item){
	if(typeof(item.info)==='undefined'){item.info={};}
	if(typeof(item.info.content)==='undefined'){item.info.content=[];}
	var tabCount=$('#infotabs .ui-tabs-nav li').size();
	if(tabCount>1){
		$.each($('#infotabs .ui-tabs-nav li'),function(i,v){
			var liSelf=$(this);
				item.info.content.push({
					block:function(){
							tinyMCE.triggerSave();
							var index=liSelf.index('#infotabs .ui-tabs-nav li');
							return $('#infotabs .ui-tabs-panel:eq('+index+')').find('textarea').val();
						}(),
					title:liSelf.find('a').text()
				});
			});
	}else{
		item.info.content=$('#infotabs .ui-tabs-panel:eq(0)').find('textarea').val();
	}
	return item;
}
function build_infobox(item){
	if(typeof(item.info)==='undefined' || $.isEmptyObject(item.info) || typeof(item.info.content)==='undefined' || $.isEmptyObject(item.info.content)){
		item=build_infobox_content(item);
	}
	var mainimage = "";
	if($(".placeImages").length){
		mainimage = "<span class='headImage' rel='gouped'><a href='#' class='imgEnlarge'></a><img src='"+siteroot+"media/download.castle?placeid=" + $("#place_id").val() + "&id=" + $(".placeImages").first().val() + "&m=crop&w=148&h=100' title='media/download.castle?placeid=" + $("#place_id").val() + "&id=" + $(".placeImages").first().val() + "' alt='Main Image' class='img-main'/></span>";
	}
	var infoTitle = "";
	if($('#hideTitles:checked').length==0){
		infoTitle = '<h2 class="header">'+ ($("#infoTitle").val()!==''?$("#infoTitle").val():$("#name").val())+'</h2>';
	}
	if($.isArray(item.info.content)){
			var nav='';
			$.each( item.info.content, function(j, html) {	
				nav += '	<li class="ui-state-default ui-corner-top '+( j==0 ?'first ui-tabs-selected ui-state-active':'')+'"><a href="#tabs-'+j+'" hideFocus="true">'+html.title+'</a></li>';
			});
			var content='';
			$.each( item.info.content, function(j, html) {
				content += '<div id="tabs-'+j+'" class="ui-tabs-panel ui-widget-content ui-corner-bottom  '+( j>0 ?' ui-tabs-hide':'')+'"><div class="content">'+infoTitle+(j==0?mainimage:'')+html.block+'</div></div>';
			});
	}else{
		var nav = '	<li class="ui-state-default ui-corner-top  ui-tabs-selected ui-state-active first" ><a href="#tabs-1"  hideFocus="true">Overview</a></li>';
		var content='<div id="tabs-" class="ui-tabs-panel ui-widget-content ui-corner-bottom  "><div class="content">'+infoTitle+mainimage+item.info.content+'</div></div>';
	}

		var box='<div id="taby'+i+'" class="ui-tabs ui-widget ui-widget-content ui-corner-all">'+
					'<ul class="ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all">'+nav+'</ul>'+
					content+
					'<div class="ui-tabs-panel-cap ui-corner-bottom"><span class="arrow"></span></div>'+
				'</div>';
			
	var myOptions = {
		alignBottom:true,
		 content: box//boxText
		,disableAutoPan: false
		,maxWidth: 0
		,height:"340px"
		,pixelOffset: new google.maps.Size(-200, -103)
		,zIndex: 99
		,boxStyle: {
		  width: "400px"
		 }
		,closeBoxHTML:"<span class='tabedBox infoClose'></span>"
		,infoBoxClearance: new google.maps.Size(1,50)
		,isHidden: false
		,pane: "floatPane"
		,enableEventPropagation: false
		,onClose:function(){ibHover =  false;ibOpen=false;}
		,onOpen:function(){
					ibOpen=true;
						ibHover =  true;
						if($(".cWrap").length){
							$('.cWrap a.gouped').on('click',function(e){
								e.preventDefault();
								e.stopImmediatePropagation();
								$('.cWrap a.gouped').colorbox({
									photo:true,
									scrolling:false,
									opacity:0.7,
									transition:"none",
									width:"75%",
									height:"75%",
									slideshow:true,
									slideshowAuto:false,
									open:true
								});
							});
							$('.cWrap .items').cycle({
								fx:     'scrollLeft',
								delay:  -2000,
								pauseOnPagerHover: 1,
								pause:1,
								pager:'.cNav',
								prev:   '.prev',     next:   '.next', 
								pagerAnchorBuilder: function(idx, slide) { return '<li><a href="#" hidefocus="true">'+idx+'</a></li>';} 
							});
							prep();
						}
						$('#taby'+i).tabs();
						var minHeight=0;
						$.each($('#taby'+i+' .ui-tabs-panel'),function() {
							minHeight = Math.max(minHeight, $(this).find('.content').height()); 
						}).css('min-height',minHeight); 
						$('#taby'+i).hover(function(){
							ib[0].setOptions({enableEventPropagation: true});
						},function(){
							ib[0].setOptions({enableEventPropagation: false});
						});
						ib[0].rePosition();
				}
	};
	ib[0] = new InfoBox(myOptions,function(){});
	return item;
}




/* -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */
/* this is where the fuss start and needs to be 
cleaned out or refactored back up the chain here */
function turnOnPOI(){
	var onPOIbiz = [
	  {
		featureType: 'poi',
		elementType: 'geometry',
		stylers: [
		  { visibility: 'on' }
		]
	  }
	];

	var mapType = new google.maps.StyledMapType(onPOIbiz, { name:
'No Stations' });	
	map.mapTypes.set('nostations', mapType);
	map.setMapTypeId('nostations');
}
function turnOffPOI(){
	var offPOIbiz = [
	  {
		featureType: 'poi',
		elementType: 'all',
		stylers: [
		  { visibility: 'off' }
		]
	  }
	];

	var mapType = new google.maps.StyledMapType(offPOIbiz, { name:
'No Stations' });	
	map.mapTypes.set('nostations', mapType);
	map.setMapTypeId('nostations');
	
	
	}

function applyType(type){
	var applyTypeOf = [
	  {
		featureType: 'poi',
		elementType: 'all',
		stylers: [
		  { visibility: 'off' }
		]
	  },
	  {
		featureType: type,
		elementType: 'all',
		stylers: [
		  { visibility: 'on' }
		]
	  }
	];
	var mapType = new google.maps.StyledMapType(applyTypeOf, { name:'No Stations' });	
	map.mapTypes.set('nostations', mapType);
	map.setMapTypeId('nostations');
}

/* check for deletion */	
function getResolution(lat, zoom, tile_side){
  var grid = tile_side || 256;
  var ret = {};
  ret.meterperpixel = 2 * Math.PI * 6378100 * Math.cos(lat * Math.PI/180) / Math.pow(2, zoom) / grid;
  ret.cmperpixel = ret.meterperpixel * 100;
  ret.mmperpixel = ret.meterperpixel * 1000;
  ret.pretty = ( Math.round(ret.meterprepixel) ) + ' meters/px';
  if (ret.meterperpixel < 10)	{ ret.pretty = ( Math.round( ret.meterperpixel * 10 ) / 10 ) +' meters/px';}
  if (ret.meterperpixel < 2)	{ ret.pretty = ( Math.round( ret.cmperpixel ) ) + ' cm/px';}
  if (ret.cmperpixel < 10)		{ ret.pretty = ( Math.round( ret.cmperpixel * 10 ) / 10 ) + ' cm/px';}
  if (ret.cmperpixel < 2) 		{ ret.pretty = ( Math.round( ret.mmperpixel ) ) + ' mm/px';}
  return ret;
}
function setZoomTooltip(){
	var res = getResolution(map.getCenter().lat(), map.getZoom()).pretty;
	var text = 'Zoom = ' + map.getZoom() + '  (' + res + ')';
	var divs = map.getDiv().getElementsByTagName('div');
	for (var i=0, len=divs.length; i<len; i++){
		if (divs[i].title.toLowerCase().indexOf("zoom") > -1) {
			divs[i].title = text;
		}
	}
}




