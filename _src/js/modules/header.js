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