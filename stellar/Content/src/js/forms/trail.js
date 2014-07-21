// JavaScript Document
$(document).ready(function() {
	
	
	
	
	
	
	
	function trial_arm_form(id){
		if($("#trial_arm_form").length===0){
			$("#staging").append("<div id='trial_arm_form'></div>");
		}
		$.ajax({cache: false,
		   url:"/center/clinical.castle",
		   data:{"skiplayout":1,"id":typeof(id)==="undefined"?"":id,typed_ref:$('[name="typed_ref"]').val()},
		   success: function(data){
				$( "#trial_arm_form" ).html(data);
				$( "#trial_arm_form" ).dialog({
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
						//setup_tabs();
						
						$('body').css({overflow:"hidden"});
						$(".ui-dialog-buttonpane").remove();

	
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
						//set_up_form(type,inlist,use);
						//activate_adverse_ui();
					},
					close: function() {
							$('body').css({overflow:"auto"});
							$( "#trial_arm_form" ).dialog( "destroy" );
							$( "#trial_arm_form" ).remove();
					}
				});
					$(window).resize(function(){$("#trial_arm_form" ).dialog('option', { width: $(window).width()-50,  height: $(window).height()-50,});
				});
			}
		});

	}
	
	
	
	
	
	
	
	
	$(".trial_arm_form").on("click",function(e){
		e.preventDefault();
		e.stopPropagation();
		popup_message('<span style="font-size: 28px;"><i class="icon-spinner icon-spin icon-large"></i> Loading content...</span>',true);
		trial_arm_form();
	});

});