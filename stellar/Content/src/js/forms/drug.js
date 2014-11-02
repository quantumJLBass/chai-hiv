// JavaScript Document

$.chai.drug = {
	ini:function(){
		$.chai.markets.ini();
		$("select[name*='inactive_ingredients[]']").on("change",function(){
			var sel="";
			$.each($(this).find(':selected'),function(i){
				sel+=(i>0?",":"")+$(this).val();
			});
			$("[name$='inactive_ingredients']").val(sel);
		});
	}
};
