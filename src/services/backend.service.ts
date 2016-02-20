/// <reference path="../index.interfaces.ts" />
/// <reference path="../index.appConfig.ts" />

'use strict';

/**
 * Service that is responsible for talking to the 
 * backend server.
 */
module tagIt {

  export class BackendService {

    $http : ng.IHttpService;
    $log : ng.ILogService;
    $q: ng.IQService;
    private serverUrl : string = null;
    private previousCall: string;

    /* @ngInject */
    constructor($http: ng.IHttpService, $q: ng.IQService, $log: ng.ILogService, AppConfigService: AppConfigService) {
      this.$http = $http;
      this.$log = $log;
      this.$q = $q;
      this.serverUrl = AppConfigService.serverUrl;
    }

    callServer (word: string) {
      if (!word) {
        return this.$q.reject('no use calling server, there is no queryword.')
      } else if (this.previousCall === word) {
        var errMsg = `callServer has already been called with word: ${word}`;
        this.$log.debug(errMsg)
        return this.$q.reject(errMsg);
      }
      
      //alright let's make this query!
      this.previousCall = word; 
      return this.$http.get(this.serverUrl + word);
    }

    sendTaggedDataToServer (senseTag: ISenseTag) {
      this.$log.debug('sendTaggedDataToServer() was called');

      this.$log.debug('would have sent this to the server:');
      this.$log.debug(senseTag);
      this.$log.debug('please uncomment code for actually sending to server');

      // this.$http.post("example.org", senseTag)
      //   .then((response) => {
      //     this.$log.debug('successfully posted to server. Response:');
      //     this.$log.debug(response);
      //   })
      //   .catch((error) => {
      //     this.$log.error('something went wrong when posting to server');
      //     this.$log.error(error);
      //   });
    }

  }
}