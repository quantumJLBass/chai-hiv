// JavaScript Document

$.chai.family = {
	ini:function(){
		$.chai.core.util.setup_viewlog();
		$.chai.form_base.ini();
		
		$('#substances_disabled').on("click",function(e){
			e.preventDefault();
			e.stopPropagation();
				if($("#substances_disabled_mess").length<=0){
					$('body').append('<div id="substances_disabled_mess">');
				}
				$("#substances_disabled_mess").html( $(this).attr('title') );
				$( "#substances_disabled_mess" ).dialog({
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
					open:function(){},
					buttons:{
						Ok:function(){
							$( this ).dialog( "close" );
							window.location = '/center/substance.castle';
						}
					},
					close: function() {
						$.chai.core.util.close_dialog_modle($( "#substances_disabled_mess" ));
					}
				});
		});
	

		$("#sortable").sortable({
			handle: ".sortable_handle",
			placeholder: "ui-state-highlight",
			stop:function(){ $.chai.family.sortedCode(); }
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
					if($('[name="substances['+v.baseid+'].baseid"]').length<=0){
					html+="<span class='item i"+i+"' data-baseid='"+v.baseid+"' data-name='"+v.name+"' data-abbreviated='"+v.abbreviated+"'  ><i title='edit' class='icon-plus'></i>"+v.name+" ( "+v.abbreviated+" )<br/></span>";
					}
				});
				if(html === ""){
					html = "There are no substances to use.";	
				}
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
							html+="<span class='sortable_handle'>handle</span> "+par.data("name")+" (<span class='sub_code'>"+par.data("abbreviated")+"</span>)";
	
							html+="<input type='hidden' name='substances["+par.data("baseid")+"].baseid' value='"+par.data("baseid")+"' class='substance'/>";
							html+="<input type='hidden' name='family_substance["+par.data("baseid")+"].baseid' value='0'  class=''/>";
							html+="<input type='hidden' name='family_substance["+par.data("baseid")+"].family.baseid' value='"+$('[name="item.baseid"]').val()+"'  class=''/>";
							html+="<input type='hidden' name='family_substance["+par.data("baseid")+"].substance_order' value='"+$(".substance_item").length+"'  class='substanceOrder'/>";
							html+="<input type='hidden' name='family_substance["+par.data("baseid")+"].substance.baseid' value='"+par.data("baseid")+"'  class=''/>";
							html+="</li>";
	
							$(html).appendTo("#sortable");
							$("#sortable").sortable("refresh");
							$.chai.family.sortedCode();
							
						});
					},
					buttons:{
						Ok:function(){
							$( this ).dialog( "close" );
						}
					},
					close: function() {
						$.chai.core.util.close_dialog_modle($( "#substances_list" ));
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
		$.chai.family.sortedCode();
	
	
	
		
		$.each($('.drpro_table:not(".dataTable")'),function(){
			var self = $(this);
			self.DataTable({ 
				"bJQueryUI": true,
				"sPaginationType": "full_numbers", 
				"fnDrawCallback": function() {//(oSettings ) {
	
					$("#drpro_table").find('.drpro_table .dataTables_empty').html('No drug products available. <a href="#" class="add_drPro">Add <i title="edit" class="icon-plus"></i></a>');
					$("#drpro_table").find('.add_drPro').off().on("click",function(e){
						e.preventDefault();
						e.stopPropagation();
						$.chai.family.add_drProTableRow();
					});
					//$.chai.core.util.make_datatable_popup_add(datatable);
					
					$("#drpro_table").find('.removal').off().on("click",function(e){
						e.preventDefault();
						e.stopPropagation();
						var targetrow = $(this).closest("tr");
						var datatable = $(this).closest('.dataTable').dataTable();
						targetrow.fadeOut( "75" ,function(){ 
							datatable.fnDeleteRow( datatable.fnGetPosition( targetrow.get(0) ) );
							//targetrow.remove();
						});
					});
				}
			});	
		});			
		$('#add_lmic').on("click",function(e){
			e.preventDefault();
			e.stopPropagation();
			var dataTable = $('#LMICdata').find('.dataTable');
			var tableData = [];
			
			var count = $("#LMICdata tbody select").length;
			
			//var options=$('#dirty_options select').html();
			
			var html = '<input type="hidden" name="lmics['+(count)+'].id" value="0"/>';
			//tableData.push( html );
			tableData.push( html+'<input type="text" placeholder="label claim amount" name="item.lmics['+(count)+'].form"/>' );
			tableData.push( '<input type="checkbox" value="yes" name="lmics['+(count)+'].lmic_1l"/>' ); 
			tableData.push( '<input type="checkbox" value="yes" name="lmics['+(count)+'].lmic_2l"/>' ); 
			tableData.push( '<input type="checkbox" value="yes" name="lmics['+(count)+'].lmic_3l"/>' ); 
			tableData.push( '<input type="checkbox" value="yes" name="lmics['+(count)+'].tbd"/>' ); 
			tableData.push( '<a href="#" class="button xsmall crimson defocus removal"><i class="icon-remove" title="Remove"></i></a>' ); 
	
			
			dataTable.dataTable().fnAddData( tableData );
			
			$("#LMICdata tbody .removal").off().on("click",function(e){
				e.preventDefault();
				e.stopPropagation();
				var targetrow = $(this).closest("tr");
				var datatable = $(this).closest('.dataTable').dataTable();
				targetrow.fadeOut( "75" ,function(){ 
					datatable.fnDeleteRow( datatable.fnGetPosition( targetrow.get(0) ) );
				});
			});
		});
		
		$('#drug_interaction').on("click",function(e){
			e.preventDefault();
			e.stopPropagation();
			var dataTable = $('#ddi').find('.dataTable');
			var tableData = [];
			
			var count = $("#ddi tbody select").length;
			var options="<option value=''>Select</option>";//$('#dirty_options select').html();
			
			var html = '<input type="hidden" name="interactions['+(count)+'].id" value="0"/><select name="interactions['+(count)+'].substance">'+options+'</select>';
			tableData.push( html );
			
			html = '<select name="interactions['+(count)+'].yes_no"><option value="yes">Yes</option><option value="no">No</option></select>';
			tableData.push( html );
			
			html = '<input type="text" name="interactions['+(count)+'].dose_amount" value="" style="width:100%"/>';
			tableData.push( html );
			tableData.push( '<textarea placeholder="Describe the interaction between the two drugs" name="interactions['+(count)+'].descriptions"  rows="1"></textarea>' );
			tableData.push( '<a href="#" class="button xsmall crimson defocus removal"><i class="icon-remove" title="Remove"></i></a>' ); 
	
			
			dataTable.dataTable().fnAddData( tableData );
			
			$("#ddi tbody .removal").off().on("click",function(e){
				e.preventDefault();
				e.stopPropagation();
				var targetrow = $(this).closest("tr");
				var datatable = $(this).closest('.dataTable').dataTable();
				targetrow.fadeOut( "75" ,function(){ 
					datatable.fnDeleteRow( datatable.fnGetPosition( targetrow.get(0) ) );
				});
			});
		});
		
	},
	sortedCode:function(){
		$('.substance_item .icon-trash').off().on("click",function(){
			$(this).closest('.substance_item').fadeOut("fast",function(){
				$(this).remove();
				$.chai.family.sortedCode();
			});
		});
		var code="";
		$.each($(".substance_item"),function(i){
			code+= (code===""?"":"<em>:</em>") + $(this).find('.sub_code').text();
			$(this).find('.substanceOrder').val(i+1);
		});
		$("#sub_code").html(code);
	},
	add_drProTableRow:function(){
			var html = "";
			html+="<div id='drPro_additions' class='min'>";
				html+="<h4>Create new Drug</h4>";
					html+="<div id='create_drPros_stub' class='full-input'>";
						html+="<form action='/center/savedrug.castle' method='post'><input name='item.baseid' type='hidden' value='0'>";
							html+="<input type='hidden' name='item.families.substance_id' value='"+$("[name='item.baseid']").val()+"'/>";
							html+="form <input type='text' name='item.dose_form' value='' style='display: inline-block; max-width:50%;'/>";
							
							
							
							html+="<input type='hidden' name='item.attached' value='false'/>";
							html+="<label>Unit <select name='item.dose_unit' style='display: inline-block; max-width:50%;'><option value=''>Select Unit</option><option value='mg'>mg</option><option value='mg/ml'>mg/ml</option></select></label>";
							html+="<label>Amounts<br/>";
							$.each($(".substance_item"),function(){
								html+= "<span style='min-width:20%'>"+$(this).find('.sub_code').text()+":</span> <input type='text' class='sub_label_claim' style='width: auto; display: inline-block; max-width: 100%;' /><br/>";
							});
							html+="</label>";
							html+= "<input type='hidden' name='label_claim'/><br/>";
							html+="<label>Manufacturer<br/><select name='item.manufacturer' id='quick_drPro_manufacturer'><option value=''>Select</option></select><br/></label>";
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
					$(".ui-dialog-buttonset").prepend("<a href='#' id='create_drPros_stub_submit' class='button'>Add drug product stub</a>");
				},
				open:function(){
					$.getJSON('/center/get_taxonomies.castle?tax=commercial&callback=?',  function(data){
						var list="";
						$.each(data,function(i,v){
							list+="<option value='"+v.alias+"'>"+v.name+"</option>";
						});
						$('#quick_drPro_manufacturer').append(list);
					});
	
					$('#create_drPros_stub_submit').on("click",function(e){
						e.preventDefault();
						e.stopPropagation();
						
						var code = "";
						$.each($('.sub_label_claim'),function(i){
							if(i>0){
								code+=":";
							}
							code+=$.trim($(this).val());
						});	
						$('[name="label_claim"]').val(code);
						$('[name="label_claim"]').val(code);
						var form_data = $('#create_drPros_stub form').find( "input, textarea, select" ).serializeArray();
						
						$.ajax({cache: false,
						   url:$('#create_drPros_stub form').attr('action')+"?json=true&ajaxed_update=true&callback=?",
						   data:form_data,
						   dataType : "json",
						   success: function(returndata){
								if(returndata.baseid!==""){
									$.chai.core.util.popup_message($("<span><h5>You have added a new Durg Protuct!</h5> It was added to the table of products for the drug form.</span>"));
									$('#drpro_empty').remove();
									$('[href="#existing_drPros"]').trigger('click');
									$.each(returndata,function(i,v){
										var dataTable = $("#drpro_table").find('.dataTable');
										var tableData = [];
										
										var count = $(".drug_item.list_item").length;
										//var html = v.label_claim;//+ '<input type="hidden" name="drugs['+(count)+'].baseid" value="'+v.baseid+'" class="drug_item list_item"/><input type="hidden" name="drugs['+(count)+'].attached" value="1" class="drug_item list_item"/>';
										
										$.each(v.label_claim.split(':'),function(i,val){
											tableData.push(val);
										});
										
										//tableData.push( html );
										tableData.push( v.manufacturer ); 
										tableData.push( '<input type="hidden" name="drugs['+(count)+'].baseid" value="'+v.baseid+'" class="drug_item list_item"/><a href="#" class="button xsmall crimson defocus removal"><i class="icon-remove" title="Remove"></i></a>' ); 
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
	
									});
									$( "#form_list" ).dialog( "close" );
								}else{
									$.chai.core.util.popup_message($("<span>failed to save, try again.</span>"));
								}
							}
						});
					});
				},
				buttons:{
					Close:function(){
						$( this ).dialog( "close" );
					}
				},
				close: function() {
					$.chai.core.util.close_dialog_modle($( "#form_list" ));
				}
			});
		}
		
};