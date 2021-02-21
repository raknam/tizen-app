export default class Loader {
	div = document.getElementById('page_loader');
	show() { this.div.style.display = 'block' };
	hide() { this.div.style.display = 'none' };
}