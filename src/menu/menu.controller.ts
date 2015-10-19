'use strict';

interface IMenuScope extends angular.IScope {
  startData: Object[];
  testWord: String;
}

class MenuCtrl {

  testWord = "It's working"
  selectedWord = "No word yet"

  static $inject = ["$scope", "$log", "SelectedWordService", "DataService"]

  constructor($scope: any, $log: angular.ILogService,
    SelectedWordService: any, DataService : any) {
    $scope.vm = this;
    SelectedWordService.controllerToNotify = this.onWordSelected;
  }

  onWordSelected (newWord : string) {
    this.selectedWord = newWord;
  }

  remove() {
    $('.tagit-body').children().unwrap();
    $('.tagit-menu').remove();
  }

}

export = MenuCtrl;
