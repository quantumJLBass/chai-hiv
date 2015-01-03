// JavaScript Document

$.chai.reference = {
	ini:function(){
		$.chai.form_base.ini();
		$.chai.reference.int_file();
	},
	int_file:function(){
		$("#load_file").on("click",function(){
			$(".load_file").toggleClass("active");
			$(".load_file input").removeAttr("required");
			$(".load_file:visible input").attr("required",true);
		});
	},
	ref_popup_primer:function(){
		var loading = '<span style="font-size: 28px;"><i class="icon-spinner icon-spin icon-large"></i> Loading content...</span>';
		$(".ref_form").on("click",function(e){
			e.preventDefault();
			e.stopPropagation();
			$.chai.core.util.popup_message(loading,true);
			$.chai.reference.ref_popup_form();
		});	
		$('.ref_inline_edit').on('click',function(e){
			e.preventDefault();
			e.stopPropagation();
			$.chai.core.util.popup_message(loading,true);
			$.chai.reference.ref_popup_form($(this).closest('tr').data('baseid'));
		});
	},
	
	ref_popup_form:function (id){
		if($("#ref_form").length===0){
			$("#staging").append("<div id='ref_form'></div>");
		}
		$.ajax({cache: false,
		   url:"/center/reference.castle",
		   data:{"skiplayout":1,"id":typeof(id)==="undefined"?"":id,typed_ref:$('[name="typed_ref"]').val()},
		   success: function(data){
			   var ref_form_dialog = $( "#ref_form" );
				ref_form_dialog.html(data);
				ref_form_dialog.dialog({
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

						$.chai.reference.int_file();

						ref_form_dialog.find('[name="item.trials.baseid"]').val($('.container [name="item.baseid"]').val());
						ref_form_dialog.find("[type='submit']").on("click",function(e){
							var form = $(this).closest("form");
							if (form.find(':invalid').length<=0) {
								e.preventDefault();
								e.stopPropagation();
								$.chai.core.util.popup_message('<span style="font-size: 28px;"><i class="icon-spinner icon-spin icon-large"></i>Saving...</span>',true);
								$.post(form.attr("action")+"?skiplayout=1&ajaxed_update=1",form.serialize(),function(){//(data){
									//var parts= data.split(',');
									$( "#mess" ).dialog( "destroy" );
									$( "#mess" ).remove();
	
									var dataTable = $("#trial_arms.tab_content").find('.dataTable');
									
									var count = $("#trial_arms.tab_content .datagrid tbody tr").length + 1;
									if($("#trial_arms.tab_content  .datagrid tbody tr td.dataTables_empty").length){
										count--;
									}
									console.log("in list before add "+count);
									
									
									
									var tableData = [];
									var baseid = form.find('[name="item.baseid"]').val();
									if(baseid<=0){
										var html =  baseid+ '<input type="hidden" name="references['+count+'].baseid" value="'+baseid+'" class="drug_item">';
										tableData.push( html );
										tableData.push( form.find('[name="item.name"]').val() );
										tableData.push( "-refresh for drugs-" ); 
										tableData.push( '<a href="#" class="button xsmall crimson defocus removal"><i class="icon-remove" title="Remove"></i></a>' ); 
										dataTable.dataTable().fnAddData( tableData );
									}

									$.chai.core.util.build_general_removal_button($("ul .display.datagrid.dataTable .removal"));
									
									$( "#ref_form" ).dialog( "destroy" );
									$( "#ref_form" ).remove();
								});
							}
						});	
						
						//$.chai.core.util.set_up_form(type,inlist,use);
						//$.chai.core.util.activate_adverse_ui();
					},
					close: function() {
						$.chai.core.util.close_dialog_modle($( "#ref_form" ));
					}
				});
				$.chai.core.util.set_diamodle_resizing($( "#ref_form" ));	
				
			}
		});

	},
};
