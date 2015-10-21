'use strict';

module tagIt {
  export class DataService {

    $http : ng.IHttpService;
    serverUrl = 'http://lexitags.dyndns.org/server/lexitags2/Semtags?data=';
    static $inject = ["$http", "$log"];

    constructor($http: ng.IHttpService, $log: ng.ILogService) {
      this.$http = $http;
    }

    createQuery (word: string) {
      return '{"word":"QUERYTOREPLACE"}'
        .replace(/QUERYTOREPLACE/, word);
    }

    callServer (word: string) {
      if (!word) {
        return;
      };
      return this.$http
        .get(this.serverUrl + this.createQuery(word));
    }
  }
}
