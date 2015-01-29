// wng.responsive-cms.js
// NOTE: This code differs from wng.responsive.js; particularly
// around the initCallout code.

var wng = wng || {};

wng.responsive = (function (undefined) {

  "use strict";

  var initFastClick = function () {
    FastClick.attach(document.body);
  };

  var
    menuToggle = function () {
      $(".nav-toggle").on("click", function () {
        $(".content > .nav").toggleClass("open");
      });
    };

  var
    initCallout = function () {
      var $sideNav = $(".side-nav");
      var $sideNavWithArrow = $(".side-nav, .side-nav-arrow");
      var $sideNavSignIn = $(".side-nav-sign-in");
      var $sideNavSignInForm = $(".side-nav-sign-in-form");
      var $sideNavToggle = $(".side-nav-toggle");
      var $sideNavClosePanel = $(".side-nav-close-panel");
      var $loginLink = $sideNavSignIn.find('.existing-member, .login');
      var isSslRedirectRequired = window.location.protocol == "https:" ? false : true;

      var $menuToggles = $(
        ".side-nav-toggle, " +
        ".side-nav-inner-toggle, " +
        ".side-nav-close-panel");

      var expandSignIn = function () {
        if (isSslRedirectRequired) {
          if ($loginLink.length > 0) {
            // Append Google Analytics parameter so we can track.
            var gaQueryStringSuffix = "?_ga=" + wng.googleAnalytics.crossDomainLinkParameter();
            window.location.href = $loginLink.attr('href') + gaQueryStringSuffix;
            return false;
          }
        }
        $sideNavSignInForm.addClass("open");
        return true;
      };

      $loginLink.on("click", function (e) {
        if (!isSslRedirectRequired) {
          e.preventDefault();
        }
      });

      $("body").on("click", "[data-loading-indicator-onclick]", function () {
        wng.animations.showWhitewashLoadingIndicator();
      });

      var turnOn = function (openSignInBool, noAnimation) {
        var animationLength = noAnimation ? 0 : 200;
        $sideNavWithArrow.css({ "opacity": 0, "display": "block" });
        var continueMenuExpansion = true;
        if (openSignInBool) {
          continueMenuExpansion = expandSignIn();
        }
        if (continueMenuExpansion) {
          $sideNavWithArrow.animate({ opacity: 1 }, animationLength, function () {
            $sideNav.addClass("open");
            $sideNav.removeClass("closed");
            $sideNavToggle.addClass("open");
            $sideNavSignIn.addClass("open");
            $sideNavClosePanel.addClass("open");
          });
        }
      };

      var turnOff = function () {
        $sideNavWithArrow.animate({ opacity: 0 }, 200, function () {
          $sideNavWithArrow.css("display", "none");
          $sideNav.addClass("closed");
          $sideNav.removeClass("open");
          $sideNavToggle.removeClass("open");
          $sideNavSignIn.removeClass("open");
          $sideNavClosePanel.removeClass("open");
          $sideNavSignInForm.removeClass("open");
        });
      };

      $menuToggles.on("click", function (e) {
        if ($sideNav.hasClass("closed")) {
          turnOn();
        } else if ($sideNav.hasClass("open")) {
          turnOff();
        }
      });

      $sideNavSignIn.on("click", function () {
        if (!isSslRedirectRequired) {
          if ($sideNav.hasClass("closed")) {
            turnOn(true);
          } else {
            expandSignIn();
          }
        }
      });

      $(window).on("load resize scroll", function (e) {
        if ($sideNav.hasClass("open")) {
          var ulHeight = $(".side-nav .side-nav-list").filter(":visible").eq(0).height();
          var scrollTop = $(this).scrollTop();

          if (scrollTop > ulHeight) {
            turnOff();
          }
          // using $media-query-skinny-landscape-width
          // from SASS variables in core.
          var matchMedia = window.matchMedia || window.msMatchMedia;
          if (matchMedia && !matchMedia("(max-width: 660px)").matches) {
            var bodyHeight = $("body").css("height");
            $sideNav.css("height", bodyHeight);
          }
        }

        /// so hacky need work with the global-messages state
        if ($sideNav.hasClass("start-with-sign-in-open")
          && $.trim($('.global-message').text()).length == 0) {
          $sideNav.removeClass("start-with-sign-in-open");
          turnOn(false, true);
          expandSignIn();
        }

      });
    };

  var
    initBenefitsWidget = function () {
      var $blWidget = $(".benefits-list-widget");
      var $bl = $blWidget.find(".benefits-list");
      var $blTabNav = $blWidget.find(".tab-nav");
      var $blTabNavLis = $blTabNav.find("li");
      var $blNames = $blWidget.find(".name, .benefit-toggle");
      var $initiallyHiddenItems = $(".sub-benefit, .benefit .description");
      var $blSubBenefits = $blWidget.find(".sub-benefit");
      var $expandAllToggle = $blWidget.find(".expand-all-toggle");
      var toggleOn = function ($this, $benefit, benefitGroup) {
        $this.addClass("open");
        $benefit.find(".description").show();
        $blSubBenefits.each(function () {
          var $subBenefit = $(this);
          var subBenefitGroup = $subBenefit.data("benefit-group");

          if (subBenefitGroup === benefitGroup) {
            $subBenefit.show();
          }
        });
      };

      var toggleOff = function ($this, $benefit, benefitGroup) {
        $this.removeClass("open");
        $benefit.find(".description").hide();
        $blSubBenefits.each(function () {
          var $subBenefit = $(this);
          var subBenefitGroup = $subBenefit.data("benefit-group");

          if (subBenefitGroup === benefitGroup) {
            $subBenefit.hide();
          }
        });
      };


      // Individual names expanding.
      $blNames.on("click", function () {
        // Get the .name as we could be clicking either name or arrow.
        var $name = $(this).parent(".summary").children(".name");
        var $benefit = $name.parents(".benefit");
        var benefitGroup = $benefit.data("benefit-group");

        if (!$name.hasClass("open")) {
          toggleOn($name, $benefit, benefitGroup);
        } else {
          toggleOff($name, $benefit, benefitGroup);
        }
      });

      // Expand all toggle.
      $expandAllToggle.on("click", function (e) {
        var $this = $(this);
        e.preventDefault();

        if (!$this.hasClass("open")) {
          $this.addClass("open");
          $this.html("Collapse all");
          $blNames.each(function () {
            var $this = $(this);
            var $benefit = $this.parents(".benefit");
            var benefitGroup = $benefit.data("benefit-group");
            if (!$this.hasClass("open")) {
              toggleOn($this, $benefit, benefitGroup);
            }
          });
        } else {
          $this.removeClass("open");
          $this.html("Expand all");
          $blNames.each(function () {
            var $this = $(this);
            var $benefit = $this.parents(".benefit");
            var benefitGroup = $benefit.data("benefit-group");
            if ($this.hasClass("open")) {
              toggleOff($this, $benefit, benefitGroup);
            }
          });
        }
      });

      // Page resize checks for tabs.
      $(window).on("resize load", function () {
        var $activeTabLi = $blTabNav.find(".active");
        $activeTabLi.removeClass("active");
        var planName = $activeTabLi.attr("class");
        $("body").data("active-benefit-tab-plan-on-mobile", planName);
        $activeTabLi.addClass("active");
        var fromQuote = $activeTabLi.data("from-quote");

        // Set an id for the css to target.
        $blWidget.attr("id", "active-plan-" + fromQuote);
        $bl.attr("id", "active-plan-" + fromQuote);
      });

      $blTabNavLis.on("click", function (e) {
        var $this = $(this);
        e.preventDefault();
        $blTabNavLis.removeClass("active");
        var planName = $this.attr("class");
        $("body").data("active-benefit-tab-plan-on-mobile", planName);
        $this.addClass("active");
        var fromQuote = $this.data("from-quote");

        $blWidget.attr("id", "active-plan-" + fromQuote);
        $bl.attr("id", "active-plan-" + fromQuote);
      });

      $initiallyHiddenItems.hide();
    };

  var
    initExtraGoogleAnalyticsForCms = function () {
      if (window.location.host != "www.worldnomads.com") {
        $('a').on('click', function () {
          wng.googleAnalytics.decorateCrossDomainLinkOrForm(this);
        });
      }
    };

  return {
    menuToggle: menuToggle,
    initCallout: initCallout,
    initBenefitsWidget: initBenefitsWidget,
    initFastClick: initFastClick,
    initExtraGoogleAnalyticsForCms: initExtraGoogleAnalyticsForCms
  };

}());

$(function () {
  var msieVersion = parseInt((/msie (\d+)/.exec(navigator.userAgent.toString().toLowerCase()) || [])[1], 10);
  
  wng.responsive.menuToggle();

  if (!msieVersion || msieVersion > 7) {
    wng.responsive.initCallout();
  }

  wng.responsive.initExtraGoogleAnalyticsForCms();

  wng.responsive.initBenefitsWidget();
  // wng.responsive.initFastClick();
});
