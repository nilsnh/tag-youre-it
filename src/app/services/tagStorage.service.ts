'use strict';

import {ISenseTag} from '../index.interfaces'
import * as angular from 'angular'

// responsible for saving and loading
// any tags related to the current page
export class TagStorageService {

  $localStorage: { tagStorage: ISenseTag[] };

  constructor(
    private $http: ng.IHttpService,
    private $log: ng.ILogService,
    $localStorage: any) {
    this.$localStorage = $localStorage;

    if (window.location.href.indexOf("tagitreset") !== -1) {
      this.deleteTagsFromCurrentPage(); // reset tag storage
      this.$log.debug("Resetting tags for this page");
    }

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

  deleteTagsFromCurrentPage() {
    this.$log.debug('deleting tags');
    this.$localStorage.tagStorage =
      this.$localStorage.tagStorage.filter(
        (tag: ISenseTag) => tag.urlOfPageThatWasTagged !== window.location.href)
  }

  saveTag(tagToSave: ISenseTag) {
    this.$log.debug('saving tag in localstorage:');
    this.$log.debug(tagToSave);
    this.$localStorage.tagStorage.push(tagToSave);
  }

  loadTagsForCurrentPage(): ISenseTag[] {
    this.$log.debug('loadTagsForCurrentPage');
    return angular.copy(this.$localStorage.tagStorage)
      .filter((tag: ISenseTag) =>
        tag.urlOfPageThatWasTagged === window.location.href
      );
  }

  /**
   * Loads all tags in localstorage (for the current domain).
   */
  loadAllTagsInLocalStorage() {
    this.$log.debug('loadAllTagsInLocalStorage');
    return this.$localStorage.tagStorage
  }

}
