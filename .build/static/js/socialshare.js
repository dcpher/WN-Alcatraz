<script>

  // Build the target srcs for the icons on click.
  var socialMedialUrl          = window.location;
  
  var facebookParamU           = "http://bit.ly/16wBqhs";

  var twitterParamText         = "@WorldNomads change lives with @wateraid. See how we did it. http://bit.ly/16wBqhs";

  var pinParamDescription      = "6,880 children now have clean hands and water to drink thanks to 106,219 travellers like you! See how we did it.";
  var pinParamMedia            = "http://www.worldnomads.com/Media/Default/footprints/wateraid/Infographic_WaterAid_Pinterest.jpg";
  
  var linkedParamTitle         = "World Nomads change lives with Water Aid";
  var linkedParamDescription   = "6,880 children now have clean hands and water to drink thanks to 106,219 travellers like you!";

  $(function() {
    var $plus = $(".plus");
    var $toggleableButtons = $(".pinterest, .gplus, .linkedin, .stumbleupon").hide();
    $plus.on("click", function() {
      var $this = $(this);
      $toggleableButtons.toggle();
      $plus.toggleClass("open");
    });
  });
  
  $(function() {
    var $si = $(".socialicon");
    var targetUrl = "";
    $si.on("click", function() {
      var $this = $(this);
      if ($this.hasClass("facebook")) {
        targetUrl = "http://www.facebook.com/share.php?u=" + facebookParamU;
        window.open(targetUrl, 'name', 'width=600,height=400');
      }
      else if ($this.hasClass("twitter")) {
        targetUrl = "https://twitter.com/intent/tweet?text=" + twitterParamText;
        window.open(targetUrl, 'name', 'width=600,height=400');
      }
      else if ($this.hasClass("pinterest")) {
        targetUrl = "http://pinterest.com/pin/create/button?description=" + pinParamDescription + "&media=" + pinParamMedia; + "&url=" + socialMedialUrl; 
        window.open(targetUrl, 'name', 'width=755,height=400,scrollbars=no');
      }
      else if ($this.hasClass("gplus")) {
        targetUrl = "https://plus.google.com/share?url=" + socialMedialUrl;
        window.open(targetUrl, 'name', 'width=600,height=400');
      }
      else if ($this.hasClass("linkedin")) {
        targetUrl = "https://www.linkedin.com/shareArticle?mini=true&url=" + socialMedialUrl + "&title=" + linkedParamTitle + "&summary=" + linkedParamDescription;
        window.open(targetUrl, 'name', 'width=600,height=400');
      }
      else if ($this.hasClass("stumbleupon")) {
        targetUrl = "http://www.stumbleupon.com/badge/?url=" + socialMedialUrl;
        window.open(targetUrl, 'name', 'width=600,height=400');
      }
    });
  });
</script>


<!-- Social Counter -->
<script>
jQuery.sharedCount = function(url, fn) {
 url = encodeURIComponent(url || location.href);
 var domain = "//free.sharedcount.com/"; /* SET DOMAIN */
 var apikey = "8e4b7187bcfca463ceeca1577105f710bf47edd1" /*API KEY HERE*/
 var arg = {
  data: {
   url : url,
   apikey : apikey
  },
  url: domain,
  cache: true,
  dataType: "json"
 };
 if ('withCredentials' in new XMLHttpRequest) {
  arg.success = fn;
 }
 else {
  var cb = "sc_" + url.replace(/\W/g, '');
  window[cb] = fn;
  arg.jsonpCallback = cb;
  arg.dataType += "p";
 }
 return jQuery.ajax(arg);
};

jQuery(document).ready(function($){
 var targetUrl = "http://" + location.host + location.pathname;

 $.sharedCount(targetUrl, function(data){
  var totalShares = data.Twitter + data.Facebook.like_count + data.GooglePlusOne + data.Facebook.share_count + data.Pinterest + data.LinkedIn + data.StumbleUpon;
  if (totalShares <= 48) {
   totalShares = 48;
  }
  $("#tweetscount").text(data.Twitter);    
  $("#likescount").text(data.Facebook.like_count);
  $("#facebooksharecount").text(data.Facebook.share_count);
  $("#plusonescount").text(data.GooglePlusOne);
  $("#stumbleuponcount").text(data.StumbleUpon);
  $("#pintrestcount").text(data.Pinterest);
  $("#linkedincount").text(data.LinkedIn);
  $("#total").text(totalShares);
  $("#sharedcount").fadeIn();

 });
});
</script>