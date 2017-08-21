<script id="wsr-tmpl-audioplayer" type="text/x-handlebars-template">
<p id="songtitle">{{songtitle}}</p>
<audio src="{{track}}" width="320" height="20"
		id="wsr-media-element"
		class="mejs__player"
		pluginPath="/path/to/shims/" 
		alwaysShowControls="true"
		autoPlay="true"></audio>
</script>