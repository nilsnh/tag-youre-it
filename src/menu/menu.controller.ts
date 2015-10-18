'use strict';

interface IMenuScope extends angular.IScope {
  startData: Object[];
  testWord: String;
}

class MenuCtrl {

  testWord = "It's working"
  selectedWord = "No word yet"

  static $inject = ["$scope", "$log"]
  constructor($scope: any, $log: angular.ILogService) {
    $scope.vm = this;
  }

  remove() {
    $('.tagit-body').children().unwrap();
    $('.tagit-menu').remove();
  }

}

export = MenuCtrl;
