(function($) {
	$.chai.ready=function (options){
		$(document).ready(function() {
			var page,location;
			location=window.location.pathname;
			page=location.substring(location.lastIndexOf("/") + 1);
			page=page.substring(0,page.lastIndexOf("."));
			if(typeof($.chai[page])!=="undefined"){
				$.chai[page].ini();
				$.chai.core.util.setup_ref_copy();
			}else{
				$.chai.core.util.make_dataTables();
				$.chai.core.util.set_up_list_deletion();
			}
			return options;
		});
	};
	$.chai.ini();
})(jQuery);



