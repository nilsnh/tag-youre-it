/// <reference path="../index.interfaces.ts" />

'use strict';

// responsible for saving and loading
// any tags related to the current page
module tagIt {

  export class TagStorageService {

    $http : ng.IHttpService;
    $log : ng.ILogService;
    $localStorage : any;
    backendService : BackendService;

    /* @ngInject */
    constructor($http: ng.IHttpService, $log: ng.ILogService,
      $localStorage: any, BackendService: BackendService) {
      this.$http = $http;
      this.$log = $log;
      this.$localStorage = $localStorage;
      this.backendService = BackendService;
      this.deleteTags(); // reset tag storage
    }

    deleteTagById (uuid: string) {
      this.$log.debug('deleting tag from localstorage with uuid: ' + uuid);
      var newList : ISenseTag[] = [];
      angular.forEach(this.$localStorage.tagStorage, function(element) {
        if(element.id !== uuid) {
          this.push(element);
        }
      }, newList);
      this.$localStorage.tagStorage = newList;
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
       this.backendService.sendTaggedDataToServer(tagToSave);
    }

    loadTags () {
      this.$log.debug('loadTags');
      return this.$localStorage.tagStorage;
    }
  }
}