/* refactor */



function DeleteImage(image_id,placeId){
    $.get(siteroot+view+'DeleteImage.castle?id='+image_id+'&placeId='+placeId, function(data){});
    $("#ImageDiv div#" + image_id).remove();
	//RemoveNode(ImageId);
	//removeFromImgRoster(image_id);
}

function  RemoveNode(ImageId){
//    var parent = document.getElementById('ImageDiv');
//    var childId = "div" + ImageId;
//    var child  = document.getElementById(childId);
//    parent.removeChild(child);
    $("#ImageDiv div#" + ImageId).remove();
}










function updateaddImageDIV(transport){
    var temp = document.getElementById("NextImageID");
    var newdiv = document.createElement('div');
    var divIdName = 'Image'+temp.value+'Div';

    newdiv.setAttribute('id',divIdName);
    newdiv.innerHTML = transport.responseText;
    var ni = document.getElementById('NewImageHolderDiv');
    ni.appendChild(newdiv);
}

function addToImgRoster(id,name){
	if(typeof(id)==='undefined'||id<=0){return}
	if(typeof(name)==='undefined'){name="";}
	tinyMCEImageList.push({id:""+id,name:name,url:siteroot+"media/download.castle?id="+id+"&placeid="+place_id+"&m=crop&w=250&h=250&pre=TMP"});	
}
function removeFromImgRoster(id){
	if(typeof(id)==='undefined'||id<=0){return}
	var i=0;			
	for (var image in tinyMCEImageList) {
		var node=tinyMCEImageList[image];
		if(node.id==id){
			tinyMCEImageList.remove(i);
		}
		i++;
	}
}

function boxCreation(image_id){
	var HTML ='<span class="imageBox">';
		HTML+='<input type="hidden" value="'+image_id+'" name="images['+image_id+'].id"  class="placeImages">';
		HTML+='<img src="'+siteroot+'media/download.castle?id='+image_id+'&placeid='+place_id+'&m=crop&w=175&h=175&pre=borwser" class="previewImg" />';
		HTML+='<a title="'+image_id+'" rel="'+place_id+'" style="cursor:pointer;display: inline-block;" class="DeleteImage ui-state-error ui-corner-all">';
		HTML+='<span class="ui-icon ui-icon-trash"></span>';
		HTML+='</a>';
		
		HTML+='<span class="imgInfo">';
		HTML+='<span><label>Caption:</label><input type="text" value="'+image_Caption+'" name="Caption['+image_id+']" class=""/></span>';
		HTML+='<span><label>Credit:</label><input type="text" value="'+image_Credit+'" name="Credit['+image_id+']" class="placeCredit"/></span>';
		
		HTML+='<span><label>Order:</label>';
		HTML+='<input type="hidden" class="" name="PlaceImages['+image_id+'].id" value="411">';
		HTML+='<input type="text" class="placeOrder" name="PlaceImages['+image_id+'].placeOrder" value="0">';
		HTML+='<input type="hidden" class="placeOrderId" name="PlaceImages['+image_id+'].Image.id" value="'+image_id+'">';
		HTML+='</span>';
		
		
		HTML+='</span>';
		HTML+='</span>';

		$('#browserBox').find('.clearings').before(HTML);
		
		if($('#browserBox.grid').length>0){
			$('.imageBox:last').find('.imgInfo').slideToggle();
			$('.imageBox:last').find('.DeleteImage').fadeToggle();
			$('.imageBox:last').hover(
				function(){
					$(this).find('.imgInfo').slideToggle();
					$(this).find('.DeleteImage').fadeToggle();
					}
			);			
		}
}



var FileName="";


