/*! inline 0.0.1 2014-06-29 */
/*   */
function alais_scruber(a,b){var c=a.val();c=c.split(" ").join("-"),c=c.split("&").join("-and-"),c=c.replace(/[^A-Za-z0-9\-_]/g,""),c=c.split("--").join("-"),c=c.split("__").join("_"),c=c.split("/").join(""),b.val(c.toLowerCase())}function turnon_alias(a,b){a.off().on("keyup",function(){alais_scruber(a,b)})}function make_maskes(){$.mask.definitions["~"]="[+-]",$('[type="date"],[rel="date"]').mask("99/99/9999",{completed:function(){}}),$("#tab_date").mask("9999",{completed:function(){}}),$("input").blur(function(){}).dblclick(function(){$(this).unmask()}),$("label i[title]").tooltip(),$('[type="date"],[rel="date"]').datepicker()}function popup_message(a,b){"undefined"==typeof b&&(b=!1),$("#mess").length<=0&&$("body").append('<div id="mess">'),$("#mess").html("string"==typeof a||a instanceof String?a:a.html()),$("#mess").dialog({autoOpen:!0,resizable:!1,width:350,minHeight:25,modal:!0,draggable:!1,create:function(){b&&($(".ui-dialog-titlebar").remove(),$(".ui-dialog-buttonpane").remove()),$("body").css({overflow:"hidden"})},buttons:{Ok:function(){$(this).dialog("close")}},close:function(){$("body").css({overflow:"auto"}),$("#mess").dialog("destroy"),$("#mess").remove()}})}function setting_item_pub(a){a.find(".pubstate").buttonset(),a.find(".pubstate :radio:checked").val()<1?a.find("#noting").next("label").show():a.find("#noting").next("label").hide(),a.find(".pubstate :radio").change(function(){a.find(".pubstate :radio").next("label").find("i").removeClass("icon-check-empty").removeClass("icon-check"),a.find(".pubstate :radio").not(":checked").next("label").find("i").addClass("icon-check-empty"),a.find(".pubstate :radio:checked").next("label").find("i").addClass("icon-check"),a.find(".pubstate :radio:checked").val()<1?a.find("#noting").next("label").show():a.find("#noting").next("label").hide(),a.find("#noting").next("label").find("i").addClass(""!==a.find(".notearea").find("textarea").val()?"icon-file-text-alt":"icon-file-alt")}),a.find("#noting").button(),a.find("#noting").change(function(){a.find(".notearea").dialog({autoOpen:!0,height:300,width:350,modal:!0,buttons:{"CLEAR Note":function(){$(this).find("textarea").val(""),$(this).dialog("close")},Accept:function(){$(this).dialog("close")},Cancel:function(){$(this).dialog("close")}},close:function(){a.find(".noted").find("label").removeClass("ui-state-active");var b=$(this).find("textarea").val();a.find("[name='item.content']").val(b),a.find("#noting").attr("checked",!1),a.find("#noting").next("label").find("i").removeClass("icon-file-text-alt").removeClass("icon-file-alt"),a.find("#noting").next("label").find("i").addClass(""!==b?"icon-file-text-alt":"icon-file-alt"),$(this).dialog("destroy")}})})}function sortedCode(){$(".substance_item .icon-trash").off().on("click",function(){$(this).closest(".substance_item").fadeOut("fast",function(){$(this).remove(),sortedCode()})});var a="";$.each($(".substance_item"),function(b){a+=(""===a?"":"<em>:</em>")+$(this).find(".sub_code").text(),$(".substanceOrder").val(b+1)}),$("#sub_code").html(a)}!function(a){"function"==typeof define&&define.amd?define(["jquery"],a):a(jQuery)}(function(a){function b(a){return h.raw?a:encodeURIComponent(a)}function c(a){return h.raw?a:decodeURIComponent(a)}function d(a){return b(h.json?JSON.stringify(a):String(a))}function e(a){0===a.indexOf('"')&&(a=a.slice(1,-1).replace(/\\"/g,'"').replace(/\\\\/g,"\\"));try{a=decodeURIComponent(a.replace(g," "))}catch(b){return}try{return h.json?JSON.parse(a):a}catch(b){}}function f(b,c){var d=h.raw?b:e(b);return a.isFunction(c)?c(d):d}var g=/\+/g,h=a.cookie=function(e,g,i){if(void 0!==g&&!a.isFunction(g)){if(i=a.extend({},h.defaults,i),"number"==typeof i.expires){var j=i.expires,k=i.expires=new Date;k.setDate(k.getDate()+j)}return document.cookie=[b(e),"=",d(g),i.expires?"; expires="+i.expires.toUTCString():"",i.path?"; path="+i.path:"",i.domain?"; domain="+i.domain:"",i.secure?"; secure":""].join("")}for(var l=e?void 0:{},m=document.cookie?document.cookie.split("; "):[],n=0,o=m.length;o>n;n++){var p=m[n].split("="),q=c(p.shift()),r=p.join("=");if(e&&e===q){l=f(r,g);break}e||void 0===(r=f(r))||(l[q]=r)}return l};h.defaults={},a.removeCookie=function(b,c){return void 0===a.cookie(b)?!1:(a.cookie(b,"",a.extend({},c,{expires:-1})),!a.cookie(b))}}),$.fn.hideOptionGroup=function(){$.each($(this),function(){var a=$(this),b=a.attr("label"),c=a.closest("select").attr("name"),d=$("select").index(a.closest("select"));a.attr("data-pname",c),$("."+b+"_contaner_"+d).length<=0&&$("body").append("<select style='position:absolute;top:-9999em;left:-9999em;' class='"+b+"_contaner_"+d+"'><select>");var e=$("."+b+"_contaner_"+d);a.children().each(function(){$(this).removeAttr("selected")}),a.appendTo(e)})},$.fn.showOptionGroup=function(){$.each($(this),function(){var a=$(this).data("pname");$(this).appendTo($("select[name='"+a+"']"))})},function(a){a(document).ready(function(){a("#viewonly").change(function(){var b=a("#viewonly:checked").length;a.cookie("hivviewonly",1===b?"true":"false",{expires:1,path:"/"}),window.location=window.location.href}),a(".pubstate").buttonset(),a(".pubstate.menuaction :radio").change(function(){a(".pubstate :radio").next("label").find("i").removeClass("icon-check-empty").removeClass("icon-check"),a(".pubstate :radio").not(":checked").next("label").find("i").addClass("icon-check-empty"),a(".pubstate :radio:checked").next("label").find("i").addClass("icon-check");var b=a(".pubstate :radio:checked").val();a.cookie("hivpubview",1===b?"true":"false",{expires:1,path:"/"}),window.location=window.location.href}),setting_item_pub(a(".container")),a(".message.ui-state-highlight").length&&setTimeout(function(){a(".message.ui-state-highlight").fadeOut(500)},2e3)})}(jQuery),$(document).ready(function(){function a(a){$.getJSON("/center/drugs.castle?json=true&callback=?",function(c){var d="";d+="<div id='drPro_additions' class='min'>",d+="<ul>",d+="<li><a href='#existing_drPros'>Existing</a></li>",d+="<li><a href='#create_drPros_stub'>Quick Create</a></li>",d+="</ul>",d+="<div class='tab_container'>",d+="<div id='existing_drPros'>";var e="";$.each(c,function(a,b){e+="<span class='item i"+a+"' data-baseid='"+b.baseid+"' data-name='"+b.name+"' data-alias='"+b.alias+"'  ><i title='edit' class='icon-plus'></i>"+b.name+" ( "+b.alias+" )</span><br/>"}),d+=""===e?"There are currently no drugs":e,d+="</div>",d+="<div id='create_drPros_stub'>",d+="<input type='hidden' name='quick_drPro[form]' value='"+a+"'/>",d+="<lable>Amount<input type='text' name='quick_drPro[amount]'/></label><br/>",d+="<lable>Manufacturer<select name='quick_drPro[manufacturer]' id='quick_drPro_manufacturer'><option value=''>Select</option></select></label>",d+="</div>",d+="</div>",d+="</div>",d+="<div class='clearfix'></div>",$("#form_list").length<=0&&$("body").append('<div id="form_list">'),$("#form_list").html(d),$("#form_list").dialog({autoOpen:!0,resizable:!1,width:350,minHeight:150,height:"auto",maxHeight:$(window).height(),modal:!0,draggable:!1,create:function(){$(".ui-dialog-titlebar").remove(),$("body").css({overflow:"hidden"})},open:function(){$("#drPro_additions").tabs(),$.getJSON("/center/get_taxonomies.castle?tax=commercial&callback=?",function(a){var b="";$.each(a,function(a,c){b+="<option value='"+c.alias+"'>"+c.name+"</option>"}),$("#quick_drPro_manufacturer").append(b)}),$(".item .icon-plus").on("click",function(){var a=$(this).closest("span").data("name"),c=$(this).closest("span").data("baseid"),d=$(this).closest("span").data("alias");b(a,c,d)})},buttons:{Ok:function(){$(this).dialog("close")}},close:function(){$("body").css({overflow:"auto"}),$("#form_list").dialog("destroy"),$("#form_list").remove()}})})}function b(b,g,h){var i="drPro_tabs_"+h+"_"+e,j=$(d.replace(/#\{href\}/g,"#"+i).replace(/#\{label\}/g,b).replace(/#\{baseid\}/g,g).replace(/#\{name\}/g,b).replace(/#\{alias\}/g,h));if($("[id^='drPro_tabs_"+h+"_']").length<=0){c.find(".ui-tabs-nav").prepend(j);var k=f;c.prepend("<div id='"+i+"'>"+k+"</div>"),c.tabs("refresh"),c.tabs("option","active",e),$('.drpro_table:not(".dataTable")').DataTable({bJQueryUI:!0,sPaginationType:"full_numbers",fnDrawCallback:function(){$("#"+i).find(".fg-toolbar .add_drPro").length<=0&&$("#"+i).find(".fg-toolbar.ui-widget-header:first").prepend('<a href="#" class="button add_drPro" style="float:left;">Add <i title="edit" class="icon-plus"></i></a>'),$("#"+i).find(".drpro_table .dataTables_empty").html("No "+b+' products available. <a href="#" class="add_drPro">Add <i title="edit" class="icon-plus"></i></a>'),$("#"+i).find(".add_drPro").off().on("click",function(b){b.preventDefault(),b.stopPropagation(),a(h)})}}),e++}}$("#sortable").sortable({handle:".sortable_handle",placeholder:"ui-state-highlight",stop:function(){sortedCode()}}),$("#famSubAdd").on("click",function(a){a.preventDefault(),a.stopPropagation(),$.getJSON("/center/substances.castle?json=true&callback=?",function(a){var b="";$.each(a,function(a,c){b+="<span class='item i"+a+"' data-baseid='"+c.baseid+"' data-name='"+c.name+"' data-lab_code='"+c.lab_code+"'  ><i title='edit' class='icon-plus'></i>"+c.name+" ( "+c.lab_code+" )</span><br/>"}),$("#substances_list").length<=0&&$("body").append('<div id="substances_list">'),$("#substances_list").html(b),$("#substances_list").dialog({autoOpen:!0,resizable:!1,width:350,minHeight:25,modal:!0,draggable:!1,create:function(){$(".ui-dialog-titlebar").remove(),$("body").css({overflow:"hidden"})},open:function(){$(".item .icon-plus").on("click",function(){var a=$(this).closest("span"),b="<li class='substance_item'>";b+="<i title='edit' class='icon-trash'></i>",b+="<span class='sortable_handle'>handle</span> "+a.data("name")+" (<span class='sub_code'>"+a.data("lab_code")+"</span>)",b+="<input type='hidden' name='substances["+a.data("baseid")+"].baseid' value='"+a.data("baseid")+"' class='substance'/>",b+="<input type='hidden' name='family_substance["+a.data("baseid")+"].baseid' value='0'  class=''/>",b+="<input type='hidden' name='family_substance["+a.data("baseid")+"].family.baseid' value='"+$('[name="item.baseid"]').val()+"'  class=''/>",b+="<input type='hidden' name='family_substance["+a.data("baseid")+"].substance_order' value='"+$(".substance_item").length+"'  class='substanceOrder'/>",b+="<input type='hidden' name='family_substance["+a.data("baseid")+"].substance.baseid' value='"+a.data("baseid")+"'  class=''/>",b+="</li>",$(b).appendTo("#sortable"),$("#sortable").sortable("refresh"),sortedCode()})},buttons:{Ok:function(){$(this).dialog("close")}},close:function(){$("body").css({overflow:"auto"}),$("#substances_list").dialog("destroy"),$("#substances_list").remove()}})})}),$("#famSubCode .icon-edit").on("click",function(){$("#subCodeEdit").is($(".open"))?$("#subCodeEdit").slideUp("slow",function(){$("#subCodeEdit").removeClass("open"),$("#subCodeEdit").addClass("closed")}):$("#subCodeEdit").slideDown("slow",function(){$("#subCodeEdit").addClass("open"),$("#subCodeEdit").removeClass("closed")})}),$("#subCodeEdit .icon-power-off").on("click",function(){$("#subCodeEdit").slideUp("slow",function(){$("#subCodeEdit").removeClass("open"),$("#subCodeEdit").addClass("closed")})}),sortedCode();var c=$("#drPro_tabed").tabs().addClass("ui-tabs-vertical ui-helper-clearfix");$("#drPro_tabed li").removeClass("ui-corner-top").addClass("ui-corner-left");var d="<li><a href='#{href}' data-baseid='#{baseid}' data-name='#{name}' data-alias='#{alias}'>#{label}</a> <i class='icon-remove'></i></li>",e=$("#drPro_tabed li").length,f='<table width="100%" class="drpro_table display" ellspacing="0"><thead><tr><th>Amt.</th><th>Manufacure</th><th>Actions</th></tr></thead><tfoot><tr><th></th><th></th><th></th></tr></tfoot><tbody></tbody></table>';c.delegate("i.icon-remove","click",function(){var a=$(this).closest("li").remove().attr("aria-controls");$("#"+a).remove(),c.tabs("refresh")}),$("#addDrugForm").on("click",function(a){return a.preventDefault(),a.stopPropagation(),$(".substance_item").length<=0?(alert("You must add substances before you can add drugs"),!1):void $.getJSON("/center/get_taxonomies.castle?tax=dose_type&callback=?",function(a){var c="";$.each(a,function(a,b){$("[id^='drPro_tabs_"+b.alias+"_']").length<=0&&(c+="<span class='item i"+a+"' data-baseid='"+b.baseid+"' data-name='"+b.name+"' data-alias='"+b.alias+"'  ><i title='edit' class='icon-plus'></i>"+b.name+" ( "+b.alias+" )</span><br/>")}),$("#form_list").length<=0&&$("body").append('<div id="form_list">'),$("#form_list").html(c),$("#form_list").dialog({autoOpen:!0,resizable:!1,width:350,minHeight:25,modal:!0,draggable:!1,create:function(){$(".ui-dialog-titlebar").remove(),$("body").css({overflow:"hidden"})},open:function(){$(".item .icon-plus").on("click",function(){var a=$(this).closest("span").data("name"),c=$(this).closest("span").data("baseid"),d=$(this).closest("span").data("alias");b(a,c,d)})},buttons:{Ok:function(){$(this).dialog("close")}},close:function(){$("body").css({overflow:"auto"}),$("#form_list").dialog("destroy"),$("#form_list").remove()}})})})}),function(a){a(document).ready(function(){var b=a("#tabed").tabs().addClass("ui-tabs-vertical ui-helper-clearfix");a(".ui-state-default span.ui-icon-close").on("click",function(){var c=a(this).closest("li").remove().attr("aria-controls");a("#"+c).remove(),b.tabs("refresh"),a.each(a('input[name^="markets_counts["]'),function(b){a(this).attr("name","markets_counts["+(b+1)+"]")})}),a("#tabed li").removeClass("ui-corner-top").addClass("ui-corner-left"),a("#newyear").button().on("click",function(){function c(){var c=d.val()||"Tab "+f,g="tabs-"+f,h=a(e.replace(/#\{href\}/g,"#"+g).replace(/#\{label\}/g,c));b.find(".ui-tabs-nav").append(h);var i=a("#querybed").html(),j=i.replace(/\{\{YEAR\}\}/g,c);j=j.replace(/\{\{COUNT\}\}/g,f+1).replace(/\{\{__\}\}/g,""),b.append("<div id='"+g+"'>"+j+"</div>"),b.tabs("refresh"),b.tabs("option","active",f),f++,a.each(a('input[name^="markets_counts["]'),function(b){a(this).attr("name","markets_counts["+(b+1)+"]")})}a("#marketdialog").length<=0&&a("body").append('<div id="marketdialog" title="Tab data"><form><fieldset class="ui-helper-reset"><label for="tab_title">Year</label><input type="number" name="tab_date" id="tab_date" value="" class="ui-widget-content ui-corner-all" /></fieldset></form></div>');var d=a("#tab_date"),e="<li><a href='#{href}'>#{label}</a> <span class='ui-icon ui-icon-close' role='presentation'>Remove Tab</span></li>",f=a("#tabed li").length,g=new Date,h=a("#marketdialog").dialog({autoOpen:!0,modal:!0,create:function(){make_maskes(),a("#tab_date").spinner({min:1980,max:g.getFullYear()+2,create:function(){a("#tab_date").spinner("value",g.getFullYear())},change:function(){a("#tab_date").val()>g.getFullYear()+2&&(a("#marketdialog").append('<p style="display:block; background-color:yellow; color:red; padding: 2px 5px;" id="yearWarning">You reached the max year. Reseting the year for you.</p>'),setTimeout(function(){a("#yearWarning").fadeOut(500)},2e3),a("#tab_date").val(g.getFullYear()+2))}})},buttons:{Add:function(){c(),a(this).dialog("close")},Cancel:function(){a(this).dialog("close")}},close:function(){i[0].reset()}}),i=h.find("form").submit(function(a){c(),h.dialog("close"),a.preventDefault()});b.delegate("span.ui-icon-close","click",function(){var c=a(this).closest("li").remove().attr("aria-controls");a("#"+c).remove(),b.tabs("refresh"),a.each(a('input[name^="markets_counts["]'),function(b){a(this).attr("name","markets_counts["+(b+1)+"]")})}),b.bind("keyup",function(c){if(c.altKey&&c.keyCode===a.ui.keyCode.BACKSPACE){var d=b.find(".ui-tabs-active").remove().attr("aria-controls");a("#"+d).remove(),b.tabs("refresh")}})})})}(jQuery),function(a){function b(){a.each(a(".has_moa_dmpk:not(.activated)"),function(){var b=a(this);a(this).addClass("activated");var c=b.closest(".moa_dmpk_block").find(".moa_dmpk");""===b.val()&&c.hide(),b.on("keyup",function(){""===b.val()?(c.find(":selected").attr("selected",!1),c.hide()):c.show()})})}function c(){a.each(a(".query_item:not('#queryBed .query_item')"),function(b){a.each(a(this).find("input:visible ,select:visible "),function(){a(this).attr("name",a(this).attr("name").split("[")[0]+"["+b+"]")})})}function d(){a(".property_selector").off().on("change",function(){var b=a(this).val(),d=a(this).closest(".query_item");d.find(".input_box input,.input_box select").removeAttr("name"),d.find(".input_box [name*=value]").val(""),d.find(".input_box").removeClass("showen"),d.find(".input_box."+b).addClass("showen"),d.find(".input_box:visible").length<=0&&d.find(".input_box.gen").addClass("showen"),d.find(".input_box:visible input,.input_box:visible select").attr("name","value[9999]"),c()})}function e(b){a.each(a('form select.property_selector,form select[name="selected_properties"]'),function(){a(this).find("option").attr("selected",!1),a(this).find("optgroup").hideOptionGroup();var c=a(this).closest("select").attr("name");a("optgroup."+b+'s[data-pname="'+c+'"]').showOptionGroup()})}function f(){a.each(a(".requested_taxed:not(.activated)"),function(){var b=a(this);b.addClass("activated"),b.find(".add").length<=0&&b.find("option:last").after('<option value="" class="add">Request new option</option>')}),a(".requested_taxed").on("change",function(){var b=a(this),c=a(this).find("option:selected");if(c.hasClass("add")){c.removeAttr("selected"),a("#taxonomyitem").length<=0&&a("body").append("<div id='taxonomyitem'>");var d='<h3>Make a request for a new item</h3><lable>Name:</lable><input type="text" value=""/><br/><br/><input type="submit" value="Subbmit Request"/>',e=a("#taxonomyitem");e.html(d),e.dialog({autoOpen:!0,resizable:!1,width:450,modal:!0,draggable:!1,create:function(){a("body").css({overflow:"hidden"}),a(".ui-dialog-buttonpane").remove(),e.find('input[name$=".alias"]').closest("p").css({display:"none"}),j(b,function(){alais_scruber(e.find('input[name$=".name"]'),e.find('input[name$=".alias"]'))})},open:function(){turnon_alias(e.find('input[name$=".name"]'),e.find('input[name$=".alias"]'))},close:function(){a("body").css({overflow:"auto"}),a("#taxonomyitem").dialog("destroy"),a("#taxonomyitem").remove()}})}})}function g(){a.each(a(".taxed:not(.activated)"),function(){var b=a(this);b.addClass("activated"),b.find(".add").length<=0&&b.find("option:last").after('<option value="" class="add">Add new option</option>')}),a(".taxed").on("change",function(){var b=a(this),c=a(this).find("option:selected");if(c.hasClass("add")){c.removeAttr("selected"),a("#taxonomyitem").length<=0&&a("body").append("<div id='taxonomyitem'>");var d,e=a("#taxonomyitem"),f=b.attr(""!==b.attr("rel")?"rel":"id");b.attr("rel").length&&(d=a('[rel="'+f+'"]')),a.ajax({cache:!1,url:"/admin/edit_taxonomy.castle",data:{skiplayout:1,type:f},success:function(c){e.html(c),e.dialog({autoOpen:!0,resizable:!1,modal:!0,draggable:!1,create:function(){a("body").css({overflow:"hidden"}),a(".ui-dialog-buttonpane").remove(),e.find('input[name$=".alias"]').closest("p").css({display:"none"}),j(b,function(){alais_scruber(e.find('input[name$=".name"]'),e.find('input[name$=".alias"]'))},d)},open:function(){turnon_alias(e.find('input[name$=".name"]'),e.find('input[name$=".alias"]'))},close:function(){a("body").css({overflow:"auto"}),a("#taxonomyitem").dialog("destroy"),a("#taxonomyitem").remove()}}),a(window).resize(function(){a("#taxonomyitem").dialog("option",{width:.25*a(window).width(),height:.25*a(window).height()})})}})}})}function h(c){make_maskes(),b(),f(),g(),setting_item_pub(a(".ui-dialog")),a('input[name^="post"]').val(a('input[name="item.baseid"]').val()),a("#load_file").on("click",function(){a(".load_file").toggleClass("active")}),a("#drug_form [type='submit']").on("click",function(b){var d=a(this).closest("form");d.find(":invalid").length<=0&&(b.preventDefault(),b.stopPropagation(),a.post(d.attr("action")+"?skiplayout=1&ajaxed_update=1",d.serialize(),function(){a("#drug_form").dialog("destroy"),a("#drug_form").remove(),a(".add_to_list[data-type='"+c+"']").trigger("click")}))})}function i(b,c,d,e){"undefined"==typeof d&&(d=["new","list"]),0===a("#drug_form").length&&a("#staging").append("<div id='drug_form'><div id='drug_list'></div><div id='drug_item'></div>");var f="";a.ajax({cache:!1,url:"/center/"+b+"s.castle",data:{skiplayout:1,exclude:c,typed_ref:a('[name="typed_ref"]').val()},success:function(g){a.inArray("list",d)>-1&&(a("#drug_list").html(g),f+="<a href='#drug_list' id='drug_list_tab' class='popuptab button med active'>List</a>"),a.ajax({cache:!1,url:"/center/"+b+".castle",data:{skiplayout:1,id:"undefined"==typeof e?"":e,typed_ref:a('[name="typed_ref"]').val()},success:function(e){a.inArray("new",d)>-1&&(a("#drug_item").html(e),f+="<a href='#drug_item' id='drug_item_tab' class='popuptab button med'>New</a>"),a("#drug_form").dialog({autoOpen:!0,resizable:!1,width:a(window).width()-50,height:a(window).height()-50,modal:!0,draggable:!1,buttons:{Cancel:function(){a(this).dialog("close")}},create:function(){a("#mess").dialog("destroy"),a("#mess").remove(),""!==a("#drug_item").html()&&""!==a("#drug_list").html()&&(a("#drug_form").closest(".ui-dialog").find(".ui-dialog-title").append(f),a("#drug_item").hide()),a("body").css({overflow:"hidden"}),a(".ui-dialog-buttonpane").remove(),a("#drug_list").html().length>0&&q(b),a(".popuptab").off().on("click",function(b){b.preventDefault(),b.stopPropagation();var c=a(".popuptab.active").attr("href");a(c).hide(),a(".popuptab.active").removeClass("active"),a(this).addClass("active"),c=a(this).attr("href"),a(c).show()}),h(b,c,d),m()},close:function(){a("body").css({overflow:"auto"}),a("#drug_form").dialog("destroy"),a("#drug_form").remove(),r=null}}),a(window).resize(function(){a("#drug_form").dialog("option",{width:a(window).width()-50,height:a(window).height()-50})})}})}})}function j(b,c,d){var e=a("#taxonomyitem form");e.find('[type="submit"]').on("click",function(f){if(f.preventDefault(),f.stopPropagation(),a("#taxonomyitem form").on("change",function(){var b=!0;a.each(a("input,select"),function(){""!==a(this).not(":hidden").val()&&""!==a(this).not(":hidden").find(":selected").val()&&(b=!1)}),a('#taxonomyitem form input[name="empty"]').val(b+"")}),!e.find('input[name="empty"]').val()){"undefined"!=typeof c&&c();var g=e.find("input, textarea, select").serializeArray();a.ajax({cache:!1,url:"/admin/update_taxonomy.castle?ajax=true",data:g,dataType:"json",success:function(c){""!==c.alias?(b.find(".add").before('<option value="'+c.alias+'" '+(b.is(d)?"selected":"")+" >"+c.name+"</option>"),a("#taxonomyitem").dialog("destroy"),a("#taxonomyitem").remove(),popup_message(a("<span><h5>You have added a  new taxonomy!</h5>It has also selected for you</span>")),a('form[name="entry_form"] :input:first').trigger("change")):popup_message(a("<span>failed to save, try again.</span>"))}})}})}function k(){a("a.tax_add").on("click",function(b){b.preventDefault(),b.stopPropagation();var c=a(a(this).data("select"));a("#taxonomyitem").length<=0&&a("body").append("<div id='taxonomyitem'>");var d=a("#taxonomyitem"),e=a(this).data("type");a.ajax({cache:!1,url:"/admin/edit_taxonomy.castle",data:{skiplayout:1,type:e},success:function(b){d.html(b),d.dialog({autoOpen:!0,resizable:!1,modal:!0,draggable:!1,create:function(){a("body").css({overflow:"hidden"}),a(".ui-dialog-buttonpane").remove(),d.find('input[name$=".alias"]').closest("p").css({display:"none"}),l(c,function(){alais_scruber(d.find('input[name$=".name"]'),d.find('input[name$=".alias"]'))})},open:function(){turnon_alias(d.find('input[name$=".name"]'),d.find('input[name$=".alias"]'))},close:function(){a("body").css({overflow:"auto"}),a("#taxonomyitem").dialog("destroy"),a("#taxonomyitem").remove()}}),a(window).resize(function(){var b=.25*a(window).width(),c=.25*a(window).height();a("#taxonomyitem").dialog("option",{width:b,height:c})})}})})}function l(b,c){var d=a("#taxonomyitem form");d.find('[type="submit"]').on("click",function(e){if(e.preventDefault(),e.stopPropagation(),a("#taxonomyitem form").on("change",function(){var b=!0;a.each(a("input,select"),function(){""!==a(this).not(":hidden").val()&&""!==a(this).not(":hidden").find(":selected").val()&&(b=!1)}),a('#taxonomyitem form input[name="empty"]').val(b+"")}),!d.find('input[name="empty"]').val()){"undefined"!=typeof c&&c();var f=d.find("input, textarea, select").serializeArray();a.ajax({cache:!1,url:"/admin/update_taxonomy.castle?ajax=true",data:f,dataType:"json",success:function(c){""!==c.alias?(b.find("option:first").before('<option value="'+c.alias+'" >'+c.name+"</option>"),a("#taxonomyitem").dialog("destroy"),a("#taxonomyitem").remove(),popup_message(a("<span><h5>You have added a  new taxonomy!</h5>It has also selected for you</span>")),a('form[name="entry_form"] :input:first').trigger("change")):popup_message(a("<span>failed to save, try again.</span>"))}})}})}function m(){function b(){a(".remove").hover(function(){a(this).removeClass("red")},function(){a(this).addClass("red")}),a(".remove").on("click",function(){var b=a(this).closest("li"),c=b.find('[name^="option"]').val();a(".adverse_events option[value='"+c+"']").removeAttr("disabled"),b.fadeOut(function(){a(this).remove()})}),c()}function c(){a.each(a(".adverse_events").closest("ul").find("li[data-taxorder]"),function(b){a(this).data("taxorder",b),a.each(a(this).find("input,select:not([name=''])"),function(){a(this).attr("name",a(this).attr("name").split("[")[0]+"["+b+"]")})})}a(".adverse_events").on("change",function(){var d=a(this).val(),e=a(this).find('option[value="'+d+'"]'),f=a(this).closest("ul"),g=e.data("baseid"),h=e.data("content"),i=e.data("alias"),j="none"===i?"":"required";f.append('<li data-taxorder="9999" data-name="'+e.val()+'"><i class="icon-remove-circle red right remove"></i><label>'+e.text()+' <i class="icon-question-sign blue" title="'+h+'"></i></label><input type="'+("none"===i?"hidden":"text")+'" name="value[9999]" id="" '+j+' value=""/><input type="hidden" name="option_key[9999]" value="'+g+'" /></li>'),e.attr("disabled",!0),a(this).val(""),b(),c(),make_maskes()}),b()}function n(b){var c="",d=b.dataTable().fnGetNodes();return a.each(d,function(b,d){var e=a(d).find("input.list_item");c+=(""===c?"":",")+e.val()}),c}function o(b){var c="";return a.each(b.find("option"),function(){c+=(""===c?"":",")+a(this).val()}),c}function p(b,c){a(".additem").off().on("click",function(d){d.preventDefault(),d.stopPropagation();var e=a(this),f=e.closest("tr"),g=f.data("baseid"),h=b.find("tbody").find("tr").length,i=f.find("td").length;alert(i);var j=[],k=f.find("td:first").text()+'<input type="hidden" name="item.'+c+"s["+(h-1)+'].baseid" value="'+g+'" class="drug_item list_item"/>';j.push(k),j.push(f.find("td:first").next("td").text()),i>3&&j.push(f.find("td:first").next("td").next("td").text()),j.push('<a href="#" class="button xsmall crimson defocus removal"><i class="icon-remove" title="Remove"></i></a>'),a("[data-active_grid='true']").dataTable().fnAddData(j),f.fadeOut("75",function(){b.fnDeleteRow(b.fnGetPosition(f.get(0)))}),a("#drug_form").append("<span class='dialog_message ui-state-highlight'>Added to this "+a("#header_title").text()+"</span>"),setTimeout(function(){a(".dialog_message").fadeOut("500")},"1000"),a("ul .display.datagrid.dataTable .removal").off().on("click",function(b){b.preventDefault(),b.stopPropagation();var c=a(this).closest("tr"),d=a(this).closest(".datagrid").dataTable();c.fadeOut("75",function(){d.fnDeleteRow(d.fnGetPosition(c.get(0)))})})})}function q(b){a.each(a(".datagrid:not(.dataTable)"),function(){var c=a(this);c.dataTable({bJQueryUI:!0,sPaginationType:"full_numbers",fnDrawCallback:function(){p(c)}}),r=c,p(c,b)})}var r=null;a(document).ready(function(){a("select[name*='inactive_ingredients[]']").on("change",function(){var b="";a.each(a(this).find(":selected"),function(c){b+=(c>0?",":"")+a(this).val()}),a("[name$='inactive_ingredients']").val(b)}),a("#start_save_query").on("click",function(b){b.preventDefault(),b.stopPropagation(),a("#to_save_query").slideDown(),a("#start_save_query").slideUp()}),b(),make_maskes(),a(".add_ref").length&&a(".add_ref").on("click",function(b){b.preventDefault(),b.stopPropagation();var c=a(this).closest(".datagrid").dataTable({aaSorting:[[1,"asc"]]});c.dataTable().fnAddData(['<input type="hidden" name="item.references[$count].baseid" value="$part.baseid" class="drug_item"/>$part.type','<a href="$item.url" class="ref_link"><i class="icon-external-link"></i></a>',"$item.note",'<a href="substance.castle?id=$part.baseid" class="button small inline_edit" data-type="substance">Edit</a> | <a href="#" class="button xsmall crimson defocus removal">Remove</a>'])}),a('select[name^="property"],.property_selector').length&&a("#types").on("change",function(){e(a("#types").val()),a(".input_box").removeClass("showen"),a(".input_box.gen").addClass("showen"),a(".input_box [name*=value]").val("")}).trigger("change"),a("#ADD_query").on("click",function(b){b.preventDefault(),b.stopPropagation(),a(".query_item:not('#queryBed .query_item')").last().after(a("#queryBed").html()),a(".REMOVE_query").off().on("click",function(b){b.preventDefault(),b.stopPropagation(),a(this).closest(".query_item").fadeOut("150",function(){a(this).remove(),d(),c()})}),d(),c(),e(a("#types").val())}),d(),a("#load_file").on("click",function(){a(".load_file").toggleClass("active"),a(".load_file input").removeAttr("required"),a(".load_file:visible input").attr("required",!0)}),a('form[name="entry_form"] :input').on("change",function(){var b=!0;a.each(a("input,select"),function(){""!==a('form[name="entry_form"] :input').not(":hidden").val()&&(b=!1)}),a('input[name="empty"]').val(b+"")});var h=!0,j=!1;if(a('form[name="entry_form"] [type="submit"]').on("click",function(){var b=a(this);return"true"!==a('input[name="empty"]').val()||j||h||(a("#message").length<=0&&a("body").append("<div id='message'>"),a("#message").html("The form is empty, are you sure you want to add the record?"),a("#message").dialog({autoOpen:!0,resizable:!1,width:350,height:200,modal:!0,draggable:!1,buttons:{Cancel:function(){a(this).dialog("close")},Ok:function(){a(this).dialog("close"),j=!0,b.trigger("click")}},create:function(){a("body").css({overflow:"hidden"})},close:function(){a("body").css({overflow:"auto"}),a("#message").dialog("destroy"),a("#message").remove()}})),"true"!==a('input[name="empty"]').val()||j||h?!0:!1}),f(),g(),k(),m(),a(".datagrid").length){var l=a(".datagrid");a.each(l,function(){var b=a(this);b.dataTable({bJQueryUI:!0,sPaginationType:"full_numbers",aaSorting:[[1,"asc"]]})});var p=a(".add_to_list");a.each(p,function(){var b=a(this);b.on("click",function(b){b.preventDefault(),b.stopPropagation();var c=a(this),d=c.data("type"),e=c.prev(".dataTables_wrapper").find(".datagrid");a("[data-active_grid='true']").attr("data-active_grid",!1),e.attr("data-active_grid",!0);var f="";e.find(".dataTables_empty").length<=0&&(f=n(e)),popup_message('<span style="font-size: 28px;"><i class="icon-spinner icon-spin icon-large"></i> Loading content...</span>',!0),i(d,f,["new","list"])})});var q=a(".display.datagrid.dataTable .removal");a.each(q,function(){var b=a(this);b.on("click",function(b){b.preventDefault(),b.stopPropagation();var c=a(this),d=c.closest("tr"),e=c.closest(".datagrid").dataTable();d.fadeOut("75",function(){var a=d.get(0);e.fnDeleteRow(e.fnGetPosition(a))})})})}a("option.add_item").on("click",function(b){b.preventDefault(),b.stopPropagation(),a(this).attr("selected",!1),i(a(this).closest("select").data("type"),o(a(this).closest("select")),["new"])}),a(".inline_edit").on("click",function(b){b.preventDefault(),b.stopPropagation(),popup_message('<span style="font-size: 28px;"><i class="icon-spinner icon-spin icon-large"></i> Loading content...</span>',!0),i(a(this).data("type"),"",["new"],a(this).closest("tr").data("baseid"))})})}(jQuery);