/// <reference path="../typings/tsd.d.ts" />

/// <reference path="index.appConfig.ts" />
/// <reference path="menu/menu.controller.ts" />
/// <reference path="services/backend.service.ts" />
/// <reference path="services/webpage.service.ts" />
/// <reference path="services/tag.service.ts" />

module tagIt {

  angular.module('tagit', ['ngStorage'])
    .config(AppConfigInitializer)
    .service('AppConfigService', AppConfigService)
    .service('BackendService', BackendService)
    .service('WebPageService', WebPageService)
    .service('TagService', TagService)
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
        return relativeUrl;
      }
    }
  }
}

