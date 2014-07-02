(function () {
    'use strict';

    var controllerId = 'uors';

    // TODO: replace app with your module name
    angular.module('app').controller(controllerId,
        ['common','config', 'datacontext', uors]);

    function uors(common, config, datacontext) {
        var vm = this;
        var keyCodes = config.keyCodes;
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);
        var applyFilter = function () { };

        vm.filteredUors = [];
        vm.uors = [];
        vm.uorsSearch = '';
        vm.search = search;
        vm.uorsFilter = uorsFilter;
        vm.title = 'UORs';
        vm.refresh = refresh;

        activate();

        function activate() {
            common.activateController([getUORs()], controllerId)
            .then(function () {
                // createSearchThrottle uses values by convention, via its parameters:
                //  vm.uorsSearch is where the user enters the search
                //  vm.uors is the original unfiltered array
                //  vm.filteredUors is the fitlered array
                //  vm.uorsFilter is the filtering function
                applyFilter = common.createSearchThrottle(vm, 'uors');
                if (vm.uorsSearch) { applyFilter(true);}
                log('Activated UORs view');
            });

        }

        function refresh() {
            getUORs(true);
        }

        function getUORs(forceRemote) {
            return datacontext.getUORs().then(
                function (data) {
                    return vm.uors = vm.filteredUors = data;
                }
            );
        }

        

        function search($event) {
            if ($event.keyCode === keyCodes.esc) {
                vm.uorSearch = '';
                applyFilter(true);
                //} else {
                //   applyFilter();
            } else if ($event.type === 'click' || $event.keyCode === keyCodes.enter){
                applyFilter();
            }
        }

        function uorsFilter(uor) {
            var textContains = common.textContains;
            var searchText = vm.uorsSearch;
            var isMatch = searchText ?
                textContains(uor.code, searchText)
                || textContains(uor.krs, searchText)
                || textContains(uor.description, searchText)
                || textContains(uor.level, searchText)
                : true;

            return isMatch;
        }
    }
})();
