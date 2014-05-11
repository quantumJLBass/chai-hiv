function limitChars(textid, limit, infodiv){
	var text = textid.val();	
	var textlength = text.length;
	if(textlength >= limit){
		infodiv.html('<strong>0</strong> left');
		textid.val(text.substr(0,limit));
		return false;
	}else{
		infodiv.html(''+ (limit - textlength) +' left');
		return true;
	}
}



jQuery.fn.toggleSwitch = function (params) {

    var defaults = {
        highlight: true,
        width: 45,
        change: null
    };

    var options = $.extend({}, defaults, params);

    $(this).each(function (i, item) {
        generateToggle(item);
    });

    function generateToggle(selectObj) {

        // create containing element
        var $contain = $("<div />").addClass("ui-toggle-switch");
		var $wrapper = $(selectObj).wrap("<div class='toggle_wrap'>")
        // generate labels
        $.each($(selectObj).find("option"),function (i, item) {
			if($(this).is(":selected")) selectObj.selectedIndex = i;
            $contain.append("<label>" + $(item).text() + "</label>");
        }).end().addClass("ui-toggle-switch");

        // generate slider with established options
        var $slider = $("<div />").slider({
            min: 0,
            max: 100,
            animate: "fast",
            change: options.change,
            stop: function (e, ui) {
                var roundedVal = Math.round(ui.value / 100);
                var self = this;
                window.setTimeout(function () {
                    toggleValue(self.parentNode, roundedVal);
                }, 11);
            },
            range: (options.highlight && !$(selectObj).data("hideHighlight")) ? "max" : null
        }).width(options.width);

        // put slider in the middle
        $slider.insertAfter(
            $contain.children().eq(0)
		);

        // bind interaction
        $contain.delegate("label", "click", function () {
            if ($(this).hasClass("ui-state-active")) {
                return;
            }
            var labelIndex = ($(this).is(":first-child")) ? 0 : 1;
            //toggleValue(this.parentNode, labelIndex);
        });

        function toggleValue(slideContain, index) {
            $(slideContain).find("label").eq(index).addClass("ui-state-active").siblings("label").removeClass("ui-state-active");
            $(slideContain).parent().find("option").eq(index).attr("selected", true);
            $(slideContain).find(".ui-slider").slider("value", index * 100);

			$.pageslide.close();
			var oldhtml = $('body').html();
			$('body').addClass("fullLoad");
			$('body').html('<div id="loading" style=""><h1><em>L</em><em>o</em><em>a</em><em>d</em><em>i</em><em>n</em><em>g</em></h1></div>');
			(function loadingtext(dir){
				var len = $('#loading em').length;
				$.each($("#loading em"), function(i){
					var jObj = $(this);
					setTimeout( function() { dir=="in"?jObj.animate({opacity: 0.85},250+(i*5)):jObj.animate({opacity: 0.15},850); }, i*50 );
					if (i == len - 1) {
						setTimeout(function(){loadingtext(dir=="in"?"out":"in")}, i*50);
					}
				});
			})();
			var local = window.location.toString();
			if(local.indexOf("?")==-1)local+="?";
			window.location = local.split("&dev")[0]+"&dev="+index;
        }

        // initialise selected option
        $contain.find("label").eq(selectObj.selectedIndex).click();

        // add to DOM
        $(selectObj).parent().append($contain);

    }
};


function alter_highlight_box(bdo_ele,height,width,top,left,zIndex){
	if($('.ele_highlighter[data-blockid="'+bdo_ele.data("blockid")+'"]').length==0){
		$('body').append('<div class="ele_highlighter" data-id="'+bdo_ele.data("id")+'" data-blockid="'+bdo_ele.data("blockid")+'" data-name="'+bdo_ele.data("name")+'"><a class="edit_link arrow_box" href="#" title="'+bdo_ele.data("type")+' - '+bdo_ele.data("name")+'"><i class="icon-edit"></i>  Edit </a><span class="hb_top"></span><span class="hb_right"></span><span class="hb_bottom"></span><span class="hb_left"></span></div>');
	}
	var container = $('.ele_highlighter[data-blockid="'+bdo_ele.data("blockid")+'"]');
	width -=6;
	container.css({
		top: top,
		left: left,
		width:1,
		height:1,
		"z-index":zIndex
	});
	container.find(".hb_top").css({
		top: 0,
		left: 0,
		width:width,
		height:1,
		position:"absolute",
		display:"block",
		"z-index":zIndex
	});
	container.find(".hb_right").css({
		top: 0,
		left:width,
		width:1,
		height:height,
		position:"absolute",
		display:"block",
		"z-index":zIndex
	});
	container.find(".hb_bottom").css({
		top:height,
		left:0,
		width:width,
		height:1,
		position:"absolute",
		display:"block",
		"z-index":zIndex
	});
	container.find(".hb_left").css({
		top:0,
		left:0,
		width:1,
		height:height,
		position:"absolute",
		display:"block",
		"z-index":zIndex
	});
}









