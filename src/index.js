var ua = navigator.userAgent;
window.Chrome_DEBUG = ua.indexOf('SMART-TV') == -1
if (window.Chrome_DEBUG) {
	console.log("Chrome mode enabled")
}

import App from './app.js'

//Onload
const myApp = new App()
window.onload = () => {
	if (Chrome_DEBUG) {
		document.getElementById('player').getElementsByTagName('object')[0].style.display = 'none'
	}

	myApp.init('https://tizen.000.ovh/channels.php');
};