'use strict'

import { TagStorageService } from './tagStorage.service'
import { ISense, ISenseTag } from '../index.interfaces'
import * as _ from 'lodash'
import * as uuidV4 from 'uuid/v4'

/**
 * This service is responsible for interfacing with the content
 * that we want to tag. It injects/removes tags and listens for clicks.
 */
export class WebPageService {
  // when clicking the menu to select a synset
  // we need to remember what the currently selected word was
  savedSelection: Object
  savedText: string
  listOfFramesWithContent: (HTMLFrameElement | HTMLIFrameElement)[] = []
  rangy: any

  constructor(
    private $log: ng.ILogService,
    private TagStorageService: TagStorageService,
    private $rootScope: ng.IRootScopeService
  ) {
    this.loadRangy()
  }

  // load rangy after loading angular to avoid
  // rangy giving up due to missing body tag which
  // is an issue with sites using framesets.
  loadRangy = () => {
    this.rangy = require('rangy')
    require('rangy/lib/rangy-selectionsaverestore')
    require('rangy/lib/rangy-serializer')
    this.rangy.init()
    window.rangy = this.rangy //expose for testing
  }

  /**
   * The click listening function placed on each of the iframes
   * we capture. We then listen for clicks and check if a word
   * was selected.
   */
  clickhandler = (evt: Event) => {
    this.$log.debug('A click happened!')
    var documentThatWasClicked = evt.srcElement.ownerDocument
    if (!documentThatWasClicked.hasFocus()) {
      return true
    } else if (wasRemoveTagButtonClicked(evt)) {
      this.$log.debug('remove tag button was clicked')
      removeTagFromWebAndStorage(evt, this.TagStorageService)
    } else if (documentThatWasClicked.getSelection().toString() !== '') {
      resetSavedSelection(this.savedSelection)
      this.savedSelection = this.rangy.saveSelection(documentThatWasClicked)
      this.savedText = joinLongWords(
        documentThatWasClicked.getSelection().toString()
      )
      this.$rootScope.$broadcast('wordWasSelected', this.savedText)
    } else {
      resetSavedSelection(this.savedSelection)
      this.savedText = ''
      this.$rootScope.$broadcast('wordWasDeSelected', null)
    }

    /**
     * Remove markers to ensure a clean page before
     * adding markers for a new page.
     */
    function resetSavedSelection(savedSelection) {
      if (savedSelection) {
        this.rangy.removeMarkers(savedSelection)
      }
    }

    function joinLongWords(possiblyLongWord: string) {
      return possiblyLongWord.trim().split(' ').join('_')
    }

    function wasRemoveTagButtonClicked(evt: any) {
      return evt.target.className === 'js-tagit-remove-tag'
    }

    //todo ensure removing a tag
    function removeTagFromWebAndStorage(
      evt: Event,
      tagStorageService: TagStorageService
    ) {
      var target = <HTMLElement>evt.target
      var theOriginalTextNode = target.previousSibling
      var theSurroundingSpanElement = target.parentElement
      var parentElement = theSurroundingSpanElement.parentElement
      tagStorageService.deleteTagById(theSurroundingSpanElement.id)
      parentElement.replaceChild(theOriginalTextNode, theSurroundingSpanElement)
      parentElement.normalize()
    }
  }

