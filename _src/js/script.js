// Constants //
// Some modules use 'mobileBreakpoint' variable to check mobile or desktop view.
const mobileBreakpoint = parseFloat(getComputedStyle(document.body).getPropertyValue('--media-mobile')) || 782;

///////////////////////////////////////////////////////

// Module Reference Bureau //
@@include('modules/reference.js')
window.addEventListener('DOMContentLoaded', moduleReference.init.bind(moduleReference))

/////////////////////////////////////////////////////// @@if (dev_panel__isloaded) {

// Developer panel //
@@include('modules/dev_panel.js')
window.addEventListener('load', developer_panel.init)

/////////////////////////////////////////////////////// } @@if (user_agent__isloaded) {

// User Agent //
let userAgentShortName = 'chrome'
if (navigator.userAgent.toLowerCase().match(/mac|ios|iphone|ipad/)) userAgentShortName = 'safari'
if (navigator.userAgent.toLowerCase().match(/firefox/)) userAgentShortName = 'firefox'
document.body.classList.add('useragent-' + userAgentShortName)

/////////////////////////////////////////////////////// } @@if (random__isloaded) {

// Random //
@@include('modules/random.js')

/////////////////////////////////////////////////////// } @@if (cookies__isloaded) {

// Cookies //
@@include('modules/cookies.js')
let cookies = getCookie()
console.log('Cookies:')
console.log(cookies)

/////////////////////////////////////////////////////// } @@if (loadscreen__isloaded) {

// Loadscreen //
@@include('modules/loadscreen.js')
loadscreen.init({
	timeout: 200, // extra timeout after page load
	// scrollToTop: true
})

/////////////////////////////////////////////////////// } @@if (js_media_queries__isloaded) {

// JS Media Queries //
@@include('modules/js_media_queries.js')
jsMediaQueries.params = {
	// testMode: true,
	breakpoints: {
		560: () => {},
		mobile: () => { // gets 'mobileBreakpoint' automatically
			if (typeof header != 'undefined') header.checkViewportChange() // required for Header module
		},
		1280: () => {},
	}
}

/////////////////////////////////////////////////////// } @@if (scroll_lock__isloaded) {

// Scroll lock //
@@include('modules/scroll_lock.js')
// scrollLock.params = {
// 	useDefaultGroups: false
// }

/////////////////////////////////////////////////////// } @@if (trans_lock__isloaded) {

// Transition lock //
@@include('modules/trans_lock.js')

/////////////////////////////////////////////////////// } @@if (header__isloaded) {

// Header //
@@include('modules/header.js')
header.params = {
	menu: true,
	submenu: true,

	headerPositionFixed: true, // true='fixed', false='static'

	hidingHeader: true, // works if 'headerPositionFixed: true'
	// hidingHeaderView: 'mobile', // 'both' (default), 'mobile', 'desktop', false
	// hiddenPositionOffset: 50, // for 'hidingHeader'

	// hidingHeaderCompactMode: true, // works if 'headerPositionFixed: true'
	// compactModeThreshold: 200, // for 'hidingHeaderCompactMode'

	// hideOnViewChangе: false,

	// onMenuOpen: function(timeout) {console.log('onOpen ' + timeout)},
	// onMenuClose: function(timeout) {console.log('onClose ' + timeout)},
}

/////////////////////////////////////////////////////// } @@if (modal__isloaded) {

// Modal window //
@@include('modules/modal.js')
// modal.params = {
	// shareHeader: true,
	// on: {
	// 	'any': {
	// 		open: function(timeout, content) {},
	// 		close: function(timeout, content) {},
	// 	},
	// }
// }

/////////////////////////////////////////////////////// } @@if (popup__isloaded) {

// Popup //
@@include('modules/popup.js')
let test_popup = new Popup({
	elem: 'popup'
})
// Place each popup's code below

/////////////////////////////////////////////////////// } @@if (select__isloaded) {

// Select //
@@include('modules/select.js')
// name example: select_*name*
const select_form = new Select({
	elem: 'select',
	firstOptSelected: true,
	// onselect: (selection) => {console.log(selection)}
})

/////////////////////////////////////////////////////// } @@if (time_select__isloaded) {

// Time select //
@@include('modules/time_select.js')
timeSelect.init()

/////////////////////////////////////////////////////// } @@if (accordion_js__isloaded) {

// Accordion //
@@include('modules/accordion_js.js')
const accordion = new Accordion({
	elem: '.js__accordion',
	isOpened: true
})

/////////////////////////////////////////////////////// } @@if (simple_counter__isloaded) {

// Simple counter //
@@include('modules/simple_counter.js')
const simpleCounter = new SimpleCounter({
	launcher: '.test-counter-button',
	output: '.test-counter',
	goal: 51806,
	timeout: 2,
})
simpleCounter.start()

