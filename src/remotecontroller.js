export class RemoteController {
	api = Chrome_DEBUG ? null : tizen.tvinputdevice

	constructor() {
		//console.log(this.api.getSupportedKeys())
		document.body.addEventListener('keydown', this.onKeyPressed)
		if (Chrome_DEBUG) return
		tizen.tvinputdevice.registerKeyBatch(['ChannelList'])
	}

	onKeyPressed(event) {
		console.log("KeyPressed", event.keyCode)
		switch(event.keyCode) {
			case RemoteKeys.OK: {
				if (myApp.overlay.hidden()) {
					myApp.overlay.show()
				} else {
					myApp.overlay.enter()
				}
                break
            }
			case RemoteKeys.Right: {
				if (myApp.overlay.hidden()) {
					myApp.overlay.show()
				}
				myApp.overlay.moveCursorRight()
				break;
			}
			case RemoteKeys.Left: {
				if (myApp.overlay.hidden()) {
					myApp.overlay.show()
				}
				myApp.overlay.moveCursorLeft()
				break;
			}
			case RemoteKeys.Back: {
				if (myApp.overlay.shown()) {
					myApp.overlay.hide()
				}
				break;
			}
			case RemoteKeys.Up: case RemoteKeys.Down:
				event.stopImmediatePropagation()
				break;
			case RemoteKeys.ChannelList:
				myApp.loadChannels();
				break;
		}
	}
}

export const RemoteKeys = {
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