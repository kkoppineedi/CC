(function () {
    'use strict';

    var serviceId = 'model';

    // TODO: replace app with your module name
    angular.module('app').factory(serviceId, model);

    function model($http) {
        // Define the functions and properties to reveal.
        var service = {
            configureMetadataStore: configureMetadataStore
        };

        return service;

        function configureMetadataStore(metadataStore) {
            //TODO: register the session - tags
            registerSession(metadataStore);

            //TODO: register person - fullname
            registerPerson(metadataStore);

            // register timeslot - name
            registerTimeSlot(metadataStore);
        }

        //#region Internal Methods        

        function registerSession(metadataStore) {
            metadataStore.registerEntityTypeCtor('Session', Session);
            function Session() { }

            Object.defineProperty(Session.prototype, 'tagsFormatted', {
                get: function () {
                    return this.tags ? this.tags.replace(/\|/g, ', ') : this.tags;
                },
                set: function (value) {
                    this.tags = value.replace(/\, /g, '|');
                }
            });
        }

        function registerPerson(metadataStore) {
            metadataStore.registerEntityTypeCtor('Person', Person);

            function Person() {
                this.isSpeaker = false;
            }

            Object.defineProperty(Person.prototype, 'fullName', {
                get: function () {
                    var fn = this.firstName;
                    var ln = this.lastName;
                    return ln ? fn + ' ' + ln : fn;
                }
            });
        }

        function registerTimeSlot(metadataStore) {
            metadataStore.registerEntityTypeCtor('TimeSlot', TimeSlot);

            function TimeSlot() { }

            // we just created a new property on the object called name
            Object.defineProperty(TimeSlot.prototype, 'name', {
                get: function () {
                    // format the date
                    var start = this.start;

                    // using the moment js library here
                    var value = moment.utc(start).format('ddd hh:mm a');
                    return value;
                }
            });
        }


        //#endregion
    }
})();