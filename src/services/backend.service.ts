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

    sendTaggedDataToServer (sense: ISense, range: Range,
      selectedWord: string, userEmail: string) {
      this.$log.debug('sendTaggedDataToServer() was called');
      var messageToSendToServer = {
        sense: sense,
        range: range,
        selectedWord: selectedWord,
        userEmail: userEmail
      }

      this.$log.debug('would have sent this to the server:');
      this.$log.debug(messageToSendToServer);
      this.$log.debug('please uncomment code for actually sending to server');

      // this.$http.post("example.org", messageToSendToServer)
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