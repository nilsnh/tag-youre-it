/// <reference path="../typings/tsd.d.ts" />

import $ = require('jquery');
import angular = require('angular');
import MenuCtrl = require('./menu/menu.controller');
import DataService = require('./data/data.service');

angular.module('tagIt', [])
  .factory('DataService', DataService)
  .controller('MenuCtrl', MenuCtrl);

function initAngular () {
  $.get('menu/menu.tpl.html', function (htmlData) {
    $('body').children().wrapAll('<div class="tagit-body" />');
    $('.tagit-body').before(htmlData);
    angular.bootstrap(
      document.getElementById("tagit-menu"),
      ['tagIt']
      );
  });
}

initAngular();