/// <reference path="../index.interfaces.ts" />

'use strict';

// responsible for saving and loading
// any tags related to the current page
module tagIt {

  export class TagStorageService {

    $http: ng.IHttpService;
    $log: ng.ILogService;
    $localStorage: any;

    /* @ngInject */
    constructor($http: ng.IHttpService, $log: ng.ILogService,
      $localStorage: any) {
      this.$http = $http;
      this.$log = $log;
      this.$localStorage = $localStorage;
      
      // this.deleteTags(); // reset tag storage
      
      if (!this.$localStorage.tagStorage) {
        this.$localStorage.tagStorage = [];
      }
    }

    deleteTagById(uuid: string) {
      this.$log.debug('deleting tag from localstorage with uuid: ' + uuid);
      var newList: ISenseTag[] = [];
      var tag: ISenseTag;
      for (var i = 0; i < this.$localStorage.tagStorage.length; i++) {
        tag = this.$localStorage.tagStorage[i];
        if (tag.id !== uuid) {
          newList.push(tag);
        }
      }
      this.$localStorage.tagStorage = newList;
    }

    deleteTags() {
      this.$log.debug('deleting all tags from localstorage');
      delete this.$localStorage.tagStorage;
    }

    saveTag(tagToSave: ISenseTag) {
      this.$log.debug('saving tag in localstorage:');
      this.$log.debug(tagToSave);
      this.$localStorage.tagStorage.push(tagToSave);
    }

    loadTags() {
      this.$log.debug('loadTags');
      return this.$localStorage.tagStorage;
    }

  }
}