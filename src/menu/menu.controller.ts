/// <reference path="../index.ts" />

module tagIt {
  'use strict';
  
  export class MenuCtrl {

    selectedWord = "";
    senses: Object[];
    backendService: BackendService;
    webPageService: WebPageService;
    tagStorageService: TagStorageService;
    fileService: FileService;
    $log: ng.ILogService;
    $scope: ng.IScope;

    /* @ngInject */
    constructor($scope: IVMScope, $log: angular.ILogService,
      BackendService: BackendService,
      WebPageService: WebPageService,
      TagStorageService: TagStorageService,
      FileService: FileService) {
      $scope.vm = this;
      this.$log = $log;
      this.$scope = $scope;
      this.backendService = BackendService;
      this.webPageService = WebPageService;
      this.tagStorageService = TagStorageService;
      this.fileService = FileService;

      this.$scope.$on('wordWasSelected', (event, selectedWord) => {
        this.$log.debug(`Menucontroller received wordWasSelected event for: ${selectedWord}`);
        this.onWordSelectedEvent(selectedWord);
      });

      this.$scope.$on('wordWasSelected', (event, selectedWord) => {
        this.$log.debug('a word was selected' + selectedWord);
        this.onWordSelectedEvent(selectedWord);
      });

      // Reload existing tags
      var tagsToLoad = this.tagStorageService.loadTagsForCurrentPage();

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
        
        // deactivate backendService for now.
        // this.backendService.sendTaggedDataToServer(senseTag);

        //re-add tags, with new tag. Clear menu options.
        this.webPageService.readdTagsToPage(
          this.tagStorageService.loadTagsForCurrentPage()
        );
        this.clearMenuVariables();
      });
    }
    
    /**
     * Enables a clickable button to download tags as a json file.
     */
    downloadTagsForPage() {
        if (typeof chrome === 'undefined') {
          this.$log.debug('Did not find chrome facilities. Can\'t download.')
          return; //do nothing  
        }
        this.fileService.saveFile(this.tagStorageService.loadTagsForCurrentPage());
    }
    
    downloadAllTagsForDomain() {
        if (typeof chrome === 'undefined') {
          this.$log.debug('Did not find chrome facilities. Can\'t download.')
          return; //do nothing  
        }
        this.fileService.saveFile(this.tagStorageService.loadAllTagsInLocalStorage());
    }
    
    /**
     * Enables clickable link for removing tags. 
     */
    removeTagsFromLocalStorage() {
        if (confirm('Really delete tags from the current page?')) {
            this.webPageService.removeAllTagsFromPage(() => {
                this.tagStorageService.deleteTagsFromCurrentPage()
            })
        }
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
            this.senses = synsets.data.senses;
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

  }
}
