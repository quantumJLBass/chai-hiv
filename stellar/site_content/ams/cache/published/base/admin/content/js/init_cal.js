function get_calendar_height(jObj){

	return (jObj.data("height")!="")?jObj.data("height"):$(window).height() - ($('#header_bar').height()+$('#navWrap').height()+75);
	
}



$(document).ready(function(){
	if($('#calendar').length){
		/* initialize the calendar
		-----------------------------------------------------------------*/
				var date = new Date();
		var d = date.getDate();
		var m = date.getMonth();
		var y = date.getFullYear();
		
		var jObj = $('#calendar');
		
		
		jObj.fullCalendar({
			theme: true,
			height: get_calendar_height($('#calendar')),
			header: {
				left: (jObj.data("left")!=undefined)?jObj.data("left"):'prev,next today',
				center: 'title',
				right: (jObj.data("right")!=undefined)?jObj.data("right"):'month,agendaWeek,agendaDay'
			},
			editable: (jObj.data("editable")!=undefined)?jObj.data("editable"):true,
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
			$('#calendar').fullCalendar('option', 'height', get_calendar_height($('#calendar')));
		}).trigger("resize");
	}
});