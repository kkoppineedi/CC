(function () {
    'use strict';

    var controllerId = 'attendees';

    // TODO: replace app with your module name
    angular.module('app').controller(controllerId,
        ['common','datacontext', attendees]);

    function attendees(common, datacontext) {
        var vm = this;
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);

        // bindable properties
        vm.title = 'Attendees';
        vm.attendees = [];
        vm.refresh = refresh;

        activate();

        function activate() {
            common.activateController([getAttendees()], controllerId)
                .then(function () {
                    log('Activated Attendees view');
                });
        }

        function refresh() {
            getAttendees(true);
        }

        function getAttendees(forceRemote) {
            return datacontext.getAttendees(forceRemote).then(
                function (data) {
                    return vm.attendees = data;
            });
        }
    }
})();
