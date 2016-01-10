
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
		chrome.tabs.sendMessage(tabs[0].id, "isMenuOpen" , callback);
	});
}

function injectIframe() {
	loadJquery(function () {
		chrome.tabs.executeScript(null, {
			file: 'add-iframe-to-page.js'
		}, loadPluginDeps);
	});

	function loadJquery(callback) {
		chrome.tabs.executeScript(null, {
			file: 'vendor/jquery/dist/jquery.js',
			allFrames: true
		}, callback);
	}

	function loadPluginDeps() {
		chrome.tabs.executeScript(null, {
			file: 'vendor/vendor.js',
			allFrames: true
		}, loadPlugin);
	}

	function loadPlugin() {
		chrome.tabs.executeScript(null, {
			file: 'bundle.js',
			allFrames: true
		}, loadCss);
	}

	function loadCss() {
		chrome.tabs.insertCSS(null, {
			file: 'style.css',
			allFrames: true
		}, initPlugin);
	}

	function initPlugin() {
		chrome.tabs.executeScript(null, {
			code: 'tagIt.init();'
		});
	}
}