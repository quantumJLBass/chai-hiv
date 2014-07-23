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
			   var trial_arm_form_dialog = $( "#trial_arm_form" );
				trial_arm_form_dialog.html(data);
				trial_arm_form_dialog.dialog({
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
						
						
						$('body').css({overflow:"hidden"});
						$(".ui-dialog-buttonpane").remove();
						
						make_maskes();
						moa_dmpk_setup();
						apply_tax_request();
						apply_taxed_add();
						
						var tabContents = trial_arm_form_dialog.find(".tab_content").hide(), tabs = trial_arm_form_dialog.find("ul.tabs li");
						tabs.addClass("tabed");
						tabs.first().addClass("active").show();
						tabContents.first().show();
						
						tabs.on("click",function(e) { e.preventDefault(); e.stopPropagation();
							var $this = $(this), activeTab = $this.find('a').attr('href');
							
							if(!$this.hasClass('active')){
								$this.addClass('active').siblings().removeClass('active');
								tabContents.hide().filter(activeTab).fadeIn();
							} return false;
						});	
						$( ".uitabs" ).tabs();


						trial_arm_form_dialog.find('[name="item.trials.baseid"]').val($('.container [name="item.baseid"]').val());

						trial_arm_form_dialog.find("[type='submit']").on("click",function(e){
							
							var form = $(this).closest("form");
							if (form.find(':invalid').length<=0) {
								e.preventDefault();
								e.stopPropagation();
								popup_message('<span style="font-size: 28px;"><i class="icon-spinner icon-spin icon-large"></i>Saving...</span>',true);
								$.post(form.attr("action")+"?skiplayout=1&ajaxed_update=1",form.serialize(),function(){//(data){
									//var parts= data.split(',');
									$( "#mess" ).dialog( "destroy" );
									$( "#mess" ).remove();

									var dataTable = $("#trial_arms.tab_content").find('.dataTable');
									var tableData = [];
									
									//var count = $(".drug_item.list_item").length;
									var html = form.find('[name="item.name"]').val();// + '<input type="hidden" name="trial_arms['+(count)+'].baseid" value="'+form.find('[name="item.baseid"]').val()+'" class="drug_item list_item"/>';
									
									tableData.push( html );
									tableData.push( form.find('[name="item.name"]').val() );
									tableData.push( form.find('[name="item.name"]').val() ); 
									tableData.push( '<a href="#" class="button xsmall crimson defocus removal"><i class="icon-remove" title="Remove"></i></a>' ); 
									dataTable.dataTable().fnAddData( tableData );
									
									$("ul .display.datagrid.dataTable .removal").off().on("click",function(e){
										e.preventDefault();
										e.stopPropagation();
										var targetrow = $(this).closest("tr");
										var datatable = $(this).closest('.dataTable').dataTable();
										targetrow.fadeOut( "75" ,function(){ 
											datatable.fnDeleteRow( datatable.fnGetPosition( targetrow.get(0) ) );
										});
									});
									
									
									
									
									
									
									
									
									
									
									$( "#trial_arm_form" ).dialog( "destroy" );
									$( "#trial_arm_form" ).remove();
								});
							}
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