<?php 
/*
Plugin Name: Cheese Factory Records
Plugin URI: http://websector.com
Description: 
Version: 1.0.0
Author: WSR
Author URI: http://websector.com
License: A short license name. Example: GPL2
*/


defined( 'ABSPATH' ) or die( 'No script kiddies please!' );

class WSR_cfr{

	var $settings;

	public function __construct(){
 		//plugin settings
		$this->settings = array(
			'path'	=>  plugins_url() . '/wsr-cheesefactoryrecords',
			'dir'	=> dirname( __FILE__ ),
			'currentUrl' => "http://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]"
		);

		//actions
		add_action( 'wp_enqueue_scripts', array( $this, 'register_cfr_scripts' ) );
		add_action('init', array( $this, 'wsr_music_custom_post'));
		add_action('init', array( $this, 'wsr_music_type_taxonomy'));
		add_action( 'rest_api_init', array( $this, 'create_api_posts_meta_field' ));

		add_shortcode('wsr_cheesefatory_records', array($this, 'wsr_cfr_shortcode'));
		add_action( 'wp_ajax_wsrcfr_action', array($this, 'wsrcfr_ajax_callback' ));
		add_action( 'wp_ajax_nopriv_wsrcfr_action', array($this, 'wsrcfr_ajax_callback' ));
	}


	/***********************************************************
	 *  Register scritps for plugins
	 */
	function register_cfr_scripts(){
		wp_enqueue_script('jquery');
		//change these to enqueue if not restricted to shortcode
		wp_register_style( 'wsrcfr-css', $this->settings['path'] . '/css/wsrcfr.css' );

		wp_register_script( 'wsrcfr-navigo-js', $this->settings['path'] . '/js/jq/navigo.min.js', array(), '1', true );
		wp_register_script( 'wsrcfr-handlebars-js', $this->settings['path'] . '/js/jq/handlebars-v4.0.10.js', array('jquery'), '4.0.10', true );
		wp_register_script( 'wsrcfr-audioplayer-js', $this->settings['path'] . '/js/wsrcfr-audioplayer.js', array('jquery', 'wp-mediaelement', 'wsrcfr-handlebars-js', 'wsrcfr-navigo-js'), '1', true );

		wp_register_script( 'wsrcfr-imagesloaded-js', $this->settings['path'] . '/js/jq/imagesloaded.pkgd.min.js', array(), '1', true );
		wp_register_script( 'wsrcfr-masonry-js', $this->settings['path'] . '/js/jq/masonry.pkgd.min.js', array('wsrcfr-imagesloaded-js'), '1', true );
		wp_register_script( 'wsrcfr-js', $this->settings['path'] . '/js/wsrcfr.js', array('wsrcfr-audioplayer-js', 'wsrcfr-masonry-js'), '1', true );
	}


	/***********************************************************
	 * shortcode generic function
	 */
	function wsr_cfr_shortcode($atts){

		$a = shortcode_atts( array(
	        'element' => '#wsrcfr'
	    ), $atts );
		//$to_use = $a['element'];

		//Enqueue any scripts needed - Note, need to register the script first then enqueue here	
		wp_enqueue_style( 'wsrcfr-css');
		wp_enqueue_style( 'wp-mediaelement' );
		wp_enqueue_script('wp-mediaelement');
		wp_enqueue_script( 'wsrcfr-audioplayer-js'); 
		wp_enqueue_script( 'wsrcfr-imagesloaded-js'); 
		wp_enqueue_script( 'wsrcfr-masonry-js'); 
		wp_enqueue_script( 'wsrcfr-js'); 
		wp_localize_script('wsrcfr-js', 'wsrcfr_ajax', array(	
			"ajaxurl" => admin_url('admin-ajax.php'),
			"ajax_nonce" => wp_create_nonce('security-897685765q6fyeuygkh787f'),
			"siteurl" => get_bloginfo('url'),
			"path" => $this->settings['path']
		));

		ob_start(); ?> 
		<?php 
		include('wsr-view.php'); 
		include('wsr-audioplayer-view.php')
		?>
		<?php return ob_get_clean();
	}


	/***********************************************************
	 *  Form ajax callback function
	 */	
	function wsrcfr_ajax_callback(){
		check_ajax_referer( 'security-897685765q6fyeuygkh787f', 'security' );
		$currentid = $_POST['currentid'];
		$nextSong = $this->getNextSong($currentid);

		wp_send_json_success($nextSong);
		wp_die();
	}


	function getNextSong($currentId){
		global $post;
		$post = get_post($currentId);
		$postObject = get_adjacent_post();
		$track;
		$title;
		if ($postObject){
			$track = get_field('music', $postObject->ID);
			if ($track){
				return array('id' => $postObject->ID, 'url' => $track, 'title' => $postObject->post_title);
			}else{
				return $this->getNextSong($postObject->ID);
			}
		}
	}


	/***********************************************************
	 *  Create custom posts for music and sessions
	 */	
	function wsr_music_custom_post(){

		$labels = array(
			'name'	=> 'Music',
			'singular_name'	=> 'Music',
			'add_new_item'	=> 'Add New Music',
			'edit_item'	=> 'Edit Music',
			'new_item'	=> 'New Music',
			'view_item'	=> 'View Music',
			'search_items'	=> 'Search Music',
			'not_found'	=> 'No Music found',
			'not_found_in_trash' => 'No Music found in trash',
			'all_items' => 'All Music',
			'archives' => 'Music Archives',
			'insert_into_item' => 'Insert into Music',
			'uploaded_to_this_item' => 'Upload into this Music'
		);

		register_post_type( 'cfr_music', array(
			'label'		=> 'Music',
			'labels'	=> $labels,
			'description'	=> 'Music entries',
			'public'	=> true,
			'has_archive'	=> true,
			'show_ui' => true,
			'show_in_nav_menus'	=> true,
			'show_in_rest' => true,
			'menu_icon'	=> 'dashicons-format-audio',
			'taxonomies'	=> array('cfr_music_type'),
			'supports' => array('title', 'editor','thumbnail')
		));
	}

	function wsr_music_type_taxonomy(){
			$taxonomy_object_types = array(
		    	'cfr_music'
		     );
			$taxonomy_args = array(
		    	'show_ui' 		=> true,
		    	'show_admin_column' => true,
		      	'hierarchical' 	=> true,
		       	'label' 		=> 'Type',
		       );

	    register_taxonomy('cfr_music_type', $taxonomy_object_types, $taxonomy_args);

	}

	function create_api_posts_meta_field() {
		// register_rest_field ( 'name-of-post-type', 'name-of-field-to-return', array-of-callbacks-and-schema() )
		register_rest_field( 'cfr_music', 'music_file', array(
			'get_callback' => array($this, 'get_post_meta_for_api'),
			'schema' => null,
		));
	}

	function get_post_meta_for_api( $object ) {
		//get the id of the post object array
		$post_id = $object['id'];
		//return the post meta

		return get_field('music', $post_id);
	}

}

$wsr_cfr = new WSR_cfr();








