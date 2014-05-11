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
}
function load_geometrics_editor() {
     $('#geometrics_drawing_map').gmap({'center': campus_latlng_str , 'zoom':15 }).bind('init', function () {
		 var controlOn=true;
		 var drawingMode = false;
		 
		 var type= $('#startingValue').val();
		 var coords=$('#latLong').val();
		 if(coords=='')coords=$('#geometric_encoded').val();
		 var pointHolder = {};
		 if(coords!='' && type=='polyline'){ 
		 	var pointHolder = {'path' : coords };
		 }
		  if(coords!='' && type=='polygon'){ 
		 	var pointHolder = {'paths' : coords };
		 }
		 if(!$.isEmptyObject(pointHolder)){
			var shape = $.extend( { 'strokeColor':'#000', 'strokeWeight':3 } , {'editable':true} , pointHolder );
		 }else{
			var shape = {};
		 }
		var jObj = $('#geometrics_drawing_map');
		jObj.gmap('init_drawing', 
			{ 
				drawingControl:controlOn,
				drawingControlOptions : controlOn?{
					position: google.maps.ControlPosition.TOP_CENTER,
					drawingModes: $('#pickedValue').val()!=""?[$('#pickedValue').val()]:[google.maps.drawing.OverlayType.POLYLINE, google.maps.drawing.OverlayType.POLYGON]
				  }:false,
				polylineOptions:{editable: true} 
			}, $.extend( {
					limit:1,
					limit_reached:function(gmap){},
					encodePaths:false, // always a string
					data_return:'str', // "str" , "obj" (gmap obj) and others to come
					data_pattern:'{lng} {lat}{delimiter}\n',   //
					delimiter:',',
					overlaycomplete:function(data){
							if(data!=null){
								$('#latLong').val(data);
								//alert(dump($('#geometrics_drawing_map').gmap('encode',$('#geometrics_drawing_map').gmap('process_coords',data,false,false))));
								//$('#geometric_encoded').val(google.maps.geometry.encoding.decodePath(data));
								//$('#geometric_encoded').val($('#drawing_map').gmap('get_updated_data_encoded'));
								//$('#geometric_encoded').val($('#drawing_map').gmap('get_updated_data_encoded'));
								//$('#geometric_encoded').val($('#geometrics_drawing_map').gmap('get_updated_data_encoded'));
								
								$('#geometric_encoded').val(jObj.gmap('encode',jObj.gmap('process_coords',$('#latLong').val(),true,false)));
								///process_coords: function(coordinates,flip,reverse_array)
							}
						},
					onDrag:function(data){
							var points=$('#drawing_map').gmap('get_updated_data');
							if(points.length){
								$('#latLong').val(points);
								//alert(dump($('#geometrics_drawing_map').gmap('encode',$('#geometrics_drawing_map').gmap('process_coords',points,false,false))));
								//$('#geometric_encoded').val($('#drawing_map').gmap('get_updated_data_encoded'));
								$('#geometric_encoded').val(jObj.gmap('encode',jObj.gmap('process_coords',$('#latLong').val(),true,false)));
								//$('#geometric_encoded').val($('#geometrics_drawing_map').gmap('get_updated_data_encoded'));
							}
						},
					drawingmode_changed:function(type){
							if(type!=null){
								$('#style_of').val(type);
							}
						},
					onComplete:function(dm,shape){
						if(shape!=null){
							//$('#latLong').val($('#geometrics_drawing_map').gmap('get_updated_data',$('#geometrics_drawing_map').gmap('overlays')));
							//$('#geometric_encoded').val($('#geometrics_drawing_map').gmap('get_updated_data_encoded',shape));
							$('#drawing_map').gmap('zoom_to_bounds',{},shape,function(){alert('zoomed?')});
						}else{
						
						}
					}
				},
				/*note we are extending the settings with the shape */
				$('#pickedValue').val()==''?{}:{
					loaded_type: ($('#pickedValue').val()[0].toUpperCase() + $('#pickedValue').val().slice(1)),
					loaded_shape:shape
				}
			)
		);

		$('#drawingcontrolls.showing').on('click',function(e){
			e.preventDefault();
			e.stopPropagation();
			jObj.gmap('hide_drawingControl');
			$(this).removeClass('showing').addClass('hidden').text('Show controlls');
		});
		$('#drawingcontrolls.hidden').on('click',function(e){
			e.preventDefault();
			e.stopPropagation();
			jObj.gmap('show_drawingControl');
			$(this).removeClass('hidden').addClass('showing').text('Hide controlls');
		});
		$('#restart').on('click',function(e){
			e.preventDefault();
			e.stopPropagation();
			jObj.gmap('refresh_drawing',false);
		});
		$('#update').on('click',function(e){
			e.preventDefault();
			e.stopPropagation();
			if(jObj.gmap('get_updated_data'))$('#latLong').val(jObj.gmap('get_updated_data'));
			
			//alert(dump($('#geometrics_drawing_map').gmap('encode',$('#geometrics_drawing_map').gmap('process_coords',$('#latLong').val(),false,false))));
			
			//$('#geometric_encoded').val($('#geometrics_drawing_map').gmap('get_updated_data_encoded'));
			if(jObj.gmap('get_updated_data'))$('#geometric_encoded').val(jObj.gmap('encode',jObj.gmap('process_coords',$('#latLong').val(),true,true)));
		});
		$("form#shapeEditor").autoUpdate({
			 before:function(){ 
				$('#update').trigger('click');
			 }
		});
		$('#unselect').on('click',function(e){
			e.preventDefault();
			e.stopPropagation();
			$('#latLong').val(jObj.gmap('unset_drawingSelection'));
		});
		var selected_type = '';
		$('#style').on('change',function(){
			if($('#style').val()>0){
				if($('#latLong').val()!="")get_style(jObj,$('#style').val(),$('#pickedValue').val());
			}
		});
		if($('#latLong').val()!="") $('#style').trigger('change');
	});
	 
}
function get_style(jObj,style_id,type){
	//if((typeof(type)==="undefined" || type==="undefined") || (typeof(style_id)==="undefined" || style_id==="undefined") )alert('error'); return false;
	
	var url=siteroot+"public/get_style.castle";
	$.getJSON(url+'?callback=?&id='+style_id, function(data) {
		var typed = type[0].toUpperCase() + type.slice(1);
		var overlays = jObj.gmap('get','overlays > '+typed);
		if(overlays!=null && overlays.length>0)jObj.gmap('setOptions',data.events.rest,overlays[0]);
	});	
}


