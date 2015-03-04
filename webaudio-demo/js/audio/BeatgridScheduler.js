(function(window, AudioScheduler) {
    /**
     * the beatgrid-scheduler schedules audio-events within a continuous grid of a given precision.
     */
    function BeatgridScheduler(audioContext, bpm) {
        AudioScheduler.call(this, audioContext);

        this.bpm = bpm;
    }

    extend(BeatgridScheduler, AudioScheduler);


    var __ = BeatgridScheduler.prototype;


    /**
     * plays the given source aligned with the beat-grid specified by the alignment and offset.
     *
     * @example with a 4/4-beat
     *
     *     1               2               3               4               5
     *     |---+---+---+---|---+---+---+---|---+---+---+---|---+---+---+---|--
     *     |               |               |               |               |
     *     |         t     X     t         X  t            X               |    alignment: 4 (1 bar), offset: 0
     *     |               |        t      |               |               X    alignment: 16 (4 bars), offset: 0
     *     | t X          tX               |               |    t  X       |    alignment: 1 (1/4-note), offset: 0
     *     |t  X   t   X  t|   X           |            t  |   X           |    alignment: 2 (2/4-notes), offset: 1
     *     |tX t X         |          t  X |            tX |               |    alignment: 1 (1/4-notes), offset: 0.5
     *
     *
     *     t – time when event was triggered
     *     X - time when the sample starts playing
     *
     * to summarize: whenever a note is triggered, it will be played according to it's alignment and offset
     * at the very next possible position within the grid.
     *
     * @param source {AudioSourceNode}  the source to be played
     * @param alignment {Number}  quantisation. The number of beats with which to align the playback (see above)
     * @param offset {Number} [optional]  shifting (in number of beats) off the grid
     * @param callback {Function} [optional]  a function to be called when the playback actually starts
     */
    __.startAligned = function(source, alignment, offset, callback) {
        this.scheduleStart(source, _getAlignedTime(this.audioContext.currentTime, this.bpm, alignment, offset), callback);
    };

    /**
     * same as play aligned, just for stopping.
     *
     * @param source
     * @param alignment
     * @param offset
     * @param callback
     */
    __.stopAligned = function(source, alignment, offset, callback) {
        this.scheduleStop(source, _getAlignedTime(this.audioContext.currentTime, this.bpm, alignment, offset), callback);
    };

    __.callbackAligned = function(alignment, offset, callback) {
        this.scheduleCallback(_getAlignedTime(this.audioContext.currentTime, this.bpm, alignment, offset), callback);
    }


    // ---- private functions


    /**
     * calculates the next time in the grid with a given alignment and offset
     *
     * @param alignment
     * @param offset
     * @returns {number}
     * @private
     */
    function _getAlignedTime(currentTime, bpm, alignment, offset) {
        var secPerBeat = 60 / bpm,
            alignmentPeriod = alignment * secPerBeat,
            nextPeriodNumber = Math.ceil(currentTime / alignmentPeriod),
            nextPeriodStart = alignmentPeriod * nextPeriodNumber,
            startTime = nextPeriodStart,
            offsetTime;

        if (offset) {
            offsetTime = offset * secPerBeat;
            startTime += offsetTime;
        }

        // a bit of debugging…
        console.groupCollapsed('[_getAlignedTime] alignment', alignment, 'offset', offset);
        console.log('bpm', bpm);
        console.log('secPerBeat', secPerBeat);
        console.log('alignmentPeriod', alignmentPeriod);
        console.log('nextPeriod', nextPeriodNumber, '(t=', currentTime, ')');
        console.log('nextPeriodStart', nextPeriodStart);
        console.log('offsetTime', offsetTime);
        console.log('startTime', startTime);
        console.groupEnd();

        return startTime;
    }

    window.BeatgridScheduler = BeatgridScheduler;
} (this, AudioScheduler));
