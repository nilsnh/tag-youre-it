// used for chrome plugin, injected by popup.js

@@include('../content_script_include.js')

log('content script was added!');

injectScripts();

// todo wire up listeners

function log (msg) {
  console.log(msg);
}