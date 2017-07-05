
describe('WebPageService', function() {
  beforeEach(angular.mock.module('tagit'))

  let webpageService;
  beforeEach(inject(function(_WebPageService_){
    // The injector unwraps the underscores (_) from around the parameter names when matching
    webpageService = _WebPageService_;
  }))

  it('should be able to instantiate service', function() {
    expect(webpageService).toBeTruthy();
  })
})
