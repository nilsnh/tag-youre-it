/// <reference path="../index.interfaces.ts" />

'use strict';

module tagIt {

  export class BackendService {

    $http : ng.IHttpService;
    $log : ng.ILogService;
    private serverUrl = 'http://lexitags.dyndns.org/server/lexitags2/Semtags?data=';

    /* @ngInject */
    constructor($http: ng.IHttpService, $log: ng.ILogService) {
      this.$http = $http;
      this.$log = $log;
    }

    callServer (word: string) {
      if (!word) {
        return;
      };
      return this.$http.get(this.serverUrl + this.createQuery(word));
    }

    processSynsets (synsets: ISynset) : string[] {
      return synsets.data.senses;
    }

    // save tagging information
    // Params: email, tagging, sentence
    storeTaggingInformation (tag : Object) {
      this.$log.debug('storeTaggingInformation() was called');
      this.$log.debug(tag);
    }

    private createQuery (word: string) {
      return '{"word":"QUERYTOREPLACE"}'
        .replace(/QUERYTOREPLACE/, word);
    }
  }
}