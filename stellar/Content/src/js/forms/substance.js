// JavaScript Document
(function($) {
	$.chai.substance = {
		ini:function(){
			$.chai.core.util.setup_viewlog();
			$.chai.form_base.ini();
	
			$( "#ddiradio" ).buttonset();
			$('#ddiradio :radio').on('change',function () {
				$('#ddiradio :radio').next("label").find("i").removeClass("icon-check-empty").removeClass("icon-check");
				$('#ddiradio :radio').not(":checked").next("label").find("i").addClass("icon-check-empty");
				$('#ddiradio :radio:checked').next("label").find("i").addClass("icon-check");
			});
			
			
			
			
			$('#add_substance_salt').on("click",function(e){
				e.preventDefault();
				e.stopPropagation();
				var dataTable = $('#Saltdata.dataTable');
				var tableData = [];
				
				var count = $("#Saltdata tbody select").length;
		
		
				var html = '<input type="hidden" name="salts['+(count)+'].id" value="0"/><select name="salts['+(count)+'].is_salt"><option value="Yes">Yes</option><option value="No">No</option></select>';
				tableData.push( html );
				tableData.push( '<input type="text" value="" name="salts['+(count)+'].form"/>' ); 
				tableData.push( '<a href="#" class="button xsmall crimson defocus removal"><i class="icon-remove" title="Remove"></i></a>' ); 
				
				dataTable.dataTable().fnAddData( tableData );
				
				$.chai.core.util.build_general_removal_button($("#Saltdata tbody .removal"));
			});	
		
				
			$('#add_substance_prodrug').on("click",function(e){
				e.preventDefault();
				e.stopPropagation();
				var dataTable = $('#Prodrugdata.dataTable');
				var tableData = [];
				
				var count = $("#Prodrugdata tbody select").length;
		
				var html = '<input type="hidden" name="prodrugs['+(count)+'].id" value="0"/>';//<select name="prodrugs['+(count)+'].pro_drug"><option value="Yes">Yes</option><option value="No">No</option></select>';
				//tableData.push( html );
				tableData.push( html+'<input type="text" value="" name="prodrugs['+(count)+'].active_moiety"/>' ); 
				tableData.push( '<input type="text" value="" name="prodrugs['+(count)+'].active_metabolites"/>' );
				tableData.push( '<a href="#" class="button xsmall crimson defocus removal"><i class="icon-remove" title="Remove"></i></a>' ); 
		
				
				dataTable.dataTable().fnAddData( tableData );
				
				
				$.chai.core.util.build_general_removal_button($("#Prodrugdata tbody .removal"));
			});
		}
	};
})(jQuery);