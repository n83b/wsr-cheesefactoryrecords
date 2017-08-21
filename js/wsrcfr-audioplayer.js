var wsrcfr_audioplayer = (function(){
	
	/***********************************************************
	 * settings
	 */
	var s = {}

	function init(elem, settings){
	 	initaliseSetings(elem, settings);
	 }


	function initaliseSetings(elem, settings){
		s.elem = elem;
	 	s.ajaxurl = settings.ajaxurl;
		s.ajax_nonce = settings.ajax_nonce;
	 	s.siteurl = settings.siteurl;
	 	s.path = settings.path;
	 	s.player;
	 	s.currentPostId;
	 	s.current_track;
	 	s.currentTitle;
	 }

	 /***********************************************************
	 * View
	 */
	function renderView(id, songFile, title = ""){
		if (songFile){
			s.currentPostId = id;
			s.current_track = songFile;
			s.currentTitle = title;
			var source = jQuery("#wsr-tmpl-audioplayer").html();
			var template = Handlebars.compile(source);
			var html = template({track: s.current_track, songtitle: s.currentTitle});
			jQuery(s.elem).html(html);
			initialiseMediaElement();
    	}else{
    		jQuery(s.elem).html('error');
    	}
	}


	/***********************************************************
	 * Functions
	 */

	 function loadSong(id, songFile, title = ""){
	 	renderView(id, songFile, title);
	 }


	 function initialiseMediaElement(){
	 	s.player = jQuery('#wsr-media-element');
	 	s.player.mediaelementplayer({
			pluginPath: "/path/to/shims/",
			success: function(mediaElement, originalNode, instance) {
				s.player.on('ended', function(){
			 		jQuery.ajax({
						url: s.ajaxurl,
						type: 'POST',
						dataType: 'json',
						data: {
					    	action: 'wsrcfr_action',
					    	security: s.ajax_nonce,
					    	currentid: s.currentPostId
					    }
					})
					.done(function(res) {
						console.log("Auto next song ");
						if (res.data != null){
							wsrcfr_audioplayer.loadSong(res.data.id, res.data.url, res.data.title);
						}
					})
					.fail(function(err, errtext) {
						console.log("error loading next song");
					})
					.always(function(err) {
						console.log("Next song loaded");
					});
				});
			}
		});
	 }

	 
	 /***********************************************************
	 * Public methods
	 */
	 return{
	 	init : init,
	 	loadSong: loadSong
	 }

})();