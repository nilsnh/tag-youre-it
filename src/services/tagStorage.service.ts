/// <reference path="../index.interfaces.ts" />

'use strict';

// responsible for saving and loading
// any tags related to the current page
module tagIt {

  export class TagStorageService {

    $http : ng.IHttpService;
    $log : ng.ILogService;
    $localStorage : any;

    /* @ngInject */
    constructor($http: ng.IHttpService, $log: ng.ILogService,
      $localStorage: any) {
      this.$http = $http;
      this.$log = $log;
      this.$localStorage = $localStorage;
      // this.deleteTags(); // reset tag storage
    }

    deleteTags () {
      this.$log.debug('deleting all tags from localstorage');
      delete this.$localStorage.tagStorage;
    }

    saveTag (tagToSave: ISenseTag) {
       if(!this.$localStorage.tagStorage) {
         this.$localStorage.tagStorage = [];
       }
       this.$log.debug('saving tag in localstorage:');
       this.$log.debug(tagToSave);
       this.$localStorage.tagStorage.push(tagToSave);
    }

    loadTags () {
      this.$log.debug('loadTags');
      return this.$localStorage.tagStorage;
    }
  }
}