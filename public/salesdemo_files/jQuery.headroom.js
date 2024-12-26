/*!
 * headroom.js v0.9.4 - Give your page some headroom. Hide your header until you need it
 * Copyright (c) 2017 Nick Williams - http://wicky.nillia.ms/headroom.js
 * License: MIT
 */
(function($){if(!$){return}
$.fn.headroom=function(option){return this.each(function(){var $this=$(this),data=$this.data('headroom'),options=typeof option==='object'&&option;options=$.extend(!0,{},Headroom.options,options);if(!data){data=new Headroom(this,options);data.init();$this.data('headroom',data)}
if(typeof option==='string'){data[option]();if(option==='destroy'){$this.removeData('headroom')}}})};$('[data-headroom]').each(function(){var $this=$(this);$this.headroom($this.data())})}(window.Zepto||window.jQuery))