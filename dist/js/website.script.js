// Constants //
// Some modules use 'mobileBreakpoint' variable to check mobile or desktop view.
const mobileBreakpoint = parseFloat(getComputedStyle(document.body).getPropertyValue('--media-mobile')) || 782;

///////////////////////////////////////////////////////

// Module Reference Bureau //
/*
	This module works as command transmitter between different modules. It knows what some modules may offer to do and knows how to do it. It sends this info to the others.
	Before start you have to register modules: who they are, what func they want to use, what they may offer and what props they can work with.

	The link between 2 modules consists of 4 parts:
	- executor inner func - func that executor uses inside itself
	- executor linking func - func that knows everything about executor common funcs and works with them directly
	- link wrapper func - func that contains a link to executor func and this link will be copied to caller module, also it prevents loading queue errors
	- caller inner func - func that caller uses inside itself

	To register a module create new 'this.modules.*moduleName* = {}' with possible params:
	- 'usesFuncs' (reference between caller and executor funcs through internal link wrapper func)
	- 'hasProps' (what props the modal has that 'moduleReference' can use to reach the goal)
	Below that there are a linking funcs that do some checks and call executor inner funcs directly.
	
	The names of the caller and executor funcs can be different, so their reference you have to type in 'usesFuncs'.

	In the end there is a list of 'link wrapper funcs' for use inside the 'moduleReference'. It contents links to a caller functions.
	'link wrapper func' example: { *wrapper-func-name*: function() {return this.referer.modules.*executor-name*.*executor-func-name*(this.caller)} }

	On 'init' 'moduleReference' puts required params inside registered modules in 'away' object, so the calling module may call something like 'this.away.closeMenu()'. But it will work only if the name 'closeMenu' is registered in 'usesFuncs'. Make sure that caller's 'this' is equal to caller's 'away' object.

	In the end of 'init' there is a module load queue. It runs some module absence checks and sends wrapper links to a caller, so put registered modules there too.
	It also runs 'module.init()' func in case that 'moduleReference' executes after 'DOMContentLoaded' event. Make sure to turn off the default 'module.init()'.

	Quick overview for other modules:
	- module has to be registered in 'moduleReference'
	- turn off 'module.init()' func and put it inside 'moduleReference' load queue
	- use calls like 'this.away.closeMenu()'
	- make sure that 'this' has to be equal to 'away' object

	Note: 'moduleReference' might not work if you call something from on-function or 'jsMediaQueries' breakpoint. If it so, put your own module-check if-statement there.
*/
const moduleReference = {
	selfName: 'moduleReference',
	refererParamAway: 'away',
	refererParamCaller: 'caller',
	refererParamName: 'callerName',
	moduleInitParam: 'initiated',
	modules: {},

	registerModules: function() {
		let root = this;

		this.modules.mobileBreakpoint = {
			usesFuncs: {},
			hasProps: {},
			getValue: function() {
				if (this.module) return this.module
				else return 0
			}
		}

		this.modules.jsMediaQueries = {
			usesFuncs: {
				getMobileBreakpoint: root.getMobileBreakpointValue
			},
			hasProps: {}
		}

		this.modules.transitionLock = {
			usesFuncs: {},
			hasProps: {},
			getLockedState: function(caller) {
				if (this.module) return this.module.check(root.getCallerParam(caller, 'timeout'))
				else return false
			}
		}

		this.modules.scrollLock = {
			usesFuncs: {
				getMobileBreakpoint: root.getMobileBreakpointValue
			},
			hasProps: {},
			lock: function() {
				if (this.module) this.module.lock()
			},
			unlock: function(caller) {
				if (this.module) this.module.unlock(root.getCallerParam(caller, 'timeout'))
			}
		}

		this.modules.header = {
			usesFuncs: {
				getMobileBreakpoint: root.getMobileBreakpointValue,
				lockScroll: root.lockWindowScroll,
				unlockScroll: root.unlockWindowScroll,
				transitionIsLocked: root.getTransitionLockedState,
				closeOtherModules: root.closeModal,
			},
			hasProps: {
				timeout: 'timeout'
			},
			closeMenu: function(skipLock) {
				if (this.module) this.module.menu.toggle(false, root.getCorrectSkipLock(skipLock))
			},
			shareHeader: function() {
				if (this.module) this.module.shareHeader()
			},
			unshareHeader: function(caller) {
				if (this.module) this.module.unshareHeader(root.getCallerParam(caller, 'timeout'))
			}
		}

		this.modules.modal = {
			usesFuncs: {
				lockScroll: root.lockWindowScroll,
				unlockScroll: root.unlockWindowScroll,
				transitionIsLocked: root.getTransitionLockedState,
				closeOtherModules: root.closeHeaderMenu,
				shareHeader: root.shareHeader,
				unshareHeader: root.unshareHeader,
			},
			hasProps: {
				timeout: 'timeout'
			},
			open: function(modalName, skipLock) {
				if (this.module) this.module.open(modalName, root.getCorrectSkipLock(skipLock))
			},
			close: function(skipLock) {
				if (this.module) this.module.close(root.getCorrectSkipLock(skipLock))
			}
		}
	},
	// Link wrapper funcs
	// It is important to have them to prevent loading queue errors when 2 modules are linked to each other both sides
	getMobileBreakpointValue: function() {return this.referer.modules.mobileBreakpoint.getValue()},
	getTransitionLockedState: function() {return this.referer.modules.transitionLock.getLockedState(this.caller)},
	lockWindowScroll: function() {this.referer.modules.scrollLock.lock()},
	unlockWindowScroll: function() {this.referer.modules.scrollLock.unlock(this.caller)},
	closeHeaderMenu: function(skipLock) {this.referer.modules.header.closeMenu(skipLock)},
	shareHeader: function() {this.referer.modules.header.shareHeader()},
	unshareHeader: function() {this.referer.modules.header.unshareHeader(this.caller)},
	openModal: function(modalName, skipLock) {this.referer.modules.modal.open(modalName, skipLock)},
	closeModal: function(skipLock) {this.referer.modules.modal.close(skipLock)},

	init: async function() {
		this.registerModules()
		this.modulesRegistered = Object.keys(this.modules).length;
		this.modulesInitiated = 0

		// Modules load queue
		this.initModule(typeof mobileBreakpoint != 'undefined' ? mobileBreakpoint : null, 'mobileBreakpoint')
		this.initModule(typeof jsMediaQueries != 'undefined' ? jsMediaQueries : null, 'jsMediaQueries')
		this.initModule(typeof scrollLock != 'undefined' ? scrollLock : null, 'scrollLock')
		this.initModule(typeof transitionLock != 'undefined' ? transitionLock : null, 'transitionLock')
		this.initModule(typeof header != 'undefined' ? header : null, 'header')
		this.initModule(typeof modal != 'undefined' ? modal : null, 'modal')
		// console.log(header)

		if (this.modulesRegistered != this.modulesInitiated) console.log(`[${this.selfName}] WARN! "initiated modules" (${this.modulesInitiated}) not equal to "registered modules" (${this.modulesRegistered}). Please check your code`)
	},
	initModule: function(mod, name) {
		this.modulesInitiated++;
		if (!name) return console.log(`[${this.selfName}] ERR! Missing "name" param in "initModule" function`)
		this.modules[name].module = mod // module || null
		if (!mod) return console.log(`[${this.selfName}] ERR! "${name}" module not found`)

		if (!this.modules[name].usesFuncs) this.modules[name].usesFuncs = {};
		if (!this.modules[name].hasProps) this.modules[name].hasProps = {};
		if (typeof mod == 'object') {
			mod[this.refererParamAway] = this.modules[name].usesFuncs;
			mod[this.refererParamAway][this.refererParamCaller] = mod;
			mod[this.refererParamAway][this.refererParamName] = name;
			mod[this.refererParamAway].referer = this;
			if (mod.init) {
				if (mod[this.moduleInitParam] || typeof mod[this.moduleInitParam] == 'undefined') console.log(`[${this.selfName}] WARN! "${name}" module can be already initiated. Please check your code for double initiation`)
				mod.init()
			}
		}
	},
	getCallerParam: function(caller, param) {
		if (caller[this.refererParamAway][this.refererParamName])
			return caller[this.modules[caller[this.refererParamAway][this.refererParamName]].hasProps[param]]
		else {
			console.log(`[${this.selfName}] ERR! Calling module does not have a required param "${this.refererParamName}". Caller:`)
			console.log(caller)
			return false
		}
	},
	getCorrectSkipLock: function(x) {
		if (typeof x != 'boolean' && x !== 'true') return false
		else return x
	}
}
window.addEventListener('DOMContentLoaded', moduleReference.init.bind(moduleReference))

