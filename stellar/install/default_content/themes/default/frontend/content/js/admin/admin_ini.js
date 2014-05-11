/* this is the very first change to set things up.  We will bu making the choice on which editor to load or which view controlls to invoke */
		var tooltips;
	var tip_time;
	var caltip = [];
$(document).ready(function(){
	if($('.admin.view._editor').length){
		load_view_editor();
		ed = true;
	 }		
	if($('.admin.post._editor').length){
		ini_event_editor();
	 }	
	
	if($('#calendar').length){
		/* initialize the calendar
		-----------------------------------------------------------------*/
				var date = new Date();
		var d = date.getDate();
		var m = date.getMonth();
		var y = date.getFullYear();
		$('#calendar').fullCalendar({
			theme: true,
			height: $(window).height() - ($('#header_bar').height()+$('#navWrap').height()+75),
			header: {
				left: 'prev,next today',
				center: 'title',
				right: 'month,agendaWeek,agendaDay'
			},
			editable: true,
			eventSources: [
				{
					url:"/admin/getMainCalendar.castle", // use the `url` property
					error: function() {
						alert('there was an error while fetching events!');
					},
					//color: 'blue',//'yellow',    // an option!
					textColor: 'white',//'black'  // an option!
				},
				{
					url: 'http://www.google.com/calendar/feeds/usa__en%40holiday.calendar.google.com/public/basic',
					color: '#d87b27',
					textColor: 'white',
				}
				
			],
			eventRender: function(event, element) {
				
					element.find('.fc-event-inner').prepend('<a href="#" class="actions" ><span class="ui-icon ui-icon-search"></span> </a>');
				if(event.wsu==true){
					element.find('.fc-event-inner').prepend('<a href="#" class="actions" ><span class="ui-icon ui-icon-calendar"></span> </a>');
					//element.find('.fc-event-inner').prepend('<a href="#" class="actions" ><span class="ui-icon ui-icon-signal-diag"></span> </a>');
				}
				if(event.editable==true){
					element.find('.fc-event-inner').prepend('<a href="#" class="actions edit" ><span class="ui-icon ui-icon-pencil"></span> </a>');
					element.find('.fc-event-inner').prepend('<a href="#" class="actions delete" ><span class="ui-icon ui-icon-trash"></span> </a>');
				}
				
				
				
			},
			eventAfterRender : function(event,element, view ) {
				var e = event;
				
				element.tooltip({
					position: {
						my: "center bottom-20",
						at: "center top",
						using: function( position, feedback ) {
							$( this ).css( position );
							$( "<div>" )
								.addClass( "arrow" )
								.addClass( feedback.vertical )
								.addClass( feedback.horizontal )
								.appendTo( this );
						}
					},
					items:element.find('.ui-icon'),
					content: function() {
						var element = $( this );
               			 if ( element.is( ".ui-icon-search" ) ) {
							return "Read discription";	
						 }else if ( element.is( ".ui-icon-calendar" ) ) {
							 return "Get iCal file";
						 }else if ( element.is( ".ui-icon-pencil" ) ) {
							 return "Let's edit";
						 }else if ( element.is( ".ui-icon-trash" ) ) {
							 return "Becareful Deleting";
						 }else{
							 return "click for discription";
						 }
						
						
					},
					open:function( event, ui ){
						//alert('hello');
					}
				});
				
				
				if(event.wsu==true){
					if($( "#calcontent" ).length==0)$('#staging').append('<div id="calcontent">')
					//return e.description;
					element.find('.ui-icon-search').on('click',function(e){
						$( "#calcontent" ).html("<div>"+event.description+"</div>");
						$( "#calcontent" ).dialog({ maxWidth: 500, modal: true });
					});
					
				}else{
					element.find('.ui-icon-search').on('click',function(e){
						e.preventDefault();
						if($( "#calcontent" ).length==0)$('#staging').append('<div id="calcontent">')
						$( "#calcontent" ).load(event.extra_url+" body",function(data){
							$( "#calcontent" ).html("<div>"+data+"</div>");
							$( "#calcontent" ).dialog({ maxWidth: 500, modal: true });
						});
						
					    //window.open(event.extra_url, 'gcalevent', 'width=700,height=600');
					});
				}
				
				
			},
			eventClick: function(event,element) {
				return false;
			},
			
			eventDrop: function(event, delta) {
				//alert(event.title + ' was moved ' + delta + ' days\n' +
					//'(should probably update your database)');
					return false;
			},
			loading: function(bool) {
				if (bool) $('#loading').show();
				else $('#loading').hide();
			}
			
		});
		$(window).resize(function(){
			$('#calendar').fullCalendar('option', 'height', $(window).height() - ($('#header_bar').height()+$('#navWrap').height()+75));
			}).trigger("resize");
	}
	
	
	
	
	$( "#tags" )
	// don't navigate away from the field on tab when selecting an item
	.bind( "keydown", function( event ) {
		if ( event.keyCode === $.ui.keyCode.TAB &&
				$( this ).data( "autocomplete" ).menu.active ) {
			event.preventDefault();
		}
	})
	.autocomplete({
		minLength: 0,
		source: function( request, response ) {
			// delegate back to autocomplete, but extract the last term
			/*response( $.ui.autocomplete.filter(
				availableTags, extractLast( request.term ) ) );*/
				var term = request.term;
				if ( term in cache ) {
					response( cache[ term ] );
					return;
				}
	
				lastXhr = $.getJSON( DOMAIN+"/public/get_pace_type.castle", request, function( data, status, xhr ) {
					cache[ term ] = data;
					if ( xhr === lastXhr ) {
						response( $.ui.autocomplete.filter(
						data, extractLast( request.term ) ) );
					}
				});
		},
		focus: function() {
			// prevent value inserted on focus
			return false;
		},
		select: function( event, ui ) {
			var terms = split( this.value );
			// remove the current input
			terms.pop();
			// add the selected item
			terms.push( ui.item.value );
			// add placeholder to get the comma-and-space at the end
			terms.push( "" );
			this.value = terms.join( ", " );
			return false;
		}
	});
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
});