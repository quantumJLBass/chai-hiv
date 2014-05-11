
function openImgResource(ed,uploadOnly){
	
	var width = $(window).width();
	var height = $(window).height();
	width = width - 50;
	height = height - 150; 
	
	$(window).resize(function(){$("#dialog-pickimage" ).dialog('option', { width: $(window).width()-10,  height: $(window).height()-10,});})
	
	
	
	if(typeof(uploadonly)==='undefined'){uploadonly=false;}
	if($('#dialog-pickimage').length==0){$('body').append('<div id="dialog-pickimage">')}
	$('#dialog-pickimage').dialog("resize", "auto"); 
	$( "#dialog-pickimage" ).dialog({
		resizable: false,
		width: $(window).width()-10,
        height: $(window).height()-10,
		modal: true,
		position:['center','center'] ,
		title:'Insert Media',
		close:function(){
				$( "#dialog-pickimage" ).dialog( "destroy" );
				$( "#dialog-pickimage" ).remove();
		},
		create: function(event, ui) {
				$('#dialog-pickimage').html(function(){
					var optional='<option value="">Choose Image</option>';
								var i=0;			
							for (var image in tinyMCEImageList) {
								var node=tinyMCEImageList[image];
									var name=node.name;
									var image_id=node.id;
									optional+='<option value="'+image_id+'">'+name+'</option>';
							}
					var HTML  ='<div id="imgPre"></div><h3 ><span class="ui-icon ui-icon-image" style="    float: left;margin: 0 4px;"></span>Place images</h3><select id="imagePicker">'+optional+'</select>';
						HTML += '<h3 id="inlinePlaceImageUpload" style=" cursor:pointer;"><span style="margin: 0pt 4px; float: right;" class="ui-icon ui-icon-carat-1-s"></span><em class="ui-icon ui-icon-folder-open" style="float:left;margin: 0pt 4px; "></em>Upload image</h3><div id="ISIUarea" class="ui-corner-all" style="display:none;border:1px solid #ccc; padding:5px;"></div>';
								
					return HTML;
				});
				
				$('#imagePicker').on('change',function(){
					if($('#imgPre img').length==0){$('#imgPre').append('<img width="150" height="150" />');}
					if( $('#ISIUarea').css('display')!='none'){$('#inlinePlaceImageUpload').click();}
						$('#imgPre img').css({'opacity':'.65'}).attr('src','');
						var imgid=$('#imagePicker :selected').val();
						$('#imgPre img').attr('src',siteroot+'media/download.castle?id='+imgid+'&placeid='+place_id+'&m=crop&w=150&h=150&pre=TMP');
						$('#imgPre img').load(function(){$('#imgPre img').css({'opacity':'1.0'});});
					});
				$('#ISIUarea').load(siteroot+'media/inlineupload.castle',function(){
									
					var weWantedTo=true;
						$('input[type=file]').ajaxfileupload({ 
								  'action': siteroot+'media/update.castle', 
								  'params': { 
									'image.id':'',
									'image.FileName':$('input#image_FileName'),
									'image.Caption':$('input#image_Caption'),
									'image.Credit':$('input#image_Credit'),
									'place_id':place_id,
									'image.type.id':1,
									'ajax':true
								  }, 
								  'onComplete': function(response) { 
									 // first test if it was uploaded ok.
									  if(isNumber(response)){
										  
										  $('#uploadMess').fadeOut('fast',function(){
											  $('#uploadMess').remove();
											  if($('#nextUpload').length==0){
												  $('#ISIUarea').append('<div id="nextUpload"><h2>Next...</h2><h3><a href="#" id="place">Insert the new image</a></h3><h3><a href="#" id="again">Add more</a></h3></div>');
												  }
											  });
										  
										  // would get response here from response
											image_id=response;image_id,
											image_FileName = $('input#image_FileName').val();
											image_Credit = $('input#image_Credit').val();
											image_Caption = $('input#image_Caption').val();
										  
										  //add to 
										  if($('#imgPre img').length==0){$('#imgPre').append('<img width="150" height="150" />');}
										  $('#imagePicker :selected').attr('selected',false);//reset selection
										  $('#imagePicker option:first').after('<option value="'+image_id+'" selected="selected">'+FileName+'</option>');// add new and select
											$('#imgPre img').attr('src','media/download.castle?id='+image_id+'&placeid='+place_id+'&m=crop&w=150&h=150&pre=TMP');
											$('#imgPre img').load(function(){$('#imgPre img').css({'opacity':'1.0'});});
						
										   $('#again').on('click',function(e){
												e.preventDefault();
												e.stopPropagation();
											   $('#ISIUarea input[type=text]').each(function(){$(this).val('');});
											   $('#ISIUarea input[type=file]').each(function(){$(this).val('');});
											   $('#nextUpload').fadeOut('fast',function(){
												   $('#ISIUarea form').fadeIn('fast');
												   $('#nextUpload').remove();
												});
											});
											$('#place').on('click',function(e){
												e.preventDefault();
												e.stopPropagation();
												$('#ISIUarea input[type=text]').each(function(){$(this).val('');});
												$('#ISIUarea input[type=file]').each(function(){$(this).val('');});
												//alert(image_id);
												//var imgmar=;
												//alert(imgmar);
													ed.selection.execCommand('mceInsertContent',false,get_TinyMCE_InlinImage(image_id));
												$( "#dialog-pickimage" ).dialog( "close" );
												
											});
											
											boxCreation(image_id);
											addToImgRoster(image_id,image_FileName);
											//console.log('custom handler for file:'); 
											//alert(JSON.stringify(response)); 
									  }else{
										 $('#uploadMess').fadeOut('fast',function(){
											 $('#uploadMess').remove();
											 if($('#nextUpload').length==0){$('#ISIUarea').append('<div id="nextUpload"><h2>Error</h2><h3><a href="#" id="again">Try Again</a></h3><p>There was an issue uploading<br/>Mess: '+JSON.stringify(response)+'<p/></div>');}
										 });
									  }
								  }, 
								  'onStart': function() { 
									 FileName=$('input#image_FileName').val();
									 //alert('pause');
									//if(!weWantedTo) return false; // cancels upload 
									$('#ISIUarea form').fadeOut('fast',function(){
										if($('#uploadMess').length==0){$('#ISIUarea').append('<div id="uploadMess"><h2>Uploading</h2></div>');}
										});
									
									
								  }, 
								  'onCancel': function() { 
									//console.log('no file selected'); 
								  } 
								});
					});

				$('#inlinePlaceImageUpload').bind('click',function(e){
					e.preventDefault();
					e.stopPropagation();
					var imgid=$('#imagePicker :selected').val();
					 $('#ISIUarea').slideToggle('fast',function(){
						 $('#inlinePlaceImageUpload span').toggleClass('ui-icon-carat-1-n');
						 $('#inlinePlaceImageUpload span').toggleClass('ui-icon-carat-1-s');
					 });
					if( $('#ISIUarea').css('display')=='none'){
						$('#imgPre img').css({'opacity':'.0'}).attr('src','#');
						$('#imagePicker :selected').attr('selected',false);
					}
				});
			},
		buttons: {
			"Insert Image": function() {
				if($('#imagePicker :selected').val()!=''){
					tinyMCE.activeEditor.execCommand('mceInsertContent',false,get_TinyMCE_InlinImage($('#imagePicker :selected').val()));
					$( this ).dialog( "close" );
				}else{
					alert('You must choose an image or cancel.');
				}
			},
			Cancel: function() {
				$( this ).dialog( "close" );
			}
		}
	});

}
function isIMG(){
	var node=tinyMCE.activeEditor.selection.getNode();
	if (node.nodeName != null && node.nodeName != 'IMG'){	
	 return false;
	}
	return true;
}

