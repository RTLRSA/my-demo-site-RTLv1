(function($) {
    
    $( function(){
        
//        $(".journal-carousel").flickity({
  //          pageDots: true,
 //           contain: true,
  //          imagesLoaded: true
   //     });

        $(window).load( function() {
            $(".journal-carousel").flickity('resize');
        });
    });

})(jQuery);