'use strict';

import {SettingsService} from '../services/index';
import {ISenseTag} from '../index.interfaces';

/**
 * Service that is responsible for talking to the 
 * backend server.
 */
export class BackendService {

  private previousCall: string

  constructor(
    private $http: ng.IHttpService,
    private $q: ng.IQService,
    private $log: ng.ILogService,
    private SettingsService: SettingsService) {
  }

  callServer(word: string) {
    if (!word) {
      return this.$q.reject('no use calling server, there is no queryword.')
    } else if (this.previousCall === word) {
      var errMsg = `callServer has already been called with word: ${word}`;
      this.$log.debug(errMsg)
      return this.$q.reject(errMsg);
    }

    //alright let's make this query!
    this.previousCall = word;
    return this.SettingsService.loadSettings()
      .then(loadedSettings => this.$http.get(`${loadedSettings.tagitSenseQueryUrl}/${word}`))
  }

  sendTaggedDataToServer(senseTag: ISenseTag) {
    this.$log.debug('sendTaggedDataToServer() was called');
    return this.SettingsService.loadSettings()
      .then(loadedSettings => this.$http.post(loadedSettings.tagitSenseDestinationUrl, senseTag))
  }

}