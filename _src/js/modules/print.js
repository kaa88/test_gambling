/* 
	Params {obj}:
	- qrCodeSize - width and height (square) in 'px' (default = 150)
*/
async function setPrintAddressAndQRcode(params = {}) {
	let qrElemClassName = '.header-level__print-address-qr'
	let addressElemClassName = '.header-level__print-address'


	let href = window.location.href;
	let addressEl = document.body.querySelector(addressElemClassName);
	if (addressEl && addressEl.innerHTML == '') {
		let addressShort = href.replace(/http:\/\/|https:\/\//, '').replace(/\/$/, '');
		addressEl.innerHTML = addressShort;
	}

	let qrCodeSize = typeof params.qrCodeSize == 'number' ? params.qrCodeSize : 150;
	if (qrCodeSize < 50) qrCodeSize = 0;
	if (qrCodeSize > 300) qrCodeSize = 300;
	let qrCodeEl = document.body.querySelector(qrElemClassName);
	if (qrCodeSize && qrCodeEl && qrCodeEl.innerHTML == '') {
		let codeStr = `<img src="https://chart.googleapis.com/chart?cht=qr&chs=${qrCodeSize}x${qrCodeSize}&choe=UTF-8&chld=H|0&chl=${href}" alt="" loading="lazy">`;
		qrCodeEl.innerHTML = codeStr;
	}
}