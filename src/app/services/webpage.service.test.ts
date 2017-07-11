import { ISense, ISenseTag } from '../index.interfaces'
import { WebPageService } from './webpage.service'

declare var angular

describe('WebPageService:', function() {
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

  describe('Word distance calculator', () => {
    const testString =
      'this is a long string with different words to find in this.'
    const startIndex = testString.indexOf('long')
    it('should be able to find distance to "this" from "long"', () => {
      const result = webpageService.findDistanceToWord({
        searchSpace: testString,
        startIndex,
        targetWord: 'this'
      })
      expect(result).toBe(-10)
    })
  })
})
