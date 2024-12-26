(function($) {
    
    $( function(){

        $(".journal-scroller").flickity({
            cellAlign: 'left',
            pageDots: false,
            freeScroll: true,
            contain: true,
            imagesLoaded: true,

        });


        $(window).load( function() {
            $(".journal-scroller").flickity('resize');
        });

    });


})(jQuery);