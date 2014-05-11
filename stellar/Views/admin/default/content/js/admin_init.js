/*






CLEAN THIS UP










*/
/*-----------------------------------------------------------  Insert all JS that is related only to the admin area    NOTE:  var siteroot is set in the default veiw  var view is set in the default veiw-------------------------------------------------------------*/
var debug = false;
var image_Credit = '';
var image_Caption = '';
var FileName = '';
var $tabs;
var tooltips;
var tip_time;
var start_tip_time;
(function ($) {
    $.fn.blink = function (options) {
        var defaults = {
            delay: 500
        };
        var options = $.extend(defaults, options);
        return this.each(function () {
            var obj = $(this);
            setInterval(function () {
                if ($(obj).css("visibility") == "visible") {
                    $(obj).css('visibility', 'hidden');
                } else {
                    $(obj).css('visibility', 'visible');
                }
            }, options.delay);
        });
    }
}(jQuery));

function setup_fixedNav() {
    if ($(window).scrollTop() >= 122) {
        $('.admin #adminNav').addClass('fixed');
    }
    $(window).scroll(function (event) {
        if ($(this).scrollTop() >= 122) {
            $('.admin #adminNav').addClass('fixed');
        } else {
            $('.admin #adminNav').removeClass('fixed');
        }
    });
    $('.Cancel a').click(function (e) {
        e.stopPropagation();
        e.preventDefault();
        $("input[value='Cancel']:first").trigger('click');
    });
    $('.Submit a').click(function (e) {
        e.stopPropagation();
        e.preventDefault();
        $("input[value='Submit']:first").trigger('click');
    });
    $('.Apply a').click(function (e) {
        e.stopPropagation();
        e.preventDefault();
        $("input[value='Apply']:first").trigger('click');
    });
}

function typedown(mySelection) {
    window.location = siteroot + view + "list.castle?type=" + mySelection;
}

function dropdown(mySelection) {
    window.location = view + "list.castle?searchId=" + mySelection;
}

function showMessage(transport) {
    alert('An error occurred during the AJAX request.' + transport.responseText);
}


function set_transitional_message(txt){
	var txt = '<em>'+txt.split('').join('</em><em>')+'</em>';
	var $overlay = $('<div class="ui-overlay"><div class="ui-widget-overlay" style="position: fixed;z-index:999;"></div></div><div id="loadingmessage" class="ui-widget ui-widget-content ui-corner-all" style="position: fixed; width:200px; height:85px;left:45%; top:15%; padding: 10px; z-index:1000;"><h1>'+txt+'</h1></div>').appendTo('body');
	(function loadingtext(dir){
		if($('.ui-overlay').length){
			var len = $('#loadingmessage em').length;
			$.each($("#loadingmessage em"), function(i){
				var jObj = $(this);
				setTimeout( function() { dir=="in"?jObj.animate({opacity: 0.85},250+(i*5)):jObj.animate({opacity: 0.15},850); }, i*50 );
				if (i == len - 1) {
					setTimeout(function(){loadingtext(dir=="in"?"out":"in")}, i*50);
				}
			});
		}
	})();
	$(window).resize(function () { $overlay.width($(document).width()); $overlay.height($(document).height()); });
}







function updateaddAuthorDIV(transport) {
    var temp = document.getElementById("NextAuthorID");
    var newdiv = document.createElement('div');
    var divIdName = 'Author' + temp.value + 'Div';
    newdiv.setAttribute('id', divIdName);
    newdiv.innerHTML = transport.responseText;
    var ni = document.getElementById('NewAuthorHolderDiv');
    ni.appendChild(newdiv);
}

function AddAuthor() {
    ++author_count;
    $.get(siteroot + view + 'GetAddAuthor.castle?count=' + author_count, function (data) {
        $('#NewAuthorHolderDiv').append(data);
        $('#NewAuthorHolderDiv').find('select').addClass('authorSelect');
    });
}

function alertLoadingSaving(mess) {
    var mess = typeof (mess) !== 'undefined' ? mess : 'Saving . . .';
    if ($('dialog').length == 0) {
        $('body').append('<div id="dialog" style="display:none;"><h3>' + mess + '</h3></div>');
    }
    $("#dialog").dialog({
        position: ['center', 'top'],
        minHeight: '55px',
        hide: 'slide',
        resizable: false,
        draggable: false,
        close: function (event, ui) {}
    });
}

function removeAlertLoadingSaving() {
    $("#dialog").dialog("close");
}

function showMessage(transport) {
    alert('An error occurred during the AJAX request.' + transport.responseText);
}

function updateaddTagDIV(transport) {
    $('#NewTagHolderDiv').append('<div id="Tag' + temp.value + 'Div">' + transport.responseText + '</div>');
}

function AddTag() {
    ++tag_count;
    $.get('GetAddTag.castle?count=' + tag_count, function (data) {
        $('#NewTagHolderDiv').append(data);
    });
}

if (typeof (place_id) !== 'undefined') {
    var placeImgBtn = place_id > 0 ? "|,mainImage,|,imagegallery," : "";
}

