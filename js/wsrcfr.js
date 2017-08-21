var wsrcfr = (function(){
	
	/***********************************************************
	 * Settings
	 */
	var s = {}
	var router;
	var CurrentLink;

	function init(ajaxVars){
		initaliseSetings(ajaxVars);
	 	setupBindings();
	 	initialiseModules();
	 	initialiseRouter();
	 	initialiseHandlebarsHelpers();
	 	//renderView();
	 }


	/***********************************************************
	 * Events
	 */
	 function setupBindings(){
	 	jQuery('#menu-main a').on('click', function(e){
	 		e.preventDefault();
	 		if (this.pathname.indexOf('records/singles') !== -1){
	 			this.pathname = '/records/singles/page/' + s.singlePage;
	 		}
	 		if (this.pathname.indexOf('records/blog') !== -1){
	 			this.pathname = '/records/blog/page/' + s.postPage;
	 		}

	 		router.navigate(this.protocol + '//' + this.hostname + this.pathname, true);
	 	});

	 	jQuery('#wsrcfr').on('click', '.music-file', function(e){
	 		e.preventDefault();
	 		e.stopPropagation();
	 		wsrcfr_audioplayer.loadSong(jQuery(this).data('id'), jQuery(this).data('song'));

	 	});

	 	jQuery('#wsrcfr').on('click', '#wsrcfr-content a', function(e){
	 		if (!redirectExternal(jQuery(this))){
	 			e.preventDefault();
	 			router.navigate(this.protocol + '//' + this.hostname + this.pathname, true);
	 	 	}
	 	});

	 	jQuery('#wsrcfr').on('click', '#nextsingle', function(e){
	 		e.preventDefault();
	 		e.stopPropagation();
	 		var page = jQuery(this).data('page');
	 		page = parseInt(page) + 1;
			s.singlePage = page;
	 		router.navigate(s.siteurl +'/singles/page/' + page, true);
	 	});

	 	jQuery('#wsrcfr').on('click', '#previoussingle', function(e){
	 		e.preventDefault();
	 		e.stopPropagation();
	 		var page = jQuery(this).data('page');
	 		page = parseInt(page) - 1;
			s.singlePage = page;
	 		router.navigate(s.siteurl +'/singles/page/' + page, true);
	 	});

	 	jQuery('#wsrcfr').on('click', '#nextblog', function(e){
	 		e.preventDefault();
	 		e.stopPropagation();
	 		var page = jQuery(this).data('page');
	 		page = parseInt(page) + 1;
			s.postPage = page;
	 		router.navigate(s.siteurl +'/blog/page/' + page, true);
	 	});

	 	jQuery('#wsrcfr').on('click', '#previousblog', function(e){
	 		e.preventDefault();
	 		e.stopPropagation();
	 		var page = jQuery(this).data('page');
	 		page = parseInt(page) - 1;
			s.postPage = page;
	 		router.navigate(s.siteurl +'/blog/page/' + page, true);
	 	});
	 }


	/***********************************************************
	 * Routes
	 */

	function initialiseRouter(){
	 	//var slug = window.location.pathname.replace("records/", "");
	 	var root = s.siteurl;
		var useHash = false; // Defaults to: false
		var hash = '#!'; // Defaults to: '#'
		router = new Navigo(root, useHash, hash);

		//main menu
		router
			.on({
				'albums/': function () {
			  		getData('albums');
				},
				'singles/page/:id': function (params, query) {
			 		getSingles(params.id);
				},
				'singles/': function (params, query) {
			 		getSingles(1);
				},
				'singles/:id': function (params, query) {
			 		getSingle(params.id);
				},
				'blog/page/:id': function (params, query) {
			 		getPosts(params.id);
				},
				'blog/': function () {
			 		getPosts(1);
				},
				'blog/:id': function (params, query) {
			 		getPost(params.id);
				},
				'contact/': function () {
			 		getData('contact');
				},
				'/': function () {
					getData('studio');
				},

			})
			.resolve();

			router.notFound(function () {
				router.pause();
				window.open(window.location.href, '_blank');
				router.resume();
			});
	}


	/***********************************************************
	 * Ajax
	 */
	 //pages
	function getData(id){
		beforeAjax();
		jQuery.ajax({
			url: s.siteurl + '/wp-json/wp/v2/pages?slug=' + id,
			type: 'GET',
			dataType: 'json',
		})
		.done(function(res) {
			console.log("success");
			renderView(res);
		})
		.fail(function(err, errtext) {
			console.log("error");
			var result = {'success': false, 'err': errtext};
			return result;
		})
		.always(function(err) {
			console.log("complete");
			afterAjax();
		});
	}


	function getSingles(page){
		s.singlePage = page;
		beforeAjax();
		jQuery.ajax({
			url: s.siteurl + '/wp-json/wp/v2/cfr_music?_embed&per_page=20&page=' + page,
			type: 'GET',
			dataType: 'json',
		})
		.done(function(res, status, request) {
			console.log("success");
			//request.getResponseHeader('link');
			var totalpage = request.getResponseHeader('X-WP-TotalPages')
			var data = {
				'page': page,
				'maxpages': totalpage,
				'tracks': res
			}
			renderSinglesView(data);
		})
		.fail(function(err, errtext) {
			console.log("error");
			var result = {'success': false, 'err': errtext};
			return result;
		})
		.always(function(err) {
			console.log("complete");
			afterAjax();
		});
	}

	function getSingle(id){
		beforeAjax();
		jQuery.ajax({
			url: s.siteurl + '/wp-json/wp/v2/cfr_music/' + id + '?_embed',
			type: 'GET',
			dataType: 'json',
		})
		.done(function(res) {
			console.log("success");
			renderSingleView(res);
		})
		.fail(function(err, errtext) {
			console.log("error");
			var result = {'success': false, 'err': errtext};
			return result;
		})
		.always(function(err) {
			console.log("complete");
			afterAjax();
		});
	}


	//posts
	function getPosts(page){
		s.postPage = page;
		beforeAjax();
		var self = this;
		jQuery.ajax({
			url: s.siteurl + '/wp-json/wp/v2/posts?_embed&page=' + page,
			type: 'GET',
			dataType: 'json',
		})
		.done(function(res, txtStatus, request) {
			console.log("success");
			var totalpage = request.getResponseHeader('X-WP-TotalPages')
			var data = {
				'page': page,
				'maxpages': totalpage,
				'posts': res
			}
			renderBlogView(data);
		})
		.fail(function(err, errtext) {
			console.log("error");
			var result = {'success': false, 'err': errtext};
			return result;
		})
		.always(function(err) {
			console.log("complete");
			afterAjax();
		});
	}


	function getPost(id){
		beforeAjax();
		var self = this;
		self.id = id;
		if (!self.id){
			self.id = '';
		}
		jQuery.ajax({
			url: s.siteurl + '/wp-json/wp/v2/posts/' + self.id,
			type: 'GET',
			dataType: 'json',
		})
		.done(function(res) {
			console.log("success");
			renderBlogSingleView(res)
		})
		.fail(function(err, errtext) {
			console.log("error");
			var result = {'success': false, 'err': errtext};
			return result;
		})
		.always(function(err) {
			console.log("complete");
			afterAjax();
		});
	}


	 /***********************************************************
	 * View
	 */
	function renderView(data){
		if (data){
			var source = jQuery("#wsr-tmpl").html();
			var template = Handlebars.compile(source);
			var html = template(data[0]);
			jQuery('#wsrcfr-content').html(html);
    	}else{
    		jQuery('#wsrcfr-content').html('error');
    	}
	}

	function renderSinglesView(data){
		if (data){
			var source = jQuery("#wsr-tmpl-singles").html();
			var template = Handlebars.compile(source);
			var html = template({music: data.tracks, page: data.page, maxpages: data.maxpages, siteurl: s.siteurl});
			jQuery('#wsrcfr-content').html(html);
			setMasonary();
    	}else{
    		jQuery('#wsrcfr-singles').html('error');
    	}
	}

	function renderSingleView(data){
		if (data){
			var source = jQuery("#wsr-tmpl-single").html();
			var template = Handlebars.compile(source);
			var html = template(data);
			jQuery('#wsrcfr-content').html(html);
    	}else{
    		jQuery('#wsrcfr-content').html('error');
    	}
	}

	function renderBlogView(data){
		if (data){
			var source = jQuery("#wsr-tmpl-blog").html();
			var template = Handlebars.compile(source);
			var html = template({blog: data.posts, page: data.page, maxpages: data.maxpages, siteurl: s.siteurl});
			jQuery('#wsrcfr-content').html(html);
			setMasonary();
    	}else{
    		jQuery('#wsrcfr-content').html('error');
    	}
	}

	function renderBlogSingleView(data){
		if (data){
			var source = jQuery("#wsr-tmpl").html();
			var template = Handlebars.compile(source);
			var html = template(data);
			jQuery('#wsrcfr-content').html(html);
    	}else{
    		jQuery('#wsrcfr-content').html('error');
    	}
	}


	/***********************************************************
	 * Functions
	 */

	function initaliseSetings(ajaxVars){
	 	s.ajaxurl = ajaxVars.ajaxurl;
		s.ajax_nonce = ajaxVars.ajax_nonce;
	 	s.siteurl = ajaxVars.siteurl;
	 	s.path = ajaxVars.path;
	 	s.postPage = 1;
	 	s.singlePage = 1;
	 }

	 function initialiseHandlebarsHelpers(){
	 	Handlebars.registerHelper('thumbnail', function(embedded) {
	 		if (embedded && embedded['wp:featuredmedia']){
				return embedded['wp:featuredmedia'][0].media_details.sizes.thumbnail.source_url;
	 		}
		});

		Handlebars.registerHelper('blogTitle', function(title) {
			if (title == ''){
				return 'No Title';
			}
				return title;
		});

		Handlebars.registerHelper('nextpage', function(page, maxpages) {
			if (page < maxpages){
				return '<span id="nextsingle"  data-page="' + page + '">Load More ></span>';
			}
		});

		Handlebars.registerHelper('previouspage', function(page, maxpages) {
			if (page > 1){
				return '<span id="previoussingle" data-page="' + page + '">< Load Previous</span>';
			}
		});

		Handlebars.registerHelper('nextblogpage', function(page, maxpages) {
			if (page < maxpages){
				return '<span id="nextblog"  data-page="' + page + '">Load More ></span>';
			}
		});

		Handlebars.registerHelper('previousblogpage', function(page, maxpages) {
			if (page > 1){
				return '<span id="previousblog" data-page="' + page + '">< Load Previous</span>';
			}
		});

	 }

	 function initialiseModules(){
	 	wsrcfr_audioplayer.init('#wsrcfr-audioplayer', s);
	 }

	 function displayLoading(){
		jQuery('#wsrcfr-content').html('Loading .....');
	}

	function redirectExternal($this){
	 	var result = false;
	 	if ($this.attr('href').indexOf(s.siteurl) ===-1){
			result = true;
		}
		return result;
	}

	function beforeAjax(){
		displayLoading();
	}

	function afterAjax(){
	}

	function setMasonary(){
		var masonryContainer = jQuery('.grid');
	    if (masonryContainer.length){
	    	imagesLoaded( masonryContainer, function() {
		    	masonryContainer.masonry({
		    		 itemSelector: '.grid-item'
		    	});
		    });
		}
	}

	 /***********************************************************
	 * Public methods
	 */
	 return{
	 	init : init
	 }

})();

jQuery(function(){
	wsrcfr.init(wsrcfr_ajax);
});