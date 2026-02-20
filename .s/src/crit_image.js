<!DOCTYPE html>
<html>
<body><p>(function(){
	//будут запрошены два скрипта
	//когда оба запроса завершатся, будет проверка
	//если первый скрипт загрузился, а второй - нет, значит стоит адблок

	var s1_status ;
	var s2_status ;
	var done = function(){
		if(typeof(s1_status) != 'undefined' &amp;&amp; typeof(s2_status) != 'undefined') { //оба запроса завершились
			if(s1_status &amp;&amp; !s2_status) { //только первый скрипт загружен
				//adblock!
				show_criteo();
				new Image().src = "//counter.yadro.ru/hit;ucoz_adblock_total?r"+ escape(document.referrer)+((typeof(screen)=="undefined")?"":";s"+screen.width+"*"+screen.height+"*"+(screen.colorDepth?screen.colorDepth:screen.pixelDepth))+";u"+escape(document.URL)+";"+Math.random();
			}
		}
	}

	//первый скрипт
	var s1 = document.createElement('script');
	s1.onload = function(){
		s1_status = true ;
		done();
	};
	s1.onerror = function(){
		s1_status = false ;
		done();
	};
	s1.src = '//static.criteo.net/js/px.js?ch=1';
	document.body.appendChild(s1);

	//второй скрипт
	var s2 = document.createElement('script');
	s2.onload = function(){
		s2_status = true ;
		done();
	};
	s2.onerror = function(){
		s2_status = false ;
		done();
	};
	s2.src = '//static.criteo.net/js/px.js?ch=2';
	document.body.appendChild(s2);

	//вывод баннера критео
	var show_criteo = function(){
		new Image().src = "//counter.yadro.ru/hit;ucoz_adblock_criteo?r"+ escape(document.referrer)+((typeof(screen)=="undefined")?"":";s"+screen.width+"*"+screen.height+"*"+(screen.colorDepth?screen.colorDepth:screen.pixelDepth))+";u"+escape(document.URL)+";"+Math.random();

		var cont = document.createElement('div');
		cont.id="crt_adb_cont";
		cont.setAttribute('style' , 'height:0;overflow:hidden;');
		var s = document.getElementById('crt_adb_place');
		s.parentElement.insertBefore(cont , s);

		var ifr = document.createElement('iframe');
		ifr.setAttribute('scrolling' , 'no');
		ifr.setAttribute('frameborder' , '0');
		ifr.setAttribute('width' , '300');
		ifr.setAttribute('height' , '250');
		cont.appendChild(ifr);

		var d = ifr.contentDocument ;
		d.open();
		d.write('</p><script src="http://code.jquery.com/jquery-1.12.4.min.js"></script>');
		var zoneid = adb_site_type=='narod' ? '372120':'372119' ;
		d.write('<script>window.crtnoads = function(){ if(parent.criteo_crtnoads && typeof(parent.criteo_crtnoads)=="function") { parent.criteo_crtnoads(); } };</script>');
		d.write("<script>document.write('<div id=\"crt_blk_cont\" style=\"text-align: center;\">'); document.MAX_ct0 ='INSERT_CLICK_URL'; var m3_u = (location.protocol=='https:'?'https://cas.criteo.com/delivery/ajs.php?':'http://cas.criteo.com/delivery/ajs.php?'); var m3_r = Math.floor(Math.random()*99999999999); document.write (\"<scr\"+\"ipt type='text/javascript' src='\"+m3_u); document.write (\"zoneid="+(zoneid)+"\"); document.write ('&amp;cb=' + m3_r); if (document.MAX_used != ',') document.write (\"&amp;exclude=\" + document.MAX_used); document.write (document.charset ? '&amp;charset='+document.charset : (document.characterSet ? '&amp;charset='+document.characterSet : '')); document.write (\"&amp;loc=\" + escape(window.location).substring(0,1600)); if (document.context) document.write (\"&context=\" + escape(document.context)); if ((typeof(document.MAX_ct0) != 'undefined') && (document.MAX_ct0.substring(0,4) == 'http')) { document.write (\"&amp;ct0=\" + escape(document.MAX_ct0)); } if (document.mmm_fo) document.write (\"&amp;mmm_fo=1\"); document.write (\"'>\"); document.write('');  window.checkCriteoI = 0 ; window.checkCriteo = function() { $('#crt_blk_cont').children().each(function(i , elem) { if(elem.tagName != \"SCRIPT\") { if( $(elem).height()>1 ) { top.document.getElementById('crt_adb_cont').setAttribute('style' , 'text-align:center;'); } } }) ; if(window.checkCriteoI++ < 20) setTimeout('checkCriteo()' , 1000) ; }; window.onload = function() { checkCriteo(); } ; </script>") ;
		d.write('');
		d.close();
	} ;

	window.criteo_crtnoads = function() {
		console.log('criteo adb noimage') ;
		// u_spacepush() ;
	} ;

	window.u_spacepush = function() {
		console.log('u_spacepush') ;
		new Image().src="//188.120.226.43/stat/pixel.gif?host=ucoz&amp;event=u_spacepush&amp;r="+Math.random();

		var cat = window.adb_site_cat ;
		if(cat &amp;&amp; cat.indexOf('-')&gt;=0) cat = cat.split('-')[0] ;
		if(!cat) cat = '24';

		var cont = document.createElement('div');
		cont.setAttribute('style' , 'text-align:center;');
		cont.id="u_spacepush";
		var s = document.getElementById('crt_adb_place');
		s.parentElement.insertBefore(cont , s);

		if(1 || Math.random() &lt; 0.5) {
			console.log('u_spacepush new') ;
			var script = document.createElement('script') ;
			script.setAttribute('type' , 'text/javascript') ;
			script.setAttribute('class' , 'ognyvo__insert') ;
			script.setAttribute('data-src' , 'https://blamper-news.ru/outside/informer/?publisherId=5a05b5360bbda53d911b716b&amp;limit=5&amp;offset=0&amp;slider=1&amp;slideWidth=300&amp;slideHeight=250&amp;pager=0&amp;row=1&amp;type=big_block&amp;place=universal') ;
			script.setAttribute('data-width' , '300') ;
			script.setAttribute('data-height' , '250') ;
			cont.appendChild(script) ;
			! function () {function t(t) {function e() {o || (o = !0, t())}function n() {if (!o &amp;&amp; document.body) try {document.documentElement.doScroll("left"), e()} catch (t) {setTimeout(n, 0)}}var o = !1;document.addEventListener ? document.addEventListener("DOMContentLoaded", function () {e()}, !1) : document.attachEvent &amp;&amp; (document.documentElement.doScroll &amp;&amp; window == window.top &amp;&amp; n(), document.attachEvent("onreadystatechange", function () {"complete" === document.readyState &amp;&amp; e()})), window.addEventListener ? window.addEventListener("load", e, !1) : window.attachEvent &amp;&amp; window.attachEvent("onload", e)}t(function () {var c = document.head || document.getElementsByTagName("head")[0];var t = document.createElement("script");t.type = "text/javascript";t.src = "https://blamper-news.ru/js/informer_support.js";c.appendChild(t)})}();
		} else {
			console.log('u_spacepush standart') ;
			var script = document.createElement('script') ;
			script.setAttribute('type' , 'text/javascript') ;
			script.setAttribute('class' , 'ognyvo__insert') ;
			if(cat == '3') {
				script.setAttribute('data-src' , 'https://blamper-news.ru/iframe/outside/13889/universal?limit=4&amp;offset=0&amp;slider=1&amp;slideWidth=300&amp;slideHeight=250&amp;pager=0&amp;row=1&amp;type=big_block') ;
			} else {
				script.setAttribute('data-src' , 'https://blamper-news.ru/iframe/outside/13121/universal?limit=4&amp;offset=0&amp;slider=1&amp;slideWidth=300&amp;slideHeight=250&amp;pager=0&amp;row=1&amp;type=big_block') ;
			}
			script.setAttribute('data-width' , '300') ;
			script.setAttribute('data-height' , '250') ;
			cont.appendChild(script) ;
			! function () {function t(t) {function e() {o || (o = !0, t())}function n() {if (!o &amp;&amp; document.body) try {document.documentElement.doScroll("left"), e()} catch (t) {setTimeout(n, 0)}}var o = !1;document.addEventListener ? document.addEventListener("DOMContentLoaded", function () {e()}, !1) : document.attachEvent &amp;&amp; (document.documentElement.doScroll &amp;&amp; window == window.top &amp;&amp; n(), document.attachEvent("onreadystatechange", function () {"complete" === document.readyState &amp;&amp; e()})), window.addEventListener ? window.addEventListener("load", e, !1) : window.attachEvent &amp;&amp; window.attachEvent("onload", e)}t(function () {var c = document.head || document.getElementsByTagName("head")[0];var t = document.createElement("script");t.type = "text/javascript";t.src = "https://blamper-news.ru/ext/ognyvo_support.js";c.appendChild(t)})}();
		}
	} ;
})() ;
</body>
</html>