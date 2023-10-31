/*
	This module works with forms. It checks all the fields, then sends a 'formData' to php script and cleans up the form.
	It also contains 'checkbox' and 'phone mask' handlers.
	Checkbox handler makes the 'required-check' possible.

	This module doesnt use 'moduleReference' because form have to know how to work with its fields (I think).
	The only function that needs to be up to date in this case is 'cleanForm'. It contains hardcoded commands to clean the fields.

	Init params {obj}:
	- demo - demo mode: all checks and response messages, but form will not be sent (default = false)
	- testMode - console.log formData entries (default = false)
	- onSend, onError - event function(formElem)
	- phoneMask - phone mask string (default = '_'*10), symbol '_' is a digit placeholder, other symbols except digits will be shown as a filler. Mask example: '(___) ___-__-__'
	- showPhoneMask - shows mask inside the input while typing (default = false)

	Useable classes:
	- 'required' - put it in html tag to make it required to fill
	- 'required-one' - if several inputs are marked with this class, it is required to fill only one of them
	- 'form--ok' - css class for styling report message on ok
	- 'form--error' - css class for styling form inputs and report message on error
	- 'form--sending' - css class for styling form while send is in progress

	Usable methods:
	- formSend.cleanForm('form') - params: string 'form' - form selector (default = none)

	Form messages:
	- there is a multi-report message support
	- you can place 1 main report and/or (or only) several minor reports for each input
	- use html attr 'for' with a value of 'name' of the linked field (e.g. for="email")
*/
const formSend = {
	selfName: 'formSend',
	names: {
		// selectors:
		form: 'form',
		report: '.form__report',
		input: 'input',
		textarea: 'textarea',
		select: 'select',
		checkbox: 'input[type="checkbox"]',
		// state class names:
		required: 'required',
		requiredOne: 'required-one',
		statusOk: 'form--ok',
		statusError: 'form--error',
		stateSending: 'form--sending',
		// path:
		phpHandlerPath: 'php/sendmail.php',
	},
	messages: {
		noForms: `ERR! No forms detected`,
		sendOk: 'Your message has been sent',
		sendOkDemo: 'Your message has been sent (demo)',
		sendError: 'Error when sending a message',
		emptyReqField: 'Required field',
		oneReportEmptyReqField: 'Fill in the required fields, please',
		oneReportEmptyReqOneOfFields: 'Fill in one of the required fields, please',
		incorrectFields: 'Incorrect fields',
		incorrectName: 'Incorrect name',
		incorrectPhone: 'Incorrect phone number',
		incorrectEmail: 'Incorrect email',
		formEntriesStart: `Form entries:`,
		formEntriesEnd: `/ end of entries`,
	},
	params: {},
	initiated: false,
	init: async function(params) {
		if (document.forms.length == 0) return console.log(`[${this.selfName}] ${this.messages.noForms}`)
		if (params) this.params = params

		// Events
		for (let form of document.forms) {
			form.addEventListener('submit', this.send.bind(this))
		}
		let inputs = document.body.querySelectorAll(`${this.names.form} ${this.names.input}, ${this.names.form} ${this.names.textarea}`) //'form input, form textarea'
		for (let input of inputs) {
			input.addEventListener('input', this.removeFieldError.bind(this))
			if (input.getAttribute('name') == 'phone') {
				input.addEventListener("focus", this.editPhoneByMask.bind(this))
				input.addEventListener("blur", this.editPhoneByMask.bind(this))
				input.addEventListener("keydown", this.editPhoneByMask.bind(this))
				input.addEventListener("paste", this.editPhoneByMask.bind(this))
				input.addEventListener("input", this.editPhoneByMask.bind(this))
			}
		}
		let selects = document.body.querySelectorAll(`${this.names.form} ${this.names.select}`) //'form select'
		for (let select of selects) {
			select.addEventListener('change', this.removeFieldError.bind(this)) // this event dispatches from 'select' module
		}
		// /

		// on-functions
		this.onSend = this.params.onSend || function(){}
		this.onError = this.params.onError || function(){}
		// /

		// Checkbox correct values for 'required-check' and FormData
		let checkboxes = document.body.querySelectorAll(`${this.names.form} ${this.names.checkbox}`) // 'form input[type="checkbox"]'
		for (let chb of checkboxes) {
			chb.addEventListener('input', this.setCheckboxValue)
			this.setCheckboxValue(false, chb)
		}
		// /
		this.initiated = true
	},

	cleanForm: function(form, cleanReport = true) {
		if (!this.initiated || !form) return;
		if (typeof form == 'string') form = document.body.querySelector(form)
		if (cleanReport) {
			// simple cleaning, not using funcs
			let reports = form.querySelectorAll(this.names.report)
			for (let r of reports) {
				r.classList.remove(this.names.statusOk, this.names.statusError)
				r.innerHTML = ''
			}
		}
		let inputs = form.querySelectorAll(`${this.names.input}, ${this.names.textarea}`) // 'input, textarea'
		for (let input of inputs) {
			if (input.hasAttribute('name')) {
				switch(input.type) {
					case 'checkbox':
						this.setCheckboxValue(false, input);
						break;
					case 'file':
						input.value = '';
						input.dispatchEvent(new Event('change')) // to clean preview
						break;
					case 'radio':
						input.parentElement.querySelector(this.names.input).checked = true; // 1st
						break;
					case 'range':
						input.value = 50;
						input.dispatchEvent(new Event('change')) // for 'input-range-colored'
						break;
					case 'submit':
						break;
					default:
						input.value = '';
					// (no need to clean 'input-range-double', хотя можно заморочиться и переписать его модуль)
				}
			}
			input.classList.remove(this.names.statusError)
		}
		// I dont search select by name-attr because name can be changed
		let selects = form.querySelectorAll(this.names.select)
		for (let s of selects) {
			s.children[0].setAttribute('selected', 'true')
			s.dispatchEvent(new Event('change'))
			s.classList.remove(this.names.statusError)
		}
	},

	send: async function(e) {
		if (!this.initiated || !e) return;
		e.preventDefault()
		this.form = e.target // set this.form until send is errored or finished
		let fieldsCheckError = this.checkFields()
		if (fieldsCheckError) {
			this.generateMessage(fieldsCheckError)
			return this.form = null
		}
		else this.removeFieldError()

		let formData = new FormData(this.form)
		formData.append('form', this.form.getAttribute('name'))

		// Add elems that ignored by new FormData
		this.addElemToFormData(formData, '.input-range-double')
		// /

		if (this.params.testMode) this.log(formData) // console log entries to check the correctness

		this.form.classList.add(this.names.stateSending)

		let response;
		if (this.params.demo) { // demo mode
			response = await new Promise(function(resolve) {
				setTimeout(() => resolve(), 2000)
			})
			response = {ok: true}
		} else {
			response = await fetch(this.names.phpHandlerPath, {
				method: 'POST',
				body: formData
			})
		}
		this.form.classList.remove(this.names.stateSending)

		if (response.ok) {
			this.generateMessage('send-ok')
			this.cleanForm(this.form, false)
			this.onSend(this.form)
		} else {
			this.generateMessage('send-error')
			this.onError(this.form)
		}
		this.form = null
	},

	addElemToFormData: function(fdata, selector) {
		// this func adds fields that ignored by FormData handler, e.g. custom inputs that consist of 'divs'
		let elems = this.form.querySelectorAll(selector)
		for (let elem of elems) {
			fdata.append(elem.getAttribute('name'), elem.getAttribute('value'))
		}
	},

	setCheckboxValue: function(e, elem = this) {
		// this func provides correct checking if checkbox has class 'required'
		if (!e) elem.checked = elem.dataset.defaultChecked === 'true' ? true : false // '!e' here means 'reset value'
		elem.setAttribute('value', elem.checked ? elem.checked : '')
	},

	removeFieldError: function(e, field) { // called by: input-event, check-func, send-func
		// 'e' comes from input event; 'field' comes from check-func; send-func cleans main report only
		if (!field && e) field = e.currentTarget
		if (field) field.classList.remove(this.names.statusError)

		let reportElems = this.getReportElems(e)
		let fieldReport = field ? reportElems[field.getAttribute('name')] : null
		if (fieldReport) {
			fieldReport.classList.remove(this.names.statusOk, this.names.statusError)
			fieldReport.innerHTML = ''
		}
		if (!e) { // reject the cleaning of main report on input, it cleans on every field check
			let mainReport = reportElems.main
			if (mainReport) {
				mainReport.classList.remove(this.names.statusOk, this.names.statusError)
				mainReport.innerHTML = ''
			}
		}
	},

	addFieldError: function(field) {
		// this func does not add error class to 'main' report, 'generateMessage' does
		if (!field) return;
		field.classList.add(this.names.statusError)
		let reportElems = this.getReportElems()
		let fieldReport = reportElems[field.getAttribute('name')]
		if (fieldReport) fieldReport.classList.add(this.names.statusError)
	},

	getReportElems: function(e) {
		// here is some kind of cache functionality because many checks run at a time and use this func
		// 'this.reports' will be deleted after timeout end to avoid errors with other forms
		if (!this.reports) {
			let form = this.form || e.target.closest('form')
			let reportElems = form.querySelectorAll(this.names.report)
			this.reports = {}
			setTimeout(function(){ this.reports = null }.bind(this), 200)
			for (let report of reportElems) {
				if (report.hasAttribute('for')) this.reports[report.getAttribute('for')] = report
				else this.reports['main'] = report
			}
		}
		return this.reports
	},

	generateMessage: function(msg) { // 'msg' is a string or object
		// mainly, this func should only add a message to report elem, but it also adds an ok/error class to the 'main' report because I dont know a better place to set it up... may be I'll solve it later
		let reports = this.getReportElems()
		if (!msg || Object.keys(reports).length == 0) return;
		let oneReport = Object.keys(reports).length == 1 ? true : false

		if (reports.main) {
			if (msg === 'send-ok') {
				reports.main.innerHTML = this.params.demo ? this.messages.sendOkDemo : this.messages.sendOk
				reports.main.classList.add(this.names.statusOk)
			}
			if (msg === 'send-error') {
				reports.main.innerHTML = this.messages.sendError
				reports.main.classList.add(this.names.statusError)
			}
		}

		if (typeof msg == 'object') {
			let errors = msg, fieldErrorCount = 0, tempMsg = '';

			for (let report in reports) {
				// if (!reports.main) // uncomment if you dont want to show req-messages in minor reports
					if (reports[report].classList.contains(this.names.statusError)) reports[report].innerHTML = this.messages.emptyReqField
			}

			if (errors.name) {
				fieldErrorCount++;
				tempMsg = this.messages.incorrectName
				if (reports.name) reports.name.innerHTML = tempMsg
			}
			if (errors.email) {
				fieldErrorCount++;
				tempMsg = this.messages.incorrectEmail
				if (reports.email) reports.email.innerHTML = tempMsg
			}
			if (errors.phone) {
				fieldErrorCount++;
				tempMsg = this.messages.incorrectPhone
				if (reports.phone) reports.phone.innerHTML = tempMsg
			}
			
			if (reports.main) {
				// here is the next msg has greater priority than prev
				if (oneReport) {
					if (fieldErrorCount == 1) reports.main.innerHTML = tempMsg
					else reports.main.innerHTML = this.messages.incorrectFields
				}
				if (errors.reqOne) reports.main.innerHTML = this.messages.oneReportEmptyReqOneOfFields
				if (errors.req) reports.main.innerHTML = this.messages.oneReportEmptyReqField
				if (reports.main.innerHTML != '') reports.main.classList.add(this.names.statusError)
			}
		}
	},

	checkFormat: function(item) {
		if (!item.value) return false
		let isOk = true
		switch (item.getAttribute('name')) {
			case 'name':
				isOk = /^.{2,99}$/.test(item.value)
				break;
			case 'email':
				isOk = /^.{2,99}@.{2,99}\..{2,20}$/.test(item.value)
				break;
			case 'phone':
				// isOk = /^\+\d\s\(\d{3}\)\s\d{3}(-\d\d){2}$/.test(item.value)
				if (item.value.length != this.params.phoneMask.length || item.value.match(/_/)) isOk = false
				break;
		}
		if (!isOk) {
			this.addFieldError(item)
			return true
		} else return false
	},

	checkFields: function() {
		// returns an object with keys = input 'name'-attr and values = true or false if error
		let errors = {}
		let fields = this.form.querySelectorAll(`${this.names.input}, ${this.names.textarea}, ${this.names.select}`) // 'input, textarea, select'
		for (let item of fields) {
			this.removeFieldError(false, item)
			if (item.classList.contains(this.names.required) && item.value == '') {
				this.addFieldError(item)
				errors.req = true
				continue
			}
			errors[item.getAttribute('name')] = this.checkFormat(item)
		}

		// this script for group of elems that has at least one requered elem
		let inputsReqOne = this.form.querySelectorAll('.' + this.names.requiredOne)
		let reqOneFilled = []
		for (let i = 0; i < inputsReqOne.length; i++) {
			if (inputsReqOne[i].value != '') reqOneFilled.push(i)
		}
		if (inputsReqOne.length > 0 && reqOneFilled.length == 0) {
			for (let input of inputsReqOne) {
				this.addFieldError(input)
			}
			errors.reqOne = true
		}
		// /

		for (let er in errors) {
			if (errors[er]) return errors
		}
		return false
	},

	log: function(formData) {
		console.log(this.messages.formEntriesStart)
		for (let pair of formData.entries()) {
			console.log('\t' + pair[0] + ': ' + pair[1])
		}
		console.log(this.messages.formEntriesEnd)
	},

	editPhoneByMask: function(e) {
		// To provide better UX I decided to pay attention to cursor controlling in different situations, so here is the code to get proper cursor position
		if (!e) return;
		// these 2 funcs search for next digit position and check if cursor goes across the border
		// param 'posOffset' is for cursor arrow-moving, because in this case I need to scan 2 symbols
		function getCursorNextPosToRight(value, posOffset = 0) {
			if (input.selectionStart >= value.length) return value.length
			if (input.selectionStart < cursorMinPos) return cursorMinPos
			for (let i = input.selectionStart; i < value.length; i++) {
				if (value[i+posOffset]) {
					if (value[i+posOffset].match(/_/)) return value.indexOf('_')
					if (value[i+posOffset].match(/\d/)) return i + posOffset
				} else if (value[i].match(/_/)) return i
			}
			return value.length // for arrow-moving
		}
		function getCursorNextPosToLeft(value, posOffset = 0) {
			if (input.selectionStart - posOffset <= cursorMinPos) return cursorMinPos
			for (let i = input.selectionStart - 1; i >= 0; i--) {
				if (value[i] && value[i].match(/\d/)) return i + 1 - posOffset
			}
		}
		function getLastDigitIndex(value) {
			if (!value) return 0
			for (let i = value.length - 1; i >= 0; i--) {
				if (value[i].match(/\d/)) return i
			}
		}
		function buildValue(value) {
			// this func gets current input value, cleans NaN-garbage, splits mask with new digit-string and cuts off unfilled placeholders
			value = value.replace(/\D/g, '')
			if (value == '') value = mask.replace(/\D/g, '')
			let dIndex = 0
			let newValue = mask.replace(/[_\d]/g, function() {
				return value[dIndex++] || '_'
			})
			if (!alwaysShowMask) {
				let _Index = newValue.indexOf('_')
				let cutValue = newValue.substring(0, _Index == -1 ? undefined : _Index)
				if (cutValue.length < cursorMinPos) cutValue = mask.substring(0, cursorMinPos)
				return cutValue
			}
			return newValue
		}
		let
			input = e.target,
			alwaysShowMask = this.params.showPhoneMask || false,
			mask = this.params.phoneMask || '__________',
			cursorMinPos = mask.indexOf('_'),
			lastDigitPos = getLastDigitIndex(input.value);

		if (lastDigitPos < cursorMinPos) lastDigitPos = cursorMinPos

		if (e.type == 'focus') {
			let cursorPos = lastDigitPos
			if (input.value.length <= cursorMinPos) {
				input.value = alwaysShowMask ? mask : mask.substring(0, cursorMinPos)
			}
			else cursorPos++
			setTimeout(() => {
				if (input.selectionStart > cursorPos) {
					input.selectionStart = input.selectionEnd = cursorPos
					input.selectionStart = input.selectionEnd = getCursorNextPosToRight(input.value)
				}
				if (input.selectionStart <= cursorMinPos) input.selectionStart = input.selectionEnd = cursorMinPos
			}, 10)
		}

		if (e.type == 'blur') {
			if (alwaysShowMask) {
				if (buildValue(input.value) == mask) input.value = ''
			}
			else if (input.value.length <= cursorMinPos) input.value = ''
		}

		if (e.type == 'keydown') {
			if (e.key.match(/\d/)) {
				if (input.selectionStart <= cursorMinPos) input.selectionStart = cursorMinPos // this line works when typing after selection was made
				if (input.selectionStart > lastDigitPos) input.selectionStart = input.selectionEnd = lastDigitPos + 1
				input.selectionStart = getCursorNextPosToRight(input.value)
			}
			if (e.key == 'ArrowLeft') {
				e.preventDefault()
				input.selectionStart = input.selectionEnd = getCursorNextPosToLeft(input.value, 1)
			}
			if (e.key == 'ArrowRight') {
				e.preventDefault()
				input.selectionStart = input.selectionEnd = getCursorNextPosToRight(input.value, 1)
			}
			if (e.key == 'Delete') input.selectionStart = getCursorNextPosToRight(input.value)
			if (e.key == 'Backspace') {
				let pos = getCursorNextPosToLeft(input.value)
				if (input.selectionStart == input.selectionEnd) input.selectionStart = input.selectionEnd = pos
				else input.selectionStart = pos
			}
			this.prevAction = e.key // for the following 'input' event
		}

		if (e.type == 'paste') {
			if (input.selectionStart < cursorMinPos) input.selectionStart = cursorMinPos
			this.prevAction = e.type // for the following 'input' event
		}

		if (e.type == 'input') {
			let cursorPos = input.selectionStart, newValue = buildValue(input.value)
			if (this.prevAction == 'Backspace' && cursorPos <= cursorMinPos) cursorPos = cursorMinPos
			if (this.prevAction == 'Delete' || this.prevAction.match(/\d/)) cursorPos = getCursorNextPosToRight(newValue)
			if (this.prevAction == 'paste') cursorPos = newValue.length
			else if (this.prevAction.length < 2 && !this.prevAction.match(/\d/)) cursorPos-- // this is the way to allow digits only (as long as 'buildValue' cleans NaN-symbols, I need just return prev cursor position)... also with this solution it doesnt have conflicts with 'paste'

			input.value = newValue
			input.selectionStart = input.selectionEnd = cursorPos
			this.prevAction = null
		}
	},
}