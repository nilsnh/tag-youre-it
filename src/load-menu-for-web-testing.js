
// Script loader for local web page testing
injectScripts();

document.addEventListener("DOMContentLoaded", function(event) {
  document.getElementById('js-show-menu')
  .addEventListener('click', function () {
    if (!document.getElementById('tagit-menu')) injectScripts();
  });
  document.getElementById('js-reset-tags')
  .addEventListener('click', function () {
    // nothing here yet
  });
});

function injectScripts () {

  // Save a copy of existing angular js and jquery
  // Source: http://www.mattburkedev.com/multiple-angular-versions-on-the-same-page/
  var existingWindowDotAngular = window['angular'];
  // create a new window.angular and a closure variable for
  // angular.js to load itself into
  var angular = (window.angular = {});

  console.log('loading dependencies');
  loadScript('vendor/vendor.js', loadPluginCode);

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
    var s = document.createElement('script');
    s.src = relativeScriptPath;
    s.onload = function() {
      this.parentNode.removeChild(this);
      if (callback) callback();
    };
    (document.head||document.documentElement).appendChild(s);
  }
}
