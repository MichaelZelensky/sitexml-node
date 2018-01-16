/*
(c) 2012 Michael Zelensky
www.miha.in
*/

var timeout    = 500; // milliseconds
var closetimer = false;
var ddmenuitem = false;
var ditem = false;
var firsttime = true;
var wait = false;
var topoffset = 180; //pixels
var leftoffset = 150;

function jsddm_open() {
  //do nothing if there is no sub
  if(!$(this).find('ul').html()) return false;
  //hide subsub
  var subsub = $(this).find('ul').find('ul');
  subsub.addClass('hidden');
  if ($.browser.msie) {
    topoffset1 = topoffset + 3;
    leftoffset1 = leftoffset - 2;
  } else {
    topoffset1 = topoffset;
    leftoffset1 = leftoffset;
  }
  $(this).find('ul').css('top', $(this).offset().top - topoffset1 + 'px');
  $(this).find('ul').css('left', $(this).offset().left + leftoffset1 + 'px');
  jsddm_canceltimer();
  jsddm_close();
  if (!wait && firsttime) {
    wait = true;
    ddmenuitem = $(this).find('ul').
      slideDown('fast',function(){
        firsttime=false; 
        wait=false;
      });
  } else if(!wait) {
    ddmenuitem = $(this).find('ul').show();
  }
  subsub.hide();
}

function jsddm_close(){
  //if (!wait) if(ddmenuitem) ddmenuitem.hide();
  if(ddmenuitem) ddmenuitem.hide();
}

function jsddm_final_close() {  
  wait = true;
  jsddm_canceltimer();
  if(ddmenuitem) ddmenuitem.slideUp('slow', function(){firsttime=true; wait=false});
}

function jsddm_timer(){
  if(!$(this).find('ul').html()) return false;
  closetimer = window.setTimeout(jsddm_final_close, timeout);
}

function jsddm_canceltimer(){
  if(closetimer) {
    window.clearTimeout(closetimer);
    closetimer = null;
  }
}

$(function(){
  //apply round border, showdow, transparency styles, make sure you specified it in your stylesheet
  $('ul#menu li ul').addClass('round-border');
  $('ul#menu li').addClass('round-border');
  $('ul#menu li ul li').removeClass('round-border');
  $('ul#menu li ul').addClass('shadow');
  $('ul#menu li ul').addClass('transparent');
  $('ul#menu li ul').hide(); //hide subs
  //drop down
  $('ul#menu > li').bind('mouseover', jsddm_open);
  $('ul#menu > li').bind('mouseout',  jsddm_timer);  
  //:hover menu for IE
  if ($.browser.msie) {
    $('ul#menu ul li').addClass('bgc1');
    $('ul#menu > li, ul#menu ul li').hover(function(){
      // alert($(this).css('background-color'))
      $(this).addClass('bgc3'); //mouseon
      // alert($(this).css('background-color'))
    },function(){
      $(this).removeClass('bgc3'); //mouseoff
    });
    // $('ul#menu > li > ul > li').hover(function(){
      // $(this).addClass('bgc3'); //mouseon
    // },function(){
      // $(this).removeClass('bgc3'); //mouseoff
    // });
  }
});

function append_h2_ancors(selector) {
    html = '<p class="page_ancors">';
    var h2s = $('h2');
    var ancor = '';
    var i = 0;
    $.each(h2s, function(index, h2){
	i++;
	ancor = Math.floor(Math.random()*1000000);
	html += '<a href="#' + ancor + '">' + $(h2).text() + '</a> ';
	$(h2).before('<a name="'+ ancor +'"></a>');
    })
    html += '</p>';
    if (i>0) $(selector).after(html);
}