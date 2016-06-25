import $ from 'jquery';
import _ from 'lodash';

/**
 * To prepare the page for running our app
 * we reload the page inside an iframe connected to the
 * top document. We then add a second iframe that will
 * house our app menu.
 */
export function preparePage(callback) {
  const done = _.after(2, () => {
    console.log('done rebuilding page')
    callback()
  });
  reloadPageInIframe(done);
  loadMenu(done);
}

function reloadPageInIframe(done) {
  //add a helper class to aid in styling later.
  $('html').addClass('tagit-top-wrapper');

  /**
   * If the page is using a frameset
   * we'll need to remove it and
   * insert a new body tag instead.
   */
  if ($('frameset').length > 0) {
    $('frameset').remove();
    var newbody = document.createElement("body");
    $('html').append(newbody);
  } else {
    $('body').children().remove();
  }

  var iframeMainContent = <extendedHTMLIFrameElement> document.createElement('iframe');
  iframeMainContent.id = 'tagit-body';
  iframeMainContent.className = 'tagit-body';
  iframeMainContent.src = window.location.href;
  iframeMainContent.seamless = 'seamless';
  iframeMainContent.frameBorder = "0";
  iframeMainContent.onload = done;

  //reinsert page this time inside an iframe
  $('body').append(iframeMainContent);

}

function loadMenu(done) {

  $.get(chrome.extension.getURL('menu.tpl.html'), function (htmlData) {
    var iframeMenu = <extendedHTMLIFrameElement> document.createElement('iframe');
    iframeMenu.id = 'tagit-iframe';
    iframeMenu.srcdoc = htmlData;
    iframeMenu.seamless = 'seamless';
    iframeMenu.frameBorder = "0";
    iframeMenu.className = 'tagit-iframe';
    iframeMenu.onload = done;
    // iframe.sandbox = 'allow-same-origin allow-top-navigation allow-scripts';
    $('.tagit-body').before(iframeMenu);
  });

}

interface extendedHTMLIFrameElement extends HTMLIFrameElement {
  srcdoc: any;
  seamless: string;
}

