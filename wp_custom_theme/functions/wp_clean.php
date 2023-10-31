<?php
// Скрыть версию wordpress:
remove_action('wp_head', 'wp_generator');
add_filter('the_generator', '__return_empty_string');
add_filter('script_loader_src', 'remove_wp_version_strings');
add_filter('style_loader_src', 'remove_wp_version_strings');
function remove_wp_version_strings($src) {
	parse_str(parse_url($src, PHP_URL_QUERY), $query);
	if (!empty($query['ver']) && $query['ver'] === $GLOBALS['wp_version']) {
		$src = remove_query_arg('ver', $src);
	}
	return $src;
}
// Cкрыть разные линки при отображении постов блога (следующий, предыдущий, короткий url):
remove_action('wp_head','start_post_rel_link',10);
remove_action('wp_head','index_rel_link');
remove_action('wp_head','adjacent_posts_rel_link_wp_head',10);
remove_action('wp_head','wp_shortlink_wp_head',10);
// Emoji:
remove_action('wp_head','print_emoji_detection_script',7);
remove_action('admin_print_scripts','print_emoji_detection_script');
remove_action('wp_print_styles','print_emoji_styles');
remove_action('admin_print_styles','print_emoji_styles');
remove_filter('wp_mail','wp_staticize_emoji_for_email');
remove_filter('the_content_feed','wp_staticize_emoji');
remove_filter('comment_text_rss','wp_staticize_emoji');
add_filter('emoji_svg_url','__return_false');
// Other:
remove_action('wp_head','feed_links_extra',3); // ссылки на rss категорий
remove_action('wp_head','feed_links',2); // ссылки на основной rss и комментарии
remove_action('wp_head','rsd_link');  // сервис Really Simple Discovery
remove_action('wp_head','wlwmanifest_link'); // Windows Live Writer
if (!is_admin()) {
	add_action('wp_enqueue_scripts', function() {
		wp_dequeue_style('global-styles'); // WP global styles (color, gradients)
	});
	remove_action('wp_body_open', 'wp_global_styles_render_svg_filters'); // SVG filters for Gutenberg
}