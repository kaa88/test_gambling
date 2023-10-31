let isLiteBuild = isWordPress = false, liteBuild_load = exportSettings = {};

// INFO //

// npm i --save-dev *plugin*

// npm i -g browser-sync
// browser-sync start --proxy "localhost" --files "**/*" --no-notify

// isLiteBuild:
// - добавляет переменную (isLiteBuild), с которой могут работать html-сборщик и scss-препроцессор
// - не минифицирует и не создает файлы .min.css и .min.js, не чистит html
// - не копирует (без доп настроек) libs, service, media (кроме img)
// - не сжимает изображения, но нарезает @1x и @2x
// - favicon нарезает только S-размер
// - не конвертирует шрифты, а копирует только базовый ttf; в scss отключает загрузку остальных шрифтов (чтобы не было ошибок в консоли), кроме iconfont

// isWordPress:
// - добавляет переменную (isWordPress), с которой могут работать html-сборщик и scss-препроцессор
// - меняет название папки билда
// - меняет части html кода на WordPress php-команды ... (в разработке)
// - меняет расширения html на php, а так же название 'index' на 'home'
// - копирует файлы шаблона для WordPress

///////////////////////////////////////////////////////

// Build settings //
const 
	scriptsPrefix = 'website.',
	faviconSizes = { L: 270, M: 180, S: 32 },
	jpgMinifyQuality = 80, // min 70 for good quality
	pngMinifyQuality = 5; // recommended

///////////////////////////////////////////////////////

isLiteBuild = true
// liteBuild_load.media = true
// liteBuild_load.libs = true
// liteBuild_load.service = true

// isWordPress = true

if (isWordPress) isLiteBuild = false // important

///////////////////////////////////////////////////////

// Includes //
const { src, dest } = require('gulp'),
	gulp = require('gulp'),
	browsersync = require('browser-sync').create(),
	streamqueue = require('streamqueue'),
	fs = require('fs'),
	del = require('del'),
	rename = require('gulp-rename'),
	fileinclude = require('gulp-file-include'), // html & js
	sass = require('gulp-sass')(require('sass')),
	autoprefixer = require('gulp-autoprefixer'), // css
	html_beautify = require('gulp-html-beautify'),
	clean_html = require('gulp-htmlmin'),
	clean_css = require('gulp-clean-css'),
	clean_js = require('gulp-uglify-es').default,
	ttf2woff = require('gulp-ttf2woff'),
	ttf2woff2 = require('gulp-ttf2woff2'),
	fonter = require('gulp-fonter'),
	imageresize = require('gulp-scale-images'),
	readMetadata = require('gulp-scale-images/read-metadata'), // gulp-scale-images
	through = require('through2'), // gulp-scale-images
	imagemin = require('gulp-imagemin-changba');

	// Когда-то использовал: (оставить здесь, удалить из package)
	// css_media_queries = require('gulp-group-css-media-queries')

///////////////////////////////////////////////////////

// Path //
let $source = '_src';
let $baseDir = {
	html: $source + '/',
	css: $source + '/css/',
	js: $source + '/js/',
	fonts: $source + '/fonts/',
	img: $source + '/media/img/',
	media: $source + '/media/',
	data: $source + '/data/',
	service: $source + '/service/',
	libs: $source + '/libs/',
}
let $exportSettings = {
	src: $source + '/loaded_modules.js',
	scss: $baseDir.css + '/gulp-settings.scss',
}
let $project = isWordPress ? 'assets' : 'dist';
let $path = {
	clean: ['./dist/', './assets/'],
	watch: {
		settings: $exportSettings.src,
		html: $baseDir.html + '**/*.html',
		css: $baseDir.css + '*.css',
		scss: $baseDir.css + '**/*.scss',
		js: $baseDir.js + '**/*.js',
		fonts_otf: $baseDir.fonts + 'otf/*.otf',
		fonts_ttf: $baseDir.fonts + '*.ttf',
		img: $baseDir.img + '**/*.{jpg,png,svg,gif,ico,webp}',
		media: $baseDir.media + '**/*.{mp4,avi,webm,ogg,mp3,pdf,txt,doc,docx,xls,xlsx,ppt,pptx,rtf}',
		data: $baseDir.data + '**/*',
		service: $baseDir.service + '**/*',
	},
	src: {
		html: [$baseDir.html + '**/*.html', '!' + $baseDir.html + '**/#*.html', '!' + $baseDir.html + '**/parts/*'],
		html_wp: [$baseDir.html + '**/*.html', '!' + $baseDir.html + '**/#*.html'],
		css: $baseDir.css + '*.css',
		scss: $baseDir.css + '*style.scss',
		js: $baseDir.js + '*.js',
		fonts_otf: $baseDir.fonts + 'otf/*.otf',
		fonts_ttf: $baseDir.fonts + '*.ttf',
		img: $baseDir.img + '**/*',
		img2x: $baseDir.img + '**/*@2x.*',
		img_uncompressed: $baseDir.img + '**/$*',
		img_favicon: $baseDir.img + 'favicon.png',
		media: [$baseDir.media + '**/*', '!' + $baseDir.media + 'img/**/*'],
		data: $baseDir.data + '**/*',
		service: [$baseDir.service + '**/*', $baseDir.service + '.htaccess'],
		libs: $baseDir.libs + '**/*',
	},
	build: {
		html: $project + '/',
		css: $project + '/css/',
		js: $project + '/js/',
		fonts: $project + '/fonts/',
		img: $project + '/media/img/',
		media: $project + '/media/',
		data: $project + '/data/',
		service: $project + '/',
		libs: $project + '/libs/',
	}
}

