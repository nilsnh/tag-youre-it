// Code used by both the local web prototype as well as the plugin.

function injectScripts () {

  // Save a copy of existing angular js and jquery
  // Source: http://www.mattburkedev.com/multiple-angular-versions-on-the-same-page/
  var existingWindowDotAngular = window['angular'];
  // create a new window.angular and a closure variable for
  // angular.js to load itself into
  var angular = (window.angular = {});

  console.log('loading jquery');
  loadScript('vendor/jquery/dist/jquery.js', loadAngular);

  function loadAngular () {
    console.log('loading angular');
    loadScript('vendor/angular/angular.js', loadPluginCode);
  }

  function loadPluginCode () {
    console.log('loading tagit');
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

  function loadScript (relativeScriptPath, callback) {
    function translateToPluginPath (relativeScriptPath) {
      // if "chrome" present, we deduce that we're running as a plugin
      if (chrome && chrome.extension) {
        return chrome.extension.getURL(relativeScriptPath);
      } else {
        return relativeScriptPath;
      }
    }
    var s = document.createElement('script');
    s.src = translateToPluginPath(relativeScriptPath);
    s.onload = function() {
      this.parentNode.removeChild(this);
      if (callback) callback();
    };
    (document.head||document.documentElement).appendChild(s);
  }
}
