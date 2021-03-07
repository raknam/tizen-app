export default class Epg {
    app; overlay; reloadTimer
    data = null
    reloadInProgress = false
    channelNameP = document.getElementById('currentProgram')
	nextProgamP  = document.getElementById('nextProgram')
    thumbnail    = document.getElementById('thumbnail')
    
    constructor(app, overlay) { 
        this.app = app
        this.overlay = overlay
        this.overlay.setEpg(this)
    }

    init(url) {
        this.url = url
        this.grabEpg()
    }

    reloadEpg() {
        if (this.reloadInProgress) return
    }

    grabEpg() {
        this.reloadInProgress = true
        fetch(this.url)
			.then(res => res.json())
			.then(out => {
                this.data = out
                if (this.overlay.hasActive()) {
                    this.setEpg(this.overlay.active.id)
                }
			}).catch(err => {
				console.error(err)
			}).finally(() => {
                this.reloadInProgress = false
            })
    }

    setEpg(channelId) {
        if (this.data == null) return;
        console.log("setEPG", this.data[channelId].now, this.data[channelId].next)
        this.setCurrentProgram(this.data[channelId].now)
        this.setNextProgram(this.data[channelId].next)
    }

    setCurrentProgram(epgProgram) { this.setProgram(epgProgram, this.channelNameP, false) }
    setNextProgram(epgProgram) { this.setProgram(epgProgram, this.nextProgamP, true) }

    setProgram(epgProgram, pTag, isNext) {
        if (!isNext) {
            this.thumbnail.style.display = epgProgram.icon === undefined ? 'none' : 'block'
            if (epgProgram.icon !== undefined)
                this.thumbnail.src = epgProgram.icon
        }

        pTag.firstChild.nodeValue = (isNext ? "> " : "") + epgProgram.title
        
        let subtitle = ""
        if (epgProgram.subtitle !== undefined) subtitle = epgProgram.subtitle + " "
        if (epgProgram.ep_season !== undefined) subtitle += "S" + (epgProgram.ep_season < 10 ? "0" : "") + epgProgram.ep_season
        if (epgProgram.ep_episode !== undefined) subtitle += "E" + (epgProgram.ep_episode < 10 ? "0" : "") + epgProgram.ep_episode
        if (epgProgram.date !== undefined) subtitle += " (" + epgProgram.date + ")"

        pTag.children[0].innerText = subtitle
        pTag.children[1].innerText = epgProgram.start.substr(8,2) + ":" + epgProgram.start.substr(10,2) + 
            " > " + epgProgram.stop.substr(8,2) + ":" + epgProgram.stop.substr(10,2)
    }
}