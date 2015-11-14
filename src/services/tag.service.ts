/// <reference path="../index.interfaces.ts" />

'use strict';

// responsible for saving and loading
// any tags related to the current page
module tagIt {

  export class TagService {

    $http : ng.IHttpService;
    $log : ng.ILogService;

    /* @ngInject */
    constructor($http: ng.IHttpService, $log: ng.ILogService) {
      this.$http = $http;
      this.$log = $log;
    }

    // save selection
    saveTag () {

    }

    loadTag () {

    }

    loadTags () {
      this.$log.debug('loadTags');

    }
  }
}