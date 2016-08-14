
'use strict';

import {
  BackendService,
  WebPageService,
  TagStorageService,
  FileService,
  SettingsService} from '../services/index';

import {IVMScope, ISense} from '../index.interfaces';

export class MenuCtrl {

  selectedWord = "";
  senses: Object[];

  constructor(
    private $scope: IVMScope, 
    private $log: angular.ILogService,
    private BackendService: BackendService,
    private WebPageService: WebPageService,
    private TagStorageService: TagStorageService,
    private SettingsService: SettingsService,
    private FileService: FileService) {
    
    $scope.vm = this;

    this.$scope.$on('wordWasSelected', (event, selectedWord) => {
      this.$log.debug(`Menucontroller received wordWasSelected event for: ${selectedWord}`);
      this.onWordSelectedEvent(selectedWord);
    });

    // Reload existing tags
    var tagsToLoad = this.TagStorageService.loadTagsForCurrentPage();

    this.$log.debug('these tags were found in storage');
    this.$log.debug(tagsToLoad);

    this.WebPageService.readdTagsToPage(tagsToLoad);
  }

  /**
   * Fired when user selects a sense amongst the senses
   * returned from the backend.
   */
  onSenseSelect(sense: ISense) {
    //remove all tags so that new tag range is serialized
    //based on a document without any highlights
    this.WebPageService.removeAllTagsFromPage(() => {
      //initialize and save the new tag
      var senseTag = this.WebPageService.initializeNewTag(sense);
      this.TagStorageService.saveTag(senseTag);

      // deactivate BackendService for now.
      this.BackendService.sendTaggedDataToServer(senseTag);

      //re-add tags, with new tag. Clear menu options.
      this.WebPageService.readdTagsToPage(
        this.TagStorageService.loadTagsForCurrentPage()
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
    this.FileService.saveFile(this.TagStorageService.loadTagsForCurrentPage());
  }

  downloadAllTagsForDomain() {
    if (typeof chrome === 'undefined') {
      this.$log.debug('Did not find chrome facilities. Can\'t download.')
      return; //do nothing
    }
    this.FileService.saveFile(this.TagStorageService.loadAllTagsInLocalStorage());
  }

  /**
   * Enables clickable link for removing tags.
   */
  removeTagsFromLocalStorage() {
    if (confirm('Really delete tags from the current page?')) {
      this.WebPageService.removeAllTagsFromPage(() => {
        this.TagStorageService.deleteTagsFromCurrentPage()
      })
    }
  }

  onWordSelectedEvent = (newWord: string) => {
    if (countWords(newWord) > 2) {
      this.selectedWord = "Wops! Plugin can't handle more than two words."
      this.senses = []
    }
    else if (newWord.length === 0) {
      this.clearMenuVariables();
    }
    else {
      this.selectedWord = newWord;
      this.senses = []
      this.BackendService.callServer(newWord)
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

  isLoadingSenses() {
    // if senses var has initialized, we check length to see if they've been loaded. 
    return this.senses && this.senses.length == 0 && this.selectedWord
  }

  /**
   * In order to hide the menu before angular has loaded I 
   * explicitly set display: none; on the div. 
   * 
   * Thus to override that after user has logged in 
   * we use the ng-style attribute in combination with 
   * this function below.
   */
  isUserLoggedIn() {
    if (!this.SettingsService.isUserLoggedIn()) return null;
    else return {display: 'block'};  
  }

  doLogin() {
    this.$log.debug('doLogin()')
    if (window.tagitTestMode || typeof chrome === 'undefined') return; //do nothing
    chrome.runtime.sendMessage({command: 'loginAndRequestUserInfo'})
  }

  continueWithoutLoggingIn() {
    this.$log.debug('continueWithoutLoggingIn()')
    this.SettingsService.setLoggedIn(true);
  }

}
