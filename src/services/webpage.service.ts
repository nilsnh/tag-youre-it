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

    //this allows the menu controller to bind to the service so that it may
    //notify the menu. TODO refactor to use events on $rootScope instead.
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

    findSelectedText() {
      var selectedText = window.getSelection().toString();
      if (selectedText) {
        this.$log.debug('text that was selected: ' + selectedText);
        return selectedText;
      } else {
        return;
      }
    }

    initializeNewTag = (sense: ISense): ISenseTag => {
      this.$log.debug('addNewTagToPage');
      rangy.restoreSelection(this.savedSelection);
      var range: Range = rangy.getSelection().getRangeAt(0);
      var serializedRange = rangy.serializeRange(
        range, true, document.getElementById('tagit-body'));
      var generatedUuid: string = uuid.v4();
      var parentElement = <HTMLElement>range.commonAncestorContainer;

      return {
        id: generatedUuid,
        userEmail: 'testEmail',
        sense: sense,
        wordThatWasTagged: this.findSelectedText(),
        context: parentElement.innerText,
        serializedSelectionRange: serializedRange
      }
    };

    removeAllTagsFromPage(callback: () => void) {
      //loop that will keep asking for spans to remove
      //until they are all gone.
      while (document.getElementsByClassName('tagit-tag').length > 0) {
        var spanElement = document.getElementsByClassName('tagit-tag')[0];
        var spanElementParent = spanElement.parentNode;
        spanElementParent.replaceChild(
          spanElement.firstChild,
          spanElement);
        spanElementParent.normalize();
      }
      callback();
    }

    readdTagsToPage(tagsToLoad: ISenseTag[]) {
      this.$log.debug('readdTagsToPage()');

      //first deselect before we go to work
      window.getSelection().removeAllRanges();

      //deserialize ranges
      _.map(tagsToLoad, deserializeRange);

      this.$log.debug('finished deserializing tags');

      //sort tags by ascending so that they can be properly inserted
      tagsToLoad = _.sortBy(tagsToLoad, (tag: ISenseTag) => {
        return tag.deserializedRange.startOffset;
      });

      this.$log.debug('finished sorting tags');

      _.map(tagsToLoad, (tag: ISenseTag) => {
        if (tag.deserializedRange) {
          this.surroundRangeWithSpan(tag.sense,
            tag.deserializedRange, tag.id);
        }
      });

      this.$log.debug('finished adding tags to page');

      window.getSelection().removeAllRanges();

      function deserializeRange(tagToLoad: ISenseTag) {
        try {
          tagToLoad.deserializedRange = rangy.deserializeRange(
            tagToLoad.serializedSelectionRange,
            document.getElementById('tagit-body'));
        } catch (e) {
          var errorMsg = `Error in rangy.js: Was not able to deserialize range.
            In other words: The page might have changed. Is not able
            to determine where this tag should have been placed.`
          console.log(errorMsg);
          console.log("Couldn't load: " + tagToLoad.sense.word);
          console.log(e);
        }
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
    }
  }
}
