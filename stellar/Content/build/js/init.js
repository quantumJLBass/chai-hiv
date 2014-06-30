/*!
 * jQuery Cookie Plugin v1.4.0
 * https://github.com/carhartl/jquery-cookie
 *
 * Copyright 2013 Klaus Hartl
 * Released under the MIT license
 */
(function (factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as anonymous module.
		define(['jquery'], factory);
	} else {
		// Browser globals.
		factory(jQuery);
	}
}(function ($) {
	var pluses = /\+/g;
	function encode(s) {
		return config.raw ? s : encodeURIComponent(s);
	}
	function decode(s) {
		return config.raw ? s : decodeURIComponent(s);
	}
	function stringifyCookieValue(value) {
		return encode(config.json ? JSON.stringify(value) : String(value));
	}
	function parseCookieValue(s) {
		if (s.indexOf('"') === 0) {
			// This is a quoted cookie as according to RFC2068, unescape...
			s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
		}
		try {
			// Replace server-side written pluses with spaces.
			// If we can't decode the cookie, ignore it, it's unusable.
			s = decodeURIComponent(s.replace(pluses, ' '));
		} catch(e) {
			return;
		}
		try {
			// If we can't parse the cookie, ignore it, it's unusable.
			return config.json ? JSON.parse(s) : s;
		} catch(e) {}
	}
	function read(s, converter) {
		var value = config.raw ? s : parseCookieValue(s);
		return $.isFunction(converter) ? converter(value) : value;
	}
	var config = $.cookie = function (key, value, options) {
		// Write
		if (value !== undefined && !$.isFunction(value)) {
			options = $.extend({}, config.defaults, options);
			if (typeof options.expires === 'number') {
				var days = options.expires, t = options.expires = new Date();
				t.setDate(t.getDate() + days);
			}
			return (document.cookie = [
				encode(key), '=', stringifyCookieValue(value),
				options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
				options.path    ? '; path=' + options.path : '',
				options.domain  ? '; domain=' + options.domain : '',
				options.secure  ? '; secure' : ''
			].join(''));
		}
		// Read
		var result = key ? undefined : {};
		// To prevent the for loop in the first place assign an empty array
		// in case there are no cookies at all. Also prevents odd result when
		// calling $.cookie().
		var cookies = document.cookie ? document.cookie.split('; ') : [];
		for (var i = 0, l = cookies.length; i < l; i++) {
			var parts = cookies[i].split('=');
			var name = decode(parts.shift());
			var cookie = parts.join('=');
			if (key && key === name) {
				// If second argument (value) is a function it's a converter...
				result = read(cookie, value);
				break;
			}
			// Prevent storing a cookie that we couldn't decode.
			if (!key && (cookie = read(cookie)) !== undefined) {
				result[name] = cookie;
			}
		}
		return result;
	};
	config.defaults = {};
	$.removeCookie = function (key, options) {
		if ($.cookie(key) === undefined) {
			return false;
		}
		// Must not alter options, thus extending a fresh object...
		$.cookie(key, '', $.extend({}, options, { expires: -1 }));
		return !$.cookie(key);
	};
}));

$.fn.hideOptionGroup = function() {
	$.each($(this),function(){
		var optgroup = $(this);
		var lable= optgroup.attr("label");
		var pname = optgroup.closest("select").attr("name");
		var pindex = $("select").index(optgroup.closest("select"));
		optgroup.attr("data-pname",pname);
		if($("."+lable+"_contaner_"+pindex).length<=0){
			$("body").append("<select style='position:absolute;top:-9999em;left:-9999em;' class='"+lable+"_contaner_"+pindex+"'><select>");
		}
		var hidden = $("."+lable+"_contaner_"+pindex);
		optgroup.children().each(function(){ $(this).removeAttr("selected"); });
		optgroup.appendTo(hidden);
	});
};

$.fn.showOptionGroup = function() {
	$.each($(this),function(){
		//var _lable=$(this).attr("label");
		var pname = $(this).data("pname");
		$(this).appendTo($( "select[name='"+pname+"']" ));
	});
};

	
function alais_scruber(input,jObj){
	var str = input.val();
		str=str.split(' ').join('-');
		str=str.split('&').join('-and-');
		str=str.replace(/[^A-Za-z0-9\-_]/g, "");
		str=str.split('--').join('-');
		str=str.split('__').join('_');
		str=str.split('/').join('');
	jObj.val(str.toLowerCase());
}
function turnon_alias(input,jObj){
	input.off().on("keyup",function(){
		alais_scruber(input,jObj);
	});
}	

function make_maskes(){
	$.mask.definitions['~'] = "[+-]";
	$('[type="date"],[rel="date"]').mask("99/99/9999",{completed:function(){ }});
	$('#tab_date').mask("9999",{completed:function(){ }});
	/*
	$("#phone").mask("(999) 999-9999");
	$("#phoneExt").mask("(999) 999-9999? x99999");
	$("#iphone").mask("+33 999 999 999");
	$("#tin").mask("99-9999999");
	$("#ssn").mask("999-99-9999");
	$("#product").mask("a*-999-a999", { placeholder: " " });
	$("#eyescript").mask("~9.99 ~9.99 999");
	$("#po").mask("PO: aaa-999-***");
	$("#pct").mask("99%");
	*/
	$("input").blur(function() {
		//$("#info").html("Unmasked value: " + $(this).mask());
	}).dblclick(function() {
		$(this).unmask();
	});
	$( "label i[title]" ).tooltip();
	$( '[type="date"],[rel="date"]' ).datepicker();
}
function popup_message(html_message,clean){
	if(typeof(clean)==="undefined"){
		clean=false;
	}
	if($("#mess").length<=0){
		$('body').append('<div id="mess">');
	}
	$("#mess").html( (typeof html_message === 'string' || html_message instanceof String) ? html_message : html_message.html() );
	$( "#mess" ).dialog({
		autoOpen: true,
		resizable: false,
		width: 350,
		minHeight: 25,
		modal: true,
		draggable : false,
		create:function(){
			if(clean){
				$('.ui-dialog-titlebar').remove();
				$(".ui-dialog-buttonpane").remove();
			}
			$('body').css({overflow:"hidden"});
		},
		buttons:{
			Ok:function(){
				$( this ).dialog( "close" );
			}
		},
		close: function() {
			$('body').css({overflow:"auto"});
			$( "#mess" ).dialog( "destroy" );
			$( "#mess" ).remove();
		}
	});
}


