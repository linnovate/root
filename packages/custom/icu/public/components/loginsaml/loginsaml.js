"use strict";

angular
  .module("mean.icu.ui.saml", [])
  .controller("LoginSamlController", function(UsersService) {
    UsersService.saml();
  });
