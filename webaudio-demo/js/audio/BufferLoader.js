var BufferLoader;

(function(window) {
    "use strict";

    // BufferLoader-class from HTML5-Rocks (http://www.html5rocks.com/en/tutorials/webaudio/intro/js/buffer-loader.js)
    BufferLoader = (function() {
        // ---- constructor
        function BufferLoader(context, urlList, callback) {
            this.context = context;
            this.urlList = urlList;
            this.onload = callback;
            this.bufferList = [];
            this.loadCount = 0;
        }

        var __ = BufferLoader.prototype;

        // ---- instance-methods

        __.loadBuffer = function(url, index) {
            // Load buffer asynchronously
            var request = new XMLHttpRequest();
            request.open("GET", url, true);
            request.responseType = "arraybuffer";

            var loader = this;

            request.onerror = function() { console.error('BufferLoader: XHR error'); }
            request.onload = function() {
                // Asynchronously decode the audio file data in request.response
                loader.context.decodeAudioData(
                    request.response,
                    function __onDecodeComplete(buffer) {
                        if (!buffer) { console.error('BufferLoader: error decoding file data: ' + url); return; }

                        loader.bufferList[index] = buffer;
                        if (++loader.loadCount == loader.urlList.length) {
                            loader.onload(loader.bufferList);
                        }
                    },
                    function __onDecodeError(error) { console.error('BufferLoader: decodeAudioData error', error); }
                );
            }

            request.send();
        };

        __.load = function() {
            for (var i = 0; i < this.urlList.length; ++i) {
                this.loadBuffer(this.urlList[i], i);
            }
        };

        return BufferLoader;
    } ());
} (this));