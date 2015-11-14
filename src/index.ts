/// <reference path="../typings/tsd.d.ts" />

import { BackendService } from './services/backend.service';
import { SelectedWordService } from './services/selectedWord.service';
import { MenuCtrl } from './menu/menu.controller';

export function init (callback: () => void) {
  var $ = jQuery;

  angular.module('tagit', [])
    .service('BackendService', BackendService)
    .service('SelectedWordService', SelectedWordService)
    .controller('MenuCtrl', MenuCtrl);

  $.get('menu.tpl.html', function (htmlData) {
    $('body').children().wrapAll('<div id="tagit-body" class="tagit-body" />');
    $('.tagit-body').before(htmlData);
    window.name = '';

    angular.element(document).ready(function () {
      angular.bootstrap(document.getElementById("tagit-menu"), ['tagit']);
      console.log('TagIt menu loaded');
    });

    if(callback) callback();
  });

  // function chromeUrlTranslator(relativeUrl : string) {
  //   if(chrome && chrome.extension) {
  //     return chrome.extension.getURL(relativeUrl);
  //     } else {
  //       relativeUrl;
  //     }
  // }
}

