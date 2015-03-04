var WaveformDisplay = (function() {
    var WaveformDisplay = function(canvas, buffer) {
        this.canvas = canvas; // the canvas
        this.width = canvas.clientWidth;
        this.height = canvas.clientHeight;

        this.context = canvas.getContext('2d'); // the canvas 2d-rendering context
        this.buffer = buffer; // the audio-buffer
        this.resolution = buffer.getChannelData(0).length / this.width; // frames per pixel

        this.peaks = [];
        this.maxPeak = -Infinity;
        this.cursorPos = 0;

        this.waveColor = '#1f6377';
        this.progressColor = '#1f6377';
        this.cursorColor = '#ee5f5b'

        this.getPeaks();
    };

    var __ = WaveformDisplay.prototype;

    __.progress = function(percents) {
        this.cursorPos = 0|(this.width * percents);
        this.redraw();
    };

    __.getPeaks = function() {
        // Frames per pixel
        var resolution = this.resolution,
            buffer = this.buffer;

        this.peaks = [];
        this.maxPeak = -Infinity;

        // find a value for each of the pixels…
        for (var peakIndex = 0; peakIndex < this.width; peakIndex++) {
            var sum = 0;

            // iterate through channels…
            for (var c = 0; c < buffer.numberOfChannels; c++) {
                var channelData = buffer.getChannelData(c),
                    channelDataChunk = channelData.subarray(peakIndex * resolution, (peakIndex + 1) * resolution);
                var peak = -Infinity;

                for (var p = 0, l = channelDataChunk.length; p < l; p++){
                    if (channelDataChunk[p] > peak){
                        peak = channelDataChunk[p];
                    }
                }
                sum += peak;
            }

            this.peaks[peakIndex] = sum;

            if (sum > this.maxPeak) {
                this.maxPeak = sum;
            }
        }
    };

    __.redraw = function () {
        var self = this;

        this.clear();

        // Draw WebAudio buffer peaks.
        if (this.peaks) {
            for(var i= 0, n=this.peaks.length; i<n; i++) {
                this.drawFrame(i, this.peaks[i], this.maxPeak);
            }
        }

        this.drawCursor();
    };

    __.clear = function () {
        this.context.clearRect(0, 0, this.width, this.height);
    };

    __.drawFrame = function (index, value, max) {
        var w = 1;
        var h = Math.round(value * (this.height / max));

        var x = index * w;
        var y = Math.round((this.height - h) / 2);

        if (this.cursorPos >= x) {
            this.context.fillStyle = this.progressColor;
        } else {
            this.context.fillStyle = this.waveColor;
        }

        this.context.fillRect(x, y, w, h);
    };

    __.drawCursor = function () {
        var w = 1;
        var h = this.height;

        var x = Math.min(this.cursorPos, this.width - w);
        var y = 0;

        this.context.fillStyle = this.cursorColor;
        this.context.fillRect(x, y, w, h);
    };

    return WaveformDisplay;
} ());