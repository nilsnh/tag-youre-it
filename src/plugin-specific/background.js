
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
	messageExtension('isMenuOpen').then(callback);
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
	console.log('chrome.runtime.onMessage.addListener(msg)');
	console.log(msg);
	
	if (msg.command === 'loginAndRequestUserInfo') {
		console.log('Extension got a command to retrieve user info');

		loginUser()
			.then(askForUserEmail)
			.then(function (userInfo) {
				console.log('Background.js received userInfo:');
				console.log(userInfo);
				messageExtension({ loginObj: userInfo });
			});
	}

	if (msg.command === 'logOutUser') {
		logOutUser().then(function () {
			messageExtension('deletedUserAuthToken');
		});
	}

});

function loginUser() {
	return new Promise(function (resolve, reject) {
		chrome.identity.getAuthToken({ interactive: true }, function (token) {
			console.log('user was logged in and token is: ');
			console.log(token);
			resolve(token);
		})
	});
}

function askForUserEmail() {
	return new Promise(function (resolve, reject) {
		chrome.identity.getProfileUserInfo(resolve);
	});
}

function logOutUser() {
	return new Promise(function (resolve, reject) {
		loginUser()
			.then(function (loadedToken) {
				chrome.identity.removeCachedAuthToken({ token: loadedToken }, resolve);
			})
	});
}

function messageExtension(messageToSend) {
	/**
	 * small note: Cannot query tab for currentWindow: true because 
	 * opening a new window to approve the app permissions 
	 * will prevent this script from finding the right 
	 * tab to message with the user info. 
	 */
	return new Promise(function (resolve, reject) {
		chrome.tabs.query({ active: true }, function (tabs) {
			chrome.tabs.sendMessage(tabs[0].id, messageToSend, resolve);
		});
	})


}