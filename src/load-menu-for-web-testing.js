
// Script loader for local web page testing
document.addEventListener("DOMContentLoaded", function(event) {
  document.getElementById('js-show-menu')
  .addEventListener('click', function () {
    if (!document.getElementById('tagit-menu')) injectIframe();
  });
  document.getElementById('js-reset-tags')
  .addEventListener('click', function () {
    // nothing here yet
  });
  injectIframe();
});

function injectIframe () {
  console.log('injectIframe()');
  var iframe = document.createElement('iframe');
  iframe.src = 'index-angular-app-web.html';
  iframe.seamless = 'seamless';
  iframe.frameBorder = "0";
  iframe.className = 'tagit-iframe';
  $('body').children().wrapAll('<div id="tagit-body" class="tagit-body" />');
  $('.tagit-body').before(iframe);
}

// Todo: Setup listener that will call angular code
// on new text selections and deselections

// Todo: Add functions that give access to window object.

function getParentWindowObject () {
  return window;
}