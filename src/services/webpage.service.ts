'use strict';

module tagIt {
  /**
   * Takes care of figuring out what word
   * is selected.
   */

  declare var rangy: any;
  declare var uuid: any;

  export class WebPageService {

    $log: ng.ILogService;
    // when clicking the menu to select a synset
    // we need to remember what the currently selected word was
    currentSelectionRange: any;
    tagStorageService: TagStorageService;

    /* @ngInject */
    constructor($log: ng.ILogService, TagStorageService: TagStorageService) {
      this.$log = $log;
      this.tagStorageService = TagStorageService;
    }

    wireUpListener(callbackOnSelectFunc: (result: Object) => void,
      callbackOnDeSelectFunc: () => void) {
      var that = this;
      document.getElementById('tagit-body')
        .addEventListener('click', (evt: any) => {
          if (!document.hasFocus()) {
            return true;
          }
          else if (wasRemoveTagButtonClicked(evt)) {
            this.$log.debug('remove tag button was clicked');
            removeTagFromWebpage(evt);
            this.tagStorageService.deleteTagById(evt.target.parentElement.id);
          }
          else if (this.findSelectedText()) {
            this.currentSelectionRange = this.getClonedSelectionRange();
            callbackOnSelectFunc(joinLongWords(this.findSelectedText()));
          } else {
            callbackOnDeSelectFunc();
          }
        }, false);
      function joinLongWords(possiblyLongWord: string) {
        return possiblyLongWord.replace(" ", "_");
      }
      function wasRemoveTagButtonClicked(evt: any) {
        return evt.target.className === 'js-tagit-remove-tag';
      }
      function removeTagFromWebpage(evt: any) {
        var theOriginalTextNode = evt.target.previousSibling;
        var theSurroundingSpanElement = evt.target.parentElement;
        theSurroundingSpanElement.parentNode
          .replaceChild(theOriginalTextNode, theSurroundingSpanElement);
      }
    }

    getClonedSelectionRange() {
      return this.findSelection().getRangeAt(0).cloneRange();
    }

    findSelection() {
      return window.getSelection();
    }

    findSelectedText() {
      var selectedText = this.findSelection().toString();
      if (selectedText) {
        this.$log.debug('text that was selected: ' + selectedText);
        return selectedText;
      } else {
        return;
      }
    }

    // place spans around a tagged word.
    addNewTagToPage = (sense: ISense): ISenseTag => {
      this.$log.debug('addNewTagToPage');
      var range = this.currentSelectionRange;
      var serializedRange = rangy.serializeRange(
        range, false, document.getElementById('tagit-body'));
      var generatedUuid: string = uuid.v4();
      this.surroundRangeWithSpan(sense, range, generatedUuid);

      return {
        id: generatedUuid,
        userEmail: 'testEmail',
        sense: sense,
        context: range.commonAncestorContainer.innerText,
        serializedSelectionRange: serializedRange
      }
    };

    readdTagsToPage(tagsToLoad: ISenseTag[]) {
      this.$log.debug('readdTagsToPage()');
      
      //first deselect before we go to work
      window.getSelection().removeAllRanges();

      var tag: ISenseTag;
      for (var i = 0; i < tagsToLoad.length; i++) {
        tag = tagsToLoad[i];
        tag.deSerializedSelectionRange = deserializeRange(tag);
        if (tag.deSerializedSelectionRange) {
          this.surroundRangeWithSpan(tag.sense,
            tag.deSerializedSelectionRange, tag.id);
        }
      }

      window.getSelection().removeAllRanges();
      
      // deserializes previously saved selection
      // and connects it to the active page 
      function deserializeRange(tagToLoad: ISenseTag) {
        var savedRange: Range = undefined
        var selection = window.getSelection();
        try {
          savedRange = rangy.deserializeRange(
            tagToLoad.serializedSelectionRange,
            document.getElementById('tagit-body'));
        } catch (e) {
          var errorMsg = `Error in rangy.js: Was not able to deserialize range.
            In other words: The page might have changed. Is not able
            to determine where this tag should have been placed.`
          console.log(errorMsg);
          console.log(e);
          return;
        }
        //select text on page
        var deserializedRange = document.createRange();
        deserializedRange.setStart(savedRange.startContainer, savedRange.startOffset)
        deserializedRange.setEnd(savedRange.endContainer, savedRange.endOffset);
        return deserializedRange;
      }
    }

    private readdTagToPage(tagToLoad: ISenseTag) {
      this.$log.debug('addNewTagToPage');
      var savedRange: Range = undefined
      var selection = window.getSelection();
      try {
        savedRange = rangy.deserializeRange(
          tagToLoad.serializedSelectionRange,
          document.getElementById('tagit-body'));
      } catch (e) {
        this.$log.error('Error in rangy.js: Was not able to deserialize range.');
        this.$log.error('In other words: The page might have changed. Is not able ');
        this.$log.error('to determine where this tag should have been placed.');
        this.$log.error(e);
      }

      //remove any present selections
      selection.removeAllRanges();

      //select text on page
      var rangeToLoad = document.createRange();
      rangeToLoad.setStart(savedRange.startContainer, savedRange.startOffset)
      rangeToLoad.setEnd(savedRange.endContainer, savedRange.endOffset);
      selection.addRange(rangeToLoad);

      //tag that text with a span and a remove button.
      this.surroundRangeWithSpan(tagToLoad.sense,
        selection.getRangeAt(0).cloneRange(), tagToLoad.id);
    }

    private surroundRangeWithSpan(sense: ISense, range: Range, uuid: string) {
      // add span around content
      var span: HTMLSpanElement = document.createElement('span');
      span.id = uuid;
      span.title = sense.explanation;
      span.className = 'tagit-tag';
      range.surroundContents(span);

      // add a button for removing the tag.
      var btn = document.createElement("BUTTON");
      btn.className = 'js-tagit-remove-tag';
      btn.appendChild(document.createTextNode("X"));
      span.appendChild(btn);

      //unselect everything
      // window.getSelection()
      // .removeAllRanges();
    }

  }
}
