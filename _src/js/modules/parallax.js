/* 
	Yet only vertical orientation.

	Calculates onScroll parallax effect of the element that is contained in another element
	or in a <body>. ParallaxElem must be styled with 'position: absolute'.

	By default script will calc the move distance of the parallaxElem depending on
	the scrollingContent's scroll height. Also there is a 'start' point calculated from a
	css 'top' value of the elem. You can set up 'start' and 'distance' manually.

	Many kinds of elems could be a parallaxElem, e.g. fullsize backgroud image, small icons or any other elems.
	Example: you can make a sky as a background and many different clouds that move by different distances. All of them have the same params.

	Init params {obj}:
	- parallaxElem - parallax elem selector (default = '.parallax')
	- scrollingContent - selector of the elem with the scrolling content (default = 'document.body')
	- start - 'top' property value at the scroll start (default = *css elem 'top' value*)
	- distance - elem's move distance from the start (default = 0)
*/
class Parallax {
	constructor(params = {}) {
		if (params.parallaxElem) this.parallaxElem = document.body.querySelector(params.parallaxElem);
		else this.parallaxElem = document.body.querySelector('.parallax');
		if (!this.parallaxElem) return;

		if (params.scrollingContent) {
			this.scrollingContent = document.body.querySelector(params.scrollingContent);
			this.useWindow = false;
		}
		else {
			this.scrollingContent = document.body;
			this.useWindow = true;
		}
		if (!this.scrollingContent) return;

		this.start = params.start || parseFloat(getComputedStyle(this.parallaxElem).top);
		this.distance = params.distance || 0;
		this.calc();

		let eventListener = this.useWindow ? window : this.scrollingContent;
		eventListener.addEventListener('scroll', this.move.bind(this));
		eventListener.addEventListener('resize', this.calc.bind(this));
	}
	calc() {
		let wrapHeight = this.useWindow ? window.innerHeight : this.scrollingContent.clientHeight;
		this.scrollDistance = this.scrollingContent.scrollHeight - wrapHeight;
		this.parallaxDistance = this.distance ? this.distance : (this.parallaxElem.offsetHeight - wrapHeight);
		this.move();
	}
	move() {
		if (this.parallaxDistance > 0) {
			let scroll = this.useWindow ? scrollY : this.scrollingContent.scrollTop;
			this.parallaxElem.style.top = -this.parallaxDistance * scroll / this.scrollDistance + this.start + 'px';
		}
	}
}