'use strict';

import {
  BackendService,
  WebPageService,
  TagStorageService,
  FileService, 
  SettingsService} from '../services/index'
import {IVMScope, ISense} from '../index.interfaces'

/**
 * Responsible for making settings user editable
 * and communicating those settings changes to 
 * chrome extension background page.
 */
export class SettingsCtrl {

  serverToSendTo
  senseQueryUrl

  constructor(
    private $scope: IVMScope, 
    $log: angular.ILogService,
    BackendService: BackendService,
    WebPageService: WebPageService,
    TagStorageService: TagStorageService,
    private SettingsService: SettingsService) {

    $scope.vm = this;
    this.serverToSendTo = SettingsService.senseDestinationUrl
    this.senseQueryUrl = SettingsService.senseQueryUrl

    $scope.$watch('vm.serverToSendTo', (newValue: string, oldValue) => {
      SettingsService.senseDestinationUrl = newValue;
    })

  }

  resetDefaults() {

    if (!confirm('Reset settings to default values?')) {
      return //exit if user says 'no'
    }

    this.SettingsService.resetSettings(() => {
      this.serverToSendTo = this.SettingsService.senseDestinationUrl
    });
  }


}