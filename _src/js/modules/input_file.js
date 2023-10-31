/* 
	This module includes styled input-file, preview, file info message and cleaning function.
	There is a default checks for file format and size.

	Init params: none
*/
const inputFile = {
	names: {
		elem: '.input-file',
		input: 'input[type="file"]',
		info: '.input-file__info',
		preview: '.input-file__preview-img',
		cleanButton: '.input-file__preview-clean-btn',
	},
	messages: {
		fileWrongFormat: 'Unsupported file format',
		fileWrongSize: 'File is too large, choose file less than ',
	},

	init: async function() {
		let inputs = document.body.querySelectorAll(this.names.input)
		for (let inp of inputs) {
			inp.addEventListener('change', this.checkFile.bind(this))
		}
		let cleanButtons = document.body.querySelectorAll(this.names.cleanButton)
		for (let btn of cleanButtons) {
			btn.addEventListener('click', this.cleanFile.bind(this))
		}
	},

	checkFile: function(e) {
		if (!e) return;
		let
			elem = e.target.closest(this.names.elem),
			input = elem.querySelector(this.names.input),
			info = elem.querySelector(this.names.info),
			preview = elem.querySelector(this.names.preview)

		if (input) {
			if (input.value) {
				let file = input.files[0]
				if (info) info.innerHTML = file.name
		
				// file checks
				if (!file.type.match(/jpeg/)) {
					input.value = ''
					let msg = this.messages.fileWrongFormat
					if (info) info.innerHTML = msg
					else console.log(msg)
					return
				}
				let fileSize = 2 // MB
				if (file.size > 1024000 * fileSize) {
					input.value = ''
					let msg = `${this.messages.fileWrongSize} ${fileSize} MB`
					if (info) info.innerHTML = msg
					else console.log(msg)
					return
				}
		
				// making a preview
				if (preview) {
					let reader = new FileReader()
					reader.readAsDataURL(file)
					reader.onload = function(e) {
						preview.src = e.target.result
					}
				}
			}
			else {
				input.value = ''
				if (preview) preview.src = ''
				if (info) info.innerHTML = info.dataset.default || ''
			}
		}
	},
	
	cleanFile: function(e) {
		let input = e.target.closest(this.names.elem).querySelector(this.names.input)
		if (input) {
			input.value = ''
			this.checkFile(e)
		}
	}
}