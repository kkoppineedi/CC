(function () {
    'use strict';

    var serviceId = 'datacontext';
    angular.module('app').factory(serviceId, ['common', 'entityManagerFactory', datacontext]);

    function datacontext(common, emFactory) {
        var EntityQuery = breeze.EntityQuery; 
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(serviceId); // info
        var logError = getLogFn(serviceId, 'error'); // error
        var logSuccess = getLogFn(serviceId, 'success'); // success
        var manager = emFactory.newManager();
        var primePromise; // call only once
        var $q = common.$q;

        var storeMeta = {
            isLoaded: {
                sessions: false,
                attendees: false
            }
        };

        var entityNames = {
            attendee: 'Person',
            person: 'Person',
            speaker: 'Person',
            session: 'Session',
            room: 'Room',
            track: 'Track',
            timeslot: 'TimeSlot'
        };

        var service = {
            getPeople: getPeople,
            getMessageCount: getMessageCount,
            getSessionPartials: getSessionPartials,
            getSpeakerPartials: getSpeakerPartials,
            getUORs: getUORs,
            getAttendees: getAttendees,
            prime: prime
        };

        return service;

        function getMessageCount() { return $q.when(72); }

        function getUORs() {
            var orderBy = 'code';
            var attendees = [];

            //if (_areAttendeesLoaded() && !forceRemote) {
            //    // get local data
            //    attendees = _getAllLocal(entityNames.attendee, orderBy);
            //    return $q.when(attendees);
            //}

            return EntityQuery.from('UORCodes')
                    .select('id, code, krs, description, level, class')
                    .orderBy(orderBy)
                    //.toType('Person')
                    .using(manager).execute()
                    .to$q(querySucceeded, _queryFailed);

            function querySucceeded(data) {
                attendees = data.results;
                _areAttendeesLoaded(true);
                log('Retrieved [UORs] from remote data source', attendees.length, true);
                return attendees;
            }
            

            //var people = [
            //    { code: '0000010', description: 'SPEEDING 1 MPH OVER LIMIT ', krs: 189390, level: 'Violation' },
            //    { code: '0000020', description: 'SPEEDING 2 MPH OVER LIMIT ', krs: 189390, level: 'Violation' },
            //    { code: '0000030', description: 'SPEEDING 3 MPH OVER LIMIT ', krs: 189390, level: 'Violation' },
            //    { code: '0000040', description: 'SPEEDING 4 MPH OVER LIMIT ', krs: 189390, level: 'Violation' },
            //    { code: '0000050', description: 'SPEEDING 5 MPH OVER LIMIT ', krs: 189390, level: 'Violation' },
            //    { code: '0000060', description: 'SPEEDING 6 MPH OVER LIMIT ', krs: 189390, level: 'Violation' },
            //    { code: '0000070', description: 'SPEEDING 7 MPH OVER LIMIT ', krs: 189390, level: 'Violation' }
            
            //];
            //return $q.when(people);
        }

        function getPeople() {
            var people = [
                { firstName: 'John', lastName: 'Papa', age: 25, location: 'Florida' },
                { firstName: 'Ward', lastName: 'Bell', age: 31, location: 'California' },
                { firstName: 'Colleen', lastName: 'Jones', age: 21, location: 'New York' },
                { firstName: 'Madelyn', lastName: 'Green', age: 18, location: 'North Dakota' },
                { firstName: 'Ella', lastName: 'Jobs', age: 18, location: 'South Dakota' },
                { firstName: 'Landon', lastName: 'Gates', age: 11, location: 'South Carolina' },
                { firstName: 'Haley', lastName: 'Guthrie', age: 35, location: 'Wyoming' }
            ];
            return $q.when(people);
        }

 

        function getAttendees(forceRemote) {
            var orderBy = 'firstName, lastName';
            var attendees = [];

            if (_areAttendeesLoaded() && !forceRemote) {
                // get local data
                attendees = _getAllLocal(entityNames.attendee, orderBy);
                return $q.when(attendees);
            }

            return EntityQuery.from('Persons')
                    .select('id, firstName, lastName, imageSource')
                    .orderBy(orderBy)
                    .toType('Person')
                    .using(manager).execute()
                    .to$q(querySucceeded, _queryFailed);

            function querySucceeded(data) {
                attendees = data.results;
                _areAttendeesLoaded(true);
                log('Retrieved [Attendees] from remote data source', attendees.length, true);
                return attendees;
            }
        }

        // gets called as soon as the app starts
        function prime() {

            // to ensure that this function os called only once, look for the existence of the object
            if (primePromise) return primePromise;

            // use promise
            primePromise = $q.all([getLookups(), getSpeakerPartials(true)])
                .then(extendMetadata)
                .then(success);
            return primePromise;

            function success() {
                setLookups();
                log('Primed the data');
            }
        }

        function extendMetadata() {
            var metadataStore = manager.metadataStore;
            var types = metadataStore.getEntityTypes();
            types.forEach(function (type) {
                if (type instanceof breeze.EntityType) {
                    set(type.shortName, type);
                }

                var personEntityName = entityNames.person;
                ['Speakers', 'Speaker', 'Attendees', 'Attendee'].forEach(function (r) {
                    set(r, personEntityName);
                });

                function set(resourceName, entityName) {
                    metadataStore.setEntityTypeForResourceName(resourceName, entityName);
                }
            });

        }

        function setLookups() {
          

            service.lookupCachedData = {
                rooms: _getAllLocal(entityNames.room, 'name'),
                tracks: _getAllLocal(entityNames.track, 'name'),
                timeslots: _getAllLocal(entityNames.timeslot, 'start')
            }
        }

        function _getAllLocal(resource, ordering, predicate) {
            return EntityQuery.from(resource)
                    .orderBy(ordering)
                    .where(predicate)
                    .using(manager)
                    .executeLocally();
        }

        function getLookups() {
            return EntityQuery.from('Lookups')
                    .using(manager).execute()
                    .to$q(querySucceeded, _queryFailed);
            function querySucceeded(data) {
                log('Retrieved [Lookups]', data, true);
                return true;
            }
        }

        function getUORPartials(forceRemote) {
            // create a condition
            var predicate = breeze.Predicate.create('isSpeaker', '==', true);
            var orderBy = 'firstName, lastName';
            var speakers;

            // since speakers are always loaded we need to check for _areSpeakersLoaded
            if (!forceRemote) {
                // get local data
                speakers = _getAllLocal(entityNames.speaker, orderBy, predicate);
                return $q.when(speakers);
            }

            return EntityQuery.from('Speakers')
                    .select('id, firstName, lastName, imageSource')
                    .orderBy(orderBy)
                    .toType('Person')
                    .using(manager).execute()
                    .to$q(querySucceeded, _queryFailed);

            function querySucceeded(data) {
                speakers = data.results;

                // since only these persons are speakers, lets set the isSpeaker property on the Person object to true
                for (var i = speakers.length; i--;) {
                    speakers[i].isSpeaker = true;
                }
                log('Retrieved [Speaker Partials] from remote data source', speakers.length, true);
                return speakers;
            }
        }

        function getSpeakerPartials(forceRemote) {
            // create a condition
            var predicate = breeze.Predicate.create('isSpeaker', '==', true);
            var orderBy = 'firstName, lastName';
            var speakers;  

            // since speakers are always loaded we need to check for _areSpeakersLoaded
            if (!forceRemote) {
                // get local data
                speakers = _getAllLocal(entityNames.speaker, orderBy, predicate);
                return $q.when(speakers);
            }

            return EntityQuery.from('Speakers')
                    .select('id, firstName, lastName, imageSource')
                    .orderBy(orderBy)
                    .toType('Person')
                    .using(manager).execute()
                    .to$q(querySucceeded, _queryFailed);

            function querySucceeded(data) {
                speakers = data.results;
                
                // since only these persons are speakers, lets set the isSpeaker property on the Person object to true
                for (var i = speakers.length; i--;){
                    speakers[i].isSpeaker = true;
                }
                log('Retrieved [Speaker Partials] from remote data source', speakers.length, true);
                return speakers;
            }
        }

        function getSessionPartials(forceRemote) {
            var orderBy = 'timeSlotId, level, speaker.firstName';
            var sessions;

            if (_areSessionsLoaded() && !forceRemote) {
                // get local data
                sessions = _getAllLocal(entityNames.session, orderBy);
                return $q.when(sessions);
            }

            return EntityQuery.from('Sessions')
                    .select('id, title, code, speakerId, trackId, timeSlotId, roomId, level')
                    .orderBy(orderBy)
                    .toType('Session')
                    .using(manager).execute()
                    .to$q(querySucceeded, _queryFailed);

            function querySucceeded(data) {
                sessions = data.results;
                _areSessionsLoaded(true);
                log('Retrieved [Session Partials] from remote data source', sessions.length, true);
                return sessions;
            }
        }

        function _queryFailed(error) {
            //var msg = config.appErrorPrefix + 'Error retrieving data.' + error.message;
            var msg =  'Error retrieving data.' + error.message;
            logError(msg, error);
            throw error;
        }

        function _areSessionsLoaded(value) {
            return _areItemsLoaded('sessions', value);
        }

        function _areAttendeesLoaded(value) {
            return _areItemsLoaded('attendees', value);
        }

        function _areItemsLoaded(key, value){
            if(value === undefined){
                return storeMeta.isLoaded[key]; // get
            }
            return storeMeta.isLoaded[key] = value; // set
        }
    }
})();