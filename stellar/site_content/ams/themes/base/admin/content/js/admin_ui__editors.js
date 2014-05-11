var pullman = new google.maps.LatLng(46.73191920826778,-117.15296745300293);

function create_alert(message){
	if($('#alert').length<=0)$('#staging').append('<div id="alert"></div>');
	$('#alert').html(message);
	$('#alert').dialog({
		width:425,
		autoOpen: true,
		modal: true,
		open: function( event, ui ) {$(this).closest('.ui-dialog').find('.ui-dialog-titlebar').hide()},
		buttons:
			[{
				text: "Ok",
		 		click: function() { $( this ).dialog( "close" ); }
			}]
	 });
}






function int_itemListings(){
	int_sharebuttons();
}

function clear_shareArea(callback,delay){
	if($('#sharearea').length){
		if(typeof(delay)=="undefind")delay = 50;
		$('#sharearea').fadeOut(delay,function(){ $('#sharearea').remove(); callback(); });
	}else{
		callback();
	}	
}
function int_sharebuttons(){
	$(".share_btn a").on('click',function(e){
		e.preventDefault();
		e.stopPropagation();
		var self = $(this);
		clear_shareArea(function(){
			self.closest('li.con').find('.summaryCol').append('<div id="sharearea" style="position: absolute; top: 0px; left: 0px; background-color: rgb(255, 255, 255); padding: 15px 7px ; width: 95%; height: 151px ! important;"><h2>Share with someone.</h2><hr/><input type="hidden" value="" id="shareAuto_uid" name="uid"/><input type="hidden" value="" id="shareAuto_itemid" name="itemid"/><lable>Add user<br/><input value="" type="text" id="shareAuto_displayname" class="w150" name="displayname" placeholder="Display Name or NID" /></lable><br/><input type="submit" id="shareEnd" name="submit" value="Cancel"/><input type="submit" name="submit" id="shareIt" value="Share"/></div>');
			$('#sharearea').fadeIn(500);
			setup_usersearch($('#centralMap'),$('#sharearea'),function(id,term){
				self.data("term",term);
				self.data("id",id);
				$('[name="itemid"]').val(self.closest('.item_aTar').attr('rel'));
				$('[name="uid"]').val(id);
			});
			$('#shareIt').on('click',function(){
				var itemid = $('[name="itemid"]').val();
				var uid = $('[name="uid"]').val();
				if(itemid!="" && uid !=""){
				$.post('/admin/share.castle',
						{
							itemid	:$('[name="itemid"]').val(),
							uid		:$('[name="uid"]').val(),
							type	:"users"
						},
						function(data,txt){
							if(data=="False"){
								create_alert("<h1>Failed to share</h1><p>Please do so and try again.</p>");	
								$('#shareAuto_displayname').val();
							}else{
								$('#sharearea').html("<h2>Successfully shared</h2>");
								self.closest('li.con').find('.summaryCol .Authors').append(", "+self.data("term"));
								clear_shareArea(function(){},2500);
							}
						});
				}else if(self.data("term")!=""){
					create_alert("<h1>Not found</h1><p>We couldn't find the user you entered. Please do so and try again.</p>")	
				}else{
					create_alert("<h1>Empty Selection</h1><p>You have not selected a user.  Please do so and try again.</p>")	
				}
			});
			$('#shareEnd').on('click',function(){clear_shareArea(function(){})});
		});
	});
}





function start_diff(){
	

	var text1 = $("#rev1text").html();
	var text2 = $("#rev2text").html();
	//dmp.Diff_Timeout = parseFloat(document.getElementById('timeout').value);
	//dmp.Diff_EditCost = parseFloat(document.getElementById('editcost').value);
	
	//var ms_start = (new Date()).getTime();
	var dmp = new diff_match_patch();
	var d = dmp.diff_main(htmlDecode(text1), htmlDecode(text2));
	
	dmp.diff_cleanupSemantic(d);
	dmp.diff_prettyHtmlOnlyChanges(d);
	var ds = dmp.diff_prettyHtml(d);
	$('#outputdiv').html(htmlDecode(ds));
	
	var dmp2 = new diff_match_patch();
	var d2 = dmp2.diff_main(htmlEncode(text1), htmlEncode(text2));
	
	dmp2.diff_cleanupSemantic(d2);
	dmp2.diff_prettyHtmlOnlyChanges(d2);
	var ds2 = dmp2.diff_prettyHtml(d2);
	
	var html_out = "";
	
	
	
	$('#outputdiv_code').html('<div><div id="output" style="font-family: monospace">'+ds2+'</div></div>');
	$.each($("#outputdiv_code").find("[title*='i=']"),function(i,v){
		$(v).html(  htmlEncode($(v).html())  );
	});
	//doHighlight();
	function htmlEncode(str){ 
		return str.split('>').join('&gt;')
				  .split('<').join('&lt;')
				  .split('&amp;lt;').join('&lt;')
				  .split('&amp;gt;').join('&gt;')
				  .split('&lt;br/&gt;').join('&lt;br/&gt;<br/>')
				  .split('&lt;br /&gt;').join('&lt;br/&gt;<br/>')
				  .split('&lt;br&gt;').join('&lt;br&gt;<br/>')
				  .split('&lt;/p&gt;').join('&lt;/p&gt;<br/>');
	}
	
	function htmlDecode(str){ 
		return str.split('&gt;').join('>').split('&lt;').join('<');
	}
	function doHighlight() {
		CodeMirror.runMode($("#code_hold").html(), "application/text", document.getElementById("output"));
	}
}


