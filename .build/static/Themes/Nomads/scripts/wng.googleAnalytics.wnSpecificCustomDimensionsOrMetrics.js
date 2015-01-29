wng.googleAnalytics.addSiteSpecificCustomDimensionsOrMetrics = function(opt, analyticsUtils) {
  var dimensions = {
    'firstTouch': 'dimension15',
    'lastTouch': 'dimension16',
    'firstBlogAuthor': 'dimension17',
    'lastBlogAuthor': 'dimension18'
  };

  var internalUtils = {
    'domainFromUrl': function(url) {
      var withoutProtocol = url.replace(/^[a-z]+:\/\//, '');
      var withoutPath = withoutProtocol.split('/')[0];

      return withoutPath;
    },
    'stripW3FromDomain': function(domain) {
      return domain.replace(/^www\./, '').toLowerCase();
    },
    'stripWorldNomadsFromDomain': function(domain) {
      return domain.replace(/\.?worldnomads\.com/, '').toLowerCase();
    },
    'first100Characters': function(string) {
      return string.substr(0, 100);
    }
  };

  var currentDomain = internalUtils.stripW3FromDomain(window.location.host);
  var subdomain = internalUtils.stripWorldNomadsFromDomain(window.location.host);

  // First Journals author
  if (subdomain == 'journals') {
    var firstBlogAuthorCookieName = 'blogauthor';
    var blogAuthorCookie = analyticsUtils.getCookie(firstBlogAuthorCookieName);

    if (!blogAuthorCookie) {
      var toTrack = internalUtils.first100Characters(subdomain + window.location.pathname);
      analyticsUtils.setCookie(firstBlogAuthorCookieName, toTrack, { 'expires': 365 });
      ga('set', dimensions.firstBlogAuthor, toTrack);
    }
  }

  // Last Journals or Answers page
  if (subdomain == 'journals' || subdomain == 'answers') {
    var toTrack = internalUtils.first100Characters(subdomain + window.location.pathname);
    ga('set', dimensions.lastBlogAuthor, toTrack);
  }

  // First touch
  var firstTouchCookieName = 'firsttouch';
  var firstTouchCookie = analyticsUtils.getCookie(firstTouchCookieName);

  if (!firstTouchCookie) {
    var toTrack = internalUtils.first100Characters(opt.url ? opt.url : window.location.host + window.location.pathname + window.location.search);
    analyticsUtils.setCookie(firstTouchCookieName, toTrack, { 'expires': 183 });
    ga('set', dimensions.firstTouch, toTrack);
  }

  // Last touch domain
  if (document.referrer) {
    var referrerDomain = internalUtils.stripW3FromDomain(internalUtils.domainFromUrl(document.referrer));
    var rootDomain = 'worldnomads.com';
    var currentDomainIsRoot = currentDomain == rootDomain;
    var referrerDomainIsRoot = referrerDomain == rootDomain;

    if (!referrerDomainIsRoot && currentDomainIsRoot) {
      ga('set', dimensions.firstTouch, referrerDomain);
    }
  }
};