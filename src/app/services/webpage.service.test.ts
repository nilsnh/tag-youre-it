import { ISense, ISenseTag } from '../index.interfaces'
import { WebPageService } from './webpage.service'

declare var angular

describe('WebPageService', function() {
  beforeEach(angular.mock.module('tagit'))

  let webpageService: WebPageService
  beforeEach(
    inject(function(_WebPageService_) {
      // The injector unwraps the underscores (_) from around the parameter names when matching
      webpageService = _WebPageService_
    })
  )

  it('should be able to instantiate service', function() {
    expect(webpageService).toBeTruthy()
  })

  xit('it is able to serialize range', () => {
    const iframe = initializeTestIframe()
    const target = iframe.contentDocument.querySelector('span')
    const range = rangy.createNativeRange()
    range.setStartBefore(target)
    range.setEndAfter(target)
    // verify that we were able to select some text
    expect(range.toString()).toBe('selectionTarget')

    const serializedRange = rangy.serializeRange(
      range,
      true,
      iframe.contentDocument.documentElement
    )
    console.log('serializeRange', serializedRange)
    expect(serializedRange).toBe('0/1:1,0/1:2')
  })

  xit('deserializes tags', function() {
    const mockDataTags: ISenseTag[] = [
      {
        id: '20bc4616-060e-403b-910f-00b15e7c6ed8',
        userEmail: '',
        sense: {
          word: 'widely ',
          explanation: 'to a great degree; "her work is widely known"  ',
          related: '',
          source: 'WordNet',
          rank: 17,
          senseid:
            'http://www.w3.org/2006/03/wn/wn20/instances/synset-widely-eeeek-1'
        },
        wordThatWasTagged: 'widely',
        iframeIndex: 0,
        context:
          "\n    The Triumph of Cleopatra, also known as Cleopatra's Arrival in Cilicia[1] and The Arrival of Cleopatra in Cilicia,[2] is\n    an oil painting by English artist William Etty. It was first exhibited in 1821, and is now in the Lady Lever Art Gallery\n    in Port Sunlight across the River Mersey from Liverpool. During the 1810s Etty had become widely respected among staff\n    and students at the Royal Academy of Arts, in particular for his use of colour and ability to paint realistic flesh tones.\n    Despite having exhibited at every Summer Exhibition since 1811 he attracted little commercial or critical interest. In\n    1820 he exhibited The Coral Finder, which showed nude figures on a gilded boat. This painting attracted the attention\n    of Sir Francis Freeling, who commissioned a similar painting on a more ambitious scale.\n  ",
        serializedSelectionRange: '0/5/2:345,0/5/2:351',
        urlOfPageThatWasTagged: 'http://localhost:3000/test/'
      }
    ]

    const iframe = initializeTestIframe()

    expect(
      webpageService.tryDeserializeTags(mockDataTags, [iframe]).length
    ).toBe(1)
  })
})

function initializeTestIframe() {
  const paragraph = document.createElement('p')
  paragraph.innerHTML = `
    The Triumph of Cleopatra, also known as Cleopatra's Arrival in Cilicia[1] and The Arrival of Cleopatra in Cilicia,[2] is\n    an oil painting by English artist William Etty. It was first exhibited in 1821, and is now in the Lady Lever Art Gallery\n    in Port Sunlight across the River Mersey from Liverpool. During the 1810s Etty had become widely respected among staff\n    and students at the Royal Academy of Arts, in particular for his use of colour and ability to paint realistic flesh tones.\n    Despite having exhibited at every Summer Exhibition since 1811 he attracted little commercial or critical interest. In\n    1820 he exhibited The Coral Finder, which showed nude figures on a gilded boat. This painting attracted the attention\n    of Sir Francis Freeling, who commissioned a similar painting on a more ambitious scale. <span>selectionTarget</span> \n
  `
  const iframe = document.createElement('iframe')
  window.document.body.appendChild(iframe)
  iframe.contentDocument.body.appendChild(paragraph)
  console.log(iframe.contentDocument.body)
  return iframe
}
