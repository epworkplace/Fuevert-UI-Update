!function(i,t){i.Slider=function(t,s){this.$el=i(s),this._init(t)},i.Slider.defaults={current:0,bgincrement:50,autoplay:!1,interval:4e3},i.Slider.prototype={_init:function(t){this.options=i.extend(!0,{},i.Slider.defaults,t),this.$slides=this.$el.children("div.da-slide"),this.slidesCount=this.$slides.length,this.current=this.options.current,(this.current<0||this.current>=this.slidesCount)&&(this.current=0),this.$slides.eq(this.current).addClass("da-slide-current");for(var s=i('<nav class="da-dots"/>'),n=0;n<this.slidesCount;++n)s.append("<span/>");s.appendTo(this.$el),this.$pages=this.$el.find("nav.da-dots > span"),this.$navNext=this.$el.find("span.da-arrows-next"),this.$navPrev=this.$el.find("span.da-arrows-prev"),this.isAnimating=!1,this.bgpositer=0,this.cssAnimations=Modernizr.cssanimations,this.cssTransitions=Modernizr.csstransitions,this.cssAnimations&&this.cssAnimations||this.$el.addClass("da-slider-fb"),this._updatePage(),this._loadEvents(),this.options.autoplay&&this._startSlideshow()},_navigate:function(i,t){var s,n=this.$slides.eq(this.current),e=this;if(this.current===i||this.isAnimating)return!1;this.isAnimating=!0;var a,r,o;if(o=t||(i>this.current?"next":"prev"),this.cssAnimations&&this.cssAnimations&&("next"===o?(a="da-slide-toleft",r="da-slide-fromright",++this.bgpositer):(a="da-slide-toright",r="da-slide-fromleft",--this.bgpositer),this.$el.css("background-position",this.bgpositer*this.options.bgincrement+"% 0%")),this.current=i,s=this.$slides.eq(this.current),this.cssAnimations&&this.cssAnimations){var d="da-slide-toleft da-slide-toright da-slide-fromleft da-slide-fromright";n.removeClass(d),s.removeClass(d),n.addClass(a),s.addClass(r),n.removeClass("da-slide-current"),s.addClass("da-slide-current")}this.cssAnimations&&this.cssAnimations||(s.css("left","next"===o?"100%":"-100%").stop().animate({left:"0%"},1e3,function(){e.isAnimating=!1}),n.stop().animate({left:"next"===o?"-100%":"100%"},1e3,function(){n.removeClass("da-slide-current")})),this._updatePage()},_updatePage:function(){this.$pages.removeClass("da-dots-current"),this.$pages.eq(this.current).addClass("da-dots-current")},_startSlideshow:function(){var i=this;this.slideshow=setTimeout(function(){var t=t=i.current<i.slidesCount-1?i.current+1:0;i._navigate(t,"next"),i.options.autoplay&&i._startSlideshow()},this.options.interval)},page:function(i){if(i>=this.slidesCount||i<0)return!1;this.options.autoplay&&(clearTimeout(this.slideshow),this.options.autoplay=!1),this._navigate(i)},_loadEvents:function(){var t=this;this.$pages.on("click.cslider",function(s){return t.page(i(this).index()),!1}),this.$navNext.on("click.cslider",function(i){t.options.autoplay&&(clearTimeout(t.slideshow),t.options.autoplay=!1);var s=s=t.current<t.slidesCount-1?t.current+1:0;return t._navigate(s,"next"),!1}),this.$navPrev.on("click.cslider",function(i){t.options.autoplay&&(clearTimeout(t.slideshow),t.options.autoplay=!1);var s=s=t.current>0?t.current-1:t.slidesCount-1;return t._navigate(s,"prev"),!1}),this.cssTransitions&&(this.options.bgincrement?this.$el.on("webkitTransitionEnd.cslider transitionend.cslider OTransitionEnd.cslider",function(i){i.target.id===t.$el.attr("id")&&(t.isAnimating=!1)}):this.$el.on("webkitAnimationEnd.cslider animationend.cslider OAnimationEnd.cslider",function(i){"toRightAnim4"!==i.originalEvent.animationName&&"toLeftAnim4"!==i.originalEvent.animationName||(t.isAnimating=!1)}))}};var s=function(i){this.console&&console.error(i)};i.fn.cslider=function(t){if("string"==typeof t){var n=Array.prototype.slice.call(arguments,1);this.each(function(){var e=i.data(this,"cslider");e?i.isFunction(e[t])&&"_"!==t.charAt(0)?e[t].apply(e,n):s("no such method '"+t+"' for cslider instance"):s("cannot call methods on cslider prior to initialization; attempted to call method '"+t+"'")})}else this.each(function(){i.data(this,"cslider")||i.data(this,"cslider",new i.Slider(t,this))});return this}}(jQuery);