(function($) {
	$.chai.trial_arm = {
		ini:function(){
			$.chai.core.util.setup_viewlog();
			$.chai.core.util.setup_curate();
			$.chai.form_base.ini();
		},
	};
})(jQuery);