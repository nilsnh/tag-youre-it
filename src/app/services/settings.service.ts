
/**
 * Enumerate the things we can store.
 * 
 * More info: https://basarat.gitbooks.io/typescript/content/docs/types/stringLiteralType.html
 */
type StorableSetting =
  'tagitSenseQueryUrl' |
  'tagitSenseDestinationUrl'

/**
 * Responsible for handling persisting and retrieving
 * *select* user settings. Some settings might not be user 
 * editable.
 */
export class SettingsService {

  // where to query for senses
  private _defaultSenseQueryUrl = 'https://imdb.uib.no/lexitags/lexitags'

  // where to send the senses
  private _defaultSenseDestinationUrl = 'https://www.example.org/somewhere'

  private _emailToTagWith = ''

  constructor(private $log: ng.ILogService, private $q: ng.IQService) {
  }

  getSenseQueryUrl() {
    return this.loadSetting('tagitSenseQueryUrl')
      .then((value) => this.returnDefaultValueIfMissing(value, this._defaultSenseQueryUrl))
  }

  setSenseQueryUrl(newUrl: string) {
    return this.saveSetting('tagitSenseQueryUrl', newUrl)
  }

  getSenseDestinationUrl() {
    return this.loadSetting('tagitSenseDestinationUrl')
      .then((value) => this.returnDefaultValueIfMissing(value, this._defaultSenseDestinationUrl))
  }

  setSenseDestinationUrl(newUrl: string) {
    return this.saveSetting('tagitSenseDestinationUrl', newUrl)
  }

  private returnDefaultValueIfMissing(thingToCheck, defaultToUseIfMissingValue) {
    if (thingToCheck) return thingToCheck
    else return defaultToUseIfMissingValue
  }

  private loadSetting(whatToFind: StorableSetting) {
    // support for dev mode (when not loaded as a proper chrome plugin).
    if (typeof chrome.storage === 'undefined') {
      return this.$q.when(localStorage.getItem(whatToFind))
    }

    const syncStorage = chrome.storage.sync

    return this.$q((resolve, reject) => {
      syncStorage.get(whatToFind, (loadedObject) => {

        this.$log.debug('loadedSetting()')
        this.$log.debug(loadedObject)

        resolve(loadedObject[whatToFind])
      })
    })
  }

  private saveSetting(nameOfThingToSave: StorableSetting, valueToSave) {
    // support for dev mode (when not loaded as a proper chrome plugin).
    if (typeof chrome.storage === 'undefined') {
      localStorage.setItem(nameOfThingToSave, valueToSave)
      return this.$q.when(valueToSave)
    }

    const syncStorage = chrome.storage.sync
    return this.$q((resolve, reject) => {
      syncStorage.set({ nameOfThingToSave: valueToSave }, resolve)
    }).then(() => {
      this.$log.debug('saved setting')
      this.$log.debug(valueToSave)
      return valueToSave
    })
  }

  resetSettings() {

    return this.$q((resolve, reject) => {

      // delete from chrome storage
      if (typeof chrome.storage !== 'undefined') {
        const done = _.after(2, resolve);
        chrome.storage.sync.remove('tagitSenseDestinationUrl', done)
        chrome.storage.sync.remove('tagitSenseQueryUrl', done)
      }
      // delete from localstorage (dev mode) 
      else {
        localStorage.removeItem('tagitSenseQueryUrl')
        localStorage.removeItem('tagitSenseDestinationUrl')
        resolve()
      }
    })
  }

}

