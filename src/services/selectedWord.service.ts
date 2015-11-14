import { ISense } from '../index.interfaces';

'use strict';

/**
 * Takes care of figuring out what word
 * is selected.
 */
export class SelectedWordService {

  $log : ng.ILogService;
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
      if(this.getSelection()) {
        this.currentSelectionRange = this.getClonedSelectionRange();
        callbackOnSelectFunc(joinLongWords(this.getSelection().toString()));
      } else {
        callbackOnDeSelectFunc();
      }
      // clicks should propagate upwards to other things
      // evt.stopPropagation();
      // evt.preventDefault();
    }, false);
    function joinLongWords (possiblyLongWord: string) {
      return possiblyLongWord.replace(" ","_");
    }
  }

  // place spans around a tagged word.
  addTagToPage (sense : ISense) {
    function createSpan () {
      var span : HTMLSpanElement = document.createElement('span');
      span.id = sense.senseid;
      span.title = sense.explanation;
      span.className = 'tagit-tag';
      return span;
    }

    var windowSelection = window.getSelection();
    var originalRange = this.getClonedSelectionRange();
    var rangeToChange = this.getClonedSelectionRange();
    rangeToChange.surroundContents(createSpan());
    windowSelection.removeAllRanges(); // unselect from page
    this.$log.debug('addTagToPage');
  }

  public getSelection () {
    return this.findSelection();
  }

  public getClonedSelectionRange () {
    return this.findSelection().getRangeAt(0).cloneRange();
  }

  private findSelection () {
    var focused : any = document.activeElement;
    var selectedText : string;
    // try grabbing text from an input or textarea field
    // commenting this until we need to figure out tagging of editable fields
    // if (focused) {
    //   try {
    //     selectedText = focused.value.substring(
    //       focused.selectionStart, focused.selectionEnd);
    //   } catch (err) {
    //   }
    // }
    // if previous method did not work ask window for selection
    if (selectedText == undefined) {
      var currentSelection : Selection = window.getSelection();
      var selectedText = currentSelection.toString();
    }
    if (selectedText) {
      this.$log.debug('text that was selected: ' + selectedText);
      return currentSelection;
    } else {
      return;
    }
  }
}
