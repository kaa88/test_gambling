/* 
	Full js version, may have 2 thumbs, no vertical orientation

	Init params {obj}:
	- elem - element name (default = 'input-range-dbl')
	- start - track scale start (default = 0)
	- end - track scale end (default = 100)
	- thumbs [] - thumbs base position (default = [0])
	- bubble - enable bubble (default = false)
	- results [] - result element (no default)
*/
class InputRangeDouble {
	constructor(params = {}) {
		let names = {
			elem: 'input-range-double',
			divider: '__',
			track: 'track',
			trackIn: 'track-inner',
			trackPart: 'track-part',
			thumb: 'thumb',
			thumbShape: 'thumb-shape',
			bubble: 'bubble'
		}
		let options = {
			elem: params.elem || names.elem,
			start: params.start || 0,
			end: params.end || 100,
			thumbs: params.thumbs || [0],
			bubble: params.bubble || false,
			results: params.results
		}
		if (typeof options.thumbs != 'object') options.thumbs = [options.thumbs];
		if (typeof options.results != 'object') options.results = [options.results];
		for (let i = 0; i < options.thumbs.length; i++) {
			if (options.thumbs[i] < options.start) options.thumbs[i] = options.start;
			if (options.thumbs[i] > options.end) options.thumbs[i] = options.end;
		}

		this.elem = document.querySelector('.' + options.elem);
		if (!this.elem) return;
		this.track = {};
		this.parts = [];
		this.thumbOptions = options.thumbs;
		this.valueInput = false;

		// Creating elements
		let newTrack = document.createElement('div');
		newTrack.classList.add(names.elem + names.divider + names.track);
		this.elem.appendChild(newTrack);
		this.track.elem = newTrack;
		this.track.start = options.start;
		this.track.end = options.end;
		this.recalculateTrack();
		window.addEventListener('resize', this.recalculateTrack.bind(this));

		let newTrackIn = document.createElement('div');
		newTrackIn.classList.add(names.elem + names.divider + names.trackIn);
		newTrack.appendChild(newTrackIn);

		let that = this;

		for (let i = 0; i < options.thumbs.length; i++) {
			this.parts[i] = {position: {}};

			let newTrackPart = document.createElement('div');
			newTrackPart.classList.add(names.elem + names.divider + names.trackPart + (i + 1));
			newTrackIn.appendChild(newTrackPart);
			this.parts[i].trackPart = newTrackPart;
			if (i === 0) this.parts[i].trackPart_reverse = false;
			else this.parts[i].trackPart_reverse = true;

			let newThumb = document.createElement('div');
			newThumb.classList.add(names.elem + names.divider + names.thumb + (i + 1));
			newTrack.appendChild(newThumb);
			this.parts[i].thumb = newThumb;
		
				let newThumbShape = document.createElement('div');
				newThumbShape.classList.add(names.elem + names.divider + names.thumbShape);
				newThumb.appendChild(newThumbShape);
				this.parts[i].thumbShape = newThumbShape;

				if (options.bubble == true) {
					let newBubble = document.createElement('div');
					newBubble.classList.add(names.elem + names.divider + names.bubble);
					let newSpan = document.createElement('span');
					newBubble.appendChild(newSpan);
					newThumb.appendChild(newBubble);
					this.parts[i].bubble = newSpan;
				}

			if (options.results)
				this.parts[i].result = document.querySelector('.' + options.results[i]);

			// Init positions
			this.activePart = i;
			this.parts[i].position.unit = (this.track.end - this.track.start) / this.track.width;
			this.setPosition(0, this);

			// Input event
			if (this.parts[i].result && this.parts[i].result.tagName == 'INPUT') {
				this.parts[i].result.addEventListener('input', function() {
					that.inputAction(event, that, i);
				});
			}
		}
		// Mouse event
		this.track.elem.addEventListener('mousedown', function() {
			that.mouseAction(event, that);
		});
	}

	recalculateTrack(e) {
		this.track.coord = this.track.elem.getBoundingClientRect().x;
		this.track.width = this.track.elem.clientWidth;
		this.track.indent = (this.track.elem.offsetWidth - this.track.width) / 2 + this.track.coord;
		this.track.coordMin = this.track.indent;
		this.track.coordMax = this.track.coordMin + this.track.width;

		// Recalc absolute position for mouse event
		if (e) {
			for (let i = 0; i < this.parts.length; i++) {
				this.parts[i].position.abs = this.parts[i].position.rel + this.track.indent;
			}
		}
	}

