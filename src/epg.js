export default class Epg {
    app; overlay; reloadTimer
    data = null
    reloadInProgress = false
    channelNameP = document.getElementById('currentProgram')
	nextProgamP  = document.getElementById('nextProgram')
    thumbnail    = document.getElementById('thumbnail')
    clockP       = document.getElementById('clock')
    
    constructor(app, overlay) { 
        this.app = app
        this.overlay = overlay
        this.overlay.setEpg(this)
    }

    init(url) {
        this.url = url
        this.grabEpg()
        setInterval(() => this.reloadEpg(), 10000)
        let clock = new Date()
        this.clockP.innerText = (clock.getHours() < 10 ? "0" : "") + clock.getHours() + ":" + (clock.getMinutes() < 10 ? "0" : "") + clock.getMinutes()
    }

    reloadEpg() {
        let now = Date.now()
        let clock = new Date()
        this.clockP.innerText = (clock.getHours() < 10 ? "0" : "") + clock.getHours() + ":" + (clock.getMinutes() < 10 ? "0" : "") + clock.getMinutes()
//        console.log("reloadEpg loop", now, this.data._meta.next_refresh - now)
        if (this.reloadInProgress) return
        if (now < this.data._meta.next_refresh) return
//        console.log("Reloading EPG", now - this.data._meta.next_refresh)
        this.grabEpg()
    }

    grabEpg() {
        this.reloadInProgress = true
        fetch(this.url + "&cb=" + Date.now())
			.then(res => res.json())
			.then(out => {
                this.data = out
                this.reloadInProgress = false
                if (this.overlay.hasCursor()) {
                    setTimeout(() => { this.setEpgChannel(this.overlay.cursor.id) }, 100)
                }
			}).catch(err => {
				console.error(err)
                this.reloadInProgress = false
			})
    }

    setEpgChannel(channelId) {
        if (this.data == null) return;
//        console.log("setEPG", this.data._meta.next_refresh, this.data[channelId].now, this.data[channelId].next)
        this.setCurrentProgram(this.data[channelId].now)
        this.setNextProgram(this.data[channelId].next)
    }

    setCurrentProgram(epgProgram) { this.setProgram(epgProgram, this.channelNameP, false) }
    setNextProgram(epgProgram) { this.setProgram(epgProgram, this.nextProgamP, true) }

    setProgram(epgProgram, pTag, isNext) {
        if (!isNext) {
            this.thumbnail.style.visibility = epgProgram.icon === undefined ? 'hidden' : 'visible'
            if (epgProgram.icon !== undefined)
                this.thumbnail.src = epgProgram.icon
        }

        pTag.firstChild.nodeValue = epgProgram.title
        
        let subtitle = ""
        if (epgProgram.subtitle !== undefined) subtitle = epgProgram.subtitle.substr(0,50) + (epgProgram.subtitle.length > 50 ? "..." : "") + " "
        if (epgProgram.date !== undefined) subtitle += "(" + epgProgram.date + ") "
        if (epgProgram.ep_season !== undefined) subtitle += "S" + (epgProgram.ep_season < 10 ? "0" : "") + epgProgram.ep_season
        if (epgProgram.ep_episode !== undefined) subtitle += "E" + (epgProgram.ep_episode < 10 ? "0" : "") + epgProgram.ep_episode

        pTag.children[0].innerText = subtitle
        pTag.children[1].innerText = epgProgram.start.substr(8,2) + ":" + epgProgram.start.substr(10,2) + 
            " > " + epgProgram.stop.substr(8,2) + ":" + epgProgram.stop.substr(10,2)
    }
}