function info_img_area(i,v){
	if($("#info_bar").length){
		var ops = "";
		$.each(v.post_options, function(i,v){
				ops+="<li><strong>"+(i.split("_").join(" "))+"</strong> : " + v + " </li>";
			});
		$("#info_bar").html("<span style='position:relative;padding:5px;border:1px solid #8a8a8a; background-color:#d3d3d3;display:inline-block;float:left;-webkit-box-shadow:  0px 0px 7px 1px rgba(0, 0, 0, 0.45);box-shadow:  0px 0px 7px 1px rgba(0, 0, 0, 0.45);'><img class='orgimg' src='"+v.post_options.static_file+"' width='250'  style='border:1px solid #e2e2e2; background-color:#e2e2e2;-webkit-box-shadow:  0px 0px 5px 1px rgba(0, 0, 0, 0.35);box-shadow:  0px 0px 5px 1px rgba(0, 0, 0, 0.35);'/></span><span style='height: 25px; display: inline-block; width: 100%; margin-top: 5px;'><a href='#' class='button small' style='margin-left:5px;'>Edit</a><a href='#' class='button small' style='margin-left:5px;'>Insert</a><a href='#' class='button small' style='margin-left:5px;'>Shortcode</a>    <a href='#' class='button small' style='margin-left:5px;font-size:15px;' id='prev_img_choice'>&#171;</a><a href='#' class='button small' style='margin-left:5px;font-size:15px;' id='next_img_choice'>&#187;</a></span><ul style='max-height: 100%; overflow: scroll; height: 397.6px; margin-top: 0px; box-shadow: 6px 6px 6px -6px rgba(0, 0, 0, 0.25) inset; background-color:#e0e0e0;'>"+ops+"</ul>");
		
		$("#prev_img_choice").on("click",function(){
			info_img_area(i-2,v);
		});
		$("#next_img_choice").on("click",function(){
			info_img_area(i+2,v);
		});
		$("#info_bar").height($("#dialog-pickimage").height()-45);
		$("#info_bar ul").height($("#dialog-pickimage").height()-45 - 30 - 12 -$("#info_bar img").height());
	}
}

