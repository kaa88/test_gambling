/* 
	Non-internet Swiper script.
	Only for developers use! Make sure to delete this script from final version.

	It makes basic Swiper functions (sliding) work. Also a default styles will be set, so the UI will not crush (basically).
	It allows you to continue working if internet connection is lost (nice, yeah!).

	Supported settings:
	- breakpoints
	- direction ('vertical')
	- slidesPerView (including 'auto')
	- spaceBetween
	- slidesOffsetBefore, slidesOffsetAfter
*/

console.log('[swipers] WARN! "Swiper no-internet" script is included')

this.noInternetStylesInit = function(e, slider) {
	if (e) slider = this
	function ifVertical(isTrue, isFalse = '') {
		return slider.directionVertical ? isTrue : isFalse
	}
	let
		$ = slider.selector,
		sb = slider.spaceBetween,
		sob = slider.slidesOffsetBefore,
		soa = slider.slidesOffsetAfter,
		spv = slider.slidesPerView,
		fm = slider.freeMode;

	slider.slideSize = `${100 / spv}% - ${(sob + soa) / spv}px - ${fm ? 0 : ((spv - 1) / spv * sb)}px`

	let stylesArr = [
		`${$} {
			width: 100%;
			position: relative;
			overflow: hidden;
		} `,
		`${$} .swiper-wrapper {
			position: relative;
			top: ${ifVertical(sob, 0)}px;
			left: ${ifVertical(0, sob)}px;
			display: flex;
			${ifVertical('flex-direction: column;')}
			${ifVertical('height: 100%;')}
			transition: all .5s;
		} `,
		`${$} .swiper-slide {
			margin-${ifVertical('bottom', 'right')}: ${sb}px;
			flex: 0 0 auto;
			${ifVertical('height', 'width')}: calc(${slider.slideSize});
		} `,
		`${$} .${slider.buttonsNames.prevEl}, ${$} .${slider.buttonsNames.nextEl} {
			position: absolute;
			z-index: 9;
			width: 20px;
			height: 20px;
			line-height: 20px;
			text-align: center;
			background: #333;
			color: #ddd;
			cursor: pointer;
			user-select: none;
			border: solid 1px #ddd;
		} `,
		`${$} .${slider.buttonsNames.prevEl} {
			top: 0;
			left: 0;
			${ifVertical('transform: rotate(90deg);')}
		} `,
		`${$} .${slider.buttonsNames.nextEl} {
			${ifVertical('bottom', 'top')}: 0;
			${ifVertical('left', 'right')}: 0;
			transform: rotate(${ifVertical('-90', '180')}deg);
		} `
	]

	let reserveStyles = document.createElement('style')
	reserveStyles.innerHTML = ''
	for (let part of stylesArr) {
		reserveStyles.innerHTML += part
	}
	slider.swiperEl.appendChild(reserveStyles)
}

this.noInternetOptions = function(e, slider) {
	if (e) slider = this
	
	for (let i = 0; i < slider.breakpointKeys.length; i++) {
		if (slider.breakpointKeys[i] > window.innerWidth) break;
		let bpSettings = slider.breakpoints[slider.breakpointKeys[i]]

		if (typeof bpSettings.direction != 'undefined') slider.directionVertical = bpSettings.direction === 'vertical' ? true : false
		if (typeof bpSettings.spaceBetween != 'undefined') slider.spaceBetween = bpSettings.spaceBetween
		if (typeof bpSettings.slidesOffsetBefore != 'undefined') slider.slidesOffsetBefore = bpSettings.slidesOffsetBefore
		if (typeof bpSettings.slidesOffsetAfter != 'undefined') slider.slidesOffsetAfter = bpSettings.slidesOffsetAfter
		if (typeof bpSettings.slidesPerView != 'undefined') {
			if (bpSettings.slidesPerView === 'auto') {
				slider.freeMode = true
				if (slider.directionVertical) slider.slidesPerView = Math.round(slider.swiperEl.offsetHeight / slider.slides[0].offsetHeight)
				else slider.slidesPerView = Math.round(slider.swiperEl.offsetWidth / slider.slides[0].offsetWidth)
			}
			else {
				slider.freeMode = false
				slider.slidesPerView = bpSettings.slidesPerView
			}
		}
	}
}

