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
    it('should be able to find distance to "this" from "long"', () => {
      const testString =
        'this is a long string with different words to find in this.'
      const startIndex = testString.indexOf('long')
      const result = webpageService.findDistanceToWord({
        searchSpace: testString,
        startIndex,
        targetWord: 'this'
      })
      expect(result.distance).toBe(-10)
      expect(result.index).toBe(0)
    })

    it('should prefer match in the end if thats closer to startIndex', () => {
      const testString =
        'find this is a long string with different words to find in this.'
      const startIndex = testString.indexOf('words')
      const result = webpageService.findDistanceToWord({
        searchSpace: testString,
        startIndex,
        targetWord: 'find'
      })
      expect(result.distance).toBe(9)
      expect(result.index).toBe(51)
    })

    it('should match the left closest to startIndex', () => {
      const testString =
        'find this is a long string with different find words to in this.'
      const startIndex = testString.indexOf('words')
      const result = webpageService.findDistanceToWord({
        searchSpace: testString,
        startIndex,
        targetWord: 'find'
      })
      expect(result.distance).toBe(-5)
      expect(result.index).toBe(42)
    })
  })
})
