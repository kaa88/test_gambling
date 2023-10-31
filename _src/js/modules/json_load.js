/* 
	Module loads data from .json file & returns a Promise.
	Example:
		jsonLoad('news.json').then((result) => console.log(result))

	Init params:
	1) file path (example: 'data/news.json')
*/
// To do: добавить построение html кода из json файла (как initVirtual в teveres)
async function jsonLoad(filepath) {
	if (!filepath) return;
	let response = await fetch('./' + filepath);
	if (response.ok) {
		console.log('Loaded "' + filepath + '"');
		return response.json();
	}
	else console.log('Failed to load "' + filepath + '"');
}