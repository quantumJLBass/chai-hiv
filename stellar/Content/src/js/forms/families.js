// JavaScript Document

$(document).ready(function() {

	function sortedCode(){
		$('.substance_item .icon-trash').off().on("click",function(){
			$(this).closest('.substance_item').fadeOut("fast",function(){
				$(this).remove();
				sortedCode();
			});
		});
		var code="";
		$.each($(".substance_item"),function(i){
			code+= (code===""?"":"<em>:</em>") + $(this).find('.sub_code').text();
			$('.substanceOrder').val(i+1);
		});
		$("#sub_code").html(code);
	}
	$("#sortable").sortable({
		handle: ".sortable_handle",
		placeholder: "ui-state-highlight",
		stop:function(){ sortedCode(); }
	});
	
	$("#famSubAdd").on("click",function(e){
		e.preventDefault();
		e.stopPropagation();
		//var sudo_code=Math.random().toString(36).slice(2,5);
		//var baseid=Math.random();
		$.getJSON("/center/substances.castle?json=true&callback=?",function(data){
			//alert("got data");
			var html = "";
			$.each(data,function(i,v){
				html+="<span class='item i"+i+"' data-baseid='"+v.baseid+"' data-name='"+v.name+"' data-lab_code='"+v.lab_code+"'  ><i title='edit' class='icon-plus'></i>"+v.name+" ( "+v.lab_code+" )</span><br/>";
				
			});
			if($("#substances_list").length<=0){
				$('body').append('<div id="substances_list">');
			}
			$("#substances_list").html( html );
			$( "#substances_list" ).dialog({
				autoOpen: true,
				resizable: false,
				width: 350,
				minHeight: 25,
				modal: true,
				draggable : false,
				create:function(){
					$('.ui-dialog-titlebar').remove();
					//$(".ui-dialog-buttonpane").remove();
					$('body').css({overflow:"hidden"});
				},
				open:function(){
					$('.item .icon-plus').on("click",function(){
						var par = $(this).closest('span');
						
						var html ="<li class='substance_item'>";
						html+="<i title='edit' class='icon-trash'></i>";
						html+="<span class='sortable_handle'>handle</span> "+par.data("name")+" (<span class='sub_code'>"+par.data("lab_code")+"</span>)";

						html+="<input type='hidden' name='substances["+par.data("baseid")+"].baseid' value='"+par.data("baseid")+"' class='substance'/>";
						html+="<input type='hidden' name='family_substance["+par.data("baseid")+"].baseid' value='0'  class=''/>";
						html+="<input type='hidden' name='family_substance["+par.data("baseid")+"].family.baseid' value='"+$('[name="item.baseid"]').val()+"'  class=''/>";
						html+="<input type='hidden' name='family_substance["+par.data("baseid")+"].substance_order' value='"+$(".substance_item").length+"'  class='substanceOrder'/>";
						html+="<input type='hidden' name='family_substance["+par.data("baseid")+"].substance.baseid' value='"+par.data("baseid")+"'  class=''/>";
						html+="</li>";

						$(html).appendTo("#sortable");
						$("#sortable").sortable("refresh");
						sortedCode();
					});
				},
				buttons:{
					Ok:function(){
						$( this ).dialog( "close" );
					}
				},
				close: function() {
					$('body').css({overflow:"auto"});
					$( "#substances_list" ).dialog( "destroy" );
					$( "#substances_list" ).remove();
				}
			});
		});
		
	});
	
	$("#famSubCode .icon-edit").on("click",function(){
		if($("#subCodeEdit").is($('.open'))){
			$("#subCodeEdit").slideUp("slow", function() {
				$("#subCodeEdit").removeClass("open");
				$("#subCodeEdit").addClass("closed");
			});
		}else{
			$("#subCodeEdit").slideDown("slow", function() {
				$("#subCodeEdit").addClass("open");
				$("#subCodeEdit").removeClass("closed");
			});
		}
	});
	$("#subCodeEdit .icon-power-off").on("click",function(){
		$("#subCodeEdit").slideUp("slow", function() {
			$("#subCodeEdit").removeClass("open");
			$("#subCodeEdit").addClass("closed");
		});
	});
	sortedCode();


	// addTab button: just opens the dialog
		var drProTab = $( "#drPro_tabed" ).tabs().addClass( "ui-tabs-vertical ui-helper-clearfix" );
		$( "#drPro_tabed li" ).removeClass( "ui-corner-top" ).addClass( "ui-corner-left" );


		var drPro_tabTemplate = "<li><a href='#{href}' data-baseid='#{baseid}' data-name='#{name}' data-alias='#{alias}'>#{label}</a> <i class='icon-remove'></i></li>";
		var drPro_tabCounter = $( "#drPro_tabed li" ).length;
		var drPro_tabDefaultContent = '<table width="100%" class="drpro_table display" ellspacing="0"><thead><tr><th>Amt.</th><th>Manufacure</th></tr></thead><tfoot><tr><th>Amt.</th><th>Manufacure</th></tr></tfoot><tbody></tbody></table>';

		function add_drProTab(name,baseid,alias) {
			var id = "drPro_tabs-" + drPro_tabCounter,
				li = $( drPro_tabTemplate
							.replace( /#\{href\}/g, "#" + id )
							.replace( /#\{label\}/g, name )
							.replace( /#\{baseid\}/g, baseid )
							.replace( /#\{name\}/g, name )
							.replace( /#\{alias\}/g, alias )
						);
			drProTab.find( ".ui-tabs-nav" ).prepend( li );

			var contentHtml = drPro_tabDefaultContent;/*.replace( /\{\{YEAR\}\}/g, label ) ;
			contentHtml = contentHtml.replace( /\{\{COUNT\}\}/g, drPro_tabCounter+1 ).replace( /\{\{__\}\}/g, "" ) ;*/
			drProTab.append( "<div id='" + id + "'>" + contentHtml + "</div>" );
			drProTab.tabs( "refresh" );
			drProTab.tabs( "option", "active", drPro_tabCounter );
			$('.drpro_table:not(".dataTable")').DataTable({ 
					"bJQueryUI": true,
					"sPaginationType": "full_numbers",
					"fnDrawCallback": function() {//(oSettings ) {
						//make_datatable_popup_add(datatable);
					}
				});
			drPro_tabCounter++;
			/*$.each( $('input[name^="markets_counts["]' ), function(i){
				$(this).attr('name','markets_counts['+ (i+1) +']');
			});*/
		}
		drProTab.delegate( "i.icon-remove", "click", function() {
			var panelId = $( this ).closest( "li" ).remove().attr( "aria-controls" );
			$( "#" + panelId ).remove();
			drProTab.tabs( "refresh" );
			/*$.each( $('input[name^="markets_counts["]' ), function(i){
				$(this).attr('name','markets_counts['+ (i+1) +']');
			});*/
		});
		
		$('#addDrugForm').on('click',function(e){
			e.preventDefault();
			e.stopPropagation();
			$.getJSON('/center/get_taxonomies.castle?tax=dose_type&callback=?',  function(data){
	
				var html = "";
				$.each(data,function(i,v){
					html+="<span class='item i"+i+"' data-baseid='"+v.baseid+"' data-name='"+v.name+"' data-alias='"+v.alias+"'  ><i title='edit' class='icon-plus'></i>"+v.name+" ( "+v.alias+" )</span><br/>";
					
				});
				if($("#form_list").length<=0){
					$('body').append('<div id="form_list">');
				}
				$("#form_list").html( html );
				$( "#form_list" ).dialog({
					autoOpen: true,
					resizable: false,
					width: 350,
					minHeight: 25,
					modal: true,
					draggable : false,
					create:function(){
						$('.ui-dialog-titlebar').remove();
						//$(".ui-dialog-buttonpane").remove();
						$('body').css({overflow:"hidden"});
					},
					open:function(){
						$('.item .icon-plus').on("click",function(){
							var name = $(this).closest('span').data('name');
							var baseid = $(this).closest('span').data('baseid');
							var alias = $(this).closest('span').data('alias');
							add_drProTab(name,baseid,alias);
						});
					},
					buttons:{
						Ok:function(){
							$( this ).dialog( "close" );
						}
					},
					close: function() {
						$('body').css({overflow:"auto"});
						$( "#form_list" ).dialog( "destroy" );
						$( "#form_list" ).remove();
					}
				});
			});
			 
		});
			
	
});