	mouseAction(e, that) {
		that.valueInput = false;
		that.setActivePart(e, that);
		that.addEvents(that);
		that.setMousePosition(e, that);
	}

	inputAction(e, that, i) {
		that.valueInput = true;
		that.activePart = i;
		that.setPosition(e, that);
	}

	addEvents(that) {
		function preventSelect(e) {e.preventDefault()};
		function goToMouseMove() {that.setMousePosition(event, that)};
		window.addEventListener('selectstart', preventSelect);
		window.addEventListener('mousemove', goToMouseMove);
		that.parts[that.activePart].thumb.classList.add('_active');
		that.parts[that.activePart].thumbShape.classList.add('_active');
		document.body.classList.add('_cursor-locked');
		window.addEventListener('mouseup', function() {
			window.removeEventListener('selectstart', preventSelect);
			window.removeEventListener('mousemove', goToMouseMove);
			document.body.classList.remove('_cursor-locked');
			that.parts[that.activePart].thumb.classList.remove('_active');
			that.parts[that.activePart].thumbShape.classList.remove('_active');
		});
	}

	setPosition(e, that) {
		let ap = that.parts[that.activePart];
		if (e) {
			ap.position.comp = ap.result.value.slice(0);
			if (ap.position.comp < that.track.start) ap.position.comp = that.track.start;
			if (ap.position.comp > that.track.end) ap.position.comp = that.track.end;
			if (that.parts.length > 1) { 
				if (that.activePart === 0 && ap.position.comp >= that.parts[1].position.comp) {
					ap.position.comp = that.parts[1].position.comp;
				}
				if (that.activePart === 1 && ap.position.comp <= that.parts[0].position.comp) {
					ap.position.comp = that.parts[0].position.comp;
				}
			}
		}
		else ap.position.comp = that.thumbOptions[that.activePart];
		ap.position.rel = Math.round((ap.position.comp - that.track.start) / ap.position.unit);
		ap.position.abs = ap.position.rel + that.track.indent;
		that.moveThumb(that);
	}

	setMousePosition(e, that) {
		let ap = that.parts[that.activePart];
		ap.position.abs = e.pageX;
		if (e.pageX < that.track.coordMin)
			ap.position.abs = that.track.coordMin;
		if (e.pageX > that.track.coordMax)
			ap.position.abs = that.track.coordMax;
		if (that.parts.length > 1) { 
			if (that.activePart === 0 && e.pageX >= that.parts[1].position.abs) {
				ap.position.abs = that.parts[1].position.abs;// - 1;
			}
			if (that.activePart === 1 && e.pageX <= that.parts[0].position.abs) {
				ap.position.abs = that.parts[0].position.abs;// + 1;
			}
		}
		ap.position.rel = ap.position.abs - that.track.indent;
		ap.position.comp = that.track.start + ap.position.rel * ap.position.unit;
		that.moveThumb(that);
	}

	setActivePart(e, that) {
		if (that.parts.length > 1) {
			let distance = [e.pageX - that.parts[0].position.abs, e.pageX - that.parts[1].position.abs];
			if (Math.abs(distance[0]) < Math.abs(distance[1])) that.activePart = 0;
			if (Math.abs(distance[0]) > Math.abs(distance[1])) that.activePart = 1;
			if (Math.abs(distance[0]) == Math.abs(distance[1])) {
				if (distance[0] < 0) that.activePart = 0;
				else that.activePart = 1;
			}
		}
		else that.activePart = 0;
	}

	moveThumb(that) {
		let ap = that.parts[that.activePart];
		ap.thumb.style.left = ap.position.rel + 'px';
		if (ap.trackPart_reverse == false)
			ap.trackPart.style.width = ap.position.rel + 'px';
		else
			ap.trackPart.style.width = that.track.width - ap.position.rel + 'px';
		this.setResult(that);
	}

	setResult(that) {
		let ap = that.parts[that.activePart],
			result = Math.round(ap.position.comp);
		if (ap.result) {
			if (ap.result.tagName == 'INPUT' && !that.valueInput)
				ap.result.value = result;
			else ap.result.innerHTML = result;
		}
		if (ap.bubble) ap.bubble.innerHTML = result;
		
		// Form values
		let formValue = result;
		if (that.parts.length > 1) {
			formValue = Math.round(that.parts[0].position.comp) + ', ' + Math.round(that.parts[1].position.comp);
		}
		that.elem.setAttribute('value', formValue);
	}
}