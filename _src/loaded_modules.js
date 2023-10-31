/* INFO
	This file was made to ease modules turning-on/off and code cleaning process.
	Uncomment variables in 'settingsArr' and Gulp will convert them into html/scss/js and  variables.
	Comments show where modules' fragments toggle automatically:
	- html - fixed place in html code (other modules may need to be set up manually using '#templates' file)
	- css - css module file
	- js - js module file
	- jscode - only a part of 'script.js' code
	- dev only - developer use only
*/

let prefix = '', suffix = '__isloaded' // are included in final variable name
let templateTest = 'template_test' // turns on every module except exclusions
let templateTestExclude = /dev_panel|component_test/ // RegExp
let settingsArr = [
	// templateTest, // html css js | dev only
	// 'component_test', // html | dev only
	// 'dev_panel', // js | dev only
	
	// 'accordion_css', // css
	// 'accordion_js', // css js
	// 'cookies', // js
	// 'copyright', // css
	'footer', // html css
	// 'form', // css js
	'header', // html css js
	// 'input_checkbox', // css
	// 'input_file', // css js
	// 'input_radio', // css
	// 'input_range_colored', // css js
	// 'input_range_double', // css js
	// 'intersection', // js
	'js_media_queries', // js
	// 'json_load', // js
	// 'loadscreen', // html css js
	'modal', // html css js
	'no_tabbing', // js
	// 'pagination', // css js
	// 'parallax', // css js
	// 'popup', // css js
	// 'position_marker', // js
	'print', // js
	// 'random', // js
	// 'rotation_alert', // html css
	'scroll_lock', // js
	'select', // css js
	// 'simple_counter', // js
	// 'spoiler', // css js
	// 'swiper', // css js
	// 'swiper_no_internet', // css js | dev only
	// 'tabs', // css js
	// 'time_select', // css js
	'trans_lock', // js
	// 'up_button', // css js
	// 'user_agent', // jscode
	// 'video_player', // css js
]

///////////////////////////////////////////////////////

let defaultArr = [
	templateTest,
	'component_test',
	'dev_panel',

	'accordion_css',
	'accordion_js',
	'cookies',
	'copyright',
	'footer',
	'form',
	'header',
	'input_checkbox',
	'input_file',
	'input_radio',
	'input_range_colored',
	'input_range_double',
	'intersection',
	'js_media_queries',
	'json_load',
	'loadscreen',
	'modal',
	'no_tabbing',
	'pagination',
	'parallax',
	'popup',
	'position_marker',
	'print',
	'random',
	'rotation_alert',
	'scroll_lock',
	'select',
	'simple_counter',
	'spoiler',
	'swiper',
	'swiper_no_internet',
	'tabs',
	'time_select',
	'trans_lock',
	'up_button',
	'user_agent',
	'video_player',
]

// this func converts settings arr to obj and sets default 'false' values to all other variables to make 'gulp-file-include' work correctly
function createSettingsObject() {
	let obj = {}
	for (let i = 0; i < settingsArr.length; i++) {
		obj[getFullName(settingsArr[i])] = true
	}
	for (let i = 0; i < defaultArr.length; i++) {
		if (obj[getFullName(defaultArr[i])] === undefined) obj[getFullName(defaultArr[i])] = false
	}
	if (obj[getFullName(templateTest)]) templateTestMode(obj)
	return obj
}
function templateTestMode(obj) {
	for (let item in obj) {
		if (item.match(templateTestExclude)) continue;
		obj[item] = true;
	}
}
function getFullName(item) { return prefix + item + suffix }

///////////////////////////////////////////////////////

exports.settings = createSettingsObject()