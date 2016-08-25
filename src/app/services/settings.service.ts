
interface saveableSettings {
  tagitSenseQueryUrl: string
  tagitSenseDestinationUrl: string
  emailToTagWith: string
}

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

  //If we have the user's email we treat the user as logged in.
  private emailWasLoaded = false;

  constructor(private $log: ng.ILogService, private $q: ng.IQService) {
  }

  saveSettings(thingsToSave: saveableSettings) {

    // support for dev mode (when not loaded as a proper chrome plugin).
    if (typeof chrome.storage === 'undefined') {
      angular.forEach(thingsToSave, (value, key) => {
        localStorage.setItem(key, value)
      })
      return this.$q.when(thingsToSave)
    }

    return this.$q((resolve, reject) => {
      chrome.storage.sync.set(thingsToSave, resolve)
    }).then(() => {
      this.$log.debug('saved setting')
      this.$log.debug(thingsToSave)
      return thingsToSave
    })
  }

  loadSettings(): PromiseLike<saveableSettings> {

    return this.$q((resolve, reject) => {

      //when backed by localStorage (dev)
      if (typeof chrome.storage === 'undefined') {
        resolve({
          'tagitSenseDestinationUrl': localStorage.getItem('tagitSenseDestinationUrl'),
          'tagitSenseQueryUrl': localStorage.getItem('tagitSenseQueryUrl'),
          'emailToTagWith': localStorage.getItem('emailToTagWith')
        })
      } 
      //when backed by chrome.storage.sync (production)      
      else {
        chrome.storage.sync.get(null, resolve)
      }

    })
    //use default value if no setting specified.
    .then((loadedSettings: saveableSettings) => {

      /**
       * tagitSenseQueryUrl is not configurable yet so we just use
       * the default instead 
       */
      loadedSettings.tagitSenseQueryUrl = this._defaultSenseQueryUrl

      if (!loadedSettings.tagitSenseDestinationUrl) {
        loadedSettings.tagitSenseDestinationUrl = this._defaultSenseDestinationUrl
      }
      
      if (loadedSettings.emailToTagWith) {
        this.emailWasLoaded = true;
      } else {
        loadedSettings.emailToTagWith = ''
      }

      return loadedSettings
    })
  }

  /**
   * Returns true if user was logged in, which
   * we treat as true if we have the user's email 
   */
  isUserLoggedIn() {
    return this.emailWasLoaded
  }

  /**
   * Purpose: Let user's use the app without 
   * actually logging in.
   */
  setLoggedIn(loggedInState) {
    this.emailWasLoaded = loggedInState
  }

  resetSettings() {

    return this.$q((resolve, reject) => {

      // delete from chrome storage
      if (typeof chrome.storage !== 'undefined') {
        chrome.storage.sync.clear(resolve)
      }
      // delete from localstorage (dev mode) 
      else {
        localStorage.removeItem('tagitSenseQueryUrl')
        localStorage.removeItem('tagitSenseDestinationUrl')
        localStorage.removeItem('emailToTagWith')
        resolve()
      }
    })
  }

}