function contextmenu_fix(ed) {
	if(isIMG()){
		tinyMCE.activeEditor.plugins.contextmenu.onContextMenu.add(function(sender, menu){
			var has=false;
			for (var itemName in menu.items) {
				var item = menu.items[itemName];
				if(item.settings.title=='Edit image'){
					has=true;
					continue;
				}
			}
			if(!has){
				// create a new object
				var sub_menu = menu.addMenu({title : 'Edit image',icon : 'image'});
				var i=0;
				for (var image in tinyMCEImageList) {
					var node=tinyMCEImageList[image];
					var name=node.name;
					var image_id=node.id;
					sub_menu.add({title : name, icon : 'file', cmd :'editor_addimages_'+i, value : image_id});
					tinyMCE.activeEditor.addCommand('editor_addimages_'+i, function(ui, v) {
						var imgNode=$(tinyMCE.activeEditor.selection.getContent());
						var imgid=imgNode.attr('alt').split('|');
						var orgUrl=imgNode.attr('src');
						alert(v);
						alert(orgUrl);
						var url=orgUrl.split('id='+imgid[1]+'&placeid').join('id='+v+'&placeid');
						alert(url);
						imgNode.css({'opacity':'.65'});
						
						var orgtitle = imgNode.attr('title');  
						var newtitle=orgtitle.split('('+imgid[1]+' ').join('('+v+' ');
						alert(newtitle);
						imgNode.attr('alt',imgid[1]+'|'+v);

						imgNode.attr('title',newtitle);

						imgNode.attr('data-mce-src',url);
						
						imgNode.attr('src',url);
						
						var newUrl=imgNode.attr('src');
						alert(newUrl);
						tinyMCE.activeEditor.execCommand('mceRepaint');
						imgNode.load(function(){imgNode.css({'opacity':'1.0'});});
					});
					i++;
				}
			}
		});	
		
		// Add hook for onContextMenu so that Insert Image can be removed
		
	}
	tinyMCE.activeEditor.plugins.contextmenu.onContextMenu.add(editor_remove_insertImage);
}


