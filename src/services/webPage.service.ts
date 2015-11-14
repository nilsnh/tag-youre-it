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

    /* @ngInject */
    constructor($log: ng.ILogService) {
      this.$log = $log;
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
    addTagToPage = (sense : ISense) => {
      var windowSelection = window.getSelection();
      var range = this.currentSelectionRange;
      var span : HTMLSpanElement = document.createElement('span');
      span.id = sense.senseid;
      span.title = sense.explanation;
      span.className = 'tagit-tag';
      range.surroundContents(span);
      windowSelection.removeAllRanges();
      // windowSelection.addRange(range);
      this.$log.debug('addTagToPage');
    }
  }
}
