/*	
	Init params:
	1) volume (default = 70)

	Include "Input range colored" script if track colored progress is required.
	Example:
		iRange_seek = new InputRangeColored({
			elem: 'video-controls__seek-bar'
		});
		iRange_volume = new InputRangeColored({
			elem: 'video-controls__volume-bar'
		});
*/

// To do:
// для свайпера ввести класс "типа загружен" для тех, кто получил эвенты, и при свайпе делать проверку

const videoPlayer = {
	names: {},
	init: async function(volume = 70) {
		let n = this.names;
		n.player = '.video-player';
		n.video = 'video';
		n.controls = '.video-controls';
		n.playArea = n.controls + '__area';
		n.playAreaBtn = n.controls + '__area-btn';
		n.panel = n.controls + '__panel';
		n.playBtn = n.controls + '__play-pause';
		n.seekBar = n.controls + '__seek-bar input';
		n.volBtn = n.controls + '__volume-btn';
		n.volBar = n.controls + '__volume-bar input';

		this.volume = volume / 100;
		this.muted = false;
		this.players = document.querySelectorAll(n.player);
		if (!this.players.length) return;
		for (let i = 0; i < this.players.length; i++) {
			this.create(this.players[i]);
		}
	},

	find: function(caller, target) {
		if (target)
			return caller.closest(this.names.player).querySelector(this.names[target]);
		else
			return caller.closest(this.names.player);
	},

	// 'create' & 'destroy' funcs are useful with Swiper slides
	create: function(player) {
		if (!this.find(player)) return;

		this.find(player,'controls').addEventListener('mousemove', this.showControls.bind(this));

		this.find(player,'playArea').addEventListener("click", this.playCheck.bind(this));
		this.find(player,'playBtn').addEventListener("click", this.playCheck.bind(this));

		this.find(player,'video').addEventListener("timeupdate", this.seekBarUpdate.bind(this));
		this.find(player,'seekBar').addEventListener("mousedown", this.seekBarMousedown.bind(this));
		this.find(player,'seekBar').addEventListener("mouseup", this.seekBarMouseup.bind(this));
		this.find(player,'seekBar').addEventListener("change", this.seekBarChange.bind(this));

		this.find(player,'volBtn').addEventListener("click", this.muteCheck.bind(this));
		this.find(player,'volBar').addEventListener("input", this.setVolume.bind(this));
	},

	destroy: function(player) {
		if (!this.find(player)) return;

		this.find(player,'controls').removeEventListener('mousemove', this.showControls);

		this.find(player,'playArea').removeEventListener("click", this.playCheck);
		this.find(player,'playBtn').removeEventListener("click", this.playCheck);

		this.find(player,'video').removeEventListener("timeupdate", this.seekBarUpdate);
		this.find(player,'seekBar').removeEventListener("mousedown", this.seekBarMousedown);
		this.find(player,'seekBar').removeEventListener("mouseup", this.seekBarMouseup);
		this.find(player,'seekBar').removeEventListener("change", this.seekBarChange);

		this.find(player,'volBtn').removeEventListener("click", this.muteCheck);
		this.find(player,'volBar').removeEventListener("input", this.setVolume);
	},

	playCheck: function(e) {
		if (this.find(e.target,'video').paused) this.play(e.target);
		else this.pause(e.target);
	},

	play: function(caller) {
		if (!caller) return;
		if (this.players.length > 1) this.pause(); // stop other players

		this.find(caller,'video').volume = this.volume;
		this.find(caller,'volBar').value = this.volume * 100;
		if (this.muted) this.mute(caller);
		else this.unmute(caller);

		this.find(caller,'video').play();
		this.find(caller,'playAreaBtn').classList.add('_hidden');
		this.showControls(0, caller);
	},

	pause: function(caller) {
		function p(that, elem) {
			that.find(elem,'video').pause();
			that.find(elem,'playAreaBtn').classList.remove('_hidden');
			that.showControls(0, elem);
		}
		if (caller) p(this, caller);
		else {
			for (let i = 0; i < this.players.length; i++) {
				p(this, this.players[i]);
			}
		}
	},

	showControls: function(e, caller) {
		let elem = e ? e.target : caller;
		let panel = this.find(elem,'panel');
		if (!panel) return;
		panel.classList.remove('_hidden');
		clearTimeout(this.find(elem,'controls').dataset.timer);
		if (!this.find(elem,'video').paused){
			this.find(elem,'controls').dataset.timer = setTimeout(function() {
				panel.classList.add('_hidden');
			}, 2000);
		}
	},

	seekBarUpdate: function(e) {
		let value = (100 / this.find(e.target,'video').duration) * this.find(e.target,'video').currentTime;
		this.find(e.target,'seekBar').value = value;
		// для установки цвета сикбара специально вызываю эвент 'oninput'
		this.find(e.target,'seekBar').dispatchEvent(new Event('input'));
	},

	seekBarMousedown: function(e) {
		this.find(e.target,'video').removeEventListener("timeupdate", this.seekBarUpdate);
	},

	seekBarMouseup: function(e) {
		this.find(e.target,'video').addEventListener("timeupdate", this.seekBarUpdate.bind(this));
	},

	seekBarChange: function(e) {
		let time = this.find(e.target,'video').duration * (this.find(e.target,'seekBar').value / 100);
		this.find(e.target,'video').currentTime = time;
	},

	setVolume: function(e) {
		this.volume = this.find(e.target,'volBar').value / 100;
		this.find(e.target,'video').volume = this.volume;
	},

	muteCheck: function(e) {
		if (this.muted) {
			this.muted = false;
			this.unmute(e.target);
		}
		else {
			this.muted = true;
			this.mute(e.target);
		}
	},

	mute: function(caller) {
		this.find(caller,'video').muted = true;
		this.find(caller,'volBtn').classList.add('_muted');
		this.find(caller,'volBar').value = 0;
		this.find(caller,'volBar').dispatchEvent(new Event('change'));
	},

	unmute: function(caller) {
		this.find(caller,'video').muted = false;
		this.find(caller,'volBtn').classList.remove('_muted');
		this.find(caller,'volBar').value = this.volume * 100;
		this.find(caller,'volBar').dispatchEvent(new Event('change'));
	}
}