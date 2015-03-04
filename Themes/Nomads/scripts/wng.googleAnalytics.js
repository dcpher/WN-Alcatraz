/*globals window:false, document:false, FB:false, wng:true */

// Options available: 
//  {
//   'url': null,
//   'preliminaryUrl': null,
//   'brand': null,
//   'country_of_residence': null, // Optional on most sites
//   'signed_in': null, // Optional 
//   'quote': {
//     'countries': null,
//     'underwriter': null // Optional on most sites
//     'price': null, // Full dollar value as int
//     'plan': null,
//     'campaign_code': null,
//     'campaign_code_discount': null, // Int of %
//     'duration': null,
//     'ages': null,
//     'type': null,
//     'region': null
//    }
//  }

var dataLayer = dataLayer || [];

var wng = (function ($, undefined) {
  var trackPageOnNextLoadCookieName = 'trackPageOnNextLoad';
  var trackEventOnNextLoadCookiePrefix = 'trackEventOnNextLoad';

  var dimensions = {
    'quotePlan': 'dimension1',
    'quoteDestinations': 'dimension2',
    'quoteGroupedDuration': 'dimension3',
    'quoteAges': 'dimension4',
    'quoteGroupedAges': 'dimension5',
    'quoteCampaignCode': 'dimension6',
    'countryOfResidence': 'dimension7',
    'quoteUnderwriter': 'dimension8',
    'brand': 'dimension9',
    'signedIn': 'dimension10'
  };

  var metrics = {
    'quoteDurationDays': 'metric1',
    'quoteCampaignCodeDiscount': 'metric2'
  };

  $.googleAnalytics = function (googleAnalyticsTrackingCode, googleTagManagerCode, options) {
    var opt = options || {};
    $.googleAnalytics.options = opt;

    // Load UA javascript asynchronously
    (function (i, s, o, g, r, a, m) {
      i['GoogleAnalyticsObject'] = r; i[r] = i[r] || function () {
        (i[r].q = i[r].q || []).push(arguments)
      }, i[r].l = 1 * new Date(); a = s.createElement(o),
      m = s.getElementsByTagName(o)[0]; a.async = 1; a.src = g; m.parentNode.insertBefore(a, m)
    })(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');

    ga('create', googleAnalyticsTrackingCode, {
      'cookieDomain': utils.cookieDomainForHostname(document.location.hostname),
      'siteSpeedSampleRate': 20,
      'allowLinker': true
    });

    // Load the display features plugin to support display advertising features in GA
    ga('require', 'displayfeatures');

    // Set custom page url
    if (opt.url) {
      ga('set', 'page', opt.url);
    }

    // Set custom dimension for brand
    if (opt.brand) {
      ga('set', dimensions.brand, opt.brand);
    }

    // Contry of residence
    if (opt.country_of_residence) {
      ga('set', dimensions.countryOfResidence, opt.country_of_residence);
    }

    // Signed in status
    ga('set', dimensions.signedIn, opt.signed_in || 'Unknown');

    // Set custom variables for quote
    if (opt.quote) {
      var quote = opt.quote;

      // Plan
      if (quote.plan) {
        ga('set', dimensions.quotePlan, quote.plan);
      }

      // Countries
      if (quote.countries) {
        var orderedCountries = utils.orderCountries(quote.countries);
        var limitedCountries = utils.limitCountries(orderedCountries);
        ga('set', dimensions.quoteDestinations, limitedCountries);
      }

      // Region - Legacy support
      if (quote.region) {
        ga('set', dimensions.quoteDestinations, quote.region);
      }

      // Duration
      if (quote.duration) {
        // Number vs string tested here for legacy support of older purchase paths
        if (typeof quote.duration === 'number') {
          var groupedDuration = utils.groupDuration(quote.duration);
          ga('set', metrics.quoteDurationDays, Number(quote.duration));
          ga('set', dimensions.quoteGroupedDuration, groupedDuration);
        } else if (typeof quote.duration === 'string') {
          ga('set', dimensions.quoteGroupedDuration, quote.duration);
        }
      }

      // Ages 
      if (quote.ages) {
        var groupedAges = utils.groupAges(quote.ages);
        var sortedAges = utils.sortNumericArray(quote.ages);
        ga('set', dimensions.quoteAges, sortedAges.join(', '));
        ga('set', dimensions.quoteGroupedAges, groupedAges);
      }

      // Type - Legacy support
      if (quote.type) {
        ga('set', dimensions.quoteAges, quote.type);
      }

      // Campaign code
      if (quote.campaign_code) {
        ga('set', dimensions.quoteCampaignCode, quote.campaign_code);
      } else {
        ga('set', dimensions.quoteCampaignCode, 'None');
      }

      // Campaign code discount
      if (quote.campaign_code_discount) {
        // Conversion in case it's using the old '10%' discont instead of an int
        var numericString = String(quote.campaign_code_discount).replace('%', '');
        ga('set', metrics.quoteCampaignCodeDiscount, Number(numericString));
      } else {
        ga('set', metrics.quoteCampaignCodeDiscount, 0);
      }

      // Underwriter
      if (quote.underwriter) {
        ga('set', dimensions.quoteUnderwriter, quote.underwriter);
      }
    }

    // Callback to add site specific custom variables.
    if (wng.googleAnalytics.addSiteSpecificCustomDimensionsOrMetrics) {
      wng.googleAnalytics.addSiteSpecificCustomDimensionsOrMetrics(opt, utils);
    }

    // Track any urls passed in from the previous page
    var urlFromLastPage = utils.getCookie(trackPageOnNextLoadCookieName);

    if (urlFromLastPage) {
      ga('send', 'pageview', { 'page': urlFromLastPage });
      utils.deleteCookie(trackPageOnNextLoadCookieName);
    }

    // Track the preliminaryUrl if it exists
    if (opt.preliminaryUrl) {
      ga('send', 'pageview', { 'page': opt.preliminaryUrl });
    }

    // Track the main page load
    ga('send', 'pageview');

    // Track any events passed in from the previous page
    var eventsFromLastPage = utils.findCookies(new RegExp("^" + trackEventOnNextLoadCookiePrefix));

    for (var key in eventsFromLastPage) {
      var decodedEvent = utils.decodeEvent(eventsFromLastPage[key]);
      wng.googleAnalytics.trackEvent.apply(this, decodedEvent);
      utils.deleteCookie(key);
    }

    // Set the fbAsyncInit value to be a callback that tracks FB social actions
    window.fbAsyncInit = function () {
      wng.googleAnalytics.listenForFacebookSocialEvents();
    };

    // On window load, listen for any twttr events. This is to give time for twitter buttons to set up the twttr object
    utils.fireOnWindowLoad(function () {
      wng.googleAnalytics.listenForTwitterSocialEvents();
    });

    // Set up for Google Tag Manager
    dataLayer.push({ 'Custom Tracking URL': opt.url });

    if (opt.preliminaryUrl) {
      dataLayer.push({ 'Preliminary URL': opt.preliminaryUrl });
    }

    // Send country of residence to Google Tag Manager
    if (opt.country_of_residence) {
      dataLayer.push({ 'Country of Residence': opt.country_of_residence });
    }

    if (opt.quote) {
      // Send quote destinations to Google Tag Manager
      if (opt.quote.countries) {
        dataLayer.push({ 'Destination Countries': utils.limitCountries(utils.orderCountries(opt.quote.countries)) });
      }

      // Send price to Google Tag Manager
      if (opt.quote.price) {
        dataLayer.push({ 'Quote Price': Number(opt.quote.price) });
      }

      // Send underwriter to Google Tag Manager
      if (opt.quote.underwriter) {
        dataLayer.push({ 'Underwriter': opt.quote.underwriter });
      }
    }

    // Load Google Tag Manager
    (function (w, d, s, l, i) {
      w[l] = w[l] || [];
      w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
      var f = d.getElementsByTagName(s)[0], j = d.createElement(s), dl = l != 'dataLayer' ? '&l=' + l : ''; j.async = true;
      j.src = '//www.googletagmanager.com/gtm.js?id=' + i + dl;
      f.parentNode.insertBefore(j, f);
    })(window, document, 'script', 'dataLayer', googleTagManagerCode);
  };

  // Track a virtual page, this is in addition to the inital page tracking
  $.googleAnalytics.trackVirtualPage = function (url) {
    ga('send', 'pageview', { 'page': url });
  };

  // Track a virtual page, but not until just before the next page is tracked.
  // Useful for when the page will unload before a request can be sent to Google Analytics.
  // Note that there can only be one page tracked this way.
  $.googleAnalytics.trackVirtualPageOnNextLoad = function (url) {
    utils.setCookie(trackPageOnNextLoadCookieName, url);
  };

  // Track an event
  // Note: the value option must be an integer
  $.googleAnalytics.trackEvent = function (category, action, eventOptions) {
    var options = {};

    if (eventOptions) {
      if (eventOptions.label) {
        options.eventLabel = eventOptions.label;
      }

      if (eventOptions.value) {
        options.eventValue = eventOptions.value;
      }
    }

    ga('send', 'event', category, action, options);
  };

  // Track an event, but not until just before the next page is tracked.
  // Useful for when the page will unload before a request can be sent to Google Analytics.
  (function () {
    var trackEventOnNextLoadCounter = 1;

    $.googleAnalytics.trackEventOnNextLoad = function (category, action, eventOptions) {
      var encodedEvent = utils.encodeEvent(category, action, eventOptions);
      var cookieName = trackEventOnNextLoadCookiePrefix + trackEventOnNextLoadCounter;
      utils.setCookie(cookieName, encodedEvent);
      trackEventOnNextLoadCounter++;
    };
  })();

  // Create a transaction. Note order ID should be unique and allow the looking up of the order in the DB. Total should just be an int.
  (function () {
    var ecommercePluginLoaded = false;

    var createProductAdders = function (transactionID, amendment) {

      var basePolicyCategory = amendment ? 'Amendment' : 'Base policy';
      var optionsCategory = amendment ? 'Amendment' : 'Options';

      return {
        'addBasePolicy': function (price) {
          var nameAndSku = amendment ? 'Base policy amendment' : 'Base policy';

          ga('ecommerce:addItem', {
            'id': String(transactionID),
            'name': nameAndSku,
            'sku': nameAndSku,
            'category': basePolicyCategory,
            'price': String(price),
            'quantity': 1
          });
        },

        // Add policy excess reduction, both newPolicyExcess and price should be an int
        addPolicyExcessReduction: function (newPolicyExcess, price) {
          ga('ecommerce:addItem', {
            'id': String(transactionID),
            'name': 'Policy excess reduction',
            'sku': '$' + newPolicyExcess + ' policy excess',
            'category': optionsCategory,
            'price': String(price),
            'quantity': 1
          });
        },

        // Add car rental excess cover increase, both newExcessCover and price should be an int  
        addCarRentalExcessIncrease: function (newExcessCover, price) {
          ga('ecommerce:addItem', {
            'id': String(transactionID),
            'name': 'Car excess cover increased',
            'sku': '$' + newExcessCover + ' car excess',
            'category': optionsCategory,
            'price': String(price),
            'quantity': 1
          });
        },

        // Add Business benefits cover, price should be an int
        addBusinessBenefitCover: function (price) {
          ga('ecommerce:addItem', {
            'id': String(transactionID),
            'name': 'Business benefit cover',
            'sku': 'Business premium',
            'category': optionsCategory,
            'price': String(price),
            'quantity': 1
          });
        },

        // Add Snow sports cover, price should be an int
        addSnowSportsCover: function (price) {
          ga('ecommerce:addItem', {
            'id': String(transactionID),
            'name': 'Snow sports cover',
            'sku': 'Snow sports premium',
            'category': optionsCategory,
            'price': String(price),
            'quantity': 1
          });
        },

        // Add aditional item, both value and price should be an int, description is a string of what the user entered as 'item name'
        addAdditionalItem: function (value, description, price) {
          ga('ecommerce:addItem', {
            'id': String(transactionID),
            'name': 'Additional item',
            'sku': '$' + value + ' ' + description,
            'category': optionsCategory,
            'price': String(price),
            'quantity': 1
          });
        },

        // Add Footprints, price should be an int, projectName is a string
        addFootprints: function (projectName, price) {
          ga('ecommerce:addItem', {
            'id': String(transactionID),
            'name': 'Footprints donation',
            'sku': projectName,
            'category': optionsCategory,
            'price': String(price),
            'quantity': 1
          });
        },

        // Add Pre-Ex, price should be an int
        addPreEx: function (price) {
          ga('ecommerce:addItem', {
            'id': String(transactionID),
            'name': 'Pre-Ex cover',
            'sku': 'Medial premium',
            'category': optionsCategory,
            'price': String(price),
            'quantity': 1
          });
        },

        // TODO: Insurance app passes in a string as the level: e.g. 'Level 3' - Make this require a string and pass that straight in.
        // Add a specific level of adventure cover, price & level should be an int
        addAdventureCover: function (level, price) {
          ga('ecommerce:addItem', {
            'id': String(transactionID),
            'name': 'Adventure cover',
            'sku': 'Level ' + level,
            'category': optionsCategory,
            'price': String(price),
            'quantity': 1
          });
        }
      }
    }

    // For a list of supported currencies: https://developers.google.com/analytics/devguides/platform/currencies
    $.googleAnalytics.createTransaction = function (transactionID, total, addProductsCallback, options) {
      options = options || {};

      if (!ecommercePluginLoaded) {
        ga('require', 'ecommerce', 'ecommerce.js');
        ecommercePluginLoaded = true;
      }

      var idSuffix = options['amendment'] ? ' (Amendment)' : '';

      var transaction = {
        'id': String(transactionID) + idSuffix,
        'revenue': String(total)
      };

      if (options['currency']) {
        transaction['currency'] = options['currency'];
      }

      // Create transaction
      ga('ecommerce:addTransaction', transaction);

      // Add products
      addProductsCallback(createProductAdders(transactionID, options['amendment']));

      // This has to be called after the transaction has been built to submit it.
      ga('ecommerce:send');
    };
  })();

  // This adds listeners to track Facebook likes, unlikes, and shares. This has to be called after the FB object has been created.
  $.googleAnalytics.listenForFacebookSocialEvents = function () {
    try {
      if (FB && FB.Event && FB.Event.subscribe) {
        // Likes
        FB.Event.subscribe('edge.create', function (opt_target) {
          ga('send', 'social', 'Facebook', 'Like', opt_target);
        });

        // Unlikes
        FB.Event.subscribe('edge.remove', function (opt_target) {
          ga('send', 'social', 'Facebook', 'Unlike', opt_target);
        });

        // Shares
        FB.Event.subscribe('message.send', function (opt_target) {
          ga('send', 'social', 'Facebook', 'Send', opt_target);
        });
      }
    } catch (e) { }
  };

  // This adds a listening to track Twitter tweets. This has to be called after the twttr object is created
  $.googleAnalytics.listenForTwitterSocialEvents = function () {
    try {
      if (twttr && twttr.ready) {
        twttr.ready(function () {
          // Tweets
          twttr.events.bind('tweet', function (intentEvent) {
            var tweetPath = null;
            // Check if the target is an iframe, if so, get the URL of the tweet path.
            if (intentEvent.target && intentEvent.target.nodeName == 'IFRAME') {
              tweetPath = utils.paramsFromUrl(intentEvent.target.src, true)['url'];
            }
            ga('send', 'social', 'Twitter', 'Tweet', tweetPath);
          });
        });
      }
    } catch (e) { }
  };

  // Load a script tag when window load fires
  $.googleAnalytics.loadScriptOnLoad = function (url) {
    utils.fireOnWindowLoad(function () {
      utils.loadScript(url);
    });
  };

  // Call this whenever an internal, cross domain link or form is clicked, let submit / click continue as normal.
  $.googleAnalytics.decorateCrossDomainLinkOrForm = function (element) {
    ga(function (tracker) {
      var linker = new window.gaplugins.Linker(tracker);
      linker.decorate(element);
    })
  }

  // Get linker param to append to a link or form. Shouldn't be needed much, should instead use auto linking or decorateCrossDomainLinkOrForm
  // If GA plugin isn't loaded this will return a blank string (the closure won't execute before the return in that case)
  $.googleAnalytics.crossDomainLinkParameter = function () {
    var linkerParam = '';

    ga(function (tracker) {
      linkerParam = tracker.get('linkerParam');
    });

    return linkerParam;
  }

  var utils = $.googleAnalytics.utils = {
    // Convert an int value for days into a standardised string format
    groupDuration: function (days) {
      var approximateMonth = 365 / 12;

      if (days < 28) {
        return days + (days == 1 ? ' day' : ' days');
      } else if (days < Math.round(3 * approximateMonth)) {
        return Math.floor(days / 7) + ' weeks';
      } else {
        return Math.floor((days + 1) / approximateMonth) + ' months'; // +1 on days to fudge the numbers slightly, so 91 days = 3 months (instead of 91.25+), and 12 months is guaranteed for 365 / 12 * 12 in case of a rounding error
      }
    },

    // Convert days into weeks
    weekDuration: function (days) {
      var weeks = Math.floor(days / 7);

      return weeks + (weeks == 1 ? ' week' : ' weeks');
    },

    // Group an array of ages into meaningful strings
    groupAges: function (ages) {
      var groupedAges = [];

      var sortedAges = utils.sortNumericArray(ages);

      for (var i = 0; i < sortedAges.length; i++) {
        var groupedAge;
        var age = sortedAges[i];

        if (age < 18) {
          groupedAge = 'Under 18';
        } else if (age < 25) {
          groupedAge = '18 - 24';
        } else if (age < 35) {
          groupedAge = '25 - 34';
        } else if (age < 45) {
          groupedAge = '35 - 44';
        } else if (age >= 45) {
          groupedAge = '45+';
        }

        groupedAges.push(groupedAge);
      }

      return groupedAges.join(', ');
    },

    // Order the country list alphabetically
    orderCountries: function (countryList) {
      var countries = countryList.split('|');

      countries.sort();

      return countries.join('|');
    },

    // Limit countries to 100 characters max, truncating before the | - this is important for custom dimensions as they have a max length (speced 150 bytes)
    limitCountries: function (countryList) {
      var match = countryList.match(/^(.{0,100})(?:\|.*)?$/);

      return match[1];
    },

    // Set an individual cookie
    setCookie: function (name, value, options) {
      options = options || {};

      var cookie = encodeURIComponent(name) + '=' + encodeURIComponent(value);

      if (options.expires) {
        var expires;

        if (typeof options.expires == 'number') {
          // A number of days was passed in, convert it into a date from now
          expires = new Date();
          expires.setDate(expires.getDate() + options.expires);
        } else {
          // A date was passed in, just use the date
          expires = options.expires;
        }

        cookie += '; expires=' + expires.toUTCString();
      }

      // Even though cookies normally default to current path, it is more useful to default to root for analytics
      cookie += '; path=' + (options.path || '/');

      // Even though cookies normally default to current domain, it is more useful to default to parent domain for analytics. 
      // Note that this means we lose the ability to set a domain without a . prefix, as the only way to do that is to not add a 'domain=' to the cookie.
      cookie += '; domain=' + (options.domain || utils.cookieDomainForHostname(document.location.hostname));

      if (options.secure) {
        cookie += '; secure';
      }

      document.cookie = cookie;

      return cookie;
    },

    // Get an individual cookie by name.
    // Keep in mind, it's possible to have multiple cookies with the same name, eg: one for .demo.com, another for subdomain.demo.com, and a third for .demo.com/cheese.
    // There is no way to differentiate between these, and a random one will be returned. In other words, don't reuse names between domain / path levels.
    getCookie: function (name) {
      var cookies = utils.getCookies();

      for (var cookieName in cookies) {
        if (cookieName == name) {
          return cookies[cookieName];
        }
      }

      return null;
    },

    // Finds cookies by name based on a passed in regex. Returns an filtered object of cookies
    findCookies: function (pattern) {
      var allCookies = utils.getCookies();
      var matchingCookies = {};

      for (var cookieName in allCookies) {
        if (cookieName.match(pattern)) {
          matchingCookies[cookieName] = allCookies[cookieName];
        }
      }

      return matchingCookies;
    },

    // Returns an object of all cookies decoded
    getCookies: function () {
      var rawCookies = document.cookie.split('; ');
      var cookies = {};

      for (var i = 0; i < rawCookies.length; i++) {
        var rawCookie = rawCookies[i].split('=');
        cookies[decodeURIComponent(rawCookie[0])] = decodeURIComponent(rawCookie[1] || ''); // IE saves empty cookie strings as just the cookie name, sans =, so cookie[1] might be null
      }

      return cookies;
    },

    // Remove a cookie, this is done by setting a cookie with a date of yesterday.
    // Keep in mind that if you specify path or domain when you create the cookie, you have to also specify them when you destroy it.
    deleteCookie: function (name, options) {
      options = options || {};
      options.expires = -1;

      utils.setCookie(name, '', options);
    },

    // Accepts an event, and encodes as a string - makes use of encodeURIComponent to make sure things can be split safely later
    encodeEvent: function (category, action, eventOptions) {
      eventOptions = eventOptions || {};

      var categoryString = 'category:' + encodeURIComponent(category);
      var actionString = 'action:' + encodeURIComponent(action);
      var labelString = 'label:' + encodeURIComponent(eventOptions['label'] || '');
      var valueString = 'value:' + (eventOptions['value'] || '');

      return [categoryString, actionString, labelString, valueString].join(';');
    },

    // Accepts an encoded event, and returns an array of arguments
    decodeEvent: function (encodedEvent) {
      var match = encodedEvent.match(/^category:(.+);action:(.+);label:(.+)?;value:(.+)?$/);
      var options = {};

      if (match[3]) {
        options['label'] = decodeURIComponent(match[3]);
      }

      if (match[4]) {
        options['value'] = Number(match[4]);
      }

      return [decodeURIComponent(match[1]), decodeURIComponent(match[2]), options];
    },

    // Attaches passed in callbacks to the browsers window load event
    fireOnWindowLoad: function (toFire) {
      if (window.addEventListener) {
        // One for normal browsers
        window.addEventListener('load', toFire, false);
      } else if (window.attachEvent) {
        // One for IE 8 and below
        window.attachEvent('onload', toFire);
      }
    },

    // Load a script tag
    loadScript: function (url) {
      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.src = url;
      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(script, firstScriptTag);
    },

    // Sort a numeric array ascending
    sortNumericArray: function (array) {
      // .slice(0) copies the array to prevent sort in place
      return array.slice(0).sort(function (a, b) {
        return a - b;
      });
    },

    // Return the appropriate cookie domain for a given hostname
    cookieDomainForHostname: function (hostname) {
      var knownRootDomains = ['travelinsurancedirect.com.au', 'worldnomads.com'];

      for (var i = 0; i < knownRootDomains.length; i++) {
        var knownRootDomain = knownRootDomains[i];
        var expectedIndex = hostname.length - knownRootDomain.length;

        // Check if the hostname ends with a known root domain
        if (hostname.indexOf(knownRootDomain, expectedIndex) !== -1) {
          return '.' + knownRootDomain;
        }
      };

      return hostname.replace(/^(www|service)/, '');;
    },

    paramsFromUrl: function (url, paramsInHash) {
      var splitOn = paramsInHash ? '#' : '?';

      // Recurse through the array of pairs, building an object of params as we go
      var parse = function (params, pairs) {
        var pair = pairs[0];
        var parts = pair.split('=');
        var key = decodeURIComponent(parts[0]);
        var value = decodeURIComponent(parts.slice(1).join('='));

        // Handle multiple parameters of the same name
        if (typeof params[key] === "undefined") {
          params[key] = value;
        } else {
          params[key] = [].concat(params[key], value);
        }

        return pairs.length == 1 ? params : parse(params, pairs.slice(1))
      }

      // Get rid of everything up to and including any first ?
      var searchString = url.split(splitOn).slice(1).join(splitOn);

      if (searchString.length == 0) {
        return {};
      } else {
        return parse({}, searchString.split('&'));
      }
    }
  };

  return $;

})(wng || {});

// Namespaced under wng, but also assigned to window.googleAnalytics for backwards compatibility across brands
window.googleAnalytics = wng.googleAnalytics;
