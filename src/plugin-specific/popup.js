
document.addEventListener("DOMContentLoaded", function(event) {
  document.getElementById('js-open-menu').addEventListener('click', openMenu);
});

function openMenu () {
  logToBG('open menu was clicked');
  // chrome.tabs.executeScript(null, {file: 'content_script.js'});
  injectScripts();
}

function injectScripts () {
  logToBG('injectAngular');
  // Prevent immediate automatic bootstrapping
  chrome.tabs.executeScript(null, {
    code: 'window.name = "NG_DEFER_BOOTSTRAP!" + window.name;'
  }, loadPluginDeps);

  function loadPluginDeps () {
    chrome.tabs.executeScript(null, {
      file: 'vendor/vendor.js'
    }, loadPlugin);
  }

  function loadPlugin () {
    chrome.tabs.executeScript(null, {
      file: 'bundle.js'
    }, loadCss);
  }

  function loadCss () {
    chrome.tabs.insertCSS(null, {file: 'vendor/bootstrap/dist/css/bootstrap.min.css'},
      chrome.tabs.insertCSS(null, {file: 'style.css'}, bootstrapAngularMenu))
  }

  function bootstrapAngularMenu () {
    chrome.tabs.executeScript(null, {
      code: 'tagIt.init();'
    });
  }

}

function addScript (relativeScriptPath, callback) {
  chrome.tabs.executeScript(null, {file: relativeScriptPath}, callback);
}

function logToBG (msg) {
  chrome.runtime.sendMessage({logMsg: msg});
}