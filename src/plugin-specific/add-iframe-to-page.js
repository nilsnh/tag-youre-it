$.get(chrome.extension.getURL('index-angular-app.html'), function (htmlData) {
  var iframe = document.createElement('iframe');
  iframe.id = 'tagit-iframe';
  iframe.srcdoc = htmlData;
  iframe.className = 'tagit-iframe';
  iframe.sandbox = 'allow-same-origin allow-top-navigation allow-scripts';
  $('body').children().wrapAll('<div id="tagit-body" class="tagit-body" />');
  $('.tagit-body').before(iframe);
});