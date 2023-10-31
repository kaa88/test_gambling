<?php
get_template_part('parts/header');

// index.php
// Здесь должны быть блоки: is_search, is_archive(рубрики, метки, автор)

// Search
if ( is_search() ) {
	global $wp_query;
	
	if ( $wp_query->found_posts ) {
		print_r('<br>Найдено: ' . $wp_query->found_posts . ' совпадений');
	}
}

// Archive
if ( have_posts() ) : while ( have_posts() ) : the_post();
?>

	<section class="wp-post">
		<div class="wp-post__container container">
			<h2 class="wp-post__title"><?php the_title() ?></h2>
			<?php the_content() ?>
			<?php the_author_posts_link(); ?>
		</div>
	</section>

<?php endwhile; else : ?>
	<p>Записей нет.</p>
<?php endif;


get_template_part('parts/footer');