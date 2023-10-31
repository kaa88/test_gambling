/*
	The idea is to get 'active' and 'total' numbers from backend and create
	pagination in browser.

	Init params {obj}:
	- elem - element selector (default = '.pagination')
	- maxLength - max number of items (default = 99)

	To do: pagination types (bullets...)
*/
class Pagination {
	constructor(params = {}) {
		let names = {
			pagination: 'pagination',
			item: 'pagination__item',
			activeClass: '_active',
			inactiveClass: '_inactive',
			inactiveFill: '...',
			hrefFill: 'index.html?page=',
		}
		this.pagiElem = document.querySelector(params.elem || '.' + names.pagination);
		if (!this.pagiElem) return;

		this.maxLength = params.maxLength || 99;

		this.activeItem = Number(this.pagiElem.dataset.active);
		this.totalItems = Number(this.pagiElem.dataset.total);
		let pagiSize = Math.min(this.totalItems, this.maxLength);
		let beforeActive = Math.floor((pagiSize - 5) / 2);
		let posToEnd = this.totalItems - (pagiSize - 2);

		let numbers = [];
		for (let i = 1; i <= this.totalItems; i++) {
			if (i <= 2) numbers.push(i);
			else if (i >= this.activeItem - beforeActive || i > posToEnd) numbers.push(i);
			if (numbers.length == pagiSize) break;
		}
		numbers[pagiSize-1] = this.totalItems;
		numbers[pagiSize-2] = this.totalItems - 1;

		if (numbers[2] - numbers[1] > 1) numbers[1] = names.inactiveFill;
		if (numbers[pagiSize-2] - numbers[pagiSize-3] > 1) numbers[pagiSize-2] = names.inactiveFill;

		for (let i = 0; i < pagiSize; i++) {
			let newItem = document.createElement('a');
			newItem.className = names.item;
			this.pagiElem.appendChild(newItem);
			newItem.innerHTML = numbers[i];
			if (numbers[i] == this.activeItem) newItem.classList.add(names.activeClass);
			if (numbers[i] == names.inactiveFill) {
				newItem.classList.add(names.inactiveClass);
				newItem.href = '#';
			}
			else newItem.href = names.hrefFill + numbers[i];
		}
	}
}