function load_style_editor(){
	var gmap;

     $('#style_map').gmap({'center': campus_latlng_str , 'zoom':15,'disableDoubleClickZoom':true,'draggable':false,'zoomControl': false,'mapTypeControl': false,'panControl':false,'streetViewControl': false  }).bind('init', function () {
		$('#style_map').gmap('stop_scroll_zoom');
		
		set_default_shape($('#style_map'),$('#style_of').val());

		if($('.sortStyleOps.orgin').length){
			if($('#style_of').val()!=''){
				//set_default_shape($('#style_map'),$('#style_of :selected').text());
				set_default_shape($('#style_map'),$('#style_of').val());
				$('#style_of').trigger('change');
			}
		}

		if($( ".TABS" ).length>0){
			$( ".TABS:not(.clone_pool .TABS)" ).each(function(i){
				$(this).tabs();
			});
		}

		$("[name='update_style.castle']").autoUpdate({before:function(){},changed:function(){rebuild_example($( ".accordion" ),$('#style_map'),$('#style_of').val());}});

		$.each($( ".accordion" ),function(i){
			var self = $(this);
			var state = false;
			var input = self.find('input').not('h3 input,input:hidden,');
			if(	self.find('input').not('h3 input').val()!="" 
				&& input.not(':checkbox').val()!=self.find('input.default').val()
				|| ( input.is($(':checkbox')) && input.prop('checked')==true )
				){
					state = 0;
					self.find('h3 input').prop('checked',true);
			}
			self.accordion({
				collapsible: true,
				autoHeight: false,
				active: state ,
				create: function(event, ui) {},
				change: function(event, ui) {
						if(ui.newHeader.is($('.ui-state-active'))){
							ui.newHeader.closest('h3').find('input').prop('checked',true);
						}else{
							ui.oldHeader.closest('h3').find('input').prop('checked',false);
						}
					}
			});
			$.each(self.find('.color_picker'),function(){
				var box = $(this);
				var id = (input.attr('title').split('.')[1])+'_color_picker_'+i;
				//alert(id);
				if($('#'+id).length<=0){
					box.attr("id",id);
					$('#'+id).jPicker({
						  window:{
							title: null,
							effects: {
							  type: 'show',
							  speed:{
								show: 'fast',
								hide: 'fast'
							  }
							},
							position:{
							  x: 'screenCenter',
							  y: 'bottom'
							},
							expandable: false,
							liveUpdate: true,
							alphaSupport: false,
							alphaPrecision: 0,
							updateInputColor: true
						  },
						images:{ clientPath:'/Content/js/colorpicker/images/'}
					},function(color, ob){
						rebuild_example($('.accordion'),$('#style_map'),$('#style_of').val());
						var hex = '#'+color.val('hex');
						box.siblings('.colorsaver').val(hex!="#null"?hex:""); 
					},function(color, ob){
						rebuild_example($('.accordion'),$('#style_map'),$('#style_of').val());
						var hex = '#'+color.val('hex');
						box.siblings('.colorsaver').val(hex!="#null"?hex:""); 
					},function(color, ob){
						rebuild_example($('.accordion'),$('#style_map'),$('#style_of').val());
						var hex = '#'+color.val('hex');
						box.siblings('.colorsaver').val(hex!="#null"?hex:"");  
					});
				}
			});
			$( ".strokeOpacity,.fillOpacity" ).each(function(i){
				var subobj = $(this);
				subobj.slider({
					range: 	"min",
					value:	subobj.prev('input').val()!=""?subobj.prev('input').val():"",
					min: 	0.0,
					max:	1.0,
					step: 	.01,
					slide: function( event, ui ) {
						subobj.prev('input').val( ui.value ).trigger('change');
						rebuild_example($('.accordion'),$('#style_map'),$('#style_of').val());
					}
				});
				subobj.prev('input').val(subobj.slider( "value" ));
			});
			$( ".strokeWeight" ).each(function(i){
				var subobj = $(this);
				subobj.slider({
					range: 	"min",
					value:	subobj.prev('input').val()!=""?subobj.prev('input').val():"",
					min: 	0,
					max:	20,
					step: 	.1,
					slide: function( event, ui ) {
						subobj.prev('input').val( ui.value ).trigger('change');
						rebuild_example($('.accordion'),$('#style_map'),$('#style_of').val());
					}
				});
				subobj.prev('input').val(subobj.slider( "value" ));
			});
		});
		rebuild_example($('.accordion'),$('#style_map'),$('#style_of').val());
	});
}


