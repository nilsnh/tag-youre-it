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
    listOfFramesWithContent: HTMLFrameElement[] = [];

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
      const tagitBodyIframe = <HTMLIFrameElement>parent.document.getElementById('tagit-body');
      const tagitBodyIframeDoc = tagitBodyIframe.contentDocument;

      if (tagitBodyIframeDoc.getElementsByTagName('frameset').length > 0) {
        _.map(tagitBodyIframeDoc.getElementsByTagName('frame'),
          (frame) => { this.listOfFramesWithContent.push(frame) });
      } else { }


      _.map(this.listOfFramesWithContent, (frame: HTMLIFrameElement) => {
        frame.contentDocument.addEventListener('click', (evt: Event) => {
          this.$log.debug('A click happened!');
          var documentThatWasClicked = evt.srcElement.ownerDocument;
          if (!documentThatWasClicked.hasFocus()) {
            return true;
          }
          else if (wasRemoveTagButtonClicked(evt)) {
            this.$log.debug('remove tag button was clicked');
            removeTagFromWebAndStorage(evt);
          }
          else if (documentThatWasClicked.getSelection()) {
            resetSavedSelection();
            this.savedSelection = rangy.saveSelection(documentThatWasClicked);
            callbackOnSelectFunc(
              joinLongWords(
                documentThatWasClicked.getSelection().toString()
              )
            );
          } else {
            callbackOnDeSelectFunc();
          }
        }, false);
      });

      /**
       * Remove markers to ensure a clean page before
       * adding markers for a new page.
       */
      function resetSavedSelection() {
        if (this.savedSelection) {
          rangy.removeMarkers(this.savedSelection);
        }
      }

      function joinLongWords(possiblyLongWord: string) {
        return possiblyLongWord.trim().split(" ").join("_");
      }
      function wasRemoveTagButtonClicked(evt: any) {
        return evt.target.className === 'js-tagit-remove-tag';
      }
      function removeTagFromWebAndStorage(evt: any) {
        var theOriginalTextNode = evt.target.previousSibling;
        var theSurroundingSpanElement = evt.target.parentElement;
        theSurroundingSpanElement.parentNode
          .replaceChild(theOriginalTextNode, theSurroundingSpanElement);
        
        //need to remove tag 
        var elementClicked = <HTMLElement>evt.target;
        this.tagStorageService.deleteTagById(elementClicked.parentElement.id);
      }
    }

    findSelectedText(evt: Event) {
      var selectedText = evt.srcElement.ownerDocument.getSelection().toString();
      if (selectedText) {
        this.$log.debug('text that was selected: ' + selectedText);
        return selectedText;
      } else {
        return;
      }
    }

    /**
     * Will loop through all content iframes and empty them for
     * tags added by us. This is because we need to position a 
     * new tag in relation to a clean DOM.  
     * */
    removeAllTagsFromPage(callback: () => void) {
      //loop that will keep asking for spans to remove
      //until they are all gone.
      const done = _.after(this.listOfFramesWithContent.length, callback);

      _.map(this.listOfFramesWithContent, (iframe) => {
        removeTagsFromIframe(iframe, done);
      });

      function removeTagsFromIframe(iframe: any, callback: () => void) {
        while (iframe.getElementsByClassName('tagit-tag').length > 0) {
          var spanElement = this.iframeDocument.getElementsByClassName('tagit-tag')[0];
          var spanElementParent = spanElement.parentNode;
          spanElementParent.replaceChild(
            spanElement.firstChild,
            spanElement);
          spanElementParent.normalize();
        }
        callback();
      }
    }

    readdTagsToPage(tagsToLoad: ISenseTag[]) {
      this.$log.debug('readdTagsToPage()');
      
      //first deselect all places before we go to work
      this.removeAllRanges();

      //deserialize ranges, remove the ones that fail.
      tagsToLoad = _.filter(tagsToLoad, (tagToLoad) => {
        try {
          tagToLoad.deserializedRange = rangy.deserializeRange(
            tagToLoad.serializedSelectionRange,
            this.listOfFramesWithContent[tagToLoad.iframeIndex].ownerDocument,
            this.listOfFramesWithContent[tagToLoad.iframeIndex]
          );
          return true;
        } catch (e) {
          var errorMsg = `Error in rangy.js: Was not able to deserialize range.
            In other words: The page might have changed. Is not able
            to determine where this tag should have been placed.`
          this.$log.debug(errorMsg);
          this.$log.debug("Couldn't load: " + tagToLoad.sense.word);
          this.$log.debug(e);
          return false;
        }
      })

      this.$log.debug('finished deserializing tags');

      //sort tags by ascending so that they can be properly inserted
      tagsToLoad = _.sortBy(tagsToLoad, (tag: ISenseTag) => {
        return tag.deserializedRange.startOffset;
      });

      this.$log.debug('finished sorting tags');

      _.map(tagsToLoad, (tag: ISenseTag) => {
        if (tag.deserializedRange) {
          this.surroundRangeWithSpan(
            this.listOfFramesWithContent[tag.iframeIndex].ownerDocument,
            tag.sense,
            tag.deserializedRange,
            tag.id);
        }
      });

      this.$log.debug('finished adding tags to page');
      this.removeAllRanges();
    }

    initializeNewTag = (sense: ISense): ISenseTag => {
      this.$log.debug('initializeNewTag');
      
      /**
       * first eliminate all selections to avoid confusion
       * with other iframes.
       */
      this.removeAllRanges();
      var selection: Selection = rangy.restoreSelection(this.savedSelection);

      var range: Range = selection.getRangeAt(0);
      var serializedRange = rangy.serializeRange(range, true, selection.anchorNode.ownerDocument);
      var generatedUuid: string = uuid.v4();
      var parentElement = <HTMLElement>range.commonAncestorContainer;

      return {
        id: generatedUuid,
        userEmail: 'testEmail',
        sense: sense,
        wordThatWasTagged: selection.toString(),
        iframeIndex: getIframeIndex(this.listOfFramesWithContent, selection),
        context: parentElement.innerText,
        serializedSelectionRange: serializedRange
      }

      /**
       * Some pages might have many frames with content. Thus we
       * need to loop through them, identify which document contains the current
       * selection and then save its index in our list.
       */
      function getIframeIndex(iframeList: HTMLIFrameElement[], selection: Selection) {
        for (var i = 0; i < iframeList.length; i++) {
          var iframe = iframeList[i];
          if (iframe.ownerDocument === selection.anchorNode.ownerDocument) {
            return i;
          }
        }
        return 0;
      }
    };

    private removeAllRanges = () => {
      _.map(this.listOfFramesWithContent, (iframe) => {
        iframe.contentDocument.getSelection().removeAllRanges();
      });
    }

    private surroundRangeWithSpan(documentToManipulate: HTMLDocument, sense: ISense, range: Range, uuid: string) {
      
      // add span around content
      var span: HTMLSpanElement = documentToManipulate.createElement('span');
      span.id = uuid;
      span.title = sense.explanation;
      span.className = 'tagit-tag';

      range.surroundContents(span);

      // add a button for removing the tag.
      var btn = documentToManipulate.createElement("BUTTON");
      btn.className = 'js-tagit-remove-tag';
      btn.appendChild(documentToManipulate.createTextNode("X"));
      span.appendChild(btn);
    }
  }
}
