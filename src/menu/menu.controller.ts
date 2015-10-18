'use strict';

interface IMenuScope extends angular.IScope {
  startData: Object[];
  testWord: String;
}

class MenuCtrl {

  testWord = "It's working"
  selectedWord = "No word yet"

  static $inject = ["$scope", "$log", "SelectedWordService"]

  constructor($scope: any, $log: angular.ILogService, SelectedWordService: any) {
    $scope.vm = this;
    SelectedWordService.init();
  }

  remove() {
    $('.tagit-body').children().unwrap();
    $('.tagit-menu').remove();
  }

}

export = MenuCtrl;
