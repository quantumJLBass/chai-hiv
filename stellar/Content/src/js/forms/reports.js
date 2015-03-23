// JavaScript Document
(function($) {
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
})(jQuery);	