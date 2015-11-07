// used for local web testing

@@include('content_script_include.js')

requirejs(['index'], function (tagIt) {
  injectScripts(tagIt); //found in the included file
});