function reset_edit_hitareas(jObj){
	$.each(jObj,function(i,v){
		var ele = $(this);
	
		var target = $('bdo[data-blockid="'+ele.data("blockid")+'"]');
		
		var width = 0;
		var height = 0;
		
		var leftest = 0;
		var rightest = 0;
		var topest = 0;
		var bottomest = 0;
		
		var elePos = ele.offset();
		var bottomTop = -1;
		var bottomLeft = -1;		
		
		
		$.each(target.children().not(".edit_link"),function(){
			if($(this).is(":visible")  && $(this).css('overflow')!="hidden"){
				var elechildPos = $(this).offset();	
				if(elechildPos.top < bottomTop || bottomTop==-1){ bottomTop = elechildPos.top; }
				if(elechildPos.left < bottomLeft|| bottomLeft==-1){ bottomLeft = elechildPos.left; }

				var thisWidth =  $(this).outerWidth(true);
				var thisHeight =  $(this).outerHeight(true);
				if(thisWidth>width && thisHeight>0) width = thisWidth;//rightest-leftest;//
				if(thisHeight>height && thisWidth>0) height += thisHeight;
			}
		});
		var height = target.outerHeight(true);
		
		if(bottomTop==-1)var bottomTop = elePos.top;
		if(bottomLeft==-1)var bottomLeft = elePos.left;	
		var zIndex = 99 + target.parents().length;
		ele.addClass("depth_"+target.parents('bdo').length);
		
		
		alter_highlight_box(ele,height,width,bottomTop,bottomLeft,zIndex);
		/*ele.css({
			top: bottomTop,
			left: bottomLeft,
			width:width-4,
			height:height,
			"z-index":zIndex
		});*/
	});
	
}


function setup_edit_hitareas(){
	$.each($('bdo'),function(i,v){
		var ele = $(this);
		var elePos = ele.offset();
		var bottomTop = 0;
		var bottomLeft = 0;		
		var width = -1;
		var height = -1;
		$.each(ele.children().not(".edit_link"),function(){
			if($(this).is(":visible")  && $(this).css('overflow')!="hidden"){
				var elechildPos = $(this).offset();	
				if(elechildPos.top < bottomTop || bottomTop==-1){ bottomTop = elechildPos.top; }
				if(elechildPos.left < bottomLeft|| bottomLeft==-1){ bottomLeft = elechildPos.left; }
				
				
				var thisWidth =  $(this).outerWidth(true);
				var thisHeight =  $(this).outerHeight(true);
				if(thisWidth>width && thisHeight>0) width = thisWidth;
				if(thisHeight>height && thisWidth>0) height += thisHeight;
			}
		});
		var height = ele.outerHeight(true);	

		/*if($('.ele_highlighter[data-blockid="'+ele.data("blockid")+'"]').length==0){
			$('body').append('<div class="ele_highlighter" data-id="'+ele.data("id")+'" data-blockid="'+ele.data("blockid")+'" data-name="'+ele.data("name")+'"><a class="edit_link" href="#" title="'+ele.data("type")+' - '+ele.data("name")+'">  <i class="icon-edit"></i>  Edit This</a></div>');
		}*/
		
		if(bottomTop==-1)var bottomTop = elePos.top;
		if(bottomLeft==-1)var bottomLeft = elePos.left;	
		var zIndex = 99 + ele.parents().length;
		
		alter_highlight_box(ele,height,width,bottomTop,bottomLeft,zIndex);
		
		var target = $('.ele_highlighter[data-blockid="'+ele.data("blockid")+'"]');
		target.addClass("depth_"+ele.parents('bdo').length);
		
		
		/*target.css({
			top: bottomTop,
			left: bottomLeft,
			width: width-4,
			height: height,
			"z-index":zIndex
		});*/
	});
	$('.ele_highlighter').mouseover(
		function(){
			var ele = $(this);
			reset_edit_hitareas(ele);
			ele.find('.edit_link').off().on("click",function(e){
				e.preventDefault();
				inline_edit(ele);
			});
			$('.ele_highlighter').removeClass("active");
			ele.addClass("active");		}
	);
	$('.ele_highlighter').mouseout(
		function(){
			//return false;
			var ele = $(this);
			$('.ele_highlighter').removeClass("active");
		}
	).trigger("mouseover").trigger("mouseout");	
	
	
	
	
	$('bdo').mouseover(
		function(){
			var ele = $('.ele_highlighter[data-blockid="'+$(this).data("blockid")+'"]');
			reset_edit_hitareas(ele);
			ele.find('.edit_link').off().on("click",function(e){
				e.preventDefault();
				inline_edit(ele);
			});
			$('.ele_highlighter').removeClass("active");
			ele.addClass("active");
		}
	);
	$('bdo').mouseout(
		function(){
			$('.ele_highlighter').removeClass("active");
		}
	).trigger("mouseover").trigger("mouseout");	
}

