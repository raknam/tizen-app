var Chrome_DEBUG = true


//Loader
const Loader = class {
	div = document.getElementById('page_loader')
	show() { this.div.style.display = 'block' }
	hide() { this.div.style.display = 'none' }
}

const Overlay = class {
	div = document.getElementById('overlay')
	channelNameP = document.getElementById('currentChannel')
	channelsDiv = document.getElementById('channels')

	app
	cursor = null
	active = null

	constructor(app) { this.app = app }

	init() {
		this.app.channels.forEach((channel) => {
			this.channelsDiv.appendChild(channel.domElement)
		})
		this.setActive(this.app.channels[0])
		this.show()
	}

	hide() { this.div.style.display = 'none' }
	show() {
		this.div.style.display = 'block'
		this.setCursor(this.active)
	}
	shown() { return this.div.style.display == 'block' }
	hidden() { return !this.shown() }

	setCursor(channel) {
		this.app.channels.forEach((c) => c.setCursor(false))
		channel.setCursor(true)
		this.cursor = channel
	}
	setActive(channel) {
		this.app.channels.forEach((c) => c.setActive(false))
		channel.setActive(true)
		this.active = channel
		this.channelNameP.innerHTML = channel.name
		this.app.player.run(channel.url)
	}

	moveCursorRight() { this.moveCursor(1) }
	moveCursorLeft() { this.moveCursor(-1) }
	moveCursor(move) {
		let current = this.cursor.position
		if (current + move < 0 || current + move > this.app.channels.length - 1) {
			console.log("Cannot apply move " + move)
			return
		}
		this.cursor.setCursor(false)
		this.cursor = this.app.channels[current + move]
		this.cursor.setCursor(true)
	}

	enter() { this.setActive(this.cursor) }
}

const Player = class {
	div = document.getElementById('player')

	app
	playing = false
	prepareCount = 0
	currentUrl = ""
	overlayTimeout = null
	retryTimeout = null

	constructor(app) { 
		this.app = app
		if (Chrome_DEBUG) return
		webapis.avplay.setListener(this.listeners);
	}

	listeners = {
		onbufferingstart: () => { },
		onbufferingprogress: () => { },
		onbufferingcomplete: () => { },
		onstreamcompleted: () => { },
		oncurrentplaytime: () => { },
		ondrmevent: () => { },	
		onerror: () => { },
	}

	run(url) {
		this.app.log.log("Starting Player > " + url)
		if (Chrome_DEBUG) return

		if (this.playing) {
			clearTimeout(this.overlayTimeout)
			clearTimeout(this.retryTimeout)
			webapis.avplay.stop()
			webapis.avplay.close()
			this.app.loader.show()
		}

		this.currentUrl = url
		this.playing = true
		this.prepareCount = 0
		
		webapis.avplay.open(url)
		
		webapis.avplay.setDisplayRect(0,0,1920,1080);
		setTimeout(this.preparePlayer, 2000)
	}

	preparePlayer() {
		let prepared = false
		this.prepareCount++
		this.app.log.sublog(`Retry ${this.prepareCount}`)
		
		try {
			webapis.avplay.prepare();
			prepared = true
		} catch (e) { }

		if (prepared) {
			this.app.loader.hide()
			this.app.log.clear();
			webapis.avplay.play();
			clearTimeout(this.retryTimeout);
			this.overlayTimeout = setTimeout(this.app.overlay.hide, 5000);
		} else {
			if (this.prepareCount >= 10) {
				this.run(this.currentUrl)
			} else {
				this.retryTimeout = setTimeout(this.preparePlayer, 2000)
			}
		}
	}
}

const RemoteController = class {
	api = Chrome_DEBUG ? null : tizen.tvinputdevice

	constructor() {
		//console.log(this.api.getSupportedKeys())
		document.body.addEventListener('keydown', this.onKeyPressed)
		if (Chrome_DEBUG) return
		tizen.tvinputdevice.registerKeyBatch(['ChannelList'])
	}

	onKeyPressed(event) {
		console.log("KeyPressed", event.keyCode)
		switch(event.keyCode) {
			case RemoteKeys.OK: {
				if (myApp.overlay.hidden()) {
					myApp.overlay.show()
				} else {
					myApp.overlay.enter()
				}
                break
            }
			case RemoteKeys.Right: {
				if (myApp.overlay.hidden()) {
					myApp.overlay.show()
				}
				myApp.overlay.moveCursorRight()
				break;
			}
			case RemoteKeys.Left: {
				if (myApp.overlay.hidden()) {
					myApp.overlay.show()
				}
				myApp.overlay.moveCursorLeft()
				break;
			}
			case RemoteKeys.Back: {
				if (myApp.overlay.shown()) {
					myApp.overlay.hide()
				}
				break;
			}
			case RemoteKeys.Up: case RemoteKeys.Down:
				event.stopImmediatePropagation()
				break;
			case RemoteKeys.ChannelList:
				myApp.loadChannels();
				break;
		}
	}
}

const RemoteKeys = {
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

//App
const App = class {
	loader = new Loader()
	log = new Log()
	channels = []

	constructor() {
		this.player = new Player(this)
		this.overlay = new Overlay(this);
		this.remoteHandling = new RemoteController(this)
	}

	init() {
		this.log.clear();
		this.loadChannels();
	}
	loadChannels() {
		this.channels = []
		if (this.overlay !== undefined)
			this.overlay.channelsDiv.innerHTML = ""
		
		fetch('https://tizen.000.ovh/channels.php')
			.then(res => res.json())
			.then((out) => {
				out.channels.forEach(channel => this.addChannel(channel))
				this.overlay.init()
			}).catch(err => {
				console.error(err)
				this.log.sublog('loadChannels::error ' + err)
			});
	}
	addChannel(channelJson) {
		let channel = new Channel(channelJson)
		channel.position = this.channels.length
		this.channels.push(channel)
	}
}

//logs
const Log = class {
	logDiv1 = document.getElementById('log1')
	logDiv2 = document.getElementById('log2')
	log(log) { this.logDiv2.innerHTML = log }
	sublog(log) { this.logDiv1.innerHTML = log }
	clear() { 
		this.logDiv1.innerHTML = ""
		this.logDiv2.innerHTML = ""
	}
}

//Onload
const myApp = new App();
window.onload = () => {
	if (Chrome_DEBUG) {
		document.getElementById('player').getElementsByTagName('object')[0].style.display = 'none'
	}

	myApp.init();
};