var Chrome_DEBUG = false


//Loader
var loader = {
	div: document.getElementById('page_loader'),
	show: function() { this.div.style.display = 'block' },
	hide: function() { this.div.style.display = 'none' },
}


//LOGS
var logDiv1 = document.getElementById('log1')
var logDiv2 = document.getElementById('log2')
var log = (log) => logDiv2.innerHTML = log
var sublog = (log) => logDiv1.innerHTML = log
var clearLogs = () => { logDiv1.innerHTML = ""; logDiv2.innerHTML = "" }


//OVERLAY
var overlay = {
	div: document.getElementById('overlay'),
	channelNameP: document.getElementById('currentChannel'),
	channelsDiv: document.getElementById('channels'),

	hide: function() { 
		overlay.div.style.display = 'none'
	},
	show: function() {
		overlay.div.style.display = 'block'
		overlay.setCursor(app.channels[0])
	},
	shown: () => overlay.div.style.display == 'block',
	hidden: () => !overlay.shown(),
	
	init: () => {
		app.channels.forEach((channel) => {
			overlay.channelsDiv.appendChild(channel.domElement)
		})
		overlay.setCursor(app.channels[0])
		overlay.setActive(app.channels[0])
	},

	cursor: null,
	active: null,
	setCursor: (channel) => {
		app.channels.forEach((c) => c.setCursor(false))
		channel.setCursor(true)
		overlay.cursor = channel
	},
	setActive: (channel) => {
		app.channels.forEach((c) => c.setActive(false))
		channel.setActive(true)
		overlay.active = channel
		overlay.channelNameP.innerHTML = channel.name
		player.run(channel.url)
	},

	moveCursorRight: () => overlay.moveCursor(1),
	moveCursorLeft: () => overlay.moveCursor(-1),
	moveCursor: (move) => {
		let current = overlay.cursor.position
		if (current + move < 0 || current + move > app.channels.length - 1) {
			console.log("Cannot apply move " + move)
			return
		}
		overlay.cursor.setCursor(false)
		overlay.cursor = app.channels[current + move]
		overlay.cursor.setCursor(true)
	},

	enter: () => {
		overlay.setActive(overlay.cursor)
	},

	timeout: null,
}


//PLAYER
var player = {
	div: document.getElementById('player'),
	playing: false,
	prepareCount: 0,
	currentUrl: "",
	run: (url) => {
		log("Starting Player > " + url)
		if (Chrome_DEBUG) return

		if (player.playing) {
			clearTimeout(player.overlayTimeout)
			clearTimeout(player.retryTimeout)
			webapis.avplay.stop()
			webapis.avplay.close()
			loader.show()
		}

		player.currentUrl = url
		player.playing = true
		player.prepareCount = 0
		
		webapis.avplay.open(url)
		
		webapis.avplay.setDisplayRect(0,0,1920,1080);
		setTimeout(player.preparePlayer, 2000)
	},
	preparePlayer: () => {
		let prepared = false
		player.prepareCount++
		sublog(`Retry ${player.prepareCount}`)
		
		try {
			webapis.avplay.prepare();
			prepared = true
		} catch (e) { }

		if (prepared) {
			loader.hide()
			clearLogs();
			webapis.avplay.play();
			player.overlayTimeout = setTimeout(overlay.hide, 5000);
		} else {
			if (player.prepareCount >= 10) {
				player.run(player.currentUrl)
			} else {
				player.retryTimeout = setTimeout(player.preparePlayer, 2000)
			}
		}
	},
	overlayTimeout: null,
	retryTimeout: null,
	init: () => {
		if (Chrome_DEBUG) return
		webapis.avplay.setListener(player.listeners);
	},
	listeners: {
		onbufferingstart: () => { },
		onbufferingprogress: () => { },
		onbufferingcomplete: () => { },
		onstreamcompleted: () => { },
		oncurrentplaytime: () => { },
		ondrmevent: () => { },	
		onerror: () => { },
	}
}


