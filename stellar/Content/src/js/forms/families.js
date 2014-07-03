// JavaScript Document
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

	




$(document).ready(function() {

	$('#substances_disabled').on("click",function(e){
		e.preventDefault();
		e.stopPropagation();
			if($("#substances_disabled_mess").length<=0){
				$('body').append('<div id="substances_disabled_mess">');
			}
			$("#substances_disabled_mess").html( $(this).attr('title') );
			$( "#substances_disabled_mess" ).dialog({
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
				open:function(){},
				buttons:{
					Ok:function(){
						$( this ).dialog( "close" );
					}
				},
				close: function() {
					$('body').css({overflow:"auto"});
					$( "#substances_disabled_mess" ).dialog( "destroy" );
					$( "#substances_disabled_mess" ).remove();
				}
			});
	});






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
				html+="<span class='item i"+i+"' data-baseid='"+v.baseid+"' data-name='"+v.name+"' data-lab_code='"+v.lab_code+"'  ><i title='edit' class='icon-plus'></i>"+v.name+" ( "+v.lab_code+" )<br/></span>";
				
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
						par.fadeOut("fast");
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
	var drPro_tabDefaultContent = '<table width="100%" class="drpro_table display" ellspacing="0"><thead><tr><th>Amt.</th><th>Manufacure</th><th>Actions</th></tr></thead><tfoot><tr><th></th><th></th><th></th></tr></tfoot><tbody></tbody></table>';




	function add_drProTableRow(form){
		var html = "";
		html+="<div id='drPro_additions' class='min'>";
			html+="<h4>Create new "+form+"</h4>";
				html+="<div id='create_drPros_stub' class='full-input'>";
					html+="<form action='/center/savedrug.castle' method='post'><input name='item.baseid' type='hidden' value='0'>";
						html+="<input type='hidden' name='item.families[1].baseid' value='"+$("[name='item.baseid']").val()+"'/>";
						html+="<input type='hidden' name='item.dose_form' value='"+form+"'/>";
						html+="<input type='hidden' name='item.attached' value='false'/>";
						html+="<label>Amount<br/><input type='text' name='item.label_claim'/><br/></label>";
						html+="<label>Manufacturer<br/><select name='item.manufacturer' id='quick_drPro_manufacturer'><option value=''>Select</option></select><br/></label>";
						html+="<a href='#' id='create_drPros_stub_submit' class='button'>Add drug product stub</a>";
					html+="</form>";
				html+="</div>";
		html+="</div>";
		html+="<div class='clearfix'></div>";
		
		if($("#form_list").length<=0){
			$('body').append('<div id="form_list">');
		}
		$("#form_list").html( html );
		$( "#form_list" ).dialog({
			autoOpen: true,
			resizable: false,
			width: 350,
			minHeight: 150,
			height: 'auto',
			maxHeight: $(window).height(),
			modal: true,
			draggable : false,
			create:function(){
				$('.ui-dialog-titlebar').remove();
				//$(".ui-dialog-buttonpane").remove();
				$('body').css({overflow:"hidden"});
			},
			open:function(){
				$.getJSON('/center/get_taxonomies.castle?tax=commercial&callback=?',  function(data){
					var list="";
					$.each(data,function(i,v){
						list+="<option value='"+v.alias+"'>"+v.name+"</option>";
					});
					$('#quick_drPro_manufacturer').append(list);
				});
				$('.item .icon-plus').on("click",function(){
					var name = $(this).closest('span').data('name');
					var baseid = $(this).closest('span').data('baseid');
					var alias = $(this).closest('span').data('alias');
					add_drProTab(name,baseid,alias);
				});
				
				$('#create_drPros_stub_submit').on("click",function(e){
					e.preventDefault();
					e.stopPropagation();
					var form_data = $('#create_drPros_stub form').find( "input, textarea, select" ).serializeArray();
	
					$.ajax({cache: false,
					   url:$('#create_drPros_stub form').attr('action')+"?json=true&ajaxed_update=true&callback=?",
					   data:form_data,
					   dataType : "json",
					   success: function(returndata){
							if(returndata.baseid!==""){
								popup_message($("<span><h5>You have added a new Durg Protuct!</h5> It was added to the table of products for the drug form.</span>"));
								$('#drpro_empty').remove();
								$('[href="#existing_drPros"]').trigger('click');
								$.each(returndata,function(i,v){
									var dataTable = $("[id^='drPro_tabs_"+form+"']").find('.dataTable');
									var tableData = [];
									
									var count = $(".drug_item.list_item").length;
									var html = v.label_claim + '<input type="hidden" name="drugs['+(count)+'].baseid" value="'+v.baseid+'" class="drug_item list_item"/><input type="hidden" name="drugs['+(count)+'].attached" value="1" class="drug_item list_item"/>';
									tableData.push( html );
									tableData.push( v.manufacturer ); 
									tableData.push( '<a href="#" class="button xsmall crimson defocus removal"><i class="icon-remove" title="Remove"></i></a>' ); 
									dataTable.dataTable().fnAddData( tableData );
									
									$("ul .display.datagrid.dataTable .removal").off().on("click",function(e){
										e.preventDefault();
										e.stopPropagation();
										var targetrow = $(this).closest("tr");
										var datatable = $(this).closest('.dataTable').dataTable();
										targetrow.fadeOut( "75" ,function(){ 
											datatable.fnDeleteRow( datatable.fnGetPosition( targetrow.get(0) ) );
										});
									});

								});
								$( "#form_list" ).dialog( "close" );
							}else{
								popup_message($("<span>failed to save, try again.</span>"));
							}
						}
					});
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
	}



	function add_drProTab(name,baseid,alias) {
		var id = "drPro_tabs_" + alias +"_"+ drPro_tabCounter,
			li = $( drPro_tabTemplate
						.replace( /#\{href\}/g, "#" + id )
						.replace( /#\{label\}/g, name )
						.replace( /#\{baseid\}/g, baseid )
						.replace( /#\{name\}/g, name )
						.replace( /#\{alias\}/g, alias )
					);
		if($("[id^='drPro_tabs_" + alias +"_']").length<=0){
			drProTab.find( ".ui-tabs-nav" ).prepend( li );
	
			var contentHtml = drPro_tabDefaultContent;/*.replace( /\{\{YEAR\}\}/g, label ) ;
			contentHtml = contentHtml.replace( /\{\{COUNT\}\}/g, drPro_tabCounter+1 ).replace( /\{\{__\}\}/g, "" ) ;*/
			drProTab.prepend( "<div id='" + id + "'>" + contentHtml + "</div>" );
			drProTab.tabs( "refresh" );
			drProTab.tabs( "option", "active", drPro_tabCounter );
			$('.drpro_table:not(".dataTable")').DataTable({ 
					"bJQueryUI": true,
					"sPaginationType": "full_numbers", 
					"fnDrawCallback": function() {//(oSettings ) {
						if($("#" + id).find('.fg-toolbar .add_drPro').length<=0){
							$("#" + id).find('.fg-toolbar.ui-widget-header:first').prepend('<a href="#" class="button add_drPro" style="float:left;">Add <i title="edit" class="icon-plus"></i></a>');
						}
						$("#" + id).find('.drpro_table .dataTables_empty').html('No '+name+' products available. <a href="#" class="add_drPro">Add <i title="edit" class="icon-plus"></i></a>');
						$("#" + id).find('.add_drPro').off().on("click",function(e){
							e.preventDefault();
							e.stopPropagation();
							add_drProTableRow(alias);
						});
						//make_datatable_popup_add(datatable);
					}
				});
			drPro_tabCounter++;
			/*$.each( $('input[name^="markets_counts["]' ), function(i){
				$(this).attr('name','markets_counts['+ (i+1) +']');
			});*/
		}
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
		
		if($('.substance_item').length<=0){
			alert("You must add substances before you can add drugs");
			return false;	
		}
		
		
		
		
		$.getJSON('/center/get_taxonomies.castle?tax=dose_type&callback=?',  function(data){

			var html = "";
			html += "<div id='listing' style='max-height:95%; overflow-y:scroll;'>";
			$.each(data,function(i,v){
				if($("[id^='drPro_tabs_" + v.alias +"_']").length<=0){
					html+="<span class='item i"+i+"' data-baseid='"+v.baseid+"' data-name='"+v.name+"' data-alias='"+v.alias+"'  ><i title='edit' class='icon-plus'></i>"+v.name+" ( "+v.alias+" )<br/></span>";
				}
				
			});
			html += "</div>";
			html+="<span id='add_drform' style='cursor:pointer;'><hr/><i title='edit' class='icon-plus'></i>Add a New form</span>";
			
			
			if($("#form_list").length<=0){
				$('body').append('<div id="form_list">');
			}
			$("#form_list").html( html );
			$( "#form_list" ).dialog({
				autoOpen: true,
				resizable: false,
				width: 350,
				minHeight: 25,
				height:"auto",
				maxHeight: $(window).height()*0.65,
				modal: true,
				draggable : false,
				create:function(){
					$('.ui-dialog-titlebar').remove();
					//$(".ui-dialog-buttonpane").remove();
					$('body').css({overflow:"hidden"});
				},
				open:function(){
					$('#add_drform').on("click",function(){
						start_taxed_add(
							"dose_type", 
							function(){}, 
							function(){
								make_a_tax_form(function(data){
									$("#listing").append("<span class='item i"+data.baseid+"' data-baseid='"+data.baseid+"' data-name='"+data.name+"' data-alias='"+data.alias+"'  ><i title='edit' class='icon-plus'></i>"+data.name+" ( "+data.alias+" )<br/></span>");
						
						
									//this may be something that is functioned?  look a few line below			
									$('.item .icon-plus').on("click",function(){
										$(this).closest('span').fadeOut("fast");
										var name = $(this).closest('span').data('name');
										var baseid = $(this).closest('span').data('baseid');
										var alias = $(this).closest('span').data('alias');
										add_drProTab(name,baseid,alias);
									});
								});
							}
						);
					});
					$('.item .icon-plus').on("click",function(){
						$(this).closest('span').fadeOut("fast");
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
	
	$.each($('.drpro_table:not(".dataTable")'),function(){
		var id=$(this).closest('.tabedItem').attr('id');
		var alias=$(this).closest('.tabedItem').attr('alias');
		var name=$(this).closest('.tabedItem').attr('name');
		$(this).DataTable({ 
				"bJQueryUI": true,
				"sPaginationType": "full_numbers", 
				"fnDrawCallback": function() {//(oSettings ) {
					
					
					
					if($("#" + id).find('.fg-toolbar .add_drPro').length<=0){
						$("#" + id).find('.fg-toolbar.ui-widget-header:first').prepend('<a href="#" class="button add_drPro" style="float:left;">Add <i title="edit" class="icon-plus"></i></a>');
					}
					$("#" + id).find('.drpro_table .dataTables_empty').html('No '+name+' products available. <a href="#" class="add_drPro">Add <i title="edit" class="icon-plus"></i></a>');
					$("#" + id).find('.add_drPro').off().on("click",function(e){
						e.preventDefault();
						e.stopPropagation();
						add_drProTableRow(alias);
					});
					//make_datatable_popup_add(datatable);
					
					$("#" + id).find('.removal').off().on("click",function(e){
						e.preventDefault();
						e.stopPropagation();
						var targetrow = $(this).closest("tr");
						var datatable = $(this).closest('.dataTable').dataTable();
						targetrow.fadeOut( "75" ,function(){ 
							datatable.fnDeleteRow( datatable.fnGetPosition( targetrow.get(0) ) );
							//targetrow.remove();
						});
					});
	
					
				}
		});	
	});			
	

	
	
	
});