//(function($, window) {
"use strict";

// an event-bus for global events
var
    events = new EventEmitter(),

    // audio-stuff
    loader,
    audioFiles,
    audioBuffers,
    context;



// first of all, we need an instance of the audio-context.
context = new AudioContext();

// the audio-files we need
audioFiles = [
    'media/No1Else/A3 Kick&Bas&Timbale.wav',
    'media/No1Else/C3 Op&Cl HiHat.wav',
    'media/No1Else/B1 CongaSolo.wav',
    'media/No1Else/C5 LouderBells.wav',
    'media/No1Else/D5 No1ElseSolo.wav'
];

// the audio-buffers resulting from the files…
audioBuffers = {
    bassline : null,
    hihats: null,
    conga: null,
    louderBells: null,
    vocals: null
};


// create a loader for the audio-files needed
loader = new BufferLoader(context, audioFiles, function(bufferList) {
    // the decoded audio-buffers are now ready to be used…
    audioBuffers.bassline = bufferList[0];
    audioBuffers.hihats = bufferList[1];
    audioBuffers.conga = bufferList[2];
    audioBuffers.louderBells = bufferList[3];
    audioBuffers.vocals = bufferList[4];

    initWaveforms(audioBuffers);

    events.emit('audioLoaded', audioFiles, bufferList);
});


function createBufferSource(buffer, loop, destinationNode) {
    loop = !!loop;
    destinationNode = destinationNode || context.destination;

    var source = context.createBufferSource();
    source.buffer = buffer;

    if(loop) {
        source.loop = true;
        source.loopStart = 0;
        source.loopEnd = buffer.length;
    }

    source.connect(destinationNode);

    return source;
}





var scheduler = new BeatgridScheduler(context, 126);
events.on('audioLoaded', function(filenames, buffers) {
    scheduler.start();
});





// kickoff loading when ready…
$(window).on('load', function() {
    // delay load-start, just for show…
    window.setTimeout(function() { loader.load(); }, 500);
});


// a bit of debugging…
events.on('audioLoaded', function(audioFiles, buffers) {
    var buffer;

    // oh, and hey… an AudioBuffer-instance contains some metadata, too:
    for(var i=0, n=audioFiles.length; i<n; i++) {
        buffer = buffers[i];

        console.groupCollapsed('[decodeAudio] metadata for ' + audioFiles[i]);
        console.log('length: ', buffer.duration, 's');
        console.log('channels: ', buffer.numberOfChannels);
        console.log('sample-rate: ', buffer.sampleRate, ' Hz');
        console.log('number of samples: ', buffer.length);
        console.groupEnd();
    }
});


var bufferSources = {},
    destinations = null,
    waveformDisplays = {};


function initWaveforms(audioBuffers) {
    // create a set of gain-nodes as destinations
    for(var sampleId in audioBuffers) {
        var canvas = $('.sample-container[data-sample-id='+sampleId+'] .waveform-display').get(0);
        waveformDisplays[sampleId] = new WaveformDisplay(canvas, audioBuffers[sampleId]);
        waveformDisplays[sampleId].redraw();
    }
}


function initDestinations() {
    destinations = {};
    // create a set of gain-nodes as destinations
    for(var sampleId in audioBuffers) {
        if(!destinations[sampleId]) {
            destinations[sampleId] = context.createGain();
            destinations[sampleId].connect(context.destination);
        }
    }
}

// play-button events
var $playButtons = $('.btn-play');

$playButtons.on('click', function(ev) {
    ev.preventDefault();

    var $btn = $(this),
        $container = $btn.parents('.sample-container'),
        syncStart = $container.find('.sync-start').hasClass('active'),
        syncStop = $container.find('.sync-stop').hasClass('active'),
        sampleId = $container.data('sampleId');

    if(!destinations) {
        initDestinations();
    }

    if(!bufferSources[sampleId]) {
        bufferSources[sampleId] = createBufferSource(audioBuffers[sampleId], true, destinations[sampleId]);
        $btn.addClass('active waiting');

        events.emit('sourceCreated', sampleId, bufferSources[sampleId]);

        var onStart = function() {
            $btn.removeClass('waiting');
            events.emit('sourceStarted', sampleId, bufferSources[sampleId]);
        };

        if(syncStart) {
            scheduler.startAligned(bufferSources[sampleId], 16, 0, onStart);
        } else {
            bufferSources[sampleId].start(0);
            onStart();
        }
    } else { // stop…
        $btn.addClass('waiting').removeClass('active');

        var onStop = function() {
            $btn.removeClass('waiting');

            events.emit('sourceStopped', sampleId);
            bufferSources[sampleId] = null;
        };

        if(syncStop) {
            scheduler.stopAligned(bufferSources[sampleId], 16, 0, onStop);
        } else {
            bufferSources[sampleId].stop(0);
            onStop();
        }
    }
});


events.on('audioLoaded', function(audioFiles, audioBuffers) {
    $playButtons.removeClass('disabled');
});


$('.volume').on('change', function() {
    var $fader = $(this), value = parseFloat($fader.val()),
        $display = $fader.siblings('.volume-display'),
        $container = $fader.parents('.sample-container'),
        sampleId = $container.data('sampleId');

    $display.text(value.toFixed(1));

    if(destinations[sampleId]) {
        destinations[sampleId].gain.value = value;
    }
});

//} (this.jQuery, this));