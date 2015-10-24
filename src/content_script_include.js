// Save a copy of existing angular js and jquery
// Source: http://www.mattburkedev.com/multiple-angular-versions-on-the-same-page/
var existingWindowDotAngular = window['angular'];
// create a new window.angular and a closure variable for
// angular.js to load itself into
var angular = (window.angular = {});

injectScripts();

function injectScripts () {

  loadScript('vendor/jquery/dist/jquery.js', loadAngular);

  function loadAngular () {
    loadScript('vendor/angular/angular.js', loadPluginCode);
  }

  function loadPluginCode () {
    loadScript('bundle.js', function () {
      tagIt.init(restoreOldAngularAndJquery);
    });
  }

  function restoreOldAngularAndJquery () {
    // restore old angular
    if (existingWindowDotAngular) {
      window.angular = existingWindowDotAngular; // restore the old angular version
    }
    $.noConflict();
  }

  // TODO: add "script.js" to web_accessible_resources in manifest.json
  // s.src = chrome.extension.getURL('script.js');
  function loadScript (scriptName, callback) {
    var s = document.createElement('script');
    s.src = scriptName;
    s.onload = function() {
      // this.parentNode.removeChild(this);
      if (callback) callback();
    };
    (document.head||document.documentElement).appendChild(s);
  }
}
