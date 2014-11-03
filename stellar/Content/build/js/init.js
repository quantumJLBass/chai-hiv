(function($) {
	$.chai={};		
	$.chai.ini=	function (options){
		return $.chai.ready(options);
	};
})(jQuery);
(function($) {
	$.chai.core={};
	$.chai.core.util = {
		autosaved:false,
		t:null,
		autoSaver:function(){
			$.chai.core.util.t=window.setInterval(function() {
				$.each($('form.autosave'),function() {
					var self = $(this);
					if($(".dialog_message.autosave").length<=0){
						$("body").append("<div class='dialog_message ui-state-highlight autosave'>");
					}
					$(".dialog_message.autosave").html("Auto saving");
					$(".dialog_message.autosave").show();
					$.ajax({
						url: $(this).attr("action"),
						data: "autosave=true&autosaved="+$.chai.core.util.autosaved+"&"+$(this).serialize(),
						type: "POST",
						success: function(data){
							if(data && data === "success") {
								$.chai.core.util.autosaved=true;
								$(".dialog_message.autosave").html("Auto saved form");
								self.trigger('reinitialize.areYouSure');
							}else if(data && data === "unsaved") {
								window.clearInterval($.chai.core.util.t);
								$.chai.core.util.t=null;
								$(".dialog_message.autosave").html("Will not auto save untill the item is saved.");
								$(".dialog_message.autosave").show();
								setTimeout(function(){$(".dialog_message.autosave").fadeOut("500");},"4000");
								return;
							}else{
								$(".dialog_message.autosave").html("Failed to auto save");
							}
							$(".dialog_message.autosave").show();
							setTimeout(function(){$(".dialog_message.autosave").fadeOut("500");},"1000");
						}
					});
				});
			}, 10 * 1000);	
			
		},
		start_autoSaver:function(){
			$('form.autosave').areYouSure({
				'silent':true,
				change: function() {
					// Enable save button only if the form is dirty. i.e. something to save.
					if ($(this).hasClass('dirty')) {
						$.chai.core.util.autoSaver();
					} else {
						window.clearInterval($.chai.core.util.t);
						$.chai.core.util.t=null;
					}
				}
			});
		},
		alais_scruber:function (input,jObj){
			var str = input.val();
				str=str.split(' ').join('-');
				str=str.split('&').join('-and-');
				str=str.replace(/[^A-Za-z0-9\-_]/g, "");
				str=str.split('--').join('-');
				str=str.split('__').join('_');
				str=str.split('/').join('');
			jObj.val(str.toLowerCase());
		},
		turnon_alias:function (input,jObj){
			input.off().on("keyup",function(){
				$.chai.core.util.alais_scruber(input,jObj);
			});
		},
		make_maskes:function (){
			$.mask.definitions['~'] = "[+-]";
			$('[type="date"],[rel="date"]').mask("99/99/9999",{completed:function(){ }});
			$('#tab_date').mask("9999",{completed:function(){ }});
			/*
			$("#phone").mask("(999) 999-9999");
			$("#phoneExt").mask("(999) 999-9999? x99999");
			$("#iphone").mask("+33 999 999 999");
			$("#tin").mask("99-9999999");
			$("#ssn").mask("999-99-9999");
			$("#product").mask("a*-999-a999", { placeholder: " " });
			$("#eyescript").mask("~9.99 ~9.99 999");
			$("#po").mask("PO: aaa-999-***");
			$("#pct").mask("99%");
			*/
			$("input").blur(function() {
				//$("#info").html("Unmasked value: " + $(this).mask());
			}).dblclick(function() {
				$(this).unmask();
			});
			$( "label i[title]" ).tooltip();
			$( '[type="date"],[rel="date"]' ).datepicker();
		},





		setup_viewlog:function(){
			$('#viewlog').on('click',function(e){
				e.preventDefault();
				e.stopPropagation();
				$.get('/center/retriveLog.castle',{'id':$(this).data('item_id')},function(html){
					if($('#view_log_area').length<=0){
						$('body').append('<div id="view_log_area">');	
					}
					$('#view_log_area').html(html);
					$( "#view_log_area" ).dialog({
						autoOpen: true,
						resizable: false,
						width: $(window).width()*0.8,
						height:$(window).height()*0.8,
						modal: true,
						draggable : false,
						buttons: {
							Close: function() {
								$( this ).dialog( "close" );
							}
						},
						create:function(){
							$('body').css({overflow:"hidden"});
							//$(".ui-dialog-buttonpane").remove();
						},
						close: function() {
							$('body').css({overflow:"auto"});
							$('#view_log_area').dialog( "destroy" );
							$('#view_log_area').remove();
						}
					});
				});
			});
		},
		setup_refs:function(){
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
		},
	
		setting_item_pub:function(parentObj){
			parentObj.find( ".pubstate" ).buttonset();
			if(parentObj.find('.pubstate :radio:checked').val()<1){
				parentObj.find('#noting').next("label").show();
			}else{
				parentObj.find('#noting').next("label").hide();
			}
			parentObj.find('.pubstate :radio').change(function () {
				parentObj.find('.pubstate :radio').next("label").find("i").removeClass("icon-check-empty").removeClass("icon-check");
				parentObj.find('.pubstate :radio').not(":checked").next("label").find("i").addClass("icon-check-empty");
				parentObj.find('.pubstate :radio:checked').next("label").find("i").addClass("icon-check");
				if(parentObj.find('.pubstate :radio:checked').val()<1){
					parentObj.find('#noting').next("label").show();
				}else{
					parentObj.find('#noting').next("label").hide();
				}
				if(parentObj.find(".notearea").find("textarea").val()!==""){
					parentObj.find('#noting').next("label").find("i").addClass("icon-file-text-alt");
				}else{
					parentObj.find('#noting').next("label").find("i").addClass("icon-file-alt");
				}
				
			});
			parentObj.find('#noting').button();
			parentObj.find('#noting').change(function () {
				parentObj.find( ".notearea" ).dialog({
					autoOpen: true,
					height: 300,
					width: 350,
					modal: true,
					buttons: {
						"CLEAR Note": function() {
							$(this).find("textarea").val( "" );
							$( this ).dialog( "close" );
						},
						Accept: function() {
							$( this ).dialog( "close" );
						},
						Cancel: function() {
							$( this ).dialog( "close" );
						}
					},
					close: function() {
						parentObj.find('.noted').find("label").removeClass("ui-state-active");
						var value=$(this).find("textarea").val();
						parentObj.find("[name='item.content']").val(value);
						parentObj.find( "#noting" ).attr("checked",false);
						parentObj.find('#noting').next("label").find("i").removeClass("icon-file-text-alt").removeClass("icon-file-alt");
						if(value!==""){
							parentObj.find('#noting').next("label").find("i").addClass("icon-file-text-alt");
						}else{
							parentObj.find('#noting').next("label").find("i").addClass("icon-file-alt");
						}
						$( this ).dialog( "destroy" );
					}
				});
			});
		},
	
		popup_message:function (html_message,clean){
			if(typeof(clean)==="undefined"){
				clean=false;
			}
			if($("#mess").length<=0){
				$('body').append('<div id="mess">');
			}
			$("#mess").html( (typeof html_message === 'string' || html_message instanceof String) ? html_message : html_message.html() );
			$( "#mess" ).dialog({
				autoOpen: true,
				resizable: false,
				width: 350,
				minHeight: 25,
				modal: true,
				draggable : false,
				create:function(){
					if(clean){
						$('.ui-dialog-titlebar').remove();
						$(".ui-dialog-buttonpane").remove();
					}
					$('body').css({overflow:"hidden"});
				},
				buttons:{
					Ok:function(){
						$( this ).dialog( "close" );
					}
				},
				close: function() {
					$('body').css({overflow:"auto"});
					$( "#mess" ).dialog( "destroy" );
					$( "#mess" ).remove();
				}
			});
		},
		
		add_item_popup:function (type,inlist,use,id){
			if(typeof(use)==="undefined"){ 
				use = ["new","list"];
			}
			if($("#drug_form").length===0){
				$("#staging").append("<div id='drug_form'><div id='drug_list'></div><div id='drug_item'></div></div>");
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
											$.chai.core.util.make_popup_datatable(type);
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
										$.chai.core.util.set_up_form(type,inlist,use);
										$.chai.core.util.activate_adverse_ui();
										
									},
									close: function() {
										$('body').css({overflow:"auto"});
										$( "#drug_form" ).dialog( "destroy" );
										$( "#drug_form" ).remove();
										
										$.chai.core.util.last_datatable=null;
									}
								});
								$(window).resize(function(){$("#drug_form" ).dialog('option', { width: $(window).width()-50,  height: $(window).height()-50,});
							});
						}
					});
				}
			});
		},
	
		moa_dmpk_setup:function (){
			$.each($('.has_moa_dmpk:not(.activated)'),function(){
				var tar = $(this);
				$(this).addClass('activated');
				var dep = tar.closest('.moa_dmpk_block').find('.moa_dmpk');
				if(tar.val()===""){
					dep.hide();
				}
				tar.on("keyup",function(){
					if(tar.val()===""){
						dep.find(':selected').attr('selected',false);
						dep.hide();
					}else{
						dep.show();
					}
				});
			});
		},

		apply_a_taxed_add:function (type,select_target,make_tax){
			$('a.tax_add').on('click',function(e){
				e.preventDefault();
				e.stopPropagation();
				$.chai.until.start_taxed_add(type,select_target,make_tax);
			});
		},
		start_taxed_add:function (type,select_target,make_tax){
	
			if(select_target==="undefined"){
				select_target = $($(this).data('select'));
			}
			if($( "#taxonomyitem" ).length<=0){
				$('body').append("<div id='taxonomyitem'>");
			}
			var dialog_obj = $("#taxonomyitem");
			if(type==="undefined"){
				type = $(this).data('type');
			}
	
			$.ajax({cache: false,
			   url:"/admin/edit_taxonomy.castle",
			   data:{"skiplayout":1,"type":type},
			   success: function(data){
					dialog_obj.html(data);
					dialog_obj.dialog({
						autoOpen: true,
						resizable: false,
						//width: $(window).width()*.40,
						//height: $(window).height()*.50,
						modal: true,
						draggable : false,
						create:function(){
							$('body').css({overflow:"hidden"});
							$("#taxonomyitem .ui-dialog-buttonpane").remove();
							dialog_obj.find('input[name$=".alias"]').closest('p').css({"display":"none"});
						},
						open:function(){
							$.chai.core.util.turnon_alias(dialog_obj.find('input[name$=".name"]'),dialog_obj.find('input[name$=".alias"]'));
							if(typeof(make_tax)==="undefined"){
								$.chai.core.util.make_a_tax_form(select_target,function(){
									$.chai.core.util.alais_scruber(dialog_obj.find('input[name$=".name"]'),dialog_obj.find('input[name$=".alias"]'));
								});
							}
							if(typeof(make_tax)==="function"){
								make_tax(select_target);
							}
							},
						close: function() {
							$('body').css({overflow:"auto"});
							$( "#taxonomyitem" ).dialog( "destroy" );
							$( "#taxonomyitem" ).remove();
							
						}
					});
					$(window).resize(function(){
						var w = $(window).width() * (0.25);
						var h = $(window).height() * (0.25);
						$("#taxonomyitem" ).dialog('option', { width: w,  height: h });
					});
				}
			});
		
		},
		make_tax_form:function (select_target,callback,secselect_target){
			var target_form = $("#taxonomyitem form");
			target_form.find('[type="submit"]').on("click",function(e){
				e.preventDefault();
				e.stopPropagation();
				$('#taxonomyitem form').on("change",function(){
					var test_empty = true;
					$.each($('input,select'),function(){
						if($(this).not(":hidden").val()!==""&&$(this).not(":hidden").find(":selected").val()!==""){
							test_empty = false;
						}
					});
					$('#taxonomyitem form input[name="empty"]').val(test_empty+"");
				});
		
				if(!target_form.find('input[name="empty"]').val()){
					if(typeof(callback)!=="undefined"){
						callback();
					}
					var form_data = target_form.find( "input, textarea, select" ).serializeArray();
					$.ajax({cache: false,
					   url:"/admin/update_taxonomy.castle?ajax=true",
					   data:form_data,
					   dataType : "json",
					   success: function(returndata){
							if(returndata.alias!==""){
								select_target.find('.add').before('<option value="'+ returndata.alias +'" '+(select_target.is(secselect_target)?"selected":"")+' >'+returndata.name +'</option>');
								$( "#taxonomyitem" ).dialog( "destroy" );
								$( "#taxonomyitem" ).remove();
								$.chai.core.util.popup_message($("<span><h5>You have added a  new taxonomy!</h5>It has also selected for you</span>"));
								$('form[name="entry_form"] :input:first').trigger("change");
							}else{
								$.chai.core.util.popup_message($("<span>failed to save, try again.</span>"));
							}
						}
					});
				}
			});
		},
		make_a_tax_form:function (select_target,callback){
			var target_form = $("#taxonomyitem form");
			
				$('#taxonomyitem form').on("change",function(){
					var test_empty = true;
					$.each($('input,select'),function(){
						if($(this).not(":hidden").val()!==""&&$(this).not(":hidden").find(":selected").val()!==""){
							test_empty = false;
						}
					});
					$('#taxonomyitem form input[name="empty"]').val(test_empty+"");
				});
			
			target_form.find('[type="submit"]').on("click",function(e){
				e.preventDefault();
				e.stopPropagation();
	
		
				if(!target_form.find('input[name="empty"]').val()){
					if(typeof(callback)==="function"){
						callback();
					}
					var form_data = target_form.find( "input, textarea, select" ).serializeArray();
	
					$.ajax({cache: false,
					   url:"/center/update_taxonomy.castle?ajax=true",
					   data:form_data,
					   dataType : "json",
					   success: function(returndata){
							if(returndata.alias!==""){
								if(typeof(select_target)==="function"){
									select_target(returndata);
								}
								
								if(typeof(select_target)!=="undefined" && typeof(select_target)!=="function"){
									select_target.find('option:first').before('<option value="'+ returndata.alias +'" >'+returndata.name +'</option>');
								}
								$( "#taxonomyitem" ).dialog( "destroy" );
								$( "#taxonomyitem" ).remove();
								$.chai.core.util.popup_message($("<span><h5>You have added a  new taxonomy!</h5>It has also selected for you</span>"));
								$('form[name="entry_form"] :input:first').trigger("change");
							}else{
								$.chai.core.util.popup_message($("<span>failed to save, try again.</span>"));
							}
						}
					});
				}
			});
		},
		apply_tax_request:function (){
			$.each($('.requested_taxed:not(.activated)'),function(){
				var tar = $(this);
				tar.addClass('activated');
				if(tar.find('.add').length<=0){
					tar.find('option:last').after('<option value="" class="add">Request new option</option>');
				}
			});
		
			$('.requested_taxed').on('change',function(){
					var select_target = $(this);
					var target = $(this).find('option:selected');
					if(!target.hasClass("add")){
						return;
					}
			
					target.removeAttr("selected");
					
					
					if($( "#taxonomyitem" ).length<=0){
						$('body').append("<div id='taxonomyitem'>");
					}
					var data='<h3>Make a request for a new item</h3><lable>Name:</lable><input type="text" value=""/><br/><br/><input type="submit" value="Subbmit Request"/>';
					var dialog_obj = $("#taxonomyitem");
						dialog_obj.html(data);
						dialog_obj.dialog({
								autoOpen: true,
								resizable: false,
								width: 450,
								//height: $(window).height()*.50,
								modal: true,
								draggable : false,
								create:function(){
									$('body').css({overflow:"hidden"});
									$(".ui-dialog-buttonpane").remove();
									dialog_obj.find('input[name$=".alias"]').closest('p').css({"display":"none"});
									$.chai.core.util.make_tax_form(select_target,function(){
										$.chai.core.util.alais_scruber(dialog_obj.find('input[name$=".name"]'),dialog_obj.find('input[name$=".alias"]'));
									});
								},
								open:function(){
									$.chai.core.util.turnon_alias(dialog_obj.find('input[name$=".name"]'),dialog_obj.find('input[name$=".alias"]'));
									},
								close: function() {
									$('body').css({overflow:"auto"});
									$( "#taxonomyitem" ).dialog( "destroy" );
									$( "#taxonomyitem" ).remove();
									
								}
							});
							
			});
		},
		apply_taxed_add:function (){
			/* add taxonomy */
			$.each($('.taxed:not(.activated)'),function(){
				var tar = $(this);
				tar.addClass('activated');
				if(tar.find('.add').length<=0){
					tar.find('option:last').after('<option value="" class="add">Add new option</option>');
				}
			});
			$('.taxed').on('change',function(){
				var select_target = $(this);
				var target = $(this).find('option:selected');
				if(!target.hasClass("add")){
					return;
				}
		
				target.removeAttr("selected");
				
				
				if($( "#taxonomyitem" ).length<=0){
					$('body').append("<div id='taxonomyitem'>");
				}
				var dialog_obj = $("#taxonomyitem");
				
				var secselect_target;
				var type = select_target.attr("rel")!=="" ? select_target.attr("rel") : select_target.attr("id");
				var attr=select_target.attr("rel");
				if (typeof attr !== typeof undefined && attr !== false) {
					secselect_target = $('[rel="'+type+'"]');
				}
				$.ajax({cache: false,
				   url:"/admin/edit_taxonomy.castle",
				   data:{"skiplayout":1,"type":type},
				   success: function(data){
						dialog_obj.html(data);
						dialog_obj.dialog({
								autoOpen: true,
								resizable: false,
								modal: true,
								draggable : false,
								create:function(){
									$('body').css({overflow:"hidden"});
									$(".ui-dialog-buttonpane").remove();
									dialog_obj.find('input[name$=".alias"]').closest('p').css({"display":"none"});
									$.chai.core.util.make_tax_form(select_target,function(){
										$.chai.core.util.alais_scruber(dialog_obj.find('input[name$=".name"]'),dialog_obj.find('input[name$=".alias"]'));
									},secselect_target);
								},
								open:function(){
									$.chai.core.util.turnon_alias(dialog_obj.find('input[name$=".name"]'),dialog_obj.find('input[name$=".alias"]'));
									},
								close: function() {
									$('body').css({overflow:"auto"});
									$( "#taxonomyitem" ).dialog( "destroy" );
									$( "#taxonomyitem" ).remove();
								}
							});
							$(window).resize(function(){$("#taxonomyitem" ).dialog('option', { width: $(window).width()*0.25,  height: $(window).height()*0.25,});																													
						});
					}
				});
			});
		},

		activate_adverse_ui:function (){
			
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
				$.chai.core.util.make_maskes();
			});
			controll_meta_items();
		},

		get_table_ids:function (datagrid){
			var inlist ="";
			var nNodes = datagrid.dataTable().fnGetNodes( );
			$.each(nNodes,function(i,v){
				var item = $(v).find('input.list_item');
				inlist+=(inlist===""?"":",")+item.val();
			});
			return inlist;
		},
		get_select_ids:function (select){
			var inlist ="";
			$.each(select.find('option'),function(){
				inlist+=(inlist===""?"":",")+$(this).val();
			});
			return inlist;
		},

		set_up_form:function (type){
			$.chai.core.util.make_maskes();
			$.chai.core.util.moa_dmpk_setup();
			$.chai.core.util.apply_tax_request();
			$.chai.core.util.apply_taxed_add();
			$.chai.core.util.setting_item_pub($(".ui-dialog"));
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
		},

		make_datatable_popup_add:function (datatable,type){
			$('.additem').off().on('click',function(e){
				e.preventDefault();
				e.stopPropagation();
				var trigger = $(this);
				var targetrow = trigger.closest('tr');
				var baseid = targetrow.data("baseid");
				
				var count = datatable.find("tbody").find("tr").length;
				
				var tdCount = targetrow.find("td").length;
				//alert(tdCount);
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
		},

		//var parent_datagrid = null;
		last_datatable:null,
		make_popup_datatable:function (type){
			$.each($('.datagrid:not(.dataTable)'),function(){
				var datatable = $(this);
				datatable.dataTable({ 
					"bJQueryUI": true,
					"sPaginationType": "full_numbers",
					"fnDrawCallback": function() {//(oSettings ) {
						$.chai.core.util.make_datatable_popup_add(datatable);
					}
				});
	
				$.chai.core.util.last_datatable=datatable;
				$.chai.core.util.make_datatable_popup_add(datatable,type);
			});
		},
		make_dataTables:function(){
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
							list = $.chai.core.util.get_table_ids( focused_grid );
						}
						$.chai.core.util.popup_message('<span style="font-size: 28px;"><i class="icon-spinner icon-spin icon-large"></i> loading ... </span>',true);
						$.chai.core.util.add_item_popup(type, list, ["new","list"]);
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
		},
	};

})(jQuery);

