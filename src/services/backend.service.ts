'use strict';

import { ISynset, ISense } from '../index.interfaces';

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
  storeTaggingInformation (sense: ISense, range: Range ) {
    this.$log.debug('storeTaggingInformation() was called');
    return this.buildTagResponse(sense, range);
  }

  buildTagResponse (sense: ISense, range: Range) {
    debugger;
    return {
      "sense": sense,
      "selectionRange": range
    }
  }

  private createQuery (word: string) {
    return '{"word":"QUERYTOREPLACE"}'
    .replace(/QUERYTOREPLACE/, word);
  }
}
