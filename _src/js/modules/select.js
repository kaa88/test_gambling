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