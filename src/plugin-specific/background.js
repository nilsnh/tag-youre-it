
chrome.browserAction.onClicked.addListener(function () {
	isMenuOpen(function (responseIsItOpen) {
		if (responseIsItOpen) {
			console.log('Closing menu');
			chrome.tabs.reload();
		} else {
			console.log('Opening menu');
			injectIframe();
		}
	})
});

function isMenuOpen(callback) {
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		chrome.tabs.sendMessage(tabs[0].id, "isMenuOpen", callback);
	});
}

function injectIframe() {

	chrome.tabs.executeScript(null, {
		file: 'app.js'
	}, () => {

		chrome.tabs.insertCSS(null, {
			file: 'style.css',
			allFrames: true
		});
	});
}