function inline_diff(trigerObj,callbacks){
		var self = trigerObj;
		if($.isEmptyObject(callbacks))callbacks={};
		if($('#inline_diff').length==0)$($('body #staging').append('<div id="inline_diff">'))
		$('#inline_diff').load('/admin/show_diff.castle',
			{
				"parent":$("[name='rev_parent_id']").val(),
				"rev1id":$(".first[name='rev']").val(),
				"rev2id":$(".last[name='rev']").val(),
				"ajxed":1
			},
		function(){
			$( "#inline_diff" ).dialog({
				modal: true,
				autoOpen:true,
				width:"auto",
				maxWidth:600,
				width:600,
				title:"Difference Between",
				open:function(){
					$('#inline_diff .tabs').tabs({width:600});
					start_diff();
				},
				close:function(){ $("#inline_diff").remove(); },
				buttons: {
					"Close": function() {
						$( "#inline_diff" ).dialog( "close" );
						/*$.post($( "#inline_diff" ).find('form').attr('action'),$( "#inline_diff" ).find('form').serialize()+"&ajaxed=true",function(data){
							if(data=="false"){
								
							}else{
								
								var dataparts = data.split(':');
								var id=dataparts[0];
								var name=dataparts[1];
								$.each($('.locationBed select,#locations_clonebed select'),function(){
									$(this).append('<option value="'+id+'">'+name+'</option>')
								});
								
								if($.isFunction(callbacks.onSave))callbacks.onSave();
								
								self.closest('li').find('select :selected').attr('selected',false);
								self.closest('li').find('option:last').attr('selected',true);
								
								$( "#inline_diff" ).dialog( "close" );
								
								
							}
						});*/
					}
				}
			});
		});
}









function centerOnAddress(map,address,address_2,city,state,zip,contry,calllback){
	var complete_address = address + ' ' + address_2 + ' ' + city
					+ state
					+ zip
					+ ( contry==''?' USA':contry );
	geocoder = new google.maps.Geocoder();
	geocoder.geocode( { 'address': complete_address }, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
			if (status != google.maps.GeocoderStatus.ZERO_RESULTS) {
				if (results && results[0]&& results[0].geometry && results[0].geometry.viewport) 
				map.fitBounds(results[0].geometry.viewport);
				if(typeof(calllback)!=="undefined"){ calllback(results[0].geometry.location.lat(),results[0].geometry.location.lng() ) }
			}
		}
	});
}

function singlePoint_map_editor(){
		var lat = $('#latitude').val();
		var lng = $('#longitude').val();
		var address = '';
		var address_2 = '';
		var city = '';
		var state = '';
		var zip = '';
		var country = '';

		$('#cbn_map').gmap({
			'center': (typeof(lat)==='undefined' || lat=='')? pullman : new google.maps.LatLng(lat,lng),
			'zoom':15,
			'zoomControl': false,
			'mapTypeControl': {  panControl: true,  mapTypeControl: true, overviewMapControl: true},
			'panControlOptions': {'position':google.maps.ControlPosition.LEFT_BOTTOM},
			'streetViewControl': false 
		}).bind('init', function () {
			
			function makeMapChange(){
				address = $('#address').val();
				address_2 = $('#address_2').val();
				city = $('#city').val();
				state = $('#state').val();
				zip = $('#zip').val();
				country = 'USA';
				
				var map = $('#cbn_map').gmap("get","map");
				centerOnAddress(map,address,address_2,city,state,zip,country,function(lat,lng){
					$('#cbn_map').gmap("setOptions",{position:new google.maps.LatLng(lat,lng)},markerLog[0]);
					$('#latitude').val(lat);
					$('#longitude').val(lng);
				});
			}
			
			$("input[name='location.address']").on("change",function(){makeMapChange()});
			$("input[name='location.address']").on("blur",function(){makeMapChange()});
			$("input[name='location.address']").on("mouseup",function(){makeMapChange()});
			$("input[name='location.address']").on("keyup",function(){makeMapChange()});
			
			$("input[name='location.address_2']").on("change",function(){makeMapChange()});
			$("input[name='location.address_2']").on("blur",function(){makeMapChange()});
			$("input[name='location.address_2']").on("mouseup",function(){makeMapChange()});
			$("input[name='location.address_2']").on("keyup",function(){makeMapChange()});
			
			
			$("input[name='location.city']").on("change",function(){makeMapChange()});
			$("input[name='location.city']").on("blur",function(){makeMapChange()});
			$("input[name='location.city']").on("mouseup",function(){makeMapChange()});
			$("input[name='location.city']").on("keyup",function(){makeMapChange()});
			
			$("select[name='location.state']").on("change",function(){makeMapChange()});
			$("select[name='location.state']").on("blur",function(){makeMapChange()});
			$("select[name='location.state']").on("mouseup",function(){makeMapChange()});
			$("select[name='location.state']").on("keyup",function(){makeMapChange()});
			
			$("input[name='location.zip']").on("change",function(){makeMapChange()});
			$("input[name='location.zip']").on("blur",function(){makeMapChange()});
			$("input[name='location.zip']").on("mouseup",function(){makeMapChange()});
			$("input[name='location.zip']").on("keyup",function(){makeMapChange()});

			$('#cbn_map').gmap('addMarker', $.extend({ 
				'position': (typeof(lat)==='undefined' || lat=='')?pullman:new google.maps.LatLng(lat,lng)
			},{'draggable':true}),function(markerOptions, marker){
				markerLog[0]=marker;
			}).click(function() {

			}).dragend(function(e) {
				var placePos = this.getPosition();
				var lat = placePos.lat();
				var lng = placePos.lng();
				$('#latitude').val(lat);
				$('#longitude').val(lng);
			});
		});
	
	
	}
	
	
	
	
	
