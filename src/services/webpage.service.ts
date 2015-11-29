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
    tagStorageService: TagStorageService;
    savedSelection: Object;

    /* @ngInject */
    constructor($log: ng.ILogService, TagStorageService: TagStorageService) {
      this.$log = $log;
      this.tagStorageService = TagStorageService;
      rangy.init();
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
            this.updateSavedSelection();
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
    initializeNewTag = (sense: ISense): ISenseTag => {
      this.$log.debug('addNewTagToPage');
      rangy.restoreSelection(this.savedSelection);
      rangy.removeMarkers(this.savedSelection);
      var range = rangy.getSelection().getRangeAt(0);
      var serializedRange = rangy.serializeRange(
        range, true, document.getElementById('tagit-body'));
      var generatedUuid: string = uuid.v4();
      
      // this.surroundRangeWithSpan(sense, range, generatedUuid);

      return {
        id: generatedUuid,
        userEmail: 'testEmail',
        sense: sense,
        context: range.commonAncestorContainer.innerText,
        serializedSelectionRange: serializedRange
      }
    };
    
    removeAllTagsFromPage() {
      // find all tags
      var elements = document.getElementsByClassName('tagit-tag');
      // remove them from page
      for (var i = 0; i < elements.length; i++) {
        var tagElement = elements[i];
        var tagElementParentNode = tagElement.parentNode;
        tagElementParentNode.replaceChild(
          tagElement.previousSibling,
          tagElement);
        tagElementParentNode.normalize();
      }
    }

    readdTagsToPage(tagsToLoad: ISenseTag[]) {
      this.$log.debug('readdTagsToPage()');
      
      //first deselect before we go to work
      window.getSelection().removeAllRanges();

      var selection = rangy.getSelection();

      for (var i = 0; i < tagsToLoad.length; i++) {
        var tag = tagsToLoad[i];
        tag.deSerializedSelectionRange = deserializeRange(tag);
      }
      
      this.$log.debug('finished deserializing tags');

      for (var i = 0; i < tagsToLoad.length; i++) {
        var tag = tagsToLoad[i];
        if (tag.deSerializedSelectionRange) {
          this.surroundRangeWithSpan(tag.sense,
            tag.deSerializedSelectionRange, tag.id);
        }
      }
      
      this.$log.debug('finished adding tags to page');

      window.getSelection().removeAllRanges();
      
      // deserializes previously saved selection
      // and connects it to the active page 
      function deserializeRange(tagToLoad: ISenseTag) {
        var savedRange: Range = undefined
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
    
    private updateSavedSelection() {
      if (this.savedSelection) {
        rangy.removeMarkers(this.savedSelection);
      }
      this.savedSelection = rangy.saveSelection();
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
