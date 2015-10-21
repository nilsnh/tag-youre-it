/// <reference path="../typings/tsd.d.ts" />

/// <reference path="menu/menu.controller.ts" />
/// <reference path="services/data.service.ts" />
/// <reference path="services/selectedWord.service.ts" />

module tagIt {

  angular.module('tagit', [])
    .service('DataService', DataService)
    .service('SelectedWordService', SelectedWordService)
    .controller('MenuCtrl', MenuCtrl);

  export function init (callback: () => void) {
    var $ = jQuery;
    $.get('menu.tpl.html', function (htmlData) {
      $('body').children().wrapAll('<div class="tagit-body" />');
      $('.tagit-body').before(htmlData);
      angular.bootstrap(document.getElementById("tagit-menu"), ['tagit']);
      console.log('TagIt menu loaded');
      if(callback) callback();
    });
  }
}

