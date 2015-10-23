'use strict';

module tagIt {

  export class DataService {

    $http : ng.IHttpService;
    private serverUrl = 'http://lexitags.dyndns.org/server/lexitags2/Semtags?data=';

    static $inject = ["$http", "$log"];
    constructor($http: ng.IHttpService, $log: ng.ILogService) {
      this.$http = $http;
    }

    callServer (word: string) {
      if (!word) {
        return;
      };
      return this.$http.get(this.serverUrl + this.createQuery(word));
    }

    processSynsets (synsets: synsetJson) : string[] {
      return synsets.data.senses;
    }

    // save tagging information
    // Params: email, tagging, sentence
    storeTaggingInformation (tag : Object) {

    }

    private createQuery (word: string) {
      return '{"word":"QUERYTOREPLACE"}'
        .replace(/QUERYTOREPLACE/, word);
    }
  }
}