/////////////////////////////////////////////////////// } @@if (input_file__isloaded) {

// Input file //
@@include('modules/input_file.js')
inputFile.init()

/////////////////////////////////////////////////////// } @@if (input_range_colored__isloaded) {

// Input range colored //
@@include('modules/input_range_colored.js')
const iRangeClr = new InputRangeColored({
	elem: 'input-range'
})

/////////////////////////////////////////////////////// } @@if (input_range_double__isloaded) {

// Input range double //
@@include('modules/input_range_double.js')
const iRangeDbl = new InputRangeDouble({
	elem: 'input-range-double',
	start: 200,
	end: 492,
	thumbs: [250, 400],
	bubble: true,
	results: ['ird-result1', 'ird-result2']
})

/////////////////////////////////////////////////////// } @@if (spoiler__isloaded) {

// Spoiler //
@@include('modules/spoiler.js')
spoiler.init()

/////////////////////////////////////////////////////// } @@if (tabs__isloaded) {

// Tabs //
@@include('modules/tabs.js')

/////////////////////////////////////////////////////// } @@if (up_button__isloaded) {

// Up-button //
@@include('modules/up_button.js')
upButton.init()

/////////////////////////////////////////////////////// } @@if (intersection__isloaded) {

// Intersection //
@@include('modules/intersection.js')

/////////////////////////////////////////////////////// } @@if (parallax__isloaded) {

// Parallax //
@@include('modules/parallax.js')
const parallax = new Parallax({
	parallaxElem: '.parallax',
	scrollingContent: '.scrolling-content',
	// start: 500, // (default = 'parallaxElem' 'top')
	// distance: 100, // (default = 'parallaxElem' 'height')
})

/////////////////////////////////////////////////////// } @@if (pagination__isloaded) {

// Pagination //
@@include('modules/pagination.js')
const pagination = new Pagination({
	elem: '.pagination',
	maxLength: 8,
})

/////////////////////////////////////////////////////// } @@if (video_player__isloaded) {

// Video player //
@@include('modules/video_player.js')
videoPlayer.init(80)

/////////////////////////////////////////////////////// } @@if (swiper__isloaded) {

// Swiper //
const swipers = {
	defineSettings: function() {
		let commonSettings = {
			speed: 500,
			spaceBetween: 30,
		}
		return { // list of Swipers
			// Example:
			// swiper_name: {
			// 	selector: '.main__swiper',
			// 	settings: {
			// 		navigation: {
			// 			prevEl: '.swiper-button-prev',
			// 			nextEl: '.swiper-button-next',
			// 		},
			// 		pagination: {
			// 			el: '.swiper-pagination',
			// 			type: 'bullets',
			// 		},
			// 		loop: true,
			// 		loopAdditionalSlides: 2,
			// 		speed: 700,
			// 		spaceBetween: 15,
			// 		autoplay: {
			// 			delay: 5000,
			// 			disableOnInteraction: false,
			// 			pauseOnMouseEnter: true,
			// 		},
			// 		breakpoints: {
			// 			782: {}
			// 		},
			// 	}
			// },
		}
	},

	init: async function() {
		let settings = this.defineSettings()
		if (typeof Swiper != 'undefined') {
			for(let sw in settings) {
				this[sw] = new Swiper(settings[sw].selector, settings[sw].settings)
			}
		}
		@@if (swiper_no_internet__isloaded) {
			// Swiper no-internet version (developers use only)
			@@include('modules/swiper_no_internet.js')
		}
	}
}
swipers.init()

/////////////////////////////////////////////////////// } @@if (print__isloaded) {

// Print address & QR-code //
@@include('modules/print.js')
setPrintAddressAndQRcode({
	// qrCodeSize: 150 // number (default = 150)
})

/////////////////////////////////////////////////////// } @@if (form__isloaded) {

// Form send //
@@include('modules/form.js')
formSend.init({
	demo: true,
	// testMode: true,
	phoneMask: '+7 (___) ___-__-__',
	showPhoneMask: true,
	onSend: function(form) {console.log('onSend')},
	onError: function(form) {console.log('onError')},
})

/////////////////////////////////////////////////////// } @@if (json_load__isloaded) {

// JSON Load //
@@include('modules/json_load.js')

/////////////////////////////////////////////////////// } @@if (no_tabbing__isloaded) {

// Prevent 'tabbing' //
@@include('modules/no_tabbing.js')
preventTabbing() // param = selector string

/////////////////////////////////////////////////////// } @@if (position_marker__isloaded) {

// Position marker //
@@include('modules/position_marker.js')
positionMarker.init()

/////////////////////////////////////////////////////// }
