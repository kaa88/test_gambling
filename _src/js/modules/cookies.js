/* Example: 
	setCookie(
		{
			name: '_cookies', // required
			value: 'true', // required
			path: '/ru' // default '/'
			expires: 30, // expire time in days (can be negative to delete cookie)
			// *any other supported params*
		},
		true // log formatted cookie string in console
	);
*/

function setCookie(params = {}, log) {
	if (!params.name || !params.value) return console.log('Error: Required cookie "name" or "value" is missing.');

	let cookieArr = [];
	cookieArr.push(encodeURIComponent(params.name) + '=' +  encodeURIComponent(params.value));
	cookieArr.push('path=' + (params.path ? params.path : '/'));

	if (params.expires) {
		let d = new Date();
		d.setTime(d.getTime() + (params.expires*24*60*60*1000));
		cookieArr.push('expires=' + d.toUTCString());
	}

	let entries = Object.entries(params);
	for (let i = 0; i < entries.length; i++) {
		if (entries[i][0] == 'name' || entries[i][0] == 'value' || entries[i][0] == 'path' || entries[i][0] == 'expires') continue;
		cookieArr.push(entries[i][0] + (entries[i][1] ? ('=' + entries[i][1]) : ''));
	}

	let cookieStr = cookieArr.join('; ');
	document.cookie = cookieStr;
	if (log) console.log('Setting up cookie: ' + cookieStr);
}

function getCookie() {
	let cookiesArr = decodeURIComponent(document.cookie).split('; '),
		cookiesObj = {};
	for (let i = 0; i < cookiesArr.length; i++) {
		let split = cookiesArr[i].split('=');
		cookiesObj[split[0]] = split[1];
	}
	return cookiesObj;
}