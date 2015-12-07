
document.addEventListener("DOMContentLoaded", function(event) {
  document.getElementById('js-open-menu').addEventListener('click', openMenu);
});

function openMenu () {
  logToBG('open menu was clicked');
  injectIframe();
}

function injectIframe () {
  loadJquery(function () {
    logToBG('jquery was loaded');
    chrome.tabs.executeScript(null, {
      file: 'add-iframe-to-page.js'
    }, loadPluginDeps);
  });

  function loadPluginDeps () {
    chrome.tabs.executeScript(null, {
      file: 'vendor/vendor.js',
      allFrames: true
    }, loadPlugin);
  }

  function loadPlugin () {
    chrome.tabs.executeScript(null, {
      file: 'bundle.js',
      allFrames: true
    }, loadCss);
  }

  function loadCss () {
    chrome.tabs.insertCSS(null, {
      file: 'style.css',
      allFrames: true
    }, initPlugin);
  }

  function initPlugin () {
    chrome.tabs.executeScript(null, {
      code: 'tagIt.init();'
    });
  }

  function loadJquery (callback) {
    chrome.tabs.executeScript(null, {
      file: 'vendor/jquery/dist/jquery.js',
      allFrames: true
    }, callback);
  }
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