function editor_oninit(ed) {
    // Add hook for onContextMenu so that Insert Image can be removed
    ed.plugins.contextmenu.onContextMenu.add(editor_remove_insertImage);
	if(typeof(place_id) !== 'undefined'&&place_id>0 && $('#place_Bodytext').val()!=''){
		setTimeout(function () {
			ed.controlManager.setActive('spellchecker', true);
			//ed.execCommand('mceSpellCheck', true);
		}, 1);
	}
	tinyResize(ed.id);
}

// replace your editor_remove_insertImage function with this:
function editor_remove_insertImage(sender, menu) {

    var otherItems = {};
	if(isIMG()){
		for (var itemName in menu.items) {
			var item = menu.items[itemName];
			if(item.settings.title!='Edit image'){
				continue;
			}
			otherItems[itemName] = item;
		}
	}
    for (var itemName in menu.items) {
        var item = menu.items[itemName];
        if(item.settings.title=='Edit image'){
            continue;
        }
		
        if (/^mce_/.test(itemName)) {
            if (item.settings) {
                if (item.settings.cmd == "mceImage" || item.settings.cmd == "mceAdvImage" || (isIMG() && item.settings.title=='Edit image')) {
                    // skip these items
                    continue;
                }
            }
        }
        // add all other items to this new object, so it is effectively a clone
        // of menu.items but without the offending entries
        otherItems[itemName] = item;
    }
    // replace menu.items with our new object
    menu.items = otherItems;

}






function get_TinyMCE_InlinImage(image_id){
	var baseurl='/';
	var MACRO='#Inline_Iamge('+image_id+' '+place_id+' 250 250 "")';
	return '<img src="'+baseurl+'media/download.castle?id='+image_id+'&placeid='+place_id+'&m=crop&w=250&h=250&pre=TMP" class="tinyImgHolder" alt="imagingIt|'+image_id+'" title="'+MACRO+'" />'; 
}

function get_TinyMCE_InlinYouTube(yCode,title,w,h,yclass){
	var baseurl='/';
	var MACRO="#youtube('"+yCode+"' '"+title+"' "+w+" "+h+" '"+yclass+"')";
	var html ='<img class="tinyImgHolder" src="http://img.youtube.com/vi/'+yCode+'/0.jpg" style="width:250px;" alt="youtubingIt|'+yCode+'|'+title+'" title="'+MACRO+'"/>';
    return html;   
}



function get_TinyMCE_imagegallery(w,h,yclass){
	var i=0
	for (var image in tinyMCEImageList) {
		if(i>0) continue;
		var node=tinyMCEImageList[image];
		var image_id=node.id;
		i++;
	}
	var baseurl='/';
	var MACRO="#imagegallery('"+place_id+"' "+w+" "+h+" '"+yclass+"')";
	var html ='<img src="'+baseurl+'media/download.castle?id='+image_id+'&placeid='+place_id+'&m=crop&w=250&h=250&pre=TMP&mark=SLIDESHOW" class="tinyImgHolder" alt="gallerya|'+image_id+'" title="'+MACRO+'"/>';
    return html;   
}


