
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

  console.log('loading dependencies');
  loadScript('vendor/vendor.js', loadPluginCode);

  function loadPluginCode () {
    console.log('loading tagit');
    loadScript('bundle.js', function () {
      tagIt.init(function () {console.log('tagIt init!')});
    });
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
