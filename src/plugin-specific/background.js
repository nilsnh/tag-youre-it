
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
	messageExtension('isMenuOpen', callback);
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

/**
 * Start listening for messages coming from the injected
 * javascript.
 */
chrome.runtime.onMessage.addListener((msg) => {
	if (msg.command === 'requestUserInfo') {
		console.log('Extension got a command to retrieve user info');
		chrome.identity.getProfileUserInfo((userInfo) => {
			console.log(userInfo)
			messageExtension({loginObj: userInfo})
    });
	}
});

function messageExtension(messageToSend, callback) {
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		if (callback) {
			chrome.tabs.sendMessage(tabs[0].id, messageToSend, callback);
		} else {
			chrome.tabs.sendMessage(tabs[0].id, messageToSend);
		}
	});
}