/*!
 * jQuery Cookie Plugin v1.4.0
 * https://github.com/carhartl/jquery-cookie
 *
 * Copyright 2013 Klaus Hartl
 * Released under the MIT license
 */
(function (factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as anonymous module.
		define(['jquery'], factory);
	} else {
		// Browser globals.
		factory(jQuery);
	}
}(function ($) {
	var pluses = /\+/g;
	function encode(s) {
		return config.raw ? s : encodeURIComponent(s);
	}
	function decode(s) {
		return config.raw ? s : decodeURIComponent(s);
	}
	function stringifyCookieValue(value) {
		return encode(config.json ? JSON.stringify(value) : String(value));
	}
	function parseCookieValue(s) {
		if (s.indexOf('"') === 0) {
			// This is a quoted cookie as according to RFC2068, unescape...
			s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
		}
		try {
			// Replace server-side written pluses with spaces.
			// If we can't decode the cookie, ignore it, it's unusable.
			s = decodeURIComponent(s.replace(pluses, ' '));
		} catch(e) {
			return;
		}
		try {
			// If we can't parse the cookie, ignore it, it's unusable.
			return config.json ? JSON.parse(s) : s;
		} catch(e) {}
	}
	function read(s, converter) {
		var value = config.raw ? s : parseCookieValue(s);
		return $.isFunction(converter) ? converter(value) : value;
	}
	var config = $.cookie = function (key, value, options) {
		// Write
		if (value !== undefined && !$.isFunction(value)) {
			options = $.extend({}, config.defaults, options);
			if (typeof options.expires === 'number') {
				var days = options.expires, t = options.expires = new Date();
				t.setDate(t.getDate() + days);
			}
			return (document.cookie = [
				encode(key), '=', stringifyCookieValue(value),
				options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
				options.path    ? '; path=' + options.path : '',
				options.domain  ? '; domain=' + options.domain : '',
				options.secure  ? '; secure' : ''
			].join(''));
		}
		// Read
		var result = key ? undefined : {};
		// To prevent the for loop in the first place assign an empty array
		// in case there are no cookies at all. Also prevents odd result when
		// calling $.cookie().
		var cookies = document.cookie ? document.cookie.split('; ') : [];
		for (var i = 0, l = cookies.length; i < l; i++) {
			var parts = cookies[i].split('=');
			var name = decode(parts.shift());
			var cookie = parts.join('=');
			if (key && key === name) {
				// If second argument (value) is a function it's a converter...
				result = read(cookie, value);
				break;
			}
			// Prevent storing a cookie that we couldn't decode.
			if (!key && (cookie = read(cookie)) !== undefined) {
				result[name] = cookie;
			}
		}
		return result;
	};
	config.defaults = {};
	$.removeCookie = function (key, options) {
		if ($.cookie(key) === undefined) {
			return false;
		}
		// Must not alter options, thus extending a fresh object...
		$.cookie(key, '', $.extend({}, options, { expires: -1 }));
		return !$.cookie(key);
	};
}));
(function($) {
  
  $.fn.areYouSure = function(options) {
      
    var settings = $.extend(
      {
        'message' : 'You have unsaved changes!',
        'dirtyClass' : 'dirty',
        'change' : null,
        'silent' : false,
        'addRemoveFieldsMarksDirty' : false,
        'fieldEvents' : 'change keyup propertychange input',
        'fieldSelector': ":input:not(input[type=submit]):not(input[type=button])"
      }, options);

    var getValue = function($field) {
      if ($field.hasClass('ays-ignore') || $field.hasClass('aysIgnore') || $field.attr('data-ays-ignore') || $field.attr('name') === undefined) {
        return null;
      }

      if ($field.is(':disabled')) {
        return 'ays-disabled';
      }

      var val;
      var type = $field.attr('type');
      if ($field.is('select')) {
        type = 'select';
      }

      switch (type) {
        case 'checkbox':
        case 'radio':
          val = $field.is(':checked');
          break;
        case 'select':
          val = '';
          $field.find('option').each(function() {
            var $option = $(this);
            if ($option.is(':selected')) {
              val += $option.val();
            }
          });
          break;
        default:
          val = $field.val();
      }

      return val;
    };

    var storeOrigValue = function($field) {
      $field.data('ays-orig', getValue($field));
    };

    var checkForm = function(evt) {

      var isFieldDirty = function($field) {
        var origValue = $field.data('ays-orig');
        if (undefined === origValue) {
          return false;
        }
        return (getValue($field) !== origValue);
      };

      var $form = ($(this).is('form')) ? $(this) : $(this).parents('form');

      // Test on the target first as it's the most likely to be dirty
      if (isFieldDirty($(evt.target))) {
        setDirtyStatus($form, true);
        return;
      }

      var $fields = $form.find(settings.fieldSelector);

      if (settings.addRemoveFieldsMarksDirty) {              
        // Check if field count has changed
        var origCount = $form.data("ays-orig-field-count");
        if (origCount !== $fields.length) {
          setDirtyStatus($form, true);
          return;
        }
      }

      // Brute force - check each field
      var isDirty = false;
      $fields.each(function() {
        var $field = $(this);
        if (isFieldDirty($field)) {
          isDirty = true;
          return false; // break
        }
      });
      
      setDirtyStatus($form, isDirty);
    };

    var initForm = function($form) {
      var fields = $form.find(settings.fieldSelector);
      $(fields).each(function() { storeOrigValue($(this)); });
      $(fields).unbind(settings.fieldEvents, checkForm);
      $(fields).bind(settings.fieldEvents, checkForm);
      $form.data("ays-orig-field-count", $(fields).length);
      setDirtyStatus($form, false);
    };

    var setDirtyStatus = function($form, isDirty) {
      var changed = isDirty !== $form.hasClass(settings.dirtyClass);
      $form.toggleClass(settings.dirtyClass, isDirty);
        
      // Fire change event if required
      if (changed) {
        if (settings.change){
			settings.change.call($form, $form);
		}

        if (isDirty){
			$form.trigger('dirty.areYouSure', [$form]);
		}
        if (!isDirty){
			$form.trigger('clean.areYouSure', [$form]);
		}
        $form.trigger('change.areYouSure', [$form]);
      }
    };

    var rescan = function() {
      var $form = $(this);
      var fields = $form.find(settings.fieldSelector);
      $(fields).each(function() {
        var $field = $(this);
        if (!$field.data('ays-orig')) {
          storeOrigValue($field);
          $field.bind(settings.fieldEvents, checkForm);
        }
      });
      // Check for changes while we're here
      $form.trigger('checkform.areYouSure');
    };

    var reinitialize = function() {
      initForm($(this));
    };

    if (!settings.silent && !window.aysUnloadSet) {
      window.aysUnloadSet = true;
      $(window).bind('beforeunload', function() {
        var $dirtyForms = $("form").filter('.' + settings.dirtyClass);
        if ($dirtyForms.length === 0) {
          return;
        }
        // Prevent multiple prompts - seen on Chrome and IE
        if (window.navigator.userAgent.toLowerCase().match(/msie|chrome/)) {
          if (window.aysHasPrompted) {
            return;
          }
          window.aysHasPrompted = true;
          window.setTimeout(function() {window.aysHasPrompted = false;}, 900);
        }
        return settings.message;
      });
    }

    return this.each(function() {
      if (!$(this).is('form')) {
        return;
      }
      var $form = $(this);
        
      $form.submit(function() {
        $form.removeClass(settings.dirtyClass);
      });
      $form.bind('reset', function() { setDirtyStatus($form, false); });
      // Add a custom events
      $form.bind('rescan.areYouSure', rescan);
      $form.bind('reinitialize.areYouSure', reinitialize);
      $form.bind('checkform.areYouSure', checkForm);
      initForm($form);
    });
  };
})(jQuery);