function ini_view_profile_btn(){
		$('a[href*="view_ContactProfile.castle"]').off().on('click',function(e){
			e.preventDefault();
			e.stopPropagation();
			view_ContactProfile_dialog($(this));
		});	
	}
$(function(){
	ini_view_profile_btn();
});
function view_ContactProfile_dialog(trigerObj,callbacks){
	var self = trigerObj;
	if($.isEmptyObject(callbacks))callbacks={};
	if($('#new_location_dialog').length==0)$($('body #staging').append('<div id="new_location_dialog">'))
	$('#new_location_dialog').load(trigerObj.attr('href'),function(){
		$( "#new_location_dialog" ).dialog({
			modal: true,
			autoOpen:true,
			width:"auto",
			open:function(){
				//ui_startup();
				
			},
			close:function(){ $( "#new_location_dialog" ).remove(); },
			buttons: {
				"Save": function() {
					
				}
			}
		});
	});
}

function ini_event_editor(callback){


	function ini_new_loca_btn(){
		$('.podContainer .creatLocation').off().on('click',function(e){
			e.preventDefault();
			e.stopPropagation();
			new_location_dialog($(this),{
				"onSave":function(){
					reset_tooltips();
				}
			});
		});	
	}

	function new_location_dialog(trigerObj,callbacks){
		var self = trigerObj;
		if($.isEmptyObject(callbacks))callbacks={};
		if($('#new_location_dialog').length==0)$($('body #staging').append('<div id="new_location_dialog">'))
		$('#new_location_dialog').load('/post/create.castle?post_type=event_location #LOCATION',function(){
			$( "#new_location_dialog" ).dialog({
				modal: true,
				autoOpen:true,
				width:"auto",
				open:function(){
					ui_startup();
					$('[href="#onMap"]').on('click',function(e){
						e.preventDefault();
						e.stopPropagation();
						$( "#onMap" ).dialog({
							modal: true,
							autoOpen:true,
							width:"auto",
							open:function(){
								ui_startup();
								singlePoint_map_editor();
							},
							buttons: {
								"Save": function() {
									$( this ).dialog( "close" );
								}
							}
						});
					});
				},
				close:function(){ $( "#new_location_dialog" ).remove(); },
				buttons: {
					"Save": function() {
						$.post($( "#new_location_dialog" ).find('form').attr('action'),$( "#new_location_dialog" ).find('form').serialize()+"&ajaxed_update=true",function(data){
							if(data=="false"){
								
							}else{
								var dataparts = data.split(':');
								var id=dataparts[0];
								var name=dataparts[1];
								$.each($('.locationBed select,#locations_clonebed select'),function(){
									$(this).append('<option value="'+id+'">'+name+'</option>')
								});
								
								if($.isFunction(callbacks.onSave))callbacks.onSave();
								
								self.closest('li').find('select :selected').attr('selected',false);
								self.closest('li').find('option:last').attr('selected',true);
								
								$( "#new_location_dialog" ).dialog( "close" );
								
							}
						});
					}
				}
			});
		});
	}
	if($('#massTagging').length)setup_massTags();
	int_infotabs();
	ini_new_loca_btn();
	$('#add_event_schuedule').on('click',function(e){
		e.preventDefault();
		e.stopPropagation();
		i=$('#names .pod').size();
		$('#names').append($('#name_clonebed').html().replace(/[9]{4}/g, (i>-1?i:i+1) ).replace(/\|\|/g, '' ) );
		$( ".podContainer .datepicker.optionsA" ).each(function(){
			$(this).datetimepicker({
				showOtherMonths: true,
				selectOtherMonths: true,
				changeMonth: true,
				changeYear: true,
				showButtonPanel: true,
				showAnim:"fold",
				dateFormat: 'mm/dd/yy',
				ampm: true,
				hourGrid: 4,
				minuteGrid: 10,
				onClose: function(dateText, inst) {
					//auto take off a null time.. ie if left at midnight, it's not wanted.
					/*if (dateText.indexOf('00:00')!=-1||dateText.indexOf('12:00 AM')!=-1||dateText.indexOf('12:00 am')!=-1){
						temp = dateText.split(' ');
						$(this).val(temp[0]);
					}*/
				}
			});
		});
		//reset_tooltips();
		ini_new_loca_btn();
		
		
		$('.pod.event .deleteOption').off().on('click',function(e){
			e.preventDefault();
			e.stopPropagation();
			$(this).closest(".pod.event").remove();
			//reset_tooltips();
			//ini_new_loca_btn();
		});
		
		$('.podContainer .newLocation').off().on('click',function(e){
			e.preventDefault();
			e.stopPropagation();
			var self = $(this);
			var i=self.prev('ul').find('li').size();
			if(i< $('.LocationSelect:first').find('option').size() ){
				
				self.prev('ul').find('.creatLocation').remove();
				self.prev('ul').append($('#locations_clonebed').html().replace(/[9]{4}/g, (i>-1?i:i+1) ).replace(/\|\|/g, '' ) );
				$('.podContainer .deleteLocation').off().on('click',function(e){
					e.preventDefault();
					e.stopPropagation();
					$('[role=tooltip]').remove();
					var tar = $(this).closest('.locationBed');
					$(this).closest('li').remove();
					reset_tooltips();
					$.each(tar.find('li'),function(i){
						$(this).find('input').each(function(j){
							$(this).attr('name',$(this).attr('name').replace(/[\d+]/g, (i>-1?i:i+1)) );
						});
						$(this).find('.marked').each(function(j){
							var txt = $(this).html();
							$(this).html(txt.replace(/[\d+]/g, (i>-1?i:i+1)) );
						});
					});
					self.prev('ul').find('li:last').append($('#locations_clonebed .creatLocation').clone());
					ini_new_loca_btn();
				});
				ini_new_loca_btn();
			}else{
				alert('you have added all the locations you have ever created.  \r\n\r\n Please create a new location by clicking on the + icon to the right of the dropdown.')	
			}
		});
	});
	if($.isFunction(callback))callback();
}

