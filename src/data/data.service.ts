'use strict';

class DataService {

  $http : ng.IHttpService;

  static $inject = ["$scope", "$log"];
  constructor($http: ng.IHttpService, $log: ng.ILogService) {
    this.$http = $http;
  }

  createQuery (word: string) {
    return '{"word":"QUERYTOREPLACE"}'.replace(/QUERYTOREPLACE/, word);
  }

  callServer (word: string) {
    if (!word) {
      return;
    };

    var serverUrl = 'http://lexitags.dyndns.org/server/lexitags2/Semtags?data='

    return this.$http.get(serverUrl + this.createQuery(word));

  }
}

export = DataService;
