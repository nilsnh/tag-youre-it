/// <reference path="../typings/tsd.d.ts" />

/// <reference path="menu/menu.controller.ts" />
/// <reference path="services/data.service.ts" />
/// <reference path="services/selectedWord.service.ts" />

module tagIt {

  declare var chrome : any;

  angular.module('tagit', [])
    .service('DataService', DataService)
    .service('SelectedWordService', SelectedWordService)
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
      if(chrome) {
        return chrome.extension.getURL(relativeUrl);
      } else {
        relativeUrl;
      }
    }
  }
}

