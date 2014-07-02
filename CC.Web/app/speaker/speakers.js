(function () {
    'use strict';

    var controllerId = 'speakers';

    // TODO: replace app with your module name
    angular.module('app').controller(controllerId,
        ['common', 'datacontext', speakers]);

    function speakers(common, datacontext) {
        var vm = this;

        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);

        vm.speakers = [];
        vm.title = 'Speakers';
        vm.refresh = refresh;

        activate();

        function activate() {
            common.activateController([getSpeakers()], controllerId)
            .then(function () {
                log('Activated Speakers view');
            });

        }

        function refresh() {
            getSpeakers(true);
        }

        function getSpeakers(forceRemote) {
            return datacontext.getSpeakerPartials(forceRemote).then(
                function (data) {
                    return vm.speakers = data;
                }
            );
        }
    }
})();
