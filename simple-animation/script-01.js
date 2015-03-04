(function($) {
    'use strict';

    $('.animation-1').css('position', 'absolute');

    var t0 = Date.now();
    window.setInterval(function() {
        var t = Date.now() - t0;
        var x1 = Math.sin(t*Math.PI/(5 * 1000)) * window.innerWidth/3;
        var y1 = Math.cos(t*Math.PI/(5 * 1000)) * window.innerHeight/3;

        var x2 = Math.sin(t*Math.PI/(5 * 1000) + Math.PI) * window.innerWidth/3;
        var y2 = Math.cos(t*Math.PI/(5 * 1000) + Math.PI) * window.innerHeight/3;

        $('.animation-1')
            .css('top', window.innerHeight/2 + y1 - $('.animation-1').height()/2)
            .css('left', window.innerWidth/2 + x1 - $('.animation-1').width()/2);

        $('.animation-2')
            .css('top', window.innerHeight/2 + y2 - $('.animation-1').height()/2)
            .css('left', window.innerWidth/2 + x2 - $('.animation-1').width()/2);

    }, 1000/25);
} (jQuery));