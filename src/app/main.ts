
console.log('Trying to load TagIt menu');

import {
  BackendService,
  WebPageService,
  TagStorageService,
  FileService} from './services/index';
import {AppConfigInitializer, AppConfigService} from "./index.appConfig";
import {MenuCtrl} from './menu/menu.controller';
import {preparePage} from './pageRebuilder';
import angular from 'angular';
import 'rangy';
import 'uuid';
import 'ngstorage';

console.log('Finished importing');

if (!window.tagitTestMode) {
  preparePage(loadAngular);
} 
else {
  loadAngular();
}

function loadAngular() {
  angular.module('tagit', ['ngStorage'])
    .config(AppConfigInitializer)
    .service('AppConfigService', AppConfigService)
    .service('BackendService', BackendService)
    .service('WebPageService', WebPageService)
    .service('TagStorageService', TagStorageService)
    .service('FileService', FileService)
    .controller('MenuCtrl', MenuCtrl)
    .controller('TestCtrl', function () {
      var vm = this;
      vm.test = 'hello world';
      vm.alert = function () {
        alert('test alert');
      }
    });

  angular.bootstrap(
    (<HTMLIFrameElement>document.getElementById("tagit-iframe"))
    .contentDocument.getElementById('tagit-menu'), 
    ['tagit']);
  
  setupChromeListener()

  console.log('TagIt menu loaded');
}

/**
 * Enable this script that is loaded
 * on the page to receive messages from the plugin code
 * running in the background. 
 */
function setupChromeListener() {
  if (typeof chrome === 'undefined') return; //do nothing

  chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
      console.log(sender.tab ?
        "from a content script:" + sender.tab.url :
        "from the extension");
      if (request === 'isMenuOpen') {
        sendResponse(true);
      }
    }
  );
}
