var pluginEnabled = true;

function updateIcon () {
  var selectedIcon;
  if (pluginEnabled) {
    chrome.browserAction.setIcon({path:'icon2.png'});
    pluginEnabled = false;
  } else{
    chrome.browserAction.setIcon({path:'icon1.png'});
    pluginEnabled = true;
  };
}

chrome.browserAction.onClicked.addListener(updateIcon);

updateIcon();
