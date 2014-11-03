$.chai.form_base = {
	ini:function(){
		$.chai.core.util.start_autoSaver();
		$.chai.core.util.moa_dmpk_setup();
		$.chai.core.util.make_maskes();
		$.chai.core.util.setup_refs();
		$.chai.core.util.apply_tax_request();
		$.chai.core.util.apply_taxed_add();
		$.chai.core.util.apply_a_taxed_add();
		$.chai.core.util.activate_adverse_ui();

		$.chai.core.util.make_dataTables();

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
	}
};