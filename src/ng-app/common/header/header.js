(function(angular) {
  'use strict';
  /**
   * Header controller
   */
  var module = window.mainApp + '.common';

  angular.module(module)
    .controller('HeaderController', HeaderController);
  
  
  HeaderController.$inject = [];
  
  /**
   * HeaderController
   * @constructor
   */
  function HeaderController() {
    var $ctrl = this;
    
    // Is the long nav collapsed?
    $ctrl.isLongNavCollapsed = true;
    
  }


})(angular);
