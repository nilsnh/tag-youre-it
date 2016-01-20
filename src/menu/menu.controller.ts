/// <reference path="../index.ts" />

module tagIt {
  'use strict';

  export class MenuCtrl {

    selectedWord = "";
    senses: Object[];
    backendService: BackendService;
    webPageService: WebPageService;
    tagStorageService: TagStorageService;
    $log: ng.ILogService;
    $scope: ng.IScope;

    /* @ngInject */
    constructor($scope: IVMScope, $log: angular.ILogService,
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
      var tagsToLoad = this.tagStorageService.loadTags();

      this.$log.debug('these tags were found in storage');
      this.$log.debug(tagsToLoad);

      this.webPageService.readdTagsToPage(tagsToLoad);
    }

    onSenseSelect(sense: ISense) {
      //remove all tags so that new tag range is serialized
      //based on a document without any highlights
      this.webPageService.removeAllTagsFromPage(() => {
        //initialize and save the new tag
        var senseTag = this.webPageService.initializeNewTag(sense);
        this.tagStorageService.saveTag(senseTag);
        this.backendService.sendTaggedDataToServer(senseTag);

        //re-add tags, with new tag. Clear menu options.
        this.webPageService.readdTagsToPage(
          this.tagStorageService.loadTags()
        );
        this.clearMenuVariables();
      });
    }

    onWordSelected = (newWord: string) => {
      function countWords(wordWithUnderscores: string) {
        return wordWithUnderscores.split("_").length;
      }

      if (countWords(newWord) > 2) {
        this.selectedWord = "Wops! Plugin can't handle more than two words.";
        this.senses = [];
      } 
      else if (newWord.length === 0) {
        this.clearMenuVariables();
      } 
      else {
        this.selectedWord = newWord;
        this.backendService.callServer(newWord)
          .then((synsets: Object) => {
            this.$log.debug(synsets);
            this.senses = this.backendService.processSynsets(<ISynset>synsets);
          });
      }
      
      //call for a digest because clicklistener that triggers this
      //function is unknown to Angular. 
      this.$scope.$apply(); 
    }

    onWordDeSelected = () => {
      this.$log.debug("onWordDeSelected");
      this.clearMenuVariables()
      // since the click did not originate from
      // an ng-click or the like we need to
      // do an explicit view refresh
      this.$scope.$digest;
    }

    clearMenuVariables() {
      this.selectedWord = "";
      this.senses = [];
    }

    deleteTags() {
      this.tagStorageService.deleteTags();
      location.reload();
    }

  }
}
