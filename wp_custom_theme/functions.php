<?php

// Cleaning //
require_once 'functions/wp_clean.php';
// Manually delete readme.html from WP root

//////////////////////////////////////////////////

// Support //
add_action('after_setup_theme', function() {
	add_theme_support('title-tag'); // заполняет title при wp_head()
	add_theme_support('post-thumbnails'); // поддержка миниатюр для постов
	add_theme_support('html5', [ // поддержка html5
		'comment-list','comment-form','search-form','gallery','caption','script','style',
	]);
	add_theme_support('admin-bar', ['callback'=>'__return_false']); // убирает верхний отступ админ-бара
});

//////////////////////////////////////////////////

// Site styles & scripts //
add_action('wp_enqueue_scripts', function() {
	$version = 1; // прибавить 1 после внесения изменений в стили или скрипты
	$min = ''; //.min - вписать для минификации
	$tdir = get_template_directory_uri() . '/assets';
	$cssdir = $tdir.'/css/website.style'.$min.'.css';
	$jsdir = $tdir.'/js/website.script'.$min.'.js';

	wp_enqueue_style( 'main-style', $cssdir, [], $version );
	wp_enqueue_script( 'main-script', $jsdir, [], $version, true );
	
	// wp_enqueue_style('dashicons'); // WP icons
});

//////////////////////////////////////////////////

// Media files //
// Пояснение: ВП сжимает только нарезанные картинки, исходная не будет сжата, поэтому нужен плагин.
// Если плагин сжимает все размеры, то нужно отключить ВП-шное сжатие.
// Если приходится менять размеры и ребилдить нарезку (плагин Force regenerate thumbnails), то сначала нужно восстановить все сжатые изображения, чтобы не было потери качества. Для этого нужно делать резервное копирование исходной картинки и отключить автоудаление копий. Чтобы не было проблем со scaled при ребилде, можно отключить scaled и сделать ограничение на размер загрузки (2мб например).

// Ограничение на размер файла в php.ini или .htaccess (в .htaccess в начале каждой строки добавить 'php_value'):
// upload_max_filesize 2M
// post_max_size 3M
// memory_limit 5M // должно быть больше, чем upload_max_filesize и post_max_size

// Плагин reSmush.it (бесплатно в облаке для всех изображений до 5мб) - сжимает только оригинал или scaled.
// Плагин WP Optimize - сжимает оригинал и нарезки, с ним отключить встроенное сжатие; делает бэкап только оригинала (плагин тормозит)

add_filter('jpeg_quality', create_function('', 'return 80;')); // встроенное сжатие WP... ставлю 80, если использую reSmush.it

// Встроенные размеры в настройках: 150 300 1024
// Встроенные размеры в ядре: 768 1536 2048 2560

// Изменение стандартных размеров ВП:
add_filter('intermediate_image_sizes', function($sizes){
	return array_diff( $sizes, [
	// размеры, которые нужно отключить:
		'medium_large',
		'1536x1536',
		'2048x2048',
	]);
});

// image-scaled:
// add_filter('big_image_size_threshold', function(){ return 1536; }); // изменить размер '-scaled' (по умолчанию 2560)
add_filter('big_image_size_threshold', '__return_zero'); // убрать размер '-scaled'

// Мои размеры:
// add_image_size('theme-image-size-s', 350, 0);
// add_image_size('theme-image-size-m', 700, 0);
// add_image_size('theme-image-size-l', 1024, 0);
// add_image_size('theme-image-size-xl', 1600, 0);
// add_image_size('theme-image-size-xxl', 1920, 0);
// add_image_size('theme-image-size-max', 3840, 0);

// Размер медиафайлов по умолчанию в редакторе ВП:
// add_action('after_setup_theme', function() {
// 	update_option('image_default_size', 'medium'); // default: full-size
// });

//////////////////////////////////////////////////

// Области Меню //
add_action('after_setup_theme', function() {
	register_nav_menus([
		'header-menu' => 'Шапка',
		// 'footer-menu' => 'Подвал',
	]);
});

//////////////////////////////////////////////////

// Carbon fields //
// require_once 'functions/carbon_fields.php';
// add_action('carbon_fields_register_fields', 'add_custom_fields');

//////////////////////////////////////////////////

// Exerpt style //
// add_filter('excerpt_length', function() { return 20; });
// add_filter('excerpt_more', function($more) { return '...'; });

//////////////////////////////////////////////////

// WP Term Image - поддержка миниатюр для таксономий //
// require_once __DIR__ . '/functions/wp_term_image.php';
// add_action('admin_init', 'kama_wp_term_image');
// function kama_wp_term_image(){
// 	// Укажем для какой таксономии нужна возможность устанавливать картинки.
// 	// Можно не указывать, тогда возможность будет автоматом добавлена для всех публичных таксономий.
// 	\Kama\WP_Term_Image::init([
// 		// 'taxonomies' => [ 'post_tag' ],
// 	]);
// };

//////////////////////////////////////////////////

// New taxonomy //
// add_action( 'init', function(){
// 	register_taxonomy( 'portfolio_type', [ 'portfolio' ], [
// 		'labels' => [
// 			'name'              => 'Виды работ',
// 			'singular_name'     => 'Вид работы',
// 			'menu_name'         => 'Виды работ',
// 			'search_items'      => 'Искать виды работ',
// 			'all_items'         => 'Все виды работ',
// 			'view_item'         => 'Смотреть вид работы',
// 			'edit_item'         => 'Редактирование вида работы',
// 			'add_new_item'      => 'Добавление вида работы',
// 			'new_item_name'     => 'Новый вид работы',
// 			'back_to_items'     => 'Назад к видам',
// 		],
// 		'public'               => true,
// 		// 'hierarchical'         => false,
// 	] );
// });

//////////////////////////////////////////////////

// New post type //
// add_action('init', function() {
// 	register_post_type('portfolio', [
// 		'labels' => [
// 			'name'               => 'Портфолио', // основное название для типа записи
// 			'singular_name'      => 'Портфолио', // название для одной записи этого типа
// 			'menu_name'          => 'Портфолио', // название меню
// 			'add_new'            => 'Добавить работу', // для добавления новой записи
// 			'add_new_item'       => 'Добавление работы', // заголовка у вновь создаваемой записи в админ-панели.
// 			'edit_item'          => 'Редактирование работы', // для редактирования типа записи
// 			'new_item'           => 'Новая работа', // текст новой записи
// 			'view_item'          => 'Смотреть работу', // для просмотра записи этого типа.
// 			'search_items'       => 'Искать работу', // для поиска по этим типам записи
// 			'not_found'          => 'Не найдено', // если в результате поиска ничего не было найдено
// 			'not_found_in_trash' => 'Не найдено в корзине', // если не было найдено в корзине
// 		],
// 		'public'              => true,
// 		'menu_position'       => 5,
// 		'menu_icon'           => 'dashicons-carrot',
// 		'supports'            => ['title', 'editor','thumbnail','excerpt'], // 'title','editor','author','thumbnail','excerpt','trackbacks','custom-fields','comments','revisions','page-attributes','post-formats'
// 		'has_archive'         => true,
// 	]);
// });
