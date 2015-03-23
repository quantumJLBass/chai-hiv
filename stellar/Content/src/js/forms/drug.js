// JavaScript Document
(function($) {
	$.chai.drug = {
		ini:function(){
			$.chai.core.util.setup_viewlog();
			$.chai.form_base.ini();
	
			$("select[name*='inactive_ingredients[]']").on("change",function(){
				var sel="";
				$.each($(this).find(':selected'),function(i){
					sel+=(i>0?",":"")+$(this).val();
				});
				$("[name$='inactive_ingredients']").val(sel);
			});
			$(".claim_item").on("keyup",function(){
				var code="";
				$.each($(".claim_item"),function(){
					code+= (code===""?"":":") + $(this).val();
				});
				$("#item_label_claim").val(code);
				$("#CLAIM").text(code);
			});
			$.chai.markets.ini();
			$.chai.trial.trial_arm_primer();
			
			
			$.each($('.table_radios:not(.ui-buttonset)'),function(){
				$( this ).buttonset();
			});
			
			
			$.chai.drug.add_lmic();
			$.chai.drug.setup_ddi_ui();
		},
		
		add_lmic:function(){
			$('#add_lmic').off().on("click",function(e){
				e.preventDefault();
				e.stopPropagation();
				var dataTable = $('#LMICdata').find('.dataTable');
				var tableData = [];
				
				var count = $("#LMICdata tbody tr").length+1;
				
				//var options=$('#dirty_options select').html();
				
	
				//tableData.push( html );
				//tableData.push( 's' );
				tableData.push( '<input type="hidden" name="lmics['+(count)+'].id" value="0"/><input type="text" placeholder="label claim amount" name="lmics['+(count)+'].amount"/>' );
				tableData.push( '<label for="radio'+(count)+'-1">Yes</label><input id="radio'+(count)+'-1" type="radio" name="lmics['+(count)+'].lmic_1l" value="yes" /><label for="radio'+(count)+'-2">No</label><input id="radio'+(count)+'-2" type="radio" name="lmics['+(count)+'].lmic_1l" value="no" />' ); 
				tableData.push( '<label for="radio'+(count)+'-3">Yes</label><input id="radio'+(count)+'-3" type="radio" name="lmics['+(count)+'].lmic_2l" value="yes" /><label for="radio'+(count)+'-4">No</label><input id="radio'+(count)+'-4" type="radio" name="lmics['+(count)+'].lmic_2l" value="no" />' ); 
				tableData.push( '<label for="radio'+(count)+'-5">Yes</label><input id="radio'+(count)+'-5" type="radio" name="lmics['+(count)+'].lmic_3l" value="yes" /><label for="radio'+(count)+'-6">No</label><input id="radio'+(count)+'-6" type="radio" name="lmics['+(count)+'].lmic_3l" value="no" />' ); 
				tableData.push( '<label for="radio'+(count)+'-7">Yes</label><input id="radio'+(count)+'-7" type="radio" name="lmics['+(count)+'].tbd" value="yes" /><label for="radio'+(count)+'-8">No</label><input id="radio'+(count)+'-8" type="radio" name="lmics['+(count)+'].tbd" value="no" />' ); 
				tableData.push( '<a href="#" class="button xsmall crimson defocus removal"><i class="icon-remove" title="Remove"></i></a>' ); 
	
				dataTable.dataTable().fnAddData( tableData );
				//dataTable.find('tr:last td:not(:first,:last)').addClass('table_radios');
				$('#LMICdata table tr [type="radio"]').closest('td:not(.ui-buttonset)').addClass('table_radios');
				$.each($('.table_radios:not(.ui-buttonset)'),function(){
					$( this ).buttonset();
				});/**/
				
				$.chai.core.util.build_general_removal_button($("#LMICdata tbody .removal"));
				$.chai.drug.add_lmic();
			});	
		},
		
		
		
		apply_ddi_removal:function(){
			$.chai.core.util.build_general_removal_button($("#ddi tbody .removal"));
		},
		setup_ddi_ui:function(){
			$.chai.drug.apply_ddi_removal();
			$('#drug_interaction').on("click",function(e){
				e.preventDefault();
				e.stopPropagation();
				var dataTable = $('#ddi').find('.dataTable');
				var tableData = [];
				var family_list = $("#ddi_drug_product").length>0;
				var count = $("#ddi tbody select").length;
	
				var input_name = 'interactions['+(count)+']';
				
				var html = '';
				
				if(family_list){
					input_name = 'interactions['+(count)+']';
					html = '<input type="hidden" name="'+input_name+'.arm.baseid" value="'+$("[name='item.baseid']").val()+'"/><select name="'+input_name+'.drug" id="drpr_'+count+'"><option value="">Select</option></select>';
					tableData.push( html );
				}
				
				html = '<input type="hidden" name="'+input_name+'.id" value="0"/><select name="'+input_name+'.substance"  id="ddi_only_'+count+'"><option value="">Select</option></select>';
				tableData.push( html );
				
				html = '<select name="'+input_name+'.yes_no"><option value="yes">Yes</option><option value="no">No</option></select>';
				tableData.push( html );
				
				html = '<input type="text" name="'+input_name+'.dose_amount" value="" style="width:100%"/>';
				tableData.push( html );
				tableData.push( '<textarea placeholder="Describe the interaction between the two drugs" name="'+input_name+'.descriptions"  rows="1"></textarea>' );
				tableData.push( '<a href="#" class="button xsmall crimson defocus removal"><i class="icon-remove" title="Remove"></i></a>' ); 
		
				
				dataTable.dataTable().fnAddData( tableData );
	
				if(family_list){
					$.getJSON("/center/drugs.castle?json=true&callback=?",function(data){
						$.each(data,function(i,v){
							if( $("[data-baseid='"+v.baseid+"']").length > 0 ){
								$('#drpr_'+count).append("<option value='"+v.baseid+"' data-baseid='"+v.baseid+"' data-name='"+v.name+"' data-label_claim='"+v.label_claim+"' data-form='"+v.form+"' data-manufacturer='"+v.manufacturer+"'  >"+ v.form + " -- " + v.name+" ( "+v.manufacturer+" | "+v.label_claim+" )</option>");
							}
						});
					});	
				}
				$.getJSON("/center/substances.castle?json=true&callback=?",function(data){
					$('#ddi_only_'+count).append(function(){
						var ophtml="";
						ophtml+='<optgroup label="Drug Substances">';
						$.each(data,function(i,v){
							if(v.ddi!=="yes"){
								ophtml+="<option value='"+v.baseid+"' data-baseid='"+v.baseid+"' data-name='"+v.name+"' data-abbreviated='"+v.abbreviated+"'   >"+v.name+" ( "+v.abbreviated+" )</option>";
							}
						});
						ophtml+='</optgroup>';
		
						ophtml+='<optgroup label="DDI ONLY Substances">';
						$.each(data,function(i,v){
							if(v.ddi==="yes"){
								ophtml+="<option value='"+v.baseid+"' data-baseid='"+v.baseid+"' data-name='"+v.name+"' data-abbreviated='"+v.abbreviated+"'   >"+v.name+" ( "+v.abbreviated+" )</option>";
							}
						});
						ophtml+='</optgroup>';
						return ophtml;
					});
				});
				$.chai.drug.apply_ddi_removal();
			});
		},
		
		
		drug_popupForm:function (id){
			if($("#drug_form").length===0){
				$("#staging").append("<div id='drug_form'></div>");
			}
			$.ajax({cache: false,
			   url:"/center/drug.castle",
			   data:{"skiplayout":1,"id":typeof(id)==="undefined"?"":id,typed_ref:$('[name="typed_ref"]').val()},
			   success: function(data){
				   var drug_form_dialog = $( "#drug_form" );
					drug_form_dialog.html(data);
					drug_form_dialog.dialog({
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
							/*
							$(".formstateaction").html($(".ui-dialog-buttonpane"));
							$(".ui-dialog-buttonpane:not(.formstateaction .ui-dialog-buttonpane)").remove();
							*/
							$.chai.drug.ini();
	
							var tabContents = drug_form_dialog.find(".tab_content").hide(), tabs = drug_form_dialog.find("ul.tabs li");
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
	
	
							//drug_form_dialog.find('[name="item.trials.baseid"]').val($('.container [name="item.baseid"]').val());
	
							drug_form_dialog.find("[type='submit']").on("click",function(e){
								
								var form = $(this).closest("form");
								if (form.find(':invalid').length<=0) {
									e.preventDefault();
									e.stopPropagation();
									$.chai.core.util.popup_message('<span style="font-size: 28px;"><i class="icon-spinner icon-spin icon-large"></i>Saving...</span>',true);
									$.post(form.attr("action")+"?skiplayout=1&ajaxed_update=1",form.serialize(),function(){//(data){
										//var parts= data.split(',');
										$( "#mess" ).dialog( "destroy" );
										$( "#mess" ).remove();
	
										var dataTable = $("#drug_products.tab_content").find('.dataTable');
										
										var count = $("#drug_products.tab_content .datagrid tbody tr").length + 1;
										if($("#drug_products.tab_content  .datagrid tbody tr td.dataTables_empty").length){
											count--;
										}
										console.log("in list before add "+count);
										
										
										
										var tableData = [];
										var baseid = form.find('[name="item.baseid"]').val();
										if($("#drug_products.tab_content .dataTable [value='"+baseid+"']").length<=0){
											var html =  form.find('[name="item.dose_form"]').val() + '<input type="hidden" name="drugs['+count+'].baseid" value="'+baseid+'" class="list_item drug_item">';
											tableData.push( html );
											tableData.push( form.find('[name="item.label_claim"]').val() );
											tableData.push( form.find('header h3 > em').text() );
											tableData.push( "-refresh for drugs-" );
											tableData.push( form.find('#manufacturer_info').text() ); 
											tableData.push( '<a href="#" class="button xsmall crimson defocus removal"><i class="icon-remove" title="Remove"></i></a>' ); 
											dataTable.dataTable().fnAddData( tableData );
										}
										
										$.chai.core.util.build_general_removal_button($("ul .display.datagrid.dataTable .removal"));
										$.chai.core.util.close_dialog_modle($( "#drug_form" ));
									});
								}
							});	
							
							//$.chai.core.util.set_up_form(type,inlist,use);
							//$.chai.core.util.activate_adverse_ui();
						},
						close: function() {
							$.chai.core.util.close_dialog_modle($( "#drug_form" ));
						}
					});
					$.chai.core.util.set_diamodle_resizing($( "#drug_form" ));	
					
				}
			});
	
	
		},
		
	};
})(jQuery);