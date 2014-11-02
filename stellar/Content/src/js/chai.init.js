(function($) {
	$.chai.ready=function (options){
		$(document).ready(function() {
			
			
			
			$('form.autosave').areYouSure({
				'silent':true,
				change: function() {
					// Enable save button only if the form is dirty. i.e. something to save.
					if ($(this).hasClass('dirty')) {
						$.chai.core.util.autoSaver();
					} else {
						window.clearInterval($.chai.core.util.t);
						$.chai.core.util.t=null;
					}
				}
			});
	

	

			
			$.chai.reports.ini();
			$.chai.clinical.ini();
			$.chai.families.ini();
			$.chai.trial.ini();
			$.chai.drug.ini();
			$.chai.trial_arm.ini();
			$.chai.substance.ini();
			
					
			
		

	
			$.chai.core.util.moa_dmpk_setup();
			$.chai.core.util.make_maskes();
	
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
			$(".claim_item").on("keyup",function(){
				var code="";
				$.each($(".claim_item"),function(){
					code+= (code===""?"":":") + $(this).val();
				});
				$("#item_label_claim").val(code);
				$("#CLAIM").text(code);
			});

			$("#load_file").on("click",function(){
				$(".load_file").toggleClass("active");
				$(".load_file input").removeAttr("required");
				$(".load_file:visible input").attr("required",true);
			});

			/*
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
			*/

			
			$.chai.core.util.apply_tax_request();
			$.chai.core.util.apply_taxed_add();
			$.chai.core.util.apply_a_taxed_add();
			$.chai.core.util.activate_adverse_ui();

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
							list = $.chai.core.util.get_table_ids( focused_grid );
						}
						$.chai.core.util.popup_message('<span style="font-size: 28px;"><i class="icon-spinner icon-spin icon-large"></i> loading ... </span>',true);
						$.chai.core.util.add_item_popup(type, list, ["new","list"]);
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
				$.chai.core.util.add_item_popup($(this).closest('select').data('type'),  $.chai.core.util.get_select_ids( $(this).closest('select') ) ,["new"]);
			});
			
			$('.inline_edit').on('click',function(e){
				e.preventDefault();
				e.stopPropagation();
				$.chai.core.util.popup_message('<span style="font-size: 28px;"><i class="icon-spinner icon-spin icon-large"></i> </span>',true);
				$.chai.core.util.add_item_popup($(this).data('type'),"",["new"], $(this).closest('tr').data('baseid') );
				
			});
			
			
		
		
		
				
		
			return options;
		});
	};
	$.chai.ini();
})(jQuery);
