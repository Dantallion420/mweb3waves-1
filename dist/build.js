$(function($){
	var depjson,
		builderhtml = [],
		sortable = [],
		groupBy = function( jsondata ) {
		    var newarray = [];
				
			for (key in jsondata) {
				console.log( key );
			}
			return newarray;
		},
		strip = function( file ) {
			return file.replace(/\.\//g, '').replace(/\./g, '-');
		},
		builditem = function( data ) {			
			builderhtml = groupBy( data, 'group' );
			
			//console.log( builderhtml );
			
			for ( var key in builderhtml ) {
				var id = strip( key ),
					label = builderhtml[key].label,
					desc = builderhtml[key].description,
					labelm = "<label for='" + id + "'>" + label + "</label>",
					inputm = "<input type='checkbox' id='" + id + "' name='" + id + "' " + ( builderhtml[key].required ? "disabled='disabled' checked='checked'" : "" ) + " />",
					descm = "<small>" + desc + "</small>",
					item = inputm;
				
				if( label ) { item = item + labelm; }
				if( desc ) { item = item + descm; }
				
				document.getElementById('builder').innerHTML = document.getElementById('builder').innerHTML + "<li>" + item + "</li>";
			}
		},
		checkDependencies = function( e ) {
			var $el = $( e.target ),
				id = $el.attr('id').replace(/\-/g, '.'),
				dep = depjson[ id ];

			if ( $el.is(':checked') ) {
				if( dep.deps ) {		
					for ( i = 0; i < dep.deps.length; i++ ) {
						var checkDep = strip( dep.deps[i] );

						$( '#' + checkDep ).attr('checked', 'checked');
					}
				}
			} else {		
				for ( var key in depjson ) {
					if ( depjson.hasOwnProperty(key) && depjson[key].deps ) {
						for ( i = 0; i < depjson[key].deps.length; i++ ) {
							
							if(  strip( depjson[key].deps[i] ) == strip( id ) ) {
								var checkDep =  strip( key );

								$( '#' + checkDep ).removeAttr('checked');
							}						
						}
					}
				}		
			}
		};
	
	$.ajax({
		url: 'http://amd-builder.no.de/jquery-mobile/master/dependencies?baseUrl=js',
		success: builditem
	});

	$(document).delegate('input:checkbox', 'change', checkDependencies );
	
	$('.download-builder').bind('submit', function(e) {
		var $el = $(this),
			formData = $el.find(':checked'),
			items = '';
			
		formData.each(function() {
			items = items + $(this).attr('id') + '&';
		});
		
		$.ajax({
			url: 'http://amd-builder.no.de/jquery-mobile/master/make?baseUrl=js&include=' + items.replace(/\-/g, '.') + '&pragmasOnSave=%7B%22jqmBuildExclude%22%3Atrue%7D',
			success: function( data ) {
				if( $('.builder-output').length ) {
					$('.builder-output').text( data );
				} else {
					$el.after( "<textarea class='builder-output'>" + data + "</textarea>" );
				}
			}
		});
		e.preventDefault();
	}).append('<input type="submit">');
});