///////////////////////////////////////////////////////

function cb() {}

function getExtendedDir(name, dir) {
	dir = dir.replace($baseDir[name], '');
	let arr = dir.split('/').slice(0, -1);
	dir = arr.join('/') + '/';
	return dir;
}

function clean() {
	return del($path.clean);
}

function getSettings() {
	let settingsPath = './' + $exportSettings.src;
	delete require.cache[require.resolve(settingsPath)];
	exportSettings = require(settingsPath).settings; // export name
	exportSettings.isLiteBuild = isLiteBuild;
	exportSettings.isWordPress = isWordPress;
	return Promise.resolve('ok');
}

function setCssSettings() {
	let optionsStr = '// Do not change this file manually, Gulp will overwrite it. The main settings file is: ' + $exportSettings.src + '\r\n';
	for(let key in exportSettings) {
		optionsStr += '$' + key + ': ' + exportSettings[key] + ';\r\n';
	}
	fs.writeFile($exportSettings.scss, optionsStr, cb);
	return Promise.resolve('ok');
}

///////////////////////////////////////////////////////

function html(cb, file) {
	let filepath = isWordPress ? $path.src.html_wp : $path.src.html, extDir = '';
	if (file && !file.match(/\/#/)) {
		if (isWordPress || !isWordPress && !file.match(/\/parts\//)) {
			filepath = file;
			extDir = getExtendedDir('html', file);
		}
	}

	let stream = src(filepath);
	if (isWordPress) {
		stream = stream
			.pipe(rename(function(file) {
				if (file.basename == 'index') file.basename = 'home';
				file.extname = '.php';
			}))
	}
	else {
		stream = stream
			.pipe(fileinclude({
				indent: true,
				context: exportSettings
			}))
	}

	if (!isLiteBuild) {
		stream = stream
			.pipe(clean_html({
				removeComments: true,
				collapseWhitespace: true,
				preserveLineBreaks: true,
			}))
			.pipe(html_beautify({
				indent_with_tabs: true,
				indent_size: 1,
			}))
	}
	
	return stream
		.pipe(dest($path.build.html + extDir))
		.pipe(browsersync.stream())
}

///////////////////////////////////////////////////////

function css(cb, file) {
	let filepath = file ? file : $path.src.css;
	let extDir = file ? getExtendedDir('css', file) : '';
	return src(filepath)
		.pipe(clean_css())
		.pipe(rename({ extname: '.min.css' }))
		.pipe(dest($path.build.css + extDir))
		.pipe(browsersync.stream())
}

function scss() {
	let stream = src($path.src.scss)
		.pipe(sass({ outputStyle: 'expanded' }))
		.pipe(autoprefixer({
			overrideBrowserslist: ['last 5 versions'],
			cascade: true
		}))
		// .pipe(css_media_queries())
		// отключил т.к. считаю, что медиа должны быть сразу за эл-том
		.pipe(rename({ prefix: scriptsPrefix }))

	if (!isLiteBuild) {
		stream = stream
			.pipe(dest($path.build.css))
			.pipe(clean_css())
			.pipe(rename({ extname: '.min.css' }))
	}
	// пробовал объединить оригинал и .min в streamqueue, но rename меняет имя оригинала (т.к. копия объекта по ссылке), нужно ставить модуль gulp-clone наверное
	// для чего streamqueue? в browsersync проходит инфа только о последнем файле (.min), и если в html подключен не.min, не обновляет страницу (типо style.css не менялся)

	return stream
		.pipe(dest($path.build.css))
		.pipe(browsersync.stream())
}

///////////////////////////////////////////////////////

function js() {
	let stream = src($path.src.js)
		.pipe(fileinclude({
			indent: true,
			context: exportSettings
		}))
		.pipe(rename({ prefix: scriptsPrefix }))

	if (!isLiteBuild) {
		stream = stream
			.pipe(dest($path.build.js))
			.pipe(clean_js())
			.pipe(rename({ extname: '.min.js' }))
	}
	return stream
		.pipe(dest($path.build.js))
		.pipe(browsersync.stream())
}

///////////////////////////////////////////////////////

function data(cb, file) {
	let filepath = file ? file : $path.src.data;
	let extDir = file ? getExtendedDir('data', file) : '';
	return src(filepath)
		.pipe(dest($path.build.data + extDir))
		.pipe(browsersync.stream())
}

///////////////////////////////////////////////////////

function service(cb, file) {
	if (!isLiteBuild || liteBuild_load.service) {
		let filepath = file ? file : $path.src.service;
		let extDir = file ? getExtendedDir('service', file) : '';
		return src(filepath, {
				allowEmpty: true // .htaccess error fix
			})
			.pipe(dest($path.build.service + extDir))
			.pipe(browsersync.stream())
	}
	else cb();
}

///////////////////////////////////////////////////////

function libs(cb) {
	if (!isLiteBuild || liteBuild_load.libs) {
		return src($path.src.libs)
			.pipe(dest($path.build.libs));
	}
	else cb();
}

///////////////////////////////////////////////////////

function media(cb, file) {
	if (!isLiteBuild || liteBuild_load.media) {
		let filepath = file ? file : $path.src.media;
		let extDir = file ? getExtendedDir('media', file) : '';
		return src(filepath)
			.pipe(dest($path.build.media + extDir))
			.pipe(browsersync.stream());
	}
	else cb();
}

///////////////////////////////////////////////////////

function scaleFavicon(file, size) {
	file = file.clone();
	file.scale = {
		maxWidth: size,
		maxHeight: size
	}
	return file;
}
function scaleFaviconL(file, _, cb) {
	file = scaleFavicon(file, faviconSizes.L)
	cb(null, file)
}
function scaleFaviconM(file, _, cb) {
	file = scaleFavicon(file, faviconSizes.M)
	cb(null, file)
}
function scaleFaviconS(file, _, cb) {
	file = scaleFavicon(file, faviconSizes.S)
	cb(null, file)
}
function renameFaviconL(file, _, cb) {
	let fileName = file.basename.replace('.', '-' + faviconSizes.L + '.')
	cb(null, fileName)
}
function renameFaviconM(file, _, cb) {
	let fileName = file.basename.replace('.', '-' + faviconSizes.M + '.')
	cb(null, fileName)
}
function renameFaviconS(file, _, cb) {
	let fileName = file.basename.replace('.', '-' + faviconSizes.S + '.')
	cb(null, fileName)
}
function scaleImage2x(file, _, cb) {
	readMetadata(file, (err, meta) => {
		if (err) return cb(err)
		file = file.clone()
		file.scale = {
			maxWidth: Math.ceil(meta.width / 2),
			maxHeight: Math.ceil(meta.height / 2)
		}
		cb(null, file)
	})
}
function renameImage2x(file, _, cb) {
	let fileName = file.basename.replace('@2x.', '.')
	cb(null, fileName)
}

function images(cb, filepath) {
	let images = [$path.src.img, '!' + $path.src.img2x, '!' + $path.src.img_uncompressed, '!' + $path.src.img_favicon];
	let images2x = [$path.src.img2x, '!' + $path.src.img_uncompressed];
	let uncompressed = $path.src.img_uncompressed;
	let favicon = $path.src.img_favicon;

	function getFaviconStream(filepath = favicon) {
		if (isLiteBuild) {
			return src(filepath)
				.pipe(through.obj(scaleFaviconS))
				.pipe(imageresize(renameFaviconS));
		}
		else {
			return streamqueue(
				{ objectMode: true },
				src(filepath)
					.pipe(through.obj(scaleFaviconL))
					.pipe(imageresize(renameFaviconL)),
				src(filepath)
					.pipe(through.obj(scaleFaviconM))
					.pipe(imageresize(renameFaviconM)),
				src(filepath)
					.pipe(through.obj(scaleFaviconS))
					.pipe(imageresize(renameFaviconS))
			)
		}
	}

	let stream, extDir = '';
	// if 1 file
	if (filepath) {
		extDir = getExtendedDir('img', filepath);
		// 1x
		stream = src(filepath);
		// 2x
		if (filepath.match(/@2x/))
			stream = stream
				.pipe(through.obj(scaleImage2x))
				.pipe(imageresize(renameImage2x))
				.pipe(src(filepath));
		// uncompressed
		if (filepath.match(/\/\$/))
			return stream
				.pipe(dest($path.build.img + extDir))
				.pipe(browsersync.stream());
		// favicon
		if (filepath.match(/favicon\.png/))
			stream = getFaviconStream(filepath);
	}
	// if all files
	else {
		stream = streamqueue(
			{ objectMode: true },
			src(images2x)
				.pipe(through.obj(scaleImage2x))
				.pipe(imageresize(renameImage2x)),
			src(images2x),
			src(images),
			getFaviconStream()
		)
	}
	// common
	if (!isLiteBuild) {
		stream = stream
			.pipe(imagemin([
				imagemin.mozjpeg({ quality: jpgMinifyQuality, progressive: true }),
				imagemin.optipng({ optimizationLevel: pngMinifyQuality })
			]));
	}

	// if all files, add $-files
	if (!filepath) stream = stream.pipe(src(uncompressed));

	return stream
		.pipe(dest($path.build.img + extDir))
		.pipe(browsersync.stream());
}

///////////////////////////////////////////////////////

function fonts(cb, filepath = $path.src.fonts_ttf) {
	let stream;
	if (!isLiteBuild) {
		stream = streamqueue(
			{ objectMode: true },
			src(filepath)
				.pipe(ttf2woff({ clone: true })),
			src(filepath)
				.pipe(ttf2woff2())
		)
	}
	else stream = src(filepath);

	return stream
		.pipe(dest($path.build.fonts))
		.pipe(browsersync.stream())
}

function otf2ttf(cb, filepath = $path.src.fonts_otf) {
	return src(filepath)
		.pipe(fonter({ formats: ['ttf'] }))
		.pipe(dest([$source + '/fonts/']));
}

function fontsStyle() {
	let file_content = fs.readFileSync($source + '/css/fontscript.scss');
	if (file_content == '') {
		fs.writeFile($source + '/css/fontscript.scss', '', cb);
		fs.readdir($path.build.fonts, function (err, items) {
			if (items) {
				let c_fontname;
				for (let i = 0; i < items.length; i++) {
					let fontname = items[i].split('.');
					fontname = fontname[0];
					if (fontname.match(/icon/i)) continue;
					if (c_fontname != fontname) {
						fs.appendFile($source + '/css/fontscript.scss', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb);
					}
					c_fontname = fontname;
				}
			}
		})
	}
	return Promise.resolve('ok');
}

///////////////////////////////////////////////////////

function browserSyncInit() {
	setTimeout(() => {
		browsersync.init({
			server: { baseDir: './' + $project + '/' },
			port: 3000,
			notify: false
		})
	}, 1000)
}

function watchFiles() {
	function fixPath(path) { return path.replace(/\\/g, "/") }
	function conditionalWatch(item, f) {
		item.on('change', function (path, stats) {
			f(undefined, fixPath(path));
		});
		item.on('add', function (path, stats) {
			f(undefined, fixPath(path));
		});
	}
	gulp.watch([$path.watch.settings], gulp.series(getSettings, setCssSettings, gulp.parallel(html, scss, js)));
	gulp.watch([$path.watch.scss], scss);//.on('change', browsersync.reload);
	gulp.watch([$path.watch.js], js);
	conditionalWatch(gulp.watch([$path.watch.html]), html);
	conditionalWatch(gulp.watch([$path.watch.css]), css);
	conditionalWatch(gulp.watch([$path.watch.data]), data);
	conditionalWatch(gulp.watch([$path.watch.service]), service);
	conditionalWatch(gulp.watch([$path.watch.media]), media);
	conditionalWatch(gulp.watch([$path.watch.img]), images);
	conditionalWatch(gulp.watch([$path.watch.fonts_ttf]), fonts);
	conditionalWatch(gulp.watch([$path.watch.fonts_otf]), otf2ttf);
}

let start = gulp.parallel(
	watchFiles,
	gulp.series(
		clean,
		getSettings,
		setCssSettings,
		otf2ttf,
		fonts,
		fontsStyle,
		gulp.parallel(data, service, libs, media, images),
		gulp.parallel(html, css, scss, js),
		browserSyncInit
	)
)

exports.setCssSettings = setCssSettings;
exports.getSettings = getSettings;
exports.otf2ttf = otf2ttf;
exports.fonts = fonts;
exports.fontsStyle = fontsStyle;
exports.images = images;
exports.media = media;
exports.libs = libs;
exports.service = service;
exports.data = data;
exports.js = js;
exports.css = css;
exports.scss = scss;
exports.html = html;
exports.start = start;
exports.default = start;