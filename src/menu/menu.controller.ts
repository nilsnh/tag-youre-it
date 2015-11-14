/// <reference path="../index.ts" />

module tagIt {
  'use strict';

  export class MenuCtrl {

    selectedWord = "";
    senses : Object[];
    dataService : DataService;
    selectedWordService : SelectedWordService;
    $log : ng.ILogService;
    $scope: ng.IScope;

    /* @ngInject */
    constructor ($scope: IVMScope, $log: angular.ILogService,
      DataService: DataService,
      SelectedWordService: SelectedWordService) {
      $scope.vm = this;
      this.$log = $log;
      this.$scope = $scope;
      this.dataService = DataService;
      this.selectedWordService = SelectedWordService;

      // Wire up clicklistener
      this.selectedWordService.wireUpListener(this.onWordSelected,
        this.onWordDeSelected);
    }

    onTagSelect (sense: ISense) {
      this.selectedWordService.addTagToPage(sense);
      this.dataService.storeTaggingInformation({});
    }

    onWordSelected = (newWord : string) => {
      this.selectedWord = newWord;
      this.dataService.callServer(newWord)
        .then((synsets : Object) => {
          this.$log.debug(synsets);
          this.senses = this.dataService.processSynsets(<ISynset> synsets);
        });
    }

    onWordDeSelected = () => {
      this.$log.debug("onWordDeSelected");
      this.selectedWord = "";
      this.senses = [];
      this.$scope.$apply();
    }

    selectWord (sense : ISense) {
      this.dataService.storeTaggingInformation({
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
