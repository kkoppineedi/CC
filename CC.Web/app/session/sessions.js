(function () {
    'use strict';

    var controllerId = 'sessions';

    // TODO: replace app with your module name
    angular.module('app').controller(controllerId,
        ['common', 'datacontext', sessions]);

    function sessions(common, datacontext) {
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);

        var vm = this;

        vm.sessions = []; // our variable to hold the session information
        vm.refresh = refresh;

        vm.title = 'Sessions';

        // call activate
        activate();

        function activate() {
            // TODO: get our sessions
            var promises = [getSessions()];
            common.activateController(promises, controllerId)
                .then(function () { log('Activated Sessions View'); });
        }

        function refresh() {
            getSessions(true);
        }

        function getSessions(forceRemote) {
            return datacontext.getSessionPartials(forceRemote)
                .then(function (data) {
                return vm.sessions = data;
            })
        }

    }
})();