//REMOTE
var remoteHandling = {
	api: Chrome_DEBUG ? null : tizen.tvinputdevice,
	init: function() {
		//console.log(this.api.getSupportedKeys())
		document.body.addEventListener('keydown', this.onKeyPressed)
		if (Chrome_DEBUG) return
		tizen.tvinputdevice.registerKeyBatch(['ChannelList'])
	},
	onKeyPressed: function(event) {
		console.log("KeyPressed", event.keyCode)
		switch(event.keyCode) {
			case RemoteKeys.OK: {
				if (overlay.hidden()) {
					overlay.show()
				} else {
					overlay.enter()
				}
                break
            }
			case RemoteKeys.Right: {
				if (overlay.hidden()) {
					overlay.show()
				}
				overlay.moveCursorRight()
				break;
			}
			case RemoteKeys.Left: {
				if (overlay.hidden()) {
					overlay.show()
				}
				overlay.moveCursorLeft()
				break;
			}
			case RemoteKeys.Up: case RemoteKeys.Down:
				event.stopImmediatePropagation()
				break;
			case RemoteKeys.ChannelList:
				app.loadChannels(() => { overlay.init() });
				break;
		}
	},
}

var RemoteKeys = {
    Left: 37, Up: 38, Right: 39, Down: 40, OK: 13, Back: 10009,
    Key0: 48, Key1: 49, Key2: 50, Key3: 51, Key4: 52, Key5: 53, Key6: 54, Key7: 55, Key8: 56, Key9: 57, 
    VolumeUp: 447, VolumeDown: 448, VolumeMute: 449, 
    ChannelUp: 427, ChannelDown: 428, 
    ColorF0Red: 403, ColorF1Green: 404, ColorF2Yellow: 405, ColorF3Blue: 406,
    Menu: 10133, Tools: 10135, Info: 457, Exit: 10182, Search: 10225, Guide: 458, 
    MediaRewind: 412, MediaPause: 19, MediaFastForward: 417, MediaRecord: 416, MediaPlay: 415, MediaStop: 413, 
    MediaPlayPause: 10252, MediaTrackPrevious: 10232,	MediaTrackNext: 10233, 
    Source: 10072, PictureSize: 10140, PreviousChannel: 10190, ChannelList: 10073, EManual: 10146,
    MTS: 10195, Key3D: 10199, Soccer: 10228, Caption: 10221, Teletext: 10200, Extra: 10253, Minus: 189
}


//App
var app = {
	loadChannels: (callback) => {
		app.channels = []
		overlay.channelsDiv.innerHTML = ""
		fetch('https://tizen.000.ovh/channels.php').then(res => res.json()).then((out) => {
			out.channels.forEach(channel => app.addChannel(channel))
			callback()
		}).catch(err => console.error(err));
	},
	channels: [],
	addChannel: (channelJson) => {
		let channel = new Channel(channelJson)
		channel.position = app.channels.length
		app.channels.push(channel)
	},
}


class Channel {
	constructor(json) {
		this.url = json.url
		this.name = json.name
		this.image_url = json.image_url
		this.image_url_over = json.image_url_over
		this.generateDomElement()
	}

	hasLogoOver() {
		return this.image_url_over != null
	}

	generateDomElement() {
		this.domElement = document.createElement('img')
		this.domElement.src = this.image_url
		this.domElement.dataset.name = this.name
		this.domElement.dataset.url = this.url
		this.domElement.dataset.logo = this.logo
		this.domElement.dataset.logo_over = this.logo_over
	}

	setActive(active) {
		this.domElement.classList.toggle('active', active)
		if (this.hasLogoOver()) {
			this.domElement.src = active || this.domElement.classList.contains('cursor') ? this.image_url_over : this.image_url
		}
	}

	setCursor(active) {
		this.domElement.classList.toggle('cursor', active)
		if (this.hasLogoOver()) {
			this.domElement.src = active || this.domElement.classList.contains('active') ? this.image_url_over : this.image_url
		}
	}
}


//Onload
window.onload = () => {
	if (Chrome_DEBUG) {
		document.getElementById('player').getElementsByTagName('object')[0].style.display = 'none'
	}

	clearLogs();
	remoteHandling.init();
	player.init();
	app.loadChannels(() => { overlay.init() });
};