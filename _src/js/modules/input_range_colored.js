/* 
	Script for input's track gradient filling

	Init params {obj}:
	- elem - element name (default = 'input-range')
	- trackColorStart - color of the left track part (default = 'var(--track-color-start)')
	- trackColorEnd - color of the right track part (default = 'var(--track-color-end)')
*/
class InputRangeColored {
	constructor(params = {}) {
		this.elemName = params.elem || 'input-range';
		this.input = document.querySelector('.' + this.elemName + ' input');
		if (!this.input) return;

		this.styleElem = document.createElement('style');
		this.input.parentElement.appendChild(this.styleElem);

		this.trackColorStart = params.trackColorStart || 'var(--track-color-start)';
		this.trackColorEnd = params.trackColorEnd || 'var(--track-color-end)';

		this.input.addEventListener('input', this.fillTrack.bind(this));
		this.input.addEventListener('change', this.fillTrack.bind(this));
		this.fillTrack();
	}
	fillTrack() {
		let cssNameWebkit = '.' + this.elemName + ' input::-webkit-slider-runnable-track';
		let cssNameMoz = '.' + this.elemName + ' input::-moz-range-track';
		let cssStyle = '{background: linear-gradient(to right,' + this.trackColorStart + ' ' + this.input.value + '%,' + this.trackColorEnd + ' ' + this.input.value + '%);}';
		this.styleElem.innerHTML = cssNameWebkit + cssStyle + cssNameMoz + cssStyle;
	}
	// This func removes style element. It is useful with Swiper on slide change.
	destroy() {
		if (this.input) {
			let styleElem = this.input.parentElement.querySelector('style');
			styleElem.parentElement.removeChild(styleElem);
		}
	}
}