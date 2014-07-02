(function () {
    'use strict';
    
    var app = angular.module('app', [
        // Angular modules 
        'ngAnimate',        // animations
        'ngRoute',          // routing
        'ngSanitize',       // sanitizes html bindings (ex: sidebar.js)

        // Custom modules 
        'common',           // common functions, logger, spinner
        'common.bootstrap', // bootstrap dialog wrapper functions

        // 3rd Party Modules
        'ui.bootstrap',      // ui-bootstrap (ex: carousel, pagination, dialog)
        'breeze.angular'
    ]);
    
    app.run(['breeze', function () { }]);

    // Handle routing errors and success events
    app.run(['$route', '$rootScope', '$q', 'datacontext',
        function ($route, $rootScope, $q, datacontext) {
        // Include $route to kick start the router.

            // call this to prime the app with some initial data
            datacontext.prime();

           // routemediator.updateDocTitle();
        }]);        
})();