
/*
  This javascript is injected to page by background.js.
*/
 
$.get(chrome.extension.getURL('index-angular-app.html'), function (htmlData) {
  var iframeMainContent = document.createElement('iframe'); 
  iframeMainContent.id = 'tagit-body';
  iframeMainContent.className = 'tagit-body';
  iframeMainContent.src = window.location.href;
  iframeMainContent.seamless = 'seamless';
  iframeMainContent.frameBorder = "0";
  
  //add a helper class to aid in styling later.
  $('html').addClass('tagit-top-wrapper');
  
  //empty the page
  $('body').children().remove();
  //remove style sheets
  $('link[rel=stylesheet]').remove();
  //reinsert page this time inside an iframe
  $('body').append(iframeMainContent);
  
  var iframeMenu = document.createElement('iframe');
  iframeMenu.id = 'tagit-iframe';
  iframeMenu.srcdoc = htmlData;
  iframeMenu.seamless = 'seamless';
  iframeMenu.frameBorder = "0";
  iframeMenu.className = 'tagit-iframe';
  // iframe.sandbox = 'allow-same-origin allow-top-navigation allow-scripts';
  $('.tagit-body').before(iframeMenu);
});