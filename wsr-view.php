<div id="wsrcfr">
	<div id="wsrcfr-audioplayer"></div>
	<div id="wsrcfr-content"></div>
</div>

<script id="wsr-tmpl" type="text/x-handlebars-template">
	{{#if title.rendered}} {{{title.rendered}}} {{/if}}
	{{#if content.rendered}} {{{content.rendered}}} {{/if}}
</script>

<script id="wsr-tmpl-blog" type="text/x-handlebars-template">
	<div id="pagesof">{{{previousblogpage page maxpages}}} 
	Pages {{page}} of {{maxpages}}
	{{{nextblogpage page maxpages}}}
	</div>
	<div class="grid">
	{{#each blog}}
		<div class="grid-item">
			<h2><a href="{{../siteurl}}/blog/{{id}}">{{blogTitle title.rendered}}</a></h2>
			<a href="{{../siteurl}}/blog/{{id}}"><img src="{{thumbnail _embedded}}" /></a>
			<p>{{date}}</p>
			{{#if excerpt.rendered}} {{{excerpt.rendered}}} {{/if}}
			<hr />
		</div>
	{{/each}}
	</div>
	Pages {{page}} of {{maxpages}}
	{{{previousblogpage page maxpages}}} 
	{{{nextblogpage page maxpages}}}
</script>

<script id="wsr-tmpl-singles" type="text/x-handlebars-template">
	<div id="pagesof">{{{previouspage page maxpages}}} 
	Pages {{page}} of {{maxpages}}
	{{{nextpage page maxpages}}}
	</div>
	<div class="grid">
	{{#each music}}
		<div class="grid-item">
		<!-- <a href="{{../siteurl}}/singles/{{id}}"></a> -->
			<div class="music-file song-title" data-id="{{id}}" data-song="{{music_file}}"><h2>{{title.rendered}}</h2></div>
			<div class="music-file" data-id="{{id}}" data-song="{{music_file}}"><img src="{{thumbnail _embedded}}" /></div>
			<div class="music-file" data-id="{{id}}" data-song="{{music_file}}">Click here to play song</div>
			{{#if content.rendered}} {{{content.rendered}}} {{/if}}
			<hr />
		</div>
	{{/each}}
	</div>
	{{{previouspage page maxpages}}}
	{{{nextpage page maxpages}}}
</script>

<script id="wsr-tmpl-single" type="text/x-handlebars-template">
	<img src="{{thumbnail _embedded}}" />
	{{#if title.rendered}} <h1>{{{title.rendered}}}</h1> {{/if}}
	<div class="music-file" data-id="{{id}}" data-song="{{music_file}}">Click here to play song</div>
	{{#if content.rendered}} {{{content.rendered}}} {{/if}}
</script>