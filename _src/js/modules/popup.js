/*	
	Init params {obj}:
	- elem - element name (default = 'popup')
*/
class Popup {
	constructor(params = {}) {
		this.elemName = params.elem || 'popup';
		this.elem = document.querySelector('.' + this.elemName);
		if (!this.elem) return;

		this.isLoaded = true;

		let closeBtn = this.elem.querySelector('.popup__close-btn');
		if (closeBtn) closeBtn.addEventListener('click', this.close.bind(this));
	}
	open() {
		if (this.isLoaded)
			this.elem.classList.add('_visible');
	}
	close() {
		if (this.isLoaded)
			this.elem.classList.remove('_visible');
	}
}