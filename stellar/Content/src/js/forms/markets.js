// JavaScript Document

(function($) {
	$(document).ready(function() {
		


		var tabs = $( "#tabed" ).tabs().addClass( "ui-tabs-vertical ui-helper-clearfix" );
		//var uitabs = $( ".uitabs" ).tabs();
		
		$('.ui-state-default span.ui-icon-close').on("click", function() {
			var panelId = $( this ).closest( "li" ).remove().attr( "aria-controls" );
			$( "#" + panelId ).remove();
			tabs.tabs( "refresh" );
			$.each( $('input[name^="markets_counts["]' ), function(i){
				$(this).attr('name','markets_counts['+ (i+1) +']');
			});
		});
		$( "#tabed li" ).removeClass( "ui-corner-top" ).addClass( "ui-corner-left" );
		$( "#newyear" ).button().on('click',function(){
			//var txt = $("#querybed").html();
			if($( "#marketdialog" ).length<=0){
				$('body').append('<div id="marketdialog" title="Tab data"><form><fieldset class="ui-helper-reset"><label for="tab_title">Year</label><input type="number" name="tab_date" id="tab_date" value="" class="ui-widget-content ui-corner-all" /></fieldset></form></div>');
			}	
			var tabTitle = $( "#tab_date" );
			var tabTemplate = "<li><a href='#{href}'>#{label}</a> <span class='ui-icon ui-icon-close' role='presentation'>Remove Tab</span></li>";
			var tabCounter = $( "#tabed li" ).length;
	
			var today = new Date();
	
			// modal dialog init: custom buttons and a "close" callback reseting the form inside
			var dialog = $( "#marketdialog" ).dialog({
				autoOpen: true,
				modal: true,
				create:function(){
					make_maskes();
					$('#tab_date').spinner({
						min: 1980,
						max: today.getFullYear() + 2,
						create: function() {
							$('#tab_date').spinner( "value", today.getFullYear() );
						},
						change:function(){
							if( $('#tab_date').val() > today.getFullYear() + 2 ){
								$( "#marketdialog" ).append('<p style="display:block; background-color:yellow; color:red; padding: 2px 5px;" id="yearWarning">You reached the max year. Reseting the year for you.</p>');
								setTimeout(function(){ $("#yearWarning").fadeOut(500); },2000);
								$('#tab_date').val(today.getFullYear()+2);
							}
						}
					});
					
					},
				buttons: {
					Add: function() {
						addTab();
						$( this ).dialog( "close" );
					},
					Cancel: function() {
						$( this ).dialog( "close" );
					}
				},
				close: function() {
					form[ 0 ].reset();
				}
			});
	
			// addTab form: calls addTab function on submit and closes the dialog
		
			var form = dialog.find( "form" ).submit(function( event ) {
				addTab();
				dialog.dialog( "close" );
				event.preventDefault();
			});
			// actual addTab function: adds new tab using the input from the form above
		
			function addTab() {
				var label = tabTitle.val() || "Tab " + tabCounter,
					id = "tabs-" + tabCounter,
					li = $( tabTemplate.replace( /#\{href\}/g, "#" + id ).replace( /#\{label\}/g, label ) );
				tabs.find( ".ui-tabs-nav" ).append( li );
				var content = $("#querybed").html();
				var contentHtml = content.replace( /\{\{YEAR\}\}/g, label ) ;
				contentHtml = contentHtml.replace( /\{\{COUNT\}\}/g, tabCounter+1 ).replace( /\{\{__\}\}/g, "" ) ;
				tabs.append( "<div id='" + id + "'>" + contentHtml + "</div>" );
				tabs.tabs( "refresh" );
				tabs.tabs( "option", "active", tabCounter );
				tabCounter++;
				$.each( $('input[name^="markets_counts["]' ), function(i){
					$(this).attr('name','markets_counts['+ (i+1) +']');
				});
			}
		
		
			tabs.delegate( "span.ui-icon-close", "click", function() {
				var panelId = $( this ).closest( "li" ).remove().attr( "aria-controls" );
				$( "#" + panelId ).remove();
				tabs.tabs( "refresh" );
				$.each( $('input[name^="markets_counts["]' ), function(i){
					$(this).attr('name','markets_counts['+ (i+1) +']');
				});
			});
		
			tabs.bind( "keyup", function( event ) {
				if ( event.altKey && event.keyCode === $.ui.keyCode.BACKSPACE ) {
					var panelId = tabs.find( ".ui-tabs-active" ).remove().attr( "aria-controls" );
					$( "#" + panelId ).remove();
					tabs.tabs( "refresh" );
				}
			});
		});







		
	});
})(jQuery);