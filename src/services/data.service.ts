/// <reference path="../index.interfaces.ts" />

'use strict';

module tagIt {

  //Declare that function is available.
  //The actual function is found in the content_script
  declare function storeTagData() : void;

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

    processSynsets (synsets: ISynset) : string[] {
      return synsets.data.senses;
    }

    // save tagging information
    // Params: email, tagging, sentence
    storeTagingInformation (tag : Object) {
      storeTagData();
    }

    private createQuery (word: string) {
      return '{"word":"QUERYTOREPLACE"}'
        .replace(/QUERYTOREPLACE/, word);
    }
  }
}