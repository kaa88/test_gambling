/*
	This module works as command transmitter between different modules. It knows what some modules may offer to do and knows how to do it. It sends this info to the others.
	Before start you have to register modules: who they are, what func they want to use, what they may offer and what props they can work with.

	The link between 2 modules consists of 4 parts:
	- executor inner func - func that executor uses inside itself
	- executor linking func - func that knows everything about executor common funcs and works with them directly
	- link wrapper func - func that contains a link to executor func and this link will be copied to caller module, also it prevents loading queue errors
	- caller inner func - func that caller uses inside itself

	To register a module create new 'this.modules.*moduleName* = {}' with possible params:
	- 'usesFuncs' (reference between caller and executor funcs through internal link wrapper func)
	- 'hasProps' (what props the modal has that 'moduleReference' can use to reach the goal)
	Below that there are a linking funcs that do some checks and call executor inner funcs directly.
	
	The names of the caller and executor funcs can be different, so their reference you have to type in 'usesFuncs'.

	In the end there is a list of 'link wrapper funcs' for use inside the 'moduleReference'. It contents links to a caller functions.
	'link wrapper func' example: { *wrapper-func-name*: function() {return this.referer.modules.*executor-name*.*executor-func-name*(this.caller)} }

	On 'init' 'moduleReference' puts required params inside registered modules in 'away' object, so the calling module may call something like 'this.away.closeMenu()'. But it will work only if the name 'closeMenu' is registered in 'usesFuncs'. Make sure that caller's 'this' is equal to caller's 'away' object.

	In the end of 'init' there is a module load queue. It runs some module absence checks and sends wrapper links to a caller, so put registered modules there too.
	It also runs 'module.init()' func in case that 'moduleReference' executes after 'DOMContentLoaded' event. Make sure to turn off the default 'module.init()'.

	Quick overview for other modules:
	- module has to be registered in 'moduleReference'
	- turn off 'module.init()' func and put it inside 'moduleReference' load queue
	- use calls like 'this.away.closeMenu()'
	- make sure that 'this' has to be equal to 'away' object

	Note: 'moduleReference' might not work if you call something from on-function or 'jsMediaQueries' breakpoint. If it so, put your own module-check if-statement there.
*/
const moduleReference = {
	selfName: 'moduleReference',
	refererParamAway: 'away',
	refererParamCaller: 'caller',
	refererParamName: 'callerName',
	moduleInitParam: 'initiated',
	modules: {},

	registerModules: function() {
		let root = this;

		this.modules.mobileBreakpoint = {
			usesFuncs: {},
			hasProps: {},
			getValue: function() {
				if (this.module) return this.module
				else return 0
			}
		}

		this.modules.jsMediaQueries = {
			usesFuncs: {
				getMobileBreakpoint: root.getMobileBreakpointValue
			},
			hasProps: {}
		}

		this.modules.transitionLock = {
			usesFuncs: {},
			hasProps: {},
			getLockedState: function(caller) {
				if (this.module) return this.module.check(root.getCallerParam(caller, 'timeout'))
				else return false
			}
		}

		this.modules.scrollLock = {
			usesFuncs: {
				getMobileBreakpoint: root.getMobileBreakpointValue
			},
			hasProps: {},
			lock: function() {
				if (this.module) this.module.lock()
			},
			unlock: function(caller) {
				if (this.module) this.module.unlock(root.getCallerParam(caller, 'timeout'))
			}
		}

		this.modules.header = {
			usesFuncs: {
				getMobileBreakpoint: root.getMobileBreakpointValue,
				lockScroll: root.lockWindowScroll,
				unlockScroll: root.unlockWindowScroll,
				transitionIsLocked: root.getTransitionLockedState,
				closeOtherModules: root.closeModal,
			},
			hasProps: {
				timeout: 'timeout'
			},
			closeMenu: function(skipLock) {
				if (this.module) this.module.menu.toggle(false, root.getCorrectSkipLock(skipLock))
			},
			shareHeader: function() {
				if (this.module) this.module.shareHeader()
			},
			unshareHeader: function(caller) {
				if (this.module) this.module.unshareHeader(root.getCallerParam(caller, 'timeout'))
			}
		}

		this.modules.modal = {
			usesFuncs: {
				lockScroll: root.lockWindowScroll,
				unlockScroll: root.unlockWindowScroll,
				transitionIsLocked: root.getTransitionLockedState,
				closeOtherModules: root.closeHeaderMenu,
				shareHeader: root.shareHeader,
				unshareHeader: root.unshareHeader,
			},
			hasProps: {
				timeout: 'timeout'
			},
			open: function(modalName, skipLock) {
				if (this.module) this.module.open(modalName, root.getCorrectSkipLock(skipLock))
			},
			close: function(skipLock) {
				if (this.module) this.module.close(root.getCorrectSkipLock(skipLock))
			}
		}
	},
	// Link wrapper funcs
	// It is important to have them to prevent loading queue errors when 2 modules are linked to each other both sides
	getMobileBreakpointValue: function() {return this.referer.modules.mobileBreakpoint.getValue()},
	getTransitionLockedState: function() {return this.referer.modules.transitionLock.getLockedState(this.caller)},
	lockWindowScroll: function() {this.referer.modules.scrollLock.lock()},
	unlockWindowScroll: function() {this.referer.modules.scrollLock.unlock(this.caller)},
	closeHeaderMenu: function(skipLock) {this.referer.modules.header.closeMenu(skipLock)},
	shareHeader: function() {this.referer.modules.header.shareHeader()},
	unshareHeader: function() {this.referer.modules.header.unshareHeader(this.caller)},
	openModal: function(modalName, skipLock) {this.referer.modules.modal.open(modalName, skipLock)},
	closeModal: function(skipLock) {this.referer.modules.modal.close(skipLock)},

	init: async function() {
		this.registerModules()
		this.modulesRegistered = Object.keys(this.modules).length;
		this.modulesInitiated = 0

		// Modules load queue
		this.initModule(typeof mobileBreakpoint != 'undefined' ? mobileBreakpoint : null, 'mobileBreakpoint')
		this.initModule(typeof jsMediaQueries != 'undefined' ? jsMediaQueries : null, 'jsMediaQueries')
		this.initModule(typeof scrollLock != 'undefined' ? scrollLock : null, 'scrollLock')
		this.initModule(typeof transitionLock != 'undefined' ? transitionLock : null, 'transitionLock')
		this.initModule(typeof header != 'undefined' ? header : null, 'header')
		this.initModule(typeof modal != 'undefined' ? modal : null, 'modal')
		// console.log(header)

		if (this.modulesRegistered != this.modulesInitiated) console.log(`[${this.selfName}] WARN! "initiated modules" (${this.modulesInitiated}) not equal to "registered modules" (${this.modulesRegistered}). Please check your code`)
	},
	initModule: function(mod, name) {
		this.modulesInitiated++;
		if (!name) return console.log(`[${this.selfName}] ERR! Missing "name" param in "initModule" function`)
		this.modules[name].module = mod // module || null
		if (!mod) return console.log(`[${this.selfName}] ERR! "${name}" module not found`)

		if (!this.modules[name].usesFuncs) this.modules[name].usesFuncs = {};
		if (!this.modules[name].hasProps) this.modules[name].hasProps = {};
		if (typeof mod == 'object') {
			mod[this.refererParamAway] = this.modules[name].usesFuncs;
			mod[this.refererParamAway][this.refererParamCaller] = mod;
			mod[this.refererParamAway][this.refererParamName] = name;
			mod[this.refererParamAway].referer = this;
			if (mod.init) {
				if (mod[this.moduleInitParam] || typeof mod[this.moduleInitParam] == 'undefined') console.log(`[${this.selfName}] WARN! "${name}" module can be already initiated. Please check your code for double initiation`)
				mod.init()
			}
		}
	},
	getCallerParam: function(caller, param) {
		if (caller[this.refererParamAway][this.refererParamName])
			return caller[this.modules[caller[this.refererParamAway][this.refererParamName]].hasProps[param]]
		else {
			console.log(`[${this.selfName}] ERR! Calling module does not have a required param "${this.refererParamName}". Caller:`)
			console.log(caller)
			return false
		}
	},
	getCorrectSkipLock: function(x) {
		if (typeof x != 'boolean' && x !== 'true') return false
		else return x
	}
}