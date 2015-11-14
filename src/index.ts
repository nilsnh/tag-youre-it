/// <reference path="../typings/tsd.d.ts" />

/// <reference path="menu/menu.controller.ts" />
/// <reference path="services/backend.service.ts" />
/// <reference path="services/webPage.service.ts" />

module tagIt {

  angular.module('tagit', [])
    .service('BackendService', BackendService)
    .service('WebPageService', WebPageService)
    .controller('MenuCtrl', MenuCtrl);

  export function init (callback: () => void) {
    var $ = jQuery;
    $.get(chromeUrlTranslator('menu.tpl.html'), function (htmlData) {
      $('body').children().wrapAll('<div id="tagit-body" class="tagit-body" />');
      $('.tagit-body').before(htmlData);
      window.name = '';
      angular.bootstrap(document.getElementById("tagit-menu"), ['tagit']);
      console.log('TagIt menu loaded');
      if(callback) callback();
    });

    function chromeUrlTranslator(relativeUrl : string) {
      if(chrome && chrome.extension) {
        return chrome.extension.getURL(relativeUrl);
      } else {
        relativeUrl;
      }
    }
  }
}

