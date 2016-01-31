'use strict';

module tagIt {

  declare var rangy: any;
  declare var uuid: any;

  /**
   * This service is responsible for interfacing with the content 
   * that we want to tag. It injects/removes tags and listens for clicks. 
   */
  export class WebPageService {

    $log: ng.ILogService;
    // when clicking the menu to select a synset
    // we need to remember what the currently selected word was
    tagStorageService: TagStorageService;
    rootScopeService: ng.IRootScopeService;
    savedSelection: Object;
    savedText: string;
    listOfFramesWithContent: (HTMLFrameElement | HTMLIFrameElement)[] = [];

    /* @ngInject */
    constructor($log: ng.ILogService, TagStorageService: TagStorageService, $rootScope: ng.IRootScopeService) {
      this.$log = $log;
      this.tagStorageService = TagStorageService;
      this.rootScopeService = $rootScope;
      this.wireUpListener();
      rangy.init();
    }

    /**
     * The click listening function placed on each of the iframes
     * we capture. We then listen for clicks and check if a word
     * was selected.
     */
    clickhandler = (evt: Event) => {
      this.$log.debug('A click happened!');
      var documentThatWasClicked = evt.srcElement.ownerDocument;
      if (!documentThatWasClicked.hasFocus()) {
        return true;
      }
      else if (wasRemoveTagButtonClicked(evt)) {
        this.$log.debug('remove tag button was clicked');
        removeTagFromWebAndStorage(evt, this.tagStorageService);
      }
      else if (documentThatWasClicked.getSelection().toString() !== '') {
        resetSavedSelection();
        this.savedSelection = rangy.saveSelection(documentThatWasClicked);
        this.savedText = joinLongWords(documentThatWasClicked.getSelection().toString());
        this.rootScopeService.$broadcast('wordWasSelected', this.savedText);
      } else {
        resetSavedSelection();
        this.savedText = '';
        this.rootScopeService.$broadcast('wordWasDeSelected', null);
      }
      
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

      function removeTagFromWebAndStorage(evt: Event, tagStorageService: TagStorageService) {
        var target = <HTMLElement>evt.target;
        var theOriginalTextNode = target.previousSibling;
        var theSurroundingSpanElement = target.parentElement;
        tagStorageService.deleteTagById(theSurroundingSpanElement.id);
        theSurroundingSpanElement.parentNode
          .replaceChild(theOriginalTextNode, theSurroundingSpanElement);
      }
    }

    /**
     * Find one or more iframes in which content has been captured.
     * We then place click listeners on each of the frames. 
     */
    wireUpListener() {
      const tagitBodyIframe = <HTMLIFrameElement>parent.document.getElementById('tagit-body');
      const tagitBodyIframeDoc = tagitBodyIframe.contentDocument;
      
      if (tagitBodyIframeDoc.getElementsByTagName('frameset').length > 0) {
        _.map(tagitBodyIframeDoc.getElementsByTagName('frame'),
          (frame) => { this.listOfFramesWithContent.push(frame) });
      } else {
        this.listOfFramesWithContent.push(tagitBodyIframe);
      }
      
      _.map(this.listOfFramesWithContent, (frame: HTMLIFrameElement) => {
        frame.contentDocument.addEventListener('click', this.clickhandler, false);
      });
    }

    /**
     * Will loop through all content iframes and empty them for
     * tags added by us. This is because we need to position a 
     * new tag in relation to a clean DOM.  
     * */
    removeAllTagsFromPage(callback: () => void) {
      //loop that will keep asking for spans to remove
      //until they are all gone.
      const done = _.after(this.listOfFramesWithContent.length, () => {
        callback();
      });

      _.map(this.listOfFramesWithContent, (iframe) => {
        removeTagsFromIframe(iframe, done);
      });

      function removeTagsFromIframe(iframe: HTMLFrameElement | HTMLIFrameElement, 
        callback: () => void) {
        while (iframe.contentDocument.getElementsByClassName('tagit-tag').length > 0) {
          var spanElement = iframe.contentDocument.getElementsByClassName('tagit-tag')[0];
          var spanElementParent = spanElement.parentNode;
          spanElementParent.replaceChild(
            spanElement.firstChild,
            spanElement);
          /**
           * call normalize on the parent element so that it will join up
           * any text nodes that might have become chopped up by
           * tags and selection markers.
           *  */ 
          spanElementParent.normalize();
        }
        callback();
      }
    }

    /**
     * Handles adding tags to page which needs to happen in a 
     * bottom up order, so that all the tags find their right place.
     */
    readdTagsToPage(tagsToLoad: ISenseTag[]) {
      this.$log.debug('readdTagsToPage()');
      
      //first deselect all places before we go to work
      this.removeAllRanges();

      /**
       * The tags need to be loaded (deserialized) so that 
       * they can be inserted properly. Deserialization might
       * fail if the page has changed since it was tagged. Thus
       * we remove tags that fail to load. 
       */
      tagsToLoad = _.filter(tagsToLoad, (tagToLoad) => {
        try {
          tagToLoad.deserializedRange = rangy.deserializeRange(
            tagToLoad.serializedSelectionRange,
            this.listOfFramesWithContent[tagToLoad.iframeIndex].contentDocument.documentElement,
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

      /**
       * sort tags descending (highest number = furthest down on page). 
       */
      tagsToLoad = _.sortBy(tagsToLoad, (tag: ISenseTag) => {
        return tag.deserializedRange.startOffset;
      });

      this.$log.debug('finished sorting tags');

      /**
       * Loop through loaded tags and insert them to the page. 
       */
      _.map(tagsToLoad, (tag: ISenseTag) => {
        if (tag.deserializedRange) {
          this.surroundRangeWithSpan(
            this.listOfFramesWithContent[tag.iframeIndex].contentDocument,
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
      rangy.restoreSelection(this.savedSelection);
      var iframeOfInterest = getFrameContainingSelection(this.listOfFramesWithContent);
      const selection = iframeOfInterest.contentDocument.getSelection();

      var range: Range = selection.getRangeAt(0);
      var serializedRange = rangy.serializeRange(range, true,
        iframeOfInterest.contentDocument.documentElement);
      var generatedUuid: string = uuid.v4();
      var parentElement = <HTMLElement>range.commonAncestorContainer;

      return {
        id: generatedUuid,
        userEmail: 'testEmail',
        sense: sense,
        wordThatWasTagged: selection.toString(),
        iframeIndex: getIframeIndex(this.listOfFramesWithContent, iframeOfInterest),
        context: parentElement.innerText,
        serializedSelectionRange: serializedRange
      }

      /**
       * Some pages might have many frames with content. Thus we
       * need to loop through them, identify which document contains the current
       * selection and then save its index in our list.
       */
      function getIframeIndex(iframeList: (HTMLFrameElement | HTMLIFrameElement)[],
        iframeToFind: (HTMLFrameElement | HTMLIFrameElement)) {
        for (var i = 0; i < iframeList.length; i++) {
          var iframeInlist = iframeList[i];
          if (iframeInlist === iframeToFind) {
            return i;
          }
        }
        return 0;
      }

      function getFrameContainingSelection(iframeList: (HTMLFrameElement | HTMLIFrameElement)[]) {
        return _.find(iframeList, (frame) => {
          return frame.contentDocument.getSelection().toString() !== '';
        });
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
