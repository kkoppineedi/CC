(function () {
    'use strict';

    var serviceId = 'routemediator';

    // TODO: replace app with your module name
    angular.module('app')
        .factory(serviceId,
            ['$rootScope', 'config', routemediator]);

    function routemediator($rootScope, config) {
        // Define the functions and properties to reveal.
        var service = {
            updateDocTitle: updateDocTitle
        };

        return service;

        function updateDocTitle() {
            $rootScope.$on('$routeChangeSuccess',
                function(event, current, previous){
                    var title = config.docTitle + ' ' + (current.title || '');
                    $rootScope.title = title;
                });
        }

        //#region Internal Methods        

        //#endregion
    }
})();