function ini_pod_area(jObj,callback){
	
	
	
	if($.isFunction(callback))callback(jObj);
}



function loadPlaceShape(_load,callback){
	/*if(typeof(_load)==='undefined') var _load = false;
	if(typeof(showSum)==='undefined') var showSum = false;
	//var url='http://images.wsu.edu/javascripts/campus_map_configs/pick.asp';	
	var url=siteroot+"place/loadPlaceShape.castle";
	$.getJSON(url+'?callback=?'+(_load!=false?'&id='+_load:''), function(data) {

		if(typeof(data.shape)!=='undefined' && !$.isEmptyObject(data.shape)){
			$.each( data, function(i, shape) {	

			//alert(shape.latlng_str);
				 var pointHolder = {};
				 var coord = shape.latlng_str;//(typeof(shape.encoded)!=="undefined"&& shape.encoded!="")?shape.encoded:shape.latlng_str;
				 var type = "polygon";typeof(shape.type)!=="undefined"?shape.type:"polygon";
				 //alert(coord);
				 
				 
				 if(coord!='' && shape.type=='polyline'){ 
					var pointHolder = {'path' : coord };
				 }
				  if(coord!='' && shape.type=='polygon'){ 
					var pointHolder = {'paths' : coord};
				 }
				 //alert(shape.type);
				 if(!$.isEmptyObject(pointHolder)){
					var ele = $.extend( {'fillOpacity':.25,'fillColor':'#981e32', 'strokeWeight':0 } , pointHolder );
				 }else{
					var ele = {};
				 }

				 $('#place_drawing_map').gmap('addShape',(type[0].toUpperCase() + type.slice(1)), ele,function(shape){
						 //alert('added shape');
						shapes.push(shape);
						if($.isFunction(callback))callback(shape);
				});
			});
		}
	});*/
	var url=siteroot+"public/getShapesJson_byIds.castle";
	
	if(typeof(_load)!="undefined"){
		$.getJSON(url+'?callback=?&ids[]='+_load, function(data) {
			$('#place_drawing_map').gmap('clear','overlays');
			$.each( data.shapes, function(i, shape) {
				if(
					typeof(shape.style.events.rest.fillOpacity)!=="undefined" && shape.style.events.rest.fillOpacity == 0
					&& (typeof(shape.style.events.rest.strokeOpacity)!=="undefined" && shape.style.events.rest.strokeOpacity == 0
						|| typeof(shape.style.events.rest.strokeWeight)!=="undefined" && shape.style.events.rest.strokeWeight == 0)
						){
							shape.style.events.rest.strokeWeight = .2;
							shape.style.events.rest.strokeOpacity = .6;
						}
				
				addShapeToMap($('#place_drawing_map'),i, shape);
			});
		});
	}		

	
	
}

