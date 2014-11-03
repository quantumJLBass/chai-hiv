(function($) {
	$.chai.ready=function (options){
		$(document).ready(function() {
			var page;
			page=window.location.pathname.substring(window.location.pathname.lastIndexOf("/") + 1);
			page=page.substring(0,page.lastIndexOf("."));
			console.log(page);
			$.chai[page].ini();
			/*
			$.chai.families.ini();
			$.chai.trial.ini();
			$.chai.drug.ini();
			$.chai.trial_arm.ini();
			$.chai.substance.ini();
			$.chai.reference.ini();
			$.chai.reports.ini();
			*/

			return options;
		});
	};
	$.chai.ini();
})(jQuery);
