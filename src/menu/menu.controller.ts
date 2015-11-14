/// <reference path="../index.ts" />

module tagIt {
  'use strict';

  export class MenuCtrl {

    selectedWord = "";
    senses : Object[];
    backendService : BackendService;
    webPageService : WebPageService;
    tagStorageService : TagStorageService;
    $log : ng.ILogService;
    $scope: ng.IScope;

    /* @ngInject */
    constructor ($scope: IVMScope, $log: angular.ILogService,
      BackendService: BackendService,
      WebPageService: WebPageService,
      TagStorageService: TagStorageService) {
      $scope.vm = this;
      this.$log = $log;
      this.$scope = $scope;
      this.backendService = BackendService;
      this.webPageService = WebPageService;
      this.tagStorageService = TagStorageService;

      // Wire up clicklistener
      this.webPageService.wireUpListener(
        this.onWordSelected,
        this.onWordDeSelected
      );

      // Reload existing tags
      // var tagsToLoad = this.tagStorageService.loadTags();

      this.$log.debug('these tags were found in storage');
      this.$log.debug(this.tagStorageService.loadTags());

      // this.webPageService.readdTagsToPage(tagsToLoad);
    }

    onSenseSelect (sense: ISense) {
      var senseTag = this.webPageService.addNewTagToPage(sense);
      this.tagStorageService.saveTag(senseTag)
      this.backendService.sendTaggedDataToServer(senseTag);
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
