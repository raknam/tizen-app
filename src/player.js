export default class Player {
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