$.fn.hideOptionGroup = function() {
	$.each($(this),function(){
		var optgroup = $(this);
		var lable= optgroup.attr("label");
		var pname = optgroup.closest("select").attr("name");
		var pindex = $("select").index(optgroup.closest("select"));
		optgroup.attr("data-pname",pname);
		if($("."+lable+"_contaner_"+pindex).length<=0){
			$("body").append("<select style='position:absolute;top:-9999em;left:-9999em;' class='"+lable+"_contaner_"+pindex+"'><select>");
		}
		var hidden = $("."+lable+"_contaner_"+pindex);
		optgroup.children().each(function(){ $(this).removeAttr("selected"); });
		optgroup.appendTo(hidden);
	});
};

$.fn.showOptionGroup = function() {
	$.each($(this),function(){
		//var _lable=$(this).attr("label");
		var pname = $(this).data("pname");
		$(this).appendTo($( "select[name='"+pname+"']" ));
	});
};


// JavaScript Document

(function($) {
	$(document).ready(function() {
		
		$('#viewonly').change(function () {
			var state = $('#viewonly:checked').length;
			$.cookie('hivviewonly', state===1?"true":"false", { expires:1, path: '/' });
			//state = "viewonly="+state;
			window.location = window.location.href;//.split('?')[0]+"?"+state;
		});
		$( ".pubstate" ).buttonset();
		$('.pubstate.menuaction :radio').on('change',function () {
			$('.pubstate :radio').next("label").find("i").removeClass("icon-check-empty").removeClass("icon-check");
			$('.pubstate :radio').not(":checked").next("label").find("i").addClass("icon-check-empty");
			$('.pubstate :radio:checked').next("label").find("i").addClass("icon-check");
			var state = $('.pubstate :radio:checked').val();
			$.cookie('hivpubview', state===1?"true":"false", { expires:1, path: '/' });
			//state = "pub="+state;
			
			window.location = window.location.href.split('?')[0]+"?pub="+state;
		});
	
		$.chai.core.util.setting_item_pub($(".container"));

		if($(".message.ui-state-highlight").length){
			setTimeout(function(){ $(".message.ui-state-highlight").fadeOut(500); },2000);
		}


		
	});
})(jQuery);
$.chai.form_base = {
	ini:function(){

		$.chai.core.util.start_autoSaver();
		$.chai.core.util.moa_dmpk_setup();
		$.chai.core.util.make_maskes();
		$.chai.core.util.setup_refs();
		$.chai.core.util.apply_tax_request();
		$.chai.core.util.apply_taxed_add();
		$.chai.core.util.apply_a_taxed_add();
		$.chai.core.util.activate_adverse_ui();
		$.chai.core.util.make_dataTables();

		$('option.add_item').on('click',function(e){
			e.preventDefault();
			e.stopPropagation();
			$(this).attr('selected',false);
			$.chai.core.util.add_item_popup($(this).closest('select').data('type'),  $.chai.core.util.get_select_ids( $(this).closest('select') ) ,["new"]);
		});
		
		$('.inline_edit').on('click',function(e){
			e.preventDefault();
			e.stopPropagation();
			$.chai.core.util.popup_message('<span style="font-size: 28px;"><i class="icon-spinner icon-spin icon-large"></i> </span>',true);
			$.chai.core.util.add_item_popup($(this).data('type'),"",["new"], $(this).closest('tr').data('baseid') );
			
		});
	}
};
// JavaScript Document

