async function preventTabbing(selectorStr = 'a, button, input, textarea') {
	if (typeof selectorStr != 'string') return;
	let noTabElements = document.body.querySelectorAll(selectorStr);
	for (let i = 0; i < noTabElements.length; i++) {
		noTabElements[i].setAttribute('tabindex','-1');
	}
}