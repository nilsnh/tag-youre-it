
chrome.browserAction.onClicked.addListener(function (tab) {
	isMenuOpen(function (responseIsItOpen) {
		if (responseIsItOpen) {
			console.log('Closing menu');
			chrome.tabs.reload();
		} else {
			console.log('Opening menu');
			injectIframe(tab);
		}
	})
});

function isMenuOpen(callback) {
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		chrome.tabs.sendMessage(tabs[0].id, "isMenuOpen", callback);
	});
}

function injectIframe(tab) {

	chrome.tabs.executeScript(tab.id, {
		file: 'app.js'
	}, () => {
		chrome.tabs.insertCSS(tab.id, {
			file: 'style.css',
			allFrames: true
		});
	});
}