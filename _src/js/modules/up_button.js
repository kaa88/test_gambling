const upButton = {
	init: async function() {
		this.elem = document.querySelector('.up-button');
		if (!this.elem) return;

		this.prevPos = scrollY;
		this.visible = false;
		window.addEventListener('scroll', this.showButton.bind(this))
		this.elem.addEventListener('click', () => {
			window.scrollTo({top: 0, behavior: 'smooth'});
		})
	},
	showButton: function() {
		function show(that, show) {
			if (show) that.elem.classList.add('_visible');
			else that.elem.classList.remove('_visible');
			that.visible = show;
		}

		if (scrollY < window.innerHeight) { // page start
			if (this.visible == true) show(this, false);
			return;
		}
		if (scrollY >= document.body.scrollHeight - window.innerHeight) { // page end
			if (this.visible == false) show(this, true);
			return;
		}
		if (scrollY < this.prevPos) {
			if (this.visible == false) show(this, true);
		}
		if (scrollY > this.prevPos) {
			if (this.visible == true) show(this, false);
		}
		this.prevPos = scrollY;
	}
}