(function(angular) {
  'use strict';
  /**
   * Header controller
   */
  var module = window.mainApp + '.common';

  angular.module(module)
    .controller('HeaderController', HeaderController);
  
  
  HeaderController.$inject = ['loginService'];
  
  /**
   * HeaderController
   * @constructor
   */
  function HeaderController(loginService) {
    var $ctrl = this;
    
    // Logout method
    $ctrl.logout = loginService.logout;
    
    // Is the long nav collapsed?
    $ctrl.isLongNavCollapsed = true;
    
  }


})(angular);