function openImgUploader(){

	$(window).resize(function(){$("#dialog-pickimage" ).dialog('option', { width: $(window).width()-50,  height: $(window).height()-50,});})

	if(typeof(uploadonly)==='undefined'){uploadonly=false;}
	if($('#dialog-pickimage').length==0){$('body').append('<div id="dialog-pickimage">')}
		$( "#dialog-pickimage" ).dialog({
			resizable: false,
			width: $(window).width()-50,
			height: $(window).height()-50,
			modal: true,
			draggable : false,
			position:['center','center'] ,
			title:'Insert Media',
			close:function(){
				$('body').css({overflow:"auto"});
				$( "#dialog-pickimage" ).dialog( "destroy" );
				$( "#dialog-pickimage" ).remove();
				},
			create: function(event, ui) {
					$('body').css({overflow:"hidden"});
					$(".ui-dialog-buttonpane").remove();
					$('#dialog-pickimage').html(function(){
						var optional='<option value="">Choose Image</option>';
									var i=0;			
								for (var image in tinyMCEImageList) {
									var node=tinyMCEImageList[image];
										var name=node.name;
										var image_id=node.id;
										optional+='<option value="'+image_id+'">'+name+'</option>';
								}
							var HTML  ='<div id="imgPre"></div>';//<h3 ><span class="ui-icon ui-icon-image" style="    float: left;margin: 0 4px;"></span>Place images</h3><select id="imagePicker">'+optional+'</select>';
							HTML += '<div class="media-frame-menu" style="background-color: #FFFFFF;"><div class="media-menu"><a href="#" class="media-menu-item active">Insert Media</a><a href="#" class="media-menu-item">Create Gallery</a><a href="#" class="media-menu-item">Set Featured Image</a><div class="separator"></div><a href="#" class="media-menu-item browser">File Browser</a><a href="#" class="media-menu-item">Insert from URL</a></div></div><div id="ISIUarea" class="" style="margin-left: 145px; margin-right: 263px; display: inline-block; overflow-x: hidden; overflow-y:auto;"></div><div id="action_bar" class="" style="bottom: 0px; box-shadow: 0px 6px 6px -6px rgba(0, 0, 0, 0.2) inset; margin-left: 145px; position: absolute; right: 0px; width: 100%; height: 45px; padding: 15px 5px 5px;z-index: 2; background-color: rgb(242, 242, 242);"><a href="#" id="insert_single" class="button" style="float:right;display:none;">Insert</a></div><div id="info_bar" style="box-shadow: 6px 0px 6px -6px rgba(0, 0, 0, 0.35); background-color: rgb(214, 214, 214); width: 264px; position: absolute; right: 0px; top: 0px; max-height: 100%; overflow: hidden; margin-bottom: 45px; z-index: 1; font-size:10px;"></div>';
									
						return HTML;
					});
					
					
					
					$(".media-menu-item").on('click',function(e){e.preventDefault();e.stopPropagation();
						$(".media-menu-item").removeClass("active");
						$(this).addClass("active");
						if($(this).is('.browser')){
							$("#ISIUarea").html('<h2 style="margin:0px">File Browser</h2><div style="font-size:18px;">    <div id="elfinder">    </div></div>').attr("style","display: inline-block; height: 100%; padding-left: 145px; width: 60%; max-height: 686.6px;");
							load_image_browser();
						}
					});
					

					
					
					
					var feeddata = {};
					$.getJSON("/feed/?model=post_list&type=media",function(data){
						feeddata = data;
						$.each(data.posts,function(i,v){
							if(v.post_options.static_file!=null){
								
								var $obj = $("<span style='position:relative;padding:5px;border:1px solid #8a8a8a; background-color:#d3d3d3;display:inline-block;float:left;margin-right:9px;margin-bottom:9px;-webkit-box-shadow:  0px 0px 7px 1px rgba(0, 0, 0, 0.45);box-shadow:  0px 0px 7px 1px rgba(0, 0, 0, 0.45);' data-index='"+i+"'><input type='checkbox' style='position: absolute; right: 10px; top: 10px;' /><img class='orgimg' src='"+v.post_options.static_file+"' width='150'  style='border:1px solid #e2e2e2; background-color:#e2e2e2;-webkit-box-shadow:  0px 0px 5px 1px rgba(0, 0, 0, 0.35);box-shadow:  0px 0px 5px 1px rgba(0, 0, 0, 0.35); cursor:pointer;'/><span style='height:25px;display:block;width:100%;'><a href='#' class='button small'>Edit</a><a href='#' class='button small' style='margin-left:5px;'>Shortcode</a></span></span>");
								$("#ISIUarea").append($obj);
								$obj.find('.orgimg').on("click",function(){
									var checked = $(this).closest("span").find('input').is(":checked")?false:true;
									$(this).closest("span").find('input').attr("checked",checked);
									if($("#ISIUarea input:checked").length){$('#insert_single').show();}else{$('#insert_single').hide();}
									info_img_area(i,v);
								});
								if(i<1){ info_img_area(i,v); }
							}
							
							$("#ISIUarea").css({"max-height":$("#dialog-pickimage").height() - 80 });
						});
						
						
						$(window).resize(function(){
							$("#info_bar").height($("#dialog-pickimage").height()-45);
							$("#ISIUarea").css({"max-height":$("#dialog-pickimage").height() - 80 ,"width":$("#dialog-pickimage").width() -( $(".media-frame-menu").width()+ $("#info_bar").width())});
							$("#info_bar ul").height($("#dialog-pickimage").height()-45 - 30 - 12 -$("#info_bar img").height());
							});
						
					});

					$('#imagePicker').on('change',function(){
						if($('#imgPre img').length==0){$('#imgPre').append('<img width="150" height="150" />');}
						if( $('#ISIUarea').css('display')!='none'){$('#inlinePlaceImageUpload').click();}
							$('#imgPre img').css({'opacity':'.65'}).attr('src','');
							var imgid=$('#imagePicker :selected').val();
							$('#imgPre img').attr('src',siteroot+'media/download.castle?id='+imgid+'&placeid='+place_id+'&m=crop&w=150&h=150&pre=TMP');
							$('#imgPre img').load(function(){$('#imgPre img').css({'opacity':'1.0'});});
						});
/*
					$('#ISIUarea').load(siteroot+'post/create.castle?post_type=media&skiplayout=true',function(){
						if(typeof(availablecredits) !== 'undefined'){
							if($( "#image_Credit" ).length>0){
								$( "#image_Credit" ).autocomplete({
									source: availablecredits
								});
							}
						}	
						
						$('input#image_Credit').keypress(function(){
							image_Credit = $('input#image_Credit').val();
						});
						$('input#image_Caption').keypress(function(){
							image_Caption = $('input#image_Caption').val();
						});												
						
																					
						var weWantedTo=true;
							$('input[type=file]').ajaxfileupload({
									  'action': siteroot+'media/uploadFiles.castle', 
									  'params': { 
													'returnType':'id',
													'pool':'place',
													'pool_place':post,
													'credit':$('input#image_Credit')!='undefined'?$('input#image_Credit'):"",
													'caption':$('input#image_Caption')!='undefined'?$('input#image_Caption'):"",
													'mediatype':'3'
												},
									  'onComplete': function(response) { 
										 // first test if it was uploaded ok.
										  if(isNumber(response)){
											  
											  $('#uploadMess').fadeOut('fast',function(){
												  $('#uploadMess').remove();
												  if($('#nextUpload').length==0){
													  $('#ISIUarea').append('<div id="nextUpload"><h2>Next...</h2><!--<h3><a href="#" id="place">Insert the new image</a></h3>--><h3><a href="#" id="again">Add more</a></h3></div>');
													  }
												  });
											  
												// would get response here from response
												image_id=response;
												image_FileName = $('input#image_FileName').val();
												image_Credit = $('input#image_Credit').val();
												image_Caption = $('input#image_Caption').val();

											  //add to 
											  if($('#imgPre img').length==0){$('#imgPre').append('<img width="150" height="150" />');}
											  $('#imagePicker :selected').attr('selected',false);//reset selection
											  $('#imagePicker option:first').after('<option value="'+image_id+'" selected="selected">'+FileName+'</option>');// add new and select
												$('#imgPre img').attr('src',siteroot+'media/download.castle?id='+image_id+'&placeid='+place_id+'&m=crop&w=150&h=150&pre=TMP');
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
										 if(FileName=="")FileName=$('input#image_id').val();
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
*/
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
				}
		});
	
	}




