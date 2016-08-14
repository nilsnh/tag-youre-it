
console.log('Trying to load TagIt menu');

import {
  BackendService,
  WebPageService,
  TagStorageService,
  FileService,
  SettingsService} from './services/index';
import {MenuCtrl} from './menu/menu.controller';
import {SettingsCtrl} from './menu/settings.controller';
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
    .service('SettingsService', SettingsService)
    .service('BackendService', BackendService)
    .service('WebPageService', WebPageService)
    .service('TagStorageService', TagStorageService)
    .service('FileService', FileService)
    .controller('SettingsCtrl', SettingsCtrl)
    .controller('MenuCtrl', MenuCtrl)

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
  if (window.tagitTestMode || typeof chrome === 'undefined') return; //do nothing

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
