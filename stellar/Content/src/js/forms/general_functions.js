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
(function($) {
  
  $.fn.areYouSure = function(options) {
      
    var settings = $.extend(
      {
        'message' : 'You have unsaved changes!',
        'dirtyClass' : 'dirty',
        'change' : null,
        'silent' : false,
        'addRemoveFieldsMarksDirty' : false,
        'fieldEvents' : 'change keyup propertychange input',
        'fieldSelector': ":input:not(input[type=submit]):not(input[type=button])"
      }, options);

    var getValue = function($field) {
      if ($field.hasClass('ays-ignore') || $field.hasClass('aysIgnore') || $field.attr('data-ays-ignore') || $field.attr('name') === undefined) {
        return null;
      }

      if ($field.is(':disabled')) {
        return 'ays-disabled';
      }

      var val;
      var type = $field.attr('type');
      if ($field.is('select')) {
        type = 'select';
      }

      switch (type) {
        case 'checkbox':
        case 'radio':
          val = $field.is(':checked');
          break;
        case 'select':
          val = '';
          $field.find('option').each(function() {
            var $option = $(this);
            if ($option.is(':selected')) {
              val += $option.val();
            }
          });
          break;
        default:
          val = $field.val();
      }

      return val;
    };

    var storeOrigValue = function($field) {
      $field.data('ays-orig', getValue($field));
    };

    var checkForm = function(evt) {

      var isFieldDirty = function($field) {
        var origValue = $field.data('ays-orig');
        if (undefined === origValue) {
          return false;
        }
        return (getValue($field) !== origValue);
      };

      var $form = ($(this).is('form')) ? $(this) : $(this).parents('form');

      // Test on the target first as it's the most likely to be dirty
      if (isFieldDirty($(evt.target))) {
        setDirtyStatus($form, true);
        return;
      }

      var $fields = $form.find(settings.fieldSelector);

      if (settings.addRemoveFieldsMarksDirty) {              
        // Check if field count has changed
        var origCount = $form.data("ays-orig-field-count");
        if (origCount !== $fields.length) {
          setDirtyStatus($form, true);
          return;
        }
      }

      // Brute force - check each field
      var isDirty = false;
      $fields.each(function() {
        var $field = $(this);
        if (isFieldDirty($field)) {
          isDirty = true;
          return false; // break
        }
      });
      
      setDirtyStatus($form, isDirty);
    };

    var initForm = function($form) {
      var fields = $form.find(settings.fieldSelector);
      $(fields).each(function() { storeOrigValue($(this)); });
      $(fields).unbind(settings.fieldEvents, checkForm);
      $(fields).bind(settings.fieldEvents, checkForm);
      $form.data("ays-orig-field-count", $(fields).length);
      setDirtyStatus($form, false);
    };

    var setDirtyStatus = function($form, isDirty) {
      var changed = isDirty !== $form.hasClass(settings.dirtyClass);
      $form.toggleClass(settings.dirtyClass, isDirty);
        
      // Fire change event if required
      if (changed) {
        if (settings.change){
			settings.change.call($form, $form);
		}

        if (isDirty){
			$form.trigger('dirty.areYouSure', [$form]);
		}
        if (!isDirty){
			$form.trigger('clean.areYouSure', [$form]);
		}
        $form.trigger('change.areYouSure', [$form]);
      }
    };

    var rescan = function() {
      var $form = $(this);
      var fields = $form.find(settings.fieldSelector);
      $(fields).each(function() {
        var $field = $(this);
        if (!$field.data('ays-orig')) {
          storeOrigValue($field);
          $field.bind(settings.fieldEvents, checkForm);
        }
      });
      // Check for changes while we're here
      $form.trigger('checkform.areYouSure');
    };

    var reinitialize = function() {
      initForm($(this));
    };

    if (!settings.silent && !window.aysUnloadSet) {
      window.aysUnloadSet = true;
      $(window).bind('beforeunload', function() {
        var $dirtyForms = $("form").filter('.' + settings.dirtyClass);
        if ($dirtyForms.length === 0) {
          return;
        }
        // Prevent multiple prompts - seen on Chrome and IE
        if (window.navigator.userAgent.toLowerCase().match(/msie|chrome/)) {
          if (window.aysHasPrompted) {
            return;
          }
          window.aysHasPrompted = true;
          window.setTimeout(function() {window.aysHasPrompted = false;}, 900);
        }
        return settings.message;
      });
    }

    return this.each(function() {
      if (!$(this).is('form')) {
        return;
      }
      var $form = $(this);
        
      $form.submit(function() {
        $form.removeClass(settings.dirtyClass);
      });
      $form.bind('reset', function() { setDirtyStatus($form, false); });
      // Add a custom events
      $form.bind('rescan.areYouSure', rescan);
      $form.bind('reinitialize.areYouSure', reinitialize);
      $form.bind('checkform.areYouSure', checkForm);
      initForm($form);
    });
  };
})(jQuery);







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

var autosaved=false;
var t=null;
function autoSaver(){
	t=window.setInterval(function() {
		$.each($('form.autosave'),function() {
			var self = $(this);
			if($(".dialog_message.autosave").length<=0){
				$("body").append("<div class='dialog_message ui-state-highlight autosave'>");
			}
			$(".dialog_message.autosave").html("Auto saving");
			$(".dialog_message.autosave").show();
			$.ajax({
				url: $(this).attr("action"),
				data: "autosave=true&autosaved="+autosaved+"&"+$(this).serialize(),
				type: "POST",
				success: function(data){
					if(data && data === "success") {
						autosaved=true;
						$(".dialog_message.autosave").html("Auto saved form");
						self.trigger('reinitialize.areYouSure');
					}else if(data && data === "unsaved") {
						window.clearInterval(t);
						t=null;
						$(".dialog_message.autosave").html("Will not auto save untill the item is saved.");
						$(".dialog_message.autosave").show();
						setTimeout(function(){$(".dialog_message.autosave").fadeOut("500");},"4000");
						return;
					}else{
						$(".dialog_message.autosave").html("Failed to auto save");
					}
					$(".dialog_message.autosave").show();
					setTimeout(function(){$(".dialog_message.autosave").fadeOut("500");},"1000");
				}
			});
		});
	}, 10 * 1000);	
	
}	
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
/*
function setup_tabs(){
	var tabContents = $(".tab_content").hide(), 
	    tabs = $("ul.tabs li");
	tabs.addClass("tabed");
	tabs.first().addClass("active").show();
	tabContents.first().show();
	
	tabs.on("click",function(e) {
		e.preventDefault();
		e.stopPropagation();
	    var $this = $(this), 
	        activeTab = $this.find('a').attr('href');
	    
	    if(!$this.hasClass('active')){
	        $this.addClass('active').siblings().removeClass('active');
	        tabContents.hide().filter(activeTab).fadeIn();
	    }
	    return false;
	});	
	
	$( ".uitabs" ).tabs();
	
}
*/


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
			var attr=select_target.attr("rel");
			if (typeof attr !== typeof undefined && attr !== false) {
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
