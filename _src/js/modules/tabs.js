const tabsBlockButtons = document.querySelectorAll('.tabs__btn');
for (let i = 0; i < tabsBlockButtons.length; i++) {
	tabsBlockButtons[i].addEventListener('click', function() {
		let buttons = this.parentElement.children,
			content = this.parentElement.nextElementSibling.children;
		for (let i = 0; i < content.length; i++) {
			content[i].classList.remove('_active');
		}
		for (let i = 0; i < buttons.length; i++) {
			buttons[i].classList.remove('_active');
			if (buttons[i] == this) {
				buttons[i].classList.add('_active');
				content[i].classList.add('_active');
			}
		}
	})
}	