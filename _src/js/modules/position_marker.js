/*
	One day I faced with a problem that I can not control container's height according to its content. That happened because mobile and desktop layouts was too different. So I decided to put a 'marker' into an element and caltulate its position. This is what this module is about.
	Set an invisible marker into an element. By default the marker has 'position: absolute', so make sure the parent is positioned as well.
	Module sets up a css variable, so you can use it on a calculated elem.
*/
const positionMarker = {
	markerSelector: '.position-marker',
	cssVarName: '--marker-position',
	init: function() {
		this.marker = document.body.querySelector(this.markerSelector)
		if (!this.marker) return;
		this.markerPos = 0
		this.calcPosition()
		window.addEventListener('resize', this.calcPosition.bind(this))
	},
	calcPosition: function() {
		let markerPos = Math.round(this.marker.getBoundingClientRect().y + scrollY)
		if (markerPos != this.markerPos) {
			document.body.style.setProperty(this.cssVarName, markerPos + 'px')
			this.markerPos = markerPos
		}
	}
}