function add_place_point(lat,lng,clear){
	i=0;
	var marker = {};
	marker.style={"icon":siteroot+"Content/images/map_icons/default_icon_{$i}.png"};
	if(typeof(clear)!=='undefined'&&clear) marker.info={};
	marker=$.extend(marker,build_infobox(marker));
	
	if(marker.style.icon){marker.style.icon = marker.style.icon.replace('{$i}',i+1);}
	
	$('#place_drawing_map').gmap('addMarker', $.extend({ 
		'position': (typeof(lat)==='undefined' || lat=='')?$('#place_drawing_map').gmap('get_map_center'):new google.maps.LatLng(lat,lng)
	},{'draggable':true},marker.style),function(markerOptions, marker){
			if(reopen!=false){
				ib[0].open($('#place_drawing_map').gmap('get','map'), marker);
				reopen = false;
			}
			if($("#placeShape :selected").length && $("#placeShape :selected").val()!=""){
				shapes=[];
				
				loadPlaceShape($("#placeShape :selected").val(),function(shape){
					$('#place_drawing_map').gmap("attach_shape_to_marker",shapes[0],marker);
				});
			}			
	}).click(function() {
		var ib_total = 0;
		//$.each(ib, function(i) {ib[i].close(); ib_total=i; });
		ib[0].open($('#place_drawing_map').gmap('get','map'), this);
		ibOpen=true;
		// need to finish this class
		//$('#centralMap').gmap('openInfoWindow', { 'content': marker.info.content }, this);
	}).dragend(function(e) {
		var placePos = this.getPosition();
		var lat = placePos.lat();
		var lng = placePos.lng();
		if(shapes.length>0){
			$('#place_drawing_map').gmap("move_shape",shapes[0],placePos);
		}
		$('#Lat').val(lat);
		$('#Long').val(lng);
		//setTimeout(function() {},  200);
		if($('#revGoeLookup').is(":checked")){
			var loca = new google.maps.LatLng(lat,lng);
			setGeoCoder().geocode({'latLng':loca}, function(results, status) {
				if (status == google.maps.GeocoderStatus.OK) { 
					var arrAddress = results[0].address_components;
					
					var itemRoute='';
					var itemLocality='';
					var itemCountry='';
					var itemPc='';
					var itemSnumber='';
					$('#place_address').val('');
					$('#place_street').val('');			
					// iterate through address_component array
					$.each(arrAddress, function (i, address_component) {
						if (address_component.types[0] == "route"){//": route:"
							itemRoute = address_component.long_name;
							$('#place_street').val(itemRoute);
						}
						if (address_component.types[0] == "locality"){//"town:"
							itemLocality = address_component.long_name;
						}
						if (address_component.types[0] == "country"){ //"country:"
							itemCountry = address_component.long_name;
						}
						if (address_component.types[0] == "postal_code_prefix"){ //"pc:"
							itemPc = address_component.long_name;
						}
						if (address_component.types[0] == "street_number"){ //"street_number:"
							itemSnumber = address_component.long_name;
							$('#place_address').val(itemSnumber);
						}
					});
					if (results[1]) {
						//alert( results[1].formatted_address);
						//obj.val(itemSnumber);
					}
				} else {
					alert("Geocoder failed due to: " + status);
				}
			});
		}
		
		$('#estimated_places').show('fast');
		$('#local_place_names').html('loading<span class="blink1">.</span><span class="blink2">.</span><span class="blink3">.</span>');

		$('.blink1').blink(100);
		$('.blink2').blink(150);
		$('.blink3').blink(200);
		$.each(gmap_location_types.length,function(i,v){
			var requested = {
			  location: loca,
			  radius:.1,
			  keyword:gmap_location_types[i]//,
			  //types : [gmap_location_types[i]]
			};
			var gmap = $('#place_drawing_map').gmap('get','map');
			var service = new google.maps.places.PlacesService(gmap);
			service.search(requested, function (results, status) {
				var gmap = $('#place_drawing_map').gmap('get','map');
				if (status == google.maps.places.PlacesServiceStatus.OK) {
					alert('sereching');
					for (var i = 0; i < 1; i++) {
						var request = {reference:results[i].reference};
						var service = new google.maps.places.PlacesService(gmap);
						service.getDetails(request, function(place, status) {
							if (status == google.maps.places.PlacesServiceStatus.OK) {
								if(place.name){
									if($('.blink1').length)$('#local_place_names').html('');
									var txt = $.trim($('#local_place_names').html());
									$('#local_place_names').html(txt+ (txt.indexOf(place.name)>-1 ? '' : (txt==""?'':',') +  place.name ));
								}
							}
						});
					}
				}
			});
		});
	});
	$(this).addClass('ui-state-disabled');
}

