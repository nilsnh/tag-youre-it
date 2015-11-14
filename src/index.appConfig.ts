/// <reference path="../typings/tsd.d.ts" />

module tagIt {

  /** @ngInject */
  export function AppConfigInitializer ($logProvider: ng.ILogProvider) {
    $logProvider.debugEnabled(true);
  }

  export class AppConfigService {
    serverUrl = 'http://lexitags.dyndns.org/server/lexitags2/Semtags?data=';
  }
}