///////////////////////////////////////////////////////      

// JS Media Queries //
/* 
	Module checks window resizing and runs funcs on crossing the breakpoint.
	Breakpoint executes its funcs when 'width' crosses the line from both sides. Example: both resize from 800 to 700 and from 700 to 800 will execute '768' breakpoint.
	If 'width' crosses several breakpoints, all of them will be executed sequentially.

	Useful output:
	- jsMediaQueries.state
	Note: there is 1 more index than number of breakpoints (from 0px to 1st breakpoint).
	
	Init params {obj}:
	- breakpoints {obj}
	- testMode - set to 'true' to console.log the breakpoint state when it executes (default = false)
*/
const jsMediaQueries = {
	selfName: 'jsMediaQueries',
	breakpointVariableName: 'mobile',
	
	away: {getMobileBreakpoint: function(){}},
	params: {},
	initiated: false,
	init: async function(params) {
		if (params) this.params = params;
		this.breakpoints = this.params.breakpoints || null;
		if (!this.breakpoints) return;
		this.breakpoints.keys = Object.keys(this.breakpoints);
		for (let i = 0; i < this.breakpoints.keys.length; i++) {
			if (this.breakpoints.keys[i] == this.breakpointVariableName) {
				let mbp = this.away.getMobileBreakpoint();
				this.breakpoints[mbp] = this.breakpoints[this.breakpoints.keys[i]];
				this.breakpoints.keys[i] = mbp;
			}
			else {
				this.breakpoints.keys[i] = Number(this.breakpoints.keys[i]);
				if (isNaN(this.breakpoints.keys[i])) this.breakpoints.keys[i] = 0; // this provides normal keys-array sorting if param is incorrect
			}
		}
		this.breakpoints.keys.push(0);
		this.breakpoints.keys.sort((a,b) => {return a - b});
		window.addEventListener('resize', this.check.bind(this));
		this.check(false, true);
		
		this.initiated = true
	},
	check: function(e, init = false) {
		for (let i = 0; i < this.breakpoints.keys.length; i++) {
			if (window.innerWidth > this.breakpoints.keys[i]) this.state = this.breakpoints.keys[i];
			else break
		}
		if (init) this.prev_state = this.state
		else {
			if (this.state > this.prev_state) {
				for (let i = 0; i < this.breakpoints.keys.length; i++) {
					if (this.breakpoints.keys[i] > this.prev_state && this.breakpoints.keys[i] <= this.state) {
						this.breakpoints[this.breakpoints.keys[i]]()
						this.log(this.breakpoints.keys[i])
					}
				}
			}
			if (this.state < this.prev_state) {
				for (let i = this.breakpoints.keys.length-1; i >= 0 ; i--) {
					if (this.breakpoints.keys[i] <= this.prev_state && this.breakpoints.keys[i] > this.state) {
						this.breakpoints[this.breakpoints.keys[i]]()
						this.log(this.breakpoints.keys[i])
					}
				}
			}
			this.prev_state = this.state
		}
	},
	log: function(value) {
		if (this.params.testMode) console.log(`[${this.selfName}] Executed breakpoint: ${value}`)
	}
}
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

///////////////////////////////////////////////////////  

