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
  emailToTagWith
  savedSetting = false

  constructor(
    private $scope: IVMScope,
    private $log: angular.ILogService,
    private $timeout: angular.ITimeoutService,
    BackendService: BackendService,
    WebPageService: WebPageService,
    TagStorageService: TagStorageService,
    private SettingsService: SettingsService) {

    $scope.vm = this;
    this.loadSettings()
    this.startListeningForLogins()
  }

  loadSettings() {
    this.SettingsService.loadSettings().then((settings) => {
      this.senseQueryUrl = settings.tagitSenseQueryUrl
      this.serverToSendTo = settings.tagitSenseDestinationUrl
      this.emailToTagWith = settings.emailToTagWith
    })
  }

  saveSettings() {
    this.$log.debug('saving!')
    this.SettingsService.saveSettings({
      'tagitSenseDestinationUrl': this.serverToSendTo,
      'tagitSenseQueryUrl': this.senseQueryUrl,
      'emailToTagWith': this.emailToTagWith
    }).then(() => {
      // display 'saved!' for a short time before hiding it
      this.savedSetting = true
      this.$timeout(()=> {
        this.savedSetting = false
      }, 3000)
    })
  }

  resetDefaults() {

    if (!confirm('Reset settings to default values?')) {
      return //exit if user says 'no'
    }

    this.SettingsService.resetSettings().then(() => this.loadSettings())
  }

  testLogin() {
    if (typeof chrome === 'undefined') return; //do nothing
    chrome.runtime.sendMessage({command: 'requestUserInfo'})
  }

  startListeningForLogins() {
    chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
      if (request.loginObj) {
        this.$log.debug('listenForLogin() got a message from the extension')
        this.$log.debug(request)
      }
    }
  );
  }

}