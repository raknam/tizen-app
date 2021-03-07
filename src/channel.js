export default class Channel {
	constructor(json) {
		this.url = json.url
		this.name = json.name
		this.image_url = json.image_url
		this.image_url_over = json.image_url_over
		this.id = json.id
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