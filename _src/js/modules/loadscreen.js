/*
	Init params {obj}:
	- timeout - timeout between document is loaded and loadscreen begins to fade (default = 0)
	- scrollToTop - force scroll document to top on page reload (default = false)
*/
const loadscreen = {
	elemSelector: '.loadscreen',
	lockedClassName: 'loadscreen--locked',
	init: function(params = {}) {
		this.elem = document.querySelector(this.elemSelector);
		if (!this.elem) return;
		let that = this;
		document.body.classList.add(this.lockedClassName);
		window.addEventListener('load', () => {
			setTimeout(() => {
				document.body.classList.remove(this.lockedClassName);
				if (params.scrollToTop) window.scrollTo({top: 0, behavior: 'instant'});
				that.elem.classList.remove(this.lockedClassName);
			}, params.timeout || 0)
		})
	}
}