this.noInternetModeInit = function(sliderName, slider) {
	// Moving funtions
	let moveSlide = function(e, side) {
		let activeIndex;
		for (let i = 0; i < this.wrapperEl.children.length; i++) {
			if (this.wrapperEl.children[i].classList.contains('active-slide')) {
				if (side == 'prev' && i > 0) {
					this.wrapperEl.children[i-1].classList.add('active-slide')
					activeIndex = i - 1
				}
				if (side == 'next' && i < this.wrapperEl.children.length - this.slidesPerView) {
					this.wrapperEl.children[i+1].classList.add('active-slide')
					activeIndex = i + 1
				}
				if (activeIndex != undefined) this.wrapperEl.children[i].classList.remove('active-slide')
				break
			}
		}
		let moveValue = 'calc(-1 * (' + this.slideSize + ') * ' + activeIndex + ' - ' + this.spaceBetween * activeIndex + 'px + ' + this.slidesOffsetBefore + 'px)';
		if (this.directionVertical) this.wrapperEl.style.top = moveValue
		else this.wrapperEl.style.left = moveValue
	}
	let slidePrev = function(e) {
		this.moveSlide(e, 'prev')
	}
	let slideNext = function(e) {
		this.moveSlide(e, 'next')
	}

	// Init elements
	let swiper = document.body.querySelector(slider.selector);
	if (!swiper) return;
	let wrapper = swiper.querySelector('.swiper-wrapper');
	wrapper.children[0].classList.add('active-slide');

	let slides = wrapper.querySelectorAll('.swiper-slide');
	
	let buttons = {}
	let buttonsNames = {
		prevEl: 'swiper-reserve-btn-prev',
		nextEl: 'swiper-reserve-btn-next'
	}
	for (let btnName in buttonsNames) {
		buttons[btnName] = document.createElement('div')
		buttons[btnName].className = buttonsNames[btnName]
		buttons[btnName].innerHTML = '<'
		swiper.appendChild(buttons[btnName])
	}

	this[sliderName] = {
		selector: slider.selector,
		swiperEl: swiper,
		wrapperEl: wrapper,
		slides: slides,
		buttons: buttons,
		buttonsNames: buttonsNames,
		slidePrev: slidePrev,
		slideNext: slideNext,
		moveSlide: moveSlide,
		directionVertical: false,
		slidesOffsetBefore: 0,
		slidesOffsetAfter: 0,
		slidesPerView: 1,
		spaceBetween: 0,
		freeMode: false
	}

	buttons.prevEl.addEventListener('click', this[sliderName].slidePrev.bind(this[sliderName]))
	buttons.nextEl.addEventListener('click', this[sliderName].slideNext.bind(this[sliderName]))

	// breakpoints
	this[sliderName].breakpoints = slider.settings.breakpoints || {}
	this[sliderName].breakpoints['0'] = slider.settings
	this[sliderName].breakpointKeys = Object.keys(this[sliderName].breakpoints)
	for (let i = 0; i < this[sliderName].breakpointKeys.length; i++) {
		this[sliderName].breakpointKeys[i] = Number(this[sliderName].breakpointKeys[i])
	}
	this[sliderName].breakpointKeys.sort((a,b) => {return a - b})

	// events
	this.noInternetOptions(false, this[sliderName])
	window.addEventListener('resize', this.noInternetOptions.bind(this[sliderName]))

	this.noInternetStylesInit(false, this[sliderName])
	window.addEventListener('resize', this.noInternetStylesInit.bind(this[sliderName]))
}

if (typeof Swiper == 'undefined') {
	for(let sw in settings) {
		this.noInternetModeInit(sw, settings[sw])
	}
}