  /**
   * Find one or more iframes in which content has been captured.
   * We then place click listeners on each of the frames.
   */
  addListenersToPage() {
    const tagitBodyIframe = <HTMLIFrameElement>parent.document.getElementById(
      'tagit-body'
    )
    const tagitBodyIframeDoc = tagitBodyIframe.contentDocument

    if (tagitBodyIframeDoc.getElementsByTagName('frameset').length > 0) {
      _.map(tagitBodyIframeDoc.getElementsByTagName('frame'), frame => {
        this.listOfFramesWithContent.push(frame)
      })
    } else {
      this.listOfFramesWithContent.push(tagitBodyIframe)
    }

    _.map(this.listOfFramesWithContent, (frame: HTMLIFrameElement) => {
      frame.contentDocument.addEventListener('click', this.clickhandler, false)
    })
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
      callback()
    })

    _.map(this.listOfFramesWithContent, iframe => {
      removeTagsFromIframe(iframe, done)
    })

    function removeTagsFromIframe(
      iframe: HTMLFrameElement | HTMLIFrameElement,
      callback: () => void
    ) {
      while (
        iframe.contentDocument.getElementsByClassName('tagit-tag').length > 0
      ) {
        var spanElement = iframe.contentDocument.getElementsByClassName(
          'tagit-tag'
        )[0]
        var spanElementParent = spanElement.parentNode
        spanElementParent.replaceChild(spanElement.firstChild, spanElement)
        /**
         * call normalize on the parent element so that it will join up
         * any text nodes that might have become chopped up by
         * tags and selection markers.
         *  */
        spanElementParent.normalize()
      }
      callback()
    }
  }

  /**
   * Handles adding tags to page which needs to happen in a
   * bottom up order, so that all the tags find their right place.
   */
  readdTagsToPage(tagsToLoad: ISenseTag[]) {
    this.$log.debug('readdTagsToPage()')

    //first deselect all places before we go to work
    this.removeAllRanges()

    tagsToLoad = this.tryDeserializeTags(
      tagsToLoad,
      this.listOfFramesWithContent
    )

    this.$log.debug('finished deserializing tags')

    /**
     * sort tags descending (highest number = furthest down on page).
     */
    tagsToLoad = _.sortBy(tagsToLoad, (tag: ISenseTag) => {
      return tag.deserializedRange.startOffset
    })

    this.$log.debug('finished sorting tags')

    /**
     * Loop through loaded tags and insert them to the page.
     */
    _.map(tagsToLoad, (tag: ISenseTag) => {
      if (tag.deserializedRange) {
        this.surroundRangeWithSpan(
          this.listOfFramesWithContent[tag.iframeIndex].contentDocument,
          tag.sense,
          tag.deserializedRange,
          tag.id
        )
      }
    })

    this.$log.debug('finished adding tags to page')
    this.removeAllRanges()
  }

  /**
   * The tags need to be loaded (deserialized) so that
   * they can be inserted properly. Deserialization might
   * fail if the page has changed since it was tagged. Thus
   * we remove tags that fail to load.
   */
  tryDeserializeTags = (
    tags: ISenseTag[],
    htmlFrames: (HTMLFrameElement | HTMLIFrameElement)[]
  ): ISenseTag[] => {
    return _.reduce(
      tags,
      (acc, tagToLoad) => {
        try {
          tagToLoad.deserializedRange = this.rangy.deserializeRange(
            tagToLoad.serializedSelectionRange,
            htmlFrames[tagToLoad.iframeIndex].contentDocument.documentElement,
            htmlFrames[tagToLoad.iframeIndex]
          )

          const savedWord = tagToLoad.wordThatWasTagged.trim()
          const selectedWordOnPage = tagToLoad.deserializedRange
            .toString()
            .trim()
          if (savedWord !== selectedWordOnPage) {
            /**
              Uh oh! deserializedRange does not contain the word we saved.
              Content might have shifted. Try finding an adjacent match.
            */
            const range = tagToLoad.deserializedRange
            const result = this.findDistanceToWord({
              searchSpace: range.startContainer.textContent,
              startIndex: range.startOffset,
              targetWord: savedWord
            })
            if (!result) {
              throw new Error(
                `Selected word on page: ${selectedWordOnPage}, did not match the one we saved: ${savedWord}`
              )
            }
            tagToLoad.deserializedRange.setStart(
              range.startContainer,
              range.startOffset + result.distance
            )
            tagToLoad.deserializedRange.setEnd(
              range.endContainer,
              range.endOffset + result.distance
            )
            console.log(
              'tryDeserializeTags: Fuzzy find successfully found a neighbouring match that was not too far away.'
            )
          }
          acc.push(tagToLoad)
          return acc
        } catch (e) {
          var errorMsg = `Error in this.rangy.js: Was not able to deserialize range.
            In other words: The page might have changed. Is not able
            to determine where this tag should have been placed.`
          console.log(errorMsg)
          console.log("Couldn't load:", tagToLoad)
          console.log(e)
          return acc
        }
      },
      []
    )
  }

  /**
   * Fuzzy find. When deserializing ranges we sometimes discover that the
   * webcontent might have shifted. This function helps us "look around"
   *
   * Returns an object with word matched, index of match and distance to the
   * closest word. Please note that the distance will be negative if the word
   * is "behind" the starting point.
   */
  findDistanceToWord = ({
    searchSpace,
    startIndex,
    targetWord
  }: {
    searchSpace: string
    startIndex: number
    targetWord: string
  }) => {
    const re = new RegExp(targetWord, 'g')
    let matches: RegExpExecArray[] = []

    let match = re.exec(searchSpace)
    while (match) {
      matches.push(match)
      match = re.exec(searchSpace)
    }

    // orderMatches byDistance
    matches = matches
      .filter(
        match =>
          // remove matches that are too far away
          ensurePositive(getDistanceTo(match, startIndex)) < 200
      )
      .sort((a, b) => {
        const aDistance = ensurePositive(getDistanceTo(a, startIndex))
        const bDistance = ensurePositive(getDistanceTo(b, startIndex))
        if (aDistance < bDistance) {
          return -1
        } else if (aDistance > bDistance) {
          return 1
        } else {
          return 0
        }
      })

    if (!matches) {
      console.log('findDistanceToWord: Found no match.')
      return null
    }

    const matchesWithDistance = matches.map(elem => ({
      match: elem[0],
      index: elem.index,
      distance: getDistanceTo(elem, startIndex)
    }))

    console.log('matchesWithDistance', matchesWithDistance)
    return matchesWithDistance[0]

    // returns negative number if the match is 'behind' the startIndex
    function getDistanceTo(match: RegExpExecArray, startIndex: number) {
      return match.index - startIndex
    }

    function ensurePositive(input: number) {
      return input < 0 ? input * -1 : input
    }
  }

  initializeNewTag = (sense: ISense): ISenseTag => {
    this.$log.debug('initializeNewTag')

    /**
     * first eliminate all selections to avoid confusion
     * with other iframes.
     */
    this.removeAllRanges()
    this.rangy.restoreSelection(this.savedSelection)
    var iframeOfInterest = getFrameContainingSelection(
      this.listOfFramesWithContent
    )
    const selection = iframeOfInterest.contentDocument.getSelection()

    var range: Range = selection.getRangeAt(0)
    var serializedRange = this.rangy.serializeRange(
      range,
      true,
      iframeOfInterest.contentDocument.documentElement
    )
    var generatedUuid: string = uuidV4()
    var parentElement = <HTMLElement>range.commonAncestorContainer

    return {
      id: generatedUuid,
      userEmail: 'testEmail',
      sense: sense,
      wordThatWasTagged: selection.toString(),
      iframeIndex: getIframeIndex(
        this.listOfFramesWithContent,
        iframeOfInterest
      ),
      context: parentElement.textContent,
      serializedSelectionRange: serializedRange,
      urlOfPageThatWasTagged: window.location.href
    }

    /**
     * Some pages might have many frames with content. Thus we
     * need to loop through them, identify which document contains the current
     * selection and then save its index in our list.
     */
    function getIframeIndex(
      iframeList: (HTMLFrameElement | HTMLIFrameElement)[],
      iframeToFind: HTMLFrameElement | HTMLIFrameElement
    ) {
      for (var i = 0; i < iframeList.length; i++) {
        var iframeInlist = iframeList[i]
        if (iframeInlist === iframeToFind) {
          return i
        }
      }
      return 0
    }

    function getFrameContainingSelection(
      iframeList: (HTMLFrameElement | HTMLIFrameElement)[]
    ) {
      return _.find(iframeList, frame => {
        return frame.contentDocument.getSelection().toString() !== ''
      })
    }
  }

  private removeAllRanges = () => {
    _.map(this.listOfFramesWithContent, iframe => {
      iframe.contentDocument.getSelection().removeAllRanges()
    })
  }

  private surroundRangeWithSpan(
    documentToManipulate: HTMLDocument,
    sense: ISense,
    range: Range,
    uuid: string
  ) {
    // add span around content
    var span: HTMLSpanElement = documentToManipulate.createElement('span')
    span.id = uuid
    span.title = sense.explanation
    span.className = 'tagit-tag'

    range.surroundContents(span)

    // add a button for removing the tag.
    var btn = documentToManipulate.createElement('BUTTON')
    btn.className = 'js-tagit-remove-tag'
    btn.appendChild(documentToManipulate.createTextNode('X'))
    span.appendChild(btn)
  }
}
