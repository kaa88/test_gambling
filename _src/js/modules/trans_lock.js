/* 
	Module prevents double-clicking on transitions, e.g. when menu slides.
	Use: if (transitionLock.check( *timeout* )) return;
*/
const transitionLock = {
	locked: false,
	check: function(timeout = 0) {
		let result = this.locked;
		if (this.locked == false) {
			this.locked = true;
			setTimeout(function(){
				this.locked = false;
			}.bind(this), timeout);
		}
		return result;
	}
}