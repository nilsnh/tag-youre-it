var pluginEnabled = true;

console.log('background page was started');

function updateIcon () {
  var selectedIcon;
  if (pluginEnabled) {
    chrome.browserAction.setIcon({path:'icon2.png'});
    pluginEnabled = false;
  } else {
    chrome.browserAction.setIcon({path:'icon1.png'});
    pluginEnabled = true;
  }
}

function initBackground () {
  chrome.browserAction.onClicked.addListener(updateIcon);
  updateIcon();
}

// initBackground();

