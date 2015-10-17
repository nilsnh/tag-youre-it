declare var require;
declare var jQuery;
declare var $$;

var jquery = require('jquery');
var angular = require('angular');
var $$ = jquery;

class Menu {

  constructor () {
    console.log('New angular:')
    console.log(angular.version)
    console.log('New jquery:')
    console.log($$().jquery)

    setTimeout(function() {
      console.log('Still new angular:')
      console.log(angular.version)
      console.log('Still new jquery:')
      console.log($$().jquery)
    }, 4000)
  }

}

var menu = new Menu();