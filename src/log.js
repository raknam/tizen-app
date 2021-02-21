export default class Log {
	logDiv1 = document.getElementById('log1')
	logDiv2 = document.getElementById('log2')
	log(log) { this.logDiv2.innerHTML = log }
	sublog(log) { this.logDiv1.innerHTML = log }
	clear() { 
		this.logDiv1.innerHTML = ""
		this.logDiv2.innerHTML = ""
	}
}