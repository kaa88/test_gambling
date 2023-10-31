/* 
	Module checks window resizing and runs funcs on crossing the breakpoint.
	Breakpoint executes its funcs when 'width' crosses the line from both sides. Example: both resize from 800 to 700 and from 700 to 800 will execute '768' breakpoint.
	If 'width' crosses several breakpoints, all of them will be executed sequentially.

	Useful output:
	- jsMediaQueries.state
	Note: there is 1 more index than number of breakpoints (from 0px to 1st breakpoint).
	
	Init params {obj}:
	- breakpoints {obj}
	- testMode - set to 'true' to console.log the breakpoint state when it executes (default = false)
*/
const jsMediaQueries = {
	selfName: 'jsMediaQueries',
	breakpointVariableName: 'mobile',
	
	away: {getMobileBreakpoint: function(){}},
	params: {},
	initiated: false,
	init: async function(params) {
		if (params) this.params = params;
		this.breakpoints = this.params.breakpoints || null;
		if (!this.breakpoints) return;
		this.breakpoints.keys = Object.keys(this.breakpoints);
		for (let i = 0; i < this.breakpoints.keys.length; i++) {
			if (this.breakpoints.keys[i] == this.breakpointVariableName) {
				let mbp = this.away.getMobileBreakpoint();
				this.breakpoints[mbp] = this.breakpoints[this.breakpoints.keys[i]];
				this.breakpoints.keys[i] = mbp;
			}
			else {
				this.breakpoints.keys[i] = Number(this.breakpoints.keys[i]);
				if (isNaN(this.breakpoints.keys[i])) this.breakpoints.keys[i] = 0; // this provides normal keys-array sorting if param is incorrect
			}
		}
		this.breakpoints.keys.push(0);
		this.breakpoints.keys.sort((a,b) => {return a - b});
		window.addEventListener('resize', this.check.bind(this));
		this.check(false, true);
		
		this.initiated = true
	},
	check: function(e, init = false) {
		for (let i = 0; i < this.breakpoints.keys.length; i++) {
			if (window.innerWidth > this.breakpoints.keys[i]) this.state = this.breakpoints.keys[i];
			else break
		}
		if (init) this.prev_state = this.state
		else {
			if (this.state > this.prev_state) {
				for (let i = 0; i < this.breakpoints.keys.length; i++) {
					if (this.breakpoints.keys[i] > this.prev_state && this.breakpoints.keys[i] <= this.state) {
						this.breakpoints[this.breakpoints.keys[i]]()
						this.log(this.breakpoints.keys[i])
					}
				}
			}
			if (this.state < this.prev_state) {
				for (let i = this.breakpoints.keys.length-1; i >= 0 ; i--) {
					if (this.breakpoints.keys[i] <= this.prev_state && this.breakpoints.keys[i] > this.state) {
						this.breakpoints[this.breakpoints.keys[i]]()
						this.log(this.breakpoints.keys[i])
					}
				}
			}
			this.prev_state = this.state
		}
	},
	log: function(value) {
		if (this.params.testMode) console.log(`[${this.selfName}] Executed breakpoint: ${value}`)
	}
}