function loadStat(stat, place_id, diaObj) {
    $.ajaxSetup({
        cache: false
    });
    var rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
    //alert(place_id);
    $.get(siteroot + view + 'setStatus.castle?id=' + place_id + '&status=' + stat, function (response, status, xhr) {
        var statIs = $("<div>").append(response.replace(rscript, "")).find('.place_' + place_id + ' .Status div');
        $('body .place_' + place_id + ' .Status').empty().append(statIs.html());
        $('body li.place_' + place_id).clone().prependTo('.list_' + stat);
        $('body li.place_' + place_id).not('.list_' + stat + ' li.place_' + place_id + ':first').remove();
        $(".button.pubState").removeClass('ui-state-focus').removeClass('ui-state-hover');
        $("#dialog .buttons").removeClass('ui-state-focus').removeClass('ui-state-hover');
        diaObj.dialog("close");
    });
}
function sendBr(place_id, diaObj) {
    $.ajaxSetup({
        cache: false
    });
    var rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
    //alert(place_id);
    $.get(siteroot + view + 'end_breaking_single.castle?id=' + place_id, function (response, status, xhr) {
        diaObj.dialog("close");
        if (response != 'true') {
            alertLoadingSaving(response);
        } else {
            alertLoadingSaving('Emails sent');
            setTimeout("removeAlertLoadingSaving()", 1500);
        }
    });
}
function clearLock(item_id, diaObj, callback) {
    $.ajaxSetup({
        cache: false,
        async: false
    });
    var rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
    //alert(place_id); 
    $.get(siteroot + view + 'clearLock.castle?id=' + item_id, function (response, status, xhr) {
        if (response == 'true') {
            if (typeof (diaObj) !== 'undefined' && diaObj != '') {
                $('body li.item_' + item_id).find('.inEdit').fadeOut('fast', function () {
                    $('body li.item_' + item_id).find('.inEdit').remove();
                });
                $('body li.item_' + item_id).find('.UinEdit').fadeOut('fast', function () {
                    $('body li.item_' + item_id).find('.UinEdit').remove();
                });
                $(".button.steal").removeClass('ui-state-focus').removeClass('ui-state-hover');
                $("#clearLock .button").removeClass('ui-state-focus').removeClass('ui-state-hover');
                $('body li.item_' + item_id).find('.button.editIt').attr('href', '_edit.castle?id=' + item_id);
                diaObj.dialog("close");
            }
            if ($.isFunction(callback)) callback();
        }
    });
}
function Checktitle(title, getid, callback) {
    $.ajaxSetup({
        cache: false
    });
    var rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
    //alert(place_id); 
    var returnId = getid ? '&id=true' : ''
    $.get(siteroot + view + 'checktitle.castle?title=' + title + returnId, function (response, status, xhr) {
        if ($.isFunction(callback)) callback(response);
    });
}
function addToggle() {
    $('.imageBox').hover(function () {
        $(this).find('.imgInfo').fadeIn('slow');
        $(this).find('.DeleteImage').fadeIn('slow');
    }, function () {
        $(this).find('.imgInfo').fadeOut('fast');
        $(this).find('.DeleteImage').fadeOut('fast');
    });
}
function removeToggle() {
    $('.imageBox').unbind('mouseenter mouseleave');
}
function addLiveActionAnimation() {
    $('div.actionCol a').hover(function () {
        $(this).find('.actionText').stop().animate({
            width: '100%'
        }, 500, function () {});
        $(this).stop().animate({
            width: 85
        }, 500, function () {});
        $(this).find('.actionpropt').stop().animate({
            width: 0
        }, 250, function () {});
    }, function () {
        $(this).find('.actionText').stop().animate({
            width: 0
        }, 250, function () {});
        $(this).stop().animate({
            width: 37
        }, 250, function () {});
        $(this).find('.actionpropt').stop().animate({
            width: 10
        }, 250, function () {});
    });
}
function tinyResize(id) {
    $(window).resize(function () {
        $.each($('textarea.tinyEditor.tinyLoaded'), function (i, v) {
            var id = $(this).attr('id');
            $('#' + id + "_tbl").width($(this).closest('div').width() - 40);
        });
    }).trigger("resize");
}
function set_buttons() {
    /*if ($(".buttons").length > 0) {
        $(".buttons").button({
            text: false
        });
    }*/
    int_itemListings();
    // move this.. set_buttons should be in this and botm moved to the admin_UI.js
}
function set_notes() {
    if ($('.NOTED').length) {
        $('.NOTED strong').off().on('click', function (e) {
            var self = $(this);
            var parent = $(this).closest('span');
            parent.find('span').slideToggle('fast', function () {
                self.is('.open') ? self.removeClass('open') : self.addClass('open');
                parent.find('em').text((self.is('.open') ? ' (-)' : ' (+)'));
            });
        });
    }
}
function set_tooltips() {
   /**/ tooltips = $("[title]").bind("mouseover", function (event) {
        event.stopImmediatePropagation();
        event.preventDefault();
        event.stopPropagation();
        var tar = $(this);
        if (!tar.is($("[role='tipped']"))) {
            tar.attr("role", "tipped");
            tar.tooltip("open");
        } else {
            tar.tooltip("disable");
            start_tip_time = setTimeout(function () {
                tar.tooltip("enable");
                tar.tooltip("open");
            }, 2500);
            return false;
        }
    }).bind("mouseleave", function (event) {
        clearTimeout(start_tip_time);
        $(this).tooltip("close");
        return false;
    }).tooltip({
        position: {
            my: "center bottom-20",
            at: "center top",
            using: function (position, feedback) {
                $(this).css(position);
                $("<div>").addClass("arrow").addClass(feedback.vertical).addClass(feedback.horizontal).appendTo(this);
            }
        },
        show: {
            //delay: 2500
        },
        open: function (event, ui) {
            tip_time = setTimeout(reset_tooltips, 2500)
        },
        close: function (event, ui) {
            clearTimeout(tip_time);
        }
    });
}
function reset_tooltips() {
	if(typeof(tooltips)!=="undefined"){
		$('[role=tooltip]').fadeOut(250, function () {
			$(this).remove()
		});
		tooltips.tooltip('destroy');
		$("*:focus").blur();
	}
    set_tooltips();
}
function set_tabs() {
	var taboptions = $.extend({}, typeof (cal_event) !== 'undefined' && cal_event == 0 ? {
		disabled: [3]
	} : {}, {
		activate: function (event, ui) {
			if ($('.tinyEditor').length) {
				tinyMCE.triggerSave();
				tinyResize();
			}

		}
	});
	
    if ($("#sub_tabs").length > 0) {
        $("#sub_tabs").tabs(taboptions);
    }
    if ($(".sub_tabs").length > 0) {
        $(".sub_tabs").each(function () {
            $(this).tabs(taboptions);
        });
    }
    if ($(".tabs").length > 0) {
        $(".tabs").each(function () {
            $(this).tabs(taboptions);
        });
    }
	
	var w = 130;
	$.each($(".left .ui-tabs-nav li"),function(){
		if( ($(this).text().length*2.5) > w ) w = ($(this).text().length*2.5);
	});
	
	$(".left.ui-tabs .ui-tabs-panel").css({"min-height": $(".left .ui-tabs-nav li").length*$(".left .ui-tabs-nav li:first").height()})

	
}
$(function () {
	if($("#compare").length){
		$("[name='rev']").on("change",function(){
			if($(".last[name='rev']").length){
				$(".last[name='rev']").attr("checked",false);
				$(".last[name='rev']").removeClass("last");
			}
			if($(".first[name='rev']").length){
				$(".first[name='rev']").addClass("last");
				$(".first[name='rev']").removeClass("first");
			}
			$(this).addClass("first");
			
		});
		$("#compare").on("click",function(){
			inline_diff($(this));
		});
	}
	function get_form_element_val(jObj){
		var value = jObj;
		var type = value.attr("type");
		
		if(type && (type.toLowerCase() == 'checkbox' || type.toLowerCase() == 'radio') )
			value = value.filter(":checked").val();
		else if(type && (type.toLowerCase() == 'select') )
			value = value.filter(":selected").val();
		else
			value = value.val();	
		return value;
	}
	if($('.dependence').length){
		(function set_dep_link(){
			$.each($('.dependence'),function(){
				var self = $(this);
				self.on('change',function(){
					var val = get_form_element_val(self);//alert(val);
					var dep = $('.dependent').filter(function() { return $(this).data("tiedto")==self.attr('rel'); });
					// class="dependent" style="#if($!site.get_option("usedev"))display:none;#end" data-tiedto="usedev" data-tiedmaatches="0
					if( dep.data("tiedmatches")+"" == val+"" || (  dep.data("dont_match")+"" != "undefined" && ( dep.data("dont_match")+"" != val+"" ) ) ) {
						dep.show();
						
					}else{
						dep.hide();
						//alert(dep.data("tiedmatches") +"-"+ self.val() + "|||" + dep.data("dont_match") + " --- hide");
					}
				});
			});
		})();
	}
	
	$('#is_Public_choice').click(function(e){
		e.preventDefault();
		e.stopPropagation();
		$('#public_choice').toggle("showOrHide");
		$('#is_Public_state').toggle("showOrHide");
	});
	$('#show_core').click(function(e){ e.preventDefault(); e.stopPropagation();
		var url = window.location.toString();
		window.location = url + (url.indexOf("?")?"&":"?") + "show_core=true";
	});	
	
	$('input[name="mass[]"]').on('change',function(){
		if($('input[name="mass[]"]:checked').length){
			$('input[name="mass[]"]').removeAttr("required");
		}else{
			$('input[name="mass[]"]').attr("required","required");
		}
	});
	
	$('input[name="massaction"]').on('click',function(){
		if($(this).is(':checked')){
			$('input[name="mass[]"]').attr("checked",true);
			$('input[name="massaction"]').attr("checked",true);
		}else{
			$('input[name="mass[]"]').attr("checked",false);
			$('input[name="massaction"]').attr("checked",false);
		}
	});
	
	
	
	
	
	function get_default(){
		return {
			position:{ my: "center top", at: "center top"}
		};
	}
	
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
	if($("#create_new_menu_item").length){
		function new_menu_item(trigerObj,callbacks){
			var self = trigerObj;
			if($.isEmptyObject(callbacks))callbacks={};
			if($('#staging').length==0)$('body').append('<div id="staging" style="position:absolute;top:-9999em;left:-9999;">');
			if($('#new_menu_item').length==0){
				$('body #staging').append('<div id="new_menu_item"><div id="loaded_menu_items"></div><div id="create_menu_item"></div></div>');
				$("#loaded_menu_items").append($("#nav_candidates"));	
			}
			$('#create_menu_item').load('/post/generate_stub.castle',
				{
					"view":"../admin/postings/custom_post_blocks/menu/post_stub",
					"skipLayout":1
				},
			function(){
				
				function refit(){
					if($(window).height()<600){
						$( "#new_menu_item" ).dialog("option","height",$(window).height() - 65);
					}
					if($(window).width()<450){
						$( "#new_menu_item" ).dialog("option","width",$(window).width() - 10);
					}
					$( "#new_menu_item" ).dialog("option","position",['center','center']);
					var height = 0;
					$.each($("#nav_candidates").find(".ui-accordion-header"),function(){
						height+=$(this).height();											 
					});
					$(".sortable.nav.pool").css({"max-height":$("#new_menu_item").height() - height - 75});
					$(".ui-widget-overlay").css({"height":$(window).height()})
					
				}
				
				
				$( "#new_menu_item" ).dialog({
					autoOpen:true,
					resizable: false,
					modal: true,
					draggable : false,
					position:['center','center'],
					width:450,
					title:"Items for Navagation",
					open:function(){
						$('body').css('overflow','hidden');
						$('.tabs').tabs({width:450});
						
						$(".ui-dialog-buttonpane").append("<a href='#' class='link_addition_mode button small left'>Create New</a>");
						
						$('.link_addition_mode').on("click",function(e){
							e.preventDefault();
							e.stopPropagation();
							if($(this).text()=="Loaded"){
								$("#create_menu_item").hide();
								$("#nav_candidates").show(function(){refit()});
								$( "#new_menu_item" ).dialog("option","title","Items for Navagation");
								$(this).text("Create New");
							}else{
								$("#nav_candidates").hide();
								$("#create_menu_item").show(function(){refit()});
								$( "#new_menu_item" ).dialog("option","title","Create Item for Navagation");
								$(this).text("Loaded");
							}
						});
						setup_sortable_nav(function(){refit()});
						
						$("#create_menu_item").hide(function(){});
						$("#nav_candidates").show(function(){refit()});
						
						$('#create_menu_item [type="submit"]').on("click",function(e){
							var form = $(this).closest("form");
							if (!(form.find(':invalid').length>0)) {
								e.preventDefault();
								e.stopPropagation();
								$.post(form.attr("action")+"?skiplayout=1&"+$(this).closest("form").serialize(),
									function(data){
										if(data=="true"){
											$( "#new_menu_item" ).dialog("close");
										}
									}
								);
							}
						});
						
						$(window).resize(function(){
							refit();
						});
						
						
						
						
					},
					close:function(){$('body').css('overflow','auto'); },
					buttons: {
						"Close": function() {
							$( "#inline_edit" ).dialog( "close" );
						}
					}
				});
			});
		}
		$("#create_new_menu_item").on("click",function(e){
			e.preventDefault();
			e.stopPropagation();
			new_menu_item(this);
		});
	}
	
	
	
	
	
	if($("#change_content_source").length){
		$("#change_content_source").on("click",function(e){
			//file_to_db_option_popup($(this));
			e.preventDefault();
			e.stopPropagation();
			
			var state = $(this).is(":checked");
			var self  =  $(this);
			if(!$(this).is(":checked")){
				if ($("#choose_ur_fate").length == 0) {
					$("body").append('<div id="choose_ur_fate"><strong>Choose how you would like to conversion your current state of this item.</strong></div>');
				}
				$("#choose_ur_fate").dialog({
					position: get_default().position,
					show: {effect:"drop",direction:"up"},
					hide:{effect:"explode"},
					autoOpen: true,
					minHeight: 125,
					width: "100%",
					modal: true,
					hide: 'blind',
					resizable: false,
					draggable: false,
					close:function(){
						$('body').css({overflow:"auto"});
						$( "#choose_ur_fate" ).dialog( "destroy" );
						$( "#choose_ur_fate" ).remove();
					},
					create:function( event, ui ) {
						$('body').css({overflow:"hidden"});
						$(this).closest('.ui-dialog').find('.ui-dialog-titlebar').hide();
						$(this).closest('.ui-dialog').css({"position":"fixed"});
					},
					open:function( event, ui ) {
						$('.ui-widget-overlay').css({"position":"fixed"});
					},
					close:function( event, ui ) {
						$('body').css({overflow:"auto"});
					},
					buttons:
					[{
						text: "Cancel",
						click: function() { $( this ).dialog( "close" ); return false; }
					},{
						text: "Push To Database",
						click: function() {
							$( this ).dialog( "close" );
							self.attr("checked",false);
							set_transitional_message("Saving...");
							$('#content_tar form').append('<input name="transition" value="file_to_db" />');
							$('#content_tar form').append('<input name="apply" value="hotkey" />');
							$('#content_tar form').submit();
						}
					},{
						text: "Start from Blank",
						click: function() { 
							$( this ).dialog( "close" );
							self.attr("checked",false);
							set_transitional_message("Saving...");
							$('#content_tar form').append('<input name="transition" value="to_db" />');
							$('#content_tar form').append('<input name="apply" value="hotkey" />');
							$('#content_tar form').submit();
						
						}
					}]
				});
			}else{
				if ($("#choose_ur_file").length == 0) {
					$("body").append('<div id="choose_ur_file">You area about to virtualize the content to the database.</div>');
				}
				$("#choose_ur_file").dialog({
					position: get_default().position,
					show: {effect:"drop",direction:"up"},
					hide:{effect:"explode"},
					autoOpen: true,
					minHeight: 125,
					width: "100%",
					modal: true,
					hide: 'blind',
					resizable: false,
					draggable: false,
					create:function( event, ui ) {
						$('body').css({overflow:"hidden"});
						$(this).closest('.ui-dialog').find('.ui-dialog-titlebar').hide();
						$(this).closest('.ui-dialog').css({"position":"fixed"});
					},
					open:function( event, ui ) {
						$('.ui-widget-overlay').css({"position":"fixed"});
					},
					close:function( event, ui ) {
						$('body').css({overflow:"auto"});
					},
					buttons:
					[{
						text: "Cancel",
						click: function() { $( this ).dialog( "close" );  return false; }
					},{
						text: 'From Content area',
						click: function() {
							$( this ).dialog( "close" );
							self.attr("checked",true);
							set_transitional_message("Saving...");
							$('#content_tar form').append('<input name="transition" value="db_to_file" />');
							$('#content_tar form').append('<input name="apply" value="hotkey" />');
							$('#content_tar form').submit();
						}
					},{
						text: 'Upload file',
						click: function() {
							$( this ).dialog( "close" );
							self.attr("checked",true);
							set_transitional_message("Saving...");
							$('#content_tar form').append('<input name="transition" value="db_to_file" />');
							$('#content_tar form').append('<input name="apply" value="hotkey" />');
							$('#content_tar form').submit();
						}
					}]
				});
			}
		});
	}
	
	if($('.theme_choice').length){
		$('.theme_choice').on('click',function(){
			if ($("#choose_ur_fate").length == 0) {
				$("body").append('<div id="choose_ur_fate"><strong>You may have new content blocks and layouts that need to be pushed to the database to over write the older ones from the theme your moving away from.  SHOULD we copy the new file to the database, or should we just make new entries and read them from the file?</strong></div>');
			}
			$("#choose_ur_fate").dialog({
				position: get_default().position,
				show: {effect:"drop",direction:"up"},
				hide:{effect:"explode"},
				autoOpen: true,
				minHeight: 125,
				width: "100%",
				modal: true,
				hide: 'blind',
				resizable: false,
				draggable: false,
				create:function( event, ui ) {
					$('body').css({overflow:"hidden"});
					$(this).closest('.ui-dialog').find('.ui-dialog-titlebar').hide();
					$(this).closest('.ui-dialog').css({"position":"fixed"});
				},
				open:function( event, ui ) {
					$('.ui-widget-overlay').css({"position":"fixed"});
				},
				close:function( event, ui ) {
					$('body').css({overflow:"auto"});
				},
				buttons:
				[{
					text: "Cancel",
					click: function() { $( this ).dialog( "close" ); return false; }
				},{
					text: "Import new theme file to Database",
					click: function() {
						$( this ).dialog( "close" );
						self.attr("checked",false);
						set_transitional_message("Saving...");
						$('#content_tar form').append('<input name="transition" value="push_new_theme_to_db" />');
						$('#content_tar form').append('<input name="apply" value="hotkey" />');
						$('#content_tar form').submit();
					}
				},{
					text: "Use new theme blocks from file.",
					click: function() { 
						$( this ).dialog( "close" );
						self.attr("checked",false);
						set_transitional_message("Saving...");
						$('#content_tar form').append('<input name="transition" value="use_theme_as_files" />');
						$('#content_tar form').append('<input name="apply" value="hotkey" />');
						$('#content_tar form').submit();
					}
				}]
			});	
		});
	}
	
	$(window).keypress(function(e) {
		if($('#content_tar form').length){
			if (!(e.which == 115 && e.ctrlKey) && !(e.which == 19)) return true;
			set_transitional_message("Saving...");
			$('#content_tar form').append('<input name="apply" value="hotkey" />');
			$('#content_tar form').submit();
			e.preventDefault();
			return false;
		}
	});

	function alais_scruber(jObj){
		var str = jObj.val();
        	str=str.split(' ').join('-');
			str=str.split('&').join('-and-');
            str=str.replace(/[^A-Za-z0-9\-_]/g, "");
			str=str.split('--').join('-');
			str=str.split('__').join('_');
			str=str.split('/').join('');
		jObj.val(str.toLowerCase());
	}
	
	$('.alias_input').on("keyup",function(){
		alais_scruber($(this));
		$('#post_url span#aliased').text($("#alias").val());
	});
	
	$('#edit_post_url').on("click", function(){
	 	$("#alias").show();
		$('#aliased,#get_post_go_link,#edit_post_url,#edit_custom_url').hide();
	});
	
	$("#alias").on("blur", function(){
	 	if($("#alias").val()!=""){
			$('#post_url span#aliased').text($("#alias").val());
			$("#alias").hide();
			$('#aliased,#get_post_go_link,#edit_post_url,#edit_custom_url').show();
		}	
	});
	$("#name").on("blur", function(){
	 	if($("#name").val()!="" && $("#alias").val()==""){
			
			$("#alias").val($("#name").val());
			alais_scruber($("#alias"));
			
			$('#post_url span#aliased').text($("#alias").val());
			$("#alias").hide();
			$('#aliased,#get_post_go_link,#edit_post_url').show();
		}	
	});	
	
	
	
	
	
    $('.insotryupload').on('click', function () {
        openImgUploader();
    });
    $('.imgInfo').slideToggle();
    $('.DeleteImage').fadeToggle();
    addToggle();
    addLiveActionAnimation();
    if ($(".lazy img,img.lazy").length) {
        $(".lazy img,img.lazy").lazyload();
    }
    if ($("input.all").length) {
        $("input.all").on('click', function (e) {
            var ele = $(this);
            if (ele.is(':checked')) {
                ele.closest('div').find('select option').attr('selected', 'selected');
            } else {
				ele.closest('div').find('select option').removeAttr('selected');
            }
        });
        $("input.all").closest('div').find('select').on('mouseup', function () {
            if ($(this).find('option').size() == $(this).find(':selected').size()) {
                $(this).closest('div').find('input.all').attr("checked", true);
            } else {
                $(this).closest('div').find('input.all').attr('checked', false);
            }
        });
    }
    if (typeof (tinyMCE) !== 'undefined' && $('textarea.tinyEditor').length > 0) {
        $.each($('textarea.tinyEditor'), function (i, v) {
            if (!$(this).is($(".tinyLoaded"))) {
                if (typeof ($(this).attr('id')) == "undefined") $(this).attr('id', 'temp_' + i)
				 if ($(this).is($(".full"))) {
                    load_tiny("bodytext", $(this).attr('id'));
                } else {
                    load_tiny("simple", $(this).attr('id'));
                }
                $(this).addClass("tinyLoaded");
                tinyResize();
            }
        });
    }
	
	
	
	
	
	function setup_sortable_nav(callback){
	
		$( "#nav_candidates" ).accordion({
			header: "h3",
			heightStyle: "content",
			collapsible: true,
			active: false,
			icons:false,
			activate:function(){if(typeof(callback)!=="undefined")callback();}
		});

		
		
		
		var sorter = $('ol#nav_items');
		function unmask(sorter){
			$.each(sorter.find("li"), function (i, v) {
				var li = $(this);
				$.each(li.find("input[name^='_']"),function(){
					var input = $(this);
					var name = input.attr("name").replace("_", '');
					input.attr("name",name.split('9999').join(i));
				});
			});	
		}
		function set_tree(){
			$('.disclose').off().on('click', function() {
				$(this).closest('li').toggleClass('mjs-nestedSortable-collapsed').toggleClass('mjs-nestedSortable-expanded');
			});
			$('.remove_menu_item').off().on('click', function(e){
							e.preventDefault();
							e.stopPropagation();
				$(this).closest('li').remove();
				set_positions(sorter);
			});	
		}
		function set_positions(sorter){
			$.each(sorter.find("li"), function (i, v) {	
				var depth = $(this).parents('li.mjs-nestedSortable-branch').length;
				$(this).find('.nav_position').val(depth);
				$(this).find('.nav_sort').val(i + 1);
				$(this).find('.nav_level_display .value').text(depth);
				$(this).find('.nav_position_display .value').text(i + 1);
			});
		}
		
		var sorterChange = function (event, ui) {
				if (!$('.menu.formAction.Submit').is(':visible')) $('.menu.formAction.Submit').show();
				unmask(sorter);
				set_positions(sorter);
			};
		var sortOp = {
			disableNesting: 'no-nest',
			forcePlaceholderSize: true,
			handle: 'div',
			helper: 'clone',
			items: 'li',
			maxLevels: 3,
			opacity: .6,
			placeholder: 'placeholder',
			revert: 250,
			tabSize: 25,
			tolerance: 'pointer',
			toleranceElement: '> div',
			isTree: true,
			expandOnHover: 700,
			startCollapsed: true,
			create:sorterChange,		
			update: sorterChange
		};
		sorter.nestedSortable(sortOp);
		set_tree();
		set_positions(sorter);
		
		$.each($('ol.pool li .ADDELE'),function(){
			$(this).off().on('click',function(e){
							e.preventDefault();
							e.stopPropagation();
				var self = $(this);
				sorter.nestedSortable("disable");
				sorter.append(self.closest("li").clone());
				unmask(sorter);
				self.closest("li").fadeOut(50,function(){self.closest("li").fadeIn(50)});
				sorter.nestedSortable("enable");
				sorter.nestedSortable("refresh");
				sorter.nestedSortable( "refreshPositions" );
				set_tree();
				set_positions(sorter);
			});
		});	
		if(typeof(callback)!=="undefined")callback();
	}
	
	
	
    if ($('.sortable.nav').length) {
		
		setup_sortable_nav()
			
    } /* General Actions */
	
	
	
	
	
	
	
	
	
    /* setup UI */
    /*
	if ($(".admin input[type='submit']").length > 0) {
        $("input[type='submit']").button();
    }
	*/
    if ($("a[title='Delete']").length > 0) {
        var deleteing = '';
        var name = '';
        if ($("#deleteModule").length == 0) {
            $("body").append('<div id="deleteModule" title="Deleting"><h2 class="ui-state-error ui-corner-all"><span style="float: left; margin-right: .3em;margin-top:15px;margin-bottom:15px;" class="ui-icon ui-icon-alert"></span>Are you sure you<br/>wish to delete <span id="tar_item"></span>?</h2></div>');
        }
        $("a[title='Delete']").on('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            deleteing = $(this).attr('href');
            name = $(this).closest('tr').find('.name').html();
            $('#tar_item').html(name != '' && name != 'undfinded' ? name : 'this');
            $("#deleteModule").dialog("open");
        });
        $("#deleteModule").dialog({
            autoOpen: false,
            height: 225,
            width: 400,
            modal: true,
            hide: 'blind',
            resizable: false,
            draggable: false,
            buttons: {
                "Delete": function () {
                    $("a[title='Delete'].ui-state-focus").removeClass('ui-state-focus');
                    window.location = deleteing;
                },
                Cancel: function () {
                    $("a[title='Delete'].ui-state-focus").removeClass('ui-state-focus');
                    $(this).dialog("close");
                }
            }
        });
    } /* note this is for the gem area only */
    function post_tmp(form_obj, diaObj, callback) {
        $.ajaxSetup({
            cache: false,
            async: false
        });
        var rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
        //alert(place_id);
        $.post(form_obj.attr('action') + '?apply=Save', form_obj.serialize(), function (res, status, request) {
            var Location = '/place/_edit.castle?id=' + res;
            window.location = Location;
            $('body #content_area').fadeTo('fast', 25);
        });
    }
    function pagLoad() {
        //this needs to be readdressed so that it can account for url params that need to be passed in
        if ($('.ui-tabs-panel .pagination').length) {
            $.each($('.pagination'), function () {
                var panleId = $(this).closest('.ui-tabs-panel').attr('id');
                $(this).find('a').on('click', function (e) {
                    $('body').append('<h1 style="position:fixed; top:25%; left:45%; z-index:9999;text-align: center;" id="loading"><img src="../Content/images/loading.gif"/></br>Loading</h1>');
                    e.stopPropagation();
                    e.preventDefault();
                    //panleId
                    $.ajaxSetup({
                        cache: false
                    });
                    $('#' + panleId).load($(this).attr('href') + '&ajax=1 #' + panleId + '>.tab_tar', function () {
                        pagLoad();
                        $('#loading').remove();
                    });
                });
            });
            addLiveActionAnimation();
        }
    }
    function setInfoSlide() {
        $('.detailInfoBut').on('click', function () {
            if ($(this).closest('.detailCol').width() <= 1) {
                $(this).closest('.detailCol').stop().animate({
                    width: "125px"
                }, 500, function () {});
            } else {
                $(this).closest('.detailCol').stop().animate({
                    width: "0px"
                }, 500, function () {});
            }
        });
    }
    if ($('.autoselect').length) {
        $(".autoselect").each(function () {
            $(this).combobox();
        });
    }
    if ($("#tabs").length > 0) {
        var taboptions;
        if ($('#content_tar #tabs').length > 0) {}
        taboptions = $.extend(taboptions, typeof (cal_event) !== 'undefined' && cal_event == 0 ? {
            disabled: [3]
        } : {}, {
            activate: function (event, ui) {
                if ($('#editor_form #tabs .tinyEditor').length) {
                    tinyMCE.triggerSave();
                    tinyResize();
                }
                pagLoad();
                setInfoSlide();
            }
        });
        $tabs = $("#tabs").tabs(taboptions);
        if ($('#content_tar #tabs').length > 0 || (typeof (place_id) !== 'undefined' && place_id == 0)) {
            if ($("#LocationTypeSelect").length) {
                //$( "#LocationTypeSelect" ).combobox();				
                //$( "#LocationModelSelect" ).combobox();
            }
        }
        if ((typeof (place_id) !== 'undefined' && place_id == 0)) {
            if ($("#chooseModel").length == 0) {
                $("body").append('<div id="chooseModel" title="Choose the place model">' + '<p><strong>Choose a model </strong>' + 'that the place will be.  This will set forth all the options it can have.' + '<br/><select name="set_model" id="set_model">' + $('#LocationModelSelect').clone().html() + '</select></div>');
            }
            $("#chooseModel").dialog({
                autoOpen: true,
                height: 275,
                width: 350,
                modal: true,
                hide: 'blind',
                resizable: false,
                draggable: false,
                buttons: {
                    "Ok": function () {
                        if ($('#set_model :selected').val() != '') {
                            $(this).dialog("close");
                            if ($("#loading_tmp").length == 0) {
                                $("body").append('<div id="loading_tmp" title="Loading">' + '<img src="/Content/images/loading.gif" style="margin: 0 auto; display:block;" />' + '</div>');
                            }
                            $("#loading_tmp").dialog({
                                autoOpen: true,
                                height: 155,
                                width: 125,
                                modal: true,
                                hide: 'blind',
                                resizable: false,
                                draggable: false
                            });
                            post_tmp($('#editor_form'), $("#loading_tmp"), function () {});
                        } else {
                            $('#set_model').next('.ui-autocomplete-input').css({
                                'box-shadow': '0px 0px 10px 0px #f00'
                            }).addClass('errored');
                        }
                    }
                }
            });
            $('#set_model').combobox();
            $('#set_model').next('.ui-autocomplete-input').on('change', function () {
                if ($('#set_model :selected').val() != '') {
                    if ($('#set_model').next('.ui-autocomplete-input').is('errored')) { // changed hasClass for is for speed
                        $('#set_model').next('.ui-autocomplete-input').css({
                            'box-shadow': '0px 0px 10px 0px #23b618'
                        }).removeClass('errored');
                    }
                } else {
                    $('#set_model').next('.ui-autocomplete-input').css({
                        'box-shadow': '0px 0px 10px 0px #f00'
                    }).addClass('errored');
                }
                $("#LocationModelSelect option[value='" + $('#set_model :selected').val() + "']").attr("selected", "selected");
                $("#LocationModelSelect").next('input').val($('#set_model :selected').text());
            });
        }
        //var stat=$.QueryString["status"];
        var stat = param("status");
        var moveToTab = 0;
        if (stat == "review") {
            moveToTab = 1;
        } else if (stat == "draft") {
            moveToTab = 2;
        }
        if (moveToTab > 0) {
            $("#tabs").tabs("select", moveToTab);
        }
    }
    $(".editzone").on("blur", function () {
        var txt = $(this);
        txt.prev('.editable').text(txt.val());
        txt.parent(".pod").removeClass("editing");
    });
    $(".pod .editable").on('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).next().val($(this).text()).focus();
        $(this).parent().addClass("editing");
        var TAR = $(this).attr('rel');
		var cache = {}, lastXhr;
        $(this).next().autocomplete({
            minLength: 2,
            source: function (request, response) {
                var term = request.term;
                if (term in cache) {
                    response(cache[term]);
                    return;
                }
                lastXhr = $.getJSON("/place/get__" + TAR + ".castle", request, function (data, status, xhr) {
                    cache[term] = data;
                    if (xhr === lastXhr) {
                        response(data);
                    }
                });
            }
        });
    });
    $('#customNames').slideToggle().click();
    $('#customName').click(function () {
        $('#customName em').text($('#customName em').text() == '+' ? '-' : '+');
        $('#customNames').slideToggle();
    });
    $('#PlaceTagCreate').on('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        i = $('#taged .pod').size();
        if (i == 0) $('#taged').html('');
        $('#taged').append($('#tag_clonebed').html().replace(/[9]{4}/g, (i > -1 ? i : i + 1)).replace(/\|\|/g, ''));
    });
    $('.newLocation').on('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        i = $(this).prev('ul').find('li').size();
        $(this).prev('ul').append($('#locations_clonebed').html().replace(/[9]{4}/g, (i > -1 ? i : i + 1)).replace(/\|\|/g, ''));
    });
    $('[name="ele.type"]').not('#style_of').change(function () {
		$('.ops').html('');
		$('.default_bed_item').slideUp('fast');
		$('#field_'+$('[name="ele.type"] :selected').val()).slideDown('fast');
    });
	
	
	$('#feild_attr_options input[type="checkbox"]').on("change",function(){
			if($(this).siblings('span').is(':visible')){
				$(this).siblings('span').find('input').val('');
				$(this).siblings('span').hide();
			}else{
				$(this).siblings('span').show();
			}	
		});
	
	
    $("#ele_attr_multiple").on("change", function () {
        if ($("#ele_attr_multiple:checked").length) {
            $('.pod [type=radio]:checked').attr("checked", false);
            $('.pod [type=checkbox]:checked').attr("checked", false);
            $('.pod [type=radio]').hide();
            $('.pod [type=checkbox]').show();
        } else {
            $('.pod [type=radio]:checked').attr("checked", false);
            $('.pod [type=checkbox]:checked').attr("checked", false);
            $('.pod [type=radio]').show();
            $('.pod [type=checkbox]').hide();
        }
    });
    $('.pod [type=radio]').on("change", function () {
        $('.pod :checked').attr("checked", false);
        $(this).attr("checked", true);
    });
    $('.pod .opVal').on("change", function () {
        $(this).siblings('[type=radio]').val($(this).val());
        $(this).siblings('[type=checkbox]').val($(this).val());
    });
    $('#addOption').on('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        i = $('#ops .pod').size();
        $('#ops').append($('#option_clonebed').html().replace(/[9]{4}/g, (i > -1 ? i : i + 1)));
    });
    $('.deleteOption').on('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var tar = $(this).closest('.pod');
        var tarParent = tar.closest('.podContainer');
        tar.remove();
        reset_tooltips();
        tarParent.find('.pod').each(function (i) {
            $(this).find('input').each(function (j) {
                $(this).attr('name', $(this).attr('name').replace(/[\d+]/g, (i > -1 ? i : i + 1)));
            });
        });
    });
    /*    if($( ".datepicker.optionsA" ).length>0){	    $( ".datepicker.optionsA" ).each(function(){			$(this).datetimepicker({				showOtherMonths: true,				selectOtherMonths: true,				changeMonth: true,				changeYear: true,				showButtonPanel: true,				showAnim:"fold",				dateFormat: 'mm/dd/yy',				ampm: true,				hourGrid: 4,				minuteGrid: 10,				onClose: function(dateText, inst) {					//auto take off a null time.. ie if left at midnight, it's not wanted.					if (dateText.indexOf('00:00')!=-1||dateText.indexOf('12:00 AM')!=-1||dateText.indexOf('12:00 am')!=-1){						temp = dateText.split(' ');						$(this).val(temp[0]);					}				}			});	    });	}*/
    /* -----------    for stories    ---------------- */
    /* for place listings */

    if ($('.fliterList').length > 0) {
        $(".fliterList").on('change', function () {
            window.location = siteroot + view + "list.castle?searchId=" + $(this).find(':selected').val();
        });
    }
    $("#dialog").dialog({
        autoOpen: false,
        height: 165,
        width: 440,
        modal: true,
        hide: 'blind',
        resizable: false,
        draggable: false,
        buttons: {
            "Draft": function () {
                var diaObj = $(this);
                loadStat(1, place_id, diaObj);
            },
            "Review": function () {
                var diaObj = $(this);
                loadStat(2, place_id, diaObj)
            },
            "Published": function () {
                var diaObj = $(this);
                loadStat(3, place_id, diaObj)
            },
            Cancel: function () {
                $(".buttons.pubState").removeClass('ui-state-focus');
                $(this).dialog("close");
            }
        }
    });
    $(".pubState").on('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        place_id = $(this).closest('.place_aTar').attr('title');
        $("#dialog").dialog("open");
    }); /* for place editing */
    if (typeof (availableTags) !== 'undefined') {
        $("#place_Location").autocomplete({
            source: availableTags
        });
    }
    if ($('.imagedropDown').length > 0) {
        $(".imagedropDown").on('change', function () {
            if ($(this).closest('div').find(".selectedImage").length == 0) {
                $(this).closest('div').append('<img src="" class="selectedImage" width="100" />')
            }
            $(this).closest('div').find(".selectedImage").attr('src', siteroot + 'media/download.castle?id=' + $(this).val());
        });
    }
    if ($('.addImage').length > 0) {
        $(".addImage").on('click', function () {
            $.get(siteroot + view + 'GetAddImage.castle?count=' + image_count, function (data) {
                $('#ExistingImagesDiv').append(data);
                ++image_count;
            });
        });
    }
    if ($('.deleteAuthor').length > 0) {
        $('.deleteAuthor').on('click', function () {
            var author_id = $(this).attr('title');
            var PlaceId = $(this).attr('rel');
            alertLoadingSaving();
            $.get(siteroot + view + 'DeleteAuthor.castle?id=' + author_id + '&placeId=' + PlaceId, function (data) {
                $("div#AuthorDiv #div" + author_id).remove();
                setTimeout("removeAlertLoadingSaving()", 1500);
            });
        });
    }
    if ($('.DeleteTag').length > 0) {
        $('.DeleteTag').on('click', function () {
            var PlaceId = $(this).attr('title');
            var tag_id = $(this).attr('rel');
            alertLoadingSaving();
            $.get(siteroot + view + 'DeleteTag.castle?id=' + tag_id + '&placeId=' + PlaceId, function (data) {
                $("#tag_" + tag_id).closest('li').remove();
                setTimeout("removeAlertLoadingSaving()", 1500);
            });
        });
    }
    // $(".imagedropDown").change(function (){   
    //      $(".selectedImage",$(this).parent()).attr('src','media/download.castle?id=' + $(this).val());});	      
    //  });   
    /* for place listings */
    if ($('#clearLock').length == 0) {
        $('body').append('<div id="clearLock" title="Clear Place Editing Lock" style="display:none;"><p>Release the Place for editing<br/><strong>Note:</strong>If some one is editing it you may wish to ask to make sure they are done.</p></div>')
    }
    $("#clearLock").dialog({
        autoOpen: false,
        height: 165,
        width: 440,
        modal: true,
        hide: 'blind',
        resizable: false,
        draggable: false,
        buttons: {
            "Steal": function () {
                var diaObj = $(this);
                clearLock(place_id, diaObj);
            },
            Cancel: function () {
                $(".button.steal").removeClass('ui-state-focus');
                $(this).dialog("close");
            }
        }
    });
    $(".steal").on('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        place_id = $(this).attr('rel');
        $("#clearLock").dialog("open");
    });


    /* -----------
    for persons(Editors)
    ---------------- */
    if (typeof (availablePositions) !== 'undefined') {
        $("#person_position").autocomplete({
            source: availablePositions
        });
    }



    /* -----------
    for adverts
    ---------------- */
    if ($('#add_ad_image').length > 0) {
        $("#add_ad_image").on('click', function () {
            $.get(siteroot + view + 'GetAddImage.castle?count=' + image_count, function (data) {
                $('#NewImageHolderDiv').html($('#NewImageHolderDiv').html() + data);
                ++image_count;
            });
        });
    }

});



function ui_startup(callback) {
    setup_fixedNav();
    //set_buttons();
    set_notes();
    //set_tooltips();
    set_tabs();
    if ($.isFunction(callback)) callback();
    if ($("#code").length) load_codemirror();
}
$(function () {
    ui_startup();
});