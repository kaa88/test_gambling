<?php
/* ШПАРГАЛКА
get_field('field')
the_field('field')
the_field('button_link', 'link')
echo get_template_directory_uri()
echo carbon_get_theme_option('field')
echo home_url()
...
проверка:
<?php
	$fields = [
		get_field('footer_email_link', 'theme'),
		get_field('footer_email_text', 'theme'),
	];
	if (check_fields($fields)):
?>
	// html... <?php echo $fields[0] ?>
<?php endif; ?>
...
картинка:
	<?php 
		$image = get_field('clients_item1_img');
		if ($image) echo '<img src="' . $image . '" alt="" loading="lazy">';
	?>
...
цикл:
	$list = get_field('list');
	if ($list) {
		for ($i = 0; $i < count($list); $i++) {
			echo '<img src="' . $list[$i]['img'] .'">';
		}
	}
		// или:
		foreach ($list as $item) {
			echo '<img src="' . $item['img'] .'">';
		}
	// или:
	<?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>
	<?php endwhile; endif; ?>
*/

//////////////////////////////////////////////////

use Carbon_Fields\Container;
use Carbon_Fields\Field;

// Functions "get_field" and "the_field" allow easy switch between Cabron Fields and ACF.
function get_field($name, $type = 'default') {
	if ($type == 'theme')
		return carbon_get_theme_option($name);
	if ($type == 'link')
		return get_permalink(carbon_get_the_post_meta($name)[0]['id']);
	else
		return carbon_get_the_post_meta($name);
}
function the_field($name, $type = 'default') {
	if ($type == 'theme')
		echo carbon_get_theme_option($name);
	if ($type == 'link')
		echo get_permalink(carbon_get_the_post_meta($name)[0]['id']);
	else
		echo carbon_get_the_post_meta($name);
}
function check_fields($arr = []) {
	if (count($arr) == 0) return false;
	foreach ($arr as $v) {
		if (!$v) return false;
	}
	return true;
}

//////////////////////////////////////////////////

function add_custom_fields() {

	// Custom fields container
	Container::make('theme_options', __('Кастомные поля', 'wp_custom_theme'))
		->set_page_menu_title(__('Кастомные поля', 'wp_custom_theme'))
		->set_icon('dashicons-align-right')

	// Header tab
		->add_tab(__('Шапка', 'wp_custom_theme'), [
			Field::make('image', 'header_logo_img', __('Иконка логотипа', 'wp_custom_theme'))->set_value_type('url'),
			Field::make('text', 'header_logo_text', __('Текст логотипа', 'wp_custom_theme')),
		])

	// Footer tab
		->add_tab(__('Подвал', 'wp_custom_theme'), [
			Field::make('text', 'footer_address', __('Адрес', 'wp_custom_theme')),
			Field::make('text', 'footer_phone_link', __('Телефон - ссылка', 'wp_custom_theme'))->set_width(50)
				->set_help_text(__('Формат телефона для ссылки: +79999999999', 'wp_custom_theme')),
			Field::make('text', 'footer_phone_text', __('Телефон - отображаемый текст', 'wp_custom_theme'))->set_width(50),
			Field::make('text', 'footer_email_link', __('Email - ссылка', 'wp_custom_theme'))->set_width(50),
			Field::make('text', 'footer_email_text', __('Email - отображаемый текст', 'wp_custom_theme'))->set_width(50),

			Field::make('separator', 'separator_footer_socials', __('Соцсети', 'wp_custom_theme')),
			Field::make('complex', 'footer_socials', __('Соцсети', 'wp_custom_theme'))
				->add_fields([
					Field::make('select', 'name', __('Выберите', 'wp_custom_theme'))->set_width(50)
						->set_options([
							'twitter' => 'Twitter',
							'facebook' => 'Facebook',
							'pinterest' => 'Pinterest',
							'google-plus' => 'Google+'
						]),
					Field::make('text', 'link', __('Ссылка', 'wp_custom_theme'))->set_width(50)
						->set_help_text(__('Введите адрес полностью, начиная с https://', 'wp_custom_theme')),
				]),

		])

	// Metrics tab
		->add_tab(__('Метрики', 'wp_custom_theme'), [
			Field::make('header_scripts', 'metrics', __('HTML-код метрик и счетчиков поисковых систем', 'wp_custom_theme'))
				->set_default_value(__('<!-- Здесь будут метрики поисковых систем -->', 'wp_custom_theme'))
				->set_rows(20)
		]);

//////////////////////////////////////////////////
	// Editor fields:

	// Banner section
		Container::make('post_meta', __('Баннер', 'wp_custom_theme'))
			->where('post_id', '=', 15)
			->set_priority('core')
			->add_fields([
				Field::make('text', 'banner_title', __('Заголовок', 'wp_custom_theme')),
				Field::make('text', 'banner_text', __('Текст', 'wp_custom_theme')),

				Field::make('text', 'banner_button_text', __('Кнопка - текст', 'wp_custom_theme')),
				Field::make('association', 'banner_button_link', __('Кнопка - ссылка', 'wp_custom_theme'))
					->set_max(1)
					->set_types([[
						'type' => 'post',
						'post_type' => 'page'
					]]),

				Field::make('image', 'banner_bg_dt', __('Фоновое изображение десктопный размер', 'wp_custom_theme'))
					->set_value_type('url')
					->set_width(50),
				Field::make('image', 'banner_bg_mob', __('Фоновое изображение мобильный размер', 'wp_custom_theme'))
					->set_value_type('url')
					->set_width(50),
			]);

} // end add_custom_fields()