function load_view_editor() {
	var api = null;
	var lat = $('#Lat').val();
	var lng = $('#Long').val();	
	var width = $('#width').val();
	var height = $('#height').val();
	var options = {'center': (typeof(lat)==='undefined' || lat=='')? campus_latlng_str : new google.maps.LatLng(lat,lng) , 'zoom':15}
	//var options = {'center': (typeof(lat)==='undefined' || lat=='')? campus_latlng_str : new google.maps.LatLng(lat,lng) , 'zoom':15};
	
	$('.codeurllink').on('click',function(){window.open($(this).prev('.codeurl').text())})
	
	
	
	if($('#runningOptions').html()=="{}"||$('#runningOptions').html()==""){
	$.each($('#tabs_Options input.text'),function(i,v){
		var tmpVal = $(this).val();
		if(tmpVal!=""){
			if(isNumber(tmpVal)){
				if(tmpVal>0){
					var tmp = {} 
					tmp[$(this).attr("id")]=tmpVal;
					options=$.extend(options,tmp);
				}
			}else{
				var tmp = {} 
				tmp[$(this).attr("id")]=tmpVal;
				options=$.extend(options,tmp);
			}
		}
	});	
	}else{
		var jsonStr = $('#runningOptions').html();
		var mapType = jsonStr.replace(/.*?(\"mapTypeId\":"(\w+)".*$)/g,"$2");
		jsonStr = jsonStr.replace(/("\w+":\"\",)/g,'').replace(/(\"mapTypeId\":"\w+",)/g,'');
		if(jsonStr!="")$.extend(options,base,$.parseJSON(jsonStr));
		//alert(dump(options));
		//$(this).val().replace(/[^a-zA-Z0-9-_]/g, '-'); 
	}
	//alert(dump(options));
	
	$('#dragCenter').on('change',function(){
			if($(this).is(":checked")){
				$('#place_drawing_map').gmap('setOptions',{"draggable":true})
			}else{
				$('#place_drawing_map').gmap('setOptions',{"draggable":$('#draggable').is(":checked")})
			}
		});
		
	$('#setZoom').on('change',function(){
			if($(this).is(":checked")){
				$('#place_drawing_map').gmap('setOptions',{"scrollwheel":true})
			}else{
				$('#place_drawing_map').gmap('setOptions',{"scrollwheel":$('#scrollwheel').is(":checked")})
			}
		});		

	$('#place_drawing_map').gmap(options).bind('init', function () {
		//alert(dump(options));
		//if(lat!='')add_place_point(lat,lng);
		//autoUpdate($("#editor_form"),{before:function(){tinyMCE.triggerSave();},changed:function(){infoUpdate();}});
		//$("#editor_form").autoUpdate({before:function(){tinyMCE.triggerSave();},changed:function(){infoUpdate();}});
		google.maps.event.addListener($('#place_drawing_map').gmap('get','map'), 'drag',function(){
			var center = $('#place_drawing_map').gmap('get_map_center');
			//$('#place_drawing_map').gmap('setOptions',{center},$('#place_drawing_map').gmap('get','map'));
			var lat = $('#Lat').val( center.lat() );
			var lng = $('#Long').val( center.lng() );	
		});
		google.maps.event.addListener($('#place_drawing_map').gmap('get','map'), 'zoom_changed',function(){
			var zoomLevel = $('#place_drawing_map').gmap('get','map').getZoom();
			var zoom = $('#zoom').val( zoomLevel );
		});
		reloadShapes();
		reloadPlaces();
		
	}).resizable({
		helper: "ui-resizable-helper",
		stop: function(event, ui) {
				var width = $('#width').val(ui.size.width);
				var height = $('#height').val(ui.size.height);
				
				$('.widthOutput').text(ui.size.width);
				$('.heightOutput').text(ui.size.height);
				$('#place_drawing_map').gmap('refresh');
			}
	});
	if($('.sortable').length){
		function createDeleteRow(){
			$('.tiny.buttons.deleteplace').off().on('click',function(e){
				e.stopPropagation();
				e.preventDefault();
				var container = $(this).closest('ol.sortable');
				var role=container.closest('fieldset').attr('role');
				var val=$(this).closest('li').find('input').val();
				$('select#'+role+'_select [value="'+val+'"]').removeAttr('disabled');
				$(this).closest('li').remove();
				container.nestedSortable("refresh");
				
				
				$('jspContainer').css('height','auto');
				api.reinitialise();
				reloadShapes();
				reloadPlaces();
				if(container.find('.ini').length==0 && container.find('li').size()==0){
					container.append('<li class="ini"><div><h5>Add '+container.closest('fieldset').find('legend span').text()+' from below</h5</div></li>');
				}
			});
		}
		$('ol.sortable').nestedSortable({
			disableNesting: 'no-nest',
			forcePlaceholderSize: true,
			handle: 'div:not(a)',
			helper:	'clone',
			items: "li:not(.ini)",
			maxLevels:1,
			opacity: .6,
			placeholder: 'placeholder',
			revert: 250,
			tabSize: 25,
			distance: 15, 
			tolerance: 'pointer',
			toleranceElement: '> div',
			update: function(event, ui) {
				var container = ui.item.closest('ol.sortable');
				var role=container.closest('fieldset').attr('role');
				
				//container.find( ".buttons" ).button({text:false});
				reloadShapes();
				reloadPlaces();
				if(container.find('.ini').length &&container.find('li').size()>1){
					container.find('.ini').remove();
				}else if(container.find('.ini').length==0 && container.find('li').size()==1){
					container.append('<li class="ini"><div><h5>Add '+container.closest('fieldset').find('legend span').text()+' from below</h5</div></li>');
				}



				createDeleteRow();
			}
		});
		var settings = {
			verticalDragMinHeight: 50
			//showArrows: true
		};

		var pane = $('.listPicker');
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

		createDeleteRow();

		$('.addSelecttion').on('click',function(e){
			e.stopPropagation();
			e.preventDefault();
			
			var container = $(this).closest('fieldset');
			var role=container.attr('role');
			var selection = $('select#'+role+'_select').val();
			
			if(selection!=""){
				var name = $('select#'+role+'_select :selected').text();
				$('select#'+role+'_select :selected').attr('disabled','disabled');
				$('select#'+role+'_select').val('');
				var addEle = '<li id="list_'+(container.find('ol.sortable li').size()+1)+'">'+
								'<div style="padding: 1px;">'+
									'<span style="font-size:0.5em; float:right;">'+
										'<a href="#" title="Reomve" class="tiny buttons deleteplace ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only">'+
											'<span class="ui-icon ui-icon-trash"></span>'+
										'</a>'+
									'</span>'+name+'<input type="hidden" value="'+selection+'" class="list_'+role+'" name="'+role+'list[]"/><em></em>'+
								'</div>'+
							'</li>';
				container.find('ol.sortable').append(addEle);
				if(container.find('.ini').length>0){
					container.find('.ini').remove();
				}
				container.find('ol.sortable').nestedSortable("refresh");
				$('jspContainer').css('height','auto');
				api.reinitialise();
								reloadShapes();
				reloadPlaces();
				createDeleteRow();
			}
		});
	}
	
	//$('select#placeShape').on('change',function(){
	//	reloadShapes()
	//});	
	int_infotabs();
	tinyResize();

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
	$('#width').live('keyup',function(){
		$('.widthOutput').text($(this).val());
	});
	$('#height').on('keyup',function(){
		$('.heightOutput').text($(this).val());
	});
	/*
	$('[href$="guidelines/dimensions.aspx"]').on('click',function(e){
		e.stopPropagation();
		e.preventDefault();
		$("<div>").load($(this).attr('href')+' #main',function(data){
			$.colorbox({html:data});
		});
	});
	*/
	
	setup_massTags();
	
	var waiting = false;	
	$('#urlAlias').live('keyup',function(){
		var val = $(this).val().replace(/[^a-zA-Z0-9-_]/g, '-'); 
		if(!waiting){
			waiting = true;
			//$.post('/view/aliasCheck.castle?alias='+val, function(data) {
			$.post('/admin/checkAlias.castle?alias='+val+'&typeName='+view.replace("/",""), function(data) {
				if(data=="true"){
					$('.aliasState').addClass('error');
					$('.aliasState').removeClass('ok');
					$('.aliasState').text('  :  taken');
				}else{
					$('.aliasState').addClass('ok');
					$('.aliasState').removeClass('error');
					$('.aliasState').text('  :  available');
				}
				waiting = false;
			});
		}
		$('.outputurl').text(val);
		$(this).val(val);
	});	
	
	
	if($('.onfliterList').length>0){
		$(".onfliterList").on('change',function () {
			var self=$(this);
			var role = self.closest('fieldset').attr('role');
			if(self.val()==""){
				self.closest('fieldset').find('.subFilter').hide();
				self.closest('fieldset').find('.mainFilter').hide();
			}else{
				$.getJSON(siteroot+"public/get_"+self.val()+"_list.castle?callback=?",function(data){
					if(data=="false"){
						alert("false");
						$.colorbox({
							html:function(){
								return '<div id="errorReporting"><h2>Error</h2><h3>It seems there was nothing returned.</h3></div>';
							},
							scrolling:false,
							opacity:0.7,
							transition:"none",
							open:true,
							onComplete:function(){
								prep();
								$.colorbox.resize();
							}
						});
						return false;
					}
					self.closest('fieldset').find('.onsubfliterList').html(function(){
						var str="<option value=''>All</option>";
						$.each(data,function(i,v){
							str += "<option value='"+v.id+"'>"+v.name+"</option>";
						});
						return str;
					}).attr('role',self.val());
					if(self.val().indexOf("all_")>-1 || self.val().indexOf("authors_")>-1){
						self.closest('fieldset').find('.subFilter').hide();	
						self.closest('fieldset').find('.finFill').html(function(){
							var str="<option value=''>Select a "+role+"</option>";
							$.each(data,function(i,v){
								var name = typeof(v.prime_name)=="undefined"?v.name:v.prime_name;
								str += "<option value='"+v.id+"' "+($('.list_'+role+'[value="'+v.id+'"]').length>0?" disabled='disabled'":"")+">"+name+"</option>";
							});
							self.closest('fieldset').find('.mainFilter').show();
							return str;
						});
					}else{
						self.closest('fieldset').find('.subFilter').show();	
					}
				});
			}
		});
	}
	if($('.onfliterList').length>0){
		$(".onsubfliterList").on('change',function () {
			var self=$(this);
			var role = self.closest('fieldset').attr('role');
			$.getJSON(siteroot+"public/get_"+self.closest('fieldset').attr('role')+"_list_attr.castle?callback=?",{'id':self.val(),'by':self.attr('role')},function(data){
				self.closest('fieldset').find('.finFill').html(function(){
					var str="<option value=''>Select a "+self.closest('fieldset').attr('role')+"</option>";
					$.each(data,function(i,v){
								var name = typeof(v.prime_name)=="undefined"?v.name:v.prime_name;
								str += "<option value='"+v.id+"' "+($('.list_'+role+'[value="'+v.id+'"]').length>0?" disabled='disabled'":"")+">"+name+"</option>";
					});
					self.closest('fieldset').find('.mainFilter').show();
					return str;
				});
			});
		});
	}
	
	
	
}

	
function reloadPlaces(){
	var url=siteroot+"public/getPlaceJson_byIds.castle";
	var ids;
	
	$.each($('[name="placelist[]"]'),function(){
		ids =(typeof(ids)=="undefined"?'':ids+',')+$(this).val();
	});
	var jObj=$('#place_drawing_map');
	jObj.gmap('clear','markers');
	if(typeof(ids)!="undefined"){
		$.getJSON(url+'?callback=?&ids[]='+ids, function(data) {
			$.each(ib, function(i) {ib[i].close();});
			
			
			loadData(jObj,data,null,function(marker){
				//ib[0].open($('#place_drawing_map').gmap('get','map'), marker);
				//cur_mid = mid[0];
			});
			prep();
		});
	}
	//alert('order::'+ids);
}
function reloadShapes(){
	var url=siteroot+"public/getShapesJson_byIds.castle";
	var ids;
	$.each($('[name="geolist[]"]'),function(){
			ids =(typeof(ids)=="undefined"?'':ids+',')+$(this).val();
	});
	var jObj=$('#place_drawing_map');
	jObj.gmap('clear','overlays');
	if(typeof(ids)!="undefined"){
		$.getJSON(url+'?callback=?&ids[]='+ids, function(data) {
			$.each( data.shapes, function(i, shape) {	
				addShapeToMap(jObj,i, shape);
			});
		});
	}	
}
/*function addShapeToMap(i, shape){
	var pointHolder = {};
	if(shape.latlng_str!='' && shape.type=='polyline'){ 
		var pointHolder = {'path' : shape.latlng_str };
	}
	if(shape.latlng_str!='' && shape.type=='polygon'){ 
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
		$('#place_drawing_map').gmap('addShape',(shape.type[0].toUpperCase() + shape.type.slice(1)), style);
	}else{
		// $('#place_drawing_map').gmap('addShape',(shape.type[0].toUpperCase() + shape.type.slice(1)), style)
		var mapOjb = $('#place_drawing_map');
		mapOjb.gmap('addShape', (shape.type[0].toUpperCase() + shape.type.slice(1)), style, function(shape_obj){
		$(shape_obj).click(function(){
			if(typeof(shape.style.events.click)!="undefined" && shape.style.events.click != ""){
				mapOjb.gmap('setOptions',shape.style.events.click,this);
				if(typeof(shape.style.events.click.onEnd)!="undefined" && shape.style.events.click.onEnd != ""){
					jObj = mapOjb;
					eval(shape.style.events.click.onEnd.replace('\u0027',"'"));
				}
			}
		 }).mouseover(function(){
			 if(typeof(shape.style.events.mouseover)!="undefined" && shape.style.events.mouseover != ""){
				 mapOjb.gmap('setOptions',shape.style.events.mouseover,this);
				// if(style.mouseover.callback)style.mouseover.callback();
				if(typeof(shape.style.events.mouseover.onEnd)!="undefined" && shape.style.events.mouseover.onEnd != ""){
					jObj = mapOjb;
					eval(shape.style.events.mouseover.onEnd.replace('\u0027',"'"));
				}		
			 }
		}).mouseout(function(){
			if(typeof(shape.style.events.rest)!="undefined" && shape.style.events.rest != ""){
				mapOjb.gmap('setOptions',shape.style.events.rest,this);
				if(typeof(shape.style.events.rest.onEnd)!="undefined" && shape.style.events.rest.onEnd != ""){
					jObj = mapOjb;
					eval(shape.style.events.rest.onEnd.replace('\u0027',"'"));
				}
			}
		}).dblclick(function(){
			if(typeof(shape.style.events.dblclick)!="undefined" && shape.style.events.dblclick != ""){
				mapOjb.gmap('setOptions',shape.style.events.dblclick,this);
				//if(style.dblclick.callback)style.dblclick.callback();
			}
		})
		.trigger('mouseover')
		.trigger('mouseout');
		});
	}	
}
*/
/* ok yes repeat.. abstract this and make useable for front and back. */
/*
function open_info(jObj,i){
		$.each(ib, function(i) {
			ib[i].close();
			jObj.gmap('setOptions', {'zIndex':1}, markerLog[i]);
		});
		ib[i].open(jObj.gmap('get','map'), markerLog[i],function(){
				cur_mid = mid[i];
				//updateUrl(cur_nav,mid[i]);
			});
		jObj.gmap('setOptions', {'zIndex':9}, markerLog[i]);
		$('#selectedPlaceList_area .active').removeClass('active');
		$('#selectedPlaceList_area a:eq('+i+')').addClass('active');
		//cur_mid = _mid;
		//updateUrl(cur_nav,_mid);
		cur_mid = mid[i];
		ibHover =  false;	
}
function open_toolTip(jObj,i){
	$.each(ibh, function(i) {ibh[i].close();});
	$('.infoBox').hover( 
		function() { ibHover =  true; }, 
		function() { ibHover =  false;  } 
	); 
	if(ibHover!=true)ibh[i].open(jObj.gmap('get','map'), markerLog[i]);
}
function close_toolTips(){
	$.each(ibh, function(i) {ibh[i].close();});
}*/
var needsMoved=0;
/*
function loadJsonData(jObj,data,callback,markerCallback){
	if(typeof(data.shapes)!=='undefined' && !$.isEmptyObject(data.shapes)){
		$.each( data.shapes, function(i, shape) {	
			if( !$.isEmptyObject(shape)){
				 addShapeToMap($('#place_drawing_map'),i, shape)
			}
		});
	}
	if(typeof(data.markers)!=='undefined' &&  !$.isEmptyObject( data.markers )){
		var l = data.markers.length;
		//alert(l);
		$.each( data.markers, function(i, marker) {	
			if(typeof(marker.shapes)!=='undefined' && !$.isEmptyObject(marker.shapes)){
				$.each( marker.shapes, function(i, shape) {	
					if( !$.isEmptyObject(shape)){
						addShapeToMap($('#place_drawing_map'),i, shape)
					}
				});
			}
			
			
			//alert(dump(marker));
			var _mid= marker.id;
			
			mid[i]=marker.id;
				if($.isArray(marker.info.content)){
					var nav='';
					$.each( marker.info.content, function(j, html) {	
						nav += '	<li class="ui-state-default ui-corner-top '+( j==0 ?'first ui-tabs-selected ui-state-active':'')+'"><a href="#tabs-'+j+'" hideFocus="true">'+html.title+'</a></li>';
					});
					var content='';
					$.each( marker.info.content, function(j, html) {
						content += '<div id="tabs-'+j+'" class="ui-tabs-panel ui-widget-content ui-corner-bottom  '+( j>0 ?' ui-tabs-hide':'')+'"><div class="content '+html.title.replace(' ','_').replace('/','_')+'">'+html.block+'</div></div>';
					});				
				
				}else{
					var nav = '	<li class="ui-state-default ui-corner-top  ui-tabs-selected ui-state-active first"><a href="#tabs-1" hideFocus="true">Overview</a></li>';
					var content='<div id="tabs-" class="ui-tabs-panel ui-widget-content ui-corner-bottom  "><div class="content overview">'+marker.info.content+'</div></div>';
				}
		
				var box='<div id="taby'+i+'" class="ui-tabs ui-widget ui-widget-content ui-corner-all">'+
							'<ul class="ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all">'+nav+'</ul>'+
							content+
							'<div class="ui-tabs-panel-cap ui-corner-bottom"><span class="arrow L5"></span><span class="arrow L4"></span><span class="arrow L3"></span><span class="arrow L2"></span></div>'+
						'</div>';
		
				
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
						if($('.cWrap .items li').length>1 && typeof(cycle)!=="undefined"){$('.cWrap .items').cycle('destroy');}
						$('#taby'+i).tabs('destroy').tabs();
					}
					,onOpen:function(){
							needsMoved=0;
							ibHover =  true;
							$('#taby'+i).tabs('destroy').tabs();
							if($('.cWrap .items li').length>1 && typeof(cycle)!=="undefined"  &&  $.isFunction(cycle)){
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
									pagerAnchorBuilder: function(idx, slide) { return '<li><a href="#" hidefocus="true">'+idx+'</a></li>';} 
								});/
							}
							$('.infoBox a').attr('target','_blank');
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
															needsMoved++;
														}else{
															$.colorbox.prev();
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
															needsMoved++;
														}else{
															$.colorbox.prev();
															needsMoved--;
														}
													}
												});
											}
										}
									}
								});
							});
							addErrorReporting(marker);
							var minHeight=0;
							$.each($('#taby'+i+' .ui-tabs-panel'),function() {
								minHeight = Math.max(minHeight, $(this).find('.content').height()); 
							}).css('min-height',minHeight); 
							$('.ui-tabs-panel').hover(function(){
								ib[i].setOptions({enableEventPropagation: true});
								jObj.gmap('stop_scroll_zoom');
							},function(){
								ib[i].setOptions({enableEventPropagation: false});
								jObj.gmap('set_scroll_zoom');
							});
							ib[i].rePosition();
							ibHover =  false;
							prep();
						}
				};
				ib[i] = new InfoBox(myOptions,function(){
					//$('#taby'+i).tabs();
					//alert('tring to tab it, dabnab it, from the INI');
				});
				//end of the bs that is well.. bs of a implamentation
				
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
				if(marker.style.icon){marker.style.icon = marker.style.icon.replace('{$i}',i+1);}
				jObj.gmap('addMarker', $.extend({ 
						'position': new google.maps.LatLng(marker.position.latitude, marker.position.longitude),
						'z-index':1
					},marker.style),function(ops,marker){
						markerLog[i]=marker;
						markerbyid[_mid] = markerLog[i];
						
						 // these too are needing to be worked together
						jObj.gmap('setOptions', {'zIndex':1}, markerLog[i]);
						if($.isFunction(markerCallback))markerCallback(marker);
					})
				.click(function() {
						open_info(jObj,i);
					})
				.rightclick(function(event){showContextMenu(event.latLng);})
				.mouseover(function(event){
					
					open_toolTip(jObj,i);
					
				})
				.mouseout(function(event){
					close_toolTips();
				});
				
				
				if(i==(l-1) && $.isFunction(callback)){
					//alert(l);
					//alert(i);
					callback();
				}
		});
		geoLocate();
		
	}
	//if($.isFunction(callback))callback();return;
	
}*/