function load_image_browser(){
	load_file_browser({onlyMimes: ["image"],customData:{"ptype":"media"}});
}




function load_file_browser(external_options){
	// init 
	tinyMCE.init({});
	
	// elfinder options


	var myCommands = elFinder.prototype._options.commands;
	var disabled = ['help'];
	$.each(disabled, function (i, cmd) {
		(idx = $.inArray(cmd, myCommands)) !== -1 && myCommands.splice(idx, 1);
	});
	var selectedFile = null;
	var options = {
		url: '/file/get_index.castle',
		/*commands: myCommands,
		lang: 'en',*/
		uiOptions: {
			toolbar: [
				['home', 'up'],
				['back', 'forward'],
				['reload'],
				['mkdir', 'mkfile', 'upload'],
				['open', 'download'],
				['info'],
				['quicklook'],
				['copy', 'cut', 'paste'],
				['rm'],
				['duplicate', 'rename', 'edit'],
				['resize',  'select'],
				['extract', 'archive'],
				['view', 'sort']
			]
		},
		
		handlers: {
			select: function (event, elfinderInstance) {
				
				if (event.data.selected.length == 1) {
					var item = $('#' + event.data.selected[0]);
					if (!item.hasClass('directory')) {
						selectedFile = event.data.selected[0];
						
						$.getJSON('/file/retrieve_file_info.castle', { target: selectedFile,"ptype":"media" }, function (data) {
							info_img_area(0,data.Data.files[1].post);
						});
						
						//alert(dump(elfinderInstance));
						console.log(elfinderInstance);

						
						//$('#elfinder-selectFile').show();
						return;
					}
				}
				$('#elfinder-selectFile').hide();
				selectedFile = null;/**/
			}
		}
	};
	
	if(typeof(external_options)!=="undefined")$.extend(options,external_options);
	$('#elfinder').elfinder(options).elfinder('instance');

	/*$('.elfinder-toolbar:first').append('<div class="ui-widget-content ui-corner-all elfinder-buttonset" id="elfinder-selectFile" style="display:none; float:right;">'+
	'<div class="ui-state-default elfinder-button" title="Select" style="width: 100px;"></div>');
	$('#elfinder-selectFile').click(function () {
		if (selectedFile != null)
			$.post('/file/SelectFile.castle', { target: selectedFile }, function (response) {
				alert(response);
			});
	   
	});	*/
	
}