// Scroll lock //
/* 
	Module prevents window scrolling with menu, modals, etc. and
	prevents content jumps when scrollbar fades out.
	Script will find elements in default groups (main, footer) and 
	set 'padding-right' property to them.
	You can exclude them by setting a 'useDefaultGroups' param to 'false'.
	Header is not a default group, these elems must be added manually.
	
	Set an additional elems to list by setting classes to HTML:
	- 'scroll-lock-item-p' class - for static elems ('padding-right' prop.)
	- 'scroll-lock-item-m' class - for fixed elems ('margin-right' prop.)
	- 'scroll-lock-item-pm' class - for static elems that will be hidden in menu
		(they will get a 'padding-right' prop. only on desktop width)

	Usable functions: 
		scrollLock.lock()
		scrollLock.unlock( *timeout* )

	Init params {obj}: useDefaultGroups (default = true)
*/
const scrollLock = {
	defaultElems: ['main', 'footer'],
	paddingItemClassName: 'scroll-lock-item-p',
	paddingMenuItemClassName: 'scroll-lock-item-pm',
	marginItemClassName: 'scroll-lock-item-m',
	lockedClassName: 'scroll-is-locked',

	away: {getMobileBreakpoint: function(){}},
	params: {},
	initiated: false,
	init: async function(params) {
		this.paddingItems = document.querySelectorAll('.' + this.paddingItemClassName);
		this.paddingMenuItems = document.querySelectorAll('.' + this.paddingMenuItemClassName);
		this.marginItems = document.querySelectorAll('.' + this.marginItemClassName);

		if (params) this.params = params;
		if (this.params.useDefaultGroups === false || this.params.useDefaultGroups === 'false')
			this.useDefaultGroups = false;
		else this.useDefaultGroups = true;

		if (this.useDefaultGroups) {
			let selector = '';
			for (let i = 0; i < this.defaultElems.length; i++) {
				selector += '.' + this.defaultElems[i];
				// selector += '.' + this.defaultElems[i] + '>*';
				if (i < this.defaultElems.length - 1) selector += ',';
			}
			let defaultItems = document.querySelectorAll(selector);
			let joinedPaddingItems = Array.from(defaultItems);
			for (let i = 0; i < this.paddingItems.length; i++) {
				let exist = false;
				for (let j = 0; j < defaultItems.length; j++) {
					if (defaultItems[j] == this.paddingItems[i]) exist = true;
				}
				if (!exist) joinedPaddingItems.push(this.paddingItems[i]);
			}
			this.paddingItems = joinedPaddingItems;
		}
		
		this.initiated = true
	},

	lock: function() {
		if (document.body.classList.contains(this.lockedClassName)) return;
		this.scrollbarWidth = window.innerWidth - document.body.offsetWidth;
		let that = this;
		function f(items, prop) {
			for (let i = 0; i < items.length; i++) {
				items[i][prop] = parseFloat(getComputedStyle(items[i])[prop]);
				items[i].style[prop] = items[i][prop] + that.scrollbarWidth + 'px';
			}
		}
		if (window.innerWidth > this.away.getMobileBreakpoint())
			f(this.paddingMenuItems, 'paddingRight');
		f(this.paddingItems, 'paddingRight');
		f(this.marginItems, 'marginRight');
		document.body.classList.add(this.lockedClassName);
	},

	unlock: function(timeout = 0) {
		setTimeout(function(){
			function f(items, prop) {
				for (let i = 0; i < items.length; i++) {
					items[i].style[prop] = '';
				}
			}
			f(this.paddingMenuItems, 'paddingRight');
			f(this.paddingItems, 'paddingRight');
			f(this.marginItems, 'marginRight');
			document.body.classList.remove(this.lockedClassName);
		}.bind(this), timeout);
	}
}
// scrollLock.params = {
// 	useDefaultGroups: false
// }

///////////////////////////////////////////////////////  

// Transition lock //
/* 
	Module prevents double-clicking on transitions, e.g. when menu slides.
	Use: if (transitionLock.check( *timeout* )) return;
*/
const transitionLock = {
	locked: false,
	check: function(timeout = 0) {
		let result = this.locked;
		if (this.locked == false) {
			this.locked = true;
			setTimeout(function(){
				this.locked = false;
			}.bind(this), timeout);
		}
		return result;
	}
}

///////////////////////////////////////////////////////  

