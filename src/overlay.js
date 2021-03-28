export default class Overlay {
	div = document.getElementById('overlay')
	channelsDiv  = document.getElementById('channels')

	app; epg
	cursor = null
	active = null

	constructor(app) { this.app = app }

	init() {
		this.app.channels.forEach((channel) => {
			this.channelsDiv.appendChild(channel.domElement)
		})
		//this.setActive(this.app.channels[0])
		this.setCursor(this.app.channels[0])
		this.show()
	}

	hide() { this.div.style.display = 'none' }
	show() {
		this.div.style.display = 'block'
		this.setCursor(this.active == null ? this.app.channels[0] : this.active)
	}
	shown() { return this.div.style.display == 'block' }
	hidden() { return !this.shown() }

	setCursor(channel) {
		this.app.channels.forEach((c) => c.setCursor(false))
		this.cursor = channel
		if (channel == null) return
		channel.setCursor(true)
		this.epg.setEpgChannel(this.cursor.id)
	}
	hasCursor() {
		return this.cursor != null
	}
	setActive(channel) {
		this.app.channels.forEach((c) => c.setActive(false))
		channel.setActive(true)
		this.active = channel
		this.epg.setEpgChannel(channel.id)
		this.app.player.run(channel.url)
	}
	hasActive() {
		return this.active != null
	}

	setEpg(epg) { this.epg = epg }

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
		this.epg.setEpgChannel(this.cursor.id)
	}

	enter() { this.setActive(this.cursor) }
}