(function($) {
	


	function re_index_query_items(){
		$.each($(".query_item:not('#queryBed .query_item')"),function(i){
			$.each($(this).find("input:visible ,select:visible "),function(){
				//var name = $(this).attr('name');
				$(this).attr('name', $(this).attr('name').split('[')[0]+"["+i+"]");
			});
		});
	}
	function make_prop_select(){
		$(".property_selector").off().on("change",function(){
			
			var prop = $(this).val();
			var query_item = $(this).closest('.query_item');
			
			//alert(prop);
			query_item.find('.input_box input,.input_box select').removeAttr("name");
			query_item.find('.input_box [name*=value]').val('');
			
			query_item.find('.input_box').removeClass("showen");
			query_item.find('.input_box.'+prop+'').addClass("showen");
			if(query_item.find('.input_box:visible').length<=0){
				query_item.find('.input_box.gen').addClass("showen");
			}
			query_item.find('.input_box:visible input,.input_box:visible select').attr("name","value[9999]");
			re_index_query_items();
		});
	}



	function set_prop_sel(val){
		$.each( $('form select.property_selector,form select[name="selected_properties"]') ,function(){
			$(this).find('option').attr("selected",false);
			$(this).find('optgroup').hideOptionGroup();
			var pname = $(this).closest('select').attr("name");
			$('optgroup.'+val+'s[data-pname="'+pname+'"]').showOptionGroup();
		});
	}
	
	function set_up_form(type){
		//,inlist,use){
		/*if($('#clinlic_to_drug').length){
			$('#clinlic_to_drug').html($('#brand_name').val()+'<input type="hidden" value="'+$('[name="item.baseid"]').val()+'"/>');
		}*/
		make_maskes();
		moa_dmpk_setup();
		apply_tax_request();
		apply_taxed_add();
		setting_item_pub($(".ui-dialog"));
		$('input[name^="post"]').val($('input[name="item.baseid"]').val());

		$("#load_file").on("click",function(){ $(".load_file").toggleClass("active"); });
		
		$("#drug_form [type='submit']").on("click",function(e){
			var form = $(this).closest("form");
			if (form.find(':invalid').length<=0) {
				e.preventDefault();
				e.stopPropagation();
				$.post(form.attr("action")+"?skiplayout=1&ajaxed_update=1",form.serialize(),function(){//(data){
					//var parts= data.split(',');
					$( "#drug_form" ).dialog( "destroy" );
					$( "#drug_form" ).remove();
					$(".add_to_list[data-type='"+type+"']").trigger("click");
				});
			}
		});	
	}



	function add_item_popup(type,inlist,use,id){
		if(typeof(use)==="undefined"){ 
			use = ["new","list"];
		}
		if($("#drug_form").length===0){
			$("#staging").append("<div id='drug_form'><div id='drug_list'></div><div id='drug_item'></div>");
		}

		var buttons = "";


		$.ajax({cache: false,
		   url:"/center/"+type+"s.castle",
		   data:{"skiplayout":1,"exclude":inlist,typed_ref:$('[name="typed_ref"]').val()},
		   success: function(data){
				if($.inArray("list", use)>-1){
					$("#drug_list").html(data);
					buttons += "<a href='#drug_list' id='drug_list_tab' class='popuptab button med active'>List</a>";
				}
					$.ajax({cache: false,
					   url:"/center/"+type+".castle",
					   data:{"skiplayout":1,"id":typeof(id)==="undefined"?"":id,typed_ref:$('[name="typed_ref"]').val()},
					   success: function(data){
						   if($.inArray("new", use)>-1){
								$("#drug_item").html(data);
								buttons += "<a href='#drug_item' id='drug_item_tab' class='popuptab button med'>New</a>";
						   }
						$( "#drug_form" ).dialog({
								autoOpen: true,
								resizable: false,
								width: $(window).width()-50,
								height: $(window).height()-50,
								modal: true,
								draggable : false,
								buttons: {
									Cancel: function() {
										$( this ).dialog( "close" );
									}
								},
								create:function(){

									$( "#mess" ).dialog( "destroy" );
									$( "#mess" ).remove();
									if($("#drug_item").html()!=="" && $("#drug_list").html()!==""){
										$("#drug_form").closest('.ui-dialog').find('.ui-dialog-title').append(buttons);
										$("#drug_item").hide();
									}
									//setup_tabs();
									
									$('body').css({overflow:"hidden"});
									$(".ui-dialog-buttonpane").remove();
									
									if($("#drug_list").html().length>0){
										make_popup_datatable(type);
									}
				
									$(".popuptab").off().on("click",function(e){
										e.preventDefault();
										e.stopPropagation();
										var id = $(".popuptab.active").attr("href");
										$(id).hide();
										$(".popuptab.active").removeClass('active');
										$(this).addClass('active');
										id = $(this).attr("href");
										$(id).show();	
										
									});
									set_up_form(type,inlist,use);
									activate_adverse_ui();
								},
								close: function() {
									$('body').css({overflow:"auto"});
									$( "#drug_form" ).dialog( "destroy" );
									$( "#drug_form" ).remove();
									
									last_datatable=null;
								}
							});
							$(window).resize(function(){$("#drug_form" ).dialog('option', { width: $(window).width()-50,  height: $(window).height()-50,});
						});
					}
				});
			}
		});
	}







 

	
	
	
	
	function activate_adverse_ui(){
		
		function controll_meta_items(){
			$('.remove').hover(function(){$(this).removeClass('red');},function(){$(this).addClass('red');});
			$('.remove').on("click",function(){
				var container = $(this).closest('li');
				var option = container.find('[name^="option"]').val();
				$(".adverse_events option[value='"+option+"']").removeAttr("disabled");
				container.fadeOut(function(){ $(this).remove(); });
			});
			re_index_meta_items();
		}	
		function re_index_meta_items(){
			$.each(
			   $(".adverse_events").closest('ul').find("li[data-taxorder]"),
			   function(i){
					$(this).data('taxorder',i);
					$.each($(this).find("input,select:not([name=''])"),function(){
						//var name = $(this).attr('name');
						$(this).attr('name', $(this).attr('name').split('[')[0]+"["+i+"]");
					}); 
				}
			);
		}
		
		$(".adverse_events").on("change", function(){
			var selected = $(this).val();
			var selected_obj = $(this).find('option[value="'+selected+'"]');
			var container = $(this).closest('ul');
			
			var baseid = selected_obj.data('baseid');
			var content = selected_obj.data('content');
			var alias = selected_obj.data('alias');
			
			
			//this works by
			//tax is picked. 
			//the tax, since it's a base id can have a child.
			//that child is the 
			
			var is_none = alias ==="none"?"":"required";
			
			container.append(
				 '<li data-taxorder="9999" data-name="'+selected_obj.val()+'">'+
					'<i class="icon-remove-circle red right remove"></i>'+
					 '<label>'+ selected_obj.text() +' <i class="icon-question-sign blue" title="'+ content +'"></i>'+
					 '</label>'+
					 '<input type="'+(alias ==="none"?"hidden":"text")+'" name="value[9999]" id="" '+is_none+' value=""/>'+//child
					 '<input type="hidden" name="option_key[9999]" value="'+baseid+'" />'+//tax_id
				 '</li>'
			);
			selected_obj.attr("disabled",true);
			$(this).val("");
			controll_meta_items();
			re_index_meta_items();
			make_maskes();
		});
		controll_meta_items();
	}
	function get_table_ids(datagrid){
		var inlist ="";
		var nNodes = datagrid.dataTable().fnGetNodes( );
		$.each(nNodes,function(i,v){
			var item = $(v).find('input.list_item');
			inlist+=(inlist===""?"":",")+item.val();
		});
		return inlist;
	}
	function get_select_ids(select){
		var inlist ="";
		$.each(select.find('option'),function(){
			inlist+=(inlist===""?"":",")+$(this).val();
		});
		return inlist;
	}
	function make_datatable_popup_add(datatable,type){
		$('.additem').off().on('click',function(e){
			e.preventDefault();
			e.stopPropagation();
			var trigger = $(this);
			var targetrow = trigger.closest('tr');
			var baseid = targetrow.data("baseid");
			
			var count = datatable.find("tbody").find("tr").length;
			
			var tdCount = targetrow.find("td").length;
			alert(tdCount);
			var tableData = [];
			
			var html = targetrow.find("td:first").text() + '<input type="hidden" name="item.'+type+'s['+(count-1)+'].baseid" value="'+baseid+'" class="drug_item list_item"/>';
			tableData.push( html );
			tableData.push( targetrow.find("td:first").next('td').text() ); 
			if(tdCount>3){
				tableData.push( targetrow.find("td:first").next('td').next('td').text() ); 
			}
			tableData.push(
				'<a href="#" class="button xsmall crimson defocus removal"><i class="icon-remove" title="Remove"></i></a>'
			); 

			$("[data-active_grid='true']").dataTable().fnAddData( tableData );
			
			targetrow.fadeOut( "75" ,function(){ datatable.fnDeleteRow( datatable.fnGetPosition( targetrow.get(0) ) ); });
			
			$("#drug_form").append("<span class='dialog_message ui-state-highlight'>Added to this "+$("#header_title").text()+"</span>");
			
			setTimeout(function(){$(".dialog_message").fadeOut("500");},"1000");
			
			$("ul .display.datagrid.dataTable .removal").off().on("click",function(e){
				e.preventDefault();
				e.stopPropagation();
				var targetrow = $(this).closest("tr");
				
				var datatable = $(this).closest('.datagrid').dataTable();
				
				targetrow.fadeOut( "75" ,function(){ datatable.fnDeleteRow( datatable.fnGetPosition( targetrow.get(0) ) ); });
			});
		});
	}

	//var parent_datagrid = null;
	var last_datatable=null;
	function make_popup_datatable(type){
		$.each($('.datagrid:not(.dataTable)'),function(){
			var datatable = $(this);
			datatable.dataTable({ 
				"bJQueryUI": true,
				"sPaginationType": "full_numbers",
				"fnDrawCallback": function() {//(oSettings ) {
					make_datatable_popup_add(datatable);
				}
			});

			last_datatable=datatable;
			make_datatable_popup_add(datatable,type);
		});
	}



	$(document).ready(function() {

		$("select[name*='inactive_ingredients[]']").on("change",function(){
			var sel="";
			$.each($(this).find(':selected'),function(i){
				sel+=(i>0?",":"")+$(this).val();
			});
			$("[name$='inactive_ingredients']").val(sel);
		});
	
		$('#start_save_query').on('click',function(e){
			e.preventDefault();
			e.stopPropagation();
			$('#to_save_query').slideDown();
			$('#start_save_query').slideUp();
		});

		moa_dmpk_setup();
		make_maskes();

		if($('.add_ref').length){
			$('.add_ref').on("click",function(e){
				e.preventDefault();
				e.stopPropagation();
				//var targetrow = $(this).closest("grid");
				
				var datatable = $(this).closest('.datagrid').dataTable({
					"aaSorting": [[1,'asc']]
					});
				//var count = datatable.find("tbody").find("tr").length;
				datatable.dataTable().fnAddData( [
					'<input type="hidden" name="item.references[$count].baseid" value="$part.baseid" class="drug_item"/>$part.type',
					'<a href="$item.url" class="ref_link"><i class="icon-external-link"></i></a>',
					'$item.note',
					'<a href="substance.castle?id=$part.baseid" class="button small inline_edit" data-type="substance">Edit</a> | <a href="#" class="button xsmall crimson defocus removal">Remove</a>' ]
				);
			});
		}


		if($('select[name^="property"],.property_selector').length){
			$("#types").on("change",function(){
	
				set_prop_sel($("#types").val());
	
				$('.input_box').removeClass("showen");
				$('.input_box.gen').addClass("showen");
				$('.input_box [name*=value]').val('');
			}).trigger("change");
		}
	
	
	
	
	

		$("#ADD_query").on("click",function(e){
			e.preventDefault();
			e.stopPropagation();
			$(".query_item:not('#queryBed .query_item')").last().after($("#queryBed").html());
			$(".REMOVE_query").off().on("click",function(e){
				e.preventDefault();
				e.stopPropagation();
				$(this).closest(".query_item").fadeOut("150",function(){
					$(this).remove();
					make_prop_select();
					re_index_query_items();
				});					   
			});
			make_prop_select();
			re_index_query_items();
			set_prop_sel($("#types").val());
		});
		make_prop_select();
		
	
	
	
		$("#load_file").on("click",function(){
			$(".load_file").toggleClass("active");
			$(".load_file input").removeAttr("required");
			$(".load_file:visible input").attr("required",true);
		});
	
	
	
	
		$('form[name="entry_form"] :input').on("change",function(){
			
			var test_empty = true;
			$.each($('input,select'),function(){
				if($('form[name="entry_form"] :input').not(":hidden").val()!==""){
					test_empty = false;
				}
			});
			$('input[name="empty"]').val(test_empty+"");
		});
		
		var bypassed = true;
		var excepted = false;
		$('form[name="entry_form"] [type="submit"]').on("click",function(){
			var target = $(this);
			 if($('input[name="empty"]').val()==="true" && !excepted&& !bypassed){
				 if($( "#message" ).length<=0){
					 $('body').append("<div id='message'>");
				 }
				 $( "#message" ).html("The form is empty, are you sure you want to add the record?");
				 $( "#message" ).dialog({
					autoOpen: true,
					resizable: false,
					width: 350,
					height:200,
					modal: true,
					draggable : false,
					buttons: {
						Cancel: function() {
							$( this ).dialog( "close" );
						},
						Ok: function() {
							$( this ).dialog( "close" );
							excepted=true;
							target.trigger("click");
						}
					},
					create:function(){
						$('body').css({overflow:"hidden"});
						//$(".ui-dialog-buttonpane").remove();
					},
					close: function() {
						$('body').css({overflow:"auto"});
						$( "#message" ).dialog( "destroy" );
						$( "#message" ).remove();
					}
				});
			}
			 return ( $('input[name="empty"]').val()==="true" && !excepted && !bypassed )?false:true;
		});
	
	
	

		apply_tax_request();
		apply_taxed_add();
	

		
		
		
		
		
		
		
		apply_a_taxed_add();

		
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
		
		
		

		
		
		
		activate_adverse_ui();
	
		
	
		
		
	

		
		
	
	
		if($('.datagrid').length){
			
			var datagrids = $('.datagrid');
			$.each(datagrids,function(){
				var datatable = $(this);
				datatable.dataTable( {
					"bJQueryUI": true,
					"sPaginationType": "full_numbers",
					"aaSorting": [[1,'asc']]
				});
			});
			
			var addTos = $(".add_to_list");
			$.each(addTos,function(){
				var targ = $(this);
				targ.on("click",function(e){
					e.preventDefault();
					e.stopPropagation();
					var targ = $(this);
					var type = targ.data('type');
					
					var focused_grid = targ.prev('.dataTables_wrapper').find('.datagrid');
					$("[data-active_grid='true']").attr("data-active_grid",false);
					focused_grid.attr("data-active_grid",true);
	
					var list ="";
					if(focused_grid.find(".dataTables_empty").length<=0){
						list = get_table_ids( focused_grid );
					}
					popup_message('<span style="font-size: 28px;"><i class="icon-spinner icon-spin icon-large"></i> </span>',true);
					add_item_popup(type, list, ["new","list"]);
				});
			});
			
			var removals = $(".display.datagrid.dataTable .removal");
			$.each(removals,function(){
				var targ = $(this);
				targ.on("click",function(e){
					e.preventDefault();
					e.stopPropagation();
					var targ = $(this);
					var targetrow = targ.closest("tr");
					var datatable = targ.closest('.datagrid').dataTable();
					targetrow.fadeOut( "75" ,function(){ 
						var row = targetrow.get(0);
						datatable.fnDeleteRow( datatable.fnGetPosition( row ) );
					});
				});
			});
	
		}
	
	
	
	

	
		$('option.add_item').on('click',function(e){
			e.preventDefault();
			e.stopPropagation();
			$(this).attr('selected',false);
			add_item_popup($(this).closest('select').data('type'),  get_select_ids( $(this).closest('select') ) ,["new"]);
		});
		
		$('.inline_edit').on('click',function(e){
			e.preventDefault();
			e.stopPropagation();
			popup_message('<span style="font-size: 28px;"><i class="icon-spinner icon-spin icon-large"></i> </span>',true);
			add_item_popup($(this).data('type'),"",["new"], $(this).closest('tr').data('baseid') );
		});
		
		
	
	
	
	

		
	
	
	
	});
})(jQuery);
