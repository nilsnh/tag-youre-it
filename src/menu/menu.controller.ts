/// <reference path="../index.ts" />

module tagIt {
  'use strict';

  export class MenuCtrl {

    selectedWord = "";
    senses : Object[];
    backendService : BackendService;
    selectedWordService : WebPageService;
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
      this.selectedWordService = WebPageService;

      // Wire up clicklistener
      this.selectedWordService.wireUpListener(this.onWordSelected,
        this.onWordDeSelected);
    }

    onTagSelect (sense: ISense) {
      this.selectedWordService.addTagToPage(sense);
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
      this.selectedWord = "";
      this.senses = [];
      this.$scope.$apply();
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