function setting_item_pub(parentObj){
	parentObj.find( ".pubstate" ).buttonset();
	if(parentObj.find('.pubstate :radio:checked').val()<1){
		parentObj.find('#noting').next("label").show();
	}else{
		parentObj.find('#noting').next("label").hide();
	}
	parentObj.find('.pubstate :radio').change(function () {
		parentObj.find('.pubstate :radio').next("label").find("i").removeClass("icon-check-empty").removeClass("icon-check");
		parentObj.find('.pubstate :radio').not(":checked").next("label").find("i").addClass("icon-check-empty");
		parentObj.find('.pubstate :radio:checked').next("label").find("i").addClass("icon-check");
		if(parentObj.find('.pubstate :radio:checked').val()<1){
			parentObj.find('#noting').next("label").show();
		}else{
			parentObj.find('#noting').next("label").hide();
		}
		if(parentObj.find(".notearea").find("textarea").val()!==""){
			parentObj.find('#noting').next("label").find("i").addClass("icon-file-text-alt");
		}else{
			parentObj.find('#noting').next("label").find("i").addClass("icon-file-alt");
		}
		
	});
	parentObj.find('#noting').button();
	parentObj.find('#noting').change(function () {
		parentObj.find( ".notearea" ).dialog({
			autoOpen: true,
			height: 300,
			width: 350,
			modal: true,
			buttons: {
				"CLEAR Note": function() {
					$(this).find("textarea").val( "" );
					$( this ).dialog( "close" );
				},
				Accept: function() {
					$( this ).dialog( "close" );
				},
				Cancel: function() {
					$( this ).dialog( "close" );
				}
			},
			close: function() {
				parentObj.find('.noted').find("label").removeClass("ui-state-active");
				var value=$(this).find("textarea").val();
				parentObj.find("[name='item.content']").val(value);
				parentObj.find( "#noting" ).attr("checked",false);
				parentObj.find('#noting').next("label").find("i").removeClass("icon-file-text-alt").removeClass("icon-file-alt");
				if(value!==""){
					parentObj.find('#noting').next("label").find("i").addClass("icon-file-text-alt");
				}else{
					parentObj.find('#noting').next("label").find("i").addClass("icon-file-alt");
				}
				$( this ).dialog( "destroy" );
			}
		});
	});
}



	function apply_a_taxed_add(type,select_target,make_tax){
		$('a.tax_add').on('click',function(e){
			e.preventDefault();
			e.stopPropagation();
			start_taxed_add(type,select_target,make_tax);
		});
	}
	
	function start_taxed_add(type,select_target,make_tax){

		if(select_target==="undefined"){
			select_target = $($(this).data('select'));
		}
		if($( "#taxonomyitem" ).length<=0){
			$('body').append("<div id='taxonomyitem'>");
		}
		var dialog_obj = $("#taxonomyitem");
		if(type==="undefined"){
			type = $(this).data('type');
		}

		$.ajax({cache: false,
		   url:"/admin/edit_taxonomy.castle",
		   data:{"skiplayout":1,"type":type},
		   success: function(data){
				dialog_obj.html(data);
				dialog_obj.dialog({
					autoOpen: true,
					resizable: false,
					//width: $(window).width()*.40,
					//height: $(window).height()*.50,
					modal: true,
					draggable : false,
					create:function(){
						$('body').css({overflow:"hidden"});
						$("#taxonomyitem .ui-dialog-buttonpane").remove();
						dialog_obj.find('input[name$=".alias"]').closest('p').css({"display":"none"});
					},
					open:function(){
						turnon_alias(dialog_obj.find('input[name$=".name"]'),dialog_obj.find('input[name$=".alias"]'));
						if(typeof(make_tax)==="undefined"){
							make_a_tax_form(select_target,function(){
								alais_scruber(dialog_obj.find('input[name$=".name"]'),dialog_obj.find('input[name$=".alias"]'));
							});
						}
						if(typeof(make_tax)==="function"){
							make_tax(select_target);
						}
						},
					close: function() {
						$('body').css({overflow:"auto"});
						$( "#taxonomyitem" ).dialog( "destroy" );
						$( "#taxonomyitem" ).remove();
						
					}
				});
				$(window).resize(function(){
					var w = $(window).width() * (0.25);
					var h = $(window).height() * (0.25);
					$("#taxonomyitem" ).dialog('option', { width: w,  height: h });
				});
			}
		});
	
	}
	
	
	
	function make_a_tax_form(select_target,callback){
		var target_form = $("#taxonomyitem form");
		
			$('#taxonomyitem form').on("change",function(){
				var test_empty = true;
				$.each($('input,select'),function(){
					if($(this).not(":hidden").val()!==""&&$(this).not(":hidden").find(":selected").val()!==""){
						test_empty = false;
					}
				});
				$('#taxonomyitem form input[name="empty"]').val(test_empty+"");
			});
		
		target_form.find('[type="submit"]').on("click",function(e){
			e.preventDefault();
			e.stopPropagation();

	
			if(!target_form.find('input[name="empty"]').val()){
				if(typeof(callback)==="function"){
					callback();
				}
				var form_data = target_form.find( "input, textarea, select" ).serializeArray();

				$.ajax({cache: false,
				   url:"/center/update_taxonomy.castle?ajax=true",
				   data:form_data,
				   dataType : "json",
				   success: function(returndata){
						if(returndata.alias!==""){
							if(typeof(select_target)==="function"){
								select_target(returndata);
							}
							
							if(typeof(select_target)!=="undefined" && typeof(select_target)!=="function"){
								select_target.find('option:first').before('<option value="'+ returndata.alias +'" >'+returndata.name +'</option>');
							}
							$( "#taxonomyitem" ).dialog( "destroy" );
							$( "#taxonomyitem" ).remove();
							popup_message($("<span><h5>You have added a  new taxonomy!</h5>It has also selected for you</span>"));
							$('form[name="entry_form"] :input:first').trigger("change");
						}else{
							popup_message($("<span>failed to save, try again.</span>"));
						}
					}
				});
			}
		});
	}

// JavaScript Document

(function($) {
	$(document).ready(function() {
		
		$('#viewonly').change(function () {
			var state = $('#viewonly:checked').length;
			$.cookie('hivviewonly', state===1?"true":"false", { expires:1, path: '/' });
			//state = "viewonly="+state;
			window.location = window.location.href;//.split('?')[0]+"?"+state;
		});
		$( ".pubstate" ).buttonset();
		$('.pubstate.menuaction :radio').change(function () {
			$('.pubstate :radio').next("label").find("i").removeClass("icon-check-empty").removeClass("icon-check");
			$('.pubstate :radio').not(":checked").next("label").find("i").addClass("icon-check-empty");
			$('.pubstate :radio:checked').next("label").find("i").addClass("icon-check");
			var state = $('.pubstate :radio:checked').val();
			$.cookie('hivpubview', state===1?"true":"false", { expires:1, path: '/' });
			//state = "pub="+state;
			
			window.location = window.location.href;//.split('?')[0]+"?"+state;
		});
	
		setting_item_pub($(".container"));

		if($(".message.ui-state-highlight").length){
			setTimeout(function(){ $(".message.ui-state-highlight").fadeOut(500); },2000);
		}


		
	});
})(jQuery);
// JavaScript Document
	function sortedCode(){
		$('.substance_item .icon-trash').off().on("click",function(){
			$(this).closest('.substance_item').fadeOut("fast",function(){
				$(this).remove();
				sortedCode();
			});
		});
		var code="";
		$.each($(".substance_item"),function(i){
			code+= (code===""?"":"<em>:</em>") + $(this).find('.sub_code').text();
			$('.substanceOrder').val(i+1);
		});
		$("#sub_code").html(code);
	}

	