function inline_edit(trigerObj,callbacks){
		var self = trigerObj;
		
		var id = self.data("id");
		var alias = self.data("alias");
		var type = self.data("type");
		var ele_name = self.data("name");

		if($.isEmptyObject(callbacks))callbacks={};
		if($('#staging').length==0)$('body').append('<div id="staging" style="position:absolute;top:-9999em;left:-9999;">');
		if($('#inline_edit').length==0)$('body #staging').append('<div id="inline_edit"></div>');
		$('#inline_edit').load('/post/edit_post.castle',
			{
				"id":id,
				"skipLayout":1
			},
		function(){
			$('body').css('overflow','hidden');
			$( "#inline_edit" ).dialog({
				modal: true,
				autoOpen:true,
				width:"auto",
				width:$(window).width()-150,
				height:$(window).height()-100,
				title:"Inline Editor",
				open:function(){
					$('.ele_highlighter').removeClass("active");
					
					$( "#inline_edit" ).closest('.ui-dialog').attr("id","wsu_ui_default");
					$( "#inline_edit" ).closest('.ui-dialog').addClass('inline_edit');
					
					$( "#inline_edit" ).dialog("option","title",$( "#inline_edit" ).find('#actiontitle').text().replace("Add New","") + " (" + ele_name+ ")");
					
					$( "#inline_edit" ).find('#actiontitle').remove();
					$(window).resize(function(){
						$( "#inline_edit" ).dialog( "option", "width", $(window).width()-150);
						$( "#inline_edit" ).dialog( "option", "height", $(window).height()-100);
					});
					$('#inline_edit #tabs').tabs();
					set_tabs();
					//set_buttons();
					set_notes();
					if ($("#code").length) load_codemirror();
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
					int_infotabs();
					//start_diff();
				},
				close:function(){ $("#inline_edit").remove(); $('body').css('overflow','auto'); },
				buttons: {
					"Full Editor": function() {
						window.location = "/post/edit_post.castle?id="+id;
					},
					"Close": function() {
						$( "#inline_edit" ).dialog( "close" );
					}
				}
			});
		});
}
function ini_visible_editor(){


	setup_edit_hitareas();
	$(window).resize(function(){if($('.ele_highlighter').length){setup_edit_hitareas();}  $('#pageslide').height($(window).height()-20); $('#panle').height($(window).height()-150);});
	$('body').resize(function(){if($('.ele_highlighter').length){setup_edit_hitareas();} $('#pageslide').height($(window).height()-20);});


	


	

	$(".settings_tab").pageslide({ direction: "right", href:'#stellar_visible_settings',
		open:function(){
			if($('.ele_highlighter').length)setup_edit_hitareas();
			$('#pageslide').height($(window).height()-20);
			$('#stellar_visible_settings .panle').height($(window).height()-150);
			$('.settings_tab_close').off().on('click',function(){ $.pageslide.close(); });
			
			if($('.toggle_wrap').length==0 && $(".livesite").length){
				$.each($(".livesite"),function(){
					$(this).toggleSwitch({
						change: function(e) {
							//console.log("i changed my value")
						} 	
					});
				});
			}
			$.each($('.seo.count'),function(){
				var self = $(this);
				var target = $('[rel="'+self.attr('id')+'"]');
				var limit = parseInt(target.data("limit"));
				self.text( limit - target.val().length );
				target.off().on('keypress', function(){
					limitChars($(this), limit, self);
				});
			});
		},
	 	close:function(){
			if($('.ele_highlighter').length)setup_edit_hitareas();
			$('#pageslide').height($(window).height()-20);
		}
	});
	
	$('.editor_settings_mode').off().on('click',function(e){
		e.stopPropagation(); e.preventDefault();
		$('.editor_settings_mode').removeClass('active');
		$('#stellar_visible_settings .panle').css("display","none");
		$('#stellar_visible_settings '+$(this).attr('href')).css("display","block");
		$(this).addClass('active');
	});
	
	
	
	$('.switch').off().on('click',function(){
		if($(this).is($('.active'))){
			$(this).next('.tabed').slideUp();
			$(this).removeClass('active');
			$(this).find('em').text("( + )");
		}else{
			$(this).next('.tabed').slideDown();
			$(this).addClass('active');
			$(this).find('em').text("( - )");
		}
	});	
	
		
	setTimeout(function(){reset_edit_hitareas( $('.ele_highlighter') )}, 1000);
	
	$('.toggle_block').off().on('click',function(){
		if($(this).is($('.active'))){
			$('.ele_highlighter').remove();
			$(this).removeClass('active');
		}else{
			setup_edit_hitareas();
			$(this).addClass('active');
		}
	});	
	

}



function destore_visible_editor(){
	 $.pageslide.destroy();
	$('.ele_highlighter').remove();
}


$(document).ready(function(){
	ini_visible_editor()
});