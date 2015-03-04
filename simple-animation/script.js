(function($) {
    'use strict';

    $('.follow').css('position', 'absolute');

    $(document).on('mousemove', function __onMouseMove(ev) {
        $('.follow').css('left', ev.pageX - $('.follow').width()/2);
        $('.follow').css('top', ev.pageY - $('.follow').height()/2);
    });
} (jQuery));