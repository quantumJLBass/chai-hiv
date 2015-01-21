// JavaScript Document

(function($) {
	$(document).ready(function() {
		
		$('#viewonly').change(function () {
			var state = $('#viewonly:checked').length;
			$.cookie('hivviewonly', state===1?"true":"false", { expires:1, path: '/' });
			//state = "viewonly="+state;
			window.location = window.location.href;//.split('?')[0]+"?"+state;
		});
		$( ".pubstate" ).buttonset();
		$('.pubstate.menuaction :radio').on('change',function () {
			$('.pubstate :radio').attr("checked",false).removeAttr('checked').next("label").removeClass("ui-state-active");
			$(this).attr("checked",true);
			$('.pubstate :radio').next("label").find("i").removeClass("icon-check-empty").removeClass("icon-check");
			$('.pubstate :radio').not(":checked").next("label").find("i").addClass("icon-check-empty");
			$('.pubstate :radio:checked').next("label").addClass("ui-state-active").find("i").addClass("icon-check");
			
			var state = $('.pubstate [name="pub"]:checked').val();
			var trashed = $('[name="trash"]').is(':checked');
			if(!trashed){
				$.cookie('hivpubview', trashed===1 ? "" : (state===1?"true":"false"), { expires:1, path: '/' });
			}
			//state = "pub="+state;
			
			window.location = window.location.href.split('?')[0]+"?"+( trashed?"&trash=1":"&pub="+state );
		});
	
		$.chai.core.util.setting_item_pub($(".container"));

		if($(".message.ui-state-highlight").length){
			setTimeout(function(){ $(".message.ui-state-highlight").fadeOut(500); },2000);
		}


		
	});
})(jQuery);