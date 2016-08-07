/**
 * Responsible for handling persisting and retrieving
 * *select* user settings. Some settings might not be user 
 * editable.
 */
export class SettingsService {

  // where to query for senses
  private _senseQueryUrl = 'https://imdb.uib.no/lexitags/lexitags'
  private _defaultSenseQueryUrl = 'https://imdb.uib.no/lexitags/lexitags'

  // where to send the senses
  private _senseDestinationUrl = 'https://www.example.org/somewhere'
  private _defaultSenseDestinationUrl = 'https://www.example.org/somewhere'

  private _emailToTagWith = ''

  constructor(private $log: ng.ILogService) {

    // fall back to default value if no user defined setting
    this.loadSetting('tagitSenseQueryUrl', (loadedSetting) => {
      if (loadedSetting) this._senseQueryUrl = loadedSetting
      else this._senseQueryUrl = this._defaultSenseQueryUrl
    })

    this.loadSetting('tagitSenseDestinationUrl', (loadedSetting) => {
      if (loadedSetting) this._senseDestinationUrl = loadedSetting
      else this._senseDestinationUrl = this._defaultSenseDestinationUrl
    })

  }

  resetSettings(callback) {

    // reset to default values
    this._defaultSenseQueryUrl = this._defaultSenseQueryUrl
    this._senseDestinationUrl = this._defaultSenseDestinationUrl

    // delete from chrome storage
    if (typeof chrome.storage !== 'undefined') {
      const done = _.after(2, callback);
      chrome.storage.sync.remove('tagitSenseDestinationUrl', done)
      chrome.storage.sync.remove('tagitSenseQueryUrl', done)
    }
    // delete from localstorage (dev mode) 
    else {
      localStorage.removeItem('tagitSenseQueryUrl')
      localStorage.removeItem('tagitSenseDestinationUrl')
      callback()
    }
  }

  private loadSetting(whatToFind: string, callback) {
    // support for dev mode (when not loaded as a proper chrome plugin).
    if (typeof chrome.storage === 'undefined') {
      callback(localStorage.getItem(whatToFind))
      return // exit function
    }

    const syncStorage = chrome.storage.sync
    syncStorage.get(whatToFind, (loadedObject) => {
      //the loadedObject can contain one or more loaded items.
      //more info: https://developer.chrome.com/extensions/storage
      callback(loadedObject[whatToFind]);
    })
  }

  private saveSetting(nameOfThingToSave: string, valueToSave) {
    // support for dev mode (when not loaded as a proper chrome plugin).
    if (typeof chrome.storage === 'undefined') {
      localStorage.setItem(nameOfThingToSave, valueToSave)
      return // exit function
    }

    const syncStorage = chrome.storage.sync
    syncStorage.set({ nameOfThingToSave: valueToSave }, () => {
      this.$log.debug('saveSetting successfully saved to chrome storage.')
    })
  }

  get senseQueryUrl() {
    return this._senseQueryUrl
  }

  set senseQueryUrl(newUrl: string) {
    this._senseQueryUrl = newUrl
  }

  get senseDestinationUrl() {
    return this._senseDestinationUrl
  }

  set senseDestinationUrl(newUrl: string) {
    this._senseDestinationUrl = newUrl
    this.saveSetting('tagitSenseDestinationUrl', newUrl)
  }

}

