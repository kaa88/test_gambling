const timeSelect = {
	names: {
		activeClass: '_active',
		selectedClass: '_selected',
		selectionClass: '_selection',
	},
	init: async function() {
		this.elem = document.querySelector('.time-select')
		if (!this.elem) return;

		// Inputs
		let inputs = this.elem.querySelectorAll('.time-select__input')
		this.inputH = inputs[0]
		this.inputM = inputs[1]
		this.inputH.addEventListener('click', this.focusInput.bind(this))
		this.inputM.addEventListener('click', this.focusInput.bind(this))
		this.inputH.addEventListener('blur', this.checkInputBlur.bind(this))
		this.inputM.addEventListener('blur', this.checkInputBlur.bind(this))
		this.inputH.addEventListener('keydown', this.checkInputValue.bind(this))
		this.inputM.addEventListener('keydown', this.checkInputValue.bind(this))
		this.inputH.addEventListener('input', this.checkInputTimeFormat.bind(this))
		this.inputM.addEventListener('input', this.checkInputTimeFormat.bind(this))
		//

		// Selectors
		let selectors = this.elem.querySelectorAll('.time-select__selector')
		this.selectorH = selectors[0]
		this.selectorM = selectors[1]

		function fillSelector(that, selector, i) {
			let timeStr = i.toString();
			if (i < 10) timeStr = '0' + timeStr;
			let item = document.createElement('span');
			item.innerHTML = timeStr;
			selector.appendChild(item);
			item.addEventListener('mousedown', that.selectTime.bind(that));
		}
		for (let i = 0; i <= 23; i++) {
			fillSelector(this, this.selectorH, i)
		}
		for (let i = 0; i <= 59; i += 5) {
			fillSelector(this, this.selectorM, i)
		}
		//

		// Open/close events
		this.toggleButton = this.elem.querySelector('.time-select__header-expander');
		this.toggleButton.addEventListener('click', this.toggleSelectorBox.bind(this));
		window.addEventListener('click', this.toggleSelectorBox.bind(this));
		//

		// Scrolling parameters
		this.selectorItem = this.selectorH.children[0];
		this.computeSelectorHeight();
		window.addEventListener('resize', this.computeSelectorHeight.bind(this));
		
		this.selectTime('init', this.selectorH);
		this.selectTime('init', this.selectorM);
	},

	getPair: function(item) {
		if (!item) return false
		if (item == this.inputH) return this.selectorH
		if (item == this.inputM) return this.selectorM
		if (item == this.selectorH) return this.inputH
		if (item == this.selectorM) return this.inputM
	},

	focusInput: function(e, elem) {
		if (e) elem = e.target
		this.selection = elem
		elem.select()
	},

	removeSelection: function() {
		this.selection = false
	},

	checkInputValue: function(e) {
		// choose the input
		let isHour = true;
		if (e.target == this.inputM) isHour = false;
		// clear the input
		if (this.selection == e.target && e.key != 'Tab') {
			e.target.setAttribute('value', '');
			e.target.value = '';
			this.removeSelection();
		}
		// check value
		if (e.key.match(/[0-9]/) && e.target.value.length >= 2) {
			if (isHour) this.inputM.select();
			else e.preventDefault();
		}
		if (e.key == 'Backspace' && e.target.value.length == 0) {
			if (!isHour) {
				e.preventDefault();
				this.focusInput(false, this.inputH);
			}
		}
		if (e.key == 'Tab') {
			e.preventDefault();
			if (isHour) this.focusInput(false, this.inputM);
			else this.focusInput(false, this.inputH);
		}
	},
	
	checkInputTimeFormat: function(e) {
		let maxValue = 23; // hours
		if (e.target == this.inputM) maxValue = 59; // minutes
		if (e.target.value > maxValue) e.target.value = maxValue;
	},
	checkInputBlur: function(e) {
		if (e.target.value.length == 0) e.target.value = '00';
		if (e.target.value.length == 1) e.target.value = '0' + e.target.value;

		this.selectTime(false, this.getPair(e.target));
	},

	selectTime: function(e, selectorEl) { // events: init(1,1), select(1,0), blur(0,1)
		// fill input on selection
		if (e && e != 'init') {
			let targetInput = this.getPair(e.target.parentElement);
			targetInput.setAttribute('value', e.target.innerHTML);
			targetInput.value = e.target.innerHTML;
		}
		//

		// mark selector item
		let s = selectorEl ? selectorEl : e.target.parentElement;
		for (let i = 0; i < s.children.length; i++) {
			s.children[i].classList.remove(this.names.selectedClass);
		}

		let markingTarget, inputValue, index;
		if (selectorEl) {
			inputValue = this.getPair(selectorEl).value;
			for (let i = 0; i < selectorEl.children.length; i++) {
				if (selectorEl && selectorEl.children[i].innerHTML == inputValue) {
					markingTarget = selectorEl.children[i];
					index = i;
					break;
				}
			}
			// scroll into view
			if (markingTarget) markingTarget.parentElement.scrollTop = this.selectorHeight * (index - 2);
		}
		else markingTarget = e.target;
		if (markingTarget) markingTarget.classList.add(this.names.selectedClass);
	},

	computeSelectorHeight: function() {
		this.selectorHeight = parseFloat(getComputedStyle(this.selectorItem).height);
	},

	toggleSelectorBox: function(e) {
		e.stopPropagation();
		if (e.currentTarget == this.toggleButton) {
			if (this.elem.classList.contains(this.names.activeClass)) this.elem.classList.remove(this.names.activeClass);
			else this.elem.classList.add(this.names.activeClass);
		}
		else {
			if (e.target.closest('.time-select')) return;
			else if (this.elem.classList.contains(this.names.activeClass)) this.elem.classList.remove(this.names.activeClass);
		}
	},
}