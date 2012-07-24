$(function(){
  hljs.initHighlightingOnLoad();
  
  /* Make menu bar to stay on top when the page scrolldowns */
  var isAbsolute = true;
  var $menuBar = $('#menu');
  $(window).scroll(function(e,v){
    var scrollTop = $(this).scrollTop() > 350;
    if (isAbsolute && scrollTop ) {
      $menuBar.css({position:'fixed',top:'0px'});
      isAbsolute = false;
    } else if (!isAbsolute && !scrollTop){
      isAbsolute = true;
      $menuBar.css({position:'absolute',top:'auto'});
    }
  })
  
  var menubar = new menu();
  menubar.make();
  
  /* scroll to anchors */
  var anchor = location.hash;
  if (anchor) {
    var text = anchor.substring(1);
    menubar.select(text);
  }
})

var menu = function(){
  this.menuElements = [];

  this.h1Count = 0;
  this.h2Count = 0;
  
  var _this = this;
  this.make = function(){
    $('#content-wrapper').children().each(function(){
      if(this.tagName == 'H1') {
        _this.menuElements.push(new menuElement(this,_this.h1Count));
        _this.h1Count++;
        _this.h2Count = 0;
      }

      if(this.tagName == 'H2')  {
        _this.menuElements[_this.h1Count-1].subelements.push(new subelement(this,_this.h2Count))
        _this.h2Count++;
      }
    })
  }
  this.select = function(str) {
    for(var i=0;i<_this.menuElements.length;i++) {
      var menuEl = _this.menuElements[i];
      if ( menuEl.urlText == str ) {
        menuEl.select();
        menuEl.showSubmenu();
        var scroll = menuEl.$oriEl.offset().top;
        scrollTo(scroll - 0.04*scroll - 20);
        return true;
      }
      for(var j=0;j<menuEl.subelements.length;j++) {
        var subMenu = menuEl.subelements[j];
        if(subMenu.urlText == str ) {
          menuEl.select();
          menuEl.showSubmenu();
          subMenu.select();
          var scroll = subMenu.$oriEl.offset().top;
          scrollTo(scroll - 0.04*scroll - 80);
          return true;
        }
      }
    }
    return false;
  }
}

var menuElement = function(orih1,h1Count) {
  this.subelements = [];
  this.$oriEl = $(orih1);
  this.$el;
  this.text = this.$oriEl.text();
  this.urlText = this.text.replace(/ /g,'_');
  
  var _this = this;

  var content = '<a href="#'+ _this.urlText +'">' + _this.text + '</a>';
  if ( h1Count > 0 ) {
    content += '<div class="separator"></div>';
  }
  _this.$el = $('<li>').html(content).appendTo('.mainbar ul').click(function(event){
    _this.select();
    scrollTo(_this.$oriEl.offset().top -50);
    $('.subbar').fadeOut('fast',function(){
      _this.showSubmenu();
    })
  })
  
  this.showSubmenu = function(){
    $('.subbar li').hide();
    if (_this.subelements.length > 0) {
      $('.subbar').fadeIn('fast');
      for(var i=0;i<_this.subelements.length;i++) {
        ( function(subelement){
          subelement.show();
          }
        )(_this.subelements[i]);
      }
    }
  }
  this.select = function(){
    $('.selected').removeClass('selected');
    _this.$el.addClass('selected');
  }
}

var subelement = function(oriEl,h2Count) {
  this.$oriEl = $(oriEl);
  this.text = this.$oriEl.text();
  this.urlText = this.text.replace(/ /g,'_');
  
  var _this = this;

  var content = '<a href="#'+ _this.urlText +'">' + _this.text + '</a>';
  if ( h2Count > 0 ) {
    content += '<div class="separator"></div>';
  }

  this.$el = $('<li>').html(content).appendTo('.subbar ul').click(function(event){
    _this.select();
    scrollTo(_this.$oriEl.offset().top -100);
  })
  this.show = function(){
    _this.$el.show();
  }
  this.select = function() {
    $('.subbar li').removeClass('selected')
    _this.$el.addClass('selected');
  }
}

var scrollTo = function(index) {
  var currentScroll = $(window).scrollTop();
  if (Math.abs(index - currentScroll) > 2000) {
    $('html,body').scrollTop(index);
  } else {
    $('html,body').animate({scrollTop: index},'slow');
  }
}