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

  export function init(callback: () => void) {
    var iframe = <HTMLIFrameElement>document.getElementById("tagit-iframe")
    angular.bootstrap(iframe.contentDocument.getElementById("tagit-menu"), ['tagit']);
    console.log('TagIt menu loaded');
    setupChromeListener();
  }

  function setupChromeListener() {
    if (typeof chrome === 'undefined') return; //do nothing
    
    chrome.runtime.onMessage.addListener(
      function(request, sender, sendResponse) {
        console.log(sender.tab ?
          "from a content script:" + sender.tab.url :
          "from the extension");
        if (request.greeting == "hello") {
          sendResponse({ farewell: "goodbye" });
        } else if (request === 'isMenuOpen') {
          sendResponse(true);
        }
      }
    );
  }
  
}