$(document).ready(function() {


	$("#sortable").sortable({
		handle: ".sortable_handle",
		placeholder: "ui-state-highlight",
		stop:function(){ sortedCode(); }
	});
	
	$("#famSubAdd").on("click",function(e){
		e.preventDefault();
		e.stopPropagation();
		//var sudo_code=Math.random().toString(36).slice(2,5);
		//var baseid=Math.random();
		$.getJSON("/center/substances.castle?json=true&callback=?",function(data){
			//alert("got data");
			var html = "";
			$.each(data,function(i,v){
				html+="<span class='item i"+i+"' data-baseid='"+v.baseid+"' data-name='"+v.name+"' data-lab_code='"+v.lab_code+"'  ><i title='edit' class='icon-plus'></i>"+v.name+" ( "+v.lab_code+" )<br/></span>";
				
			});
			if($("#substances_list").length<=0){
				$('body').append('<div id="substances_list">');
			}
			$("#substances_list").html( html );
			$( "#substances_list" ).dialog({
				autoOpen: true,
				resizable: false,
				width: 350,
				minHeight: 25,
				modal: true,
				draggable : false,
				create:function(){
					$('.ui-dialog-titlebar').remove();
					//$(".ui-dialog-buttonpane").remove();
					$('body').css({overflow:"hidden"});
				},
				open:function(){
					$('.item .icon-plus').on("click",function(){
						var par = $(this).closest('span');
						par.fadeOut("fast");
						var html ="<li class='substance_item'>";
						html+="<i title='edit' class='icon-trash'></i>";
						html+="<span class='sortable_handle'>handle</span> "+par.data("name")+" (<span class='sub_code'>"+par.data("lab_code")+"</span>)";

						html+="<input type='hidden' name='substances["+par.data("baseid")+"].baseid' value='"+par.data("baseid")+"' class='substance'/>";
						html+="<input type='hidden' name='family_substance["+par.data("baseid")+"].baseid' value='0'  class=''/>";
						html+="<input type='hidden' name='family_substance["+par.data("baseid")+"].family.baseid' value='"+$('[name="item.baseid"]').val()+"'  class=''/>";
						html+="<input type='hidden' name='family_substance["+par.data("baseid")+"].substance_order' value='"+$(".substance_item").length+"'  class='substanceOrder'/>";
						html+="<input type='hidden' name='family_substance["+par.data("baseid")+"].substance.baseid' value='"+par.data("baseid")+"'  class=''/>";
						html+="</li>";

						$(html).appendTo("#sortable");
						$("#sortable").sortable("refresh");
						sortedCode();
					});
				},
				buttons:{
					Ok:function(){
						$( this ).dialog( "close" );
					}
				},
				close: function() {
					$('body').css({overflow:"auto"});
					$( "#substances_list" ).dialog( "destroy" );
					$( "#substances_list" ).remove();
				}
			});
		});
		
	});
	
	$("#famSubCode .icon-edit").on("click",function(){
		if($("#subCodeEdit").is($('.open'))){
			$("#subCodeEdit").slideUp("slow", function() {
				$("#subCodeEdit").removeClass("open");
				$("#subCodeEdit").addClass("closed");
			});
		}else{
			$("#subCodeEdit").slideDown("slow", function() {
				$("#subCodeEdit").addClass("open");
				$("#subCodeEdit").removeClass("closed");
			});
		}
	});
	$("#subCodeEdit .icon-power-off").on("click",function(){
		$("#subCodeEdit").slideUp("slow", function() {
			$("#subCodeEdit").removeClass("open");
			$("#subCodeEdit").addClass("closed");
		});
	});
	sortedCode();


	// addTab button: just opens the dialog
	var drProTab = $( "#drPro_tabed" ).tabs().addClass( "ui-tabs-vertical ui-helper-clearfix" );
	$( "#drPro_tabed li" ).removeClass( "ui-corner-top" ).addClass( "ui-corner-left" );


	var drPro_tabTemplate = "<li><a href='#{href}' data-baseid='#{baseid}' data-name='#{name}' data-alias='#{alias}'>#{label}</a> <i class='icon-remove'></i></li>";
	var drPro_tabCounter = $( "#drPro_tabed li" ).length;
	var drPro_tabDefaultContent = '<table width="100%" class="drpro_table display" ellspacing="0"><thead><tr><th>Amt.</th><th>Manufacure</th><th>Actions</th></tr></thead><tfoot><tr><th></th><th></th><th></th></tr></tfoot><tbody></tbody></table>';




	function add_drProTableRow(form){
		var html = "";
		html+="<div id='drPro_additions' class='min'>";
			html+="<h4>Create new "+form+"</h4>";
				html+="<div id='create_drPros_stub' class='full-input'>";
					html+="<form action='/center/savedrug.castle' method='post'><input name='item.baseid' type='hidden' value='0'>";
						html+="<input type='hidden' name='item.families[1].baseid' value='"+$("[name='item.baseid']").val()+"'/>";
						html+="<input type='hidden' name='item.dose_form' value='"+form+"'/>";
						html+="<input type='hidden' name='item.attached' value='false'/>";
						html+="<label>Amount<br/><input type='text' name='item.label_claim'/><br/></label>";
						html+="<label>Manufacturer<br/><select name='item.manufacturer' id='quick_drPro_manufacturer'><option value=''>Select</option></select><br/></label>";
						html+="<a href='#' id='create_drPros_stub_submit' class='button'>Add drug product stub</a>";
					html+="</form>";
				html+="</div>";
		html+="</div>";
		html+="<div class='clearfix'></div>";
		
		if($("#form_list").length<=0){
			$('body').append('<div id="form_list">');
		}
		$("#form_list").html( html );
		$( "#form_list" ).dialog({
			autoOpen: true,
			resizable: false,
			width: 350,
			minHeight: 150,
			height: 'auto',
			maxHeight: $(window).height(),
			modal: true,
			draggable : false,
			create:function(){
				$('.ui-dialog-titlebar').remove();
				//$(".ui-dialog-buttonpane").remove();
				$('body').css({overflow:"hidden"});
			},
			open:function(){
				$.getJSON('/center/get_taxonomies.castle?tax=commercial&callback=?',  function(data){
					var list="";
					$.each(data,function(i,v){
						list+="<option value='"+v.alias+"'>"+v.name+"</option>";
					});
					$('#quick_drPro_manufacturer').append(list);
				});
				$('.item .icon-plus').on("click",function(){
					var name = $(this).closest('span').data('name');
					var baseid = $(this).closest('span').data('baseid');
					var alias = $(this).closest('span').data('alias');
					add_drProTab(name,baseid,alias);
				});
				
				$('#create_drPros_stub_submit').on("click",function(e){
					e.preventDefault();
					e.stopPropagation();
					var form_data = $('#create_drPros_stub form').find( "input, textarea, select" ).serializeArray();
	
					$.ajax({cache: false,
					   url:$('#create_drPros_stub form').attr('action')+"?json=true&ajaxed_update=true&callback=?",
					   data:form_data,
					   dataType : "json",
					   success: function(returndata){
							if(returndata.baseid!==""){
								popup_message($("<span><h5>You have added a new Durg Protuct!</h5> It was added to the table of products for the drug form.</span>"));
								$('#drpro_empty').remove();
								$('[href="#existing_drPros"]').trigger('click');
								$.each(returndata,function(i,v){
									var dataTable = $("[id^='drPro_tabs_"+form+"']").find('.dataTable');
									var tableData = [];
									
									var count = dataTable.find("tr").length;
									var html = v.label_claim + '<input type="hidden" name="item.drugs['+(count)+'].baseid" value="'+v.baseid+'" class="drug_item list_item"/><input type="hidden" name="item.drugs['+(count)+'].attached" value="true" class="drug_item list_item"/>';
									tableData.push( html );
									tableData.push( v.manufacturer ); 
									tableData.push( '<a href="#" class="button xsmall crimson defocus removal"><i class="icon-remove" title="Remove"></i></a>' ); 
									dataTable.dataTable().fnAddData( tableData );
								});
								$( "#form_list" ).dialog( "close" );
							}else{
								popup_message($("<span>failed to save, try again.</span>"));
							}
						}
					});
				});
			},
			buttons:{
				Ok:function(){
					$( this ).dialog( "close" );
				}
			},
			close: function() {
				$('body').css({overflow:"auto"});
				$( "#form_list" ).dialog( "destroy" );
				$( "#form_list" ).remove();
			}
		});
	}



	function add_drProTab(name,baseid,alias) {
		var id = "drPro_tabs_" + alias +"_"+ drPro_tabCounter,
			li = $( drPro_tabTemplate
						.replace( /#\{href\}/g, "#" + id )
						.replace( /#\{label\}/g, name )
						.replace( /#\{baseid\}/g, baseid )
						.replace( /#\{name\}/g, name )
						.replace( /#\{alias\}/g, alias )
					);
		if($("[id^='drPro_tabs_" + alias +"_']").length<=0){
			drProTab.find( ".ui-tabs-nav" ).prepend( li );
	
			var contentHtml = drPro_tabDefaultContent;/*.replace( /\{\{YEAR\}\}/g, label ) ;
			contentHtml = contentHtml.replace( /\{\{COUNT\}\}/g, drPro_tabCounter+1 ).replace( /\{\{__\}\}/g, "" ) ;*/
			drProTab.prepend( "<div id='" + id + "'>" + contentHtml + "</div>" );
			drProTab.tabs( "refresh" );
			drProTab.tabs( "option", "active", drPro_tabCounter );
			$('.drpro_table:not(".dataTable")').DataTable({ 
					"bJQueryUI": true,
					"sPaginationType": "full_numbers", 
					"fnDrawCallback": function() {//(oSettings ) {
						if($("#" + id).find('.fg-toolbar .add_drPro').length<=0){
							$("#" + id).find('.fg-toolbar.ui-widget-header:first').prepend('<a href="#" class="button add_drPro" style="float:left;">Add <i title="edit" class="icon-plus"></i></a>');
						}
						$("#" + id).find('.drpro_table .dataTables_empty').html('No '+name+' products available. <a href="#" class="add_drPro">Add <i title="edit" class="icon-plus"></i></a>');
						$("#" + id).find('.add_drPro').off().on("click",function(e){
							e.preventDefault();
							e.stopPropagation();
							add_drProTableRow(alias);
						});
						//make_datatable_popup_add(datatable);
					}
				});
			drPro_tabCounter++;
			/*$.each( $('input[name^="markets_counts["]' ), function(i){
				$(this).attr('name','markets_counts['+ (i+1) +']');
			});*/
		}
	}
	
	drProTab.delegate( "i.icon-remove", "click", function() {
		var panelId = $( this ).closest( "li" ).remove().attr( "aria-controls" );
		$( "#" + panelId ).remove();
		drProTab.tabs( "refresh" );
		/*$.each( $('input[name^="markets_counts["]' ), function(i){
			$(this).attr('name','markets_counts['+ (i+1) +']');
		});*/
	});
	
	$('#addDrugForm').on('click',function(e){
		e.preventDefault();
		e.stopPropagation();
		
		if($('.substance_item').length<=0){
			alert("You must add substances before you can add drugs");
			return false;	
		}
		
		
		
		
		$.getJSON('/center/get_taxonomies.castle?tax=dose_type&callback=?',  function(data){

			var html = "";
			html += "<div id='listing' style='max-height:95%; overflow-y:scroll;'>";
			$.each(data,function(i,v){
				if($("[id^='drPro_tabs_" + v.alias +"_']").length<=0){
					html+="<span class='item i"+i+"' data-baseid='"+v.baseid+"' data-name='"+v.name+"' data-alias='"+v.alias+"'  ><i title='edit' class='icon-plus'></i>"+v.name+" ( "+v.alias+" )<br/></span>";
				}
				
			});
			html += "</div>";
			html+="<span id='add_drform' style='cursor:pointer;'><hr/><i title='edit' class='icon-plus'></i>Add a New form</span>";
			
			
			if($("#form_list").length<=0){
				$('body').append('<div id="form_list">');
			}
			$("#form_list").html( html );
			$( "#form_list" ).dialog({
				autoOpen: true,
				resizable: false,
				width: 350,
				minHeight: 25,
				height:"auto",
				maxHeight: $(window).height()*0.65,
				modal: true,
				draggable : false,
				create:function(){
					$('.ui-dialog-titlebar').remove();
					//$(".ui-dialog-buttonpane").remove();
					$('body').css({overflow:"hidden"});
				},
				open:function(){
					$('#add_drform').on("click",function(){
						start_taxed_add(
							"dose_type", 
							function(){}, 
							function(){
								make_a_tax_form(function(data){
									$("#listing").append("<span class='item i"+data.baseid+"' data-baseid='"+data.baseid+"' data-name='"+data.name+"' data-alias='"+data.alias+"'  ><i title='edit' class='icon-plus'></i>"+data.name+" ( "+data.alias+" )<br/></span>");
						
						
									//this may be something that is functioned?  look a few line below			
									$('.item .icon-plus').on("click",function(){
										$(this).closest('span').fadeOut("fast");
										var name = $(this).closest('span').data('name');
										var baseid = $(this).closest('span').data('baseid');
										var alias = $(this).closest('span').data('alias');
										add_drProTab(name,baseid,alias);
									});
								});
							}
						);
					});
					$('.item .icon-plus').on("click",function(){
						$(this).closest('span').fadeOut("fast");
						var name = $(this).closest('span').data('name');
						var baseid = $(this).closest('span').data('baseid');
						var alias = $(this).closest('span').data('alias');
						add_drProTab(name,baseid,alias);
					});
				},
				buttons:{
					Ok:function(){
						$( this ).dialog( "close" );
					}
				},
				close: function() {
					$('body').css({overflow:"auto"});
					$( "#form_list" ).dialog( "destroy" );
					$( "#form_list" ).remove();
				}
			});
		});
		 
	});
	
	$.each($('.drpro_table:not(".dataTable")'),function(){
		var id=$(this).closest('.tabedItem').attr('id');
		var alias=$(this).closest('.tabedItem').attr('alias');
		var name=$(this).closest('.tabedItem').attr('name');
		$(this).DataTable({ 
				"bJQueryUI": true,
				"sPaginationType": "full_numbers", 
				"fnDrawCallback": function() {//(oSettings ) {
					
					
					
					if($("#" + id).find('.fg-toolbar .add_drPro').length<=0){
						$("#" + id).find('.fg-toolbar.ui-widget-header:first').prepend('<a href="#" class="button add_drPro" style="float:left;">Add <i title="edit" class="icon-plus"></i></a>');
					}
					$("#" + id).find('.drpro_table .dataTables_empty').html('No '+name+' products available. <a href="#" class="add_drPro">Add <i title="edit" class="icon-plus"></i></a>');
					$("#" + id).find('.add_drPro').off().on("click",function(e){
						e.preventDefault();
						e.stopPropagation();
						add_drProTableRow(alias);
					});
					//make_datatable_popup_add(datatable);
				}
		});	
	});			
	
});
// JavaScript Document

(function($) {
	$(document).ready(function() {
		


		var tabs = $( "#tabed" ).tabs().addClass( "ui-tabs-vertical ui-helper-clearfix" );
		//var uitabs = $( ".uitabs" ).tabs();
		
		$('.ui-state-default span.ui-icon-close').on("click", function() {
			var panelId = $( this ).closest( "li" ).remove().attr( "aria-controls" );
			$( "#" + panelId ).remove();
			tabs.tabs( "refresh" );
			$.each( $('input[name^="markets_counts["]' ), function(i){
				$(this).attr('name','markets_counts['+ (i+1) +']');
			});
		});
		$( "#tabed li" ).removeClass( "ui-corner-top" ).addClass( "ui-corner-left" );
		$( "#newyear" ).button().on('click',function(){
			//var txt = $("#querybed").html();
			if($( "#marketdialog" ).length<=0){
				$('body').append('<div id="marketdialog" title="Tab data"><form><fieldset class="ui-helper-reset"><label for="tab_title">Year</label><input type="number" name="tab_date" id="tab_date" value="" class="ui-widget-content ui-corner-all" /></fieldset></form></div>');
			}	
			var tabTitle = $( "#tab_date" );
			var tabTemplate = "<li><a href='#{href}'>#{label}</a> <span class='ui-icon ui-icon-close' role='presentation'>Remove Tab</span></li>";
			var tabCounter = $( "#tabed li" ).length;
	
			var today = new Date();
	
			// modal dialog init: custom buttons and a "close" callback reseting the form inside
			var dialog = $( "#marketdialog" ).dialog({
				autoOpen: true,
				modal: true,
				create:function(){
					make_maskes();
					$('#tab_date').spinner({
						min: 1980,
						max: today.getFullYear() + 2,
						create: function() {
							$('#tab_date').spinner( "value", today.getFullYear() );
						},
						change:function(){
							if( $('#tab_date').val() > today.getFullYear() + 2 ){
								$( "#marketdialog" ).append('<p style="display:block; background-color:yellow; color:red; padding: 2px 5px;" id="yearWarning">You reached the max year. Reseting the year for you.</p>');
								setTimeout(function(){ $("#yearWarning").fadeOut(500); },2000);
								$('#tab_date').val(today.getFullYear()+2);
							}
						}
					});
					
					},
				buttons: {
					Add: function() {
						addTab();
						$( this ).dialog( "close" );
					},
					Cancel: function() {
						$( this ).dialog( "close" );
					}
				},
				close: function() {
					form[ 0 ].reset();
				}
			});
	
			// addTab form: calls addTab function on submit and closes the dialog
		
			var form = dialog.find( "form" ).submit(function( event ) {
				addTab();
				dialog.dialog( "close" );
				event.preventDefault();
			});
			// actual addTab function: adds new tab using the input from the form above
		
			function addTab() {
				var label = tabTitle.val() || "Tab " + tabCounter,
					id = "tabs-" + tabCounter,
					li = $( tabTemplate.replace( /#\{href\}/g, "#" + id ).replace( /#\{label\}/g, label ) );
				tabs.find( ".ui-tabs-nav" ).append( li );
				var content = $("#querybed").html();
				var contentHtml = content.replace( /\{\{YEAR\}\}/g, label ) ;
				contentHtml = contentHtml.replace( /\{\{COUNT\}\}/g, tabCounter+1 ).replace( /\{\{__\}\}/g, "" ) ;
				tabs.append( "<div id='" + id + "'>" + contentHtml + "</div>" );
				tabs.tabs( "refresh" );
				tabs.tabs( "option", "active", tabCounter );
				tabCounter++;
				$.each( $('input[name^="markets_counts["]' ), function(i){
					$(this).attr('name','markets_counts['+ (i+1) +']');
				});
			}
		
		
			tabs.delegate( "span.ui-icon-close", "click", function() {
				var panelId = $( this ).closest( "li" ).remove().attr( "aria-controls" );
				$( "#" + panelId ).remove();
				tabs.tabs( "refresh" );
				$.each( $('input[name^="markets_counts["]' ), function(i){
					$(this).attr('name','markets_counts['+ (i+1) +']');
				});
			});
		
			tabs.bind( "keyup", function( event ) {
				if ( event.altKey && event.keyCode === $.ui.keyCode.BACKSPACE ) {
					var panelId = tabs.find( ".ui-tabs-active" ).remove().attr( "aria-controls" );
					$( "#" + panelId ).remove();
					tabs.tabs( "refresh" );
				}
			});
		});







		
	});
})(jQuery);
// JavaScript Document
(function($) {
	
	function moa_dmpk_setup(){
		$.each($('.has_moa_dmpk:not(.activated)'),function(){
			var tar = $(this);
			$(this).addClass('activated');
			var dep = tar.closest('.moa_dmpk_block').find('.moa_dmpk');
			if(tar.val()===""){
				dep.hide();
			}
			tar.on("keyup",function(){
				if(tar.val()===""){
					dep.find(':selected').attr('selected',false);
					dep.hide();
				}else{
					dep.show();
				}
			});
		});
	}

	function re_index_query_items(){
		$.each($(".query_item:not('#queryBed .query_item')"),function(i){
			$.each($(this).find("input:visible ,select:visible "),function(){
				//var name = $(this).attr('name');
				$(this).attr('name', $(this).attr('name').split('[')[0]+"["+i+"]");
			});
		});
	}
	function make_prop_select(){
		$(".property_selector").off().on("change",function(){
			
			var prop = $(this).val();
			var query_item = $(this).closest('.query_item');
			
			//alert(prop);
			query_item.find('.input_box input,.input_box select').removeAttr("name");
			query_item.find('.input_box [name*=value]').val('');
			
			query_item.find('.input_box').removeClass("showen");
			query_item.find('.input_box.'+prop+'').addClass("showen");
			if(query_item.find('.input_box:visible').length<=0){
				query_item.find('.input_box.gen').addClass("showen");
			}
			query_item.find('.input_box:visible input,.input_box:visible select').attr("name","value[9999]");
			re_index_query_items();
		});
	}



	function set_prop_sel(val){
		$.each( $('form select.property_selector,form select[name="selected_properties"]') ,function(){
			$(this).find('option').attr("selected",false);
			$(this).find('optgroup').hideOptionGroup();
			var pname = $(this).closest('select').attr("name");
			$('optgroup.'+val+'s[data-pname="'+pname+'"]').showOptionGroup();
		});
	}
	
	function apply_tax_request(){
		$.each($('.requested_taxed:not(.activated)'),function(){
			var tar = $(this);
			tar.addClass('activated');
			if(tar.find('.add').length<=0){
				tar.find('option:last').after('<option value="" class="add">Request new option</option>');
			}
		});
	
		$('.requested_taxed').on('change',function(){
				var select_target = $(this);
				var target = $(this).find('option:selected');
				if(!target.hasClass("add")){
					return;
				}
		
				target.removeAttr("selected");
				
				
				if($( "#taxonomyitem" ).length<=0){
					$('body').append("<div id='taxonomyitem'>");
				}
				var data='<h3>Make a request for a new item</h3><lable>Name:</lable><input type="text" value=""/><br/><br/><input type="submit" value="Subbmit Request"/>';
				var dialog_obj = $("#taxonomyitem");
					dialog_obj.html(data);
					dialog_obj.dialog({
							autoOpen: true,
							resizable: false,
							width: 450,
							//height: $(window).height()*.50,
							modal: true,
							draggable : false,
							create:function(){
								$('body').css({overflow:"hidden"});
								$(".ui-dialog-buttonpane").remove();
								dialog_obj.find('input[name$=".alias"]').closest('p').css({"display":"none"});
								make_tax_form(select_target,function(){
									alais_scruber(dialog_obj.find('input[name$=".name"]'),dialog_obj.find('input[name$=".alias"]'));
								});
							},
							open:function(){
								turnon_alias(dialog_obj.find('input[name$=".name"]'),dialog_obj.find('input[name$=".alias"]'));
								},
							close: function() {
								$('body').css({overflow:"auto"});
								$( "#taxonomyitem" ).dialog( "destroy" );
								$( "#taxonomyitem" ).remove();
								
							}
						});
						
		});
	}

	function apply_taxed_add(){
		/* add taxonomy */
		$.each($('.taxed:not(.activated)'),function(){
			var tar = $(this);
			tar.addClass('activated');
			if(tar.find('.add').length<=0){
				tar.find('option:last').after('<option value="" class="add">Add new option</option>');
			}
		});
		$('.taxed').on('change',function(){
			var select_target = $(this);
			var target = $(this).find('option:selected');
			if(!target.hasClass("add")){
				return;
			}
	
			target.removeAttr("selected");
			
			
			if($( "#taxonomyitem" ).length<=0){
				$('body').append("<div id='taxonomyitem'>");
			}
			var dialog_obj = $("#taxonomyitem");
			
			var secselect_target;
			var type = select_target.attr("rel")!=="" ? select_target.attr("rel") : select_target.attr("id");
			if(select_target.attr("rel").length){
				secselect_target = $('[rel="'+type+'"]');
			}
			$.ajax({cache: false,
			   url:"/admin/edit_taxonomy.castle",
			   data:{"skiplayout":1,"type":type},
			   success: function(data){
					dialog_obj.html(data);
					dialog_obj.dialog({
							autoOpen: true,
							resizable: false,
							modal: true,
							draggable : false,
							create:function(){
								$('body').css({overflow:"hidden"});
								$(".ui-dialog-buttonpane").remove();
								dialog_obj.find('input[name$=".alias"]').closest('p').css({"display":"none"});
								make_tax_form(select_target,function(){
									alais_scruber(dialog_obj.find('input[name$=".name"]'),dialog_obj.find('input[name$=".alias"]'));
								},secselect_target);
							},
							open:function(){
								turnon_alias(dialog_obj.find('input[name$=".name"]'),dialog_obj.find('input[name$=".alias"]'));
								},
							close: function() {
								$('body').css({overflow:"auto"});
								$( "#taxonomyitem" ).dialog( "destroy" );
								$( "#taxonomyitem" ).remove();
							}
						});
						$(window).resize(function(){$("#taxonomyitem" ).dialog('option', { width: $(window).width()*0.25,  height: $(window).height()*0.25,});																													
					});
				}
			});
		});
	}

	function set_up_form(type){
		//,inlist,use){
		/*if($('#clinlic_to_drug').length){
			$('#clinlic_to_drug').html($('#brand_name').val()+'<input type="hidden" value="'+$('[name="item.baseid"]').val()+'"/>');
		}*/
		make_maskes();
		moa_dmpk_setup();
		apply_tax_request();
		apply_taxed_add();
		setting_item_pub($(".ui-dialog"));
		$('input[name^="post"]').val($('input[name="item.baseid"]').val());

		$("#load_file").on("click",function(){ $(".load_file").toggleClass("active"); });
		
		$("#drug_form [type='submit']").on("click",function(e){
			var form = $(this).closest("form");
			if (form.find(':invalid').length<=0) {
				e.preventDefault();
				e.stopPropagation();
				$.post(form.attr("action")+"?skiplayout=1&ajaxed_update=1",form.serialize(),function(){//(data){
					//var parts= data.split(',');
					$( "#drug_form" ).dialog( "destroy" );
					$( "#drug_form" ).remove();
					$(".add_to_list[data-type='"+type+"']").trigger("click");
				});
			}
		});	
	}



	function add_item_popup(type,inlist,use,id){
		if(typeof(use)==="undefined"){ 
			use = ["new","list"];
		}
		if($("#drug_form").length===0){
			$("#staging").append("<div id='drug_form'><div id='drug_list'></div><div id='drug_item'></div>");
		}

		var buttons = "";


		$.ajax({cache: false,
		   url:"/center/"+type+"s.castle",
		   data:{"skiplayout":1,"exclude":inlist,typed_ref:$('[name="typed_ref"]').val()},
		   success: function(data){
				if($.inArray("list", use)>-1){
					$("#drug_list").html(data);
					buttons += "<a href='#drug_list' id='drug_list_tab' class='popuptab button med active'>List</a>";
				}
					$.ajax({cache: false,
					   url:"/center/"+type+".castle",
					   data:{"skiplayout":1,"id":typeof(id)==="undefined"?"":id,typed_ref:$('[name="typed_ref"]').val()},
					   success: function(data){
						   if($.inArray("new", use)>-1){
								$("#drug_item").html(data);
								buttons += "<a href='#drug_item' id='drug_item_tab' class='popuptab button med'>New</a>";
						   }
						$( "#drug_form" ).dialog({
								autoOpen: true,
								resizable: false,
								width: $(window).width()-50,
								height: $(window).height()-50,
								modal: true,
								draggable : false,
								buttons: {
									Cancel: function() {
										$( this ).dialog( "close" );
									}
								},
								create:function(){

									$( "#mess" ).dialog( "destroy" );
									$( "#mess" ).remove();
									if($("#drug_item").html()!=="" && $("#drug_list").html()!==""){
										$("#drug_form").closest('.ui-dialog').find('.ui-dialog-title').append(buttons);
										$("#drug_item").hide();
									}
									//setup_tabs();
									
									$('body').css({overflow:"hidden"});
									$(".ui-dialog-buttonpane").remove();
									
									if($("#drug_list").html().length>0){
										make_popup_datatable(type);
									}
				
									$(".popuptab").off().on("click",function(e){
										e.preventDefault();
										e.stopPropagation();
										var id = $(".popuptab.active").attr("href");
										$(id).hide();
										$(".popuptab.active").removeClass('active');
										$(this).addClass('active');
										id = $(this).attr("href");
										$(id).show();	
										
									});
									set_up_form(type,inlist,use);
									activate_adverse_ui();
								},
								close: function() {
									$('body').css({overflow:"auto"});
									$( "#drug_form" ).dialog( "destroy" );
									$( "#drug_form" ).remove();
									
									last_datatable=null;
								}
							});
							$(window).resize(function(){$("#drug_form" ).dialog('option', { width: $(window).width()-50,  height: $(window).height()-50,});
						});
					}
				});
			}
		});
	}
	function make_tax_form(select_target,callback,secselect_target){
		var target_form = $("#taxonomyitem form");
		target_form.find('[type="submit"]').on("click",function(e){
			e.preventDefault();
			e.stopPropagation();
			$('#taxonomyitem form').on("change",function(){
				var test_empty = true;
				$.each($('input,select'),function(){
					if($(this).not(":hidden").val()!==""&&$(this).not(":hidden").find(":selected").val()!==""){
						test_empty = false;
					}
				});
				$('#taxonomyitem form input[name="empty"]').val(test_empty+"");
			});
	
			if(!target_form.find('input[name="empty"]').val()){
				if(typeof(callback)!=="undefined"){
					callback();
				}
				var form_data = target_form.find( "input, textarea, select" ).serializeArray();
				$.ajax({cache: false,
				   url:"/admin/update_taxonomy.castle?ajax=true",
				   data:form_data,
				   dataType : "json",
				   success: function(returndata){
						if(returndata.alias!==""){
							select_target.find('.add').before('<option value="'+ returndata.alias +'" '+(select_target.is(secselect_target)?"selected":"")+' >'+returndata.name +'</option>');
							$( "#taxonomyitem" ).dialog( "destroy" );
							$( "#taxonomyitem" ).remove();
							popup_message($("<span><h5>You have added a  new taxonomy!</h5>It has also selected for you</span>"));
							$('form[name="entry_form"] :input:first').trigger("change");
						}else{
							popup_message($("<span>failed to save, try again.</span>"));
						}
					}
				});
			}
		});
	}








 

	
	
	
	
	function activate_adverse_ui(){
		
		function controll_meta_items(){
			$('.remove').hover(function(){$(this).removeClass('red');},function(){$(this).addClass('red');});
			$('.remove').on("click",function(){
				var container = $(this).closest('li');
				var option = container.find('[name^="option"]').val();
				$(".adverse_events option[value='"+option+"']").removeAttr("disabled");
				container.fadeOut(function(){ $(this).remove(); });
			});
			re_index_meta_items();
		}	
		function re_index_meta_items(){
			$.each(
			   $(".adverse_events").closest('ul').find("li[data-taxorder]"),
			   function(i){
					$(this).data('taxorder',i);
					$.each($(this).find("input,select:not([name=''])"),function(){
						//var name = $(this).attr('name');
						$(this).attr('name', $(this).attr('name').split('[')[0]+"["+i+"]");
					}); 
				}
			);
		}
		
		$(".adverse_events").on("change", function(){
			var selected = $(this).val();
			var selected_obj = $(this).find('option[value="'+selected+'"]');
			var container = $(this).closest('ul');
			
			var baseid = selected_obj.data('baseid');
			var content = selected_obj.data('content');
			var alias = selected_obj.data('alias');
			
			
			//this works by
			//tax is picked. 
			//the tax, since it's a base id can have a child.
			//that child is the 
			
			var is_none = alias ==="none"?"":"required";
			
			container.append(
				 '<li data-taxorder="9999" data-name="'+selected_obj.val()+'">'+
					'<i class="icon-remove-circle red right remove"></i>'+
					 '<label>'+ selected_obj.text() +' <i class="icon-question-sign blue" title="'+ content +'"></i>'+
					 '</label>'+
					 '<input type="'+(alias ==="none"?"hidden":"text")+'" name="value[9999]" id="" '+is_none+' value=""/>'+//child
					 '<input type="hidden" name="option_key[9999]" value="'+baseid+'" />'+//tax_id
				 '</li>'
			);
			selected_obj.attr("disabled",true);
			$(this).val("");
			controll_meta_items();
			re_index_meta_items();
			make_maskes();
		});
		controll_meta_items();
	}
	function get_table_ids(datagrid){
		var inlist ="";
		var nNodes = datagrid.dataTable().fnGetNodes( );
		$.each(nNodes,function(i,v){
			var item = $(v).find('input.list_item');
			inlist+=(inlist===""?"":",")+item.val();
		});
		return inlist;
	}
	function get_select_ids(select){
		var inlist ="";
		$.each(select.find('option'),function(){
			inlist+=(inlist===""?"":",")+$(this).val();
		});
		return inlist;
	}
	function make_datatable_popup_add(datatable,type){
		$('.additem').off().on('click',function(e){
			e.preventDefault();
			e.stopPropagation();
			var trigger = $(this);
			var targetrow = trigger.closest('tr');
			var baseid = targetrow.data("baseid");
			
			var count = datatable.find("tbody").find("tr").length;
			
			var tdCount = targetrow.find("td").length;
			alert(tdCount);
			var tableData = [];
			
			var html = targetrow.find("td:first").text() + '<input type="hidden" name="item.'+type+'s['+(count-1)+'].baseid" value="'+baseid+'" class="drug_item list_item"/>';
			tableData.push( html );
			tableData.push( targetrow.find("td:first").next('td').text() ); 
			if(tdCount>3){
				tableData.push( targetrow.find("td:first").next('td').next('td').text() ); 
			}
			tableData.push(
				'<a href="#" class="button xsmall crimson defocus removal"><i class="icon-remove" title="Remove"></i></a>'
			); 

			$("[data-active_grid='true']").dataTable().fnAddData( tableData );
			
			targetrow.fadeOut( "75" ,function(){ datatable.fnDeleteRow( datatable.fnGetPosition( targetrow.get(0) ) ); });
			
			$("#drug_form").append("<span class='dialog_message ui-state-highlight'>Added to this "+$("#header_title").text()+"</span>");
			
			setTimeout(function(){$(".dialog_message").fadeOut("500");},"1000");
			
			$("ul .display.datagrid.dataTable .removal").off().on("click",function(e){
				e.preventDefault();
				e.stopPropagation();
				var targetrow = $(this).closest("tr");
				
				var datatable = $(this).closest('.datagrid').dataTable();
				
				targetrow.fadeOut( "75" ,function(){ datatable.fnDeleteRow( datatable.fnGetPosition( targetrow.get(0) ) ); });
			});
		});
	}

	//var parent_datagrid = null;
	var last_datatable=null;
	function make_popup_datatable(type){
		$.each($('.datagrid:not(.dataTable)'),function(){
			var datatable = $(this);
			datatable.dataTable({ 
				"bJQueryUI": true,
				"sPaginationType": "full_numbers",
				"fnDrawCallback": function() {//(oSettings ) {
					make_datatable_popup_add(datatable);
				}
			});

			last_datatable=datatable;
			make_datatable_popup_add(datatable,type);
		});
	}



	$(document).ready(function() {

		$("select[name*='inactive_ingredients[]']").on("change",function(){
			var sel="";
			$.each($(this).find(':selected'),function(i){
				sel+=(i>0?",":"")+$(this).val();
			});
			$("[name$='inactive_ingredients']").val(sel);
		});
	
		$('#start_save_query').on('click',function(e){
			e.preventDefault();
			e.stopPropagation();
			$('#to_save_query').slideDown();
			$('#start_save_query').slideUp();
		});

		moa_dmpk_setup();
		make_maskes();

		if($('.add_ref').length){
			$('.add_ref').on("click",function(e){
				e.preventDefault();
				e.stopPropagation();
				//var targetrow = $(this).closest("grid");
				
				var datatable = $(this).closest('.datagrid').dataTable({
					"aaSorting": [[1,'asc']]
					});
				//var count = datatable.find("tbody").find("tr").length;
				datatable.dataTable().fnAddData( [
					'<input type="hidden" name="item.references[$count].baseid" value="$part.baseid" class="drug_item"/>$part.type',
					'<a href="$item.url" class="ref_link"><i class="icon-external-link"></i></a>',
					'$item.note',
					'<a href="substance.castle?id=$part.baseid" class="button small inline_edit" data-type="substance">Edit</a> | <a href="#" class="button xsmall crimson defocus removal">Remove</a>' ]
				);
			});
		}


		if($('select[name^="property"],.property_selector').length){
			$("#types").on("change",function(){
	
				set_prop_sel($("#types").val());
	
				$('.input_box').removeClass("showen");
				$('.input_box.gen').addClass("showen");
				$('.input_box [name*=value]').val('');
			}).trigger("change");
		}
	
	
	
	
	

		$("#ADD_query").on("click",function(e){
			e.preventDefault();
			e.stopPropagation();
			$(".query_item:not('#queryBed .query_item')").last().after($("#queryBed").html());
			$(".REMOVE_query").off().on("click",function(e){
				e.preventDefault();
				e.stopPropagation();
				$(this).closest(".query_item").fadeOut("150",function(){
					$(this).remove();
					make_prop_select();
					re_index_query_items();
				});					   
			});
			make_prop_select();
			re_index_query_items();
			set_prop_sel($("#types").val());
		});
		make_prop_select();
		
	
	
	
		$("#load_file").on("click",function(){
			$(".load_file").toggleClass("active");
			$(".load_file input").removeAttr("required");
			$(".load_file:visible input").attr("required",true);
		});
	
	
	
	
		$('form[name="entry_form"] :input').on("change",function(){
			
			var test_empty = true;
			$.each($('input,select'),function(){
				if($('form[name="entry_form"] :input').not(":hidden").val()!==""){
					test_empty = false;
				}
			});
			$('input[name="empty"]').val(test_empty+"");
		});
		
		var bypassed = true;
		var excepted = false;
		$('form[name="entry_form"] [type="submit"]').on("click",function(){
			var target = $(this);
			 if($('input[name="empty"]').val()==="true" && !excepted&& !bypassed){
				 if($( "#message" ).length<=0){
					 $('body').append("<div id='message'>");
				 }
				 $( "#message" ).html("The form is empty, are you sure you want to add the record?");
				 $( "#message" ).dialog({
					autoOpen: true,
					resizable: false,
					width: 350,
					height:200,
					modal: true,
					draggable : false,
					buttons: {
						Cancel: function() {
							$( this ).dialog( "close" );
						},
						Ok: function() {
							$( this ).dialog( "close" );
							excepted=true;
							target.trigger("click");
						}
					},
					create:function(){
						$('body').css({overflow:"hidden"});
						//$(".ui-dialog-buttonpane").remove();
					},
					close: function() {
						$('body').css({overflow:"auto"});
						$( "#message" ).dialog( "destroy" );
						$( "#message" ).remove();
					}
				});
			}
			 return ( $('input[name="empty"]').val()==="true" && !excepted && !bypassed )?false:true;
		});
	
	
	

		apply_tax_request();
		apply_taxed_add();
	

		
		
		
		
		
		
		
		apply_a_taxed_add();

		
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
		
		
		

		
		
		
		activate_adverse_ui();
	
		
	
		
		
	

		
		
	
	
		if($('.datagrid').length){
			
			var datagrids = $('.datagrid');
			$.each(datagrids,function(){
				var datatable = $(this);
				datatable.dataTable( {
					"bJQueryUI": true,
					"sPaginationType": "full_numbers",
					"aaSorting": [[1,'asc']]
				});
			});
			
			var addTos = $(".add_to_list");
			$.each(addTos,function(){
				var targ = $(this);
				targ.on("click",function(e){
					e.preventDefault();
					e.stopPropagation();
					var targ = $(this);
					var type = targ.data('type');
					
					var focused_grid = targ.prev('.dataTables_wrapper').find('.datagrid');
					$("[data-active_grid='true']").attr("data-active_grid",false);
					focused_grid.attr("data-active_grid",true);
	
					var list ="";
					if(focused_grid.find(".dataTables_empty").length<=0){
						list = get_table_ids( focused_grid );
					}
					popup_message('<span style="font-size: 28px;"><i class="icon-spinner icon-spin icon-large"></i> Loading content...</span>',true);
					add_item_popup(type, list, ["new","list"]);
				});
			});
			
			var removals = $(".display.datagrid.dataTable .removal");
			$.each(removals,function(){
				var targ = $(this);
				targ.on("click",function(e){
					e.preventDefault();
					e.stopPropagation();
					var targ = $(this);
					var targetrow = targ.closest("tr");
					var datatable = targ.closest('.datagrid').dataTable();
					targetrow.fadeOut( "75" ,function(){ 
						var row = targetrow.get(0);
						datatable.fnDeleteRow( datatable.fnGetPosition( row ) );
					});
				});
			});
	
		}
	
	
	
	

	
		$('option.add_item').on('click',function(e){
			e.preventDefault();
			e.stopPropagation();
			$(this).attr('selected',false);
			add_item_popup($(this).closest('select').data('type'),  get_select_ids( $(this).closest('select') ) ,["new"]);
		});
		
		$('.inline_edit').on('click',function(e){
			e.preventDefault();
			e.stopPropagation();
			popup_message('<span style="font-size: 28px;"><i class="icon-spinner icon-spin icon-large"></i> Loading content...</span>',true);
			add_item_popup($(this).data('type'),"",["new"], $(this).closest('tr').data('baseid') );
		});
		
		
	
	
	
	

		
	
	
	
	});
})(jQuery);
