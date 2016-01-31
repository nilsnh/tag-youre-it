/// <reference path="../index.interfaces.ts" />
/// <reference path="../index.appConfig.ts" />

'use strict';

module tagIt {

  export class BackendService {

    $http : ng.IHttpService;
    $log : ng.ILogService;
    private serverUrl : string = null;

    /* @ngInject */
    constructor($http: ng.IHttpService, $log: ng.ILogService, AppConfigService: AppConfigService) {
      this.$http = $http;
      this.$log = $log;
      this.serverUrl = AppConfigService.serverUrl;
    }

    callServer (word: string) {
      if (!word) {
        return;
      };
      return this.$http.get(this.serverUrl + this.createQuery(word));
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

    private createQuery (word: string) {
      return '{"word":"QUERYTOREPLACE"}'
        .replace(/QUERYTOREPLACE/, word);
    }
  }
}