$(function() {
    if($('.DeleteImage').length>0){
        $('.imageBox .DeleteImage').on('click',function(){
            var id = $(this).attr('rel');
            var image_id = $(this).attr('title');
            var obj = $(this);
            alertLoadingSaving();
			 obj.closest('.imageBox').find('.previewImg').css({opacity:.45});
	        $.get(siteroot+view+'DeleteImage.castle?imageid='+image_id+'&id='+id, function(data){
	            obj.closest('.imageBox').fadeOut('fast',function(){obj.closest('.imageBox').remove();});
				removeFromImgRoster(image_id);
	            setTimeout("removeAlertLoadingSaving()",1500);
	        });
	    });
	}

	/* -----------
		for images
		---------------- */
	/* for image editing */
    if($('#imageTypeDD').length>0){
        $("#imageTypeDD").on('change',function () {
            if($(this).find(':selected').val()=='1'){
                $('#imageTypes').show();
            }else{
                $('#imageTypes').hide();
            }
        });
    }
    if(typeof(availablecredits) !== 'undefined'){
        if($( "#image_Credit" ).length>0){
			$( "#image_Credit" ).autocomplete({
				source: availablecredits
			});
		}
		if($( ".placeCredit" ).length>0){
			$( ".placeCredit" ).autocomplete({
				source: availablecredits
			});	
		}
    }
	if($('#browserBox').length>0){
		$('#browserBox').sortable({
			placeholder: "ui-state-highlight",
			update: function(event, ui) {
			$('#browserBox .placeOrder').each(function(){
				$(this).val($('#browserBox .placeOrder').index($(this)));
				});
			}
		});
	}
	$('.img_layout_choice').on('click',function(){
		var self = $(this);
		var imageArea= self.siblings('.browserBox');
		
		if(!self.is($('.list'))){
			$.each(imageArea.find('.imageBox'),function(){
				$(this).stop().animate({
					width:"100%",
					height: "175px",
					"min-height": "175px"
				}, 500, function() {
				// Animation complete.
				
					removeToggle();
				});
			});
			self.addClass('list');
			imageArea.removeClass('grid');
			imageArea.addClass('list');
		}else{
			$.each(imageArea.find('.imageBox'),function(){
				$(this).stop().animate({
					width:"175px",
					height: "175px"
				}, 500, function() {
				// Animation complete.
				
					addToggle();
				});
			});
			self.removeClass('list');
			imageArea.removeClass('list');
			imageArea.addClass('grid');
		}
	});
	
	
	
	$('#img_layout_choice').toggle(
	  function(){
	
		$('.imageBox').stop().animate({
			width:"100%",
			height: "175px",
			"min-height": "175px"
		  }, 500, function() {
			// Animation complete.
			$('#img_layout_choice').addClass('list');
			 $('#browserBox').removeClass('grid');
			$('#browserBox').addClass('list');
			removeToggle();
		  });
		  
	  },
	  function(){
	
		$('.imageBox').stop().animate({
			width:"175px",
			height: "175px"
		  }, 500, function() {
			// Animation complete.
			$('#img_layout_choice').removeClass('list');
			$('#browserBox').removeClass('list');
			$('#browserBox').addClass('grid');
			addToggle();
		  });
		  
	  }
	);	
	
});