function get_Address_latlng(map,address) {
	  setGeoCoder().geocode( { 'address': address}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				map.setCenter(results[0].geometry.location);
				/*var marker = new google.maps.Marker({
								map: map,
								position: results[0].geometry.location
							});*/
				//drop1(results[0].geometry.location)	
				var latitude = results[0].geometry.location.lat(); 
				var longitude = results[0].geometry.location.lng(); 
				$('#Lat').val(latitude);		
				$('#Long').val(longitude);		
				
				$('#place_drawing_map').gmap('addMarker', $.extend({ 
					'position': new google.maps.LatLng(latitude,longitude)
				},{})).click(function() {
					//$.each(ib, function(i) {ib[i].close();});
					//ib[i].open($('#place_drawing_map').gmap('get','map'), this);
					//$('#centralMap').gmap('openInfoWindow', { 'content': marker.info.content }, this);
				});
			} else {
				alert("Geocode was not successful for the following reason: " + status);
			}
	  });
}
function infoUpdate(){
	var lat = $('#Lat').val();
	var lng = $('#Long').val();	
		reopen = ibOpen;
		if(typeof(ib[0])!=="undefined")ib[0].close();
		tinyMCE.triggerSave();
		$('#place_drawing_map').gmap('clear','markers');
		$('#place_drawing_map').gmap('clear','services');
		$('#place_drawing_map').gmap('clear','overlays');	
		add_place_point(lat,lng,true);
		watchMediaTab();
}





var $tabs = null;
var tab_counter =  0;
var $tab_title_input = $( "#tab_title"),
	$tab_content_input = $( "#tab_content" );

