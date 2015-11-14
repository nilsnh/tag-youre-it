'use strict';

import { BackendService } from '../services/backend.service';
import { SelectedWordService } from '../services/selectedWord.service';
import { ISense, IVMScope, ISynset } from '../index.interfaces';

export class MenuCtrl {

  selectedWord = "";
  senses : Object[];
  backendService : BackendService;
  selectedWordService : SelectedWordService;
  $log : ng.ILogService;
  $scope: ng.IScope;

  /* @ngInject */
  constructor ($scope: IVMScope, $log: angular.ILogService,
    BackendService: BackendService,
    SelectedWordService: SelectedWordService) {
    $scope.vm = this;
    this.$log = $log;
    this.$scope = $scope;
    this.backendService = BackendService;
    this.selectedWordService = SelectedWordService;

    // Wire up clicklistener
    this.selectedWordService.wireUpListener(this.onWordSelected,
      this.onWordDeSelected);
  }

  onTagSelect (sense: ISense) {
    this.selectedWordService.addTagToPage(sense);
    this.backendService.storeTaggingInformation(
      sense, this.selectedWordService.getClonedSelectionRange());
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

  removeMenu() {
    $('.tagit-body').children().unwrap();
    $('.tagit-menu').remove();
  }

}
