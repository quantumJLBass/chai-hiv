(function(){
if($( ".userSearch" ).length){
	$.each('.userSearch',function(){
		setup_usersearch($('#centralMap'),$(this));
		/* EOF Search autocomplete */
		});
	}
})();
function setup_usersearch(jObj , tarObj , callback){
	/* Search autocomplete */
	var cur_search = "";
	var termTemplate = "<strong>%s</strong>";
	var term = "";
	$( tarObj ).find("input[type=text]").autocomplete({
		source: function( request, response ) {
			term = request.term;
			$.ajax({
				url: siteroot+"public/user_keywordAutoComplete.castle",
				dataType: "jsonp",
				data: {
					featureClass: "P",
					style: "full",
					maxRows: 12,
					name_startsWith: request.term
				},
				success: function( data, status, xhr  ) {
					var matcher = new RegExp( $.ui.autocomplete.escapeRegex(request.term), "i" );
					response( $.map( data, function( item ) {
						var text = item.label;
						if ( (item.value && ( !request.term || matcher.test(text)) || item.related == "header" || item.related == "true" ) ){
							return {
								label: item.label,
								value: item.value,
								_id: item._id,
								related: item.related,
							}
						}
					}));
				}
			});
		},
		search: function(event, ui) {
			/**/
		},
		minLength: 2,
		select: function( e, ui ) {
			var id = ui.item._id;
			var term = ui.item.label;

			var url=siteroot+"public/get_user.castle";
			if ( e.which != 13 ){
				if(typeof($.jtrack)!=="undefined")$.jtrack.trackPageview(pageTracker,url+(id!=""?'?id='+id:'')+(term!=""?'&term='+term:''));
				callback(id,term);//getSignlePlace(jObj,id);
			}
			$( tarObj ).data("id",id);
			$( tarObj ).data("term",term);
			$( tarObj ).find("input[type=text]" ).autocomplete("close");
		},
		focus: function( event, ui ) {
			$( tarObj ).find("[type=text]" ).val( ui.item.label );
			return false;
		},
		open: function(e,ui) {
			$('.ui-autocomplete.ui-menu').removeClass( "ui-corner-all" );
		 }
	})
	.data( "autocomplete" )._renderItem = function( ul, item ) {
		var text =item.label;
		if(item.related=="header"){
			text = "<em>Related search items</em>";
		}else{
			text ="<a>" + text.replace( new RegExp( "(?![^&;]+;)(?!<[^<>]*)(" + $.ui.autocomplete.escapeRegex(this.term) + ")(?![^<>]*>)(?![^&;]+;)", "gi" ), "<strong>$1</strong>" )+"</a>";
		}
		return $( "<li></li>" )
			.data( "item.autocomplete", item )
			.append( text )
			.appendTo( ul );
	}
	$( tarObj ).find("input[type='text']").on('keyup',function(e) {
		if ( e.which == 13 ){
			var id   = $( tarObj ).find(".ui-autocomplete-input" ).val();
			var url=siteroot+"public/get_user.castle";
			if(typeof($.jtrack)!=="undefined")$.jtrack.trackPageview(pageTracker,url+(id!=""?'?id='+id:'')+(term!=""?'&term='+term:''));
			$( tarObj ).find("input[type=text]" ).autocomplete("close");
			callback($( tarObj ).data("id"),$( tarObj ).data("term"));//getSignlePlace(jObj,$(tarObj).find(".ui-autocomplete-input" ).val());
		}
	});	
	$(tarObj ).find("input[type='submit']").off().on('click',function(e){
		e.stopPropagation();
		e.preventDefault();
		var btn=$(this);
		var id   = $(tarObj ).find(".ui-autocomplete-input" ).val();
		
		if(typeof($.jtrack)!=="undefined")$.jtrack.trackPageview(pageTracker,url+(id!=""?'?id='+id:'')+(term!=""?'&term='+term:''));
		callback($( tarObj ).data("id"),$( tarObj ).data("term"));//getSignlePlace(jObj,id);
	});
}
	
	
	