function int_infotabs(){
		if($('.dyno_tabs').length){
			$.each('.dyno_tabs',function(i,v){
				//replaced "tab_"+i for $(this).attr('id')
				/*if(!$(this).is($(".tinyLoaded"))){
					load_tiny("bodytext",$(this).attr('id'));
					$(this).addClass("tinyLoaded")
				}*/
				tinyResize();
				set_tab_editable(i);
			});
		}

		// tabs init with a custom tab template and an "add" callback filling in the content
		$tabs = $( "#infotabs").tabs({
			select: function(event, ui) {tinyMCE.triggerSave();tinyResize();},
			show: function(event, ui) {tinyMCE.triggerSave();tinyResize();}
		});

		$( "#infotabs").find( ".ui-tabs-nav" ).sortable({items: "li:not(.nonsort)",stop: function(event, ui) {
			$.each($("#infotabs .ui-tabs-nav li"),function(i,v){
				$(this).find('.sort').val(i);
				var href = $(this).find('a').attr('href');
				$(''+href).attr('role',i);
				var id=$(href).find('textarea.tinyEditor:first').attr('id');
				tinyMCE.triggerSave();
				if (typeof(id)!=="undefined" && tinyMCE.getInstanceById(id)){
					tinyMCE.execCommand('mceRemoveControl',true,id);
					$("#"+id).removeClass("tinyLoaded");
				}
			});
			var tabs = $('#infotabs');
			var panels = tabs.children('.ui-tabs-panel');
			panels.sort(function (a,b){return $(a).attr('role') >$(b).attr('role') ? 1 : -1;}).appendTo('#infotabs');
			$.each(panels, function(i, v) {
				var id=$(this).find('textarea:first').attr('id');
				if(!$(this).find('textarea:first').is($(".tinyLoaded"))){ load_tiny("bodytext",id);$(this).find('textarea:first').addClass("tinyLoaded")}
				tinyMCE.triggerSave();
				tinyResize();
				set_tab_editable(i);
			});
		}});
		// modal dialog init: custom buttons and a "close" callback reseting the form inside
		var $dialog = $( "#page_dialog" ).dialog({
			autoOpen: false,
			modal: true,
			buttons: {
				Add: function() {
					var title = $( "#tab_title").val();
					var content = $( "#tab_content" ).val();
					addTab(title,content);
					$( this ).dialog( "close" );
				},
				Cancel: function() {
					$( this ).dialog( "close" );
				}
			},
			open: function() {
				//$("#taber").get(0).reset();
				$tab_title_input.focus();
			},
			close: function() {
				//$("#taber")[0].reset();
			}
		});
		// addTab form: calls addTab function on submit and closes the dialog
		var $form = $( "form#taber", $dialog ).submit(function() {
			tab_counter++;
			addTab(tab_counter);
			$dialog.dialog( "close" );
			return false;
		});
		// addTab button: just opens the dialog
		$( "#add_tab" )
			//.button()
			.click(function(e) {
				e.stopPropagation();
				e.preventDefault();
				$dialog.dialog( "open" );
			});
		apply_tab_removal();
		watchMediaTab();
	
}
function set_tab_editable(i){
	var base= '[href="#dyno_tabs_'+i+'"]';
	if($(base).length==0)base= '[href="#tabs-'+i+'"]';
	$(base).closest('li').find('.edit').off('click').on('click',function(e){
		if(!$(this).is('ui-icon-cancel')){// changed hasClass for is for speed
			$(this).addClass('ui-icon-cancel');
			$(base).hide();
			$(base).after('<input type="text" class="titleEdit" value="'+$(base).text()+'" />');
			$(base).closest('li').find('.titleEdit').focus();
			$(base).closest('li').find('.edit').off('click').on('click',function(){
				$(base).closest('li').find('.titleEdit').blur();
			});
			$(base).closest('li').find('.titleEdit').on('blur',function(){
				$(base).closest('li').find('.edit').removeClass('ui-icon-cancel');
				$(base).closest('li').find('.edit').addClass('ui-icon-pencil');
				$(base).text($(this).val());
				$(base).closest('li').find('#tab_title_'+i).val($(this).val());
				$(this).remove();
				$(base).show();
				set_tab_editable(i);
			});
		}
	});
}
function addTab(title,content,useWysiwyg,useControlls) {
	
	var title = typeof(title)!=="undefined"?title:"tab {$i}";
	var content = typeof(content)!=="undefined"?content: "Tab " + i + " content."; 
	var useWysiwyg = typeof(useWysiwyg)!=="undefined"?useWysiwyg:true;
	var useControlls = typeof(useControlls)!=="undefined"?useControlls:true;
	
	var i = $("div#infotabs ul.ui-tabs-nav li").length + 1;
	
	var tab_title = title || $tab_title_input.val() || "Tab " + i;
	
	var controll="";
	if(useControlls)controll="<span class='ui-icon ui-icon-close' data-close='"+i+"'>Remove Tab</span>"+
							 '<span class="edit ui-icon ui-icon-pencil"></span>';

				
	var tabTemplate = "<li data-order='"+i+"'>"+
				"<a href='#tabs-" + i + "' hideFocus='true'>"+ title.replace('{$i}',i) +"</a>"+
					"<input type='hidden' name='tabs["+i+"].id' value='' id='tab_id_"+i+"'/>"+
					"<input type='hidden' name='tabs["+i+"].title' value=\"#{label}\" id='tab_title_"+i+"'/>"+
					"<input type='hidden' name='tabs["+i+"].template.id' value='' id='tab_template_id_"+i+"'/>"+
					"<input type='hidden' name='tabs["+i+"].sort' value='' id='tab_sort_"+i+"'class='sort' />"+
				controll+
			"</li>";
	$("div#infotabs ul.ui-tabs-nav").append(tabTemplate);		

	var fullcontent = "<textarea id='tab_"+i+"'  name='tabs["+i+"].content' class='tinyEditor full' >" + content + "</textarea>";
	$("div#infotabs").append( "<div id='tabs-" + i + "'  data-order='"+i+"' role='"+i+"'>"+fullcontent+"</div>" );

	
	$.each($("#infotabs li.ui-state-default"),function(i,v){
		$(this).find('.sort').val(i);
		set_tab_editable(i);
	});
	

	if(useWysiwyg)load_tiny("bodytext","tab_"+i);
	apply_tab_removal();
	$("div#infotabs").tabs("refresh");
}
function apply_tab_removal(){
	// close icon: removing the tab on click
	$( "#infotabs span.ui-icon-close" ).off().on( "click", function() {
		var self = $( this );
		if($( "#deleteconfirm" ).length==0){$('body').append('<div id="deleteconfirm">If you delete this you will have to refresh the page to get it back.<br/><h2>Are you sure?</h2></div>')};
		$( "#deleteconfirm" ).dialog({
			autoOpen: false,
			modal: true,
			buttons: {
				Delete: function() {
					var i = self.data("close");
					$("#tabs-" + i).filter(function(){ return $( this ).data("order")== i}).remove();
					$("div#infotabs li").filter(function(){ return $( this ).data("order")== i}).remove();
					$("div#infotabs").tabs("refresh");
					$( this ).dialog( "close" );
				},
				Cancel: function() {
					$( this ).dialog( "close" );
				}
			}
		}).dialog( "open" );
	});
}
	
	
	

