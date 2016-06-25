
export function AppConfigInitializer ($logProvider: ng.ILogProvider) {
  $logProvider.debugEnabled(true);
}

export class AppConfigService {
  serverUrl = 'https://imdb.uib.no/lexitags/lexitags/';
}

