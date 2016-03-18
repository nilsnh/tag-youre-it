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

      this.$scope.$on('wordWasSelected', (event, selectedWord) => {
        this.$log.debug(`Menucontroller received wordWasSelected event for: ${selectedWord}`);
        this.onWordSelectedEvent(selectedWord);
      });

      this.$scope.$on('wordWasSelected', (event, selectedWord) => {
        this.$log.debug('a word was selected' + selectedWord);
        this.onWordSelectedEvent(selectedWord);
      });

      // Reload existing tags
      var tagsToLoad = this.tagStorageService.loadTags();

      this.$log.debug('these tags were found in storage');
      this.$log.debug(tagsToLoad);

      this.webPageService.readdTagsToPage(tagsToLoad);
    }

    /**
     * Fired when user selects a sense amongst the senses
     * returned from the backend.
     */
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

    onWordSelectedEvent = (newWord: string) => {
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
          .then((synsets: any) => {
            this.$log.debug(synsets);
            this.senses = synsets.data.senses;;
          });
      }

      function countWords(wordWithUnderscores: string) {
        return wordWithUnderscores.split("_").length;
      }
    }

    onWordDeSelectedEvent = () => {
      this.$log.debug("onWordDeSelected");
      this.clearMenuVariables()
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
