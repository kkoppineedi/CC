(function () {
    'use strict';

    var controllerId = 'attendees';

    // TODO: replace app with your module name
    angular.module('app').controller(controllerId,
        ['common','datacontext', 'config', attendees]);

    function attendees(common, datacontext, config) {
        var vm = this;
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);
        var keyCodes = config.keyCodes;

        // bindable properties
        vm.title = 'Attendees';
        vm.attendees = [];
        vm.attendeeCount = 0;
        vm.attendeeFilteredCount = 0;
        vm.attendeeSearch = '';
        vm.filteredAttendees = [];
        vm.search = search;
        vm.pageChanged = pageChanged;
        vm.paging = {
            currentPage: 1,
            maxPagesToShow: 5,
            pageSize: 15
        };
        vm.refresh = refresh;

        // ES5 property
        // extend the object to add a property called paging
        // define a getting to retrieve the value. the setting will be done via
        Object.defineProperty(vm.paging, 'pageCount', {
            get: function () {
                return Math.floor(vm.attendeeFilteredCount / vm.paging.pageSize) + 1;
            }
        });


        activate();

        function activate() {
            common.activateController([getAttendees()], controllerId)
                .then(function () {
                    log('Activated Attendees view');
                });
        }

       

        // get attendee count
        function getAttendeeCount() {
            return datacontext.getAttendeeCount().then(function (data) {
                // here we are setting the property as well as returning the data
                return vm.attendeeCount = data;
            });
        }

        // get filtered attendee count
        function getAttendeeFilteredCount() {
            vm.attendeeFilteredCount = datacontext.getFilteredCount(vm.attendeeSearch);
        }

        function getAttendees(forceRefresh) {
            return datacontext.getAttendees(forceRefresh,
                vm.paging.currentPage, vm.paging.pageSize, vm.attendeeSearch)
                .then(
                function (data) {
                    // data coming back
                    vm.attendees = data;

                    // get filtered count
                    getAttendeeFilteredCount();
                    // check if this data is available locally
                    if (!vm.attendeeCount || forceRefresh) {
                        getAttendeeCount();
                    }
                    return data;
            });
        }

        function search($event) {
            if ($event.keyCode === keyCodes.esc) {
                vm.attendeeSearch = '';
            }
            getAttendees();
        }

        function pageChanged(page) {
            if (!page) { return; }

            vm.paging.currentPage = page;
            getAttendees();
        }


        function refresh() {
            getAttendees(true);
        }

    }
})();
