/*
	// Header metrics //
	This is an important part of 'header' module. Look for info in 'header.js'.
*/
const headerMetrics = {
	names: {
		// metrics names:
		elemAboveHeader: '#wpadminbar',
		header: '.header',
		// headerMenuOptions names:
		menu: '.header-menu-hide-wrapper',
		menuItems: '.header-menu__items',
		menuOptions: '#header-menu-options',
		thisPageClass: 'this-page',
		// css variable names:
		varWinHeight: '--window-height',
		varHeight: '--header-height',
		varPos: '--header-position',
		varOffset: '--header-offset',
	},
	init: function() {
		this.headerElem = document.body.querySelector(this.names.header);
		if (!this.headerElem) return;

		// headerMenuOptions handler
		this.sortMenuItems()

		// This command forces to load CSS first, it is necessary to calculate metrics more accurate
		let styles = getComputedStyle(document.body).width;

		// Elem above the header (e.g. WordPress adminbar) is needed to calculate header position.
		this.elemAboveHeader = document.body.querySelector(this.names.elemAboveHeader);
		// Get 'elemAboveHeader' and calc height again later if 'elemAboveHeader' is below 'header'
		window.addEventListener('DOMContentLoaded', function() {
			if (!this.elemAboveHeader) {
				this.elemAboveHeader = document.body.querySelector(this.names.elemAboveHeader);
				this.calcHeaderHeight(false, true)
			}
		}.bind(this))

		// Header metrics: arr[currentValue, prevValue, metricName]. All of them will go to CSS.
		this.headerHeight = [0, 0, this.names.varHeight];
		this.headerPosition = [0, 0, this.names.varPos];
		this.headerOffset = [0, 0, this.names.varOffset];
		this.windowHeight = [0, 0, this.names.varWinHeight]; // this var forces to get window height, it provides correct menu height calculating on mobile browsers that have floating panels

		window.addEventListener('resize', this.calcHeaderHeight.bind(this))
		this.calcHeaderHeight(false, true)
	},
	calcHeaderHeight: function(e, init) {
		this.windowHeight[0] = window.innerHeight;
		this.headerHeight[0] = this.headerElem.offsetHeight;
		this.headerOffset[0] = this.elemAboveHeader ? this.elemAboveHeader.offsetHeight : 0;
		if (init) this.headerPosition[0] = this.headerOffset[0]
		this.setCssVar();
		return [this.headerHeight[0], this.headerPosition[0], this.headerOffset[0]]
	},
	setCssVar: function() {
		function set(arr) {
			let [newValue, prevValue, varName] = arr;
			if (newValue != prevValue) {
				newValue = Math.round(newValue * 10) / 10;
				document.body.style.setProperty(varName, newValue + 'px')
				arr[1] = newValue
			}
		}
		set(this.headerHeight)
		set(this.headerPosition)
		set(this.headerOffset)
		set(this.windowHeight)
	},
	sortMenuItems: function() {
		this.menuElem = this.headerElem.querySelector(this.names.menu);
		if (!this.menuElem) return;

		let headerMenuOptionsElem = document.body.querySelector(this.names.menuOptions);
		if (headerMenuOptionsElem) {
			let newMenu = this.menuElem.querySelector(this.names.menuItems);
			if (typeof headerMenuOptions == 'object') {
				if (headerMenuOptions.links) {
					let clone = {};
					for (let i = 0; i < newMenu.children.length; i++) {
						clone[newMenu.children[i].dataset.linkname] = newMenu.children[i];
					}
					newMenu.innerHTML = '';
					for (let i = 0; i < headerMenuOptions.links.length; i++) {
						newMenu.appendChild(clone[headerMenuOptions.links[i]]);
					}
				}
				if (headerMenuOptions.activeLink) {
					for (let i = 0; i < newMenu.children.length; i++) {
						if (newMenu.children[i].dataset.linkname == headerMenuOptions.activeLink) {
							newMenu.children[i].firstElementChild.classList.add(this.names.thisPageClass);
							break;
						}
					}
				}
			}
			headerMenuOptionsElem.parentElement.removeChild(headerMenuOptionsElem);
		}
	}
}
headerMetrics.init()