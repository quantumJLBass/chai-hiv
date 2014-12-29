// JavaScript Document

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
		$.chai.drug.setup_ddi_ui();
	},
	apply_ddi_removal:function(){
		$("#ddi tbody .removal").off().on("click",function(e){
			e.preventDefault();
			e.stopPropagation();
			var targetrow = $(this).closest("tr");
			var datatable = $(this).closest('.dataTable').dataTable();
			targetrow.fadeOut( "75" ,function(){ 
				datatable.fnDeleteRow( datatable.fnGetPosition( targetrow.get(0) ) );
			});
		});
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
				html = '<select name="'+input_name+'.drug.baseid" id="drpr_'+count+'"><option value="">Select</option></select>';
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
	}
	
	
	
};