//
function tinyoptions(which,id){
	
	var id = typeof(id)!=='undefined'&& id!=null?id:"place_details";
	
	
    switch(which){
       case "bodytext":
			/*$.getJSON("/dnyoAreas/getInfoTemplates.castle", function(result) {
				// Creates a new plugin class and a custom listbox
				
				tinymce.create('tinymce.plugins.ExamplePlugin',{
					createControl : function(n, cm){
			
						switch(n){
							case 'variablesListBox':
								//in the JSON I've an element called size which tells me how many objects should I iterate over
								var total = parseInt(result.size, 10);
								//save the values from the JSON in a var
								var variables = new Array();
								var mlb = cm.createListBox('variablesListBox',{
								   title : 'tab templates',
								   onselect : function(v){
										//actions to be taken when the user clicks on a value
										//alerts the value clicked
										//tinyMCE.activeEditor.windowManager.alert('Inserting:' + v);
										//inserts the corresponding value at the cursor position
										//if (typeof tinyMCE != "undefined" && tinyMCE.activeEditor){
										//	alert(id);
										//	tinyMCE.get(id).focus();
										//}
										tinyMCE.triggerSave();
										tinyMCE.activeEditor.execCommand('mceInsertContent',false,variables[v+'_2']);
										tinyMCE.triggerSave();
								   }
								}); 
								$.each(result,function(i,v){
									var tmplImg = '<img src="../Content/images/tinyMCE/template_'+result[i].alias+'.png" alt="'+result[i].id+'" class="infotabTemplate" width="150" height="55" />';
									variables[i] = result[i].name;
									variables[i+'_1'] = result[i].id;
									variables[i+'_2'] = tmplImg;
									variables[i+'_3'] = result[i].process;
									mlb.add(variables[i],i);
								});						
								// Return the new listbox instance
								return mlb;
						}
						return null;
					}
				});
				// Register plugin with a short name
				tinyMCE.PluginManager.add('templatevariables', tinyMCE.plugins.ExamplePlugin);
			});*/
            return {
                mode : "exact", 
                body_id : "left_col",
                elements : id,
                theme : "advanced",
				width:"685",
				force_br_newlines : true, 
				force_p_newlines : false,
				forced_root_block : '',
                plugins : "-templatevariables,autolink,lists,spellchecker,pagebreak,style,layer,table,save,advhr,advimage,advlink,emotions,iespell,inlinepopups,insertdatetime,preview,media,searchreplace,print,contextmenu,paste,directionality,fullscreen,noneditable,visualchars,nonbreaking,xhtmlxtras,autoresize,advimagescale", 
                theme_advanced_buttons1 : "bold,italic,underline,|,justifyleft,justifycenter,justifyright,justifyfull,|,bullist,numlist,|,link,unlink,"+placeImgBtn+"|,youTube,|,cleanup,|,outdent,indent,|,removeformat|,anchor,|,cite,abbr,acronym,del,ins,attribs",
                theme_advanced_buttons2 : "visualchars,nonbreaking,pagebreak,|,undo,redo,|,cut,copy,paste,pastetext,pasteword,|,forecolor,backcolor,|,help,|,fullscreen,|,code,|,spellchecker,search,replace", 
                theme_advanced_buttons3 : "styleselect,formatselect,fontselect,fontsizeselect,|,variablesListBox",
                spellchecker_rpc_url: "/TinyMCEHandler.aspx?module=SpellChecker",
				theme_advanced_toolbar_location : "top", 
				theme_advanced_toolbar_align : "left", 
				theme_advanced_statusbar_location : "bottom", 
				// Example content CSS (should be your site CSS) 
				content_css : "/Content/css/main_tinymce.css", 
				//execcommand_callback : "CustomExecCommandHandler",
				setupcontent_callback:function(){
					//myCustomSetupContent();
				},				
				// Style formats
                style_formats : [
                        {title : 'Bold text', inline : 'b'},
                        {title : 'FLoat it left', selector : 'img', classes : 'fLeft'},
                        {title : 'FLoat it right', selector : 'img', classes : 'fRight'}
                ],
				formats : {
                        alignleft : {selector : 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img', classes : 'left'},
                        aligncenter : {selector : 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img', classes : 'center'},
                        alignright : {selector : 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img', classes : 'right'},
                        alignfull : {selector : 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img', classes : 'full'},
                        bold : {inline : 'span', 'classes' : 'bold'},
                        italic : {inline : 'span', 'classes' : 'italic'},
                        underline : {inline : 'span', 'classes' : 'underline', exact : true},
                        strikethrough : {inline : 'del'},
                        forecolor : {inline : 'span', classes : 'forecolor', styles : {color : '%value'}},
                        hilitecolor : {inline : 'span', classes : 'hilitecolor', styles : {backgroundColor : '%value'}},
                        custom_format : {block : 'h1', attributes : {title : "Header"}, styles : {color : 'red'}}
                },
				handle_node_change_callback :function(ed, node, undo_index, undo_levels, visual_aid, any_selection){
							//console.debug('Editor was clicked: ' + e.target.nodeName);
							if (node.nodeName == null || node.nodeName != 'IMG')
								return
								//alert(node.nodeName);
							var imgNode=$(node);
							if(typeof(imgNode.attr('src'))!=='undefined'){
								//alert(imgNode.attr('src'));
								var image=imgNode.attr('alt').split('|');
								//alert(image[0]);
								var theclass=imgNode.attr('class');
									theclass=theclass.split('tinyImgHolder');
									//alert(theclass[1]);
								if(image[0]=="imagingIt"){
									var image_id = image[1];
									imgNode.attr('title','#Inline_Iamge('+image_id+' '+place_id+' ' + imgNode.width() + ' ' + imgNode.height()+' \''+ theclass[1] +'\')');
									contextmenu_fix(ed);
								}
								if(image[0]=="youtubingIt"){
									var yCode=image[1];
									var title=image[2];
									imgNode.attr('title','#youtube(\''+yCode+'\' \''+title+'\' '+ imgNode.width() +' '+ imgNode.height() +' \''+ theclass[1] +'\')');
								}
								if(image[0]=="gallerya"){
									var image_id = image[1];
									imgNode.attr('title','#imagegallery(\''+place_id+'\' '+ imgNode.width() +' '+ imgNode.height() +' \''+ theclass[1] +'\')');
								}
							}
					},
				setup : function(ed) {

					//add edit images menu
						//push edit images to top and remove unwanted
						ed.onInit.add(editor_oninit);	
					 // Add a custom button
						ed.addButton('mainImage', {
							title : 'Main Image',
							image : siteroot+'Content/images/insert_image.png',
							onclick : function() {
								// Add you own code to execute something on click
								ed.focus();
								openImgResource(ed);
							}
						});
						ed.addButton('youTube', {
							title : 'Add YouTube',
							image : siteroot+'Content/images/insert_youtube.png',
							onclick : function() {
								// Add you own code to execute something on click
								ed.focus();
								var myBookmark = tinyMCE.activeEditor.selection.getBookmark();
								if($('#dialog-youtube').length==0){$('body').append('<div id="dialog-youtube">')}
								$( "#dialog-youtube" ).dialog({
									resizable: false,
									height:240,
									modal: true,
									create: function(event, ui) {
											$('#dialog-youtube').html(function(){
												var HTML='YouTube code<br/><input value="" id="yCode" /><br/>';
													HTML+='Title<br/><input value="" id="yTitle" /><br/>';
												return HTML;
											});
										},
									buttons: {
										"Set Image": function() {
											$( this ).dialog( "close" );
											var yCode = $('#yCode').val();
											var yTitle = $('#yTitle').val();
											var w=250;
											var h=250;
											var yclass='';
											tinyMCE.activeEditor.selection.moveToBookmark(myBookmark);
											tinyMCE.activeEditor.execCommand('mceInsertContent',true,get_TinyMCE_InlinYouTube(yCode,yTitle,w,h,yclass));
										},
										Cancel: function() {
											$( this ).dialog( "close" );
										}
									}
								});
							}
						})
						
						ed.addButton('imagegallery', {
							title : 'Add Gallery',
							image : siteroot+'Content/images/insert_gallery.png',
							onclick : function() {
								// Add you own code to execute something on click
								ed.focus();
								var w=250;
								var h=250;
								var yclass='';
								tinyMCE.activeEditor.execCommand('mceInsertContent',false,get_TinyMCE_imagegallery(w,h,yclass));
								
							}
						})
						
						
					},
				    advimagescale_maintain_aspect_ratio: false, /* this is the default behavior */
					advimagescale_fix_border_glitch: true, /* also the default behavior */
					advimagescale_noresize_all: false, /* set to true to prevent all resizing on images */
					advimagescale_append_to_url: true, /* apply dimensions to image URL on resize */
					advimagescale_url_width_key: 'w',  /* apply width to URL as w= param */
					advimagescale_url_height_key: 'h', /* apply height to URL as h= param */
					advimagescale_max_height: 650, /* limit maximum image height to 200px */
					advimagescale_max_width:  650, /* limit maximum image width to 200px */
					advimagescale_min_height: 150, /* minimum image height is 20px */
					advimagescale_min_width:  150, /* minimum image width is 20px */
					/* call this function when an image is loading */
					advimagescale_loading_callback: function(imgNode) {
						$(imgNode).css({'opacity':'.65'});
					},
					/* call this function when an image is finished loading */
					advimagescale_loaded_callback: function(imgNode) {
						$(imgNode).css({'opacity':'1.0'});
						
						var image=$(imgNode).attr('alt').split('|');
						var yclass=$(imgNode).attr('class');
						var theclass=$(imgNode).attr('class');
								theclass=theclass.split('tinyImgHolder');
						if(image[0]=="imagingIt"){
							var image_id = image[1];
								$(imgNode).attr('title','#Inline_Iamge('+image_id+' '+place_id+' ' + imgNode.width + ' ' + imgNode.height+' \''+ theclass[1] +'\')');
						}
						if(image[0]=="youtubingIt"){
							var yCode=image[1];
							var title=image[2];
								$(imgNode).attr('title','#youtube(\''+yCode+'\' \''+title+'\' '+ imgNode.width +' '+ imgNode.height +' \''+ theclass[1] +'\')');
						}
					},
					/* call this function when an image has been resized */
					advimagescale_resize_callback: function(editorInstance, imgNode) {
						editorInstance.execCommand("mceRepaint");
						
						var image=$(imgNode).attr('alt').split('|');
						var yclass=$(imgNode).attr('class');
						var theclass=$(imgNode).attr('class');
								theclass=theclass.split('tinyImgHolder');
						if(image[0]=="imagingIt"){
							var image_id = image[1];
								$(imgNode).attr('title','#Inline_Iamge('+image_id+' '+place_id+' ' + imgNode.width + ' ' + imgNode.height+' \''+ theclass[1] +'\')');
						}
						if(image[0]=="youtubingIt"){
							var yCode=image[1];
							var title=image[2];
								$(imgNode).attr('title','#youtube(\''+yCode+'\' \''+title+'\' '+ imgNode.width +' '+ imgNode.height +' \''+ theclass[1] +'\')');
						}
						//editorInstance.activeEditor.selection.collapse();
						//alert('resized to ' + imgNode.width + 'x' + imgNode.height);
					}
            }
        break;
       case "simple":
            return {
                mode : "exact", 
                elements : id?id:"place_summary",
                theme : "advanced",
                width : "685", 
				height:  "150",
				force_br_newlines : true, 
				force_p_newlines : false,
				forced_root_block : '',
				theme_advanced_resizing_min_height :150,
				setup : function(ed) {
					ed.onInit.add(function() {
						var e = tinymce.DOM.get(ed.id + '_tbl'), ifr = tinymce.DOM.get(ed.id + '_ifr'), w = ed.getWin(), dh;
						var h = 200; //new height of edit area
						dh = e.clientHeight - ifr.clientHeight; //get the height of the toolbars
						//ed.theme.resizeTo(685, h + dh);
						tinyResize(ed.id);
					});
				},
                plugins : "paste, spellchecker, autoresize",
                theme_advanced_buttons1 : "bold,italic,underline,|,undo,redo,|,cut,copy,paste,pastetext,pasteword,|,spellchecker",
                theme_advanced_buttons2 : "", 
                theme_advanced_buttons3 : "",
                spellchecker_rpc_url: "/TinyMCEHandler.aspx?module=SpellChecker"
            }
        break;
        default:
        case "default":
            return {
                mode : "exact", 
                elements : id?id:"tinyedit",
                theme : "advanced",
				width : "685", 
				height:  "350",
				force_br_newlines : true, 
				force_p_newlines : false,
				forced_root_block : '',
				theme_advanced_resizing_min_height :150,
				setup : function(ed) {
					ed.onInit.add(function() {
						var e = tinymce.DOM.get(ed.id + '_tbl'), ifr = tinymce.DOM.get(ed.id + '_ifr'), w = ed.getWin(), dh;
						var h = 200; //new height of edit area
						dh = e.clientHeight - ifr.clientHeight; //get the height of the toolbars
						//ed.theme.resizeTo(685, h + dh);
						tinyResize(ed.id);
					});
				},
                plugins : "paste, spellchecker, autoresize,advlink",
                theme_advanced_buttons1 : "bold,italic,underline,|,undo,redo,|,link,unlink,|,cut,copy,paste,pastetext,pasteword,|,spellchecker",
                theme_advanced_buttons2 : "", 
                theme_advanced_buttons3 : "",
                spellchecker_rpc_url: "/TinyMCEHandler.aspx?module=SpellChecker"
            }
        break;
    }
}


function load_tiny(which,id){
        if(typeof(which)==='undefined'){which="default";}
		if(typeof(id)==='undefined'){id=null;}
        tinyMCE.init(tinyoptions(which,id));
}
