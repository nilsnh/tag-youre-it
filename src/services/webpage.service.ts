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
    iframeDocument: Document;
    iframeWindow: Window;

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
      var iframe = <HTMLIFrameElement>parent.document.getElementById('tagit-body');
      this.iframeDocument = iframe.contentDocument;
      this.iframeWindow = iframe.contentWindow;
      this.iframeDocument.addEventListener('click', (evt: any) => {
        if (!this.iframeDocument.hasFocus()) {
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
        return possiblyLongWord.trim().split(" ").join("_");
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
      var selectedText = this.iframeDocument.getSelection().toString();
      if (selectedText) {
        this.$log.debug('text that was selected: ' + selectedText);
        return selectedText;
      } else {
        return;
      }
    }

    removeAllTagsFromPage(callback: () => void) {
      //loop that will keep asking for spans to remove
      //until they are all gone.
      while (this.iframeDocument.getElementsByClassName('tagit-tag').length > 0) {
        var spanElement = this.iframeDocument.getElementsByClassName('tagit-tag')[0];
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
      this.iframeDocument.getSelection().removeAllRanges();

      //deserialize ranges
      _.map(tagsToLoad, (tagToLoad) => {
        try {
          tagToLoad.deserializedRange = rangy.deserializeRange(
            tagToLoad.serializedSelectionRange,
            this.iframeDocument.documentElement,
            this.iframeWindow
          );
        } catch (e) {
          var errorMsg = `Error in rangy.js: Was not able to deserialize range.
            In other words: The page might have changed. Is not able
            to determine where this tag should have been placed.`
          this.$log.debug(errorMsg);
          this.$log.debug("Couldn't load: " + tagToLoad.sense.word);
          this.$log.debug(e);
        }
      });

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
      this.iframeDocument.getSelection().removeAllRanges();
    }

    initializeNewTag = (sense: ISense): ISenseTag => {
      this.$log.debug('initializeNewTag');
      rangy.restoreSelection(this.savedSelection);

      var range: Range = rangy.getSelection(this.iframeDocument).getRangeAt(0);
      var serializedRange = rangy.serializeRange(range, true, this.iframeDocument.documentElement);
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

    private updateSavedSelection() {
      if (this.savedSelection) {
        rangy.removeMarkers(this.savedSelection);
      }
      this.savedSelection = rangy.saveSelection(this.iframeWindow);
    }

    private surroundRangeWithSpan(sense: ISense, range: Range, uuid: string) {
      
      // add span around content
      var span: HTMLSpanElement = this.iframeDocument.createElement('span');
      span.id = uuid;
      span.title = sense.explanation;
      span.className = 'tagit-tag';

      range.surroundContents(span);

      // add a button for removing the tag.
      var btn = this.iframeDocument.createElement("BUTTON");
      btn.className = 'js-tagit-remove-tag';
      btn.appendChild(this.iframeDocument.createTextNode("X"));
      span.appendChild(btn);
    }
  }
}