// Header //
/* 
	Header contains 2 parts: 'header' and 'headerMetrics'.
	'headerMetrics' runs right after <header> tag to prevent content jumps after metrics setup. It is an important part of 'header' module, so I typed hardcode links to it. 'headerMetrics' has no meaning without main 'header' module, but they have to run separately.
	'headerMetrics' contains 'headerMenuOptions handler' to prevent menu jumping as well when sorting menu items.
	
	Init params {obj}:
	- menu - add menu part (default = false)
	- submenu - add submenu part (default = false)
	- headerPositionFixed - choose if header is 'static' (false) or 'fixed' (true) on window, it controls CSS 'position' prop (default = false)
	- hidingHeader - add hidingHeader part (default = false) (works if headerPositionFixed: true)
	- hidingHeaderView - choose in what viewports 'hidingHeader' will work: 'mobile', 'desktop' or 'both' (default = 'both') (works if hidingHeader: true)
	- hiddenPositionOffset - for 'hidingHeader', set up this if you want to move header by value (in px) that differs it's height (default = 0)
	- hidingHeaderCompactMode - adds 'compact' class to the header when you scroll page for some distance (default = false) (works if headerPositionFixed: true)
	- compactModeThreshold - for 'hidingHeaderCompactMode', set the distance (in px) when 'compact mode' triggers (default = 100)
	- hideOnViewChangе - by default menu disappears when window switches between mobile and desktop view, it prevents css transition blinking; if you want to turn it off in some reasons, set 'false' (default = true)
	- onMenuOpen, onMenuClose - event function(timeout){}

	Usable methods:
	- header.menu.close(true) - params: bool 'skipLock' (default = false)
	- header.shareHeader()
	- header.unshareHeader()

	headerMenuOptions script element:
	- it is a code that sorts the list of menu links from header.html
	- options are set in html <script> tag and they are individual for each page
	- script reads 'links' array and creates new sorted list using data-attributes
	- 'activeLink' adds class 'this-page'

	SubMenu:
	- submenu can be inside the 'menuItem' or outside
	- it is important to set submenu in right place: 1) inside 'menuItem' (after the menu link) or 2) inside 'menuNav' (after the 'menuItems')
	- it supports multilevel nesting, and any level can be inside or outside
	- any links that toggle submenu must contain class 'submenu-link'
	- if outside submenu, button hover effect will be locked until mouse leaves the closest 'menuNav'

	Share header:
	- this functionality allows other modules e.g. 'modal' call header into view and use its close button, etc.
	- by default header buttons close other opened modules, so you just have to provide an access to the button
	- it adds 2 css classes to header elem: 1) instant class, 2) delayed class (e.g. if you need to set z-index after a timeout)

	Set transition timeout in CSS only. JS will read it.
*/
const header = {
	selfName: 'header',
	names: {
		// selectors:
		header: '.header',
		menu: '.header-menu-hide-wrapper',
		menuNav: '.header-menu',
		menuItems: '.header-menu__items',
		menuItem: '.header-menu__item',
		menuOpenBtn: '.header-menu-open-btn',
		menuCloseBtn: '.header-menu-close-btn',
		menuBackBtn: '.header-submenu-back-btn',
		menuArea: '.header-menu-turnoff-area',
		submenu: '.header-submenu-hide-wrapper',
		submenuLink: '.submenu-link',
		// class names:
		switchToDesktop: 'hide-on-switch-to-desktop',
		switchToMobile: 'hide-on-switch-to-mobile',
		// state class names:
		stateStatic: 'header--static',
		stateFixed: 'header--fixed',
		stateCompact: 'header--compact',
		stateActive: 'header--active', // elems: headerElem, menuElem, submenu, toggleButtons, closeButtons, menuLink
		stateShared: 'header--shared', // headerElem
		stateSharedDelayed: 'header--shared-z', // headerElem
		// css variable names:
		varTimer: '--timer-menu',
	},
	away: {
		getMobileBreakpoint: function(){},
		lockScroll: function(){},
		unlockScroll: function(){},
		transitionIsLocked: function(){},
		closeOtherModules: function(skipLock){},
	},
	metrics: typeof headerMetrics != 'undefined' ? headerMetrics : null,
	params: {},
	initiated: false,
	init: function(params) {
		// Здесь был блок, который (при отсутствии хедера) добавлял пустой хедер. Продолжали работать метрики для того, чтобы CSS-переменными могли пользоваться другие модули. Но потом поставил в CSS дефолтные значения (нули). Теперь модули так же могут пользоваться переменными, а модуль header можно отключить. (пишу для себя, т.к. забываю про это)

		if (this.metrics) this.headerElem = this.metrics.headerElem;
		else {
			console.log(`[${this.selfName}] ERR! "header metrics" not found`)
			this.headerElem = document.body.querySelector(this.names.header)
		}
		if (!this.headerElem) return;
		
		// Check params
		if (params) this.params = params
		if (!this.params.headerPositionFixed) this.params.hidingHeader = this.params.hidingHeaderCompactMode = null

		if (this.params.hidingHeaderView) {
			if (typeof this.params.hidingHeaderView != 'string' || !this.params.hidingHeaderView.match(/^mobile$|^desktop$|^both$/))
				this.params.hidingHeaderView = 'both'
		} else if (typeof this.params.hidingHeaderView == 'undefined') this.params.hidingHeaderView = 'both'

		if (this.params.hidingHeaderCompactMode) {
			if (this.params.hidingHeaderView == 'desktop') this.params.hidingHeaderView = null
			if (this.params.hidingHeaderView == 'both') this.params.hidingHeaderView = 'mobile'
		}

		if (typeof this.params.compactModeThreshold != 'number' || this.params.compactModeThreshold < 0) this.params.compactModeThreshold = 100;
		if (typeof this.params.hiddenPositionOffset != 'number') this.params.hiddenPositionOffset = 0
		if (this.params.hideOnViewChangе !== false) this.params.hideOnViewChangе = true
		// other params default = false


		if (this.params.headerPositionFixed) {
			this.headerElem.classList.remove(this.names.stateStatic)
			this.headerElem.classList.add(this.names.stateFixed)
		} else {
			this.headerElem.classList.remove(this.names.stateFixed)
			this.headerElem.classList.add(this.names.stateStatic)
		}

		// Inner metrics
		this.headerHeight = this.headerPosition = this.headerOffset = 0;
		this.timeout = parseFloat(getComputedStyle(document.body).getPropertyValue(this.names.varTimer))*1000 || 0;

		// Init header parts
		if (this.params.menu) this.menu.init(this, this.names)
		if (this.params.submenu) this.submenu.init(this, this.names)
		if (this.params.hidingHeader || this.params.hidingHeaderCompactMode) this.hidingHeader.init(this)

		this.initiated = true
	},
	calcHeaderHeight: function() {
		if (this.metrics) [this.headerHeight, this.headerPosition, this.headerOffset] = this.metrics.calcHeaderHeight()
	},
	setCssVar: function() {
		if (this.metrics) {
			this.metrics.headerHeight[0] = this.headerHeight
			this.metrics.headerPosition[0] = this.headerPosition
			this.metrics.headerOffset[0] = this.headerOffset
			this.metrics.setCssVar()
		}
	},
	checkViewportChange: function() {
		this.menu.toggle()
		this.menu.hideMenuOnViewChange()
		this.hidingHeader.returnHeader(true)
		this.hidingHeader.removeCompactMode()
	},
	scrollIntoView: function() {
		// scroll header (or window) down to prevent gap between header and menu (because menu doesn't know about header position)
		if (this.params.headerPositionFixed) this.hidingHeader.returnHeader(); // hidingHeader reference
		else window.scroll({top: 0, behavior: 'smooth'});
	},

	shareHeader: function() {
		if (!this.initiated) return;
		this.headerElem.classList.add(this.names.stateShared)
		this.headerElem.classList.add(this.names.stateSharedDelayed)
		this.scrollIntoView()
	},
	unshareHeader: function(timeout) {
		if (!this.initiated) return;
		this.headerElem.classList.remove(this.names.stateShared)
		setTimeout(function() {
			this.headerElem.classList.remove(this.names.stateSharedDelayed)
		}.bind(this), timeout);
	},

	// Menu
	menu: {
		initiated: false,
		init: function(that, names) {
			this.root = that;
			if (this.root.metrics) this.menuElem = this.root.metrics.menuElem;
			else this.menuElem = this.root.headerElem.querySelector(names.menu);
			if (!this.menuElem) return;
			this.toggleButtons = this.root.headerElem.querySelectorAll(names.menuOpenBtn);
			this.closeButtons = this.root.headerElem.querySelectorAll(`${names.menuCloseBtn}, ${names.menuArea}`);
			for (let btn of this.toggleButtons) {
				btn.addEventListener('click', this.toggle.bind(this))
			}
			for (let btn of this.closeButtons) {
				btn.addEventListener('click', this.toggle.bind(this))
			}
			this.initiated = true; // set before call 'hideMenuOnViewChange'
			this.hideMenuOnViewChangeTimeoutId = 321; // рандомный id чтобы вдруг не зацепить другие таймауты на старте
			this.hideMenuOnViewChange();

			this.onMenuOpen = this.root.params.onMenuOpen || function(){}
			this.onMenuClose = this.root.params.onMenuClose || function(){}
		},
		toggle: function(e, skipLock) {
			if (!this.initiated) return;
			if (this.menuElem.classList.contains(this.root.names.stateActive)) this.close(false, skipLock);
			else if (e) this.open(e, skipLock);
		},
		open: function(e, skipLock) {
			if (!this.initiated || window.innerWidth > this.root.away.getMobileBreakpoint()) return;
			if (!skipLock) {
				if (this.root.away.transitionIsLocked()) return;
				this.root.away.lockScroll()
			}
			this.root.away.closeOtherModules(true) // e.g. modal

			this.menuElem.classList.add(this.root.names.stateActive);
			this.root.headerElem.classList.add(this.root.names.stateActive);
			for (let btn of this.toggleButtons) {
				btn.classList.add(this.root.names.stateActive)
			}
			for (let btn of this.closeButtons) {
				btn.classList.add(this.root.names.stateActive)
			}
			this.root.scrollIntoView()
			this.onMenuOpen(this.root.timeout)
		},
		close: function(e, skipLock) {
			if (!this.initiated) return;
			if (!skipLock) {
				if (this.root.away.transitionIsLocked()) return;
				this.root.away.unlockScroll()
			}
			this.root.away.closeOtherModules(true) // e.g. modal
			this.root.submenu.closeAll(); // submenu reference

			this.menuElem.classList.remove(this.root.names.stateActive);
			this.root.headerElem.classList.remove(this.root.names.stateActive);
			for (let btn of this.toggleButtons) {
				btn.classList.remove(this.root.names.stateActive)
			}
			for (let btn of this.closeButtons) {
				btn.classList.remove(this.root.names.stateActive)
			}
			this.onMenuClose(this.root.timeout)
		},
		hideMenuOnViewChange: function() {
			if (this.initiated && this.root.params.hideOnViewChangе) {
				clearTimeout(this.hideMenuOnViewChangeTimeoutId);
				this.hideMenuOnViewChangeTimeoutId = setTimeout(function(){
					if (window.innerWidth <= this.root.away.getMobileBreakpoint()) {
						this.menuElem.classList.remove(this.root.names.switchToMobile)
						this.menuElem.classList.add(this.root.names.switchToDesktop)
					}
					else {
						this.menuElem.classList.remove(this.root.names.switchToDesktop)
						this.menuElem.classList.add(this.root.names.switchToMobile)
					}
					this.root.calcHeaderHeight()
				}.bind(this), this.root.timeout)
			}
		}
	},
	// /Menu

	// SubMenu
	submenu: {
		initiated: false,
		init: function(that, names){
			this.root = that;
			this.sMenuElems = this.root.headerElem.querySelectorAll(names.submenu);
			if (this.sMenuElems.length == 0) return console.log(`[${this.root.selfName}] ERR! No submenu detected`);
			this.links = this.root.headerElem.querySelectorAll(names.submenuLink);
			this.backButtons = this.root.headerElem.querySelectorAll(names.menuBackBtn);

			// setting up events
			for (let btn of this.backButtons) {
				btn.addEventListener('click', this.toggle.bind(this))
			}
			for (let link of this.links) {
				link.addEventListener('click', this.toggle.bind(this))
				link.addEventListener('mouseover', this.toggle.bind(this))
				link.closest(names.menuItem).addEventListener('mouseleave', this.toggle.bind(this))
			}
			this.root.headerElem.addEventListener('mouseleave', this.toggle.bind(this))

			this.initiated = true
		},
		toggle: function(e) {
			if (!this.initiated || !e) return;
			e.preventDefault();
			let that = this;

			function is(name) {
				let str = that.root.names[name];
				if (str.match(/[#.]/)) str = str.substring(1);
				return e.currentTarget.classList.contains(str);
			}
			
			if (window.innerWidth <= this.root.away.getMobileBreakpoint()) {
				if (e.type == 'click') {
					if (is('submenuLink') && !this.root.away.transitionIsLocked()) this.open(e);
					if (is('menuBackBtn') && !this.root.away.transitionIsLocked()) this.clickClose(e);
				}
			}
			else {
				if (e.type == 'mouseover') {
					if (is('submenuLink')) this.open(e);
				}
				if (e.type == 'mouseleave') {
					if (is('menuItem')) this.mouseleaveClose(e);
					if (is('header')) this.closeAll();
				}
			}
		},
		open: function(e) {
			// if submenu is inside the menuItem
			let currentSubmenu = e.currentTarget.closest(this.root.names.menuItem).querySelector(this.root.names.submenu);
			if (currentSubmenu) {
				currentSubmenu.classList.add(this.root.names.stateActive);
				e.currentTarget.classList.add(this.root.names.stateActive);
			}
			// if submenu is outside of the menuItem
			else {
				currentSubmenu = e.currentTarget.closest(this.root.names.menuNav).querySelector(this.root.names.submenu);
				if (currentSubmenu) {
					currentSubmenu.classList.add(this.root.names.stateActive);
					let thisMenuSharedLinks = e.currentTarget.closest(this.root.names.menuItems).querySelectorAll(this.root.names.submenuLink) // can be several shared links to one submenu
					for (let link of thisMenuSharedLinks) {
						link.classList.add(this.root.names.stateActive)
					}
				}
			}
		},
		clickClose: function(e) {
			// if submenu is inside the menuItem
			let currentMenuItem = e.currentTarget.closest(this.root.names.submenu).parentElement; // parent because if this level submenu is outside it can jump over several levels to reach menuItem
			if (currentMenuItem.classList.contains(this.root.names.menuItem)) {
				for (let item of currentMenuItem.children) {
					item.classList.remove(this.root.names.stateActive)
				}
			}
			// if submenu is outside of the menuItem
			else {
				e.currentTarget.closest(this.root.names.submenu).classList.remove(this.root.names.stateActive);
				let prevMenuSharedLinks = e.currentTarget.closest(this.root.names.menuNav).querySelectorAll(this.root.names.submenuLink) // can be several shared links to one submenu
				for (let link of prevMenuSharedLinks) {
					link.classList.remove(this.root.names.stateActive)
				}
			}
		},
		mouseleaveClose: function(e) {
			// if submenu is inside the menuItem
			let currentMenuItem = e.currentTarget.closest(this.root.names.menuItem);
			if (currentMenuItem.querySelector(this.root.names.submenu)) {
				for (let item of currentMenuItem.children) {
					item.classList.remove(this.root.names.stateActive)
				}
			}
			// if submenu is outside of the menuItem
			else {
				// this event listener prevents closing previous submenu when mouse goes further to new submenu
				e.currentTarget.closest(this.root.names.menuNav).addEventListener('mouseleave', function(e) {
					let currentSubmenu = e.currentTarget.closest(this.root.names.menuNav).querySelector(this.root.names.submenu);
					if (currentSubmenu) {
						currentSubmenu.classList.remove(this.root.names.stateActive);
						let prevMenuSharedLinks = e.currentTarget.closest(this.root.names.menuNav).querySelectorAll(this.root.names.submenuLink) // can be several shared links to one submenu
						for (let link of prevMenuSharedLinks) {
							link.classList.remove(this.root.names.stateActive)
						}
					}
				}.bind(this), {once: true})
			}
		},
		closeAll: function() {
			if (this.initiated) {
				for (let link of this.links) {
					link.classList.remove(this.root.names.stateActive)
				}
				for (let sub of this.sMenuElems) {
					sub.classList.remove(this.root.names.stateActive)
				}
			}
		}
	},
	// /SubMenu

	// Hiding Header
	hidingHeader: {
		initiated: false,
		init: function(that) {
			this.root = that;
			
			// hidingHeader settings
			if (this.root.params.hidingHeader)
				window.addEventListener('scroll', this.moveHeader.bind(this));
			this.firstMoveScroll = true;

			// hidingHeaderCompactMode settings
			if (this.root.params.hidingHeaderCompactMode)
				window.addEventListener('scroll', this.setCompactMode.bind(this));
				this.firstCompactScroll = true;
				this.status = this.prevStatus = false; // false = normal, true = compact

			this.initiated = true
		},
		returnHeader: function(instant) {
			if (!this.initiated || this.root.headerPosition == this.root.headerOffset) return;
			if (instant) {
				this.root.headerPosition = this.root.headerOffset
				this.root.setCssVar()
				return
			}
			let
				timeoutMultiplier = 0.7,
				timeInterval = 10,
				startTime = new Date().valueOf(),
				startValue = this.root.headerPosition,
				newValue,
				moveStep = (this.root.headerOffset - this.root.headerPosition) / (this.root.timeout * timeoutMultiplier) / timeInterval * 100;

			let timerid = setInterval(function(){
				newValue = startValue + (new Date().valueOf() - startTime) * moveStep / timeInterval;
				if (newValue >= this.root.headerOffset) this.root.headerPosition = this.root.headerOffset
				else this.root.headerPosition = newValue
				this.root.setCssVar()
			}.bind(this), timeInterval)

			setTimeout(function(){
				clearInterval(timerid);
				this.root.headerPosition = this.root.headerOffset
				this.root.setCssVar()
			}.bind(this), this.root.timeout * timeoutMultiplier)
		},
		moveHeader: function() {
			if (!this.initiated) return;
			if (this.root.params.hidingHeaderView == 'mobile' && window.innerWidth > this.root.away.getMobileBreakpoint()) return;
			if (this.root.params.hidingHeaderView == 'desktop' && window.innerWidth <= this.root.away.getMobileBreakpoint()) return;

			// this 'if' prevents header's jump after page reloading in the middle of the content
			if (this.firstMoveScroll) {
				this.Y = this.YPrev = scrollY;
				this.diff = 0;
				return this.firstMoveScroll = false
			}
			// lazyLoad check
			if ((scrollY < (this.Y + this.diff) && this.Y > this.YPrev) || (scrollY > (this.Y + this.diff) && this.Y < this.YPrev)) {
				this.diff = scrollY - this.Y;
			}
			// scroll-move
			let
				currentPos = this.root.headerPosition,
				visiblePos = this.root.headerOffset,
				hiddenPos = visiblePos - this.root.headerHeight - this.root.params.hiddenPositionOffset;
			this.YPrev = this.Y;
			this.Y = scrollY - this.diff;
			currentPos -= this.Y - this.YPrev;
			if (currentPos > visiblePos) currentPos = visiblePos;
			if (currentPos < hiddenPos) currentPos = hiddenPos;
			this.root.headerPosition = currentPos;
			this.root.setCssVar()
		},
		setCompactMode: function() {
			if (!this.initiated) return;
			if (this.firstCompactScroll) return this.firstCompactScroll = false
			this.status = window.scrollY > this.root.params.compactModeThreshold ? true : false;
			if (this.status != this.prevStatus) {
				if (this.status) this.root.headerElem.classList.add(this.root.names.stateCompact)
				else this.root.headerElem.classList.remove(this.root.names.stateCompact)
				this.prevStatus = this.status
			}
		},
		removeCompactMode: function() {
			if (!this.initiated) return;
			this.root.headerElem.classList.remove(this.root.names.stateCompact)
			this.prevStatus = this.status = false
		}
	}
	// /Hiding Header
}
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

///////////////////////////////////////////////////////  

// Modal window //
/* 
	Init params {obj}:
	- shareHeader - allows to call header into view and use its close button, etc. (default - false)
	- on: { 'modal-window': {open, close} } - event function(timeout, content){}
		'modal-window' name can be 'any' - trigger on any window

	Usable methods:
	- modal.open('modal-info', true) - params: str 'modalName' (default = none), bool 'skipLock' (default = false)
	- modal.close(true) - params: bool 'skipLock' (default = false)

	On-func example:
	modal.init({
		on: {
			'any': {
				open: function(timeout, content) {console.log(content)}
			},
			'modal-video': {
				open: function(timeout, content) {setTimeout(() => {videoPlayer.play(content)}, timeout)},
				close: function(timeout, content) {videoPlayer.pause(content)}
			}
		}
	})

	Set transition timeout in CSS only. JS will read it.
*/
const modal = {
	selfName: 'modal',
	names: {
		// selectors:
		modal: '.modal',
		window: '.modal__window',
		wrapper: '.modal__wrapper',
		content: '.modal__content',
		closeBtn: '.modal__close-button',
		// class names:
		modalLink: 'modal-link',
		// status class names:
		statusVisible: '_visible',
		statusActive: '_active',
		// css variable names:
		varTimer: '--timer-modal',
	},
	away: {
		lockScroll: function(){},
		unlockScroll: function(){},
		transitionIsLocked: function(){},
		closeOtherModules: function(skipLock){},
		shareHeader: function(){},
		unshareHeader: function(){},
	},
	params: {},
	initiated: false,
	init: async function(params){
		this.modalElem = document.body.querySelector(this.names.modal);
		if (!this.modalElem) return;
		this.windows = this.modalElem.querySelectorAll(this.names.window);
		if (this.windows.length == 0) return;

		if (params) this.params = params;

		this.timeout = parseFloat(getComputedStyle(document.body).getPropertyValue(this.names.varTimer))*1000 || 0;

		this.modalElem.addEventListener('click', function(e) {
			if (!e.target.closest(this.names.wrapper)) this.closeByEvent(e);
		}.bind(this));

		this.links = document.body.querySelectorAll('.' + this.names.modalLink);
		for (let i = 0; i < this.links.length; i++) {
			this.links[i].addEventListener('click', this.openByEvent.bind(this));
		}
		let closeButtons = this.modalElem.querySelectorAll(this.names.closeBtn);
		for (let i = 0; i < closeButtons.length; i++) {
			closeButtons[i].addEventListener('click', this.closeByEvent.bind(this));
		}
		this.on = this.params.on || {};
		this.cssZindex = 11;

		this.initiated = true
	},

	openByEvent: function(e) {
		if (e) {
			e.preventDefault()
			this.open(e.currentTarget.getAttribute('href'))
		}
	},
	open: function(modalName, skipLock){
		if (!this.initiated || !modalName) return;
		if (!modalName.match(/^\#/)) modalName = '#' + modalName;
		let activeModal = this.modalElem.querySelector(modalName);
		if (!activeModal) return console.log(`[${this.selfName}] ERR! Modal "${modalName}" not found`);
		if (activeModal.classList.contains(this.names.statusActive)) return;

		if (!skipLock) {
			if (this.away.transitionIsLocked()) return; // get transition after all other checks, because it locks on the first call
			this.away.lockScroll() // lock placed before on-funcs in case if there will be any window.scroll effects further
		}

		this.away.closeOtherModules(true); // e.g. header menu
		if (this.params.shareHeader) this.away.shareHeader(); // call header and use its close button
		this.close(true, true); // close prev opened modals

		activeModal.style.zIndex = this.cssZindex++;
		activeModal.classList.add(this.names.statusActive);
		this.modalElem.classList.add(this.names.statusVisible);

		let onFuncContent = activeModal.querySelector(this.names.content);
		if (this.on[activeModal.id] && this.on[activeModal.id].open)
			this.on[activeModal.id].open(this.timeout, onFuncContent);
		if (this.on['any'] && this.on['any'].open)
			this.on['any'].open(this.timeout, onFuncContent);
	},

	closeByEvent: function(e) {
		if (e) {
			if (e.currentTarget.classList.contains(this.names.modalLink)) return; // checks if 'close' button is used as 'back' button
			e.preventDefault()
			this.close()
		}
	},
	close: function(skipLock, closePrev){
		if (!this.initiated || !this.modalElem.classList.contains(this.names.statusVisible)) return;
		if (!skipLock) {
			if (this.away.transitionIsLocked()) return;
			this.away.unlockScroll()
		}
		if (this.params.shareHeader && !closePrev) this.away.unshareHeader();

		let activeModal = false;
		for (let i = 0; i < this.windows.length; i++) {
			if (this.windows[i].classList.contains(this.names.statusActive)) {
				this.windows[i].classList.remove(this.names.statusActive);
				activeModal = this.windows[i];
			}
		}
		this.modalElem.classList.remove(this.names.statusVisible);

		if (activeModal) {
			let onFuncContent = activeModal.querySelector(this.names.content);
			if (this.on[activeModal.id] && this.on[activeModal.id].close)
				this.on[activeModal.id].close(this.timeout, onFuncContent);
			if (this.on['any'] && this.on['any'].close)
				this.on['any'].close(this.timeout, onFuncContent);
		}
	},
}
// modal.params = {
	// shareHeader: true,
	// on: {
	// 	'any': {
	// 		open: function(timeout, content) {},
	// 		close: function(timeout, content) {},
	// 	},
	// }
// }

///////////////////////////////////////////////////////   

// Select //
/*	
	Init params {obj}:
	- elem - element name (default = 'select')
	- firstOptSelected (default = false)
	- onselect - event function(selection)
*/
class Select {
	constructor(params = {}) {
		this.elemName = params.elem || 'select'
		this.elem = document.querySelector('.' + this.elemName)
		if (!this.elem) return;
		this.basicSelect = this.elem.querySelector('select')
		if (this.basicSelect) this.basicOptions = this.basicSelect.querySelectorAll('option')

		this.stateActive = 'active'
		this.stateSelected = 'selected'

		this.header = this.elem.querySelector('.select__header')
		this.headertext = this.elem.querySelector('.select__header-text')
		this.listWrapper = this.elem.querySelector('.select__list-wrapper')
		this.listWrapper.innerHTML = ''


		let newList = document.createElement('ul')
		newList.classList.add('select__list')
		this.listWrapper.appendChild(newList)
		for (let i = 0; i < this.basicOptions.length; i++) {
			if (this.basicOptions[i].hasAttribute('disabled')) continue;
			let newLi = document.createElement('li')
			newLi.classList.add('select__option')
			newLi.innerHTML = this.basicOptions[i].innerHTML
			newList.appendChild(newLi)
		}

		this.options = this.elem.querySelectorAll('.select__option');
		for (let i = 0; i < this.options.length; i++) {
			this.options[i].addEventListener('click', function(e) {
				this.selectItem(e, i)
				this.basicSelect.dispatchEvent(new Event('change')) // this event is to remove form error class from basic select
			}.bind(this))
		}

		this.basicSelect.addEventListener('change', this.resetByChangeEvent.bind(this))

		this.header.addEventListener('click', this.showList.bind(this))
		window.addEventListener('click', this.hideList.bind(this), {capture: true})
		window.addEventListener('resize', this.hideList.bind(this))
		this.isOpened = false

		this.firstOptSelected = params.firstOptSelected
		this.selectItem(false, this.firstOptSelected ? 0 : -1)

		this.onselect = params.onselect || function(){}
	}
	hideList(e) {
		if (!this.isOpened) return;
		this.listWrapper.style.height = ''
		this.elem.classList.remove(this.stateActive)
		this.listWrapper.classList.remove(this.stateActive)
		setTimeout(function() {this.isOpened = false}.bind(this), 100) // timeout in case if 'isOpened' is read twice
	}
	showList(e) {
		if (this.isOpened) return;
		this.listWrapper.style.height = this.listWrapper.children[0].offsetHeight + 'px'
		this.elem.classList.add(this.stateActive)
		this.listWrapper.classList.add(this.stateActive)
		this.isOpened = true
	}
	selectItem(e, i = 0) {
		let activeOption = e ? e.currentTarget : this.options[i]
		for (let j = 0; j < this.basicOptions.length; j++) {
			this.basicOptions[j].removeAttribute('selected')
			if (this.options[j]) this.options[j].classList.remove(this.stateSelected)
		}
		if (activeOption) activeOption.classList.add(this.stateSelected)
		this.basicOptions[i+1].setAttribute('selected', 'true')
		if (e) this.onselect(this.basicOptions[i+1].value)
		this.headertext.innerHTML = this.basicOptions[i+1].innerHTML
	}
	reset() { // function for outer reset
		if (!this.elem) return;
		this.selectItem(false, this.firstOptSelected ? 0 : -1)
		this.hideList()
	}
	resetByChangeEvent() {
		// this reset comes from the form module
		if (this.basicSelect.value == '') this.selectItem(false, this.firstOptSelected ? 0 : -1)
	}
}
// name example: select_*name*
const select_form = new Select({
	elem: 'select',
	firstOptSelected: true,
	// onselect: (selection) => {console.log(selection)}
})

///////////////////////////////////////////////////////                

// Print address & QR-code //
/* 
	Params {obj}:
	- qrCodeSize - width and height (square) in 'px' (default = 150)
*/
async function setPrintAddressAndQRcode(params = {}) {
	let qrElemClassName = '.header-level__print-address-qr'
	let addressElemClassName = '.header-level__print-address'


	let href = window.location.href;
	let addressEl = document.body.querySelector(addressElemClassName);
	if (addressEl && addressEl.innerHTML == '') {
		let addressShort = href.replace(/http:\/\/|https:\/\//, '').replace(/\/$/, '');
		addressEl.innerHTML = addressShort;
	}

	let qrCodeSize = typeof params.qrCodeSize == 'number' ? params.qrCodeSize : 150;
	if (qrCodeSize < 50) qrCodeSize = 0;
	if (qrCodeSize > 300) qrCodeSize = 300;
	let qrCodeEl = document.body.querySelector(qrElemClassName);
	if (qrCodeSize && qrCodeEl && qrCodeEl.innerHTML == '') {
		let codeStr = `<img src="https://chart.googleapis.com/chart?cht=qr&chs=${qrCodeSize}x${qrCodeSize}&choe=UTF-8&chld=H|0&chl=${href}" alt="" loading="lazy">`;
		qrCodeEl.innerHTML = codeStr;
	}
}
setPrintAddressAndQRcode({
	// qrCodeSize: 150 // number (default = 150)
})

///////////////////////////////////////////////////////    

// Prevent 'tabbing' //
async function preventTabbing(selectorStr = 'a, button, input, textarea') {
	if (typeof selectorStr != 'string') return;
	let noTabElements = document.body.querySelectorAll(selectorStr);
	for (let i = 0; i < noTabElements.length; i++) {
		noTabElements[i].setAttribute('tabindex','-1');
	}
}
preventTabbing() // param = selector string

///////////////////////////////////////////////////////  
