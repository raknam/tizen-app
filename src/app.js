import Loader from './loader.js'
import Log from './log.js'
import Overlay from './overlay.js'
import Epg from './epg.js'
import Player from './player.js'
import {RemoteController,RemoteKeys} from './remotecontroller.js'
import Channel from './channel.js'

export default class App {
	channels = []
	serverUrl = ""

	constructor() {
        this.loader = new Loader()
        this.log = new Log()
		this.player = new Player(this)
		this.overlay = new Overlay(this)
		this.epg = new Epg(this, this.overlay)
		this.remoteHandling = new RemoteController(this)
	}

	init(serverUrl) {
		this.serverUrl = serverUrl
		this.log.clear();
		this.loadChannels();
	}
	loadChannels() {
		this.channels = []
		if (this.overlay !== undefined)
			this.overlay.channelsDiv.innerHTML = ""
		
		fetch(this.serverUrl)
			.then(res => res.json())
			.then((out) => {
				out.channels.forEach(channel => this.addChannel(channel))
				this.epg.init(out.epg_url)
				this.overlay.init()
			}).catch(err => {
				console.error(err)
				this.log.sublog('loadChannels::error ' + err)
				setTimeout(() => this.loadChannels(), 1000)
			});
	}
	addChannel(channelJson) {
		let channel = new Channel(channelJson)
		channel.position = this.channels.length
		this.channels.push(channel)
	}
}