// JavaScript Document
(function($) {
	$.chai.markets = {
		ui:{
			tabs:null,
			tabTitle:null,
			tabTemplate:null,
			tabCounter:null,
		},
		ini:function(){
	
			$.chai.markets.ui.tabs = $( "#tabed" ).tabs().addClass( "ui-tabs-vertical ui-helper-clearfix" );
			//var uitabs = $( ".uitabs" ).tabs();
			
			$('.ui-state-default span.ui-icon-close').on("click", function(e){
				e.preventDefault();
				e.stopPropagation();
				var panelId = $( this ).closest( "li" ).remove().attr( "aria-controls" );
				$( "#" + panelId ).remove();
				$.chai.markets.ui.tabs.tabs( "refresh" );
				$.each( $('input[name^="markets_counts["]' ), function(i){
					$(this).attr('name','markets_counts['+ (i+1) +']');
				});
			});
			$( "#tabed li" ).removeClass( "ui-corner-top" ).addClass( "ui-corner-left" );
			$( "#newyear" ).on('click',function(e){
				e.preventDefault();
				e.stopPropagation();
				//var txt = $("#querybed").html();
				if($( "#marketdialog" ).length<=0){
					$('body').append('<div id="marketdialog" title="Tab data"><form><fieldset class="ui-helper-reset"><label for="tab_title">Year</label><input type="number" name="tab_date" id="tab_date" value="" class="ui-widget-content ui-corner-all" /></fieldset></form></div>');
				}	
				$.chai.markets.ui.tabTitle = $( "#tab_date" );
				$.chai.markets.ui.tabTemplate = "<li><a href='#{href}'>#{label}</a> <span class='ui-icon ui-icon-close' role='presentation'>Remove Tab</span></li>";
				$.chai.markets.ui.tabCounter = $( "#tabed li" ).length;
		
				var today = new Date();
		
				// modal dialog init: custom buttons and a "close" callback reseting the form inside
				var dialog = $( "#marketdialog" ).dialog({
					autoOpen: true,
					modal: true,
					create:function(){
						$.chai.core.util.make_maskes();
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
							$.chai.markets.addTab();
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
					$.chai.markets.addTab();
					dialog.dialog( "close" );
					event.preventDefault();
				});
				// actual addTab function: adds new tab using the input from the form above
			
	
			
			
				$.chai.markets.ui.tabs.delegate( "span.ui-icon-close", "click", function() {
					var panelId = $( this ).closest( "li" ).remove().attr( "aria-controls" );
					$( "#" + panelId ).remove();
					$.chai.markets.ui.tabs.tabs( "refresh" );
					$.each( $('input[name^="markets_counts["]' ), function(i){
						$(this).attr('name','markets_counts['+ (i+1) +']');
					});
				});
			
				$.chai.markets.ui.tabs.bind( "keyup", function( event ) {
					if ( event.altKey && event.keyCode === $.ui.keyCode.BACKSPACE ) {
						var panelId = $.chai.markets.ui.tabs.find( ".ui-tabs-active" ).remove().attr( "aria-controls" );
						$( "#" + panelId ).remove();
						$.chai.markets.ui.tabs.tabs( "refresh" );
					}
				});
			});
		},
		addTab:function() {
			var label = $.chai.markets.ui.tabTitle.val() || "Tab " + $.chai.markets.ui.tabCounter,
				id = "tabs-" + $.chai.markets.ui.tabCounter,
				li = $( $.chai.markets.ui.tabTemplate.replace( /#\{href\}/g, "#" + id ).replace( /#\{label\}/g, label ) );
			$.chai.markets.ui.tabs.find( ".ui-tabs-nav" ).prepend( li );
			var content = $("#querybed").html();
			var contentHtml = content.replace( /\{\{YEAR\}\}/g, label ) ;
			contentHtml = contentHtml.replace( /\{\{COUNT\}\}/g, $.chai.markets.ui.tabCounter+1 ).replace( /\{\{__\}\}/g, "" ) ;
			$.chai.markets.ui.tabs.append( "<div id='" + id + "'>" + contentHtml + "</div>" );
			$.chai.markets.ui.tabs.tabs( "refresh" );
			$.chai.markets.ui.tabs.tabs( "option", "active", $.chai.markets.ui.tabCounter );
			$.chai.markets.ui.tabCounter++;
			$.each( $('input[name^="markets_counts["]' ), function(i){
				$(this).attr('name','markets_counts['+ (i+1) +']');
			});
		},
	};
})(jQuery);