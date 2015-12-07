/// <reference path="../typings/tsd.d.ts" />

/// <reference path="index.appConfig.ts" />
/// <reference path="menu/menu.controller.ts" />
/// <reference path="services/backend.service.ts" />
/// <reference path="services/webpage.service.ts" />
/// <reference path="services/tagStorage.service.ts" />

module tagIt {

  angular.module('tagit', ['ngStorage'])
    .config(AppConfigInitializer)
    .service('AppConfigService', AppConfigService)
    .service('BackendService', BackendService)
    .service('WebPageService', WebPageService)
    .service('TagStorageService', TagStorageService)
    .controller('MenuCtrl', MenuCtrl);

  export function init (callback: () => void) {
    angular.bootstrap(
      document.getElementById("tagit-iframe")
        .contentDocument.getElementById("tagit-menu")
      , ['tagit']);
    console.log('TagIt menu loaded');
  }

  // export function init (callback: () => void) {
  //   $.get(chromeUrlTranslator('menu.tpl.html'), function (htmlData) {
  //     $('body').children().wrapAll('<div id="tagit-body" class="tagit-body" />');
  //     $('.tagit-body').before(htmlData);
  //     window.name = '';
  //     angular.bootstrap(document.getElementById("tagit-menu"), ['tagit']);
  //     console.log('TagIt menu loaded');
  //     if(callback) callback();
  //   });

  //   function chromeUrlTranslator(relativeUrl : string) {
  //     if(typeof chrome === 'undefined' ) {
  //       return relativeUrl;
  //     } else {
  //       return chrome.extension.getURL(relativeUrl);
  //     }
  //   }
  // }
}

