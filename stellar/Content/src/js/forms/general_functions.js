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