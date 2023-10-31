/* 
	Init params:
	- elem - element selector (default = '.accordion')
	- isOpened - make 1st item opened (default = false)
*/
class Accordion {
	constructor(params = {}) {
		let elem = params.elem || '.accordion';
		this.elem = document.querySelector(elem);
		if (!this.elem) return;

		this.items = this.elem.querySelectorAll('.accordion__item');
		for (let i = 0; i < this.items.length; i++) {
			this.items[i].children[0].addEventListener('click', this.activate.bind(this));
		}
		this.calcHeight();
		window.addEventListener('resize', this.calcHeight.bind(this));

		if (params.isOpened) this.activate();
	}
	calcHeight() {
		let changes = false;
		for (let i = 0; i < this.items.length; i++) {
			let newMinHeight = this.items[i].children[0].offsetHeight;
			let newMaxHeight = newMinHeight + this.items[i].children[1].offsetHeight;
			if (newMinHeight != this.items[i].itemMinHeight || newMaxHeight != this.items[i].itemMaxHeight)
				changes = true;
			this.items[i].itemMinHeight = newMinHeight;
			this.items[i].itemMaxHeight = newMaxHeight;
		};
		if (changes) this.setHeight();
	}
	activate(e) {
		if (e) {
			for (let i = 0; i < this.items.length; i++) {
				this.items[i].classList.remove('_active');
			}
			e.currentTarget.parentElement.classList.add('_active');
		}
		else this.items[0].classList.add('_active');
		this.setHeight();
	}
	setHeight() {
		for (let i = 0; i < this.items.length; i++) {
			if (this.items[i].classList.contains('_active'))
				this.items[i].style.height = this.items[i].itemMaxHeight + 'px';
			else
				this.items[i].style.height = this.items[i].itemMinHeight + 'px';
		}
	}
}