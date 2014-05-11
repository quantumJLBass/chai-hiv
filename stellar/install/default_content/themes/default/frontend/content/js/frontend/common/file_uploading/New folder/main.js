/*
 * jQuery File Upload Plugin JS Example 6.7
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2010, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/*jslint nomen: true, unparam: true, regexp: true */
/*global $, window, document */

$(function () {
    'use strict';
	
	
	$('.pool').live('change',function(){
		$(this).siblings('.pools').hide();
		$(this).siblings('.pool_'+$(this).val()).show();
		$(this).siblings('.pool_'+$(this).val()).val($(this).val());
	});
	
	
    // Initialize the jQuery File Upload widget:
    $('#fileupload').fileupload({sequentialUploads:false}).bind('fileuploaddone', function (e, data){ 
        $("#filetree").load(window.location+" #filetree");
    })
	.bind('fileuploadadded', function (e, data) {
		$.each(data.files, function (index, file) {
			//alert(dump(file));
			$("[rel='"+file.name+"']").addClass('added_listing');
			$("[rel='"+file.name+"']").find('.pool').not('added_listing').val($('#pools').val());
			$("[rel='"+file.name+"']").find('.pool_'+$('#pools').val()).show();
			
			
			
			
			//alert('Added file: ' + file.name);
		});
//		data.url = '/path/to/upload/handler.json';
//		var jqXHR = data.submit()
//			.success(function (result, textStatus, jqXHR) {/* ... */})
//			.error(function (jqXHR, textStatus, errorThrown) {/* ... */})
//			.complete(function (result, textStatus, jqXHR) {/* ... */});
	});

    // Enable iframe cross-domain access via redirect option:
    $('#fileupload').fileupload(
        'option',
        'redirect',
        window.location.href.replace(
            /\/[^\/]*$/,
            '/cors/result.html?%s'
        )
    );
   /*// if (window.location.hostname === 'blueimp.github.com') {
        // Demo settings:
        $('#fileupload').fileupload('option', {
            url: '//jquery-file-upload.appspot.com/',
            maxFileSize: 5000000,
            acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
            process: [
                {
                    action: 'load',
                    fileTypes: /^image\/(gif|jpeg|png)$/,
                    maxFileSize: 20000000 // 20MB
                },
                {
                    action: 'resize',
                    maxWidth: 1440,
                    maxHeight: 900
                },
                {
                    action: 'save'
                }
            ]
        });
        // Upload server status check for browsers with CORS support:
        if ($.support.cors) {
            $.ajax({
                url: '//jquery-file-upload.appspot.com/',
                type: 'HEAD'
            }).fail(function () {
                $('<span class="alert alert-error"/>')
                    .text('Upload server currently unavailable - ' +
                            new Date())
                    .appendTo('#fileupload');
            });
        }
    } else {
        // Load existing files:
        $('#fileupload').each(function () {
            var that = this;
            $.getJSON(this.action, function (result) {
                if (result && result.length) {
                    $(that).fileupload('option', 'done')
                        .call(that, null, {result: result});
                }
            });
        });
    }*/

});
