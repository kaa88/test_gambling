/*	
	2 ways of use: run 'start' func directly or set up 'launcher' parameter
	to run as 'click' event listener.

	Init params:
	- launcher - launcher element (button) selector (default = '.counter-button')
	- output - result element selector (default = '.counter')
	- goal - goal value (default = 0)
	- timeout - timeout in seconds (default = 0)
*/
class SimpleCounter {
	constructor(params = {}) {
		let resultElemName = params.output || '.counter';
		this.resultElem = document.querySelector(resultElemName);
		if (!this.resultElem) return;

		let launchElemName = params.launcher || '.counter-button';
		this.launchElem = document.querySelector(launchElemName);
		if (this.launchElem)
			this.launchElem.addEventListener('click', this.start.bind(this));

		this.goal = params.goal || 0;
		this.timeout = params.timeout || 0;
		if (this.timeout == 0) this.increment = 0;
		else this.increment = this.goal / (this.timeout * 1000);
	}
	start() {
		if (!this.resultElem) return;
		let that = this;
		that.startDate = new Date().valueOf();
		that.timerId = setInterval(function(){
			that.counter = Math.floor((new Date().valueOf() - that.startDate) * that.increment);
			that.resultElem.innerHTML = that.counter;
		}, 11);
		setTimeout(function(){
			clearInterval(that.timerId);
			that.resultElem.innerHTML = that.goal;
		}, that.timeout * 1000);
	}
}