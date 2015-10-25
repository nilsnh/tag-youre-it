// used for local web testing

@@include('content_script_include.js')

injectScripts(); //found in the included file

document.addEventListener("DOMContentLoaded", function(event) {
  document.getElementById('js-show-menu')
  .addEventListener('click', function () {
    if (!document.getElementById('tagit-menu')) injectScripts();
  });
});
