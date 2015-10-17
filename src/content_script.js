$(document).ready(function () {

  // Save a copy of existing angular js and jquery
  // Source: http://www.mattburkedev.com/multiple-angular-versions-on-the-same-page/
  var existingWindowDotAngular = window['angular'];
  // create a new window.angular and a closure variable for
  // angular.js to load itself into
  var angular = (window.angular = {});

  injectScriptBundle();

  function injectScriptBundle () {
    // When document is ready add bundle.js
    var s = document.createElement('script');
    // TODO: add "script.js" to web_accessible_resources in manifest.json
    // s.src = chrome.extension.getURL('script.js');
    s.src = '../dist/bundle.js'
    s.onload = function() {
        this.parentNode.removeChild(this);
        bootStrapAndRestoreAngular();
        // $.noConflict();
    };
    (document.head||document.documentElement).appendChild(s);
  }

  function bootStrapAndRestoreAngular () {
    angular.element(document).ready(function() {
      // angular.bootstrap(document.getElementById('my-widget', ['MyWidget']);
      window.angular = existingWindowDotAngular; // restore the old angular version
      console.log('this should be the old angular');
      console.log(window.angular.version);
      console.log('this should be the old jquery');
      console.log($().jquery);

      setTimeout(function () {
        console.log('this should still be the old angular');
        console.log(window.angular.version);
        console.log('this should still be the old jquery');
        console.log($().jquery);
      }, 4000);
    });
  }

});