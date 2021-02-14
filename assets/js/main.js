//Loader
var loader = {
	div: document.getElementById('page_loader'),
	show: function() { this.div.style.display = 'block' },
	hide: function() { this.div.style.display = 'none' },
}


//LOGS
var logs = {
	p: [
		document.getElementById('log1'),
		document.getElementById('log2'),
		document.getElementById('log3')
	],
	clear: function() { 
		this.p[0].innerHTML = ""
		this.p[1].innerHTML = ""
		this.p[2].innerHTML = "" 
	},
	appendLog: function(log) { 
		this.p[2].innerHTML = this.p[1].innerHTML
		this.p[1].innerHTML = this.p[0].innerHTML
		this.p[0].innerHTML = log 
	},
	replaceLastLog: function(log) {
		this.p[0].innerHTML = log 
	},
}
var log = (log) => logs.appendLog(log)


//OVERLAY
var overlay = {
	div: document.getElementById('overlay'),
	hide: function() { 
		overlay.div.style.display = 'none'
	},
	show: function() { 
		if (overlay.hidden)
			overlay.displayCursor()
		overlay.div.style.display = 'block'
	},
	visible: () => overlay.div.style.display == 'block',
	hidden: () => !overlay.visible(),
	
	cursorPosition: 0,
	resetCursor: () => {
		Array.from(overlay.channelsDiv.children).forEach(img => img.classList.remove('cursor'))
	},
	displayCursor: () => {
		overlay.cursorPosition = overlay.currentChannel == null ? 0 : overlay.currentChannel.position
		overlay.channelsDiv.children[overlay.cursorPosition].classList.add('cursor')
	},
	moveCursorRight: () => {
		overlay.channelsDiv.children[overlay.cursorPosition].classList.remove('cursor')
		if (overlay.cursorPosition < overlay.channelsDiv.children.length - 1)
			overlay.cursorPosition++
		overlay.channelsDiv.children[overlay.cursorPosition].classList.add('cursor')
	},
	moveCursorLeft: () => {
		overlay.channelsDiv.children[overlay.cursorPosition].classList.remove('cursor')
		if (overlay.cursorPosition > 0)
			overlay.cursorPosition--
		overlay.channelsDiv.children[overlay.cursorPosition].classList.add('cursor')
	},

	channelNameP: document.getElementById('currentChannel'),
	setChannelName: function(name) { overlay.channelNameP.innerHTML = name },

	channelsDiv: document.getElementById('channels'),
	clearChannels: function() { overlay.channelsDiv.innerHTML="" },
	addChannel: function(channel) {
		let img = document.createElement('img')
		img.src = channel.image_url
		img.dataset.name = channel.name
		img.dataset.url = channel.url
		img.getObject = function() { return this.dataset }
		overlay.channelsDiv.appendChild(img)
		img.dataset.position = Array.from(overlay.channelsDiv.children).indexOf(img)
	},

	currentChannel: null,
	getSelectedChannel: function() {
		return overlay.currentChannel
	},
	setCurrentChannel: function(position) {
		if (overlay.currentChannel != null) {
			overlay.channelsDiv.children[overlay.currentChannel.position].classList.remove('active')
		}

		let img = overlay.channelsDiv.children[position]
		img.classList.add("active")
		overlay.currentChannel = img.getObject()
		overlay.setChannelName(overlay.currentChannel.name)
		player.run(overlay.currentChannel.url)
	},
}


//PLAYER
var player = {
	div: document.getElementById('player'),
	playing: false,
	prepareCount: 0,
	firstPlay: true,
	currentUrl: "",
	run: (url) => {
		log("Starting Player > " + url)

		if (player.playing) {
			webapis.avplay.stop()
			loader.show()
		}

		player.currentUrl = url
		player.playing = true
		player.prepareCount = 0
		
		webapis.avplay.open(url)
		
		if (player.firstPlay) {
			player.firstPlay = false
			webapis.avplay.setDisplayRect(0,0,1920,1080);
		}
		setTimeout(player.preparePlayer, 1000)
	},
	preparePlayer: () => {
		let prepared = false
		player.prepareCount++
		try {
			webapis.avplay.prepare();
			prepared = true
		} catch (e) { }
		if (prepared) {
			loader.hide()
			logs.clear()
			webapis.avplay.play();
			setTimeout(overlay.hide, 2000);
		} else {
			if (player.prepareCount > 10) {
				player.run(player.currentUrl)
			} else {
				setTimeout(player.preparePlayer, 1000)
			}
		}
	},
	init: () => {
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
	api: tizen.tvinputdevice,
	init: function() {
		//console.log(this.api.getSupportedKeys())
		tizen.tvinputdevice.registerKeyBatch([])
		document.body.addEventListener('keydown', this.onKeyPressed)
	},
	onKeyPressed: function(event) {
		console.log("KeyPressed", event.keyCode)
		switch(event.keyCode) {
			case RemoteKeys.OK: {
				if (overlay.hidden()) {
					overlay.setCurrentChannel(0)
					overlay.show()
				} else {
					overlay.setCurrentChannel(overlay.cursorPosition)
				}
                break
            }
			case RemoteKeys.Right: {
				overlay.moveCursorRight()
				break;
			}
			case RemoteKeys.Left: {
				overlay.moveCursorLeft()
				break;
			}
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
	loadChannels: function (callback) {
		fetch('https://tizen.000.ovh/channels.php').then(res => res.json()).then((out) => {
			out.channels.forEach(channel => overlay.addChannel(channel))
			callback()
		}).catch(err => console.error(err));
	}
}


//Onload
window.onload = function() {
	logs.clear();
	overlay.clearChannels();
	remoteHandling.init();
	player.init();
	app.loadChannels(function(){
		//overlay.setCurrentChannel(0)
	});
};