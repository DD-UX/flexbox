(function(angular) {
  'use strict';

  /**
   * Each section of the site has its own module. It probably also has
   * submodules, though this boilerplate is too simple to demonstrate it. Within
   * `src/ng-app/states/home`, however, could exist several additional folders representing
   * additional modules that would then be listed as dependencies of this one.
   * For example, a `note` section could have the submodules `note.create`,
   * `note.delete`, `note.edit`, etc.
   *
   * Regardless, so long as dependencies are managed correctly, the build process
   * will automatically take take of the rest.
   *
   * The dependencies block here is also where component dependencies should be
   * specified, as shown below.
   */
  var module = window.mainApp + '.home';
  angular.module(module)

  /**
   * Each section or module of the site can also have its own routes. AngularJS
   * will handle ensuring they are all available at run-time, but splitting it
   * this way makes each module more "self-contained".
   */
  .config(Config)
    .controller('HomeController', HomeController);

  Config.$inject = ['$stateProvider'];

  function Config($stateProvider) {
    $stateProvider.state('home', {
      url: '/',
      views: {
        'main': {
          controller: 'HomeController',
          templateUrl: 'states/home/home__view.html',
          controllerAs: '$ctrl'
        }
      },
      data: {
        pageTitle: 'First date with Flex'
      }
    });
  }

  //Adding injections for HomeController
  HomeController.$inject = [];

  /**
   * HomeController
   * @constructor
   */
  function HomeController() {
    // Controller object
    var $ctrl = this;

  }

})(angular);