function watchMediaTab(){
		tab_counter =  $("#infotabs li.ui-state-default").size();
		if($('.imageBox').length>1 && $('#viewTab').length==0){
			var content = '<img class="infotabTemplate" src="../Content/images/gallery_placeholder.png"  id="viewTab" width="297" height="201" />'+
			"<input type=\"hidden\" id='tab_"+tab_counter+"' name=\"tabs["+tab_counter+"].content\" value=\"<img class='infotabTemplate' src='../Content/images/gallery_placeholder.png'  id='viewTab' width='297' height='201' />\" />";
			addTab(tab_counter,"Views",content,false,false);
		}
		if($('#viewTab').length>1){
			$('#'+$('#viewTab:last').attr('href')).remove();
			$('#viewTab:last').remove();
		}
		if($('.imageBox').length<=1 && $('#viewTab').length>0){
			$('#'+$('#viewTab').attr('href')).remove();
			$('#viewTab').remove();
		}
	}
	
	
	
function setup_massTags(){
	$('#massTagging').on('click',function(e){
				e.stopPropagation();
				e.preventDefault();
				$('#massTaggingarea').slideToggle();
			});	
}
























/*
 * EDITOR CONTORL SCRIPTS
 */
function load_post_editor() {
	
	
	
	
	
	
	
	
	
	
	
	var lat = $('#Lat').val();
	var lng = $('#Long').val();	
	$('#place_drawing_map').gmap({
			'center': (typeof(lat)==='undefined' || lat=='')? campus_latlng_str : new google.maps.LatLng(lat,lng),
			'zoom':15,
			'zoomControl': false,
			'mapTypeControl': {  panControl: true,  mapTypeControl: true, overviewMapControl: true},
			'panControlOptions': {'position':google.maps.ControlPosition.LEFT_BOTTOM},
			'streetViewControl': false 
		}).bind('init', function () {
			if(lat!='')add_place_point(lat,lng);
			$("#editor_form").autoUpdate({before:function(){tinyMCE.triggerSave();},changed:function(){infoUpdate();}});
		});
	
	$('#setLatLong :not(.ui-state-disabled)').on('click',function(){ add_place_point(lat,lng); });

	int_infotabs();
	
	function revGoeLookup(){
		$("#place_street,#place_address").on('keyup',function () {
			clearCount('codeAddress');
			setCount('codeAddress',500,function(){
				var zip = $('#zcode').length?$('#zcode').text():'';
				var campus = $('#campus').length?$('#place_campus').val():'';
				var lookup = $('#place_street').val()+' '+$('#place_address').val()+', '+campus+' WA '+zip+' USA'; 
				if( $('#place_street').val() !='' &&$('#place_address').val() !='' ) get_Address_latlng($('#place_drawing_map').gmap('get','map'),lookup);
				$('#setLatLong').addClass('ui-state-disabled');
			});
		});
	}
	function killRevGoeLookup(){ $("#place_street,#place_address").die(); }

	if($('#place_street').length>0){
		$('#revGoeLookup').on('change',function(){
			if($(this).is(":checked")){
				revGoeLookup();
			}else{
				killRevGoeLookup();
			}
		});
	}
	tinyResize();
	if ($(window).scrollTop()>= 175) {if($(window).width()<=1065){$('#campusmap').addClass('fixed_min');}else{$('#campusmap').addClass('fixed');} }
	$(window).scroll(function (event) {
		if ($(this).scrollTop()>= 175) {     
			if($(window).width()<=1065){$('#campusmap').addClass('fixed_min');}else{$('#campusmap').addClass('fixed');}
			
		} else { 
			$('#campusmap').removeClass('fixed_min');       
			$('#campusmap').removeClass('fixed');   
			
		}  
	});
	setup_fixedNav();
	$('#shortcode').click(function(e){
			e.stopPropagation();
			e.preventDefault();
			$('#shortcodes').toggle(0,function(){ 
				$("#shortcode").html($("#shortcodes").is(':visible') ? '-' : '+'); 
			});
		}).trigger('click');
	
	
	$.each($('.switch'),function(i,v){
		var self = $(this);
		self.find('a').on('click',function(e){
				e.stopPropagation();
				e.preventDefault();
				self.find('.active').removeClass('active');
				var tar=$(this).attr('id');
				$(this).addClass('active');
				self.find('.'+tar).addClass('active');
			});
	});
	setup_massTags();
	
	if($('#content_preview').length){
		var iFrame = $('#content_preview_area');
		var iFrameDoc = iFrame[0].contentDocument || iFrame[0].contentWindow.document;
		iFrameDoc.write($('#content_preview').val());
		iFrameDoc.close();	
		$(iFrameDoc).bind('click', function(e){
				e.stopPropagation();
				e.preventDefault();
		});
	}
	
	
	
	

	


	
	
	
	
	
	
	
}

var needsMoved=0;
