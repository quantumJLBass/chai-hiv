// JavaScript Document

$.chai.reference = {
	ini:function(){
		$.chai.form_base.ini();
		$("#load_file").on("click",function(){
			$(".load_file").toggleClass("active");
			$(".load_file input").removeAttr("required");
			$(".load_file:visible input").attr("required",true);
		});
	}
};
