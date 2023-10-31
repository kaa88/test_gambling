<?php
get_template_part('parts/header');
?>

<main class="main page-post">

	<section class="main__post post">
		<div class="post__container container">

			<div class="post__title-image">
				<div class="post__header">
					<a href="<?php echo home_url() ?>"><?php _e('Назад', 'wp_custom_theme') ?></a>
				</div>
				<?php if (has_post_thumbnail()) {
					echo '<img src="';
					the_post_thumbnail_url();
					echo '" alt="">';
				}; ?>
			</div>

			<div class="post__content">
				<h1 class="post__title"><?php the_title() ?></h1>
				<?php the_content() ?>
			</div>

		</div>
	</section>

</main>

<?php get_template_part('parts/footer');