$.chai.family = {
	ini:function(){
		$.chai.core.util.setup_viewlog();
		$.chai.form_base.ini();
		
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
							window.location = '/center/substance.castle';
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
			stop:function(){ $.chai.family.sortedCode(); }
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
					if($('[name="substances['+v.baseid+'].baseid"]').length<=0){
					html+="<span class='item i"+i+"' data-baseid='"+v.baseid+"' data-name='"+v.name+"' data-abbreviated='"+v.abbreviated+"'  ><i title='edit' class='icon-plus'></i>"+v.name+" ( "+v.abbreviated+" )<br/></span>";
					}
				});
				if(html === ""){
					html = "There are no substances to use.";	
				}
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
							html+="<span class='sortable_handle'>handle</span> "+par.data("name")+" (<span class='sub_code'>"+par.data("abbreviated")+"</span>)";
	
							html+="<input type='hidden' name='substances["+par.data("baseid")+"].baseid' value='"+par.data("baseid")+"' class='substance'/>";
							html+="<input type='hidden' name='family_substance["+par.data("baseid")+"].baseid' value='0'  class=''/>";
							html+="<input type='hidden' name='family_substance["+par.data("baseid")+"].family.baseid' value='"+$('[name="item.baseid"]').val()+"'  class=''/>";
							html+="<input type='hidden' name='family_substance["+par.data("baseid")+"].substance_order' value='"+$(".substance_item").length+"'  class='substanceOrder'/>";
							html+="<input type='hidden' name='family_substance["+par.data("baseid")+"].substance.baseid' value='"+par.data("baseid")+"'  class=''/>";
							html+="</li>";
	
							$(html).appendTo("#sortable");
							$("#sortable").sortable("refresh");
							$.chai.family.sortedCode();
							
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
		$.chai.family.sortedCode();
	
	
	
		
		$.each($('.drpro_table:not(".dataTable")'),function(){
			var self = $(this);
			self.DataTable({ 
				"bJQueryUI": true,
				"sPaginationType": "full_numbers", 
				"fnDrawCallback": function() {//(oSettings ) {
	
					$("#drpro_table").find('.drpro_table .dataTables_empty').html('No drug products available. <a href="#" class="add_drPro">Add <i title="edit" class="icon-plus"></i></a>');
					$("#drpro_table").find('.add_drPro').off().on("click",function(e){
						e.preventDefault();
						e.stopPropagation();
						$.chai.family.add_drProTableRow();
					});
					//$.chai.core.util.make_datatable_popup_add(datatable);
					
					$("#drpro_table").find('.removal').off().on("click",function(e){
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
		$('#add_lmic').on("click",function(e){
			e.preventDefault();
			e.stopPropagation();
			var dataTable = $('#LMICdata').find('.dataTable');
			var tableData = [];
			
			var count = $("#LMICdata tbody select").length;
			
			//var options=$('#dirty_options select').html();
			
			var html = '<input type="hidden" name="lmics['+(count)+'].id" value="0"/>';
			//tableData.push( html );
			tableData.push( html+'<input type="text" placeholder="label claim amount" name="item.lmics['+(count)+'].form"/>' );
			tableData.push( '<input type="checkbox" value="yes" name="lmics['+(count)+'].lmic_1l"/>' ); 
			tableData.push( '<input type="checkbox" value="yes" name="lmics['+(count)+'].lmic_2l"/>' ); 
			tableData.push( '<input type="checkbox" value="yes" name="lmics['+(count)+'].lmic_3l"/>' ); 
			tableData.push( '<input type="checkbox" value="yes" name="lmics['+(count)+'].tbd"/>' ); 
			tableData.push( '<a href="#" class="button xsmall crimson defocus removal"><i class="icon-remove" title="Remove"></i></a>' ); 
	
			
			dataTable.dataTable().fnAddData( tableData );
			
			$("#LMICdata tbody .removal").off().on("click",function(e){
				e.preventDefault();
				e.stopPropagation();
				var targetrow = $(this).closest("tr");
				var datatable = $(this).closest('.dataTable').dataTable();
				targetrow.fadeOut( "75" ,function(){ 
					datatable.fnDeleteRow( datatable.fnGetPosition( targetrow.get(0) ) );
				});
			});
		});
		
		$('#drug_interaction').on("click",function(e){
			e.preventDefault();
			e.stopPropagation();
			var dataTable = $('#ddi').find('.dataTable');
			var tableData = [];
			
			var count = $("#ddi tbody select").length;
			var options="<option value=''>Select</option>";//$('#dirty_options select').html();
			
			var html = '<input type="hidden" name="interactions['+(count)+'].id" value="0"/><select name="interactions['+(count)+'].substance">'+options+'</select>';
			tableData.push( html );
			
			html = '<select name="interactions['+(count)+'].yes_no"><option value="yes">Yes</option><option value="no">No</option></select>';
			tableData.push( html );
			
			html = '<input type="text" name="interactions['+(count)+'].dose_amount" value="" style="width:100%"/>';
			tableData.push( html );
			tableData.push( '<textarea placeholder="Describe the interaction between the two drugs" name="interactions['+(count)+'].descriptions"  rows="1"></textarea>' );
			tableData.push( '<a href="#" class="button xsmall crimson defocus removal"><i class="icon-remove" title="Remove"></i></a>' ); 
	
			
			dataTable.dataTable().fnAddData( tableData );
			
			$("#ddi tbody .removal").off().on("click",function(e){
				e.preventDefault();
				e.stopPropagation();
				var targetrow = $(this).closest("tr");
				var datatable = $(this).closest('.dataTable').dataTable();
				targetrow.fadeOut( "75" ,function(){ 
					datatable.fnDeleteRow( datatable.fnGetPosition( targetrow.get(0) ) );
				});
			});
		});
		
	},
	sortedCode:function(){
		$('.substance_item .icon-trash').off().on("click",function(){
			$(this).closest('.substance_item').fadeOut("fast",function(){
				$(this).remove();
				$.chai.family.sortedCode();
			});
		});
		var code="";
		$.each($(".substance_item"),function(i){
			code+= (code===""?"":"<em>:</em>") + $(this).find('.sub_code').text();
			$(this).find('.substanceOrder').val(i+1);
		});
		$("#sub_code").html(code);
	},
	add_drProTableRow:function(){
			var html = "";
			html+="<div id='drPro_additions' class='min'>";
				html+="<h4>Create new Drug</h4>";
					html+="<div id='create_drPros_stub' class='full-input'>";
						html+="<form action='/center/savedrug.castle' method='post'><input name='item.baseid' type='hidden' value='0'>";
							html+="<input type='hidden' name='item.families.substance_id' value='"+$("[name='item.baseid']").val()+"'/>";
							html+="form <input type='text' name='item.dose_form' value='' style='display: inline-block; max-width:50%;'/>";
							
							
							
							html+="<input type='hidden' name='item.attached' value='false'/>";
							html+="<label>Unit <select name='item.dose_unit' style='display: inline-block; max-width:50%;'><option value=''>Select Unit</option><option value='mg'>mg</option><option value='mg/ml'>mg/ml</option></select></label>";
							html+="<label>Amounts<br/>";
							$.each($(".substance_item"),function(){
								html+= "<span style='min-width:20%'>"+$(this).find('.sub_code').text()+":</span> <input type='text' class='sub_label_claim' style='width: auto; display: inline-block; max-width: 100%;' /><br/>";
							});
							html+="</label>";
							html+= "<input type='hidden' name='label_claim'/><br/>";
							html+="<label>Manufacturer<br/><select name='item.manufacturer' id='quick_drPro_manufacturer'><option value=''>Select</option></select><br/></label>";
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
					$(".ui-dialog-buttonset").prepend("<a href='#' id='create_drPros_stub_submit' class='button'>Add drug product stub</a>");
				},
				open:function(){
					$.getJSON('/center/get_taxonomies.castle?tax=commercial&callback=?',  function(data){
						var list="";
						$.each(data,function(i,v){
							list+="<option value='"+v.alias+"'>"+v.name+"</option>";
						});
						$('#quick_drPro_manufacturer').append(list);
					});
	
					$('#create_drPros_stub_submit').on("click",function(e){
						e.preventDefault();
						e.stopPropagation();
						
						var code = "";
						$.each($('.sub_label_claim'),function(i){
							if(i>0){
								code+=":";
							}
							code+=$.trim($(this).val());
						});	
						$('[name="label_claim"]').val(code);
						$('[name="label_claim"]').val(code);
						var form_data = $('#create_drPros_stub form').find( "input, textarea, select" ).serializeArray();
						
						$.ajax({cache: false,
						   url:$('#create_drPros_stub form').attr('action')+"?json=true&ajaxed_update=true&callback=?",
						   data:form_data,
						   dataType : "json",
						   success: function(returndata){
								if(returndata.baseid!==""){
									$.chai.core.util.popup_message($("<span><h5>You have added a new Durg Protuct!</h5> It was added to the table of products for the drug form.</span>"));
									$('#drpro_empty').remove();
									$('[href="#existing_drPros"]').trigger('click');
									$.each(returndata,function(i,v){
										var dataTable = $("#drpro_table").find('.dataTable');
										var tableData = [];
										
										var count = $(".drug_item.list_item").length;
										//var html = v.label_claim;//+ '<input type="hidden" name="drugs['+(count)+'].baseid" value="'+v.baseid+'" class="drug_item list_item"/><input type="hidden" name="drugs['+(count)+'].attached" value="1" class="drug_item list_item"/>';
										
										$.each(v.label_claim.split(':'),function(i,val){
											tableData.push(val);
										});
										
										//tableData.push( html );
										tableData.push( v.manufacturer ); 
										tableData.push( '<input type="hidden" name="drugs['+(count)+'].baseid" value="'+v.baseid+'" class="drug_item list_item"/><a href="#" class="button xsmall crimson defocus removal"><i class="icon-remove" title="Remove"></i></a>' ); 
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
									$.chai.core.util.popup_message($("<span>failed to save, try again.</span>"));
								}
							}
						});
					});
				},
				buttons:{
					Close:function(){
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
		
};
// JavaScript Document

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
// JavaScript Document

$.chai.reports = {
	ini:function(){
		$.chai.form_base.ini();
		if($('select[name^="property"],.property_selector').length){
			$("#types").on("change",function(){
	
				$.chai.reports.set_prop_sel($("#types").val());
	
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
					$.chai.reports.make_prop_select();
					$.chai.reports.re_index_query_items();
				});					   
			});
			$.chai.reports.make_prop_select();
			$.chai.reports.re_index_query_items();
			$.chai.reports.set_prop_sel($("#types").val());
		});
		$.chai.reports.make_prop_select();
		$('#start_save_query').on('click',function(e){
			e.preventDefault();
			e.stopPropagation();
			$('#to_save_query').slideDown();
			$('#start_save_query').slideUp();
		});
	},
	re_index_query_items:function (){
		$.each($(".query_item:not('#queryBed .query_item')"),function(i){
			$.each($(this).find("input:visible ,select:visible "),function(){
				//var name = $(this).attr('name');
				$(this).attr('name', $(this).attr('name').split('[')[0]+"["+i+"]");
			});
		});
	},
	make_prop_select:function(){
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
			$.chai.reports.re_index_query_items();
		});
	},
	set_prop_sel:function (val){
		$.each( $('form select.property_selector,form select[name="selected_properties"]') ,function(){
			$(this).find('option').attr("selected",false);
			$(this).find('optgroup').hideOptionGroup();
			var pname = $(this).closest('select').attr("name");
			$('optgroup.'+val+'s[data-pname="'+pname+'"]').showOptionGroup();
		});
	}

};
	
// JavaScript Document
$.chai.trial = {
	ini:function(){
		$.chai.core.util.setup_viewlog();
		$.chai.form_base.ini();
		
		$(".trial_arm_form").on("click",function(e){
			e.preventDefault();
			e.stopPropagation();
			$.chai.core.util.popup_message('<span style="font-size: 28px;"><i class="icon-spinner icon-spin icon-large"></i> Loading content...</span>',true);
			$.chai.trial.trial_arm_form();
		});
		$('.trial_inline_edit').on('click',function(e){
			e.preventDefault();
			e.stopPropagation();
			$.chai.core.util.popup_message('<span style="font-size: 28px;"><i class="icon-spinner icon-spin icon-large"></i> Loading content...</span>',true);
			$.chai.trial.trial_arm_form($(this).closest('tr').data('baseid'));
		});
	},
	trial_arm_form:function (id){
				if($("#trial_arm_form").length===0){
					$("#staging").append("<div id='trial_arm_form'></div>");
				}
				$.ajax({cache: false,
				   url:"/center/clinical.castle",
				   data:{"skiplayout":1,"id":typeof(id)==="undefined"?"":id,typed_ref:$('[name="typed_ref"]').val()},
				   success: function(data){
					   var trial_arm_form_dialog = $( "#trial_arm_form" );
						trial_arm_form_dialog.html(data);
						trial_arm_form_dialog.dialog({
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
								
								
								$('body').css({overflow:"hidden"});
								$(".ui-dialog-buttonpane").remove();
								/*
								$(".formstateaction").html($(".ui-dialog-buttonpane"));
								$(".ui-dialog-buttonpane:not(.formstateaction .ui-dialog-buttonpane)").remove();
								*/
								$.chai.clinical.ini();

								var tabContents = trial_arm_form_dialog.find(".tab_content").hide(), tabs = trial_arm_form_dialog.find("ul.tabs li");
								tabs.addClass("tabed");
								tabs.first().addClass("active").show();
								tabContents.first().show();
								
								tabs.on("click",function(e) { e.preventDefault(); e.stopPropagation();
									var $this = $(this), activeTab = $this.find('a').attr('href');
									
									if(!$this.hasClass('active')){
										$this.addClass('active').siblings().removeClass('active');
										tabContents.hide().filter(activeTab).fadeIn();
									} return false;
								});	
								$( ".uitabs" ).tabs();
		
		
								trial_arm_form_dialog.find('[name="item.trials.baseid"]').val($('.container [name="item.baseid"]').val());
		
								trial_arm_form_dialog.find("[type='submit']").on("click",function(e){
									
									var form = $(this).closest("form");
									if (form.find(':invalid').length<=0) {
										e.preventDefault();
										e.stopPropagation();
										$.chai.core.util.popup_message('<span style="font-size: 28px;"><i class="icon-spinner icon-spin icon-large"></i>Saving...</span>',true);
										$.post(form.attr("action")+"?skiplayout=1&ajaxed_update=1",form.serialize(),function(){//(data){
											//var parts= data.split(',');
											$( "#mess" ).dialog( "destroy" );
											$( "#mess" ).remove();
		
											var dataTable = $("#trial_arms.tab_content").find('.dataTable');
											var tableData = [];
		
											var html = form.find('[name="item.name"]').val();
											tableData.push( html );
											tableData.push( form.find('[name="item.name"]').val() );
											tableData.push( form.find('[name="item.name"]').val() ); 
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
											
											
											
											
											
											
											
											
											
											
											$( "#trial_arm_form" ).dialog( "destroy" );
											$( "#trial_arm_form" ).remove();
										});
									}
								});	
								
								//$.chai.core.util.set_up_form(type,inlist,use);
								//$.chai.core.util.activate_adverse_ui();
							},
							close: function() {
									$('body').css({overflow:"auto"});
									$( "#trial_arm_form" ).dialog( "destroy" );
									$( "#trial_arm_form" ).remove();
							}
						});
							$(window).resize(function(){$("#trial_arm_form" ).dialog('option', { width: $(window).width()-50,  height: $(window).height()-50,});
						});
					}
				});
		
			},
};
$.chai.trial_arm = {
	ini:function(){
		$.chai.core.util.setup_viewlog();
		$.chai.form_base.ini();
	},
};
// JavaScript Document

$.chai.clinical = {
	ini:function(){
		$.chai.core.util.setup_viewlog();
		$.chai.form_base.ini();
		
		$(".drug_pro_add_item").on('click',function(e){
			e.preventDefault();
			e.stopPropagation();
			
			if($("#drug_form").length===0){
				$("#staging").append("<div id='drug_form'><div id='drug_list'></div></div>");
			}
	
			var inlist="";
			$.ajax({cache: false,
			   url:"/center/drugs.castle",
			   data:{"skiplayout":1,"exclude":inlist,typed_ref:$('[name="typed_ref"]').val()},
			   success: function(data){
				   $("#drug_list").html(data);
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
								
								$('body').css({overflow:"hidden"});
								$(".ui-dialog-buttonpane").remove();
							},
							open:function(){
								
									var table = $("#drug_list #data").DataTable({ 
										"bJQueryUI": true,
										"sPaginationType": "full_numbers",
										"fnDrawCallback": function() {}
									});
									$.each($("#drug_list #data thead th"), function ( i ) {
										var select = $('<select><option value=""></option></select>')
											.appendTo( $(this) )
											.on( 'change', function () {
												var val = $(this).val();
								 
												table.column( i )
													.search( val, false, true, true )
													.draw();
											});
										table.column( i ).data().unique().sort().each( function ( d ) {
											select.append( '<option value="'+d+'">'+d+'</option>' );
										} );
									});	
									
									$('.additem').off().on('click',function(e){
										e.preventDefault();
										e.stopPropagation();
										var table = $("#drug_list #data").dataTable();
										var trigger = $(this);
										var targetrow = trigger.closest('tr');
										var baseid = targetrow.data("baseid");
										
										var count = table.find("tbody").find("tr").length;
										
										var tdCount = targetrow.find("td").length;
										var tableData = [];
										
										var html = targetrow.find("td:first").text() + '<input type="hidden" name="item.drugs['+(count-1)+'].baseid" value="'+baseid+'" class="drug_item list_item"/>';
										tableData.push( html );
										tableData.push( targetrow.find("td:first").next('td').text() ); 
										if(tdCount>2){
											tableData.push( targetrow.find("td:first").next('td').next('td').text() ); 
										}
										if(tdCount>3){
											tableData.push( targetrow.find("td:first").next('td').next('td').next('td').text() ); 
										}
										if(tdCount>4){
											tableData.push( targetrow.find("td:first").next('td').next('td').next('td').next('td').text() ); 
										}/**/
										tableData.push(
											'<a href="#" class="button xsmall crimson defocus removal"><i class="icon-remove" title="Remove"></i></a>'
										); 
							
										$("#drug_products").find(".datagrid").dataTable().fnAddData( tableData );
										
										targetrow.fadeOut( "75" ,function(){ table.fnDeleteRow( table.fnGetPosition( targetrow.get(0) ) ); });
										
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
								},
							close: function() {
								$('body').css({overflow:"auto"});
								$( "#drug_form" ).dialog( "destroy" );
								$( "#drug_form" ).remove();
							}
						});
						$(window).resize(function(){$("#drug_form" ).dialog('option', { width: $(window).width()-50,  height: $(window).height()-50,});
					});
				}
			});	
		});
		$('.show_fieldset').on('change',function(){
			var tar_area = $(this).closest('fieldset').find('ul');
			if(tar_area.is('.open')){
				tar_area.hide('fast',function(){
					tar_area.removeClass('open');
				});
			}else{
				tar_area.show('fast',function(){
					tar_area.addClass('open');
				});
			}
		});	
	}
};

// JavaScript Document

$.chai.drug = {
	ini:function(){
		$.chai.core.util.setup_viewlog();
		$.chai.form_base.ini();
		
		
		$("select[name*='inactive_ingredients[]']").on("change",function(){
			var sel="";
			$.each($(this).find(':selected'),function(i){
				sel+=(i>0?",":"")+$(this).val();
			});
			$("[name$='inactive_ingredients']").val(sel);
		});
		$(".claim_item").on("keyup",function(){
			var code="";
			$.each($(".claim_item"),function(){
				code+= (code===""?"":":") + $(this).val();
			});
			$("#item_label_claim").val(code);
			$("#CLAIM").text(code);
		});
		$.chai.markets.ini();
	}
};

// JavaScript Document

$.chai.substance = {
	ini:function(){
		$.chai.core.util.setup_viewlog();
		$.chai.form_base.ini();
		
		$('#add_substance_salt').on("click",function(e){
			e.preventDefault();
			e.stopPropagation();
			var dataTable = $('#Saltdata.dataTable');
			var tableData = [];
			
			var count = $("#Saltdata tbody select").length;
	
	
			var html = '<input type="hidden" name="salts['+(count)+'].id" value="0"/><select name="salts['+(count)+'].is_salt"><option value="Yes">Yes</option><option value="No">No</option></select>';
			tableData.push( html );
			tableData.push( '<input type="text" value="" name="salts['+(count)+'].form"/>' ); 
			tableData.push( '<a href="#" class="button xsmall crimson defocus removal"><i class="icon-remove" title="Remove"></i></a>' ); 
			
			dataTable.dataTable().fnAddData( tableData );
			
			$("#Saltdata tbody .removal").off().on("click",function(e){
				e.preventDefault();
				e.stopPropagation();
				var targetrow = $(this).closest("tr");
				var datatable = $(this).closest('.dataTable').dataTable();
				targetrow.fadeOut( "75" ,function(){ 
					datatable.fnDeleteRow( datatable.fnGetPosition( targetrow.get(0) ) );
				});
			});
		});	
	
			
		$('#add_substance_prodrug').on("click",function(e){
			e.preventDefault();
			e.stopPropagation();
			var dataTable = $('#Prodrugdata.dataTable');
			var tableData = [];
			
			var count = $("#Prodrugdata tbody select").length;
	
			var html = '<input type="hidden" name="prodrugs['+(count)+'].id" value="0"/>';//<select name="prodrugs['+(count)+'].pro_drug"><option value="Yes">Yes</option><option value="No">No</option></select>';
			//tableData.push( html );
			tableData.push( html+'<input type="text" value="" name="prodrugs['+(count)+'].active_moiety"/>' ); 
			tableData.push( '<input type="text" value="" name="prodrugs['+(count)+'].active_metabolites"/>' );
			tableData.push( '<a href="#" class="button xsmall crimson defocus removal"><i class="icon-remove" title="Remove"></i></a>' ); 
	
			
			dataTable.dataTable().fnAddData( tableData );
			
			$("#Prodrugdata tbody .removal").off().on("click",function(e){
				e.preventDefault();
				e.stopPropagation();
				var targetrow = $(this).closest("tr");
				var datatable = $(this).closest('.dataTable').dataTable();
				targetrow.fadeOut( "75" ,function(){ 
					datatable.fnDeleteRow( datatable.fnGetPosition( targetrow.get(0) ) );
				});
			});
		});
	}
};

// JavaScript Document

$.chai.reference = {
	ini:function(){
		$.chai.form_base.ini();
		$("#load_file").on("click",function(){
			$(".load_file").toggleClass("active");
			$(".load_file input").removeAttr("required");
			$(".load_file:visible input").attr("required",true);
		});
	}
};

(function($) {
	$.chai.ready=function (options){
		$(document).ready(function() {
			var page,location;
			location=window.location.pathname;
			page=location.substring(location.lastIndexOf("/") + 1);
			page=page.substring(0,page.lastIndexOf("."));
			if(typeof($.chai[page])!=="undefined"){
				$.chai[page].ini();
			}else{
				$.chai.core.util.make_dataTables();
			}
			return options;
		});
	};
	$.chai.ini();
})(jQuery);
