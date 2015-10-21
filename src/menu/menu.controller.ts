module tagIt {
  'use strict';

  interface IMenuScope extends angular.IScope {
    startData: Object[];
    testWord: String;
  }

  export class MenuCtrl {

    testWord = "It's working";
    selectedWord = "No word yet";

    static $inject = ["$scope", "$log", "DataService", "SelectedWordService"];
    constructor($scope: any, $log: angular.ILogService,
      DataService: DataService,
      SelectedWordService: SelectedWordService) {
      $scope.vm = this;
      SelectedWordService.controllerToNotify = this.onWordSelected;
      window.setTimeout(function() {
        $log.debug('should be new version of jquery');
        $log.debug(jQuery.fn);
      }, 2000);
    }

    onWordSelected (newWord : string) {
      this.selectedWord = newWord;
    }

    remove() {
      $('.tagit-body').children().unwrap();
      $('.tagit-menu').remove();
    }

  }
}
