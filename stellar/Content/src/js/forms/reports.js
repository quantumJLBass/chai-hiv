// JavaScript Document

	$.chai.reports = {
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
