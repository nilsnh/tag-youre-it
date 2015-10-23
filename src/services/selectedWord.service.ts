'use strict';

module tagIt {
  /**
   * Takes care of figuring out what word
   * is selected.
   */
  export class SelectedWordService {

    $log : ng.ILogService;

    static $inject = ["$log"];
    constructor($log: ng.ILogService) {
      this.$log = $log;
    }

    wireUpListener (callbackOnSelectFunc : (result : Object) => void,
        callbackOnDeSelectFunc : () => void) {
      var that = this;
      document.addEventListener('click', (evt : any) => {
        if (!document.hasFocus()) {
          return true;
        }
        var selectedWord = that.findSelection();
        if(selectedWord) {
           callbackOnSelectFunc(joinLongWords(selectedWord));
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

    private findSelection () {
      var focused : any = document.activeElement;
      var selectedText : string;
      if (focused) {
        try {
          selectedText = focused.value.substring(
            focused.selectionStart, focused.selectionEnd);
        } catch (err) {
        }
      }
      if (selectedText == undefined) {
        var sel = window.getSelection();
        var selectedText = sel.toString();
      }
      if (selectedText) {
        this.$log.debug('text that was selected: ' + selectedText);
        return selectedText;
      } else {
        return;
      }
    }
  }
}
