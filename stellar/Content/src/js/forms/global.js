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
			$('.pubstate :radio').next("label").find("i").removeClass("icon-check-empty").removeClass("icon-check");
			$('.pubstate :radio').not(":checked").next("label").find("i").addClass("icon-check-empty");
			$('.pubstate :radio:checked').next("label").find("i").addClass("icon-check");
			var state = $('.pubstate :radio:checked').val();
			$.cookie('hivpubview', state===1?"true":"false", { expires:1, path: '/' });
			//state = "pub="+state;
			
			window.location = window.location.href.split('?')[0]+"?pub="+state;
		});
	
		$.chai.core.util.setting_item_pub($(".container"));

		if($(".message.ui-state-highlight").length){
			setTimeout(function(){ $(".message.ui-state-highlight").fadeOut(500); },2000);
		}


		
	});
})(jQuery);