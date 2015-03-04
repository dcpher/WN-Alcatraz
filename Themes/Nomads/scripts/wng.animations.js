/*globals $:false, document:false, wng:true, Spinner:false */

var wng = wng || {};

wng.animations = (function (undefined) {

  "use strict";

  var
    completeInlineLoadingTimeoutHandle,
    $recentlyHiddenButtonArrow,
    completeWhitewashLoadingTimeoutHandle,
    whitewashSpinner,
    whitewashCssClass = 'loading-overlay',
    whitewashSpinnerCssClass = 'loading-spinner',
    inlineSpinnerCssClass = 'inline-spinner',
    inlineSpinnerWrapperCssClass = 'inline-spinner-wrapper',
    inlineSpinner,
    loadingIndicatorMaxDurationInSeconds = 30,
    htmlSelectorHookForAppendingWhitewashLoadingDivs = 'body',
    callerInlineLoadingOriginalHtmlDataKey = 'original-html-content',
    callerInlineLoadingDataAttribute = 'data-inline-loading-indication',
    inlineLoadingAttributeSelectorForIcon = 'data-button-arrow',

  showInlineLoadingIndicator = function ($caller, displayWithinButton, replacementHtmlContent) {
    var
      $inlineSpinnerWrapper;

    var inlineSpinnerOpts = {
      lines: 17, // The number of lines to draw
      length: 0, // The length of each line
      width: 2, // The line thickness
      radius: 10, // The radius of the inner circle
      corners: 1, // Corner roundness (0..1)
      rotate: 0, // The rotation offset
      direction: 1, // 1: clockwise, -1: counterclockwise
      color: '#000', // #rgb or #rrggbb or array of colors
      speed: 1.2, // Rounds per second
      trail: 64, // Afterglow percentage
      shadow: false, // Whether to render a shadow
      hwaccel: false, // Whether to use hardware acceleration
      className: inlineSpinnerCssClass, // The CSS class to assign to the inline spinner
      zIndex: 2e9, // The z-index (defaults to 2000000000)
      bottom: '10%', // Top position relative to parent
      left: '90%' // Left position relative to parent
    };

    if (inlineSpinner) {
      inlineSpinner.spin();
    }
    else {
      inlineSpinner = new Spinner(inlineSpinnerOpts).spin();  
    }

    $inlineSpinnerWrapper = $("<div />")
      .addClass(inlineSpinnerWrapperCssClass)
      .append(inlineSpinner.el);

    if ($("." + inlineSpinnerWrapperCssClass).length < 1) {
      $caller.after($inlineSpinnerWrapper);
      if (replacementHtmlContent) {
        $caller.attr(callerInlineLoadingDataAttribute, '');
        $caller.data(callerInlineLoadingOriginalHtmlDataKey, $caller.html());
        $caller.html(replacementHtmlContent);
      }

      if (displayWithinButton) {
        $recentlyHiddenButtonArrow = $caller.closest('div').find('[' + inlineLoadingAttributeSelectorForIcon + ']');
        if ($recentlyHiddenButtonArrow.length > 0) {
          $recentlyHiddenButtonArrow.css('visibility', 'hidden');
        }
      }
    }

    completeInlineLoadingTimeoutHandle = setTimeout(removeInlineLoadingIndicator,
      loadingIndicatorMaxDurationInSeconds * 1000);
  },

  removeInlineLoadingIndicator = function () {
    if (inlineSpinner) {
      inlineSpinner.stop();  
    }
    
    $("." + inlineSpinnerWrapperCssClass).remove();

    $("[" + callerInlineLoadingDataAttribute + "]").each(function () {
      var 
        $inlineLoadingCaller = $(this),
        originalHtml = $inlineLoadingCaller.data(callerInlineLoadingOriginalHtmlDataKey);
      $inlineLoadingCaller.html(originalHtml);
    });

    if ($recentlyHiddenButtonArrow && $recentlyHiddenButtonArrow.length > 0) {
      $recentlyHiddenButtonArrow.css('visibility', 'visible');
      $recentlyHiddenButtonArrow = null;
    }

    clearTimeout(completeInlineLoadingTimeoutHandle);
  },

  showWhitewashLoadingIndicator = function () {
    var
      $loadingWhiteWash,
      $htmlHook;

    var whitewashSpinnerOpts = {
      lines: 17, // The number of lines to draw
      length: 0, // The length of each line
      width: 5, // The line thickness
      radius: 25, // The radius of the inner circle
      corners: 1, // Corner roundness (0..1)
      rotate: 0, // The rotation offset
      direction: 1, // 1: clockwise, -1: counterclockwise
      color: '#000', // #rgb or #rrggbb or array of colors
      speed: 1.2, // Rounds per second
      trail: 64, // Afterglow percentage
      shadow: false, // Whether to render a shadow
      hwaccel: false, // Whether to use hardware acceleration
      className: whitewashSpinnerCssClass, // The CSS class to assign to the spinner
      zIndex: 2e9, // The z-index (defaults to 2000000000)
      top: '50%', // Top position relative to parent
      left: '50%' // Left position relative to parent
    };

    if (whitewashSpinner) {
      whitewashSpinner.spin();
    }
    else {
      whitewashSpinner = new Spinner(whitewashSpinnerOpts).spin();  
    }

    $loadingWhiteWash = $("<div />")
      .addClass(whitewashCssClass)
      .append(whitewashSpinner.el);

    $htmlHook = $(htmlSelectorHookForAppendingWhitewashLoadingDivs);
    $htmlHook.append($loadingWhiteWash);

    completeWhitewashLoadingTimeoutHandle = setTimeout(removeWhitewashLoadingIndicator,
      loadingIndicatorMaxDurationInSeconds * 1000);
  },

  removeWhitewashLoadingIndicator = function () {
    var
      $content = $(htmlSelectorHookForAppendingWhitewashLoadingDivs);

    if (whitewashSpinner) {
      whitewashSpinner.stop();  
    }

    $("." + whitewashCssClass, $content).remove();

    clearTimeout(completeWhitewashLoadingTimeoutHandle);
  };

  return {
    showInlineLoadingIndicator: showInlineLoadingIndicator,
    removeInlineLoadingIndicator: removeInlineLoadingIndicator,
    showWhitewashLoadingIndicator: showWhitewashLoadingIndicator,
    removeWhitewashLoadingIndicator: removeWhitewashLoadingIndicator
  };
}());
