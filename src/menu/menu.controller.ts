/// <reference path="../index.ts" />

module tagIt {
  'use strict';

  export class MenuCtrl {

    selectedWord = "";
    senses : Object[];
    backendService : BackendService;
    webPageService : WebPageService;
    $log : ng.ILogService;
    $scope: ng.IScope;

    /* @ngInject */
    constructor ($scope: IVMScope, $log: angular.ILogService,
      BackendService: BackendService,
      WebPageService: WebPageService) {
      $scope.vm = this;
      this.$log = $log;
      this.$scope = $scope;
      this.backendService = BackendService;
      this.webPageService = WebPageService;

      // Wire up clicklistener
      this.webPageService.wireUpListener(this.onWordSelected,
        this.onWordDeSelected);
    }

    onTagSelect (sense: ISense) {
      this.webPageService.addTagToPage(sense);
      this.clearMenuVariables();
      this.backendService.storeTaggingInformation({});
    }

    onWordSelected = (newWord : string) => {
      this.selectedWord = newWord;
      this.backendService.callServer(newWord)
        .then((synsets : Object) => {
          this.$log.debug(synsets);
          this.senses = this.backendService.processSynsets(<ISynset> synsets);
        });
    }

    onWordDeSelected = () => {
      this.$log.debug("onWordDeSelected");
      this.clearMenuVariables()
      // since the click did not originate from
      // an ng-click or the like we need to
      // do an explicit view refresh
      this.$scope.$apply();
    }

    clearMenuVariables = () {
      this.selectedWord = "";
      this.senses = [];
    }

    selectWord (sense : ISense) {
      this.backendService.storeTaggingInformation({
        mail: "mail@nilsnh.no",
        sentence: "whole sentence",
        senseid: sense.senseid,
      });
    }

    removeMenu() {
      $('.tagit-body').children().unwrap();
      $('.tagit-menu').remove();
    }

  }
}
