$(function(){
  hljs.initHighlightingOnLoad();
  
  $.each($('h1','#content-wrapper'),function(i,val){
    var $el = $(this);
    var content = '<a href="#">' + $el.text() + '</a>';
    if (i > 0) {
      content += '<div class="separator"></div>';
    }
    $('<li>').html(content).appendTo('.mainbar ul').click(function(){
      $menuItem = $(this)
      $('.selected').removeClass('selected');
      $menuItem.addClass('selected');
      $('.subbar ul').fadeOut('fast',function(){
        $(this).empty();
        $.each($('h2',$el.next('.article')),function(i,val){
          var $self = $(this)
          var content = '<a href="#">' + $self.text() + '</a>';
          if (i > 0) {
            content += '<div class="separator"></div>';
          }         
          var $subMenuItem = $('<li>').html(content).appendTo('.subbar ul').click(function(){
            $('.subbar li').removeClass('selected')
            $(this).addClass('selected');
            
            $('html,body').animate({scrollTop: $self.offset().top},'slow');
          })
        })
        $(this).fadeIn('fast');
      })
    })
  })
})