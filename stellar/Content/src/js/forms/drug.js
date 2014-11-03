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
	}
};
