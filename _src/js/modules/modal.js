/* 
	Init params {obj}:
	- shareHeader - allows to call header into view and use its close button, etc. (default - false)
	- on: { 'modal-window': {open, close} } - event function(timeout, content){}
		'modal-window' name can be 'any' - trigger on any window

	Usable methods:
	- modal.open('modal-info', true) - params: str 'modalName' (default = none), bool 'skipLock' (default = false)
	- modal.close(true) - params: bool 'skipLock' (default = false)

	On-func example:
	modal.init({
		on: {
			'any': {
				open: function(timeout, content) {console.log(content)}
			},
			'modal-video': {
				open: function(timeout, content) {setTimeout(() => {videoPlayer.play(content)}, timeout)},
				close: function(timeout, content) {videoPlayer.pause(content)}
			}
		}
	})

	Set transition timeout in CSS only. JS will read it.
*/
const modal = {
	selfName: 'modal',
	names: {
		// selectors:
		modal: '.modal',
		window: '.modal__window',
		wrapper: '.modal__wrapper',
		content: '.modal__content',
		closeBtn: '.modal__close-button',
		// class names:
		modalLink: 'modal-link',
		// status class names:
		statusVisible: '_visible',
		statusActive: '_active',
		// css variable names:
		varTimer: '--timer-modal',
	},
	away: {
		lockScroll: function(){},
		unlockScroll: function(){},
		transitionIsLocked: function(){},
		closeOtherModules: function(skipLock){},
		shareHeader: function(){},
		unshareHeader: function(){},
	},
	params: {},
	initiated: false,
	init: async function(params){
		this.modalElem = document.body.querySelector(this.names.modal);
		if (!this.modalElem) return;
		this.windows = this.modalElem.querySelectorAll(this.names.window);
		if (this.windows.length == 0) return;

		if (params) this.params = params;

		this.timeout = parseFloat(getComputedStyle(document.body).getPropertyValue(this.names.varTimer))*1000 || 0;

		this.modalElem.addEventListener('click', function(e) {
			if (!e.target.closest(this.names.wrapper)) this.closeByEvent(e);
		}.bind(this));

		this.links = document.body.querySelectorAll('.' + this.names.modalLink);
		for (let i = 0; i < this.links.length; i++) {
			this.links[i].addEventListener('click', this.openByEvent.bind(this));
		}
		let closeButtons = this.modalElem.querySelectorAll(this.names.closeBtn);
		for (let i = 0; i < closeButtons.length; i++) {
			closeButtons[i].addEventListener('click', this.closeByEvent.bind(this));
		}
		this.on = this.params.on || {};
		this.cssZindex = 11;

		this.initiated = true
	},

	openByEvent: function(e) {
		if (e) {
			e.preventDefault()
			this.open(e.currentTarget.getAttribute('href'))
		}
	},
	open: function(modalName, skipLock){
		if (!this.initiated || !modalName) return;
		if (!modalName.match(/^\#/)) modalName = '#' + modalName;
		let activeModal = this.modalElem.querySelector(modalName);
		if (!activeModal) return console.log(`[${this.selfName}] ERR! Modal "${modalName}" not found`);
		if (activeModal.classList.contains(this.names.statusActive)) return;

		if (!skipLock) {
			if (this.away.transitionIsLocked()) return; // get transition after all other checks, because it locks on the first call
			this.away.lockScroll() // lock placed before on-funcs in case if there will be any window.scroll effects further
		}

		this.away.closeOtherModules(true); // e.g. header menu
		if (this.params.shareHeader) this.away.shareHeader(); // call header and use its close button
		this.close(true, true); // close prev opened modals

		activeModal.style.zIndex = this.cssZindex++;
		activeModal.classList.add(this.names.statusActive);
		this.modalElem.classList.add(this.names.statusVisible);

		let onFuncContent = activeModal.querySelector(this.names.content);
		if (this.on[activeModal.id] && this.on[activeModal.id].open)
			this.on[activeModal.id].open(this.timeout, onFuncContent);
		if (this.on['any'] && this.on['any'].open)
			this.on['any'].open(this.timeout, onFuncContent);
	},

	closeByEvent: function(e) {
		if (e) {
			if (e.currentTarget.classList.contains(this.names.modalLink)) return; // checks if 'close' button is used as 'back' button
			e.preventDefault()
			this.close()
		}
	},
	close: function(skipLock, closePrev){
		if (!this.initiated || !this.modalElem.classList.contains(this.names.statusVisible)) return;
		if (!skipLock) {
			if (this.away.transitionIsLocked()) return;
			this.away.unlockScroll()
		}
		if (this.params.shareHeader && !closePrev) this.away.unshareHeader();

		let activeModal = false;
		for (let i = 0; i < this.windows.length; i++) {
			if (this.windows[i].classList.contains(this.names.statusActive)) {
				this.windows[i].classList.remove(this.names.statusActive);
				activeModal = this.windows[i];
			}
		}
		this.modalElem.classList.remove(this.names.statusVisible);

		if (activeModal) {
			let onFuncContent = activeModal.querySelector(this.names.content);
			if (this.on[activeModal.id] && this.on[activeModal.id].close)
				this.on[activeModal.id].close(this.timeout, onFuncContent);
			if (this.on['any'] && this.on['any'].close)
				this.on['any'].close(this.timeout, onFuncContent);
		}
	},
}