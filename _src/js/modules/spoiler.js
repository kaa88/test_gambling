const spoiler = {
	names: {
		spoiler: '.spoiler',
		wrapper: '.spoiler__wrapper'
	},
	init: async function() {
		this.wrappers = document.querySelectorAll(this.names.wrapper);
		if (this.wrappers.length == 0) return;
		this.calcHeight();
		let that = this;
		window.addEventListener('load', () => {
			for (let i = 0; i < that.wrappers.length; i++) {
				that.wrappers[i].closest(that.names.spoiler).children[0].addEventListener('click', that.toggle.bind(that));
			}
			that.calcHeight(); // calc in case fonts are not loaded yet, so the height might be wrong
			window.addEventListener('resize', that.calcHeight.bind(that));
		})
	},
	calcHeight: function() {
		let changes = false;
		for (let i = 0; i < this.wrappers.length; i++) {
			let newMaxHeight = this.wrappers[i].children[0].offsetHeight;
			if (newMaxHeight != this.wrappers[i].itemMaxHeight)
				changes = true;
			this.wrappers[i].itemMaxHeight = newMaxHeight;
		};
		if (changes) this.setHeight();
	},
	setHeight() {
		for (let i = 0; i < this.wrappers.length; i++) {
			if (this.wrappers[i].closest(this.names.spoiler).classList.contains('_visible'))
				this.wrappers[i].style.height = this.wrappers[i].itemMaxHeight + 'px';
			else
				this.wrappers[i].style.height = '';
		}
	},
	toggle: function(e) {
		e.currentTarget.parentElement.classList.toggle('_visible');
		this.setHeight();
	}
}