var AudioScheduler;

(function(window) {
    "use strict";

    AudioScheduler = (function() {
        // constants
        var EV_START = 1,
            EV_STOP = 0,
            EV_CALLBACK = 2;

        // ---- constructor

        function AudioScheduler(audioContext, options) {
            this.startTime = null;

            this.audioContext = audioContext;
            this.options = options || {};

            this.lookaheadTime = this.options.lookaheadTime || 0.1;
            this.tickInterval = 50;

            this.intervalTimer = null;
            this.queue = [];
        }

        // alias for the prototype
        var __ = AudioScheduler.prototype;

        // ---- instance-methods

        /**
         * starts the audio-scheduler. This simply starts an interval-timer calling
         * the dispatcher-function.
         */
        __.start = function() {
            var self = this;

            this.intervalTimer = window.setInterval(function() {
                _dispatch(self.queue, self.audioContext.currentTime, self.lookaheadTime);
            }, this.tickInterval);
        };

        /**
         * schedules an audio-source to be started at a specified time.
         *
         * @param source {AudioSourceNode} the source-node to be started
         * @param time {Number} the time (relative to audioContext.currentTime) when the
         *     source should start playing
         * @param callback {Function} [optional]  function to be called when the source
         *     starts playing
         */
        __.scheduleStart = function(source, time, callback) {
            console.log('scheduleStart', time);

            _schedule(this.queue, EV_START, time||0, { source: source });

            if(callback) {
                _schedule(this.queue, EV_CALLBACK, time||0, { callback: callback });
            }
        };


        /**
         * schedules an audio-source to be stopped at a specified time.
         *
         * @param source {AudioSourceNode} the source-node to be stopped
         * @param time {Number} the time (relative to audioContext.currentTime) when the
         *     source should stop playing
         * @param callback {Function} [optional]  function to be called when the source
         *     stops playing
         */
        __.scheduleStop = function(source, time, callback) {
            console.log('scheduleStop', time);

            _schedule(this.queue, EV_STOP, time||0, { source: source });

            if(callback) {
                _schedule(this.queue, EV_CALLBACK, time||0, {callback: callback});
            }
        };

        /**
         * schedules a callback to be called at a specified time.
         *
         * @param time {Number} the time (relative to audioContext.currentTime) when the
         *     callback should be invoked
         * @param callback {Function} [optional]  function to be called
         */
        __.scheduleCallback = function(time, callback) {
            console.log('sheduleCallback', time);

            _schedule(this.queue, EV_CALLBACK, time, { callback: callback });
        };


        // ---- private functions


        /**
         * schedules a new event
         *
         * @param queue {Array}  the event-queue
         * @param type {int}  event-type, must be one of EV_START, EV_STOP or EV_CALLBACK
         * @param time  {Number}  the time at which the event should be dispatched
         * @param options {Object}  additional-options, depending on the type of event
         * @private
         */
        function _schedule(queue, type, time, options) {
            var ev = { type: type, startTime: time };

            // copy options into event
            if(options) {
                var props = Object.keys(options);
                for(var i=0, n=props.length; i<n; i++) {
                    var prop = props[i];
                    ev[prop] = options[prop];
                }
            }

            queue.push(ev);
            _sortEvents(queue);
        }


        /**
         * dispatcher. Is called repeatedly to look for events to be started within
         * the current scheduler-window (determined by the lookahead-time).
         *
         * @param queuedEvents {Array}  the list of current events
         * @param currentTime {Number}  the currentTime of the audio-context
         * @param lookaheadTime {Number}  time (in ms) to be looked ahead for events to be scheduled.
         * @private
         */
        function _dispatch(queuedEvents, currentTime, lookaheadTime) {
            var lookaheadWindowEnd, ev;

            // nothing to do?
            if(queuedEvents.length === 0) { return; }

            lookaheadWindowEnd = currentTime + lookaheadTime;

            // events are ordered by start time when inserted
            // if the event is outside of our lookahead-window, we may quit.
            while(queuedEvents.length > 0 && (queuedEvents[0].startTime < lookaheadWindowEnd)) {
                ev = queuedEvents.shift();

                if(ev.type === EV_START) {
                    console.log('[_dispatch: start] time', ev.startTime);

                    ev.source.start(ev.startTime);
                } else if (ev.type === EV_STOP) {
                    console.log('[_dispatch: stop] time', ev.startTime);

                    ev.source.stop(ev.startTime);
                    ev.source.disconnect();
                } else if (ev.type === EV_CALLBACK) {
                    console.log('[_dispatch: callback] time', ev.startTime);

                    // try to fire at exactly the right time
                    (function(callback, dt) {
                        window.setTimeout(function() {
                            callback();
                        }, 0|dt);
                    } (ev.callback, ev.startTime - currentTime));
                }
            }
        }


        /**
         * sorts the list of events in the queue by startTime
         *
         * @param queue
         * @private
         */
        function _sortEvents(queue) {
            queue.sort(function (a, b) { return a.startTime - b.startTime; });
        }


        return AudioScheduler;
    }());
} (this));