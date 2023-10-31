const developer_panel = {
	init: async function() {
		aspectRatioCalculator.init();
	}
	// сделать, чтобы она была раскрывающаяся, может быть совмещенная с lite-build, а еще чтобы можно было встроить в чужой код
	// перенести сюда aspectRatioCalculator, сделать общий бокс
	// добавить вывод текущего body font size
	// добавить отслеживание переменной
	// возможно еще:
	// кнопки навигации, которые листают сразу все свайперы
	// координаты мыши
	// кнопка, которая включает подсветку эл-тов, которые создают гориз прокрутку
	// размер скроллбара
	// кнопка, которая преобразует svg clippath в обычный svg и выводит на экран для проверки
}


// Aspect ratio (developer use only)
const aspectRatioCalculator = {
	init: function() {
		let newBox = document.createElement('div');
		document.body.appendChild(newBox);
		newBox.id = 'aspect-ratio-calculator';
		let style = '#aspect-ratio-calculator {position: fixed; top: 0; left: 0; z-index: 9999; display: flex; justify-content: center; align-items: center; padding: 15px 30px; background-color: yellow;} #aspect-ratio-calculator span {font-size: 3vmin; font-family: Arial;}'
		newBox.innerHTML = '<span></span><style>' + style + '</style>';
		this.box = newBox.children[0];
		this.calc();
		window.addEventListener('resize', this.calc.bind(this));
	},
	calc: function() {
		// function gcd (a, b) {return (b == 0) ? a : gcd (b, a%b);} // функция вычисляет минимальный общий делитель для ширины и высоты, потом надо поделить стороны на него и получить соотношение сторон
		// а у меня проще: всегда беру высоту за 9 и подгоняю ширину через коэффициент
		let
			w = window.innerWidth,
			h = window.innerHeight,
			wh = Math.round(w / h * 100) / 100,
			hx = 9,
			wx = Math.round(hx * wh);
			
		if (wx == 9) {wx = 1; hx = 1;}
		if (wx == 12) {wx = 4; hx = 3;}
		if (wx == 15) {wx = 5; hx = 3;}
		this.box.innerHTML = 'aspect ratio: ' + wh + ' = ' + wx + ' / ' + hx;
	},
}

//////////////////////////////////////////////////

// Body 'em' checker
// window.addEventListener('resize', bodyEmCheck);
// function bodyEmCheck() {
// 	console.log('Body "em" checker. Current font-size: ' + getComputedStyle(document.body).fontSize);
// }
// bodyEmCheck();
