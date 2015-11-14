'use strict';

module tagIt {
  /**
   * Takes care of figuring out what word
   * is selected.
   */
  export class WebPageService {

    $log : ng.ILogService;
    // when clicking the menu to select a synset
    // we need to remember what the currently selected word was
    currentSelectionRange : any;
    tagStorageService: TagStorageService;

    /* @ngInject */
    constructor($log: ng.ILogService, TagStorageService: TagStorageService) {
      this.$log = $log;
      this.tagStorageService = TagStorageService;
    }

    wireUpListener (callbackOnSelectFunc : (result : Object) => void,
        callbackOnDeSelectFunc : () => void) {
      var that = this;
      document.getElementById('tagit-body')
      .addEventListener('click', (evt : any) => {
        if (!document.hasFocus()) {
          return true;
        }
        // call callbackOnSelectFunc if there was a word selected
        if(this.findSelectedText()) {
          this.currentSelectionRange = this.getClonedSelectionRange();
          callbackOnSelectFunc(joinLongWords(this.findSelectedText()));
        // call callbackOnDeSelectFunc if there was a word selected
        } else {
          callbackOnDeSelectFunc();
        }
      }, false);
      function joinLongWords (possiblyLongWord: string) {
        return possiblyLongWord.replace(" ","_");
      }
    }

    getClonedSelectionRange () {
      return this.findSelection().getRangeAt(0).cloneRange();
    }

    findSelection () {
      return window.getSelection();
    }

    findSelectedText () {
      var selectedText = this.findSelection().toString();
      if (selectedText) {
        this.$log.debug('text that was selected: ' + selectedText);
        return selectedText;
      } else {
        return;
      }
    }

    // place spans around a tagged word.
    addNewTagToPage = (sense : ISense) : ISenseTag => {
      this.$log.debug('addNewTagToPage');
      var range = this.currentSelectionRange;
      var serializedRange = angular.toJson(range);
      this.surroundRangeWithSpan(sense, range);
      return {
        userEmail: 'testEmail',
        sense: sense,
        context: range.commonAncestorContainer.innerText,
        serializedSelectionRange: serializedRange
      }
    };

    readdTagsToPage (tagsToLoad: ISenseTag[]) {
      this.$log.debug('readdTagsToPage()');
      angular.forEach(tagsToLoad, function (tag, key) {
        this.readdTagToPage(tag);
      }, this);
    }

    private readdTagToPage (tagToLoad: ISenseTag) {
      this.$log.debug('addNewTagToPage');
      var savedRange : Range = angular.fromJson(tagToLoad.serializedSelectionRange);
      var selection = window.getSelection();

      //remove any present selections
      selection.removeAllRanges();

      debugger;

      //select text on page
      var rangeToLoad = document.createRange();
      rangeToLoad.setStart(savedRange.startContainer, savedRange.startOffset)
      rangeToLoad.setEnd(savedRange.endContainer, savedRange.endOffset);
      selection.addRange(rangeToLoad);

      //tag that text with a span
      this.surroundRangeWithSpan(tagToLoad.sense,
        selection.getRangeAt(0).cloneRange());
    }

    private surroundRangeWithSpan (sense: ISense, range: Range) {
      var windowSelection = window.getSelection();
      var span : HTMLSpanElement = document.createElement('span');
      span.id = sense.senseid;
      span.title = sense.explanation;
      span.className = 'tagit-tag';
      range.surroundContents(span);
      windowSelection.removeAllRanges();
    }

  }
}
