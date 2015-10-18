'use strict';

/**
 * Takes care of figuring out what word
 * is selected.
 */
class SelectedWordService {

  currentlySelectedWord: string
  $log : ng.ILogService

  static $inject = ["$log"];
  constructor($log: ng.ILogService) {
    this.$log = $log;
  }

  processSelection () {
    // var focused : any = document.activeElement;
    // var selectedText : string;
    // if (focused) {
    //   try {
    //     selectedText = focused.value.substring(
    //       focused.selectionStart, focused.selectionEnd);
    //   } catch (err) {
    //   }
    // }
    // if (selectedText == undefined) {
    //   var sel = window.getSelection();
    //   var selectedText = sel.toString();
    // }
    // if (selectedText) {
    //   this.currentlySelectedWord = selectedText;
    //   this.$log.debug('text that was selected: ' + selectedText);
    // }
  }

  init () {
    // document.addEventListener('click', function(evt) {
    //   if (!document.hasFocus()) {
    //     return true;
    //   }
    //   this.processSelection();
    //   // clicks should propagate upwards to other things
    //   // evt.stopPropagation();
    //   // evt.preventDefault();
    // }, false);
  }
}

export = SelectedWordService;
