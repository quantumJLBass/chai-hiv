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
							$.chai.core.util.close_dialog_modle($( "#view_log_area" ));
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
					'$part.baseid',
					'<input type="hidden" name="references[$count].baseid" value="$part.baseid" class="drug_item"/>$part.type',
					'$part.name',
					'<a href="$item.url" class="ref_link"><i class="icon-external-link"></i></a>',
					'$item.note',
					'<a href="substance.castle?id=$part.baseid" class="button small inline_edit" data-type="substance">Edit</a> | <a href="#" class="button xsmall crimson defocus removal">Remove</a>' ]
				);
				$.chai.core.util.setup_ref_copy();
			});
		},
		setup_ref_copy:function(){
			$.each($(".ref_text:not(.cp_ready)"),function(){
				var ref_btn = this;
				$(ref_btn).on('click',function(e){
					e.preventDefault();
					e.stopPropagation();
				});
				var client = new ZeroClipboard( ref_btn );
				client.on( "ready", function(  ) {
					$(ref_btn).addClass("cp_ready");
					client.on( "aftercopy", function( event ) {
						alert("Copied text to clipboard: " + event.data["text/plain"] );
					});
				});
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
									$.chai.core.util.close_dialog_modle($( "#drug_form" ));
									$.chai.core.util.last_datatable=null;
								}
							});
							$.chai.core.util.set_diamodle_resizing($( "#drug_form" ));	
						}
					});
				}
			});
		},
		set_diamodle_resizing:function(jObj){
			$(window).resize(function(){
				jObj.dialog('option', {
					width: $(window).width()-50,
					height: $(window).height()-50
				});
			});
		},
		close_dialog_modle: function(jObj){
			jObj.dialog( "destroy" );
			jObj.remove();
			if($(".ui-dialog.ui-widget.ui-widget-content").length<=0){
				$('body').css({overflow:"auto"});
			}
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
							$.chai.core.util.close_dialog_modle($( "#taxonomyitem" ));
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
									$.chai.core.util.close_dialog_modle($( "#taxonomyitem" ));
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
									$.chai.core.util.close_dialog_modle($( "#taxonomyitem" ));
								}
							});
						$(window).resize(function(){
							$("#taxonomyitem" ).dialog('option', { width: $(window).width()*0.25,  height: $(window).height()*0.25,});																													
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
				if(type==="reference"){
					count=count+1;
				}
				var tdCount = targetrow.find("td").length;
				//alert(tdCount);
				var tableData = [];
				var name = (type==="reference"?"":"item.")+type+'s['+(count-1)+'].baseid';
				var html = targetrow.find("td:first").text() + '<input type="hidden" name="'+name+'" value="'+baseid+'" class="drug_item list_item"/>';
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
						$.chai.core.util.make_datatable_popup_add(datatable,type);
					}
				});
	
				$.chai.core.util.last_datatable=datatable;
				$.chai.core.util.make_datatable_popup_add(datatable,type);
			});
		},
		make_dataTables:function(){
			if($('.datagrid:not(.dataTable)').length){
				var datagrids = $('.datagrid:not(.dataTable)');
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
			}
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
			},
	};

})(jQuery);
