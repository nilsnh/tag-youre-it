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
      this.webPageService.wireUpListener(
        this.onWordSelected,
        this.onWordDeSelected
      );
    }

    onSenseSelect (sense: ISense) {
      this.webPageService.addTagToPage(sense);
      this.backendService.sendTaggedDataToServer(
        sense,
        this.webPageService.currentSelectionRange,
        this.selectedWord,
        "useremail@example.org"
      );
      this.clearMenuVariables();
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

    clearMenuVariables () {
      this.selectedWord = "";
      this.senses = [];
    }

    removeMenu() {
      $('.tagit-body').children().unwrap();
      $('.tagit-menu').remove();
    }

  }
}
