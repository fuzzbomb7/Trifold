"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/*!
 * Bootstrap v3.3.7 (http://getbootstrap.com)
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under the MIT license
 */
if (typeof jQuery === 'undefined') {
  throw new Error('Bootstrap\'s JavaScript requires jQuery');
}

+function ($) {
  'use strict';

  var version = $.fn.jquery.split(' ')[0].split('.');

  if (version[0] < 2 && version[1] < 9 || version[0] == 1 && version[1] == 9 && version[2] < 1 || version[0] > 3) {
    throw new Error('Bootstrap\'s JavaScript requires jQuery version 1.9.1 or higher, but lower than version 4');
  }
}(jQuery);
/* ========================================================================
 * Bootstrap: transition.js v3.3.7
 * http://getbootstrap.com/javascript/#transitions
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */

+function ($) {
  'use strict'; // CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
  // ============================================================

  function transitionEnd() {
    var el = document.createElement('bootstrap');
    var transEndEventNames = {
      WebkitTransition: 'webkitTransitionEnd',
      MozTransition: 'transitionend',
      OTransition: 'oTransitionEnd otransitionend',
      transition: 'transitionend'
    };

    for (var name in transEndEventNames) {
      if (el.style[name] !== undefined) {
        return {
          end: transEndEventNames[name]
        };
      }
    }

    return false; // explicit for ie8 (  ._.)
  } // http://blog.alexmaccaw.com/css-transitions


  $.fn.emulateTransitionEnd = function (duration) {
    var called = false;
    var $el = this;
    $(this).one('bsTransitionEnd', function () {
      called = true;
    });

    var callback = function callback() {
      if (!called) $($el).trigger($.support.transition.end);
    };

    setTimeout(callback, duration);
    return this;
  };

  $(function () {
    $.support.transition = transitionEnd();
    if (!$.support.transition) return;
    $.event.special.bsTransitionEnd = {
      bindType: $.support.transition.end,
      delegateType: $.support.transition.end,
      handle: function handle(e) {
        if ($(e.target).is(this)) return e.handleObj.handler.apply(this, arguments);
      }
    };
  });
}(jQuery);
/* ========================================================================
 * Bootstrap: alert.js v3.3.7
 * http://getbootstrap.com/javascript/#alerts
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */

+function ($) {
  'use strict'; // ALERT CLASS DEFINITION
  // ======================

  var dismiss = '[data-dismiss="alert"]';

  var Alert = function Alert(el) {
    $(el).on('click', dismiss, this.close);
  };

  Alert.VERSION = '3.3.7';
  Alert.TRANSITION_DURATION = 150;

  Alert.prototype.close = function (e) {
    var $this = $(this);
    var selector = $this.attr('data-target');

    if (!selector) {
      selector = $this.attr('href');
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, ''); // strip for ie7
    }

    var $parent = $(selector === '#' ? [] : selector);
    if (e) e.preventDefault();

    if (!$parent.length) {
      $parent = $this.closest('.alert');
    }

    $parent.trigger(e = $.Event('close.bs.alert'));
    if (e.isDefaultPrevented()) return;
    $parent.removeClass('in');

    function removeElement() {
      // detach from parent, fire event then clean up data
      $parent.detach().trigger('closed.bs.alert').remove();
    }

    $.support.transition && $parent.hasClass('fade') ? $parent.one('bsTransitionEnd', removeElement).emulateTransitionEnd(Alert.TRANSITION_DURATION) : removeElement();
  }; // ALERT PLUGIN DEFINITION
  // =======================


  function Plugin(option) {
    return this.each(function () {
      var $this = $(this);
      var data = $this.data('bs.alert');
      if (!data) $this.data('bs.alert', data = new Alert(this));
      if (typeof option == 'string') data[option].call($this);
    });
  }

  var old = $.fn.alert;
  $.fn.alert = Plugin;
  $.fn.alert.Constructor = Alert; // ALERT NO CONFLICT
  // =================

  $.fn.alert.noConflict = function () {
    $.fn.alert = old;
    return this;
  }; // ALERT DATA-API
  // ==============


  $(document).on('click.bs.alert.data-api', dismiss, Alert.prototype.close);
}(jQuery);
/* ========================================================================
 * Bootstrap: button.js v3.3.7
 * http://getbootstrap.com/javascript/#buttons
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */

+function ($) {
  'use strict'; // BUTTON PUBLIC CLASS DEFINITION
  // ==============================

  var Button = function Button(element, options) {
    this.$element = $(element);
    this.options = $.extend({}, Button.DEFAULTS, options);
    this.isLoading = false;
  };

  Button.VERSION = '3.3.7';
  Button.DEFAULTS = {
    loadingText: 'loading...'
  };

  Button.prototype.setState = function (state) {
    var d = 'disabled';
    var $el = this.$element;
    var val = $el.is('input') ? 'val' : 'html';
    var data = $el.data();
    state += 'Text';
    if (data.resetText == null) $el.data('resetText', $el[val]()); // push to event loop to allow forms to submit

    setTimeout($.proxy(function () {
      $el[val](data[state] == null ? this.options[state] : data[state]);

      if (state == 'loadingText') {
        this.isLoading = true;
        $el.addClass(d).attr(d, d).prop(d, true);
      } else if (this.isLoading) {
        this.isLoading = false;
        $el.removeClass(d).removeAttr(d).prop(d, false);
      }
    }, this), 0);
  };

  Button.prototype.toggle = function () {
    var changed = true;
    var $parent = this.$element.closest('[data-toggle="buttons"]');

    if ($parent.length) {
      var $input = this.$element.find('input');

      if ($input.prop('type') == 'radio') {
        if ($input.prop('checked')) changed = false;
        $parent.find('.active').removeClass('active');
        this.$element.addClass('active');
      } else if ($input.prop('type') == 'checkbox') {
        if ($input.prop('checked') !== this.$element.hasClass('active')) changed = false;
        this.$element.toggleClass('active');
      }

      $input.prop('checked', this.$element.hasClass('active'));
      if (changed) $input.trigger('change');
    } else {
      this.$element.attr('aria-pressed', !this.$element.hasClass('active'));
      this.$element.toggleClass('active');
    }
  }; // BUTTON PLUGIN DEFINITION
  // ========================


  function Plugin(option) {
    return this.each(function () {
      var $this = $(this);
      var data = $this.data('bs.button');
      var options = _typeof(option) == 'object' && option;
      if (!data) $this.data('bs.button', data = new Button(this, options));
      if (option == 'toggle') data.toggle();else if (option) data.setState(option);
    });
  }

  var old = $.fn.button;
  $.fn.button = Plugin;
  $.fn.button.Constructor = Button; // BUTTON NO CONFLICT
  // ==================

  $.fn.button.noConflict = function () {
    $.fn.button = old;
    return this;
  }; // BUTTON DATA-API
  // ===============


  $(document).on('click.bs.button.data-api', '[data-toggle^="button"]', function (e) {
    var $btn = $(e.target).closest('.btn');
    Plugin.call($btn, 'toggle');

    if (!$(e.target).is('input[type="radio"], input[type="checkbox"]')) {
      // Prevent double click on radios, and the double selections (so cancellation) on checkboxes
      e.preventDefault(); // The target component still receive the focus

      if ($btn.is('input,button')) $btn.trigger('focus');else $btn.find('input:visible,button:visible').first().trigger('focus');
    }
  }).on('focus.bs.button.data-api blur.bs.button.data-api', '[data-toggle^="button"]', function (e) {
    $(e.target).closest('.btn').toggleClass('focus', /^focus(in)?$/.test(e.type));
  });
}(jQuery);
/* ========================================================================
 * Bootstrap: carousel.js v3.3.7
 * http://getbootstrap.com/javascript/#carousel
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */

+function ($) {
  'use strict'; // CAROUSEL CLASS DEFINITION
  // =========================

  var Carousel = function Carousel(element, options) {
    this.$element = $(element);
    this.$indicators = this.$element.find('.carousel-indicators');
    this.options = options;
    this.paused = null;
    this.sliding = null;
    this.interval = null;
    this.$active = null;
    this.$items = null;
    this.options.keyboard && this.$element.on('keydown.bs.carousel', $.proxy(this.keydown, this));
    this.options.pause == 'hover' && !('ontouchstart' in document.documentElement) && this.$element.on('mouseenter.bs.carousel', $.proxy(this.pause, this)).on('mouseleave.bs.carousel', $.proxy(this.cycle, this));
  };

  Carousel.VERSION = '3.3.7';
  Carousel.TRANSITION_DURATION = 600;
  Carousel.DEFAULTS = {
    interval: 5000,
    pause: 'hover',
    wrap: true,
    keyboard: true
  };

  Carousel.prototype.keydown = function (e) {
    if (/input|textarea/i.test(e.target.tagName)) return;

    switch (e.which) {
      case 37:
        this.prev();
        break;

      case 39:
        this.next();
        break;

      default:
        return;
    }

    e.preventDefault();
  };

  Carousel.prototype.cycle = function (e) {
    e || (this.paused = false);
    this.interval && clearInterval(this.interval);
    this.options.interval && !this.paused && (this.interval = setInterval($.proxy(this.next, this), this.options.interval));
    return this;
  };

  Carousel.prototype.getItemIndex = function (item) {
    this.$items = item.parent().children('.item');
    return this.$items.index(item || this.$active);
  };

  Carousel.prototype.getItemForDirection = function (direction, active) {
    var activeIndex = this.getItemIndex(active);
    var willWrap = direction == 'prev' && activeIndex === 0 || direction == 'next' && activeIndex == this.$items.length - 1;
    if (willWrap && !this.options.wrap) return active;
    var delta = direction == 'prev' ? -1 : 1;
    var itemIndex = (activeIndex + delta) % this.$items.length;
    return this.$items.eq(itemIndex);
  };

  Carousel.prototype.to = function (pos) {
    var that = this;
    var activeIndex = this.getItemIndex(this.$active = this.$element.find('.item.active'));
    if (pos > this.$items.length - 1 || pos < 0) return;
    if (this.sliding) return this.$element.one('slid.bs.carousel', function () {
      that.to(pos);
    }); // yes, "slid"

    if (activeIndex == pos) return this.pause().cycle();
    return this.slide(pos > activeIndex ? 'next' : 'prev', this.$items.eq(pos));
  };

  Carousel.prototype.pause = function (e) {
    e || (this.paused = true);

    if (this.$element.find('.next, .prev').length && $.support.transition) {
      this.$element.trigger($.support.transition.end);
      this.cycle(true);
    }

    this.interval = clearInterval(this.interval);
    return this;
  };

  Carousel.prototype.next = function () {
    if (this.sliding) return;
    return this.slide('next');
  };

  Carousel.prototype.prev = function () {
    if (this.sliding) return;
    return this.slide('prev');
  };

  Carousel.prototype.slide = function (type, next) {
    var $active = this.$element.find('.item.active');
    var $next = next || this.getItemForDirection(type, $active);
    var isCycling = this.interval;
    var direction = type == 'next' ? 'left' : 'right';
    var that = this;
    if ($next.hasClass('active')) return this.sliding = false;
    var relatedTarget = $next[0];
    var slideEvent = $.Event('slide.bs.carousel', {
      relatedTarget: relatedTarget,
      direction: direction
    });
    this.$element.trigger(slideEvent);
    if (slideEvent.isDefaultPrevented()) return;
    this.sliding = true;
    isCycling && this.pause();

    if (this.$indicators.length) {
      this.$indicators.find('.active').removeClass('active');
      var $nextIndicator = $(this.$indicators.children()[this.getItemIndex($next)]);
      $nextIndicator && $nextIndicator.addClass('active');
    }

    var slidEvent = $.Event('slid.bs.carousel', {
      relatedTarget: relatedTarget,
      direction: direction
    }); // yes, "slid"

    if ($.support.transition && this.$element.hasClass('slide')) {
      $next.addClass(type);
      $next[0].offsetWidth; // force reflow

      $active.addClass(direction);
      $next.addClass(direction);
      $active.one('bsTransitionEnd', function () {
        $next.removeClass([type, direction].join(' ')).addClass('active');
        $active.removeClass(['active', direction].join(' '));
        that.sliding = false;
        setTimeout(function () {
          that.$element.trigger(slidEvent);
        }, 0);
      }).emulateTransitionEnd(Carousel.TRANSITION_DURATION);
    } else {
      $active.removeClass('active');
      $next.addClass('active');
      this.sliding = false;
      this.$element.trigger(slidEvent);
    }

    isCycling && this.cycle();
    return this;
  }; // CAROUSEL PLUGIN DEFINITION
  // ==========================


  function Plugin(option) {
    return this.each(function () {
      var $this = $(this);
      var data = $this.data('bs.carousel');
      var options = $.extend({}, Carousel.DEFAULTS, $this.data(), _typeof(option) == 'object' && option);
      var action = typeof option == 'string' ? option : options.slide;
      if (!data) $this.data('bs.carousel', data = new Carousel(this, options));
      if (typeof option == 'number') data.to(option);else if (action) data[action]();else if (options.interval) data.pause().cycle();
    });
  }

  var old = $.fn.carousel;
  $.fn.carousel = Plugin;
  $.fn.carousel.Constructor = Carousel; // CAROUSEL NO CONFLICT
  // ====================

  $.fn.carousel.noConflict = function () {
    $.fn.carousel = old;
    return this;
  }; // CAROUSEL DATA-API
  // =================


  var clickHandler = function clickHandler(e) {
    var href;
    var $this = $(this);
    var $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')); // strip for ie7

    if (!$target.hasClass('carousel')) return;
    var options = $.extend({}, $target.data(), $this.data());
    var slideIndex = $this.attr('data-slide-to');
    if (slideIndex) options.interval = false;
    Plugin.call($target, options);

    if (slideIndex) {
      $target.data('bs.carousel').to(slideIndex);
    }

    e.preventDefault();
  };

  $(document).on('click.bs.carousel.data-api', '[data-slide]', clickHandler).on('click.bs.carousel.data-api', '[data-slide-to]', clickHandler);
  $(window).on('load', function () {
    $('[data-ride="carousel"]').each(function () {
      var $carousel = $(this);
      Plugin.call($carousel, $carousel.data());
    });
  });
}(jQuery);
/* ========================================================================
 * Bootstrap: collapse.js v3.3.7
 * http://getbootstrap.com/javascript/#collapse
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */

/* jshint latedef: false */

+function ($) {
  'use strict'; // COLLAPSE PUBLIC CLASS DEFINITION
  // ================================

  var Collapse = function Collapse(element, options) {
    this.$element = $(element);
    this.options = $.extend({}, Collapse.DEFAULTS, options);
    this.$trigger = $('[data-toggle="collapse"][href="#' + element.id + '"],' + '[data-toggle="collapse"][data-target="#' + element.id + '"]');
    this.transitioning = null;

    if (this.options.parent) {
      this.$parent = this.getParent();
    } else {
      this.addAriaAndCollapsedClass(this.$element, this.$trigger);
    }

    if (this.options.toggle) this.toggle();
  };

  Collapse.VERSION = '3.3.7';
  Collapse.TRANSITION_DURATION = 350;
  Collapse.DEFAULTS = {
    toggle: true
  };

  Collapse.prototype.dimension = function () {
    var hasWidth = this.$element.hasClass('width');
    return hasWidth ? 'width' : 'height';
  };

  Collapse.prototype.show = function () {
    if (this.transitioning || this.$element.hasClass('in')) return;
    var activesData;
    var actives = this.$parent && this.$parent.children('.panel').children('.in, .collapsing');

    if (actives && actives.length) {
      activesData = actives.data('bs.collapse');
      if (activesData && activesData.transitioning) return;
    }

    var startEvent = $.Event('show.bs.collapse');
    this.$element.trigger(startEvent);
    if (startEvent.isDefaultPrevented()) return;

    if (actives && actives.length) {
      Plugin.call(actives, 'hide');
      activesData || actives.data('bs.collapse', null);
    }

    var dimension = this.dimension();
    this.$element.removeClass('collapse').addClass('collapsing')[dimension](0).attr('aria-expanded', true);
    this.$trigger.removeClass('collapsed').attr('aria-expanded', true);
    this.transitioning = 1;

    var complete = function complete() {
      this.$element.removeClass('collapsing').addClass('collapse in')[dimension]('');
      this.transitioning = 0;
      this.$element.trigger('shown.bs.collapse');
    };

    if (!$.support.transition) return complete.call(this);
    var scrollSize = $.camelCase(['scroll', dimension].join('-'));
    this.$element.one('bsTransitionEnd', $.proxy(complete, this)).emulateTransitionEnd(Collapse.TRANSITION_DURATION)[dimension](this.$element[0][scrollSize]);
  };

  Collapse.prototype.hide = function () {
    if (this.transitioning || !this.$element.hasClass('in')) return;
    var startEvent = $.Event('hide.bs.collapse');
    this.$element.trigger(startEvent);
    if (startEvent.isDefaultPrevented()) return;
    var dimension = this.dimension();
    this.$element[dimension](this.$element[dimension]())[0].offsetHeight;
    this.$element.addClass('collapsing').removeClass('collapse in').attr('aria-expanded', false);
    this.$trigger.addClass('collapsed').attr('aria-expanded', false);
    this.transitioning = 1;

    var complete = function complete() {
      this.transitioning = 0;
      this.$element.removeClass('collapsing').addClass('collapse').trigger('hidden.bs.collapse');
    };

    if (!$.support.transition) return complete.call(this);
    this.$element[dimension](0).one('bsTransitionEnd', $.proxy(complete, this)).emulateTransitionEnd(Collapse.TRANSITION_DURATION);
  };

  Collapse.prototype.toggle = function () {
    this[this.$element.hasClass('in') ? 'hide' : 'show']();
  };

  Collapse.prototype.getParent = function () {
    return $(this.options.parent).find('[data-toggle="collapse"][data-parent="' + this.options.parent + '"]').each($.proxy(function (i, element) {
      var $element = $(element);
      this.addAriaAndCollapsedClass(getTargetFromTrigger($element), $element);
    }, this)).end();
  };

  Collapse.prototype.addAriaAndCollapsedClass = function ($element, $trigger) {
    var isOpen = $element.hasClass('in');
    $element.attr('aria-expanded', isOpen);
    $trigger.toggleClass('collapsed', !isOpen).attr('aria-expanded', isOpen);
  };

  function getTargetFromTrigger($trigger) {
    var href;
    var target = $trigger.attr('data-target') || (href = $trigger.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, ''); // strip for ie7

    return $(target);
  } // COLLAPSE PLUGIN DEFINITION
  // ==========================


  function Plugin(option) {
    return this.each(function () {
      var $this = $(this);
      var data = $this.data('bs.collapse');
      var options = $.extend({}, Collapse.DEFAULTS, $this.data(), _typeof(option) == 'object' && option);
      if (!data && options.toggle && /show|hide/.test(option)) options.toggle = false;
      if (!data) $this.data('bs.collapse', data = new Collapse(this, options));
      if (typeof option == 'string') data[option]();
    });
  }

  var old = $.fn.collapse;
  $.fn.collapse = Plugin;
  $.fn.collapse.Constructor = Collapse; // COLLAPSE NO CONFLICT
  // ====================

  $.fn.collapse.noConflict = function () {
    $.fn.collapse = old;
    return this;
  }; // COLLAPSE DATA-API
  // =================


  $(document).on('click.bs.collapse.data-api', '[data-toggle="collapse"]', function (e) {
    var $this = $(this);
    if (!$this.attr('data-target')) e.preventDefault();
    var $target = getTargetFromTrigger($this);
    var data = $target.data('bs.collapse');
    var option = data ? 'toggle' : $this.data();
    Plugin.call($target, option);
  });
}(jQuery);
/* ========================================================================
 * Bootstrap: dropdown.js v3.3.7
 * http://getbootstrap.com/javascript/#dropdowns
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */

+function ($) {
  'use strict'; // DROPDOWN CLASS DEFINITION
  // =========================

  var backdrop = '.dropdown-backdrop';
  var toggle = '[data-toggle="dropdown"]';

  var Dropdown = function Dropdown(element) {
    $(element).on('click.bs.dropdown', this.toggle);
  };

  Dropdown.VERSION = '3.3.7';

  function getParent($this) {
    var selector = $this.attr('data-target');

    if (!selector) {
      selector = $this.attr('href');
      selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, ''); // strip for ie7
    }

    var $parent = selector && $(selector);
    return $parent && $parent.length ? $parent : $this.parent();
  }

  function clearMenus(e) {
    if (e && e.which === 3) return;
    $(backdrop).remove();
    $(toggle).each(function () {
      var $this = $(this);
      var $parent = getParent($this);
      var relatedTarget = {
        relatedTarget: this
      };
      if (!$parent.hasClass('open')) return;
      if (e && e.type == 'click' && /input|textarea/i.test(e.target.tagName) && $.contains($parent[0], e.target)) return;
      $parent.trigger(e = $.Event('hide.bs.dropdown', relatedTarget));
      if (e.isDefaultPrevented()) return;
      $this.attr('aria-expanded', 'false');
      $parent.removeClass('open').trigger($.Event('hidden.bs.dropdown', relatedTarget));
    });
  }

  Dropdown.prototype.toggle = function (e) {
    var $this = $(this);
    if ($this.is('.disabled, :disabled')) return;
    var $parent = getParent($this);
    var isActive = $parent.hasClass('open');
    clearMenus();

    if (!isActive) {
      if ('ontouchstart' in document.documentElement && !$parent.closest('.navbar-nav').length) {
        // if mobile we use a backdrop because click events don't delegate
        $(document.createElement('div')).addClass('dropdown-backdrop').insertAfter($(this)).on('click', clearMenus);
      }

      var relatedTarget = {
        relatedTarget: this
      };
      $parent.trigger(e = $.Event('show.bs.dropdown', relatedTarget));
      if (e.isDefaultPrevented()) return;
      $this.trigger('focus').attr('aria-expanded', 'true');
      $parent.toggleClass('open').trigger($.Event('shown.bs.dropdown', relatedTarget));
    }

    return false;
  };

  Dropdown.prototype.keydown = function (e) {
    if (!/(38|40|27|32)/.test(e.which) || /input|textarea/i.test(e.target.tagName)) return;
    var $this = $(this);
    e.preventDefault();
    e.stopPropagation();
    if ($this.is('.disabled, :disabled')) return;
    var $parent = getParent($this);
    var isActive = $parent.hasClass('open');

    if (!isActive && e.which != 27 || isActive && e.which == 27) {
      if (e.which == 27) $parent.find(toggle).trigger('focus');
      return $this.trigger('click');
    }

    var desc = ' li:not(.disabled):visible a';
    var $items = $parent.find('.dropdown-menu' + desc);
    if (!$items.length) return;
    var index = $items.index(e.target);
    if (e.which == 38 && index > 0) index--; // up

    if (e.which == 40 && index < $items.length - 1) index++; // down

    if (!~index) index = 0;
    $items.eq(index).trigger('focus');
  }; // DROPDOWN PLUGIN DEFINITION
  // ==========================


  function Plugin(option) {
    return this.each(function () {
      var $this = $(this);
      var data = $this.data('bs.dropdown');
      if (!data) $this.data('bs.dropdown', data = new Dropdown(this));
      if (typeof option == 'string') data[option].call($this);
    });
  }

  var old = $.fn.dropdown;
  $.fn.dropdown = Plugin;
  $.fn.dropdown.Constructor = Dropdown; // DROPDOWN NO CONFLICT
  // ====================

  $.fn.dropdown.noConflict = function () {
    $.fn.dropdown = old;
    return this;
  }; // APPLY TO STANDARD DROPDOWN ELEMENTS
  // ===================================


  $(document).on('click.bs.dropdown.data-api', clearMenus).on('click.bs.dropdown.data-api', '.dropdown form', function (e) {
    e.stopPropagation();
  }).on('click.bs.dropdown.data-api', toggle, Dropdown.prototype.toggle).on('keydown.bs.dropdown.data-api', toggle, Dropdown.prototype.keydown).on('keydown.bs.dropdown.data-api', '.dropdown-menu', Dropdown.prototype.keydown);
}(jQuery);
/* ========================================================================
 * Bootstrap: modal.js v3.3.7
 * http://getbootstrap.com/javascript/#modals
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */

+function ($) {
  'use strict'; // MODAL CLASS DEFINITION
  // ======================

  var Modal = function Modal(element, options) {
    this.options = options;
    this.$body = $(document.body);
    this.$element = $(element);
    this.$dialog = this.$element.find('.modal-dialog');
    this.$backdrop = null;
    this.isShown = null;
    this.originalBodyPad = null;
    this.scrollbarWidth = 0;
    this.ignoreBackdropClick = false;

    if (this.options.remote) {
      this.$element.find('.modal-content').load(this.options.remote, $.proxy(function () {
        this.$element.trigger('loaded.bs.modal');
      }, this));
    }
  };

  Modal.VERSION = '3.3.7';
  Modal.TRANSITION_DURATION = 300;
  Modal.BACKDROP_TRANSITION_DURATION = 150;
  Modal.DEFAULTS = {
    backdrop: true,
    keyboard: true,
    show: true
  };

  Modal.prototype.toggle = function (_relatedTarget) {
    return this.isShown ? this.hide() : this.show(_relatedTarget);
  };

  Modal.prototype.show = function (_relatedTarget) {
    var that = this;
    var e = $.Event('show.bs.modal', {
      relatedTarget: _relatedTarget
    });
    this.$element.trigger(e);
    if (this.isShown || e.isDefaultPrevented()) return;
    this.isShown = true;
    this.checkScrollbar();
    this.setScrollbar();
    this.$body.addClass('modal-open');
    this.escape();
    this.resize();
    this.$element.on('click.dismiss.bs.modal', '[data-dismiss="modal"]', $.proxy(this.hide, this));
    this.$dialog.on('mousedown.dismiss.bs.modal', function () {
      that.$element.one('mouseup.dismiss.bs.modal', function (e) {
        if ($(e.target).is(that.$element)) that.ignoreBackdropClick = true;
      });
    });
    this.backdrop(function () {
      var transition = $.support.transition && that.$element.hasClass('fade');

      if (!that.$element.parent().length) {
        that.$element.appendTo(that.$body); // don't move modals dom position
      }

      that.$element.show().scrollTop(0);
      that.adjustDialog();

      if (transition) {
        that.$element[0].offsetWidth; // force reflow
      }

      that.$element.addClass('in');
      that.enforceFocus();
      var e = $.Event('shown.bs.modal', {
        relatedTarget: _relatedTarget
      });
      transition ? that.$dialog // wait for modal to slide in
      .one('bsTransitionEnd', function () {
        that.$element.trigger('focus').trigger(e);
      }).emulateTransitionEnd(Modal.TRANSITION_DURATION) : that.$element.trigger('focus').trigger(e);
    });
  };

  Modal.prototype.hide = function (e) {
    if (e) e.preventDefault();
    e = $.Event('hide.bs.modal');
    this.$element.trigger(e);
    if (!this.isShown || e.isDefaultPrevented()) return;
    this.isShown = false;
    this.escape();
    this.resize();
    $(document).off('focusin.bs.modal');
    this.$element.removeClass('in').off('click.dismiss.bs.modal').off('mouseup.dismiss.bs.modal');
    this.$dialog.off('mousedown.dismiss.bs.modal');
    $.support.transition && this.$element.hasClass('fade') ? this.$element.one('bsTransitionEnd', $.proxy(this.hideModal, this)).emulateTransitionEnd(Modal.TRANSITION_DURATION) : this.hideModal();
  };

  Modal.prototype.enforceFocus = function () {
    $(document).off('focusin.bs.modal') // guard against infinite focus loop
    .on('focusin.bs.modal', $.proxy(function (e) {
      if (document !== e.target && this.$element[0] !== e.target && !this.$element.has(e.target).length) {
        this.$element.trigger('focus');
      }
    }, this));
  };

  Modal.prototype.escape = function () {
    if (this.isShown && this.options.keyboard) {
      this.$element.on('keydown.dismiss.bs.modal', $.proxy(function (e) {
        e.which == 27 && this.hide();
      }, this));
    } else if (!this.isShown) {
      this.$element.off('keydown.dismiss.bs.modal');
    }
  };

  Modal.prototype.resize = function () {
    if (this.isShown) {
      $(window).on('resize.bs.modal', $.proxy(this.handleUpdate, this));
    } else {
      $(window).off('resize.bs.modal');
    }
  };

  Modal.prototype.hideModal = function () {
    var that = this;
    this.$element.hide();
    this.backdrop(function () {
      that.$body.removeClass('modal-open');
      that.resetAdjustments();
      that.resetScrollbar();
      that.$element.trigger('hidden.bs.modal');
    });
  };

  Modal.prototype.removeBackdrop = function () {
    this.$backdrop && this.$backdrop.remove();
    this.$backdrop = null;
  };

  Modal.prototype.backdrop = function (callback) {
    var that = this;
    var animate = this.$element.hasClass('fade') ? 'fade' : '';

    if (this.isShown && this.options.backdrop) {
      var doAnimate = $.support.transition && animate;
      this.$backdrop = $(document.createElement('div')).addClass('modal-backdrop ' + animate).appendTo(this.$body);
      this.$element.on('click.dismiss.bs.modal', $.proxy(function (e) {
        if (this.ignoreBackdropClick) {
          this.ignoreBackdropClick = false;
          return;
        }

        if (e.target !== e.currentTarget) return;
        this.options.backdrop == 'static' ? this.$element[0].focus() : this.hide();
      }, this));
      if (doAnimate) this.$backdrop[0].offsetWidth; // force reflow

      this.$backdrop.addClass('in');
      if (!callback) return;
      doAnimate ? this.$backdrop.one('bsTransitionEnd', callback).emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) : callback();
    } else if (!this.isShown && this.$backdrop) {
      this.$backdrop.removeClass('in');

      var callbackRemove = function callbackRemove() {
        that.removeBackdrop();
        callback && callback();
      };

      $.support.transition && this.$element.hasClass('fade') ? this.$backdrop.one('bsTransitionEnd', callbackRemove).emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) : callbackRemove();
    } else if (callback) {
      callback();
    }
  }; // these following methods are used to handle overflowing modals


  Modal.prototype.handleUpdate = function () {
    this.adjustDialog();
  };

  Modal.prototype.adjustDialog = function () {
    var modalIsOverflowing = this.$element[0].scrollHeight > document.documentElement.clientHeight;
    this.$element.css({
      paddingLeft: !this.bodyIsOverflowing && modalIsOverflowing ? this.scrollbarWidth : '',
      paddingRight: this.bodyIsOverflowing && !modalIsOverflowing ? this.scrollbarWidth : ''
    });
  };

  Modal.prototype.resetAdjustments = function () {
    this.$element.css({
      paddingLeft: '',
      paddingRight: ''
    });
  };

  Modal.prototype.checkScrollbar = function () {
    var fullWindowWidth = window.innerWidth;

    if (!fullWindowWidth) {
      // workaround for missing window.innerWidth in IE8
      var documentElementRect = document.documentElement.getBoundingClientRect();
      fullWindowWidth = documentElementRect.right - Math.abs(documentElementRect.left);
    }

    this.bodyIsOverflowing = document.body.clientWidth < fullWindowWidth;
    this.scrollbarWidth = this.measureScrollbar();
  };

  Modal.prototype.setScrollbar = function () {
    var bodyPad = parseInt(this.$body.css('padding-right') || 0, 10);
    this.originalBodyPad = document.body.style.paddingRight || '';
    if (this.bodyIsOverflowing) this.$body.css('padding-right', bodyPad + this.scrollbarWidth);
  };

  Modal.prototype.resetScrollbar = function () {
    this.$body.css('padding-right', this.originalBodyPad);
  };

  Modal.prototype.measureScrollbar = function () {
    // thx walsh
    var scrollDiv = document.createElement('div');
    scrollDiv.className = 'modal-scrollbar-measure';
    this.$body.append(scrollDiv);
    var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
    this.$body[0].removeChild(scrollDiv);
    return scrollbarWidth;
  }; // MODAL PLUGIN DEFINITION
  // =======================


  function Plugin(option, _relatedTarget) {
    return this.each(function () {
      var $this = $(this);
      var data = $this.data('bs.modal');
      var options = $.extend({}, Modal.DEFAULTS, $this.data(), _typeof(option) == 'object' && option);
      if (!data) $this.data('bs.modal', data = new Modal(this, options));
      if (typeof option == 'string') data[option](_relatedTarget);else if (options.show) data.show(_relatedTarget);
    });
  }

  var old = $.fn.modal;
  $.fn.modal = Plugin;
  $.fn.modal.Constructor = Modal; // MODAL NO CONFLICT
  // =================

  $.fn.modal.noConflict = function () {
    $.fn.modal = old;
    return this;
  }; // MODAL DATA-API
  // ==============


  $(document).on('click.bs.modal.data-api', '[data-toggle="modal"]', function (e) {
    var $this = $(this);
    var href = $this.attr('href');
    var $target = $($this.attr('data-target') || href && href.replace(/.*(?=#[^\s]+$)/, '')); // strip for ie7

    var option = $target.data('bs.modal') ? 'toggle' : $.extend({
      remote: !/#/.test(href) && href
    }, $target.data(), $this.data());
    if ($this.is('a')) e.preventDefault();
    $target.one('show.bs.modal', function (showEvent) {
      if (showEvent.isDefaultPrevented()) return; // only register focus restorer if modal will actually get shown

      $target.one('hidden.bs.modal', function () {
        $this.is(':visible') && $this.trigger('focus');
      });
    });
    Plugin.call($target, option, this);
  });
}(jQuery);
/* ========================================================================
 * Bootstrap: tooltip.js v3.3.7
 * http://getbootstrap.com/javascript/#tooltip
 * Inspired by the original jQuery.tipsy by Jason Frame
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */

+function ($) {
  'use strict'; // TOOLTIP PUBLIC CLASS DEFINITION
  // ===============================

  var Tooltip = function Tooltip(element, options) {
    this.type = null;
    this.options = null;
    this.enabled = null;
    this.timeout = null;
    this.hoverState = null;
    this.$element = null;
    this.inState = null;
    this.init('tooltip', element, options);
  };

  Tooltip.VERSION = '3.3.7';
  Tooltip.TRANSITION_DURATION = 150;
  Tooltip.DEFAULTS = {
    animation: true,
    placement: 'top',
    selector: false,
    template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
    trigger: 'hover focus',
    title: '',
    delay: 0,
    html: false,
    container: false,
    viewport: {
      selector: 'body',
      padding: 0
    }
  };

  Tooltip.prototype.init = function (type, element, options) {
    this.enabled = true;
    this.type = type;
    this.$element = $(element);
    this.options = this.getOptions(options);
    this.$viewport = this.options.viewport && $($.isFunction(this.options.viewport) ? this.options.viewport.call(this, this.$element) : this.options.viewport.selector || this.options.viewport);
    this.inState = {
      click: false,
      hover: false,
      focus: false
    };

    if (this.$element[0] instanceof document.constructor && !this.options.selector) {
      throw new Error('`selector` option must be specified when initializing ' + this.type + ' on the window.document object!');
    }

    var triggers = this.options.trigger.split(' ');

    for (var i = triggers.length; i--;) {
      var trigger = triggers[i];

      if (trigger == 'click') {
        this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this));
      } else if (trigger != 'manual') {
        var eventIn = trigger == 'hover' ? 'mouseenter' : 'focusin';
        var eventOut = trigger == 'hover' ? 'mouseleave' : 'focusout';
        this.$element.on(eventIn + '.' + this.type, this.options.selector, $.proxy(this.enter, this));
        this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this));
      }
    }

    this.options.selector ? this._options = $.extend({}, this.options, {
      trigger: 'manual',
      selector: ''
    }) : this.fixTitle();
  };

  Tooltip.prototype.getDefaults = function () {
    return Tooltip.DEFAULTS;
  };

  Tooltip.prototype.getOptions = function (options) {
    options = $.extend({}, this.getDefaults(), this.$element.data(), options);

    if (options.delay && typeof options.delay == 'number') {
      options.delay = {
        show: options.delay,
        hide: options.delay
      };
    }

    return options;
  };

  Tooltip.prototype.getDelegateOptions = function () {
    var options = {};
    var defaults = this.getDefaults();
    this._options && $.each(this._options, function (key, value) {
      if (defaults[key] != value) options[key] = value;
    });
    return options;
  };

  Tooltip.prototype.enter = function (obj) {
    var self = obj instanceof this.constructor ? obj : $(obj.currentTarget).data('bs.' + this.type);

    if (!self) {
      self = new this.constructor(obj.currentTarget, this.getDelegateOptions());
      $(obj.currentTarget).data('bs.' + this.type, self);
    }

    if (obj instanceof $.Event) {
      self.inState[obj.type == 'focusin' ? 'focus' : 'hover'] = true;
    }

    if (self.tip().hasClass('in') || self.hoverState == 'in') {
      self.hoverState = 'in';
      return;
    }

    clearTimeout(self.timeout);
    self.hoverState = 'in';
    if (!self.options.delay || !self.options.delay.show) return self.show();
    self.timeout = setTimeout(function () {
      if (self.hoverState == 'in') self.show();
    }, self.options.delay.show);
  };

  Tooltip.prototype.isInStateTrue = function () {
    for (var key in this.inState) {
      if (this.inState[key]) return true;
    }

    return false;
  };

  Tooltip.prototype.leave = function (obj) {
    var self = obj instanceof this.constructor ? obj : $(obj.currentTarget).data('bs.' + this.type);

    if (!self) {
      self = new this.constructor(obj.currentTarget, this.getDelegateOptions());
      $(obj.currentTarget).data('bs.' + this.type, self);
    }

    if (obj instanceof $.Event) {
      self.inState[obj.type == 'focusout' ? 'focus' : 'hover'] = false;
    }

    if (self.isInStateTrue()) return;
    clearTimeout(self.timeout);
    self.hoverState = 'out';
    if (!self.options.delay || !self.options.delay.hide) return self.hide();
    self.timeout = setTimeout(function () {
      if (self.hoverState == 'out') self.hide();
    }, self.options.delay.hide);
  };

  Tooltip.prototype.show = function () {
    var e = $.Event('show.bs.' + this.type);

    if (this.hasContent() && this.enabled) {
      this.$element.trigger(e);
      var inDom = $.contains(this.$element[0].ownerDocument.documentElement, this.$element[0]);
      if (e.isDefaultPrevented() || !inDom) return;
      var that = this;
      var $tip = this.tip();
      var tipId = this.getUID(this.type);
      this.setContent();
      $tip.attr('id', tipId);
      this.$element.attr('aria-describedby', tipId);
      if (this.options.animation) $tip.addClass('fade');
      var placement = typeof this.options.placement == 'function' ? this.options.placement.call(this, $tip[0], this.$element[0]) : this.options.placement;
      var autoToken = /\s?auto?\s?/i;
      var autoPlace = autoToken.test(placement);
      if (autoPlace) placement = placement.replace(autoToken, '') || 'top';
      $tip.detach().css({
        top: 0,
        left: 0,
        display: 'block'
      }).addClass(placement).data('bs.' + this.type, this);
      this.options.container ? $tip.appendTo(this.options.container) : $tip.insertAfter(this.$element);
      this.$element.trigger('inserted.bs.' + this.type);
      var pos = this.getPosition();
      var actualWidth = $tip[0].offsetWidth;
      var actualHeight = $tip[0].offsetHeight;

      if (autoPlace) {
        var orgPlacement = placement;
        var viewportDim = this.getPosition(this.$viewport);
        placement = placement == 'bottom' && pos.bottom + actualHeight > viewportDim.bottom ? 'top' : placement == 'top' && pos.top - actualHeight < viewportDim.top ? 'bottom' : placement == 'right' && pos.right + actualWidth > viewportDim.width ? 'left' : placement == 'left' && pos.left - actualWidth < viewportDim.left ? 'right' : placement;
        $tip.removeClass(orgPlacement).addClass(placement);
      }

      var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight);
      this.applyPlacement(calculatedOffset, placement);

      var complete = function complete() {
        var prevHoverState = that.hoverState;
        that.$element.trigger('shown.bs.' + that.type);
        that.hoverState = null;
        if (prevHoverState == 'out') that.leave(that);
      };

      $.support.transition && this.$tip.hasClass('fade') ? $tip.one('bsTransitionEnd', complete).emulateTransitionEnd(Tooltip.TRANSITION_DURATION) : complete();
    }
  };

  Tooltip.prototype.applyPlacement = function (offset, placement) {
    var $tip = this.tip();
    var width = $tip[0].offsetWidth;
    var height = $tip[0].offsetHeight; // manually read margins because getBoundingClientRect includes difference

    var marginTop = parseInt($tip.css('margin-top'), 10);
    var marginLeft = parseInt($tip.css('margin-left'), 10); // we must check for NaN for ie 8/9

    if (isNaN(marginTop)) marginTop = 0;
    if (isNaN(marginLeft)) marginLeft = 0;
    offset.top += marginTop;
    offset.left += marginLeft; // $.fn.offset doesn't round pixel values
    // so we use setOffset directly with our own function B-0

    $.offset.setOffset($tip[0], $.extend({
      using: function using(props) {
        $tip.css({
          top: Math.round(props.top),
          left: Math.round(props.left)
        });
      }
    }, offset), 0);
    $tip.addClass('in'); // check to see if placing tip in new offset caused the tip to resize itself

    var actualWidth = $tip[0].offsetWidth;
    var actualHeight = $tip[0].offsetHeight;

    if (placement == 'top' && actualHeight != height) {
      offset.top = offset.top + height - actualHeight;
    }

    var delta = this.getViewportAdjustedDelta(placement, offset, actualWidth, actualHeight);
    if (delta.left) offset.left += delta.left;else offset.top += delta.top;
    var isVertical = /top|bottom/.test(placement);
    var arrowDelta = isVertical ? delta.left * 2 - width + actualWidth : delta.top * 2 - height + actualHeight;
    var arrowOffsetPosition = isVertical ? 'offsetWidth' : 'offsetHeight';
    $tip.offset(offset);
    this.replaceArrow(arrowDelta, $tip[0][arrowOffsetPosition], isVertical);
  };

  Tooltip.prototype.replaceArrow = function (delta, dimension, isVertical) {
    this.arrow().css(isVertical ? 'left' : 'top', 50 * (1 - delta / dimension) + '%').css(isVertical ? 'top' : 'left', '');
  };

  Tooltip.prototype.setContent = function () {
    var $tip = this.tip();
    var title = this.getTitle();
    $tip.find('.tooltip-inner')[this.options.html ? 'html' : 'text'](title);
    $tip.removeClass('fade in top bottom left right');
  };

  Tooltip.prototype.hide = function (callback) {
    var that = this;
    var $tip = $(this.$tip);
    var e = $.Event('hide.bs.' + this.type);

    function complete() {
      if (that.hoverState != 'in') $tip.detach();

      if (that.$element) {
        // TODO: Check whether guarding this code with this `if` is really necessary.
        that.$element.removeAttr('aria-describedby').trigger('hidden.bs.' + that.type);
      }

      callback && callback();
    }

    this.$element.trigger(e);
    if (e.isDefaultPrevented()) return;
    $tip.removeClass('in');
    $.support.transition && $tip.hasClass('fade') ? $tip.one('bsTransitionEnd', complete).emulateTransitionEnd(Tooltip.TRANSITION_DURATION) : complete();
    this.hoverState = null;
    return this;
  };

  Tooltip.prototype.fixTitle = function () {
    var $e = this.$element;

    if ($e.attr('title') || typeof $e.attr('data-original-title') != 'string') {
      $e.attr('data-original-title', $e.attr('title') || '').attr('title', '');
    }
  };

  Tooltip.prototype.hasContent = function () {
    return this.getTitle();
  };

  Tooltip.prototype.getPosition = function ($element) {
    $element = $element || this.$element;
    var el = $element[0];
    var isBody = el.tagName == 'BODY';
    var elRect = el.getBoundingClientRect();

    if (elRect.width == null) {
      // width and height are missing in IE8, so compute them manually; see https://github.com/twbs/bootstrap/issues/14093
      elRect = $.extend({}, elRect, {
        width: elRect.right - elRect.left,
        height: elRect.bottom - elRect.top
      });
    }

    var isSvg = window.SVGElement && el instanceof window.SVGElement; // Avoid using $.offset() on SVGs since it gives incorrect results in jQuery 3.
    // See https://github.com/twbs/bootstrap/issues/20280

    var elOffset = isBody ? {
      top: 0,
      left: 0
    } : isSvg ? null : $element.offset();
    var scroll = {
      scroll: isBody ? document.documentElement.scrollTop || document.body.scrollTop : $element.scrollTop()
    };
    var outerDims = isBody ? {
      width: $(window).width(),
      height: $(window).height()
    } : null;
    return $.extend({}, elRect, scroll, outerDims, elOffset);
  };

  Tooltip.prototype.getCalculatedOffset = function (placement, pos, actualWidth, actualHeight) {
    return placement == 'bottom' ? {
      top: pos.top + pos.height,
      left: pos.left + pos.width / 2 - actualWidth / 2
    } : placement == 'top' ? {
      top: pos.top - actualHeight,
      left: pos.left + pos.width / 2 - actualWidth / 2
    } : placement == 'left' ? {
      top: pos.top + pos.height / 2 - actualHeight / 2,
      left: pos.left - actualWidth
    } :
    /* placement == 'right' */
    {
      top: pos.top + pos.height / 2 - actualHeight / 2,
      left: pos.left + pos.width
    };
  };

  Tooltip.prototype.getViewportAdjustedDelta = function (placement, pos, actualWidth, actualHeight) {
    var delta = {
      top: 0,
      left: 0
    };
    if (!this.$viewport) return delta;
    var viewportPadding = this.options.viewport && this.options.viewport.padding || 0;
    var viewportDimensions = this.getPosition(this.$viewport);

    if (/right|left/.test(placement)) {
      var topEdgeOffset = pos.top - viewportPadding - viewportDimensions.scroll;
      var bottomEdgeOffset = pos.top + viewportPadding - viewportDimensions.scroll + actualHeight;

      if (topEdgeOffset < viewportDimensions.top) {
        // top overflow
        delta.top = viewportDimensions.top - topEdgeOffset;
      } else if (bottomEdgeOffset > viewportDimensions.top + viewportDimensions.height) {
        // bottom overflow
        delta.top = viewportDimensions.top + viewportDimensions.height - bottomEdgeOffset;
      }
    } else {
      var leftEdgeOffset = pos.left - viewportPadding;
      var rightEdgeOffset = pos.left + viewportPadding + actualWidth;

      if (leftEdgeOffset < viewportDimensions.left) {
        // left overflow
        delta.left = viewportDimensions.left - leftEdgeOffset;
      } else if (rightEdgeOffset > viewportDimensions.right) {
        // right overflow
        delta.left = viewportDimensions.left + viewportDimensions.width - rightEdgeOffset;
      }
    }

    return delta;
  };

  Tooltip.prototype.getTitle = function () {
    var title;
    var $e = this.$element;
    var o = this.options;
    title = $e.attr('data-original-title') || (typeof o.title == 'function' ? o.title.call($e[0]) : o.title);
    return title;
  };

  Tooltip.prototype.getUID = function (prefix) {
    do {
      prefix += ~~(Math.random() * 1000000);
    } while (document.getElementById(prefix));

    return prefix;
  };

  Tooltip.prototype.tip = function () {
    if (!this.$tip) {
      this.$tip = $(this.options.template);

      if (this.$tip.length != 1) {
        throw new Error(this.type + ' `template` option must consist of exactly 1 top-level element!');
      }
    }

    return this.$tip;
  };

  Tooltip.prototype.arrow = function () {
    return this.$arrow = this.$arrow || this.tip().find('.tooltip-arrow');
  };

  Tooltip.prototype.enable = function () {
    this.enabled = true;
  };

  Tooltip.prototype.disable = function () {
    this.enabled = false;
  };

  Tooltip.prototype.toggleEnabled = function () {
    this.enabled = !this.enabled;
  };

  Tooltip.prototype.toggle = function (e) {
    var self = this;

    if (e) {
      self = $(e.currentTarget).data('bs.' + this.type);

      if (!self) {
        self = new this.constructor(e.currentTarget, this.getDelegateOptions());
        $(e.currentTarget).data('bs.' + this.type, self);
      }
    }

    if (e) {
      self.inState.click = !self.inState.click;
      if (self.isInStateTrue()) self.enter(self);else self.leave(self);
    } else {
      self.tip().hasClass('in') ? self.leave(self) : self.enter(self);
    }
  };

  Tooltip.prototype.destroy = function () {
    var that = this;
    clearTimeout(this.timeout);
    this.hide(function () {
      that.$element.off('.' + that.type).removeData('bs.' + that.type);

      if (that.$tip) {
        that.$tip.detach();
      }

      that.$tip = null;
      that.$arrow = null;
      that.$viewport = null;
      that.$element = null;
    });
  }; // TOOLTIP PLUGIN DEFINITION
  // =========================


  function Plugin(option) {
    return this.each(function () {
      var $this = $(this);
      var data = $this.data('bs.tooltip');
      var options = _typeof(option) == 'object' && option;
      if (!data && /destroy|hide/.test(option)) return;
      if (!data) $this.data('bs.tooltip', data = new Tooltip(this, options));
      if (typeof option == 'string') data[option]();
    });
  }

  var old = $.fn.tooltip;
  $.fn.tooltip = Plugin;
  $.fn.tooltip.Constructor = Tooltip; // TOOLTIP NO CONFLICT
  // ===================

  $.fn.tooltip.noConflict = function () {
    $.fn.tooltip = old;
    return this;
  };
}(jQuery);
/* ========================================================================
 * Bootstrap: popover.js v3.3.7
 * http://getbootstrap.com/javascript/#popovers
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */

+function ($) {
  'use strict'; // POPOVER PUBLIC CLASS DEFINITION
  // ===============================

  var Popover = function Popover(element, options) {
    this.init('popover', element, options);
  };

  if (!$.fn.tooltip) throw new Error('Popover requires tooltip.js');
  Popover.VERSION = '3.3.7';
  Popover.DEFAULTS = $.extend({}, $.fn.tooltip.Constructor.DEFAULTS, {
    placement: 'right',
    trigger: 'click',
    content: '',
    template: '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
  }); // NOTE: POPOVER EXTENDS tooltip.js
  // ================================

  Popover.prototype = $.extend({}, $.fn.tooltip.Constructor.prototype);
  Popover.prototype.constructor = Popover;

  Popover.prototype.getDefaults = function () {
    return Popover.DEFAULTS;
  };

  Popover.prototype.setContent = function () {
    var $tip = this.tip();
    var title = this.getTitle();
    var content = this.getContent();
    $tip.find('.popover-title')[this.options.html ? 'html' : 'text'](title);
    $tip.find('.popover-content').children().detach().end()[// we use append for html objects to maintain js events
    this.options.html ? typeof content == 'string' ? 'html' : 'append' : 'text'](content);
    $tip.removeClass('fade top bottom left right in'); // IE8 doesn't accept hiding via the `:empty` pseudo selector, we have to do
    // this manually by checking the contents.

    if (!$tip.find('.popover-title').html()) $tip.find('.popover-title').hide();
  };

  Popover.prototype.hasContent = function () {
    return this.getTitle() || this.getContent();
  };

  Popover.prototype.getContent = function () {
    var $e = this.$element;
    var o = this.options;
    return $e.attr('data-content') || (typeof o.content == 'function' ? o.content.call($e[0]) : o.content);
  };

  Popover.prototype.arrow = function () {
    return this.$arrow = this.$arrow || this.tip().find('.arrow');
  }; // POPOVER PLUGIN DEFINITION
  // =========================


  function Plugin(option) {
    return this.each(function () {
      var $this = $(this);
      var data = $this.data('bs.popover');
      var options = _typeof(option) == 'object' && option;
      if (!data && /destroy|hide/.test(option)) return;
      if (!data) $this.data('bs.popover', data = new Popover(this, options));
      if (typeof option == 'string') data[option]();
    });
  }

  var old = $.fn.popover;
  $.fn.popover = Plugin;
  $.fn.popover.Constructor = Popover; // POPOVER NO CONFLICT
  // ===================

  $.fn.popover.noConflict = function () {
    $.fn.popover = old;
    return this;
  };
}(jQuery);
/* ========================================================================
 * Bootstrap: scrollspy.js v3.3.7
 * http://getbootstrap.com/javascript/#scrollspy
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */

+function ($) {
  'use strict'; // SCROLLSPY CLASS DEFINITION
  // ==========================

  function ScrollSpy(element, options) {
    this.$body = $(document.body);
    this.$scrollElement = $(element).is(document.body) ? $(window) : $(element);
    this.options = $.extend({}, ScrollSpy.DEFAULTS, options);
    this.selector = (this.options.target || '') + ' .nav li > a';
    this.offsets = [];
    this.targets = [];
    this.activeTarget = null;
    this.scrollHeight = 0;
    this.$scrollElement.on('scroll.bs.scrollspy', $.proxy(this.process, this));
    this.refresh();
    this.process();
  }

  ScrollSpy.VERSION = '3.3.7';
  ScrollSpy.DEFAULTS = {
    offset: 10
  };

  ScrollSpy.prototype.getScrollHeight = function () {
    return this.$scrollElement[0].scrollHeight || Math.max(this.$body[0].scrollHeight, document.documentElement.scrollHeight);
  };

  ScrollSpy.prototype.refresh = function () {
    var that = this;
    var offsetMethod = 'offset';
    var offsetBase = 0;
    this.offsets = [];
    this.targets = [];
    this.scrollHeight = this.getScrollHeight();

    if (!$.isWindow(this.$scrollElement[0])) {
      offsetMethod = 'position';
      offsetBase = this.$scrollElement.scrollTop();
    }

    this.$body.find(this.selector).map(function () {
      var $el = $(this);
      var href = $el.data('target') || $el.attr('href');
      var $href = /^#./.test(href) && $(href);
      return $href && $href.length && $href.is(':visible') && [[$href[offsetMethod]().top + offsetBase, href]] || null;
    }).sort(function (a, b) {
      return a[0] - b[0];
    }).each(function () {
      that.offsets.push(this[0]);
      that.targets.push(this[1]);
    });
  };

  ScrollSpy.prototype.process = function () {
    var scrollTop = this.$scrollElement.scrollTop() + this.options.offset;
    var scrollHeight = this.getScrollHeight();
    var maxScroll = this.options.offset + scrollHeight - this.$scrollElement.height();
    var offsets = this.offsets;
    var targets = this.targets;
    var activeTarget = this.activeTarget;
    var i;

    if (this.scrollHeight != scrollHeight) {
      this.refresh();
    }

    if (scrollTop >= maxScroll) {
      return activeTarget != (i = targets[targets.length - 1]) && this.activate(i);
    }

    if (activeTarget && scrollTop < offsets[0]) {
      this.activeTarget = null;
      return this.clear();
    }

    for (i = offsets.length; i--;) {
      activeTarget != targets[i] && scrollTop >= offsets[i] && (offsets[i + 1] === undefined || scrollTop < offsets[i + 1]) && this.activate(targets[i]);
    }
  };

  ScrollSpy.prototype.activate = function (target) {
    this.activeTarget = target;
    this.clear();
    var selector = this.selector + '[data-target="' + target + '"],' + this.selector + '[href="' + target + '"]';
    var active = $(selector).parents('li').addClass('active');

    if (active.parent('.dropdown-menu').length) {
      active = active.closest('li.dropdown').addClass('active');
    }

    active.trigger('activate.bs.scrollspy');
  };

  ScrollSpy.prototype.clear = function () {
    $(this.selector).parentsUntil(this.options.target, '.active').removeClass('active');
  }; // SCROLLSPY PLUGIN DEFINITION
  // ===========================


  function Plugin(option) {
    return this.each(function () {
      var $this = $(this);
      var data = $this.data('bs.scrollspy');
      var options = _typeof(option) == 'object' && option;
      if (!data) $this.data('bs.scrollspy', data = new ScrollSpy(this, options));
      if (typeof option == 'string') data[option]();
    });
  }

  var old = $.fn.scrollspy;
  $.fn.scrollspy = Plugin;
  $.fn.scrollspy.Constructor = ScrollSpy; // SCROLLSPY NO CONFLICT
  // =====================

  $.fn.scrollspy.noConflict = function () {
    $.fn.scrollspy = old;
    return this;
  }; // SCROLLSPY DATA-API
  // ==================


  $(window).on('load.bs.scrollspy.data-api', function () {
    $('[data-spy="scroll"]').each(function () {
      var $spy = $(this);
      Plugin.call($spy, $spy.data());
    });
  });
}(jQuery);
/* ========================================================================
 * Bootstrap: tab.js v3.3.7
 * http://getbootstrap.com/javascript/#tabs
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */

+function ($) {
  'use strict'; // TAB CLASS DEFINITION
  // ====================

  var Tab = function Tab(element) {
    // jscs:disable requireDollarBeforejQueryAssignment
    this.element = $(element); // jscs:enable requireDollarBeforejQueryAssignment
  };

  Tab.VERSION = '3.3.7';
  Tab.TRANSITION_DURATION = 150;

  Tab.prototype.show = function () {
    var $this = this.element;
    var $ul = $this.closest('ul:not(.dropdown-menu)');
    var selector = $this.data('target');

    if (!selector) {
      selector = $this.attr('href');
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, ''); // strip for ie7
    }

    if ($this.parent('li').hasClass('active')) return;
    var $previous = $ul.find('.active:last a');
    var hideEvent = $.Event('hide.bs.tab', {
      relatedTarget: $this[0]
    });
    var showEvent = $.Event('show.bs.tab', {
      relatedTarget: $previous[0]
    });
    $previous.trigger(hideEvent);
    $this.trigger(showEvent);
    if (showEvent.isDefaultPrevented() || hideEvent.isDefaultPrevented()) return;
    var $target = $(selector);
    this.activate($this.closest('li'), $ul);
    this.activate($target, $target.parent(), function () {
      $previous.trigger({
        type: 'hidden.bs.tab',
        relatedTarget: $this[0]
      });
      $this.trigger({
        type: 'shown.bs.tab',
        relatedTarget: $previous[0]
      });
    });
  };

  Tab.prototype.activate = function (element, container, callback) {
    var $active = container.find('> .active');
    var transition = callback && $.support.transition && ($active.length && $active.hasClass('fade') || !!container.find('> .fade').length);

    function next() {
      $active.removeClass('active').find('> .dropdown-menu > .active').removeClass('active').end().find('[data-toggle="tab"]').attr('aria-expanded', false);
      element.addClass('active').find('[data-toggle="tab"]').attr('aria-expanded', true);

      if (transition) {
        element[0].offsetWidth; // reflow for transition

        element.addClass('in');
      } else {
        element.removeClass('fade');
      }

      if (element.parent('.dropdown-menu').length) {
        element.closest('li.dropdown').addClass('active').end().find('[data-toggle="tab"]').attr('aria-expanded', true);
      }

      callback && callback();
    }

    $active.length && transition ? $active.one('bsTransitionEnd', next).emulateTransitionEnd(Tab.TRANSITION_DURATION) : next();
    $active.removeClass('in');
  }; // TAB PLUGIN DEFINITION
  // =====================


  function Plugin(option) {
    return this.each(function () {
      var $this = $(this);
      var data = $this.data('bs.tab');
      if (!data) $this.data('bs.tab', data = new Tab(this));
      if (typeof option == 'string') data[option]();
    });
  }

  var old = $.fn.tab;
  $.fn.tab = Plugin;
  $.fn.tab.Constructor = Tab; // TAB NO CONFLICT
  // ===============

  $.fn.tab.noConflict = function () {
    $.fn.tab = old;
    return this;
  }; // TAB DATA-API
  // ============


  var clickHandler = function clickHandler(e) {
    e.preventDefault();
    Plugin.call($(this), 'show');
  };

  $(document).on('click.bs.tab.data-api', '[data-toggle="tab"]', clickHandler).on('click.bs.tab.data-api', '[data-toggle="pill"]', clickHandler);
}(jQuery);
/* ========================================================================
 * Bootstrap: affix.js v3.3.7
 * http://getbootstrap.com/javascript/#affix
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */

+function ($) {
  'use strict'; // AFFIX CLASS DEFINITION
  // ======================

  var Affix = function Affix(element, options) {
    this.options = $.extend({}, Affix.DEFAULTS, options);
    this.$target = $(this.options.target).on('scroll.bs.affix.data-api', $.proxy(this.checkPosition, this)).on('click.bs.affix.data-api', $.proxy(this.checkPositionWithEventLoop, this));
    this.$element = $(element);
    this.affixed = null;
    this.unpin = null;
    this.pinnedOffset = null;
    this.checkPosition();
  };

  Affix.VERSION = '3.3.7';
  Affix.RESET = 'affix affix-top affix-bottom';
  Affix.DEFAULTS = {
    offset: 0,
    target: window
  };

  Affix.prototype.getState = function (scrollHeight, height, offsetTop, offsetBottom) {
    var scrollTop = this.$target.scrollTop();
    var position = this.$element.offset();
    var targetHeight = this.$target.height();
    if (offsetTop != null && this.affixed == 'top') return scrollTop < offsetTop ? 'top' : false;

    if (this.affixed == 'bottom') {
      if (offsetTop != null) return scrollTop + this.unpin <= position.top ? false : 'bottom';
      return scrollTop + targetHeight <= scrollHeight - offsetBottom ? false : 'bottom';
    }

    var initializing = this.affixed == null;
    var colliderTop = initializing ? scrollTop : position.top;
    var colliderHeight = initializing ? targetHeight : height;
    if (offsetTop != null && scrollTop <= offsetTop) return 'top';
    if (offsetBottom != null && colliderTop + colliderHeight >= scrollHeight - offsetBottom) return 'bottom';
    return false;
  };

  Affix.prototype.getPinnedOffset = function () {
    if (this.pinnedOffset) return this.pinnedOffset;
    this.$element.removeClass(Affix.RESET).addClass('affix');
    var scrollTop = this.$target.scrollTop();
    var position = this.$element.offset();
    return this.pinnedOffset = position.top - scrollTop;
  };

  Affix.prototype.checkPositionWithEventLoop = function () {
    setTimeout($.proxy(this.checkPosition, this), 1);
  };

  Affix.prototype.checkPosition = function () {
    if (!this.$element.is(':visible')) return;
    var height = this.$element.height();
    var offset = this.options.offset;
    var offsetTop = offset.top;
    var offsetBottom = offset.bottom;
    var scrollHeight = Math.max($(document).height(), $(document.body).height());
    if (_typeof(offset) != 'object') offsetBottom = offsetTop = offset;
    if (typeof offsetTop == 'function') offsetTop = offset.top(this.$element);
    if (typeof offsetBottom == 'function') offsetBottom = offset.bottom(this.$element);
    var affix = this.getState(scrollHeight, height, offsetTop, offsetBottom);

    if (this.affixed != affix) {
      if (this.unpin != null) this.$element.css('top', '');
      var affixType = 'affix' + (affix ? '-' + affix : '');
      var e = $.Event(affixType + '.bs.affix');
      this.$element.trigger(e);
      if (e.isDefaultPrevented()) return;
      this.affixed = affix;
      this.unpin = affix == 'bottom' ? this.getPinnedOffset() : null;
      this.$element.removeClass(Affix.RESET).addClass(affixType).trigger(affixType.replace('affix', 'affixed') + '.bs.affix');
    }

    if (affix == 'bottom') {
      this.$element.offset({
        top: scrollHeight - height - offsetBottom
      });
    }
  }; // AFFIX PLUGIN DEFINITION
  // =======================


  function Plugin(option) {
    return this.each(function () {
      var $this = $(this);
      var data = $this.data('bs.affix');
      var options = _typeof(option) == 'object' && option;
      if (!data) $this.data('bs.affix', data = new Affix(this, options));
      if (typeof option == 'string') data[option]();
    });
  }

  var old = $.fn.affix;
  $.fn.affix = Plugin;
  $.fn.affix.Constructor = Affix; // AFFIX NO CONFLICT
  // =================

  $.fn.affix.noConflict = function () {
    $.fn.affix = old;
    return this;
  }; // AFFIX DATA-API
  // ==============


  $(window).on('load', function () {
    $('[data-spy="affix"]').each(function () {
      var $spy = $(this);
      var data = $spy.data();
      data.offset = data.offset || {};
      if (data.offsetBottom != null) data.offset.bottom = data.offsetBottom;
      if (data.offsetTop != null) data.offset.top = data.offsetTop;
      Plugin.call($spy, data);
    });
  });
}(jQuery);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9ib290c3RyYXAvZGlzdC9qcy9ib290c3RyYXAuanMiXSwibmFtZXMiOlsialF1ZXJ5IiwiRXJyb3IiLCIkIiwidmVyc2lvbiIsImZuIiwianF1ZXJ5Iiwic3BsaXQiLCJ0cmFuc2l0aW9uRW5kIiwiZWwiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJ0cmFuc0VuZEV2ZW50TmFtZXMiLCJXZWJraXRUcmFuc2l0aW9uIiwiTW96VHJhbnNpdGlvbiIsIk9UcmFuc2l0aW9uIiwidHJhbnNpdGlvbiIsIm5hbWUiLCJzdHlsZSIsInVuZGVmaW5lZCIsImVuZCIsImVtdWxhdGVUcmFuc2l0aW9uRW5kIiwiZHVyYXRpb24iLCJjYWxsZWQiLCIkZWwiLCJvbmUiLCJjYWxsYmFjayIsInRyaWdnZXIiLCJzdXBwb3J0Iiwic2V0VGltZW91dCIsImV2ZW50Iiwic3BlY2lhbCIsImJzVHJhbnNpdGlvbkVuZCIsImJpbmRUeXBlIiwiZGVsZWdhdGVUeXBlIiwiaGFuZGxlIiwiZSIsInRhcmdldCIsImlzIiwiaGFuZGxlT2JqIiwiaGFuZGxlciIsImFwcGx5IiwiYXJndW1lbnRzIiwiZGlzbWlzcyIsIkFsZXJ0Iiwib24iLCJjbG9zZSIsIlZFUlNJT04iLCJUUkFOU0lUSU9OX0RVUkFUSU9OIiwicHJvdG90eXBlIiwiJHRoaXMiLCJzZWxlY3RvciIsImF0dHIiLCJyZXBsYWNlIiwiJHBhcmVudCIsInByZXZlbnREZWZhdWx0IiwibGVuZ3RoIiwiY2xvc2VzdCIsIkV2ZW50IiwiaXNEZWZhdWx0UHJldmVudGVkIiwicmVtb3ZlQ2xhc3MiLCJyZW1vdmVFbGVtZW50IiwiZGV0YWNoIiwicmVtb3ZlIiwiaGFzQ2xhc3MiLCJQbHVnaW4iLCJvcHRpb24iLCJlYWNoIiwiZGF0YSIsImNhbGwiLCJvbGQiLCJhbGVydCIsIkNvbnN0cnVjdG9yIiwibm9Db25mbGljdCIsIkJ1dHRvbiIsImVsZW1lbnQiLCJvcHRpb25zIiwiJGVsZW1lbnQiLCJleHRlbmQiLCJERUZBVUxUUyIsImlzTG9hZGluZyIsImxvYWRpbmdUZXh0Iiwic2V0U3RhdGUiLCJzdGF0ZSIsImQiLCJ2YWwiLCJyZXNldFRleHQiLCJwcm94eSIsImFkZENsYXNzIiwicHJvcCIsInJlbW92ZUF0dHIiLCJ0b2dnbGUiLCJjaGFuZ2VkIiwiJGlucHV0IiwiZmluZCIsInRvZ2dsZUNsYXNzIiwiYnV0dG9uIiwiJGJ0biIsImZpcnN0IiwidGVzdCIsInR5cGUiLCJDYXJvdXNlbCIsIiRpbmRpY2F0b3JzIiwicGF1c2VkIiwic2xpZGluZyIsImludGVydmFsIiwiJGFjdGl2ZSIsIiRpdGVtcyIsImtleWJvYXJkIiwia2V5ZG93biIsInBhdXNlIiwiZG9jdW1lbnRFbGVtZW50IiwiY3ljbGUiLCJ3cmFwIiwidGFnTmFtZSIsIndoaWNoIiwicHJldiIsIm5leHQiLCJjbGVhckludGVydmFsIiwic2V0SW50ZXJ2YWwiLCJnZXRJdGVtSW5kZXgiLCJpdGVtIiwicGFyZW50IiwiY2hpbGRyZW4iLCJpbmRleCIsImdldEl0ZW1Gb3JEaXJlY3Rpb24iLCJkaXJlY3Rpb24iLCJhY3RpdmUiLCJhY3RpdmVJbmRleCIsIndpbGxXcmFwIiwiZGVsdGEiLCJpdGVtSW5kZXgiLCJlcSIsInRvIiwicG9zIiwidGhhdCIsInNsaWRlIiwiJG5leHQiLCJpc0N5Y2xpbmciLCJyZWxhdGVkVGFyZ2V0Iiwic2xpZGVFdmVudCIsIiRuZXh0SW5kaWNhdG9yIiwic2xpZEV2ZW50Iiwib2Zmc2V0V2lkdGgiLCJqb2luIiwiYWN0aW9uIiwiY2Fyb3VzZWwiLCJjbGlja0hhbmRsZXIiLCJocmVmIiwiJHRhcmdldCIsInNsaWRlSW5kZXgiLCJ3aW5kb3ciLCIkY2Fyb3VzZWwiLCJDb2xsYXBzZSIsIiR0cmlnZ2VyIiwiaWQiLCJ0cmFuc2l0aW9uaW5nIiwiZ2V0UGFyZW50IiwiYWRkQXJpYUFuZENvbGxhcHNlZENsYXNzIiwiZGltZW5zaW9uIiwiaGFzV2lkdGgiLCJzaG93IiwiYWN0aXZlc0RhdGEiLCJhY3RpdmVzIiwic3RhcnRFdmVudCIsImNvbXBsZXRlIiwic2Nyb2xsU2l6ZSIsImNhbWVsQ2FzZSIsImhpZGUiLCJvZmZzZXRIZWlnaHQiLCJpIiwiZ2V0VGFyZ2V0RnJvbVRyaWdnZXIiLCJpc09wZW4iLCJjb2xsYXBzZSIsImJhY2tkcm9wIiwiRHJvcGRvd24iLCJjbGVhck1lbnVzIiwiY29udGFpbnMiLCJpc0FjdGl2ZSIsImluc2VydEFmdGVyIiwic3RvcFByb3BhZ2F0aW9uIiwiZGVzYyIsImRyb3Bkb3duIiwiTW9kYWwiLCIkYm9keSIsImJvZHkiLCIkZGlhbG9nIiwiJGJhY2tkcm9wIiwiaXNTaG93biIsIm9yaWdpbmFsQm9keVBhZCIsInNjcm9sbGJhcldpZHRoIiwiaWdub3JlQmFja2Ryb3BDbGljayIsInJlbW90ZSIsImxvYWQiLCJCQUNLRFJPUF9UUkFOU0lUSU9OX0RVUkFUSU9OIiwiX3JlbGF0ZWRUYXJnZXQiLCJjaGVja1Njcm9sbGJhciIsInNldFNjcm9sbGJhciIsImVzY2FwZSIsInJlc2l6ZSIsImFwcGVuZFRvIiwic2Nyb2xsVG9wIiwiYWRqdXN0RGlhbG9nIiwiZW5mb3JjZUZvY3VzIiwib2ZmIiwiaGlkZU1vZGFsIiwiaGFzIiwiaGFuZGxlVXBkYXRlIiwicmVzZXRBZGp1c3RtZW50cyIsInJlc2V0U2Nyb2xsYmFyIiwicmVtb3ZlQmFja2Ryb3AiLCJhbmltYXRlIiwiZG9BbmltYXRlIiwiY3VycmVudFRhcmdldCIsImZvY3VzIiwiY2FsbGJhY2tSZW1vdmUiLCJtb2RhbElzT3ZlcmZsb3dpbmciLCJzY3JvbGxIZWlnaHQiLCJjbGllbnRIZWlnaHQiLCJjc3MiLCJwYWRkaW5nTGVmdCIsImJvZHlJc092ZXJmbG93aW5nIiwicGFkZGluZ1JpZ2h0IiwiZnVsbFdpbmRvd1dpZHRoIiwiaW5uZXJXaWR0aCIsImRvY3VtZW50RWxlbWVudFJlY3QiLCJnZXRCb3VuZGluZ0NsaWVudFJlY3QiLCJyaWdodCIsIk1hdGgiLCJhYnMiLCJsZWZ0IiwiY2xpZW50V2lkdGgiLCJtZWFzdXJlU2Nyb2xsYmFyIiwiYm9keVBhZCIsInBhcnNlSW50Iiwic2Nyb2xsRGl2IiwiY2xhc3NOYW1lIiwiYXBwZW5kIiwicmVtb3ZlQ2hpbGQiLCJtb2RhbCIsInNob3dFdmVudCIsIlRvb2x0aXAiLCJlbmFibGVkIiwidGltZW91dCIsImhvdmVyU3RhdGUiLCJpblN0YXRlIiwiaW5pdCIsImFuaW1hdGlvbiIsInBsYWNlbWVudCIsInRlbXBsYXRlIiwidGl0bGUiLCJkZWxheSIsImh0bWwiLCJjb250YWluZXIiLCJ2aWV3cG9ydCIsInBhZGRpbmciLCJnZXRPcHRpb25zIiwiJHZpZXdwb3J0IiwiaXNGdW5jdGlvbiIsImNsaWNrIiwiaG92ZXIiLCJjb25zdHJ1Y3RvciIsInRyaWdnZXJzIiwiZXZlbnRJbiIsImV2ZW50T3V0IiwiZW50ZXIiLCJsZWF2ZSIsIl9vcHRpb25zIiwiZml4VGl0bGUiLCJnZXREZWZhdWx0cyIsImdldERlbGVnYXRlT3B0aW9ucyIsImRlZmF1bHRzIiwia2V5IiwidmFsdWUiLCJvYmoiLCJzZWxmIiwidGlwIiwiY2xlYXJUaW1lb3V0IiwiaXNJblN0YXRlVHJ1ZSIsImhhc0NvbnRlbnQiLCJpbkRvbSIsIm93bmVyRG9jdW1lbnQiLCIkdGlwIiwidGlwSWQiLCJnZXRVSUQiLCJzZXRDb250ZW50IiwiYXV0b1Rva2VuIiwiYXV0b1BsYWNlIiwidG9wIiwiZGlzcGxheSIsImdldFBvc2l0aW9uIiwiYWN0dWFsV2lkdGgiLCJhY3R1YWxIZWlnaHQiLCJvcmdQbGFjZW1lbnQiLCJ2aWV3cG9ydERpbSIsImJvdHRvbSIsIndpZHRoIiwiY2FsY3VsYXRlZE9mZnNldCIsImdldENhbGN1bGF0ZWRPZmZzZXQiLCJhcHBseVBsYWNlbWVudCIsInByZXZIb3ZlclN0YXRlIiwib2Zmc2V0IiwiaGVpZ2h0IiwibWFyZ2luVG9wIiwibWFyZ2luTGVmdCIsImlzTmFOIiwic2V0T2Zmc2V0IiwidXNpbmciLCJwcm9wcyIsInJvdW5kIiwiZ2V0Vmlld3BvcnRBZGp1c3RlZERlbHRhIiwiaXNWZXJ0aWNhbCIsImFycm93RGVsdGEiLCJhcnJvd09mZnNldFBvc2l0aW9uIiwicmVwbGFjZUFycm93IiwiYXJyb3ciLCJnZXRUaXRsZSIsIiRlIiwiaXNCb2R5IiwiZWxSZWN0IiwiaXNTdmciLCJTVkdFbGVtZW50IiwiZWxPZmZzZXQiLCJzY3JvbGwiLCJvdXRlckRpbXMiLCJ2aWV3cG9ydFBhZGRpbmciLCJ2aWV3cG9ydERpbWVuc2lvbnMiLCJ0b3BFZGdlT2Zmc2V0IiwiYm90dG9tRWRnZU9mZnNldCIsImxlZnRFZGdlT2Zmc2V0IiwicmlnaHRFZGdlT2Zmc2V0IiwibyIsInByZWZpeCIsInJhbmRvbSIsImdldEVsZW1lbnRCeUlkIiwiJGFycm93IiwiZW5hYmxlIiwiZGlzYWJsZSIsInRvZ2dsZUVuYWJsZWQiLCJkZXN0cm95IiwicmVtb3ZlRGF0YSIsInRvb2x0aXAiLCJQb3BvdmVyIiwiY29udGVudCIsImdldENvbnRlbnQiLCJwb3BvdmVyIiwiU2Nyb2xsU3B5IiwiJHNjcm9sbEVsZW1lbnQiLCJvZmZzZXRzIiwidGFyZ2V0cyIsImFjdGl2ZVRhcmdldCIsInByb2Nlc3MiLCJyZWZyZXNoIiwiZ2V0U2Nyb2xsSGVpZ2h0IiwibWF4Iiwib2Zmc2V0TWV0aG9kIiwib2Zmc2V0QmFzZSIsImlzV2luZG93IiwibWFwIiwiJGhyZWYiLCJzb3J0IiwiYSIsImIiLCJwdXNoIiwibWF4U2Nyb2xsIiwiYWN0aXZhdGUiLCJjbGVhciIsInBhcmVudHMiLCJwYXJlbnRzVW50aWwiLCJzY3JvbGxzcHkiLCIkc3B5IiwiVGFiIiwiJHVsIiwiJHByZXZpb3VzIiwiaGlkZUV2ZW50IiwidGFiIiwiQWZmaXgiLCJjaGVja1Bvc2l0aW9uIiwiY2hlY2tQb3NpdGlvbldpdGhFdmVudExvb3AiLCJhZmZpeGVkIiwidW5waW4iLCJwaW5uZWRPZmZzZXQiLCJSRVNFVCIsImdldFN0YXRlIiwib2Zmc2V0VG9wIiwib2Zmc2V0Qm90dG9tIiwicG9zaXRpb24iLCJ0YXJnZXRIZWlnaHQiLCJpbml0aWFsaXppbmciLCJjb2xsaWRlclRvcCIsImNvbGxpZGVySGVpZ2h0IiwiZ2V0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VCxTQUFMLElBQXFCLElBQXpCLEVBQStCNVQsSUFBSSxDQUFDeU8sTUFBTCxDQUFZYixHQUFaLEdBQXFCNU4sSUFBSSxDQUFDNFQsU0FBMUI7QUFFL0IvVCxNQUFBQSxNQUFNLENBQUNJLElBQVAsQ0FBWTZTLElBQVosRUFBa0I5UyxJQUFsQjtBQUNELEtBVkQ7QUFXRCxHQVpEO0FBY0QsQ0F4SkEsQ0F3SkNuRSxNQXhKRCxDQUFEIiwic291cmNlc0NvbnRlbnQiOlsiLyohXHJcbiAqIEJvb3RzdHJhcCB2My4zLjcgKGh0dHA6Ly9nZXRib290c3RyYXAuY29tKVxyXG4gKiBDb3B5cmlnaHQgMjAxMS0yMDE2IFR3aXR0ZXIsIEluYy5cclxuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlXHJcbiAqL1xyXG5cclxuaWYgKHR5cGVvZiBqUXVlcnkgPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgdGhyb3cgbmV3IEVycm9yKCdCb290c3RyYXBcXCdzIEphdmFTY3JpcHQgcmVxdWlyZXMgalF1ZXJ5JylcclxufVxyXG5cclxuK2Z1bmN0aW9uICgkKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG4gIHZhciB2ZXJzaW9uID0gJC5mbi5qcXVlcnkuc3BsaXQoJyAnKVswXS5zcGxpdCgnLicpXHJcbiAgaWYgKCh2ZXJzaW9uWzBdIDwgMiAmJiB2ZXJzaW9uWzFdIDwgOSkgfHwgKHZlcnNpb25bMF0gPT0gMSAmJiB2ZXJzaW9uWzFdID09IDkgJiYgdmVyc2lvblsyXSA8IDEpIHx8ICh2ZXJzaW9uWzBdID4gMykpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcignQm9vdHN0cmFwXFwncyBKYXZhU2NyaXB0IHJlcXVpcmVzIGpRdWVyeSB2ZXJzaW9uIDEuOS4xIG9yIGhpZ2hlciwgYnV0IGxvd2VyIHRoYW4gdmVyc2lvbiA0JylcclxuICB9XHJcbn0oalF1ZXJ5KTtcclxuXHJcbi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gKiBCb290c3RyYXA6IHRyYW5zaXRpb24uanMgdjMuMy43XHJcbiAqIGh0dHA6Ly9nZXRib290c3RyYXAuY29tL2phdmFzY3JpcHQvI3RyYW5zaXRpb25zXHJcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gKiBDb3B5cmlnaHQgMjAxMS0yMDE2IFR3aXR0ZXIsIEluYy5cclxuICogTGljZW5zZWQgdW5kZXIgTUlUIChodHRwczovL2dpdGh1Yi5jb20vdHdicy9ib290c3RyYXAvYmxvYi9tYXN0ZXIvTElDRU5TRSlcclxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXHJcblxyXG5cclxuK2Z1bmN0aW9uICgkKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAvLyBDU1MgVFJBTlNJVElPTiBTVVBQT1JUIChTaG91dG91dDogaHR0cDovL3d3dy5tb2Rlcm5penIuY29tLylcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgZnVuY3Rpb24gdHJhbnNpdGlvbkVuZCgpIHtcclxuICAgIHZhciBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2Jvb3RzdHJhcCcpXHJcblxyXG4gICAgdmFyIHRyYW5zRW5kRXZlbnROYW1lcyA9IHtcclxuICAgICAgV2Via2l0VHJhbnNpdGlvbiA6ICd3ZWJraXRUcmFuc2l0aW9uRW5kJyxcclxuICAgICAgTW96VHJhbnNpdGlvbiAgICA6ICd0cmFuc2l0aW9uZW5kJyxcclxuICAgICAgT1RyYW5zaXRpb24gICAgICA6ICdvVHJhbnNpdGlvbkVuZCBvdHJhbnNpdGlvbmVuZCcsXHJcbiAgICAgIHRyYW5zaXRpb24gICAgICAgOiAndHJhbnNpdGlvbmVuZCdcclxuICAgIH1cclxuXHJcbiAgICBmb3IgKHZhciBuYW1lIGluIHRyYW5zRW5kRXZlbnROYW1lcykge1xyXG4gICAgICBpZiAoZWwuc3R5bGVbbmFtZV0gIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIHJldHVybiB7IGVuZDogdHJhbnNFbmRFdmVudE5hbWVzW25hbWVdIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBmYWxzZSAvLyBleHBsaWNpdCBmb3IgaWU4ICggIC5fLilcclxuICB9XHJcblxyXG4gIC8vIGh0dHA6Ly9ibG9nLmFsZXhtYWNjYXcuY29tL2Nzcy10cmFuc2l0aW9uc1xyXG4gICQuZm4uZW11bGF0ZVRyYW5zaXRpb25FbmQgPSBmdW5jdGlvbiAoZHVyYXRpb24pIHtcclxuICAgIHZhciBjYWxsZWQgPSBmYWxzZVxyXG4gICAgdmFyICRlbCA9IHRoaXNcclxuICAgICQodGhpcykub25lKCdic1RyYW5zaXRpb25FbmQnLCBmdW5jdGlvbiAoKSB7IGNhbGxlZCA9IHRydWUgfSlcclxuICAgIHZhciBjYWxsYmFjayA9IGZ1bmN0aW9uICgpIHsgaWYgKCFjYWxsZWQpICQoJGVsKS50cmlnZ2VyKCQuc3VwcG9ydC50cmFuc2l0aW9uLmVuZCkgfVxyXG4gICAgc2V0VGltZW91dChjYWxsYmFjaywgZHVyYXRpb24pXHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cclxuXHJcbiAgJChmdW5jdGlvbiAoKSB7XHJcbiAgICAkLnN1cHBvcnQudHJhbnNpdGlvbiA9IHRyYW5zaXRpb25FbmQoKVxyXG5cclxuICAgIGlmICghJC5zdXBwb3J0LnRyYW5zaXRpb24pIHJldHVyblxyXG5cclxuICAgICQuZXZlbnQuc3BlY2lhbC5ic1RyYW5zaXRpb25FbmQgPSB7XHJcbiAgICAgIGJpbmRUeXBlOiAkLnN1cHBvcnQudHJhbnNpdGlvbi5lbmQsXHJcbiAgICAgIGRlbGVnYXRlVHlwZTogJC5zdXBwb3J0LnRyYW5zaXRpb24uZW5kLFxyXG4gICAgICBoYW5kbGU6IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgaWYgKCQoZS50YXJnZXQpLmlzKHRoaXMpKSByZXR1cm4gZS5oYW5kbGVPYmouaGFuZGxlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9KVxyXG5cclxufShqUXVlcnkpO1xyXG5cclxuLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAqIEJvb3RzdHJhcDogYWxlcnQuanMgdjMuMy43XHJcbiAqIGh0dHA6Ly9nZXRib290c3RyYXAuY29tL2phdmFzY3JpcHQvI2FsZXJ0c1xyXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICogQ29weXJpZ2h0IDIwMTEtMjAxNiBUd2l0dGVyLCBJbmMuXHJcbiAqIExpY2Vuc2VkIHVuZGVyIE1JVCAoaHR0cHM6Ly9naXRodWIuY29tL3R3YnMvYm9vdHN0cmFwL2Jsb2IvbWFzdGVyL0xJQ0VOU0UpXHJcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xyXG5cclxuXHJcbitmdW5jdGlvbiAoJCkge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgLy8gQUxFUlQgQ0xBU1MgREVGSU5JVElPTlxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgdmFyIGRpc21pc3MgPSAnW2RhdGEtZGlzbWlzcz1cImFsZXJ0XCJdJ1xyXG4gIHZhciBBbGVydCAgID0gZnVuY3Rpb24gKGVsKSB7XHJcbiAgICAkKGVsKS5vbignY2xpY2snLCBkaXNtaXNzLCB0aGlzLmNsb3NlKVxyXG4gIH1cclxuXHJcbiAgQWxlcnQuVkVSU0lPTiA9ICczLjMuNydcclxuXHJcbiAgQWxlcnQuVFJBTlNJVElPTl9EVVJBVElPTiA9IDE1MFxyXG5cclxuICBBbGVydC5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgdmFyICR0aGlzICAgID0gJCh0aGlzKVxyXG4gICAgdmFyIHNlbGVjdG9yID0gJHRoaXMuYXR0cignZGF0YS10YXJnZXQnKVxyXG5cclxuICAgIGlmICghc2VsZWN0b3IpIHtcclxuICAgICAgc2VsZWN0b3IgPSAkdGhpcy5hdHRyKCdocmVmJylcclxuICAgICAgc2VsZWN0b3IgPSBzZWxlY3RvciAmJiBzZWxlY3Rvci5yZXBsYWNlKC8uKig/PSNbXlxcc10qJCkvLCAnJykgLy8gc3RyaXAgZm9yIGllN1xyXG4gICAgfVxyXG5cclxuICAgIHZhciAkcGFyZW50ID0gJChzZWxlY3RvciA9PT0gJyMnID8gW10gOiBzZWxlY3RvcilcclxuXHJcbiAgICBpZiAoZSkgZS5wcmV2ZW50RGVmYXVsdCgpXHJcblxyXG4gICAgaWYgKCEkcGFyZW50Lmxlbmd0aCkge1xyXG4gICAgICAkcGFyZW50ID0gJHRoaXMuY2xvc2VzdCgnLmFsZXJ0JylcclxuICAgIH1cclxuXHJcbiAgICAkcGFyZW50LnRyaWdnZXIoZSA9ICQuRXZlbnQoJ2Nsb3NlLmJzLmFsZXJ0JykpXHJcblxyXG4gICAgaWYgKGUuaXNEZWZhdWx0UHJldmVudGVkKCkpIHJldHVyblxyXG5cclxuICAgICRwYXJlbnQucmVtb3ZlQ2xhc3MoJ2luJylcclxuXHJcbiAgICBmdW5jdGlvbiByZW1vdmVFbGVtZW50KCkge1xyXG4gICAgICAvLyBkZXRhY2ggZnJvbSBwYXJlbnQsIGZpcmUgZXZlbnQgdGhlbiBjbGVhbiB1cCBkYXRhXHJcbiAgICAgICRwYXJlbnQuZGV0YWNoKCkudHJpZ2dlcignY2xvc2VkLmJzLmFsZXJ0JykucmVtb3ZlKClcclxuICAgIH1cclxuXHJcbiAgICAkLnN1cHBvcnQudHJhbnNpdGlvbiAmJiAkcGFyZW50Lmhhc0NsYXNzKCdmYWRlJykgP1xyXG4gICAgICAkcGFyZW50XHJcbiAgICAgICAgLm9uZSgnYnNUcmFuc2l0aW9uRW5kJywgcmVtb3ZlRWxlbWVudClcclxuICAgICAgICAuZW11bGF0ZVRyYW5zaXRpb25FbmQoQWxlcnQuVFJBTlNJVElPTl9EVVJBVElPTikgOlxyXG4gICAgICByZW1vdmVFbGVtZW50KClcclxuICB9XHJcblxyXG5cclxuICAvLyBBTEVSVCBQTFVHSU4gREVGSU5JVElPTlxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIGZ1bmN0aW9uIFBsdWdpbihvcHRpb24pIHtcclxuICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpXHJcbiAgICAgIHZhciBkYXRhICA9ICR0aGlzLmRhdGEoJ2JzLmFsZXJ0JylcclxuXHJcbiAgICAgIGlmICghZGF0YSkgJHRoaXMuZGF0YSgnYnMuYWxlcnQnLCAoZGF0YSA9IG5ldyBBbGVydCh0aGlzKSkpXHJcbiAgICAgIGlmICh0eXBlb2Ygb3B0aW9uID09ICdzdHJpbmcnKSBkYXRhW29wdGlvbl0uY2FsbCgkdGhpcylcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICB2YXIgb2xkID0gJC5mbi5hbGVydFxyXG5cclxuICAkLmZuLmFsZXJ0ICAgICAgICAgICAgID0gUGx1Z2luXHJcbiAgJC5mbi5hbGVydC5Db25zdHJ1Y3RvciA9IEFsZXJ0XHJcblxyXG5cclxuICAvLyBBTEVSVCBOTyBDT05GTElDVFxyXG4gIC8vID09PT09PT09PT09PT09PT09XHJcblxyXG4gICQuZm4uYWxlcnQubm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICQuZm4uYWxlcnQgPSBvbGRcclxuICAgIHJldHVybiB0aGlzXHJcbiAgfVxyXG5cclxuXHJcbiAgLy8gQUxFUlQgREFUQS1BUElcclxuICAvLyA9PT09PT09PT09PT09PVxyXG5cclxuICAkKGRvY3VtZW50KS5vbignY2xpY2suYnMuYWxlcnQuZGF0YS1hcGknLCBkaXNtaXNzLCBBbGVydC5wcm90b3R5cGUuY2xvc2UpXHJcblxyXG59KGpRdWVyeSk7XHJcblxyXG4vKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICogQm9vdHN0cmFwOiBidXR0b24uanMgdjMuMy43XHJcbiAqIGh0dHA6Ly9nZXRib290c3RyYXAuY29tL2phdmFzY3JpcHQvI2J1dHRvbnNcclxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAqIENvcHlyaWdodCAyMDExLTIwMTYgVHdpdHRlciwgSW5jLlxyXG4gKiBMaWNlbnNlZCB1bmRlciBNSVQgKGh0dHBzOi8vZ2l0aHViLmNvbS90d2JzL2Jvb3RzdHJhcC9ibG9iL21hc3Rlci9MSUNFTlNFKVxyXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cclxuXHJcblxyXG4rZnVuY3Rpb24gKCQpIHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG4gIC8vIEJVVFRPTiBQVUJMSUMgQ0xBU1MgREVGSU5JVElPTlxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICB2YXIgQnV0dG9uID0gZnVuY3Rpb24gKGVsZW1lbnQsIG9wdGlvbnMpIHtcclxuICAgIHRoaXMuJGVsZW1lbnQgID0gJChlbGVtZW50KVxyXG4gICAgdGhpcy5vcHRpb25zICAgPSAkLmV4dGVuZCh7fSwgQnV0dG9uLkRFRkFVTFRTLCBvcHRpb25zKVxyXG4gICAgdGhpcy5pc0xvYWRpbmcgPSBmYWxzZVxyXG4gIH1cclxuXHJcbiAgQnV0dG9uLlZFUlNJT04gID0gJzMuMy43J1xyXG5cclxuICBCdXR0b24uREVGQVVMVFMgPSB7XHJcbiAgICBsb2FkaW5nVGV4dDogJ2xvYWRpbmcuLi4nXHJcbiAgfVxyXG5cclxuICBCdXR0b24ucHJvdG90eXBlLnNldFN0YXRlID0gZnVuY3Rpb24gKHN0YXRlKSB7XHJcbiAgICB2YXIgZCAgICA9ICdkaXNhYmxlZCdcclxuICAgIHZhciAkZWwgID0gdGhpcy4kZWxlbWVudFxyXG4gICAgdmFyIHZhbCAgPSAkZWwuaXMoJ2lucHV0JykgPyAndmFsJyA6ICdodG1sJ1xyXG4gICAgdmFyIGRhdGEgPSAkZWwuZGF0YSgpXHJcblxyXG4gICAgc3RhdGUgKz0gJ1RleHQnXHJcblxyXG4gICAgaWYgKGRhdGEucmVzZXRUZXh0ID09IG51bGwpICRlbC5kYXRhKCdyZXNldFRleHQnLCAkZWxbdmFsXSgpKVxyXG5cclxuICAgIC8vIHB1c2ggdG8gZXZlbnQgbG9vcCB0byBhbGxvdyBmb3JtcyB0byBzdWJtaXRcclxuICAgIHNldFRpbWVvdXQoJC5wcm94eShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICRlbFt2YWxdKGRhdGFbc3RhdGVdID09IG51bGwgPyB0aGlzLm9wdGlvbnNbc3RhdGVdIDogZGF0YVtzdGF0ZV0pXHJcblxyXG4gICAgICBpZiAoc3RhdGUgPT0gJ2xvYWRpbmdUZXh0Jykge1xyXG4gICAgICAgIHRoaXMuaXNMb2FkaW5nID0gdHJ1ZVxyXG4gICAgICAgICRlbC5hZGRDbGFzcyhkKS5hdHRyKGQsIGQpLnByb3AoZCwgdHJ1ZSlcclxuICAgICAgfSBlbHNlIGlmICh0aGlzLmlzTG9hZGluZykge1xyXG4gICAgICAgIHRoaXMuaXNMb2FkaW5nID0gZmFsc2VcclxuICAgICAgICAkZWwucmVtb3ZlQ2xhc3MoZCkucmVtb3ZlQXR0cihkKS5wcm9wKGQsIGZhbHNlKVxyXG4gICAgICB9XHJcbiAgICB9LCB0aGlzKSwgMClcclxuICB9XHJcblxyXG4gIEJ1dHRvbi5wcm90b3R5cGUudG9nZ2xlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIGNoYW5nZWQgPSB0cnVlXHJcbiAgICB2YXIgJHBhcmVudCA9IHRoaXMuJGVsZW1lbnQuY2xvc2VzdCgnW2RhdGEtdG9nZ2xlPVwiYnV0dG9uc1wiXScpXHJcblxyXG4gICAgaWYgKCRwYXJlbnQubGVuZ3RoKSB7XHJcbiAgICAgIHZhciAkaW5wdXQgPSB0aGlzLiRlbGVtZW50LmZpbmQoJ2lucHV0JylcclxuICAgICAgaWYgKCRpbnB1dC5wcm9wKCd0eXBlJykgPT0gJ3JhZGlvJykge1xyXG4gICAgICAgIGlmICgkaW5wdXQucHJvcCgnY2hlY2tlZCcpKSBjaGFuZ2VkID0gZmFsc2VcclxuICAgICAgICAkcGFyZW50LmZpbmQoJy5hY3RpdmUnKS5yZW1vdmVDbGFzcygnYWN0aXZlJylcclxuICAgICAgICB0aGlzLiRlbGVtZW50LmFkZENsYXNzKCdhY3RpdmUnKVxyXG4gICAgICB9IGVsc2UgaWYgKCRpbnB1dC5wcm9wKCd0eXBlJykgPT0gJ2NoZWNrYm94Jykge1xyXG4gICAgICAgIGlmICgoJGlucHV0LnByb3AoJ2NoZWNrZWQnKSkgIT09IHRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoJ2FjdGl2ZScpKSBjaGFuZ2VkID0gZmFsc2VcclxuICAgICAgICB0aGlzLiRlbGVtZW50LnRvZ2dsZUNsYXNzKCdhY3RpdmUnKVxyXG4gICAgICB9XHJcbiAgICAgICRpbnB1dC5wcm9wKCdjaGVja2VkJywgdGhpcy4kZWxlbWVudC5oYXNDbGFzcygnYWN0aXZlJykpXHJcbiAgICAgIGlmIChjaGFuZ2VkKSAkaW5wdXQudHJpZ2dlcignY2hhbmdlJylcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuJGVsZW1lbnQuYXR0cignYXJpYS1wcmVzc2VkJywgIXRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoJ2FjdGl2ZScpKVxyXG4gICAgICB0aGlzLiRlbGVtZW50LnRvZ2dsZUNsYXNzKCdhY3RpdmUnKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcblxyXG4gIC8vIEJVVFRPTiBQTFVHSU4gREVGSU5JVElPTlxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBmdW5jdGlvbiBQbHVnaW4ob3B0aW9uKSB7XHJcbiAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgdmFyICR0aGlzICAgPSAkKHRoaXMpXHJcbiAgICAgIHZhciBkYXRhICAgID0gJHRoaXMuZGF0YSgnYnMuYnV0dG9uJylcclxuICAgICAgdmFyIG9wdGlvbnMgPSB0eXBlb2Ygb3B0aW9uID09ICdvYmplY3QnICYmIG9wdGlvblxyXG5cclxuICAgICAgaWYgKCFkYXRhKSAkdGhpcy5kYXRhKCdicy5idXR0b24nLCAoZGF0YSA9IG5ldyBCdXR0b24odGhpcywgb3B0aW9ucykpKVxyXG5cclxuICAgICAgaWYgKG9wdGlvbiA9PSAndG9nZ2xlJykgZGF0YS50b2dnbGUoKVxyXG4gICAgICBlbHNlIGlmIChvcHRpb24pIGRhdGEuc2V0U3RhdGUob3B0aW9uKVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIHZhciBvbGQgPSAkLmZuLmJ1dHRvblxyXG5cclxuICAkLmZuLmJ1dHRvbiAgICAgICAgICAgICA9IFBsdWdpblxyXG4gICQuZm4uYnV0dG9uLkNvbnN0cnVjdG9yID0gQnV0dG9uXHJcblxyXG5cclxuICAvLyBCVVRUT04gTk8gQ09ORkxJQ1RcclxuICAvLyA9PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgJC5mbi5idXR0b24ubm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICQuZm4uYnV0dG9uID0gb2xkXHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cclxuXHJcblxyXG4gIC8vIEJVVFRPTiBEQVRBLUFQSVxyXG4gIC8vID09PT09PT09PT09PT09PVxyXG5cclxuICAkKGRvY3VtZW50KVxyXG4gICAgLm9uKCdjbGljay5icy5idXR0b24uZGF0YS1hcGknLCAnW2RhdGEtdG9nZ2xlXj1cImJ1dHRvblwiXScsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgIHZhciAkYnRuID0gJChlLnRhcmdldCkuY2xvc2VzdCgnLmJ0bicpXHJcbiAgICAgIFBsdWdpbi5jYWxsKCRidG4sICd0b2dnbGUnKVxyXG4gICAgICBpZiAoISgkKGUudGFyZ2V0KS5pcygnaW5wdXRbdHlwZT1cInJhZGlvXCJdLCBpbnB1dFt0eXBlPVwiY2hlY2tib3hcIl0nKSkpIHtcclxuICAgICAgICAvLyBQcmV2ZW50IGRvdWJsZSBjbGljayBvbiByYWRpb3MsIGFuZCB0aGUgZG91YmxlIHNlbGVjdGlvbnMgKHNvIGNhbmNlbGxhdGlvbikgb24gY2hlY2tib3hlc1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgIC8vIFRoZSB0YXJnZXQgY29tcG9uZW50IHN0aWxsIHJlY2VpdmUgdGhlIGZvY3VzXHJcbiAgICAgICAgaWYgKCRidG4uaXMoJ2lucHV0LGJ1dHRvbicpKSAkYnRuLnRyaWdnZXIoJ2ZvY3VzJylcclxuICAgICAgICBlbHNlICRidG4uZmluZCgnaW5wdXQ6dmlzaWJsZSxidXR0b246dmlzaWJsZScpLmZpcnN0KCkudHJpZ2dlcignZm9jdXMnKVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gICAgLm9uKCdmb2N1cy5icy5idXR0b24uZGF0YS1hcGkgYmx1ci5icy5idXR0b24uZGF0YS1hcGknLCAnW2RhdGEtdG9nZ2xlXj1cImJ1dHRvblwiXScsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICQoZS50YXJnZXQpLmNsb3Nlc3QoJy5idG4nKS50b2dnbGVDbGFzcygnZm9jdXMnLCAvXmZvY3VzKGluKT8kLy50ZXN0KGUudHlwZSkpXHJcbiAgICB9KVxyXG5cclxufShqUXVlcnkpO1xyXG5cclxuLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAqIEJvb3RzdHJhcDogY2Fyb3VzZWwuanMgdjMuMy43XHJcbiAqIGh0dHA6Ly9nZXRib290c3RyYXAuY29tL2phdmFzY3JpcHQvI2Nhcm91c2VsXHJcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gKiBDb3B5cmlnaHQgMjAxMS0yMDE2IFR3aXR0ZXIsIEluYy5cclxuICogTGljZW5zZWQgdW5kZXIgTUlUIChodHRwczovL2dpdGh1Yi5jb20vdHdicy9ib290c3RyYXAvYmxvYi9tYXN0ZXIvTElDRU5TRSlcclxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXHJcblxyXG5cclxuK2Z1bmN0aW9uICgkKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAvLyBDQVJPVVNFTCBDTEFTUyBERUZJTklUSU9OXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICB2YXIgQ2Fyb3VzZWwgPSBmdW5jdGlvbiAoZWxlbWVudCwgb3B0aW9ucykge1xyXG4gICAgdGhpcy4kZWxlbWVudCAgICA9ICQoZWxlbWVudClcclxuICAgIHRoaXMuJGluZGljYXRvcnMgPSB0aGlzLiRlbGVtZW50LmZpbmQoJy5jYXJvdXNlbC1pbmRpY2F0b3JzJylcclxuICAgIHRoaXMub3B0aW9ucyAgICAgPSBvcHRpb25zXHJcbiAgICB0aGlzLnBhdXNlZCAgICAgID0gbnVsbFxyXG4gICAgdGhpcy5zbGlkaW5nICAgICA9IG51bGxcclxuICAgIHRoaXMuaW50ZXJ2YWwgICAgPSBudWxsXHJcbiAgICB0aGlzLiRhY3RpdmUgICAgID0gbnVsbFxyXG4gICAgdGhpcy4kaXRlbXMgICAgICA9IG51bGxcclxuXHJcbiAgICB0aGlzLm9wdGlvbnMua2V5Ym9hcmQgJiYgdGhpcy4kZWxlbWVudC5vbigna2V5ZG93bi5icy5jYXJvdXNlbCcsICQucHJveHkodGhpcy5rZXlkb3duLCB0aGlzKSlcclxuXHJcbiAgICB0aGlzLm9wdGlvbnMucGF1c2UgPT0gJ2hvdmVyJyAmJiAhKCdvbnRvdWNoc3RhcnQnIGluIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCkgJiYgdGhpcy4kZWxlbWVudFxyXG4gICAgICAub24oJ21vdXNlZW50ZXIuYnMuY2Fyb3VzZWwnLCAkLnByb3h5KHRoaXMucGF1c2UsIHRoaXMpKVxyXG4gICAgICAub24oJ21vdXNlbGVhdmUuYnMuY2Fyb3VzZWwnLCAkLnByb3h5KHRoaXMuY3ljbGUsIHRoaXMpKVxyXG4gIH1cclxuXHJcbiAgQ2Fyb3VzZWwuVkVSU0lPTiAgPSAnMy4zLjcnXHJcblxyXG4gIENhcm91c2VsLlRSQU5TSVRJT05fRFVSQVRJT04gPSA2MDBcclxuXHJcbiAgQ2Fyb3VzZWwuREVGQVVMVFMgPSB7XHJcbiAgICBpbnRlcnZhbDogNTAwMCxcclxuICAgIHBhdXNlOiAnaG92ZXInLFxyXG4gICAgd3JhcDogdHJ1ZSxcclxuICAgIGtleWJvYXJkOiB0cnVlXHJcbiAgfVxyXG5cclxuICBDYXJvdXNlbC5wcm90b3R5cGUua2V5ZG93biA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICBpZiAoL2lucHV0fHRleHRhcmVhL2kudGVzdChlLnRhcmdldC50YWdOYW1lKSkgcmV0dXJuXHJcbiAgICBzd2l0Y2ggKGUud2hpY2gpIHtcclxuICAgICAgY2FzZSAzNzogdGhpcy5wcmV2KCk7IGJyZWFrXHJcbiAgICAgIGNhc2UgMzk6IHRoaXMubmV4dCgpOyBicmVha1xyXG4gICAgICBkZWZhdWx0OiByZXR1cm5cclxuICAgIH1cclxuXHJcbiAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICB9XHJcblxyXG4gIENhcm91c2VsLnByb3RvdHlwZS5jeWNsZSA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICBlIHx8ICh0aGlzLnBhdXNlZCA9IGZhbHNlKVxyXG5cclxuICAgIHRoaXMuaW50ZXJ2YWwgJiYgY2xlYXJJbnRlcnZhbCh0aGlzLmludGVydmFsKVxyXG5cclxuICAgIHRoaXMub3B0aW9ucy5pbnRlcnZhbFxyXG4gICAgICAmJiAhdGhpcy5wYXVzZWRcclxuICAgICAgJiYgKHRoaXMuaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgkLnByb3h5KHRoaXMubmV4dCwgdGhpcyksIHRoaXMub3B0aW9ucy5pbnRlcnZhbCkpXHJcblxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcblxyXG4gIENhcm91c2VsLnByb3RvdHlwZS5nZXRJdGVtSW5kZXggPSBmdW5jdGlvbiAoaXRlbSkge1xyXG4gICAgdGhpcy4kaXRlbXMgPSBpdGVtLnBhcmVudCgpLmNoaWxkcmVuKCcuaXRlbScpXHJcbiAgICByZXR1cm4gdGhpcy4kaXRlbXMuaW5kZXgoaXRlbSB8fCB0aGlzLiRhY3RpdmUpXHJcbiAgfVxyXG5cclxuICBDYXJvdXNlbC5wcm90b3R5cGUuZ2V0SXRlbUZvckRpcmVjdGlvbiA9IGZ1bmN0aW9uIChkaXJlY3Rpb24sIGFjdGl2ZSkge1xyXG4gICAgdmFyIGFjdGl2ZUluZGV4ID0gdGhpcy5nZXRJdGVtSW5kZXgoYWN0aXZlKVxyXG4gICAgdmFyIHdpbGxXcmFwID0gKGRpcmVjdGlvbiA9PSAncHJldicgJiYgYWN0aXZlSW5kZXggPT09IDApXHJcbiAgICAgICAgICAgICAgICB8fCAoZGlyZWN0aW9uID09ICduZXh0JyAmJiBhY3RpdmVJbmRleCA9PSAodGhpcy4kaXRlbXMubGVuZ3RoIC0gMSkpXHJcbiAgICBpZiAod2lsbFdyYXAgJiYgIXRoaXMub3B0aW9ucy53cmFwKSByZXR1cm4gYWN0aXZlXHJcbiAgICB2YXIgZGVsdGEgPSBkaXJlY3Rpb24gPT0gJ3ByZXYnID8gLTEgOiAxXHJcbiAgICB2YXIgaXRlbUluZGV4ID0gKGFjdGl2ZUluZGV4ICsgZGVsdGEpICUgdGhpcy4kaXRlbXMubGVuZ3RoXHJcbiAgICByZXR1cm4gdGhpcy4kaXRlbXMuZXEoaXRlbUluZGV4KVxyXG4gIH1cclxuXHJcbiAgQ2Fyb3VzZWwucHJvdG90eXBlLnRvID0gZnVuY3Rpb24gKHBvcykge1xyXG4gICAgdmFyIHRoYXQgICAgICAgID0gdGhpc1xyXG4gICAgdmFyIGFjdGl2ZUluZGV4ID0gdGhpcy5nZXRJdGVtSW5kZXgodGhpcy4kYWN0aXZlID0gdGhpcy4kZWxlbWVudC5maW5kKCcuaXRlbS5hY3RpdmUnKSlcclxuXHJcbiAgICBpZiAocG9zID4gKHRoaXMuJGl0ZW1zLmxlbmd0aCAtIDEpIHx8IHBvcyA8IDApIHJldHVyblxyXG5cclxuICAgIGlmICh0aGlzLnNsaWRpbmcpICAgICAgIHJldHVybiB0aGlzLiRlbGVtZW50Lm9uZSgnc2xpZC5icy5jYXJvdXNlbCcsIGZ1bmN0aW9uICgpIHsgdGhhdC50byhwb3MpIH0pIC8vIHllcywgXCJzbGlkXCJcclxuICAgIGlmIChhY3RpdmVJbmRleCA9PSBwb3MpIHJldHVybiB0aGlzLnBhdXNlKCkuY3ljbGUoKVxyXG5cclxuICAgIHJldHVybiB0aGlzLnNsaWRlKHBvcyA+IGFjdGl2ZUluZGV4ID8gJ25leHQnIDogJ3ByZXYnLCB0aGlzLiRpdGVtcy5lcShwb3MpKVxyXG4gIH1cclxuXHJcbiAgQ2Fyb3VzZWwucHJvdG90eXBlLnBhdXNlID0gZnVuY3Rpb24gKGUpIHtcclxuICAgIGUgfHwgKHRoaXMucGF1c2VkID0gdHJ1ZSlcclxuXHJcbiAgICBpZiAodGhpcy4kZWxlbWVudC5maW5kKCcubmV4dCwgLnByZXYnKS5sZW5ndGggJiYgJC5zdXBwb3J0LnRyYW5zaXRpb24pIHtcclxuICAgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCQuc3VwcG9ydC50cmFuc2l0aW9uLmVuZClcclxuICAgICAgdGhpcy5jeWNsZSh0cnVlKVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuaW50ZXJ2YWwgPSBjbGVhckludGVydmFsKHRoaXMuaW50ZXJ2YWwpXHJcblxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcblxyXG4gIENhcm91c2VsLnByb3RvdHlwZS5uZXh0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgaWYgKHRoaXMuc2xpZGluZykgcmV0dXJuXHJcbiAgICByZXR1cm4gdGhpcy5zbGlkZSgnbmV4dCcpXHJcbiAgfVxyXG5cclxuICBDYXJvdXNlbC5wcm90b3R5cGUucHJldiA9IGZ1bmN0aW9uICgpIHtcclxuICAgIGlmICh0aGlzLnNsaWRpbmcpIHJldHVyblxyXG4gICAgcmV0dXJuIHRoaXMuc2xpZGUoJ3ByZXYnKVxyXG4gIH1cclxuXHJcbiAgQ2Fyb3VzZWwucHJvdG90eXBlLnNsaWRlID0gZnVuY3Rpb24gKHR5cGUsIG5leHQpIHtcclxuICAgIHZhciAkYWN0aXZlICAgPSB0aGlzLiRlbGVtZW50LmZpbmQoJy5pdGVtLmFjdGl2ZScpXHJcbiAgICB2YXIgJG5leHQgICAgID0gbmV4dCB8fCB0aGlzLmdldEl0ZW1Gb3JEaXJlY3Rpb24odHlwZSwgJGFjdGl2ZSlcclxuICAgIHZhciBpc0N5Y2xpbmcgPSB0aGlzLmludGVydmFsXHJcbiAgICB2YXIgZGlyZWN0aW9uID0gdHlwZSA9PSAnbmV4dCcgPyAnbGVmdCcgOiAncmlnaHQnXHJcbiAgICB2YXIgdGhhdCAgICAgID0gdGhpc1xyXG5cclxuICAgIGlmICgkbmV4dC5oYXNDbGFzcygnYWN0aXZlJykpIHJldHVybiAodGhpcy5zbGlkaW5nID0gZmFsc2UpXHJcblxyXG4gICAgdmFyIHJlbGF0ZWRUYXJnZXQgPSAkbmV4dFswXVxyXG4gICAgdmFyIHNsaWRlRXZlbnQgPSAkLkV2ZW50KCdzbGlkZS5icy5jYXJvdXNlbCcsIHtcclxuICAgICAgcmVsYXRlZFRhcmdldDogcmVsYXRlZFRhcmdldCxcclxuICAgICAgZGlyZWN0aW9uOiBkaXJlY3Rpb25cclxuICAgIH0pXHJcbiAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoc2xpZGVFdmVudClcclxuICAgIGlmIChzbGlkZUV2ZW50LmlzRGVmYXVsdFByZXZlbnRlZCgpKSByZXR1cm5cclxuXHJcbiAgICB0aGlzLnNsaWRpbmcgPSB0cnVlXHJcblxyXG4gICAgaXNDeWNsaW5nICYmIHRoaXMucGF1c2UoKVxyXG5cclxuICAgIGlmICh0aGlzLiRpbmRpY2F0b3JzLmxlbmd0aCkge1xyXG4gICAgICB0aGlzLiRpbmRpY2F0b3JzLmZpbmQoJy5hY3RpdmUnKS5yZW1vdmVDbGFzcygnYWN0aXZlJylcclxuICAgICAgdmFyICRuZXh0SW5kaWNhdG9yID0gJCh0aGlzLiRpbmRpY2F0b3JzLmNoaWxkcmVuKClbdGhpcy5nZXRJdGVtSW5kZXgoJG5leHQpXSlcclxuICAgICAgJG5leHRJbmRpY2F0b3IgJiYgJG5leHRJbmRpY2F0b3IuYWRkQ2xhc3MoJ2FjdGl2ZScpXHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHNsaWRFdmVudCA9ICQuRXZlbnQoJ3NsaWQuYnMuY2Fyb3VzZWwnLCB7IHJlbGF0ZWRUYXJnZXQ6IHJlbGF0ZWRUYXJnZXQsIGRpcmVjdGlvbjogZGlyZWN0aW9uIH0pIC8vIHllcywgXCJzbGlkXCJcclxuICAgIGlmICgkLnN1cHBvcnQudHJhbnNpdGlvbiAmJiB0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKCdzbGlkZScpKSB7XHJcbiAgICAgICRuZXh0LmFkZENsYXNzKHR5cGUpXHJcbiAgICAgICRuZXh0WzBdLm9mZnNldFdpZHRoIC8vIGZvcmNlIHJlZmxvd1xyXG4gICAgICAkYWN0aXZlLmFkZENsYXNzKGRpcmVjdGlvbilcclxuICAgICAgJG5leHQuYWRkQ2xhc3MoZGlyZWN0aW9uKVxyXG4gICAgICAkYWN0aXZlXHJcbiAgICAgICAgLm9uZSgnYnNUcmFuc2l0aW9uRW5kJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgJG5leHQucmVtb3ZlQ2xhc3MoW3R5cGUsIGRpcmVjdGlvbl0uam9pbignICcpKS5hZGRDbGFzcygnYWN0aXZlJylcclxuICAgICAgICAgICRhY3RpdmUucmVtb3ZlQ2xhc3MoWydhY3RpdmUnLCBkaXJlY3Rpb25dLmpvaW4oJyAnKSlcclxuICAgICAgICAgIHRoYXQuc2xpZGluZyA9IGZhbHNlXHJcbiAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhhdC4kZWxlbWVudC50cmlnZ2VyKHNsaWRFdmVudClcclxuICAgICAgICAgIH0sIDApXHJcbiAgICAgICAgfSlcclxuICAgICAgICAuZW11bGF0ZVRyYW5zaXRpb25FbmQoQ2Fyb3VzZWwuVFJBTlNJVElPTl9EVVJBVElPTilcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICRhY3RpdmUucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpXHJcbiAgICAgICRuZXh0LmFkZENsYXNzKCdhY3RpdmUnKVxyXG4gICAgICB0aGlzLnNsaWRpbmcgPSBmYWxzZVxyXG4gICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoc2xpZEV2ZW50KVxyXG4gICAgfVxyXG5cclxuICAgIGlzQ3ljbGluZyAmJiB0aGlzLmN5Y2xlKClcclxuXHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cclxuXHJcblxyXG4gIC8vIENBUk9VU0VMIFBMVUdJTiBERUZJTklUSU9OXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgZnVuY3Rpb24gUGx1Z2luKG9wdGlvbikge1xyXG4gICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHZhciAkdGhpcyAgID0gJCh0aGlzKVxyXG4gICAgICB2YXIgZGF0YSAgICA9ICR0aGlzLmRhdGEoJ2JzLmNhcm91c2VsJylcclxuICAgICAgdmFyIG9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgQ2Fyb3VzZWwuREVGQVVMVFMsICR0aGlzLmRhdGEoKSwgdHlwZW9mIG9wdGlvbiA9PSAnb2JqZWN0JyAmJiBvcHRpb24pXHJcbiAgICAgIHZhciBhY3Rpb24gID0gdHlwZW9mIG9wdGlvbiA9PSAnc3RyaW5nJyA/IG9wdGlvbiA6IG9wdGlvbnMuc2xpZGVcclxuXHJcbiAgICAgIGlmICghZGF0YSkgJHRoaXMuZGF0YSgnYnMuY2Fyb3VzZWwnLCAoZGF0YSA9IG5ldyBDYXJvdXNlbCh0aGlzLCBvcHRpb25zKSkpXHJcbiAgICAgIGlmICh0eXBlb2Ygb3B0aW9uID09ICdudW1iZXInKSBkYXRhLnRvKG9wdGlvbilcclxuICAgICAgZWxzZSBpZiAoYWN0aW9uKSBkYXRhW2FjdGlvbl0oKVxyXG4gICAgICBlbHNlIGlmIChvcHRpb25zLmludGVydmFsKSBkYXRhLnBhdXNlKCkuY3ljbGUoKVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIHZhciBvbGQgPSAkLmZuLmNhcm91c2VsXHJcblxyXG4gICQuZm4uY2Fyb3VzZWwgICAgICAgICAgICAgPSBQbHVnaW5cclxuICAkLmZuLmNhcm91c2VsLkNvbnN0cnVjdG9yID0gQ2Fyb3VzZWxcclxuXHJcblxyXG4gIC8vIENBUk9VU0VMIE5PIENPTkZMSUNUXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgJC5mbi5jYXJvdXNlbC5ub0NvbmZsaWN0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgJC5mbi5jYXJvdXNlbCA9IG9sZFxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcblxyXG5cclxuICAvLyBDQVJPVVNFTCBEQVRBLUFQSVxyXG4gIC8vID09PT09PT09PT09PT09PT09XHJcblxyXG4gIHZhciBjbGlja0hhbmRsZXIgPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgdmFyIGhyZWZcclxuICAgIHZhciAkdGhpcyAgID0gJCh0aGlzKVxyXG4gICAgdmFyICR0YXJnZXQgPSAkKCR0aGlzLmF0dHIoJ2RhdGEtdGFyZ2V0JykgfHwgKGhyZWYgPSAkdGhpcy5hdHRyKCdocmVmJykpICYmIGhyZWYucmVwbGFjZSgvLiooPz0jW15cXHNdKyQpLywgJycpKSAvLyBzdHJpcCBmb3IgaWU3XHJcbiAgICBpZiAoISR0YXJnZXQuaGFzQ2xhc3MoJ2Nhcm91c2VsJykpIHJldHVyblxyXG4gICAgdmFyIG9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgJHRhcmdldC5kYXRhKCksICR0aGlzLmRhdGEoKSlcclxuICAgIHZhciBzbGlkZUluZGV4ID0gJHRoaXMuYXR0cignZGF0YS1zbGlkZS10bycpXHJcbiAgICBpZiAoc2xpZGVJbmRleCkgb3B0aW9ucy5pbnRlcnZhbCA9IGZhbHNlXHJcblxyXG4gICAgUGx1Z2luLmNhbGwoJHRhcmdldCwgb3B0aW9ucylcclxuXHJcbiAgICBpZiAoc2xpZGVJbmRleCkge1xyXG4gICAgICAkdGFyZ2V0LmRhdGEoJ2JzLmNhcm91c2VsJykudG8oc2xpZGVJbmRleClcclxuICAgIH1cclxuXHJcbiAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICB9XHJcblxyXG4gICQoZG9jdW1lbnQpXHJcbiAgICAub24oJ2NsaWNrLmJzLmNhcm91c2VsLmRhdGEtYXBpJywgJ1tkYXRhLXNsaWRlXScsIGNsaWNrSGFuZGxlcilcclxuICAgIC5vbignY2xpY2suYnMuY2Fyb3VzZWwuZGF0YS1hcGknLCAnW2RhdGEtc2xpZGUtdG9dJywgY2xpY2tIYW5kbGVyKVxyXG5cclxuICAkKHdpbmRvdykub24oJ2xvYWQnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAkKCdbZGF0YS1yaWRlPVwiY2Fyb3VzZWxcIl0nKS5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgdmFyICRjYXJvdXNlbCA9ICQodGhpcylcclxuICAgICAgUGx1Z2luLmNhbGwoJGNhcm91c2VsLCAkY2Fyb3VzZWwuZGF0YSgpKVxyXG4gICAgfSlcclxuICB9KVxyXG5cclxufShqUXVlcnkpO1xyXG5cclxuLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAqIEJvb3RzdHJhcDogY29sbGFwc2UuanMgdjMuMy43XHJcbiAqIGh0dHA6Ly9nZXRib290c3RyYXAuY29tL2phdmFzY3JpcHQvI2NvbGxhcHNlXHJcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gKiBDb3B5cmlnaHQgMjAxMS0yMDE2IFR3aXR0ZXIsIEluYy5cclxuICogTGljZW5zZWQgdW5kZXIgTUlUIChodHRwczovL2dpdGh1Yi5jb20vdHdicy9ib290c3RyYXAvYmxvYi9tYXN0ZXIvTElDRU5TRSlcclxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXHJcblxyXG4vKiBqc2hpbnQgbGF0ZWRlZjogZmFsc2UgKi9cclxuXHJcbitmdW5jdGlvbiAoJCkge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgLy8gQ09MTEFQU0UgUFVCTElDIENMQVNTIERFRklOSVRJT05cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICB2YXIgQ29sbGFwc2UgPSBmdW5jdGlvbiAoZWxlbWVudCwgb3B0aW9ucykge1xyXG4gICAgdGhpcy4kZWxlbWVudCAgICAgID0gJChlbGVtZW50KVxyXG4gICAgdGhpcy5vcHRpb25zICAgICAgID0gJC5leHRlbmQoe30sIENvbGxhcHNlLkRFRkFVTFRTLCBvcHRpb25zKVxyXG4gICAgdGhpcy4kdHJpZ2dlciAgICAgID0gJCgnW2RhdGEtdG9nZ2xlPVwiY29sbGFwc2VcIl1baHJlZj1cIiMnICsgZWxlbWVudC5pZCArICdcIl0sJyArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICdbZGF0YS10b2dnbGU9XCJjb2xsYXBzZVwiXVtkYXRhLXRhcmdldD1cIiMnICsgZWxlbWVudC5pZCArICdcIl0nKVxyXG4gICAgdGhpcy50cmFuc2l0aW9uaW5nID0gbnVsbFxyXG5cclxuICAgIGlmICh0aGlzLm9wdGlvbnMucGFyZW50KSB7XHJcbiAgICAgIHRoaXMuJHBhcmVudCA9IHRoaXMuZ2V0UGFyZW50KClcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuYWRkQXJpYUFuZENvbGxhcHNlZENsYXNzKHRoaXMuJGVsZW1lbnQsIHRoaXMuJHRyaWdnZXIpXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMub3B0aW9ucy50b2dnbGUpIHRoaXMudG9nZ2xlKClcclxuICB9XHJcblxyXG4gIENvbGxhcHNlLlZFUlNJT04gID0gJzMuMy43J1xyXG5cclxuICBDb2xsYXBzZS5UUkFOU0lUSU9OX0RVUkFUSU9OID0gMzUwXHJcblxyXG4gIENvbGxhcHNlLkRFRkFVTFRTID0ge1xyXG4gICAgdG9nZ2xlOiB0cnVlXHJcbiAgfVxyXG5cclxuICBDb2xsYXBzZS5wcm90b3R5cGUuZGltZW5zaW9uID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIGhhc1dpZHRoID0gdGhpcy4kZWxlbWVudC5oYXNDbGFzcygnd2lkdGgnKVxyXG4gICAgcmV0dXJuIGhhc1dpZHRoID8gJ3dpZHRoJyA6ICdoZWlnaHQnXHJcbiAgfVxyXG5cclxuICBDb2xsYXBzZS5wcm90b3R5cGUuc2hvdyA9IGZ1bmN0aW9uICgpIHtcclxuICAgIGlmICh0aGlzLnRyYW5zaXRpb25pbmcgfHwgdGhpcy4kZWxlbWVudC5oYXNDbGFzcygnaW4nKSkgcmV0dXJuXHJcblxyXG4gICAgdmFyIGFjdGl2ZXNEYXRhXHJcbiAgICB2YXIgYWN0aXZlcyA9IHRoaXMuJHBhcmVudCAmJiB0aGlzLiRwYXJlbnQuY2hpbGRyZW4oJy5wYW5lbCcpLmNoaWxkcmVuKCcuaW4sIC5jb2xsYXBzaW5nJylcclxuXHJcbiAgICBpZiAoYWN0aXZlcyAmJiBhY3RpdmVzLmxlbmd0aCkge1xyXG4gICAgICBhY3RpdmVzRGF0YSA9IGFjdGl2ZXMuZGF0YSgnYnMuY29sbGFwc2UnKVxyXG4gICAgICBpZiAoYWN0aXZlc0RhdGEgJiYgYWN0aXZlc0RhdGEudHJhbnNpdGlvbmluZykgcmV0dXJuXHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHN0YXJ0RXZlbnQgPSAkLkV2ZW50KCdzaG93LmJzLmNvbGxhcHNlJylcclxuICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcihzdGFydEV2ZW50KVxyXG4gICAgaWYgKHN0YXJ0RXZlbnQuaXNEZWZhdWx0UHJldmVudGVkKCkpIHJldHVyblxyXG5cclxuICAgIGlmIChhY3RpdmVzICYmIGFjdGl2ZXMubGVuZ3RoKSB7XHJcbiAgICAgIFBsdWdpbi5jYWxsKGFjdGl2ZXMsICdoaWRlJylcclxuICAgICAgYWN0aXZlc0RhdGEgfHwgYWN0aXZlcy5kYXRhKCdicy5jb2xsYXBzZScsIG51bGwpXHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGRpbWVuc2lvbiA9IHRoaXMuZGltZW5zaW9uKClcclxuXHJcbiAgICB0aGlzLiRlbGVtZW50XHJcbiAgICAgIC5yZW1vdmVDbGFzcygnY29sbGFwc2UnKVxyXG4gICAgICAuYWRkQ2xhc3MoJ2NvbGxhcHNpbmcnKVtkaW1lbnNpb25dKDApXHJcbiAgICAgIC5hdHRyKCdhcmlhLWV4cGFuZGVkJywgdHJ1ZSlcclxuXHJcbiAgICB0aGlzLiR0cmlnZ2VyXHJcbiAgICAgIC5yZW1vdmVDbGFzcygnY29sbGFwc2VkJylcclxuICAgICAgLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCB0cnVlKVxyXG5cclxuICAgIHRoaXMudHJhbnNpdGlvbmluZyA9IDFcclxuXHJcbiAgICB2YXIgY29tcGxldGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHRoaXMuJGVsZW1lbnRcclxuICAgICAgICAucmVtb3ZlQ2xhc3MoJ2NvbGxhcHNpbmcnKVxyXG4gICAgICAgIC5hZGRDbGFzcygnY29sbGFwc2UgaW4nKVtkaW1lbnNpb25dKCcnKVxyXG4gICAgICB0aGlzLnRyYW5zaXRpb25pbmcgPSAwXHJcbiAgICAgIHRoaXMuJGVsZW1lbnRcclxuICAgICAgICAudHJpZ2dlcignc2hvd24uYnMuY29sbGFwc2UnKVxyXG4gICAgfVxyXG5cclxuICAgIGlmICghJC5zdXBwb3J0LnRyYW5zaXRpb24pIHJldHVybiBjb21wbGV0ZS5jYWxsKHRoaXMpXHJcblxyXG4gICAgdmFyIHNjcm9sbFNpemUgPSAkLmNhbWVsQ2FzZShbJ3Njcm9sbCcsIGRpbWVuc2lvbl0uam9pbignLScpKVxyXG5cclxuICAgIHRoaXMuJGVsZW1lbnRcclxuICAgICAgLm9uZSgnYnNUcmFuc2l0aW9uRW5kJywgJC5wcm94eShjb21wbGV0ZSwgdGhpcykpXHJcbiAgICAgIC5lbXVsYXRlVHJhbnNpdGlvbkVuZChDb2xsYXBzZS5UUkFOU0lUSU9OX0RVUkFUSU9OKVtkaW1lbnNpb25dKHRoaXMuJGVsZW1lbnRbMF1bc2Nyb2xsU2l6ZV0pXHJcbiAgfVxyXG5cclxuICBDb2xsYXBzZS5wcm90b3R5cGUuaGlkZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgIGlmICh0aGlzLnRyYW5zaXRpb25pbmcgfHwgIXRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoJ2luJykpIHJldHVyblxyXG5cclxuICAgIHZhciBzdGFydEV2ZW50ID0gJC5FdmVudCgnaGlkZS5icy5jb2xsYXBzZScpXHJcbiAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoc3RhcnRFdmVudClcclxuICAgIGlmIChzdGFydEV2ZW50LmlzRGVmYXVsdFByZXZlbnRlZCgpKSByZXR1cm5cclxuXHJcbiAgICB2YXIgZGltZW5zaW9uID0gdGhpcy5kaW1lbnNpb24oKVxyXG5cclxuICAgIHRoaXMuJGVsZW1lbnRbZGltZW5zaW9uXSh0aGlzLiRlbGVtZW50W2RpbWVuc2lvbl0oKSlbMF0ub2Zmc2V0SGVpZ2h0XHJcblxyXG4gICAgdGhpcy4kZWxlbWVudFxyXG4gICAgICAuYWRkQ2xhc3MoJ2NvbGxhcHNpbmcnKVxyXG4gICAgICAucmVtb3ZlQ2xhc3MoJ2NvbGxhcHNlIGluJylcclxuICAgICAgLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCBmYWxzZSlcclxuXHJcbiAgICB0aGlzLiR0cmlnZ2VyXHJcbiAgICAgIC5hZGRDbGFzcygnY29sbGFwc2VkJylcclxuICAgICAgLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCBmYWxzZSlcclxuXHJcbiAgICB0aGlzLnRyYW5zaXRpb25pbmcgPSAxXHJcblxyXG4gICAgdmFyIGNvbXBsZXRlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICB0aGlzLnRyYW5zaXRpb25pbmcgPSAwXHJcbiAgICAgIHRoaXMuJGVsZW1lbnRcclxuICAgICAgICAucmVtb3ZlQ2xhc3MoJ2NvbGxhcHNpbmcnKVxyXG4gICAgICAgIC5hZGRDbGFzcygnY29sbGFwc2UnKVxyXG4gICAgICAgIC50cmlnZ2VyKCdoaWRkZW4uYnMuY29sbGFwc2UnKVxyXG4gICAgfVxyXG5cclxuICAgIGlmICghJC5zdXBwb3J0LnRyYW5zaXRpb24pIHJldHVybiBjb21wbGV0ZS5jYWxsKHRoaXMpXHJcblxyXG4gICAgdGhpcy4kZWxlbWVudFxyXG4gICAgICBbZGltZW5zaW9uXSgwKVxyXG4gICAgICAub25lKCdic1RyYW5zaXRpb25FbmQnLCAkLnByb3h5KGNvbXBsZXRlLCB0aGlzKSlcclxuICAgICAgLmVtdWxhdGVUcmFuc2l0aW9uRW5kKENvbGxhcHNlLlRSQU5TSVRJT05fRFVSQVRJT04pXHJcbiAgfVxyXG5cclxuICBDb2xsYXBzZS5wcm90b3R5cGUudG9nZ2xlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpc1t0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKCdpbicpID8gJ2hpZGUnIDogJ3Nob3cnXSgpXHJcbiAgfVxyXG5cclxuICBDb2xsYXBzZS5wcm90b3R5cGUuZ2V0UGFyZW50ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuICQodGhpcy5vcHRpb25zLnBhcmVudClcclxuICAgICAgLmZpbmQoJ1tkYXRhLXRvZ2dsZT1cImNvbGxhcHNlXCJdW2RhdGEtcGFyZW50PVwiJyArIHRoaXMub3B0aW9ucy5wYXJlbnQgKyAnXCJdJylcclxuICAgICAgLmVhY2goJC5wcm94eShmdW5jdGlvbiAoaSwgZWxlbWVudCkge1xyXG4gICAgICAgIHZhciAkZWxlbWVudCA9ICQoZWxlbWVudClcclxuICAgICAgICB0aGlzLmFkZEFyaWFBbmRDb2xsYXBzZWRDbGFzcyhnZXRUYXJnZXRGcm9tVHJpZ2dlcigkZWxlbWVudCksICRlbGVtZW50KVxyXG4gICAgICB9LCB0aGlzKSlcclxuICAgICAgLmVuZCgpXHJcbiAgfVxyXG5cclxuICBDb2xsYXBzZS5wcm90b3R5cGUuYWRkQXJpYUFuZENvbGxhcHNlZENsYXNzID0gZnVuY3Rpb24gKCRlbGVtZW50LCAkdHJpZ2dlcikge1xyXG4gICAgdmFyIGlzT3BlbiA9ICRlbGVtZW50Lmhhc0NsYXNzKCdpbicpXHJcblxyXG4gICAgJGVsZW1lbnQuYXR0cignYXJpYS1leHBhbmRlZCcsIGlzT3BlbilcclxuICAgICR0cmlnZ2VyXHJcbiAgICAgIC50b2dnbGVDbGFzcygnY29sbGFwc2VkJywgIWlzT3BlbilcclxuICAgICAgLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCBpc09wZW4pXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBnZXRUYXJnZXRGcm9tVHJpZ2dlcigkdHJpZ2dlcikge1xyXG4gICAgdmFyIGhyZWZcclxuICAgIHZhciB0YXJnZXQgPSAkdHJpZ2dlci5hdHRyKCdkYXRhLXRhcmdldCcpXHJcbiAgICAgIHx8IChocmVmID0gJHRyaWdnZXIuYXR0cignaHJlZicpKSAmJiBocmVmLnJlcGxhY2UoLy4qKD89I1teXFxzXSskKS8sICcnKSAvLyBzdHJpcCBmb3IgaWU3XHJcblxyXG4gICAgcmV0dXJuICQodGFyZ2V0KVxyXG4gIH1cclxuXHJcblxyXG4gIC8vIENPTExBUFNFIFBMVUdJTiBERUZJTklUSU9OXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgZnVuY3Rpb24gUGx1Z2luKG9wdGlvbikge1xyXG4gICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHZhciAkdGhpcyAgID0gJCh0aGlzKVxyXG4gICAgICB2YXIgZGF0YSAgICA9ICR0aGlzLmRhdGEoJ2JzLmNvbGxhcHNlJylcclxuICAgICAgdmFyIG9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgQ29sbGFwc2UuREVGQVVMVFMsICR0aGlzLmRhdGEoKSwgdHlwZW9mIG9wdGlvbiA9PSAnb2JqZWN0JyAmJiBvcHRpb24pXHJcblxyXG4gICAgICBpZiAoIWRhdGEgJiYgb3B0aW9ucy50b2dnbGUgJiYgL3Nob3d8aGlkZS8udGVzdChvcHRpb24pKSBvcHRpb25zLnRvZ2dsZSA9IGZhbHNlXHJcbiAgICAgIGlmICghZGF0YSkgJHRoaXMuZGF0YSgnYnMuY29sbGFwc2UnLCAoZGF0YSA9IG5ldyBDb2xsYXBzZSh0aGlzLCBvcHRpb25zKSkpXHJcbiAgICAgIGlmICh0eXBlb2Ygb3B0aW9uID09ICdzdHJpbmcnKSBkYXRhW29wdGlvbl0oKVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIHZhciBvbGQgPSAkLmZuLmNvbGxhcHNlXHJcblxyXG4gICQuZm4uY29sbGFwc2UgICAgICAgICAgICAgPSBQbHVnaW5cclxuICAkLmZuLmNvbGxhcHNlLkNvbnN0cnVjdG9yID0gQ29sbGFwc2VcclxuXHJcblxyXG4gIC8vIENPTExBUFNFIE5PIENPTkZMSUNUXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgJC5mbi5jb2xsYXBzZS5ub0NvbmZsaWN0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgJC5mbi5jb2xsYXBzZSA9IG9sZFxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcblxyXG5cclxuICAvLyBDT0xMQVBTRSBEQVRBLUFQSVxyXG4gIC8vID09PT09PT09PT09PT09PT09XHJcblxyXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljay5icy5jb2xsYXBzZS5kYXRhLWFwaScsICdbZGF0YS10b2dnbGU9XCJjb2xsYXBzZVwiXScsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICB2YXIgJHRoaXMgICA9ICQodGhpcylcclxuXHJcbiAgICBpZiAoISR0aGlzLmF0dHIoJ2RhdGEtdGFyZ2V0JykpIGUucHJldmVudERlZmF1bHQoKVxyXG5cclxuICAgIHZhciAkdGFyZ2V0ID0gZ2V0VGFyZ2V0RnJvbVRyaWdnZXIoJHRoaXMpXHJcbiAgICB2YXIgZGF0YSAgICA9ICR0YXJnZXQuZGF0YSgnYnMuY29sbGFwc2UnKVxyXG4gICAgdmFyIG9wdGlvbiAgPSBkYXRhID8gJ3RvZ2dsZScgOiAkdGhpcy5kYXRhKClcclxuXHJcbiAgICBQbHVnaW4uY2FsbCgkdGFyZ2V0LCBvcHRpb24pXHJcbiAgfSlcclxuXHJcbn0oalF1ZXJ5KTtcclxuXHJcbi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gKiBCb290c3RyYXA6IGRyb3Bkb3duLmpzIHYzLjMuN1xyXG4gKiBodHRwOi8vZ2V0Ym9vdHN0cmFwLmNvbS9qYXZhc2NyaXB0LyNkcm9wZG93bnNcclxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAqIENvcHlyaWdodCAyMDExLTIwMTYgVHdpdHRlciwgSW5jLlxyXG4gKiBMaWNlbnNlZCB1bmRlciBNSVQgKGh0dHBzOi8vZ2l0aHViLmNvbS90d2JzL2Jvb3RzdHJhcC9ibG9iL21hc3Rlci9MSUNFTlNFKVxyXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cclxuXHJcblxyXG4rZnVuY3Rpb24gKCQpIHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG4gIC8vIERST1BET1dOIENMQVNTIERFRklOSVRJT05cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHZhciBiYWNrZHJvcCA9ICcuZHJvcGRvd24tYmFja2Ryb3AnXHJcbiAgdmFyIHRvZ2dsZSAgID0gJ1tkYXRhLXRvZ2dsZT1cImRyb3Bkb3duXCJdJ1xyXG4gIHZhciBEcm9wZG93biA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XHJcbiAgICAkKGVsZW1lbnQpLm9uKCdjbGljay5icy5kcm9wZG93bicsIHRoaXMudG9nZ2xlKVxyXG4gIH1cclxuXHJcbiAgRHJvcGRvd24uVkVSU0lPTiA9ICczLjMuNydcclxuXHJcbiAgZnVuY3Rpb24gZ2V0UGFyZW50KCR0aGlzKSB7XHJcbiAgICB2YXIgc2VsZWN0b3IgPSAkdGhpcy5hdHRyKCdkYXRhLXRhcmdldCcpXHJcblxyXG4gICAgaWYgKCFzZWxlY3Rvcikge1xyXG4gICAgICBzZWxlY3RvciA9ICR0aGlzLmF0dHIoJ2hyZWYnKVxyXG4gICAgICBzZWxlY3RvciA9IHNlbGVjdG9yICYmIC8jW0EtWmEtel0vLnRlc3Qoc2VsZWN0b3IpICYmIHNlbGVjdG9yLnJlcGxhY2UoLy4qKD89I1teXFxzXSokKS8sICcnKSAvLyBzdHJpcCBmb3IgaWU3XHJcbiAgICB9XHJcblxyXG4gICAgdmFyICRwYXJlbnQgPSBzZWxlY3RvciAmJiAkKHNlbGVjdG9yKVxyXG5cclxuICAgIHJldHVybiAkcGFyZW50ICYmICRwYXJlbnQubGVuZ3RoID8gJHBhcmVudCA6ICR0aGlzLnBhcmVudCgpXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjbGVhck1lbnVzKGUpIHtcclxuICAgIGlmIChlICYmIGUud2hpY2ggPT09IDMpIHJldHVyblxyXG4gICAgJChiYWNrZHJvcCkucmVtb3ZlKClcclxuICAgICQodG9nZ2xlKS5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgdmFyICR0aGlzICAgICAgICAgPSAkKHRoaXMpXHJcbiAgICAgIHZhciAkcGFyZW50ICAgICAgID0gZ2V0UGFyZW50KCR0aGlzKVxyXG4gICAgICB2YXIgcmVsYXRlZFRhcmdldCA9IHsgcmVsYXRlZFRhcmdldDogdGhpcyB9XHJcblxyXG4gICAgICBpZiAoISRwYXJlbnQuaGFzQ2xhc3MoJ29wZW4nKSkgcmV0dXJuXHJcblxyXG4gICAgICBpZiAoZSAmJiBlLnR5cGUgPT0gJ2NsaWNrJyAmJiAvaW5wdXR8dGV4dGFyZWEvaS50ZXN0KGUudGFyZ2V0LnRhZ05hbWUpICYmICQuY29udGFpbnMoJHBhcmVudFswXSwgZS50YXJnZXQpKSByZXR1cm5cclxuXHJcbiAgICAgICRwYXJlbnQudHJpZ2dlcihlID0gJC5FdmVudCgnaGlkZS5icy5kcm9wZG93bicsIHJlbGF0ZWRUYXJnZXQpKVxyXG5cclxuICAgICAgaWYgKGUuaXNEZWZhdWx0UHJldmVudGVkKCkpIHJldHVyblxyXG5cclxuICAgICAgJHRoaXMuYXR0cignYXJpYS1leHBhbmRlZCcsICdmYWxzZScpXHJcbiAgICAgICRwYXJlbnQucmVtb3ZlQ2xhc3MoJ29wZW4nKS50cmlnZ2VyKCQuRXZlbnQoJ2hpZGRlbi5icy5kcm9wZG93bicsIHJlbGF0ZWRUYXJnZXQpKVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIERyb3Bkb3duLnByb3RvdHlwZS50b2dnbGUgPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgdmFyICR0aGlzID0gJCh0aGlzKVxyXG5cclxuICAgIGlmICgkdGhpcy5pcygnLmRpc2FibGVkLCA6ZGlzYWJsZWQnKSkgcmV0dXJuXHJcblxyXG4gICAgdmFyICRwYXJlbnQgID0gZ2V0UGFyZW50KCR0aGlzKVxyXG4gICAgdmFyIGlzQWN0aXZlID0gJHBhcmVudC5oYXNDbGFzcygnb3BlbicpXHJcblxyXG4gICAgY2xlYXJNZW51cygpXHJcblxyXG4gICAgaWYgKCFpc0FjdGl2ZSkge1xyXG4gICAgICBpZiAoJ29udG91Y2hzdGFydCcgaW4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICYmICEkcGFyZW50LmNsb3Nlc3QoJy5uYXZiYXItbmF2JykubGVuZ3RoKSB7XHJcbiAgICAgICAgLy8gaWYgbW9iaWxlIHdlIHVzZSBhIGJhY2tkcm9wIGJlY2F1c2UgY2xpY2sgZXZlbnRzIGRvbid0IGRlbGVnYXRlXHJcbiAgICAgICAgJChkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSlcclxuICAgICAgICAgIC5hZGRDbGFzcygnZHJvcGRvd24tYmFja2Ryb3AnKVxyXG4gICAgICAgICAgLmluc2VydEFmdGVyKCQodGhpcykpXHJcbiAgICAgICAgICAub24oJ2NsaWNrJywgY2xlYXJNZW51cylcclxuICAgICAgfVxyXG5cclxuICAgICAgdmFyIHJlbGF0ZWRUYXJnZXQgPSB7IHJlbGF0ZWRUYXJnZXQ6IHRoaXMgfVxyXG4gICAgICAkcGFyZW50LnRyaWdnZXIoZSA9ICQuRXZlbnQoJ3Nob3cuYnMuZHJvcGRvd24nLCByZWxhdGVkVGFyZ2V0KSlcclxuXHJcbiAgICAgIGlmIChlLmlzRGVmYXVsdFByZXZlbnRlZCgpKSByZXR1cm5cclxuXHJcbiAgICAgICR0aGlzXHJcbiAgICAgICAgLnRyaWdnZXIoJ2ZvY3VzJylcclxuICAgICAgICAuYXR0cignYXJpYS1leHBhbmRlZCcsICd0cnVlJylcclxuXHJcbiAgICAgICRwYXJlbnRcclxuICAgICAgICAudG9nZ2xlQ2xhc3MoJ29wZW4nKVxyXG4gICAgICAgIC50cmlnZ2VyKCQuRXZlbnQoJ3Nob3duLmJzLmRyb3Bkb3duJywgcmVsYXRlZFRhcmdldCkpXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGZhbHNlXHJcbiAgfVxyXG5cclxuICBEcm9wZG93bi5wcm90b3R5cGUua2V5ZG93biA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICBpZiAoIS8oMzh8NDB8Mjd8MzIpLy50ZXN0KGUud2hpY2gpIHx8IC9pbnB1dHx0ZXh0YXJlYS9pLnRlc3QoZS50YXJnZXQudGFnTmFtZSkpIHJldHVyblxyXG5cclxuICAgIHZhciAkdGhpcyA9ICQodGhpcylcclxuXHJcbiAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcclxuXHJcbiAgICBpZiAoJHRoaXMuaXMoJy5kaXNhYmxlZCwgOmRpc2FibGVkJykpIHJldHVyblxyXG5cclxuICAgIHZhciAkcGFyZW50ICA9IGdldFBhcmVudCgkdGhpcylcclxuICAgIHZhciBpc0FjdGl2ZSA9ICRwYXJlbnQuaGFzQ2xhc3MoJ29wZW4nKVxyXG5cclxuICAgIGlmICghaXNBY3RpdmUgJiYgZS53aGljaCAhPSAyNyB8fCBpc0FjdGl2ZSAmJiBlLndoaWNoID09IDI3KSB7XHJcbiAgICAgIGlmIChlLndoaWNoID09IDI3KSAkcGFyZW50LmZpbmQodG9nZ2xlKS50cmlnZ2VyKCdmb2N1cycpXHJcbiAgICAgIHJldHVybiAkdGhpcy50cmlnZ2VyKCdjbGljaycpXHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGRlc2MgPSAnIGxpOm5vdCguZGlzYWJsZWQpOnZpc2libGUgYSdcclxuICAgIHZhciAkaXRlbXMgPSAkcGFyZW50LmZpbmQoJy5kcm9wZG93bi1tZW51JyArIGRlc2MpXHJcblxyXG4gICAgaWYgKCEkaXRlbXMubGVuZ3RoKSByZXR1cm5cclxuXHJcbiAgICB2YXIgaW5kZXggPSAkaXRlbXMuaW5kZXgoZS50YXJnZXQpXHJcblxyXG4gICAgaWYgKGUud2hpY2ggPT0gMzggJiYgaW5kZXggPiAwKSAgICAgICAgICAgICAgICAgaW5kZXgtLSAgICAgICAgIC8vIHVwXHJcbiAgICBpZiAoZS53aGljaCA9PSA0MCAmJiBpbmRleCA8ICRpdGVtcy5sZW5ndGggLSAxKSBpbmRleCsrICAgICAgICAgLy8gZG93blxyXG4gICAgaWYgKCF+aW5kZXgpICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXggPSAwXHJcblxyXG4gICAgJGl0ZW1zLmVxKGluZGV4KS50cmlnZ2VyKCdmb2N1cycpXHJcbiAgfVxyXG5cclxuXHJcbiAgLy8gRFJPUERPV04gUExVR0lOIERFRklOSVRJT05cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBmdW5jdGlvbiBQbHVnaW4ob3B0aW9uKSB7XHJcbiAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgdmFyICR0aGlzID0gJCh0aGlzKVxyXG4gICAgICB2YXIgZGF0YSAgPSAkdGhpcy5kYXRhKCdicy5kcm9wZG93bicpXHJcblxyXG4gICAgICBpZiAoIWRhdGEpICR0aGlzLmRhdGEoJ2JzLmRyb3Bkb3duJywgKGRhdGEgPSBuZXcgRHJvcGRvd24odGhpcykpKVxyXG4gICAgICBpZiAodHlwZW9mIG9wdGlvbiA9PSAnc3RyaW5nJykgZGF0YVtvcHRpb25dLmNhbGwoJHRoaXMpXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgdmFyIG9sZCA9ICQuZm4uZHJvcGRvd25cclxuXHJcbiAgJC5mbi5kcm9wZG93biAgICAgICAgICAgICA9IFBsdWdpblxyXG4gICQuZm4uZHJvcGRvd24uQ29uc3RydWN0b3IgPSBEcm9wZG93blxyXG5cclxuXHJcbiAgLy8gRFJPUERPV04gTk8gQ09ORkxJQ1RcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICAkLmZuLmRyb3Bkb3duLm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAkLmZuLmRyb3Bkb3duID0gb2xkXHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cclxuXHJcblxyXG4gIC8vIEFQUExZIFRPIFNUQU5EQVJEIERST1BET1dOIEVMRU1FTlRTXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgJChkb2N1bWVudClcclxuICAgIC5vbignY2xpY2suYnMuZHJvcGRvd24uZGF0YS1hcGknLCBjbGVhck1lbnVzKVxyXG4gICAgLm9uKCdjbGljay5icy5kcm9wZG93bi5kYXRhLWFwaScsICcuZHJvcGRvd24gZm9ybScsIGZ1bmN0aW9uIChlKSB7IGUuc3RvcFByb3BhZ2F0aW9uKCkgfSlcclxuICAgIC5vbignY2xpY2suYnMuZHJvcGRvd24uZGF0YS1hcGknLCB0b2dnbGUsIERyb3Bkb3duLnByb3RvdHlwZS50b2dnbGUpXHJcbiAgICAub24oJ2tleWRvd24uYnMuZHJvcGRvd24uZGF0YS1hcGknLCB0b2dnbGUsIERyb3Bkb3duLnByb3RvdHlwZS5rZXlkb3duKVxyXG4gICAgLm9uKCdrZXlkb3duLmJzLmRyb3Bkb3duLmRhdGEtYXBpJywgJy5kcm9wZG93bi1tZW51JywgRHJvcGRvd24ucHJvdG90eXBlLmtleWRvd24pXHJcblxyXG59KGpRdWVyeSk7XHJcblxyXG4vKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICogQm9vdHN0cmFwOiBtb2RhbC5qcyB2My4zLjdcclxuICogaHR0cDovL2dldGJvb3RzdHJhcC5jb20vamF2YXNjcmlwdC8jbW9kYWxzXHJcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gKiBDb3B5cmlnaHQgMjAxMS0yMDE2IFR3aXR0ZXIsIEluYy5cclxuICogTGljZW5zZWQgdW5kZXIgTUlUIChodHRwczovL2dpdGh1Yi5jb20vdHdicy9ib290c3RyYXAvYmxvYi9tYXN0ZXIvTElDRU5TRSlcclxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXHJcblxyXG5cclxuK2Z1bmN0aW9uICgkKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAvLyBNT0RBTCBDTEFTUyBERUZJTklUSU9OXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICB2YXIgTW9kYWwgPSBmdW5jdGlvbiAoZWxlbWVudCwgb3B0aW9ucykge1xyXG4gICAgdGhpcy5vcHRpb25zICAgICAgICAgICAgID0gb3B0aW9uc1xyXG4gICAgdGhpcy4kYm9keSAgICAgICAgICAgICAgID0gJChkb2N1bWVudC5ib2R5KVxyXG4gICAgdGhpcy4kZWxlbWVudCAgICAgICAgICAgID0gJChlbGVtZW50KVxyXG4gICAgdGhpcy4kZGlhbG9nICAgICAgICAgICAgID0gdGhpcy4kZWxlbWVudC5maW5kKCcubW9kYWwtZGlhbG9nJylcclxuICAgIHRoaXMuJGJhY2tkcm9wICAgICAgICAgICA9IG51bGxcclxuICAgIHRoaXMuaXNTaG93biAgICAgICAgICAgICA9IG51bGxcclxuICAgIHRoaXMub3JpZ2luYWxCb2R5UGFkICAgICA9IG51bGxcclxuICAgIHRoaXMuc2Nyb2xsYmFyV2lkdGggICAgICA9IDBcclxuICAgIHRoaXMuaWdub3JlQmFja2Ryb3BDbGljayA9IGZhbHNlXHJcblxyXG4gICAgaWYgKHRoaXMub3B0aW9ucy5yZW1vdGUpIHtcclxuICAgICAgdGhpcy4kZWxlbWVudFxyXG4gICAgICAgIC5maW5kKCcubW9kYWwtY29udGVudCcpXHJcbiAgICAgICAgLmxvYWQodGhpcy5vcHRpb25zLnJlbW90ZSwgJC5wcm94eShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ2xvYWRlZC5icy5tb2RhbCcpXHJcbiAgICAgICAgfSwgdGhpcykpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBNb2RhbC5WRVJTSU9OICA9ICczLjMuNydcclxuXHJcbiAgTW9kYWwuVFJBTlNJVElPTl9EVVJBVElPTiA9IDMwMFxyXG4gIE1vZGFsLkJBQ0tEUk9QX1RSQU5TSVRJT05fRFVSQVRJT04gPSAxNTBcclxuXHJcbiAgTW9kYWwuREVGQVVMVFMgPSB7XHJcbiAgICBiYWNrZHJvcDogdHJ1ZSxcclxuICAgIGtleWJvYXJkOiB0cnVlLFxyXG4gICAgc2hvdzogdHJ1ZVxyXG4gIH1cclxuXHJcbiAgTW9kYWwucHJvdG90eXBlLnRvZ2dsZSA9IGZ1bmN0aW9uIChfcmVsYXRlZFRhcmdldCkge1xyXG4gICAgcmV0dXJuIHRoaXMuaXNTaG93biA/IHRoaXMuaGlkZSgpIDogdGhpcy5zaG93KF9yZWxhdGVkVGFyZ2V0KVxyXG4gIH1cclxuXHJcbiAgTW9kYWwucHJvdG90eXBlLnNob3cgPSBmdW5jdGlvbiAoX3JlbGF0ZWRUYXJnZXQpIHtcclxuICAgIHZhciB0aGF0ID0gdGhpc1xyXG4gICAgdmFyIGUgICAgPSAkLkV2ZW50KCdzaG93LmJzLm1vZGFsJywgeyByZWxhdGVkVGFyZ2V0OiBfcmVsYXRlZFRhcmdldCB9KVxyXG5cclxuICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcihlKVxyXG5cclxuICAgIGlmICh0aGlzLmlzU2hvd24gfHwgZS5pc0RlZmF1bHRQcmV2ZW50ZWQoKSkgcmV0dXJuXHJcblxyXG4gICAgdGhpcy5pc1Nob3duID0gdHJ1ZVxyXG5cclxuICAgIHRoaXMuY2hlY2tTY3JvbGxiYXIoKVxyXG4gICAgdGhpcy5zZXRTY3JvbGxiYXIoKVxyXG4gICAgdGhpcy4kYm9keS5hZGRDbGFzcygnbW9kYWwtb3BlbicpXHJcblxyXG4gICAgdGhpcy5lc2NhcGUoKVxyXG4gICAgdGhpcy5yZXNpemUoKVxyXG5cclxuICAgIHRoaXMuJGVsZW1lbnQub24oJ2NsaWNrLmRpc21pc3MuYnMubW9kYWwnLCAnW2RhdGEtZGlzbWlzcz1cIm1vZGFsXCJdJywgJC5wcm94eSh0aGlzLmhpZGUsIHRoaXMpKVxyXG5cclxuICAgIHRoaXMuJGRpYWxvZy5vbignbW91c2Vkb3duLmRpc21pc3MuYnMubW9kYWwnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHRoYXQuJGVsZW1lbnQub25lKCdtb3VzZXVwLmRpc21pc3MuYnMubW9kYWwnLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgIGlmICgkKGUudGFyZ2V0KS5pcyh0aGF0LiRlbGVtZW50KSkgdGhhdC5pZ25vcmVCYWNrZHJvcENsaWNrID0gdHJ1ZVxyXG4gICAgICB9KVxyXG4gICAgfSlcclxuXHJcbiAgICB0aGlzLmJhY2tkcm9wKGZ1bmN0aW9uICgpIHtcclxuICAgICAgdmFyIHRyYW5zaXRpb24gPSAkLnN1cHBvcnQudHJhbnNpdGlvbiAmJiB0aGF0LiRlbGVtZW50Lmhhc0NsYXNzKCdmYWRlJylcclxuXHJcbiAgICAgIGlmICghdGhhdC4kZWxlbWVudC5wYXJlbnQoKS5sZW5ndGgpIHtcclxuICAgICAgICB0aGF0LiRlbGVtZW50LmFwcGVuZFRvKHRoYXQuJGJvZHkpIC8vIGRvbid0IG1vdmUgbW9kYWxzIGRvbSBwb3NpdGlvblxyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGF0LiRlbGVtZW50XHJcbiAgICAgICAgLnNob3coKVxyXG4gICAgICAgIC5zY3JvbGxUb3AoMClcclxuXHJcbiAgICAgIHRoYXQuYWRqdXN0RGlhbG9nKClcclxuXHJcbiAgICAgIGlmICh0cmFuc2l0aW9uKSB7XHJcbiAgICAgICAgdGhhdC4kZWxlbWVudFswXS5vZmZzZXRXaWR0aCAvLyBmb3JjZSByZWZsb3dcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhhdC4kZWxlbWVudC5hZGRDbGFzcygnaW4nKVxyXG5cclxuICAgICAgdGhhdC5lbmZvcmNlRm9jdXMoKVxyXG5cclxuICAgICAgdmFyIGUgPSAkLkV2ZW50KCdzaG93bi5icy5tb2RhbCcsIHsgcmVsYXRlZFRhcmdldDogX3JlbGF0ZWRUYXJnZXQgfSlcclxuXHJcbiAgICAgIHRyYW5zaXRpb24gP1xyXG4gICAgICAgIHRoYXQuJGRpYWxvZyAvLyB3YWl0IGZvciBtb2RhbCB0byBzbGlkZSBpblxyXG4gICAgICAgICAgLm9uZSgnYnNUcmFuc2l0aW9uRW5kJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGF0LiRlbGVtZW50LnRyaWdnZXIoJ2ZvY3VzJykudHJpZ2dlcihlKVxyXG4gICAgICAgICAgfSlcclxuICAgICAgICAgIC5lbXVsYXRlVHJhbnNpdGlvbkVuZChNb2RhbC5UUkFOU0lUSU9OX0RVUkFUSU9OKSA6XHJcbiAgICAgICAgdGhhdC4kZWxlbWVudC50cmlnZ2VyKCdmb2N1cycpLnRyaWdnZXIoZSlcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICBNb2RhbC5wcm90b3R5cGUuaGlkZSA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICBpZiAoZSkgZS5wcmV2ZW50RGVmYXVsdCgpXHJcblxyXG4gICAgZSA9ICQuRXZlbnQoJ2hpZGUuYnMubW9kYWwnKVxyXG5cclxuICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcihlKVxyXG5cclxuICAgIGlmICghdGhpcy5pc1Nob3duIHx8IGUuaXNEZWZhdWx0UHJldmVudGVkKCkpIHJldHVyblxyXG5cclxuICAgIHRoaXMuaXNTaG93biA9IGZhbHNlXHJcblxyXG4gICAgdGhpcy5lc2NhcGUoKVxyXG4gICAgdGhpcy5yZXNpemUoKVxyXG5cclxuICAgICQoZG9jdW1lbnQpLm9mZignZm9jdXNpbi5icy5tb2RhbCcpXHJcblxyXG4gICAgdGhpcy4kZWxlbWVudFxyXG4gICAgICAucmVtb3ZlQ2xhc3MoJ2luJylcclxuICAgICAgLm9mZignY2xpY2suZGlzbWlzcy5icy5tb2RhbCcpXHJcbiAgICAgIC5vZmYoJ21vdXNldXAuZGlzbWlzcy5icy5tb2RhbCcpXHJcblxyXG4gICAgdGhpcy4kZGlhbG9nLm9mZignbW91c2Vkb3duLmRpc21pc3MuYnMubW9kYWwnKVxyXG5cclxuICAgICQuc3VwcG9ydC50cmFuc2l0aW9uICYmIHRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoJ2ZhZGUnKSA/XHJcbiAgICAgIHRoaXMuJGVsZW1lbnRcclxuICAgICAgICAub25lKCdic1RyYW5zaXRpb25FbmQnLCAkLnByb3h5KHRoaXMuaGlkZU1vZGFsLCB0aGlzKSlcclxuICAgICAgICAuZW11bGF0ZVRyYW5zaXRpb25FbmQoTW9kYWwuVFJBTlNJVElPTl9EVVJBVElPTikgOlxyXG4gICAgICB0aGlzLmhpZGVNb2RhbCgpXHJcbiAgfVxyXG5cclxuICBNb2RhbC5wcm90b3R5cGUuZW5mb3JjZUZvY3VzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgJChkb2N1bWVudClcclxuICAgICAgLm9mZignZm9jdXNpbi5icy5tb2RhbCcpIC8vIGd1YXJkIGFnYWluc3QgaW5maW5pdGUgZm9jdXMgbG9vcFxyXG4gICAgICAub24oJ2ZvY3VzaW4uYnMubW9kYWwnLCAkLnByb3h5KGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgaWYgKGRvY3VtZW50ICE9PSBlLnRhcmdldCAmJlxyXG4gICAgICAgICAgICB0aGlzLiRlbGVtZW50WzBdICE9PSBlLnRhcmdldCAmJlxyXG4gICAgICAgICAgICAhdGhpcy4kZWxlbWVudC5oYXMoZS50YXJnZXQpLmxlbmd0aCkge1xyXG4gICAgICAgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdmb2N1cycpXHJcbiAgICAgICAgfVxyXG4gICAgICB9LCB0aGlzKSlcclxuICB9XHJcblxyXG4gIE1vZGFsLnByb3RvdHlwZS5lc2NhcGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICBpZiAodGhpcy5pc1Nob3duICYmIHRoaXMub3B0aW9ucy5rZXlib2FyZCkge1xyXG4gICAgICB0aGlzLiRlbGVtZW50Lm9uKCdrZXlkb3duLmRpc21pc3MuYnMubW9kYWwnLCAkLnByb3h5KGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgZS53aGljaCA9PSAyNyAmJiB0aGlzLmhpZGUoKVxyXG4gICAgICB9LCB0aGlzKSlcclxuICAgIH0gZWxzZSBpZiAoIXRoaXMuaXNTaG93bikge1xyXG4gICAgICB0aGlzLiRlbGVtZW50Lm9mZigna2V5ZG93bi5kaXNtaXNzLmJzLm1vZGFsJylcclxuICAgIH1cclxuICB9XHJcblxyXG4gIE1vZGFsLnByb3RvdHlwZS5yZXNpemUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICBpZiAodGhpcy5pc1Nob3duKSB7XHJcbiAgICAgICQod2luZG93KS5vbigncmVzaXplLmJzLm1vZGFsJywgJC5wcm94eSh0aGlzLmhhbmRsZVVwZGF0ZSwgdGhpcykpXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAkKHdpbmRvdykub2ZmKCdyZXNpemUuYnMubW9kYWwnKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgTW9kYWwucHJvdG90eXBlLmhpZGVNb2RhbCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciB0aGF0ID0gdGhpc1xyXG4gICAgdGhpcy4kZWxlbWVudC5oaWRlKClcclxuICAgIHRoaXMuYmFja2Ryb3AoZnVuY3Rpb24gKCkge1xyXG4gICAgICB0aGF0LiRib2R5LnJlbW92ZUNsYXNzKCdtb2RhbC1vcGVuJylcclxuICAgICAgdGhhdC5yZXNldEFkanVzdG1lbnRzKClcclxuICAgICAgdGhhdC5yZXNldFNjcm9sbGJhcigpXHJcbiAgICAgIHRoYXQuJGVsZW1lbnQudHJpZ2dlcignaGlkZGVuLmJzLm1vZGFsJylcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICBNb2RhbC5wcm90b3R5cGUucmVtb3ZlQmFja2Ryb3AgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLiRiYWNrZHJvcCAmJiB0aGlzLiRiYWNrZHJvcC5yZW1vdmUoKVxyXG4gICAgdGhpcy4kYmFja2Ryb3AgPSBudWxsXHJcbiAgfVxyXG5cclxuICBNb2RhbC5wcm90b3R5cGUuYmFja2Ryb3AgPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcclxuICAgIHZhciB0aGF0ID0gdGhpc1xyXG4gICAgdmFyIGFuaW1hdGUgPSB0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKCdmYWRlJykgPyAnZmFkZScgOiAnJ1xyXG5cclxuICAgIGlmICh0aGlzLmlzU2hvd24gJiYgdGhpcy5vcHRpb25zLmJhY2tkcm9wKSB7XHJcbiAgICAgIHZhciBkb0FuaW1hdGUgPSAkLnN1cHBvcnQudHJhbnNpdGlvbiAmJiBhbmltYXRlXHJcblxyXG4gICAgICB0aGlzLiRiYWNrZHJvcCA9ICQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JykpXHJcbiAgICAgICAgLmFkZENsYXNzKCdtb2RhbC1iYWNrZHJvcCAnICsgYW5pbWF0ZSlcclxuICAgICAgICAuYXBwZW5kVG8odGhpcy4kYm9keSlcclxuXHJcbiAgICAgIHRoaXMuJGVsZW1lbnQub24oJ2NsaWNrLmRpc21pc3MuYnMubW9kYWwnLCAkLnByb3h5KGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuaWdub3JlQmFja2Ryb3BDbGljaykge1xyXG4gICAgICAgICAgdGhpcy5pZ25vcmVCYWNrZHJvcENsaWNrID0gZmFsc2VcclxuICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZS50YXJnZXQgIT09IGUuY3VycmVudFRhcmdldCkgcmV0dXJuXHJcbiAgICAgICAgdGhpcy5vcHRpb25zLmJhY2tkcm9wID09ICdzdGF0aWMnXHJcbiAgICAgICAgICA/IHRoaXMuJGVsZW1lbnRbMF0uZm9jdXMoKVxyXG4gICAgICAgICAgOiB0aGlzLmhpZGUoKVxyXG4gICAgICB9LCB0aGlzKSlcclxuXHJcbiAgICAgIGlmIChkb0FuaW1hdGUpIHRoaXMuJGJhY2tkcm9wWzBdLm9mZnNldFdpZHRoIC8vIGZvcmNlIHJlZmxvd1xyXG5cclxuICAgICAgdGhpcy4kYmFja2Ryb3AuYWRkQ2xhc3MoJ2luJylcclxuXHJcbiAgICAgIGlmICghY2FsbGJhY2spIHJldHVyblxyXG5cclxuICAgICAgZG9BbmltYXRlID9cclxuICAgICAgICB0aGlzLiRiYWNrZHJvcFxyXG4gICAgICAgICAgLm9uZSgnYnNUcmFuc2l0aW9uRW5kJywgY2FsbGJhY2spXHJcbiAgICAgICAgICAuZW11bGF0ZVRyYW5zaXRpb25FbmQoTW9kYWwuQkFDS0RST1BfVFJBTlNJVElPTl9EVVJBVElPTikgOlxyXG4gICAgICAgIGNhbGxiYWNrKClcclxuXHJcbiAgICB9IGVsc2UgaWYgKCF0aGlzLmlzU2hvd24gJiYgdGhpcy4kYmFja2Ryb3ApIHtcclxuICAgICAgdGhpcy4kYmFja2Ryb3AucmVtb3ZlQ2xhc3MoJ2luJylcclxuXHJcbiAgICAgIHZhciBjYWxsYmFja1JlbW92ZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGF0LnJlbW92ZUJhY2tkcm9wKClcclxuICAgICAgICBjYWxsYmFjayAmJiBjYWxsYmFjaygpXHJcbiAgICAgIH1cclxuICAgICAgJC5zdXBwb3J0LnRyYW5zaXRpb24gJiYgdGhpcy4kZWxlbWVudC5oYXNDbGFzcygnZmFkZScpID9cclxuICAgICAgICB0aGlzLiRiYWNrZHJvcFxyXG4gICAgICAgICAgLm9uZSgnYnNUcmFuc2l0aW9uRW5kJywgY2FsbGJhY2tSZW1vdmUpXHJcbiAgICAgICAgICAuZW11bGF0ZVRyYW5zaXRpb25FbmQoTW9kYWwuQkFDS0RST1BfVFJBTlNJVElPTl9EVVJBVElPTikgOlxyXG4gICAgICAgIGNhbGxiYWNrUmVtb3ZlKClcclxuXHJcbiAgICB9IGVsc2UgaWYgKGNhbGxiYWNrKSB7XHJcbiAgICAgIGNhbGxiYWNrKClcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIHRoZXNlIGZvbGxvd2luZyBtZXRob2RzIGFyZSB1c2VkIHRvIGhhbmRsZSBvdmVyZmxvd2luZyBtb2RhbHNcclxuXHJcbiAgTW9kYWwucHJvdG90eXBlLmhhbmRsZVVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMuYWRqdXN0RGlhbG9nKClcclxuICB9XHJcblxyXG4gIE1vZGFsLnByb3RvdHlwZS5hZGp1c3REaWFsb2cgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgbW9kYWxJc092ZXJmbG93aW5nID0gdGhpcy4kZWxlbWVudFswXS5zY3JvbGxIZWlnaHQgPiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0XHJcblxyXG4gICAgdGhpcy4kZWxlbWVudC5jc3Moe1xyXG4gICAgICBwYWRkaW5nTGVmdDogICF0aGlzLmJvZHlJc092ZXJmbG93aW5nICYmIG1vZGFsSXNPdmVyZmxvd2luZyA/IHRoaXMuc2Nyb2xsYmFyV2lkdGggOiAnJyxcclxuICAgICAgcGFkZGluZ1JpZ2h0OiB0aGlzLmJvZHlJc092ZXJmbG93aW5nICYmICFtb2RhbElzT3ZlcmZsb3dpbmcgPyB0aGlzLnNjcm9sbGJhcldpZHRoIDogJydcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICBNb2RhbC5wcm90b3R5cGUucmVzZXRBZGp1c3RtZW50cyA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMuJGVsZW1lbnQuY3NzKHtcclxuICAgICAgcGFkZGluZ0xlZnQ6ICcnLFxyXG4gICAgICBwYWRkaW5nUmlnaHQ6ICcnXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgTW9kYWwucHJvdG90eXBlLmNoZWNrU2Nyb2xsYmFyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIGZ1bGxXaW5kb3dXaWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoXHJcbiAgICBpZiAoIWZ1bGxXaW5kb3dXaWR0aCkgeyAvLyB3b3JrYXJvdW5kIGZvciBtaXNzaW5nIHdpbmRvdy5pbm5lcldpZHRoIGluIElFOFxyXG4gICAgICB2YXIgZG9jdW1lbnRFbGVtZW50UmVjdCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxyXG4gICAgICBmdWxsV2luZG93V2lkdGggPSBkb2N1bWVudEVsZW1lbnRSZWN0LnJpZ2h0IC0gTWF0aC5hYnMoZG9jdW1lbnRFbGVtZW50UmVjdC5sZWZ0KVxyXG4gICAgfVxyXG4gICAgdGhpcy5ib2R5SXNPdmVyZmxvd2luZyA9IGRvY3VtZW50LmJvZHkuY2xpZW50V2lkdGggPCBmdWxsV2luZG93V2lkdGhcclxuICAgIHRoaXMuc2Nyb2xsYmFyV2lkdGggPSB0aGlzLm1lYXN1cmVTY3JvbGxiYXIoKVxyXG4gIH1cclxuXHJcbiAgTW9kYWwucHJvdG90eXBlLnNldFNjcm9sbGJhciA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBib2R5UGFkID0gcGFyc2VJbnQoKHRoaXMuJGJvZHkuY3NzKCdwYWRkaW5nLXJpZ2h0JykgfHwgMCksIDEwKVxyXG4gICAgdGhpcy5vcmlnaW5hbEJvZHlQYWQgPSBkb2N1bWVudC5ib2R5LnN0eWxlLnBhZGRpbmdSaWdodCB8fCAnJ1xyXG4gICAgaWYgKHRoaXMuYm9keUlzT3ZlcmZsb3dpbmcpIHRoaXMuJGJvZHkuY3NzKCdwYWRkaW5nLXJpZ2h0JywgYm9keVBhZCArIHRoaXMuc2Nyb2xsYmFyV2lkdGgpXHJcbiAgfVxyXG5cclxuICBNb2RhbC5wcm90b3R5cGUucmVzZXRTY3JvbGxiYXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLiRib2R5LmNzcygncGFkZGluZy1yaWdodCcsIHRoaXMub3JpZ2luYWxCb2R5UGFkKVxyXG4gIH1cclxuXHJcbiAgTW9kYWwucHJvdG90eXBlLm1lYXN1cmVTY3JvbGxiYXIgPSBmdW5jdGlvbiAoKSB7IC8vIHRoeCB3YWxzaFxyXG4gICAgdmFyIHNjcm9sbERpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXHJcbiAgICBzY3JvbGxEaXYuY2xhc3NOYW1lID0gJ21vZGFsLXNjcm9sbGJhci1tZWFzdXJlJ1xyXG4gICAgdGhpcy4kYm9keS5hcHBlbmQoc2Nyb2xsRGl2KVxyXG4gICAgdmFyIHNjcm9sbGJhcldpZHRoID0gc2Nyb2xsRGl2Lm9mZnNldFdpZHRoIC0gc2Nyb2xsRGl2LmNsaWVudFdpZHRoXHJcbiAgICB0aGlzLiRib2R5WzBdLnJlbW92ZUNoaWxkKHNjcm9sbERpdilcclxuICAgIHJldHVybiBzY3JvbGxiYXJXaWR0aFxyXG4gIH1cclxuXHJcblxyXG4gIC8vIE1PREFMIFBMVUdJTiBERUZJTklUSU9OXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgZnVuY3Rpb24gUGx1Z2luKG9wdGlvbiwgX3JlbGF0ZWRUYXJnZXQpIHtcclxuICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICB2YXIgJHRoaXMgICA9ICQodGhpcylcclxuICAgICAgdmFyIGRhdGEgICAgPSAkdGhpcy5kYXRhKCdicy5tb2RhbCcpXHJcbiAgICAgIHZhciBvcHRpb25zID0gJC5leHRlbmQoe30sIE1vZGFsLkRFRkFVTFRTLCAkdGhpcy5kYXRhKCksIHR5cGVvZiBvcHRpb24gPT0gJ29iamVjdCcgJiYgb3B0aW9uKVxyXG5cclxuICAgICAgaWYgKCFkYXRhKSAkdGhpcy5kYXRhKCdicy5tb2RhbCcsIChkYXRhID0gbmV3IE1vZGFsKHRoaXMsIG9wdGlvbnMpKSlcclxuICAgICAgaWYgKHR5cGVvZiBvcHRpb24gPT0gJ3N0cmluZycpIGRhdGFbb3B0aW9uXShfcmVsYXRlZFRhcmdldClcclxuICAgICAgZWxzZSBpZiAob3B0aW9ucy5zaG93KSBkYXRhLnNob3coX3JlbGF0ZWRUYXJnZXQpXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgdmFyIG9sZCA9ICQuZm4ubW9kYWxcclxuXHJcbiAgJC5mbi5tb2RhbCAgICAgICAgICAgICA9IFBsdWdpblxyXG4gICQuZm4ubW9kYWwuQ29uc3RydWN0b3IgPSBNb2RhbFxyXG5cclxuXHJcbiAgLy8gTU9EQUwgTk8gQ09ORkxJQ1RcclxuICAvLyA9PT09PT09PT09PT09PT09PVxyXG5cclxuICAkLmZuLm1vZGFsLm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAkLmZuLm1vZGFsID0gb2xkXHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cclxuXHJcblxyXG4gIC8vIE1PREFMIERBVEEtQVBJXHJcbiAgLy8gPT09PT09PT09PT09PT1cclxuXHJcbiAgJChkb2N1bWVudCkub24oJ2NsaWNrLmJzLm1vZGFsLmRhdGEtYXBpJywgJ1tkYXRhLXRvZ2dsZT1cIm1vZGFsXCJdJywgZnVuY3Rpb24gKGUpIHtcclxuICAgIHZhciAkdGhpcyAgID0gJCh0aGlzKVxyXG4gICAgdmFyIGhyZWYgICAgPSAkdGhpcy5hdHRyKCdocmVmJylcclxuICAgIHZhciAkdGFyZ2V0ID0gJCgkdGhpcy5hdHRyKCdkYXRhLXRhcmdldCcpIHx8IChocmVmICYmIGhyZWYucmVwbGFjZSgvLiooPz0jW15cXHNdKyQpLywgJycpKSkgLy8gc3RyaXAgZm9yIGllN1xyXG4gICAgdmFyIG9wdGlvbiAgPSAkdGFyZ2V0LmRhdGEoJ2JzLm1vZGFsJykgPyAndG9nZ2xlJyA6ICQuZXh0ZW5kKHsgcmVtb3RlOiAhLyMvLnRlc3QoaHJlZikgJiYgaHJlZiB9LCAkdGFyZ2V0LmRhdGEoKSwgJHRoaXMuZGF0YSgpKVxyXG5cclxuICAgIGlmICgkdGhpcy5pcygnYScpKSBlLnByZXZlbnREZWZhdWx0KClcclxuXHJcbiAgICAkdGFyZ2V0Lm9uZSgnc2hvdy5icy5tb2RhbCcsIGZ1bmN0aW9uIChzaG93RXZlbnQpIHtcclxuICAgICAgaWYgKHNob3dFdmVudC5pc0RlZmF1bHRQcmV2ZW50ZWQoKSkgcmV0dXJuIC8vIG9ubHkgcmVnaXN0ZXIgZm9jdXMgcmVzdG9yZXIgaWYgbW9kYWwgd2lsbCBhY3R1YWxseSBnZXQgc2hvd25cclxuICAgICAgJHRhcmdldC5vbmUoJ2hpZGRlbi5icy5tb2RhbCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAkdGhpcy5pcygnOnZpc2libGUnKSAmJiAkdGhpcy50cmlnZ2VyKCdmb2N1cycpXHJcbiAgICAgIH0pXHJcbiAgICB9KVxyXG4gICAgUGx1Z2luLmNhbGwoJHRhcmdldCwgb3B0aW9uLCB0aGlzKVxyXG4gIH0pXHJcblxyXG59KGpRdWVyeSk7XHJcblxyXG4vKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICogQm9vdHN0cmFwOiB0b29sdGlwLmpzIHYzLjMuN1xyXG4gKiBodHRwOi8vZ2V0Ym9vdHN0cmFwLmNvbS9qYXZhc2NyaXB0LyN0b29sdGlwXHJcbiAqIEluc3BpcmVkIGJ5IHRoZSBvcmlnaW5hbCBqUXVlcnkudGlwc3kgYnkgSmFzb24gRnJhbWVcclxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAqIENvcHlyaWdodCAyMDExLTIwMTYgVHdpdHRlciwgSW5jLlxyXG4gKiBMaWNlbnNlZCB1bmRlciBNSVQgKGh0dHBzOi8vZ2l0aHViLmNvbS90d2JzL2Jvb3RzdHJhcC9ibG9iL21hc3Rlci9MSUNFTlNFKVxyXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cclxuXHJcblxyXG4rZnVuY3Rpb24gKCQpIHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG4gIC8vIFRPT0xUSVAgUFVCTElDIENMQVNTIERFRklOSVRJT05cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHZhciBUb29sdGlwID0gZnVuY3Rpb24gKGVsZW1lbnQsIG9wdGlvbnMpIHtcclxuICAgIHRoaXMudHlwZSAgICAgICA9IG51bGxcclxuICAgIHRoaXMub3B0aW9ucyAgICA9IG51bGxcclxuICAgIHRoaXMuZW5hYmxlZCAgICA9IG51bGxcclxuICAgIHRoaXMudGltZW91dCAgICA9IG51bGxcclxuICAgIHRoaXMuaG92ZXJTdGF0ZSA9IG51bGxcclxuICAgIHRoaXMuJGVsZW1lbnQgICA9IG51bGxcclxuICAgIHRoaXMuaW5TdGF0ZSAgICA9IG51bGxcclxuXHJcbiAgICB0aGlzLmluaXQoJ3Rvb2x0aXAnLCBlbGVtZW50LCBvcHRpb25zKVxyXG4gIH1cclxuXHJcbiAgVG9vbHRpcC5WRVJTSU9OICA9ICczLjMuNydcclxuXHJcbiAgVG9vbHRpcC5UUkFOU0lUSU9OX0RVUkFUSU9OID0gMTUwXHJcblxyXG4gIFRvb2x0aXAuREVGQVVMVFMgPSB7XHJcbiAgICBhbmltYXRpb246IHRydWUsXHJcbiAgICBwbGFjZW1lbnQ6ICd0b3AnLFxyXG4gICAgc2VsZWN0b3I6IGZhbHNlLFxyXG4gICAgdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwidG9vbHRpcFwiIHJvbGU9XCJ0b29sdGlwXCI+PGRpdiBjbGFzcz1cInRvb2x0aXAtYXJyb3dcIj48L2Rpdj48ZGl2IGNsYXNzPVwidG9vbHRpcC1pbm5lclwiPjwvZGl2PjwvZGl2PicsXHJcbiAgICB0cmlnZ2VyOiAnaG92ZXIgZm9jdXMnLFxyXG4gICAgdGl0bGU6ICcnLFxyXG4gICAgZGVsYXk6IDAsXHJcbiAgICBodG1sOiBmYWxzZSxcclxuICAgIGNvbnRhaW5lcjogZmFsc2UsXHJcbiAgICB2aWV3cG9ydDoge1xyXG4gICAgICBzZWxlY3RvcjogJ2JvZHknLFxyXG4gICAgICBwYWRkaW5nOiAwXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBUb29sdGlwLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gKHR5cGUsIGVsZW1lbnQsIG9wdGlvbnMpIHtcclxuICAgIHRoaXMuZW5hYmxlZCAgID0gdHJ1ZVxyXG4gICAgdGhpcy50eXBlICAgICAgPSB0eXBlXHJcbiAgICB0aGlzLiRlbGVtZW50ICA9ICQoZWxlbWVudClcclxuICAgIHRoaXMub3B0aW9ucyAgID0gdGhpcy5nZXRPcHRpb25zKG9wdGlvbnMpXHJcbiAgICB0aGlzLiR2aWV3cG9ydCA9IHRoaXMub3B0aW9ucy52aWV3cG9ydCAmJiAkKCQuaXNGdW5jdGlvbih0aGlzLm9wdGlvbnMudmlld3BvcnQpID8gdGhpcy5vcHRpb25zLnZpZXdwb3J0LmNhbGwodGhpcywgdGhpcy4kZWxlbWVudCkgOiAodGhpcy5vcHRpb25zLnZpZXdwb3J0LnNlbGVjdG9yIHx8IHRoaXMub3B0aW9ucy52aWV3cG9ydCkpXHJcbiAgICB0aGlzLmluU3RhdGUgICA9IHsgY2xpY2s6IGZhbHNlLCBob3ZlcjogZmFsc2UsIGZvY3VzOiBmYWxzZSB9XHJcblxyXG4gICAgaWYgKHRoaXMuJGVsZW1lbnRbMF0gaW5zdGFuY2VvZiBkb2N1bWVudC5jb25zdHJ1Y3RvciAmJiAhdGhpcy5vcHRpb25zLnNlbGVjdG9yKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignYHNlbGVjdG9yYCBvcHRpb24gbXVzdCBiZSBzcGVjaWZpZWQgd2hlbiBpbml0aWFsaXppbmcgJyArIHRoaXMudHlwZSArICcgb24gdGhlIHdpbmRvdy5kb2N1bWVudCBvYmplY3QhJylcclxuICAgIH1cclxuXHJcbiAgICB2YXIgdHJpZ2dlcnMgPSB0aGlzLm9wdGlvbnMudHJpZ2dlci5zcGxpdCgnICcpXHJcblxyXG4gICAgZm9yICh2YXIgaSA9IHRyaWdnZXJzLmxlbmd0aDsgaS0tOykge1xyXG4gICAgICB2YXIgdHJpZ2dlciA9IHRyaWdnZXJzW2ldXHJcblxyXG4gICAgICBpZiAodHJpZ2dlciA9PSAnY2xpY2snKSB7XHJcbiAgICAgICAgdGhpcy4kZWxlbWVudC5vbignY2xpY2suJyArIHRoaXMudHlwZSwgdGhpcy5vcHRpb25zLnNlbGVjdG9yLCAkLnByb3h5KHRoaXMudG9nZ2xlLCB0aGlzKSlcclxuICAgICAgfSBlbHNlIGlmICh0cmlnZ2VyICE9ICdtYW51YWwnKSB7XHJcbiAgICAgICAgdmFyIGV2ZW50SW4gID0gdHJpZ2dlciA9PSAnaG92ZXInID8gJ21vdXNlZW50ZXInIDogJ2ZvY3VzaW4nXHJcbiAgICAgICAgdmFyIGV2ZW50T3V0ID0gdHJpZ2dlciA9PSAnaG92ZXInID8gJ21vdXNlbGVhdmUnIDogJ2ZvY3Vzb3V0J1xyXG5cclxuICAgICAgICB0aGlzLiRlbGVtZW50Lm9uKGV2ZW50SW4gICsgJy4nICsgdGhpcy50eXBlLCB0aGlzLm9wdGlvbnMuc2VsZWN0b3IsICQucHJveHkodGhpcy5lbnRlciwgdGhpcykpXHJcbiAgICAgICAgdGhpcy4kZWxlbWVudC5vbihldmVudE91dCArICcuJyArIHRoaXMudHlwZSwgdGhpcy5vcHRpb25zLnNlbGVjdG9yLCAkLnByb3h5KHRoaXMubGVhdmUsIHRoaXMpKVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5vcHRpb25zLnNlbGVjdG9yID9cclxuICAgICAgKHRoaXMuX29wdGlvbnMgPSAkLmV4dGVuZCh7fSwgdGhpcy5vcHRpb25zLCB7IHRyaWdnZXI6ICdtYW51YWwnLCBzZWxlY3RvcjogJycgfSkpIDpcclxuICAgICAgdGhpcy5maXhUaXRsZSgpXHJcbiAgfVxyXG5cclxuICBUb29sdGlwLnByb3RvdHlwZS5nZXREZWZhdWx0cyA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiBUb29sdGlwLkRFRkFVTFRTXHJcbiAgfVxyXG5cclxuICBUb29sdGlwLnByb3RvdHlwZS5nZXRPcHRpb25zID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcclxuICAgIG9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgdGhpcy5nZXREZWZhdWx0cygpLCB0aGlzLiRlbGVtZW50LmRhdGEoKSwgb3B0aW9ucylcclxuXHJcbiAgICBpZiAob3B0aW9ucy5kZWxheSAmJiB0eXBlb2Ygb3B0aW9ucy5kZWxheSA9PSAnbnVtYmVyJykge1xyXG4gICAgICBvcHRpb25zLmRlbGF5ID0ge1xyXG4gICAgICAgIHNob3c6IG9wdGlvbnMuZGVsYXksXHJcbiAgICAgICAgaGlkZTogb3B0aW9ucy5kZWxheVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG9wdGlvbnNcclxuICB9XHJcblxyXG4gIFRvb2x0aXAucHJvdG90eXBlLmdldERlbGVnYXRlT3B0aW9ucyA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBvcHRpb25zICA9IHt9XHJcbiAgICB2YXIgZGVmYXVsdHMgPSB0aGlzLmdldERlZmF1bHRzKClcclxuXHJcbiAgICB0aGlzLl9vcHRpb25zICYmICQuZWFjaCh0aGlzLl9vcHRpb25zLCBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xyXG4gICAgICBpZiAoZGVmYXVsdHNba2V5XSAhPSB2YWx1ZSkgb3B0aW9uc1trZXldID0gdmFsdWVcclxuICAgIH0pXHJcblxyXG4gICAgcmV0dXJuIG9wdGlvbnNcclxuICB9XHJcblxyXG4gIFRvb2x0aXAucHJvdG90eXBlLmVudGVyID0gZnVuY3Rpb24gKG9iaikge1xyXG4gICAgdmFyIHNlbGYgPSBvYmogaW5zdGFuY2VvZiB0aGlzLmNvbnN0cnVjdG9yID9cclxuICAgICAgb2JqIDogJChvYmouY3VycmVudFRhcmdldCkuZGF0YSgnYnMuJyArIHRoaXMudHlwZSlcclxuXHJcbiAgICBpZiAoIXNlbGYpIHtcclxuICAgICAgc2VsZiA9IG5ldyB0aGlzLmNvbnN0cnVjdG9yKG9iai5jdXJyZW50VGFyZ2V0LCB0aGlzLmdldERlbGVnYXRlT3B0aW9ucygpKVxyXG4gICAgICAkKG9iai5jdXJyZW50VGFyZ2V0KS5kYXRhKCdicy4nICsgdGhpcy50eXBlLCBzZWxmKVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChvYmogaW5zdGFuY2VvZiAkLkV2ZW50KSB7XHJcbiAgICAgIHNlbGYuaW5TdGF0ZVtvYmoudHlwZSA9PSAnZm9jdXNpbicgPyAnZm9jdXMnIDogJ2hvdmVyJ10gPSB0cnVlXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHNlbGYudGlwKCkuaGFzQ2xhc3MoJ2luJykgfHwgc2VsZi5ob3ZlclN0YXRlID09ICdpbicpIHtcclxuICAgICAgc2VsZi5ob3ZlclN0YXRlID0gJ2luJ1xyXG4gICAgICByZXR1cm5cclxuICAgIH1cclxuXHJcbiAgICBjbGVhclRpbWVvdXQoc2VsZi50aW1lb3V0KVxyXG5cclxuICAgIHNlbGYuaG92ZXJTdGF0ZSA9ICdpbidcclxuXHJcbiAgICBpZiAoIXNlbGYub3B0aW9ucy5kZWxheSB8fCAhc2VsZi5vcHRpb25zLmRlbGF5LnNob3cpIHJldHVybiBzZWxmLnNob3coKVxyXG5cclxuICAgIHNlbGYudGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICBpZiAoc2VsZi5ob3ZlclN0YXRlID09ICdpbicpIHNlbGYuc2hvdygpXHJcbiAgICB9LCBzZWxmLm9wdGlvbnMuZGVsYXkuc2hvdylcclxuICB9XHJcblxyXG4gIFRvb2x0aXAucHJvdG90eXBlLmlzSW5TdGF0ZVRydWUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICBmb3IgKHZhciBrZXkgaW4gdGhpcy5pblN0YXRlKSB7XHJcbiAgICAgIGlmICh0aGlzLmluU3RhdGVba2V5XSkgcmV0dXJuIHRydWVcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZmFsc2VcclxuICB9XHJcblxyXG4gIFRvb2x0aXAucHJvdG90eXBlLmxlYXZlID0gZnVuY3Rpb24gKG9iaikge1xyXG4gICAgdmFyIHNlbGYgPSBvYmogaW5zdGFuY2VvZiB0aGlzLmNvbnN0cnVjdG9yID9cclxuICAgICAgb2JqIDogJChvYmouY3VycmVudFRhcmdldCkuZGF0YSgnYnMuJyArIHRoaXMudHlwZSlcclxuXHJcbiAgICBpZiAoIXNlbGYpIHtcclxuICAgICAgc2VsZiA9IG5ldyB0aGlzLmNvbnN0cnVjdG9yKG9iai5jdXJyZW50VGFyZ2V0LCB0aGlzLmdldERlbGVnYXRlT3B0aW9ucygpKVxyXG4gICAgICAkKG9iai5jdXJyZW50VGFyZ2V0KS5kYXRhKCdicy4nICsgdGhpcy50eXBlLCBzZWxmKVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChvYmogaW5zdGFuY2VvZiAkLkV2ZW50KSB7XHJcbiAgICAgIHNlbGYuaW5TdGF0ZVtvYmoudHlwZSA9PSAnZm9jdXNvdXQnID8gJ2ZvY3VzJyA6ICdob3ZlciddID0gZmFsc2VcclxuICAgIH1cclxuXHJcbiAgICBpZiAoc2VsZi5pc0luU3RhdGVUcnVlKCkpIHJldHVyblxyXG5cclxuICAgIGNsZWFyVGltZW91dChzZWxmLnRpbWVvdXQpXHJcblxyXG4gICAgc2VsZi5ob3ZlclN0YXRlID0gJ291dCdcclxuXHJcbiAgICBpZiAoIXNlbGYub3B0aW9ucy5kZWxheSB8fCAhc2VsZi5vcHRpb25zLmRlbGF5LmhpZGUpIHJldHVybiBzZWxmLmhpZGUoKVxyXG5cclxuICAgIHNlbGYudGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICBpZiAoc2VsZi5ob3ZlclN0YXRlID09ICdvdXQnKSBzZWxmLmhpZGUoKVxyXG4gICAgfSwgc2VsZi5vcHRpb25zLmRlbGF5LmhpZGUpXHJcbiAgfVxyXG5cclxuICBUb29sdGlwLnByb3RvdHlwZS5zaG93ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIGUgPSAkLkV2ZW50KCdzaG93LmJzLicgKyB0aGlzLnR5cGUpXHJcblxyXG4gICAgaWYgKHRoaXMuaGFzQ29udGVudCgpICYmIHRoaXMuZW5hYmxlZCkge1xyXG4gICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoZSlcclxuXHJcbiAgICAgIHZhciBpbkRvbSA9ICQuY29udGFpbnModGhpcy4kZWxlbWVudFswXS5vd25lckRvY3VtZW50LmRvY3VtZW50RWxlbWVudCwgdGhpcy4kZWxlbWVudFswXSlcclxuICAgICAgaWYgKGUuaXNEZWZhdWx0UHJldmVudGVkKCkgfHwgIWluRG9tKSByZXR1cm5cclxuICAgICAgdmFyIHRoYXQgPSB0aGlzXHJcblxyXG4gICAgICB2YXIgJHRpcCA9IHRoaXMudGlwKClcclxuXHJcbiAgICAgIHZhciB0aXBJZCA9IHRoaXMuZ2V0VUlEKHRoaXMudHlwZSlcclxuXHJcbiAgICAgIHRoaXMuc2V0Q29udGVudCgpXHJcbiAgICAgICR0aXAuYXR0cignaWQnLCB0aXBJZClcclxuICAgICAgdGhpcy4kZWxlbWVudC5hdHRyKCdhcmlhLWRlc2NyaWJlZGJ5JywgdGlwSWQpXHJcblxyXG4gICAgICBpZiAodGhpcy5vcHRpb25zLmFuaW1hdGlvbikgJHRpcC5hZGRDbGFzcygnZmFkZScpXHJcblxyXG4gICAgICB2YXIgcGxhY2VtZW50ID0gdHlwZW9mIHRoaXMub3B0aW9ucy5wbGFjZW1lbnQgPT0gJ2Z1bmN0aW9uJyA/XHJcbiAgICAgICAgdGhpcy5vcHRpb25zLnBsYWNlbWVudC5jYWxsKHRoaXMsICR0aXBbMF0sIHRoaXMuJGVsZW1lbnRbMF0pIDpcclxuICAgICAgICB0aGlzLm9wdGlvbnMucGxhY2VtZW50XHJcblxyXG4gICAgICB2YXIgYXV0b1Rva2VuID0gL1xccz9hdXRvP1xccz8vaVxyXG4gICAgICB2YXIgYXV0b1BsYWNlID0gYXV0b1Rva2VuLnRlc3QocGxhY2VtZW50KVxyXG4gICAgICBpZiAoYXV0b1BsYWNlKSBwbGFjZW1lbnQgPSBwbGFjZW1lbnQucmVwbGFjZShhdXRvVG9rZW4sICcnKSB8fCAndG9wJ1xyXG5cclxuICAgICAgJHRpcFxyXG4gICAgICAgIC5kZXRhY2goKVxyXG4gICAgICAgIC5jc3MoeyB0b3A6IDAsIGxlZnQ6IDAsIGRpc3BsYXk6ICdibG9jaycgfSlcclxuICAgICAgICAuYWRkQ2xhc3MocGxhY2VtZW50KVxyXG4gICAgICAgIC5kYXRhKCdicy4nICsgdGhpcy50eXBlLCB0aGlzKVxyXG5cclxuICAgICAgdGhpcy5vcHRpb25zLmNvbnRhaW5lciA/ICR0aXAuYXBwZW5kVG8odGhpcy5vcHRpb25zLmNvbnRhaW5lcikgOiAkdGlwLmluc2VydEFmdGVyKHRoaXMuJGVsZW1lbnQpXHJcbiAgICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignaW5zZXJ0ZWQuYnMuJyArIHRoaXMudHlwZSlcclxuXHJcbiAgICAgIHZhciBwb3MgICAgICAgICAgPSB0aGlzLmdldFBvc2l0aW9uKClcclxuICAgICAgdmFyIGFjdHVhbFdpZHRoICA9ICR0aXBbMF0ub2Zmc2V0V2lkdGhcclxuICAgICAgdmFyIGFjdHVhbEhlaWdodCA9ICR0aXBbMF0ub2Zmc2V0SGVpZ2h0XHJcblxyXG4gICAgICBpZiAoYXV0b1BsYWNlKSB7XHJcbiAgICAgICAgdmFyIG9yZ1BsYWNlbWVudCA9IHBsYWNlbWVudFxyXG4gICAgICAgIHZhciB2aWV3cG9ydERpbSA9IHRoaXMuZ2V0UG9zaXRpb24odGhpcy4kdmlld3BvcnQpXHJcblxyXG4gICAgICAgIHBsYWNlbWVudCA9IHBsYWNlbWVudCA9PSAnYm90dG9tJyAmJiBwb3MuYm90dG9tICsgYWN0dWFsSGVpZ2h0ID4gdmlld3BvcnREaW0uYm90dG9tID8gJ3RvcCcgICAgOlxyXG4gICAgICAgICAgICAgICAgICAgIHBsYWNlbWVudCA9PSAndG9wJyAgICAmJiBwb3MudG9wICAgIC0gYWN0dWFsSGVpZ2h0IDwgdmlld3BvcnREaW0udG9wICAgID8gJ2JvdHRvbScgOlxyXG4gICAgICAgICAgICAgICAgICAgIHBsYWNlbWVudCA9PSAncmlnaHQnICAmJiBwb3MucmlnaHQgICsgYWN0dWFsV2lkdGggID4gdmlld3BvcnREaW0ud2lkdGggID8gJ2xlZnQnICAgOlxyXG4gICAgICAgICAgICAgICAgICAgIHBsYWNlbWVudCA9PSAnbGVmdCcgICAmJiBwb3MubGVmdCAgIC0gYWN0dWFsV2lkdGggIDwgdmlld3BvcnREaW0ubGVmdCAgID8gJ3JpZ2h0JyAgOlxyXG4gICAgICAgICAgICAgICAgICAgIHBsYWNlbWVudFxyXG5cclxuICAgICAgICAkdGlwXHJcbiAgICAgICAgICAucmVtb3ZlQ2xhc3Mob3JnUGxhY2VtZW50KVxyXG4gICAgICAgICAgLmFkZENsYXNzKHBsYWNlbWVudClcclxuICAgICAgfVxyXG5cclxuICAgICAgdmFyIGNhbGN1bGF0ZWRPZmZzZXQgPSB0aGlzLmdldENhbGN1bGF0ZWRPZmZzZXQocGxhY2VtZW50LCBwb3MsIGFjdHVhbFdpZHRoLCBhY3R1YWxIZWlnaHQpXHJcblxyXG4gICAgICB0aGlzLmFwcGx5UGxhY2VtZW50KGNhbGN1bGF0ZWRPZmZzZXQsIHBsYWNlbWVudClcclxuXHJcbiAgICAgIHZhciBjb21wbGV0ZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgcHJldkhvdmVyU3RhdGUgPSB0aGF0LmhvdmVyU3RhdGVcclxuICAgICAgICB0aGF0LiRlbGVtZW50LnRyaWdnZXIoJ3Nob3duLmJzLicgKyB0aGF0LnR5cGUpXHJcbiAgICAgICAgdGhhdC5ob3ZlclN0YXRlID0gbnVsbFxyXG5cclxuICAgICAgICBpZiAocHJldkhvdmVyU3RhdGUgPT0gJ291dCcpIHRoYXQubGVhdmUodGhhdClcclxuICAgICAgfVxyXG5cclxuICAgICAgJC5zdXBwb3J0LnRyYW5zaXRpb24gJiYgdGhpcy4kdGlwLmhhc0NsYXNzKCdmYWRlJykgP1xyXG4gICAgICAgICR0aXBcclxuICAgICAgICAgIC5vbmUoJ2JzVHJhbnNpdGlvbkVuZCcsIGNvbXBsZXRlKVxyXG4gICAgICAgICAgLmVtdWxhdGVUcmFuc2l0aW9uRW5kKFRvb2x0aXAuVFJBTlNJVElPTl9EVVJBVElPTikgOlxyXG4gICAgICAgIGNvbXBsZXRlKClcclxuICAgIH1cclxuICB9XHJcblxyXG4gIFRvb2x0aXAucHJvdG90eXBlLmFwcGx5UGxhY2VtZW50ID0gZnVuY3Rpb24gKG9mZnNldCwgcGxhY2VtZW50KSB7XHJcbiAgICB2YXIgJHRpcCAgID0gdGhpcy50aXAoKVxyXG4gICAgdmFyIHdpZHRoICA9ICR0aXBbMF0ub2Zmc2V0V2lkdGhcclxuICAgIHZhciBoZWlnaHQgPSAkdGlwWzBdLm9mZnNldEhlaWdodFxyXG5cclxuICAgIC8vIG1hbnVhbGx5IHJlYWQgbWFyZ2lucyBiZWNhdXNlIGdldEJvdW5kaW5nQ2xpZW50UmVjdCBpbmNsdWRlcyBkaWZmZXJlbmNlXHJcbiAgICB2YXIgbWFyZ2luVG9wID0gcGFyc2VJbnQoJHRpcC5jc3MoJ21hcmdpbi10b3AnKSwgMTApXHJcbiAgICB2YXIgbWFyZ2luTGVmdCA9IHBhcnNlSW50KCR0aXAuY3NzKCdtYXJnaW4tbGVmdCcpLCAxMClcclxuXHJcbiAgICAvLyB3ZSBtdXN0IGNoZWNrIGZvciBOYU4gZm9yIGllIDgvOVxyXG4gICAgaWYgKGlzTmFOKG1hcmdpblRvcCkpICBtYXJnaW5Ub3AgID0gMFxyXG4gICAgaWYgKGlzTmFOKG1hcmdpbkxlZnQpKSBtYXJnaW5MZWZ0ID0gMFxyXG5cclxuICAgIG9mZnNldC50b3AgICs9IG1hcmdpblRvcFxyXG4gICAgb2Zmc2V0LmxlZnQgKz0gbWFyZ2luTGVmdFxyXG5cclxuICAgIC8vICQuZm4ub2Zmc2V0IGRvZXNuJ3Qgcm91bmQgcGl4ZWwgdmFsdWVzXHJcbiAgICAvLyBzbyB3ZSB1c2Ugc2V0T2Zmc2V0IGRpcmVjdGx5IHdpdGggb3VyIG93biBmdW5jdGlvbiBCLTBcclxuICAgICQub2Zmc2V0LnNldE9mZnNldCgkdGlwWzBdLCAkLmV4dGVuZCh7XHJcbiAgICAgIHVzaW5nOiBmdW5jdGlvbiAocHJvcHMpIHtcclxuICAgICAgICAkdGlwLmNzcyh7XHJcbiAgICAgICAgICB0b3A6IE1hdGgucm91bmQocHJvcHMudG9wKSxcclxuICAgICAgICAgIGxlZnQ6IE1hdGgucm91bmQocHJvcHMubGVmdClcclxuICAgICAgICB9KVxyXG4gICAgICB9XHJcbiAgICB9LCBvZmZzZXQpLCAwKVxyXG5cclxuICAgICR0aXAuYWRkQ2xhc3MoJ2luJylcclxuXHJcbiAgICAvLyBjaGVjayB0byBzZWUgaWYgcGxhY2luZyB0aXAgaW4gbmV3IG9mZnNldCBjYXVzZWQgdGhlIHRpcCB0byByZXNpemUgaXRzZWxmXHJcbiAgICB2YXIgYWN0dWFsV2lkdGggID0gJHRpcFswXS5vZmZzZXRXaWR0aFxyXG4gICAgdmFyIGFjdHVhbEhlaWdodCA9ICR0aXBbMF0ub2Zmc2V0SGVpZ2h0XHJcblxyXG4gICAgaWYgKHBsYWNlbWVudCA9PSAndG9wJyAmJiBhY3R1YWxIZWlnaHQgIT0gaGVpZ2h0KSB7XHJcbiAgICAgIG9mZnNldC50b3AgPSBvZmZzZXQudG9wICsgaGVpZ2h0IC0gYWN0dWFsSGVpZ2h0XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGRlbHRhID0gdGhpcy5nZXRWaWV3cG9ydEFkanVzdGVkRGVsdGEocGxhY2VtZW50LCBvZmZzZXQsIGFjdHVhbFdpZHRoLCBhY3R1YWxIZWlnaHQpXHJcblxyXG4gICAgaWYgKGRlbHRhLmxlZnQpIG9mZnNldC5sZWZ0ICs9IGRlbHRhLmxlZnRcclxuICAgIGVsc2Ugb2Zmc2V0LnRvcCArPSBkZWx0YS50b3BcclxuXHJcbiAgICB2YXIgaXNWZXJ0aWNhbCAgICAgICAgICA9IC90b3B8Ym90dG9tLy50ZXN0KHBsYWNlbWVudClcclxuICAgIHZhciBhcnJvd0RlbHRhICAgICAgICAgID0gaXNWZXJ0aWNhbCA/IGRlbHRhLmxlZnQgKiAyIC0gd2lkdGggKyBhY3R1YWxXaWR0aCA6IGRlbHRhLnRvcCAqIDIgLSBoZWlnaHQgKyBhY3R1YWxIZWlnaHRcclxuICAgIHZhciBhcnJvd09mZnNldFBvc2l0aW9uID0gaXNWZXJ0aWNhbCA/ICdvZmZzZXRXaWR0aCcgOiAnb2Zmc2V0SGVpZ2h0J1xyXG5cclxuICAgICR0aXAub2Zmc2V0KG9mZnNldClcclxuICAgIHRoaXMucmVwbGFjZUFycm93KGFycm93RGVsdGEsICR0aXBbMF1bYXJyb3dPZmZzZXRQb3NpdGlvbl0sIGlzVmVydGljYWwpXHJcbiAgfVxyXG5cclxuICBUb29sdGlwLnByb3RvdHlwZS5yZXBsYWNlQXJyb3cgPSBmdW5jdGlvbiAoZGVsdGEsIGRpbWVuc2lvbiwgaXNWZXJ0aWNhbCkge1xyXG4gICAgdGhpcy5hcnJvdygpXHJcbiAgICAgIC5jc3MoaXNWZXJ0aWNhbCA/ICdsZWZ0JyA6ICd0b3AnLCA1MCAqICgxIC0gZGVsdGEgLyBkaW1lbnNpb24pICsgJyUnKVxyXG4gICAgICAuY3NzKGlzVmVydGljYWwgPyAndG9wJyA6ICdsZWZ0JywgJycpXHJcbiAgfVxyXG5cclxuICBUb29sdGlwLnByb3RvdHlwZS5zZXRDb250ZW50ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyICR0aXAgID0gdGhpcy50aXAoKVxyXG4gICAgdmFyIHRpdGxlID0gdGhpcy5nZXRUaXRsZSgpXHJcblxyXG4gICAgJHRpcC5maW5kKCcudG9vbHRpcC1pbm5lcicpW3RoaXMub3B0aW9ucy5odG1sID8gJ2h0bWwnIDogJ3RleHQnXSh0aXRsZSlcclxuICAgICR0aXAucmVtb3ZlQ2xhc3MoJ2ZhZGUgaW4gdG9wIGJvdHRvbSBsZWZ0IHJpZ2h0JylcclxuICB9XHJcblxyXG4gIFRvb2x0aXAucHJvdG90eXBlLmhpZGUgPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcclxuICAgIHZhciB0aGF0ID0gdGhpc1xyXG4gICAgdmFyICR0aXAgPSAkKHRoaXMuJHRpcClcclxuICAgIHZhciBlICAgID0gJC5FdmVudCgnaGlkZS5icy4nICsgdGhpcy50eXBlKVxyXG5cclxuICAgIGZ1bmN0aW9uIGNvbXBsZXRlKCkge1xyXG4gICAgICBpZiAodGhhdC5ob3ZlclN0YXRlICE9ICdpbicpICR0aXAuZGV0YWNoKClcclxuICAgICAgaWYgKHRoYXQuJGVsZW1lbnQpIHsgLy8gVE9ETzogQ2hlY2sgd2hldGhlciBndWFyZGluZyB0aGlzIGNvZGUgd2l0aCB0aGlzIGBpZmAgaXMgcmVhbGx5IG5lY2Vzc2FyeS5cclxuICAgICAgICB0aGF0LiRlbGVtZW50XHJcbiAgICAgICAgICAucmVtb3ZlQXR0cignYXJpYS1kZXNjcmliZWRieScpXHJcbiAgICAgICAgICAudHJpZ2dlcignaGlkZGVuLmJzLicgKyB0aGF0LnR5cGUpXHJcbiAgICAgIH1cclxuICAgICAgY2FsbGJhY2sgJiYgY2FsbGJhY2soKVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcihlKVxyXG5cclxuICAgIGlmIChlLmlzRGVmYXVsdFByZXZlbnRlZCgpKSByZXR1cm5cclxuXHJcbiAgICAkdGlwLnJlbW92ZUNsYXNzKCdpbicpXHJcblxyXG4gICAgJC5zdXBwb3J0LnRyYW5zaXRpb24gJiYgJHRpcC5oYXNDbGFzcygnZmFkZScpID9cclxuICAgICAgJHRpcFxyXG4gICAgICAgIC5vbmUoJ2JzVHJhbnNpdGlvbkVuZCcsIGNvbXBsZXRlKVxyXG4gICAgICAgIC5lbXVsYXRlVHJhbnNpdGlvbkVuZChUb29sdGlwLlRSQU5TSVRJT05fRFVSQVRJT04pIDpcclxuICAgICAgY29tcGxldGUoKVxyXG5cclxuICAgIHRoaXMuaG92ZXJTdGF0ZSA9IG51bGxcclxuXHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cclxuXHJcbiAgVG9vbHRpcC5wcm90b3R5cGUuZml4VGl0bGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgJGUgPSB0aGlzLiRlbGVtZW50XHJcbiAgICBpZiAoJGUuYXR0cigndGl0bGUnKSB8fCB0eXBlb2YgJGUuYXR0cignZGF0YS1vcmlnaW5hbC10aXRsZScpICE9ICdzdHJpbmcnKSB7XHJcbiAgICAgICRlLmF0dHIoJ2RhdGEtb3JpZ2luYWwtdGl0bGUnLCAkZS5hdHRyKCd0aXRsZScpIHx8ICcnKS5hdHRyKCd0aXRsZScsICcnKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgVG9vbHRpcC5wcm90b3R5cGUuaGFzQ29udGVudCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiB0aGlzLmdldFRpdGxlKClcclxuICB9XHJcblxyXG4gIFRvb2x0aXAucHJvdG90eXBlLmdldFBvc2l0aW9uID0gZnVuY3Rpb24gKCRlbGVtZW50KSB7XHJcbiAgICAkZWxlbWVudCAgID0gJGVsZW1lbnQgfHwgdGhpcy4kZWxlbWVudFxyXG5cclxuICAgIHZhciBlbCAgICAgPSAkZWxlbWVudFswXVxyXG4gICAgdmFyIGlzQm9keSA9IGVsLnRhZ05hbWUgPT0gJ0JPRFknXHJcblxyXG4gICAgdmFyIGVsUmVjdCAgICA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXHJcbiAgICBpZiAoZWxSZWN0LndpZHRoID09IG51bGwpIHtcclxuICAgICAgLy8gd2lkdGggYW5kIGhlaWdodCBhcmUgbWlzc2luZyBpbiBJRTgsIHNvIGNvbXB1dGUgdGhlbSBtYW51YWxseTsgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS90d2JzL2Jvb3RzdHJhcC9pc3N1ZXMvMTQwOTNcclxuICAgICAgZWxSZWN0ID0gJC5leHRlbmQoe30sIGVsUmVjdCwgeyB3aWR0aDogZWxSZWN0LnJpZ2h0IC0gZWxSZWN0LmxlZnQsIGhlaWdodDogZWxSZWN0LmJvdHRvbSAtIGVsUmVjdC50b3AgfSlcclxuICAgIH1cclxuICAgIHZhciBpc1N2ZyA9IHdpbmRvdy5TVkdFbGVtZW50ICYmIGVsIGluc3RhbmNlb2Ygd2luZG93LlNWR0VsZW1lbnRcclxuICAgIC8vIEF2b2lkIHVzaW5nICQub2Zmc2V0KCkgb24gU1ZHcyBzaW5jZSBpdCBnaXZlcyBpbmNvcnJlY3QgcmVzdWx0cyBpbiBqUXVlcnkgMy5cclxuICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vdHdicy9ib290c3RyYXAvaXNzdWVzLzIwMjgwXHJcbiAgICB2YXIgZWxPZmZzZXQgID0gaXNCb2R5ID8geyB0b3A6IDAsIGxlZnQ6IDAgfSA6IChpc1N2ZyA/IG51bGwgOiAkZWxlbWVudC5vZmZzZXQoKSlcclxuICAgIHZhciBzY3JvbGwgICAgPSB7IHNjcm9sbDogaXNCb2R5ID8gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcCB8fCBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcCA6ICRlbGVtZW50LnNjcm9sbFRvcCgpIH1cclxuICAgIHZhciBvdXRlckRpbXMgPSBpc0JvZHkgPyB7IHdpZHRoOiAkKHdpbmRvdykud2lkdGgoKSwgaGVpZ2h0OiAkKHdpbmRvdykuaGVpZ2h0KCkgfSA6IG51bGxcclxuXHJcbiAgICByZXR1cm4gJC5leHRlbmQoe30sIGVsUmVjdCwgc2Nyb2xsLCBvdXRlckRpbXMsIGVsT2Zmc2V0KVxyXG4gIH1cclxuXHJcbiAgVG9vbHRpcC5wcm90b3R5cGUuZ2V0Q2FsY3VsYXRlZE9mZnNldCA9IGZ1bmN0aW9uIChwbGFjZW1lbnQsIHBvcywgYWN0dWFsV2lkdGgsIGFjdHVhbEhlaWdodCkge1xyXG4gICAgcmV0dXJuIHBsYWNlbWVudCA9PSAnYm90dG9tJyA/IHsgdG9wOiBwb3MudG9wICsgcG9zLmhlaWdodCwgICBsZWZ0OiBwb3MubGVmdCArIHBvcy53aWR0aCAvIDIgLSBhY3R1YWxXaWR0aCAvIDIgfSA6XHJcbiAgICAgICAgICAgcGxhY2VtZW50ID09ICd0b3AnICAgID8geyB0b3A6IHBvcy50b3AgLSBhY3R1YWxIZWlnaHQsIGxlZnQ6IHBvcy5sZWZ0ICsgcG9zLndpZHRoIC8gMiAtIGFjdHVhbFdpZHRoIC8gMiB9IDpcclxuICAgICAgICAgICBwbGFjZW1lbnQgPT0gJ2xlZnQnICAgPyB7IHRvcDogcG9zLnRvcCArIHBvcy5oZWlnaHQgLyAyIC0gYWN0dWFsSGVpZ2h0IC8gMiwgbGVmdDogcG9zLmxlZnQgLSBhY3R1YWxXaWR0aCB9IDpcclxuICAgICAgICAvKiBwbGFjZW1lbnQgPT0gJ3JpZ2h0JyAqLyB7IHRvcDogcG9zLnRvcCArIHBvcy5oZWlnaHQgLyAyIC0gYWN0dWFsSGVpZ2h0IC8gMiwgbGVmdDogcG9zLmxlZnQgKyBwb3Mud2lkdGggfVxyXG5cclxuICB9XHJcblxyXG4gIFRvb2x0aXAucHJvdG90eXBlLmdldFZpZXdwb3J0QWRqdXN0ZWREZWx0YSA9IGZ1bmN0aW9uIChwbGFjZW1lbnQsIHBvcywgYWN0dWFsV2lkdGgsIGFjdHVhbEhlaWdodCkge1xyXG4gICAgdmFyIGRlbHRhID0geyB0b3A6IDAsIGxlZnQ6IDAgfVxyXG4gICAgaWYgKCF0aGlzLiR2aWV3cG9ydCkgcmV0dXJuIGRlbHRhXHJcblxyXG4gICAgdmFyIHZpZXdwb3J0UGFkZGluZyA9IHRoaXMub3B0aW9ucy52aWV3cG9ydCAmJiB0aGlzLm9wdGlvbnMudmlld3BvcnQucGFkZGluZyB8fCAwXHJcbiAgICB2YXIgdmlld3BvcnREaW1lbnNpb25zID0gdGhpcy5nZXRQb3NpdGlvbih0aGlzLiR2aWV3cG9ydClcclxuXHJcbiAgICBpZiAoL3JpZ2h0fGxlZnQvLnRlc3QocGxhY2VtZW50KSkge1xyXG4gICAgICB2YXIgdG9wRWRnZU9mZnNldCAgICA9IHBvcy50b3AgLSB2aWV3cG9ydFBhZGRpbmcgLSB2aWV3cG9ydERpbWVuc2lvbnMuc2Nyb2xsXHJcbiAgICAgIHZhciBib3R0b21FZGdlT2Zmc2V0ID0gcG9zLnRvcCArIHZpZXdwb3J0UGFkZGluZyAtIHZpZXdwb3J0RGltZW5zaW9ucy5zY3JvbGwgKyBhY3R1YWxIZWlnaHRcclxuICAgICAgaWYgKHRvcEVkZ2VPZmZzZXQgPCB2aWV3cG9ydERpbWVuc2lvbnMudG9wKSB7IC8vIHRvcCBvdmVyZmxvd1xyXG4gICAgICAgIGRlbHRhLnRvcCA9IHZpZXdwb3J0RGltZW5zaW9ucy50b3AgLSB0b3BFZGdlT2Zmc2V0XHJcbiAgICAgIH0gZWxzZSBpZiAoYm90dG9tRWRnZU9mZnNldCA+IHZpZXdwb3J0RGltZW5zaW9ucy50b3AgKyB2aWV3cG9ydERpbWVuc2lvbnMuaGVpZ2h0KSB7IC8vIGJvdHRvbSBvdmVyZmxvd1xyXG4gICAgICAgIGRlbHRhLnRvcCA9IHZpZXdwb3J0RGltZW5zaW9ucy50b3AgKyB2aWV3cG9ydERpbWVuc2lvbnMuaGVpZ2h0IC0gYm90dG9tRWRnZU9mZnNldFxyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB2YXIgbGVmdEVkZ2VPZmZzZXQgID0gcG9zLmxlZnQgLSB2aWV3cG9ydFBhZGRpbmdcclxuICAgICAgdmFyIHJpZ2h0RWRnZU9mZnNldCA9IHBvcy5sZWZ0ICsgdmlld3BvcnRQYWRkaW5nICsgYWN0dWFsV2lkdGhcclxuICAgICAgaWYgKGxlZnRFZGdlT2Zmc2V0IDwgdmlld3BvcnREaW1lbnNpb25zLmxlZnQpIHsgLy8gbGVmdCBvdmVyZmxvd1xyXG4gICAgICAgIGRlbHRhLmxlZnQgPSB2aWV3cG9ydERpbWVuc2lvbnMubGVmdCAtIGxlZnRFZGdlT2Zmc2V0XHJcbiAgICAgIH0gZWxzZSBpZiAocmlnaHRFZGdlT2Zmc2V0ID4gdmlld3BvcnREaW1lbnNpb25zLnJpZ2h0KSB7IC8vIHJpZ2h0IG92ZXJmbG93XHJcbiAgICAgICAgZGVsdGEubGVmdCA9IHZpZXdwb3J0RGltZW5zaW9ucy5sZWZ0ICsgdmlld3BvcnREaW1lbnNpb25zLndpZHRoIC0gcmlnaHRFZGdlT2Zmc2V0XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZGVsdGFcclxuICB9XHJcblxyXG4gIFRvb2x0aXAucHJvdG90eXBlLmdldFRpdGxlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIHRpdGxlXHJcbiAgICB2YXIgJGUgPSB0aGlzLiRlbGVtZW50XHJcbiAgICB2YXIgbyAgPSB0aGlzLm9wdGlvbnNcclxuXHJcbiAgICB0aXRsZSA9ICRlLmF0dHIoJ2RhdGEtb3JpZ2luYWwtdGl0bGUnKVxyXG4gICAgICB8fCAodHlwZW9mIG8udGl0bGUgPT0gJ2Z1bmN0aW9uJyA/IG8udGl0bGUuY2FsbCgkZVswXSkgOiAgby50aXRsZSlcclxuXHJcbiAgICByZXR1cm4gdGl0bGVcclxuICB9XHJcblxyXG4gIFRvb2x0aXAucHJvdG90eXBlLmdldFVJRCA9IGZ1bmN0aW9uIChwcmVmaXgpIHtcclxuICAgIGRvIHByZWZpeCArPSB+fihNYXRoLnJhbmRvbSgpICogMTAwMDAwMClcclxuICAgIHdoaWxlIChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChwcmVmaXgpKVxyXG4gICAgcmV0dXJuIHByZWZpeFxyXG4gIH1cclxuXHJcbiAgVG9vbHRpcC5wcm90b3R5cGUudGlwID0gZnVuY3Rpb24gKCkge1xyXG4gICAgaWYgKCF0aGlzLiR0aXApIHtcclxuICAgICAgdGhpcy4kdGlwID0gJCh0aGlzLm9wdGlvbnMudGVtcGxhdGUpXHJcbiAgICAgIGlmICh0aGlzLiR0aXAubGVuZ3RoICE9IDEpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IodGhpcy50eXBlICsgJyBgdGVtcGxhdGVgIG9wdGlvbiBtdXN0IGNvbnNpc3Qgb2YgZXhhY3RseSAxIHRvcC1sZXZlbCBlbGVtZW50IScpXHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzLiR0aXBcclxuICB9XHJcblxyXG4gIFRvb2x0aXAucHJvdG90eXBlLmFycm93ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuICh0aGlzLiRhcnJvdyA9IHRoaXMuJGFycm93IHx8IHRoaXMudGlwKCkuZmluZCgnLnRvb2x0aXAtYXJyb3cnKSlcclxuICB9XHJcblxyXG4gIFRvb2x0aXAucHJvdG90eXBlLmVuYWJsZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMuZW5hYmxlZCA9IHRydWVcclxuICB9XHJcblxyXG4gIFRvb2x0aXAucHJvdG90eXBlLmRpc2FibGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLmVuYWJsZWQgPSBmYWxzZVxyXG4gIH1cclxuXHJcbiAgVG9vbHRpcC5wcm90b3R5cGUudG9nZ2xlRW5hYmxlZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMuZW5hYmxlZCA9ICF0aGlzLmVuYWJsZWRcclxuICB9XHJcblxyXG4gIFRvb2x0aXAucHJvdG90eXBlLnRvZ2dsZSA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICB2YXIgc2VsZiA9IHRoaXNcclxuICAgIGlmIChlKSB7XHJcbiAgICAgIHNlbGYgPSAkKGUuY3VycmVudFRhcmdldCkuZGF0YSgnYnMuJyArIHRoaXMudHlwZSlcclxuICAgICAgaWYgKCFzZWxmKSB7XHJcbiAgICAgICAgc2VsZiA9IG5ldyB0aGlzLmNvbnN0cnVjdG9yKGUuY3VycmVudFRhcmdldCwgdGhpcy5nZXREZWxlZ2F0ZU9wdGlvbnMoKSlcclxuICAgICAgICAkKGUuY3VycmVudFRhcmdldCkuZGF0YSgnYnMuJyArIHRoaXMudHlwZSwgc2VsZilcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChlKSB7XHJcbiAgICAgIHNlbGYuaW5TdGF0ZS5jbGljayA9ICFzZWxmLmluU3RhdGUuY2xpY2tcclxuICAgICAgaWYgKHNlbGYuaXNJblN0YXRlVHJ1ZSgpKSBzZWxmLmVudGVyKHNlbGYpXHJcbiAgICAgIGVsc2Ugc2VsZi5sZWF2ZShzZWxmKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc2VsZi50aXAoKS5oYXNDbGFzcygnaW4nKSA/IHNlbGYubGVhdmUoc2VsZikgOiBzZWxmLmVudGVyKHNlbGYpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBUb29sdGlwLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzXHJcbiAgICBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0KVxyXG4gICAgdGhpcy5oaWRlKGZ1bmN0aW9uICgpIHtcclxuICAgICAgdGhhdC4kZWxlbWVudC5vZmYoJy4nICsgdGhhdC50eXBlKS5yZW1vdmVEYXRhKCdicy4nICsgdGhhdC50eXBlKVxyXG4gICAgICBpZiAodGhhdC4kdGlwKSB7XHJcbiAgICAgICAgdGhhdC4kdGlwLmRldGFjaCgpXHJcbiAgICAgIH1cclxuICAgICAgdGhhdC4kdGlwID0gbnVsbFxyXG4gICAgICB0aGF0LiRhcnJvdyA9IG51bGxcclxuICAgICAgdGhhdC4kdmlld3BvcnQgPSBudWxsXHJcbiAgICAgIHRoYXQuJGVsZW1lbnQgPSBudWxsXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcblxyXG4gIC8vIFRPT0xUSVAgUExVR0lOIERFRklOSVRJT05cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIGZ1bmN0aW9uIFBsdWdpbihvcHRpb24pIHtcclxuICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICB2YXIgJHRoaXMgICA9ICQodGhpcylcclxuICAgICAgdmFyIGRhdGEgICAgPSAkdGhpcy5kYXRhKCdicy50b29sdGlwJylcclxuICAgICAgdmFyIG9wdGlvbnMgPSB0eXBlb2Ygb3B0aW9uID09ICdvYmplY3QnICYmIG9wdGlvblxyXG5cclxuICAgICAgaWYgKCFkYXRhICYmIC9kZXN0cm95fGhpZGUvLnRlc3Qob3B0aW9uKSkgcmV0dXJuXHJcbiAgICAgIGlmICghZGF0YSkgJHRoaXMuZGF0YSgnYnMudG9vbHRpcCcsIChkYXRhID0gbmV3IFRvb2x0aXAodGhpcywgb3B0aW9ucykpKVxyXG4gICAgICBpZiAodHlwZW9mIG9wdGlvbiA9PSAnc3RyaW5nJykgZGF0YVtvcHRpb25dKClcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICB2YXIgb2xkID0gJC5mbi50b29sdGlwXHJcblxyXG4gICQuZm4udG9vbHRpcCAgICAgICAgICAgICA9IFBsdWdpblxyXG4gICQuZm4udG9vbHRpcC5Db25zdHJ1Y3RvciA9IFRvb2x0aXBcclxuXHJcblxyXG4gIC8vIFRPT0xUSVAgTk8gQ09ORkxJQ1RcclxuICAvLyA9PT09PT09PT09PT09PT09PT09XHJcblxyXG4gICQuZm4udG9vbHRpcC5ub0NvbmZsaWN0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgJC5mbi50b29sdGlwID0gb2xkXHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cclxuXHJcbn0oalF1ZXJ5KTtcclxuXHJcbi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gKiBCb290c3RyYXA6IHBvcG92ZXIuanMgdjMuMy43XHJcbiAqIGh0dHA6Ly9nZXRib290c3RyYXAuY29tL2phdmFzY3JpcHQvI3BvcG92ZXJzXHJcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gKiBDb3B5cmlnaHQgMjAxMS0yMDE2IFR3aXR0ZXIsIEluYy5cclxuICogTGljZW5zZWQgdW5kZXIgTUlUIChodHRwczovL2dpdGh1Yi5jb20vdHdicy9ib290c3RyYXAvYmxvYi9tYXN0ZXIvTElDRU5TRSlcclxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXHJcblxyXG5cclxuK2Z1bmN0aW9uICgkKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAvLyBQT1BPVkVSIFBVQkxJQyBDTEFTUyBERUZJTklUSU9OXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICB2YXIgUG9wb3ZlciA9IGZ1bmN0aW9uIChlbGVtZW50LCBvcHRpb25zKSB7XHJcbiAgICB0aGlzLmluaXQoJ3BvcG92ZXInLCBlbGVtZW50LCBvcHRpb25zKVxyXG4gIH1cclxuXHJcbiAgaWYgKCEkLmZuLnRvb2x0aXApIHRocm93IG5ldyBFcnJvcignUG9wb3ZlciByZXF1aXJlcyB0b29sdGlwLmpzJylcclxuXHJcbiAgUG9wb3Zlci5WRVJTSU9OICA9ICczLjMuNydcclxuXHJcbiAgUG9wb3Zlci5ERUZBVUxUUyA9ICQuZXh0ZW5kKHt9LCAkLmZuLnRvb2x0aXAuQ29uc3RydWN0b3IuREVGQVVMVFMsIHtcclxuICAgIHBsYWNlbWVudDogJ3JpZ2h0JyxcclxuICAgIHRyaWdnZXI6ICdjbGljaycsXHJcbiAgICBjb250ZW50OiAnJyxcclxuICAgIHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cInBvcG92ZXJcIiByb2xlPVwidG9vbHRpcFwiPjxkaXYgY2xhc3M9XCJhcnJvd1wiPjwvZGl2PjxoMyBjbGFzcz1cInBvcG92ZXItdGl0bGVcIj48L2gzPjxkaXYgY2xhc3M9XCJwb3BvdmVyLWNvbnRlbnRcIj48L2Rpdj48L2Rpdj4nXHJcbiAgfSlcclxuXHJcblxyXG4gIC8vIE5PVEU6IFBPUE9WRVIgRVhURU5EUyB0b29sdGlwLmpzXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgUG9wb3Zlci5wcm90b3R5cGUgPSAkLmV4dGVuZCh7fSwgJC5mbi50b29sdGlwLkNvbnN0cnVjdG9yLnByb3RvdHlwZSlcclxuXHJcbiAgUG9wb3Zlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBQb3BvdmVyXHJcblxyXG4gIFBvcG92ZXIucHJvdG90eXBlLmdldERlZmF1bHRzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIFBvcG92ZXIuREVGQVVMVFNcclxuICB9XHJcblxyXG4gIFBvcG92ZXIucHJvdG90eXBlLnNldENvbnRlbnQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgJHRpcCAgICA9IHRoaXMudGlwKClcclxuICAgIHZhciB0aXRsZSAgID0gdGhpcy5nZXRUaXRsZSgpXHJcbiAgICB2YXIgY29udGVudCA9IHRoaXMuZ2V0Q29udGVudCgpXHJcblxyXG4gICAgJHRpcC5maW5kKCcucG9wb3Zlci10aXRsZScpW3RoaXMub3B0aW9ucy5odG1sID8gJ2h0bWwnIDogJ3RleHQnXSh0aXRsZSlcclxuICAgICR0aXAuZmluZCgnLnBvcG92ZXItY29udGVudCcpLmNoaWxkcmVuKCkuZGV0YWNoKCkuZW5kKClbIC8vIHdlIHVzZSBhcHBlbmQgZm9yIGh0bWwgb2JqZWN0cyB0byBtYWludGFpbiBqcyBldmVudHNcclxuICAgICAgdGhpcy5vcHRpb25zLmh0bWwgPyAodHlwZW9mIGNvbnRlbnQgPT0gJ3N0cmluZycgPyAnaHRtbCcgOiAnYXBwZW5kJykgOiAndGV4dCdcclxuICAgIF0oY29udGVudClcclxuXHJcbiAgICAkdGlwLnJlbW92ZUNsYXNzKCdmYWRlIHRvcCBib3R0b20gbGVmdCByaWdodCBpbicpXHJcblxyXG4gICAgLy8gSUU4IGRvZXNuJ3QgYWNjZXB0IGhpZGluZyB2aWEgdGhlIGA6ZW1wdHlgIHBzZXVkbyBzZWxlY3Rvciwgd2UgaGF2ZSB0byBkb1xyXG4gICAgLy8gdGhpcyBtYW51YWxseSBieSBjaGVja2luZyB0aGUgY29udGVudHMuXHJcbiAgICBpZiAoISR0aXAuZmluZCgnLnBvcG92ZXItdGl0bGUnKS5odG1sKCkpICR0aXAuZmluZCgnLnBvcG92ZXItdGl0bGUnKS5oaWRlKClcclxuICB9XHJcblxyXG4gIFBvcG92ZXIucHJvdG90eXBlLmhhc0NvbnRlbnQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5nZXRUaXRsZSgpIHx8IHRoaXMuZ2V0Q29udGVudCgpXHJcbiAgfVxyXG5cclxuICBQb3BvdmVyLnByb3RvdHlwZS5nZXRDb250ZW50ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyICRlID0gdGhpcy4kZWxlbWVudFxyXG4gICAgdmFyIG8gID0gdGhpcy5vcHRpb25zXHJcblxyXG4gICAgcmV0dXJuICRlLmF0dHIoJ2RhdGEtY29udGVudCcpXHJcbiAgICAgIHx8ICh0eXBlb2Ygby5jb250ZW50ID09ICdmdW5jdGlvbicgP1xyXG4gICAgICAgICAgICBvLmNvbnRlbnQuY2FsbCgkZVswXSkgOlxyXG4gICAgICAgICAgICBvLmNvbnRlbnQpXHJcbiAgfVxyXG5cclxuICBQb3BvdmVyLnByb3RvdHlwZS5hcnJvdyA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiAodGhpcy4kYXJyb3cgPSB0aGlzLiRhcnJvdyB8fCB0aGlzLnRpcCgpLmZpbmQoJy5hcnJvdycpKVxyXG4gIH1cclxuXHJcblxyXG4gIC8vIFBPUE9WRVIgUExVR0lOIERFRklOSVRJT05cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIGZ1bmN0aW9uIFBsdWdpbihvcHRpb24pIHtcclxuICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICB2YXIgJHRoaXMgICA9ICQodGhpcylcclxuICAgICAgdmFyIGRhdGEgICAgPSAkdGhpcy5kYXRhKCdicy5wb3BvdmVyJylcclxuICAgICAgdmFyIG9wdGlvbnMgPSB0eXBlb2Ygb3B0aW9uID09ICdvYmplY3QnICYmIG9wdGlvblxyXG5cclxuICAgICAgaWYgKCFkYXRhICYmIC9kZXN0cm95fGhpZGUvLnRlc3Qob3B0aW9uKSkgcmV0dXJuXHJcbiAgICAgIGlmICghZGF0YSkgJHRoaXMuZGF0YSgnYnMucG9wb3ZlcicsIChkYXRhID0gbmV3IFBvcG92ZXIodGhpcywgb3B0aW9ucykpKVxyXG4gICAgICBpZiAodHlwZW9mIG9wdGlvbiA9PSAnc3RyaW5nJykgZGF0YVtvcHRpb25dKClcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICB2YXIgb2xkID0gJC5mbi5wb3BvdmVyXHJcblxyXG4gICQuZm4ucG9wb3ZlciAgICAgICAgICAgICA9IFBsdWdpblxyXG4gICQuZm4ucG9wb3Zlci5Db25zdHJ1Y3RvciA9IFBvcG92ZXJcclxuXHJcblxyXG4gIC8vIFBPUE9WRVIgTk8gQ09ORkxJQ1RcclxuICAvLyA9PT09PT09PT09PT09PT09PT09XHJcblxyXG4gICQuZm4ucG9wb3Zlci5ub0NvbmZsaWN0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgJC5mbi5wb3BvdmVyID0gb2xkXHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cclxuXHJcbn0oalF1ZXJ5KTtcclxuXHJcbi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gKiBCb290c3RyYXA6IHNjcm9sbHNweS5qcyB2My4zLjdcclxuICogaHR0cDovL2dldGJvb3RzdHJhcC5jb20vamF2YXNjcmlwdC8jc2Nyb2xsc3B5XHJcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gKiBDb3B5cmlnaHQgMjAxMS0yMDE2IFR3aXR0ZXIsIEluYy5cclxuICogTGljZW5zZWQgdW5kZXIgTUlUIChodHRwczovL2dpdGh1Yi5jb20vdHdicy9ib290c3RyYXAvYmxvYi9tYXN0ZXIvTElDRU5TRSlcclxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXHJcblxyXG5cclxuK2Z1bmN0aW9uICgkKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAvLyBTQ1JPTExTUFkgQ0xBU1MgREVGSU5JVElPTlxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIGZ1bmN0aW9uIFNjcm9sbFNweShlbGVtZW50LCBvcHRpb25zKSB7XHJcbiAgICB0aGlzLiRib2R5ICAgICAgICAgID0gJChkb2N1bWVudC5ib2R5KVxyXG4gICAgdGhpcy4kc2Nyb2xsRWxlbWVudCA9ICQoZWxlbWVudCkuaXMoZG9jdW1lbnQuYm9keSkgPyAkKHdpbmRvdykgOiAkKGVsZW1lbnQpXHJcbiAgICB0aGlzLm9wdGlvbnMgICAgICAgID0gJC5leHRlbmQoe30sIFNjcm9sbFNweS5ERUZBVUxUUywgb3B0aW9ucylcclxuICAgIHRoaXMuc2VsZWN0b3IgICAgICAgPSAodGhpcy5vcHRpb25zLnRhcmdldCB8fCAnJykgKyAnIC5uYXYgbGkgPiBhJ1xyXG4gICAgdGhpcy5vZmZzZXRzICAgICAgICA9IFtdXHJcbiAgICB0aGlzLnRhcmdldHMgICAgICAgID0gW11cclxuICAgIHRoaXMuYWN0aXZlVGFyZ2V0ICAgPSBudWxsXHJcbiAgICB0aGlzLnNjcm9sbEhlaWdodCAgID0gMFxyXG5cclxuICAgIHRoaXMuJHNjcm9sbEVsZW1lbnQub24oJ3Njcm9sbC5icy5zY3JvbGxzcHknLCAkLnByb3h5KHRoaXMucHJvY2VzcywgdGhpcykpXHJcbiAgICB0aGlzLnJlZnJlc2goKVxyXG4gICAgdGhpcy5wcm9jZXNzKClcclxuICB9XHJcblxyXG4gIFNjcm9sbFNweS5WRVJTSU9OICA9ICczLjMuNydcclxuXHJcbiAgU2Nyb2xsU3B5LkRFRkFVTFRTID0ge1xyXG4gICAgb2Zmc2V0OiAxMFxyXG4gIH1cclxuXHJcbiAgU2Nyb2xsU3B5LnByb3RvdHlwZS5nZXRTY3JvbGxIZWlnaHQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy4kc2Nyb2xsRWxlbWVudFswXS5zY3JvbGxIZWlnaHQgfHwgTWF0aC5tYXgodGhpcy4kYm9keVswXS5zY3JvbGxIZWlnaHQsIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxIZWlnaHQpXHJcbiAgfVxyXG5cclxuICBTY3JvbGxTcHkucHJvdG90eXBlLnJlZnJlc2ggPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgdGhhdCAgICAgICAgICA9IHRoaXNcclxuICAgIHZhciBvZmZzZXRNZXRob2QgID0gJ29mZnNldCdcclxuICAgIHZhciBvZmZzZXRCYXNlICAgID0gMFxyXG5cclxuICAgIHRoaXMub2Zmc2V0cyAgICAgID0gW11cclxuICAgIHRoaXMudGFyZ2V0cyAgICAgID0gW11cclxuICAgIHRoaXMuc2Nyb2xsSGVpZ2h0ID0gdGhpcy5nZXRTY3JvbGxIZWlnaHQoKVxyXG5cclxuICAgIGlmICghJC5pc1dpbmRvdyh0aGlzLiRzY3JvbGxFbGVtZW50WzBdKSkge1xyXG4gICAgICBvZmZzZXRNZXRob2QgPSAncG9zaXRpb24nXHJcbiAgICAgIG9mZnNldEJhc2UgICA9IHRoaXMuJHNjcm9sbEVsZW1lbnQuc2Nyb2xsVG9wKClcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLiRib2R5XHJcbiAgICAgIC5maW5kKHRoaXMuc2VsZWN0b3IpXHJcbiAgICAgIC5tYXAoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciAkZWwgICA9ICQodGhpcylcclxuICAgICAgICB2YXIgaHJlZiAgPSAkZWwuZGF0YSgndGFyZ2V0JykgfHwgJGVsLmF0dHIoJ2hyZWYnKVxyXG4gICAgICAgIHZhciAkaHJlZiA9IC9eIy4vLnRlc3QoaHJlZikgJiYgJChocmVmKVxyXG5cclxuICAgICAgICByZXR1cm4gKCRocmVmXHJcbiAgICAgICAgICAmJiAkaHJlZi5sZW5ndGhcclxuICAgICAgICAgICYmICRocmVmLmlzKCc6dmlzaWJsZScpXHJcbiAgICAgICAgICAmJiBbWyRocmVmW29mZnNldE1ldGhvZF0oKS50b3AgKyBvZmZzZXRCYXNlLCBocmVmXV0pIHx8IG51bGxcclxuICAgICAgfSlcclxuICAgICAgLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHsgcmV0dXJuIGFbMF0gLSBiWzBdIH0pXHJcbiAgICAgIC5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGF0Lm9mZnNldHMucHVzaCh0aGlzWzBdKVxyXG4gICAgICAgIHRoYXQudGFyZ2V0cy5wdXNoKHRoaXNbMV0pXHJcbiAgICAgIH0pXHJcbiAgfVxyXG5cclxuICBTY3JvbGxTcHkucHJvdG90eXBlLnByb2Nlc3MgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgc2Nyb2xsVG9wICAgID0gdGhpcy4kc2Nyb2xsRWxlbWVudC5zY3JvbGxUb3AoKSArIHRoaXMub3B0aW9ucy5vZmZzZXRcclxuICAgIHZhciBzY3JvbGxIZWlnaHQgPSB0aGlzLmdldFNjcm9sbEhlaWdodCgpXHJcbiAgICB2YXIgbWF4U2Nyb2xsICAgID0gdGhpcy5vcHRpb25zLm9mZnNldCArIHNjcm9sbEhlaWdodCAtIHRoaXMuJHNjcm9sbEVsZW1lbnQuaGVpZ2h0KClcclxuICAgIHZhciBvZmZzZXRzICAgICAgPSB0aGlzLm9mZnNldHNcclxuICAgIHZhciB0YXJnZXRzICAgICAgPSB0aGlzLnRhcmdldHNcclxuICAgIHZhciBhY3RpdmVUYXJnZXQgPSB0aGlzLmFjdGl2ZVRhcmdldFxyXG4gICAgdmFyIGlcclxuXHJcbiAgICBpZiAodGhpcy5zY3JvbGxIZWlnaHQgIT0gc2Nyb2xsSGVpZ2h0KSB7XHJcbiAgICAgIHRoaXMucmVmcmVzaCgpXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHNjcm9sbFRvcCA+PSBtYXhTY3JvbGwpIHtcclxuICAgICAgcmV0dXJuIGFjdGl2ZVRhcmdldCAhPSAoaSA9IHRhcmdldHNbdGFyZ2V0cy5sZW5ndGggLSAxXSkgJiYgdGhpcy5hY3RpdmF0ZShpKVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChhY3RpdmVUYXJnZXQgJiYgc2Nyb2xsVG9wIDwgb2Zmc2V0c1swXSkge1xyXG4gICAgICB0aGlzLmFjdGl2ZVRhcmdldCA9IG51bGxcclxuICAgICAgcmV0dXJuIHRoaXMuY2xlYXIoKVxyXG4gICAgfVxyXG5cclxuICAgIGZvciAoaSA9IG9mZnNldHMubGVuZ3RoOyBpLS07KSB7XHJcbiAgICAgIGFjdGl2ZVRhcmdldCAhPSB0YXJnZXRzW2ldXHJcbiAgICAgICAgJiYgc2Nyb2xsVG9wID49IG9mZnNldHNbaV1cclxuICAgICAgICAmJiAob2Zmc2V0c1tpICsgMV0gPT09IHVuZGVmaW5lZCB8fCBzY3JvbGxUb3AgPCBvZmZzZXRzW2kgKyAxXSlcclxuICAgICAgICAmJiB0aGlzLmFjdGl2YXRlKHRhcmdldHNbaV0pXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBTY3JvbGxTcHkucHJvdG90eXBlLmFjdGl2YXRlID0gZnVuY3Rpb24gKHRhcmdldCkge1xyXG4gICAgdGhpcy5hY3RpdmVUYXJnZXQgPSB0YXJnZXRcclxuXHJcbiAgICB0aGlzLmNsZWFyKClcclxuXHJcbiAgICB2YXIgc2VsZWN0b3IgPSB0aGlzLnNlbGVjdG9yICtcclxuICAgICAgJ1tkYXRhLXRhcmdldD1cIicgKyB0YXJnZXQgKyAnXCJdLCcgK1xyXG4gICAgICB0aGlzLnNlbGVjdG9yICsgJ1tocmVmPVwiJyArIHRhcmdldCArICdcIl0nXHJcblxyXG4gICAgdmFyIGFjdGl2ZSA9ICQoc2VsZWN0b3IpXHJcbiAgICAgIC5wYXJlbnRzKCdsaScpXHJcbiAgICAgIC5hZGRDbGFzcygnYWN0aXZlJylcclxuXHJcbiAgICBpZiAoYWN0aXZlLnBhcmVudCgnLmRyb3Bkb3duLW1lbnUnKS5sZW5ndGgpIHtcclxuICAgICAgYWN0aXZlID0gYWN0aXZlXHJcbiAgICAgICAgLmNsb3Nlc3QoJ2xpLmRyb3Bkb3duJylcclxuICAgICAgICAuYWRkQ2xhc3MoJ2FjdGl2ZScpXHJcbiAgICB9XHJcblxyXG4gICAgYWN0aXZlLnRyaWdnZXIoJ2FjdGl2YXRlLmJzLnNjcm9sbHNweScpXHJcbiAgfVxyXG5cclxuICBTY3JvbGxTcHkucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgJCh0aGlzLnNlbGVjdG9yKVxyXG4gICAgICAucGFyZW50c1VudGlsKHRoaXMub3B0aW9ucy50YXJnZXQsICcuYWN0aXZlJylcclxuICAgICAgLnJlbW92ZUNsYXNzKCdhY3RpdmUnKVxyXG4gIH1cclxuXHJcblxyXG4gIC8vIFNDUk9MTFNQWSBQTFVHSU4gREVGSU5JVElPTlxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBmdW5jdGlvbiBQbHVnaW4ob3B0aW9uKSB7XHJcbiAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgdmFyICR0aGlzICAgPSAkKHRoaXMpXHJcbiAgICAgIHZhciBkYXRhICAgID0gJHRoaXMuZGF0YSgnYnMuc2Nyb2xsc3B5JylcclxuICAgICAgdmFyIG9wdGlvbnMgPSB0eXBlb2Ygb3B0aW9uID09ICdvYmplY3QnICYmIG9wdGlvblxyXG5cclxuICAgICAgaWYgKCFkYXRhKSAkdGhpcy5kYXRhKCdicy5zY3JvbGxzcHknLCAoZGF0YSA9IG5ldyBTY3JvbGxTcHkodGhpcywgb3B0aW9ucykpKVxyXG4gICAgICBpZiAodHlwZW9mIG9wdGlvbiA9PSAnc3RyaW5nJykgZGF0YVtvcHRpb25dKClcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICB2YXIgb2xkID0gJC5mbi5zY3JvbGxzcHlcclxuXHJcbiAgJC5mbi5zY3JvbGxzcHkgICAgICAgICAgICAgPSBQbHVnaW5cclxuICAkLmZuLnNjcm9sbHNweS5Db25zdHJ1Y3RvciA9IFNjcm9sbFNweVxyXG5cclxuXHJcbiAgLy8gU0NST0xMU1BZIE5PIENPTkZMSUNUXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gICQuZm4uc2Nyb2xsc3B5Lm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAkLmZuLnNjcm9sbHNweSA9IG9sZFxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcblxyXG5cclxuICAvLyBTQ1JPTExTUFkgREFUQS1BUElcclxuICAvLyA9PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgJCh3aW5kb3cpLm9uKCdsb2FkLmJzLnNjcm9sbHNweS5kYXRhLWFwaScsIGZ1bmN0aW9uICgpIHtcclxuICAgICQoJ1tkYXRhLXNweT1cInNjcm9sbFwiXScpLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICB2YXIgJHNweSA9ICQodGhpcylcclxuICAgICAgUGx1Z2luLmNhbGwoJHNweSwgJHNweS5kYXRhKCkpXHJcbiAgICB9KVxyXG4gIH0pXHJcblxyXG59KGpRdWVyeSk7XHJcblxyXG4vKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICogQm9vdHN0cmFwOiB0YWIuanMgdjMuMy43XHJcbiAqIGh0dHA6Ly9nZXRib290c3RyYXAuY29tL2phdmFzY3JpcHQvI3RhYnNcclxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAqIENvcHlyaWdodCAyMDExLTIwMTYgVHdpdHRlciwgSW5jLlxyXG4gKiBMaWNlbnNlZCB1bmRlciBNSVQgKGh0dHBzOi8vZ2l0aHViLmNvbS90d2JzL2Jvb3RzdHJhcC9ibG9iL21hc3Rlci9MSUNFTlNFKVxyXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cclxuXHJcblxyXG4rZnVuY3Rpb24gKCQpIHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG4gIC8vIFRBQiBDTEFTUyBERUZJTklUSU9OXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgdmFyIFRhYiA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XHJcbiAgICAvLyBqc2NzOmRpc2FibGUgcmVxdWlyZURvbGxhckJlZm9yZWpRdWVyeUFzc2lnbm1lbnRcclxuICAgIHRoaXMuZWxlbWVudCA9ICQoZWxlbWVudClcclxuICAgIC8vIGpzY3M6ZW5hYmxlIHJlcXVpcmVEb2xsYXJCZWZvcmVqUXVlcnlBc3NpZ25tZW50XHJcbiAgfVxyXG5cclxuICBUYWIuVkVSU0lPTiA9ICczLjMuNydcclxuXHJcbiAgVGFiLlRSQU5TSVRJT05fRFVSQVRJT04gPSAxNTBcclxuXHJcbiAgVGFiLnByb3RvdHlwZS5zaG93ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyICR0aGlzICAgID0gdGhpcy5lbGVtZW50XHJcbiAgICB2YXIgJHVsICAgICAgPSAkdGhpcy5jbG9zZXN0KCd1bDpub3QoLmRyb3Bkb3duLW1lbnUpJylcclxuICAgIHZhciBzZWxlY3RvciA9ICR0aGlzLmRhdGEoJ3RhcmdldCcpXHJcblxyXG4gICAgaWYgKCFzZWxlY3Rvcikge1xyXG4gICAgICBzZWxlY3RvciA9ICR0aGlzLmF0dHIoJ2hyZWYnKVxyXG4gICAgICBzZWxlY3RvciA9IHNlbGVjdG9yICYmIHNlbGVjdG9yLnJlcGxhY2UoLy4qKD89I1teXFxzXSokKS8sICcnKSAvLyBzdHJpcCBmb3IgaWU3XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCR0aGlzLnBhcmVudCgnbGknKS5oYXNDbGFzcygnYWN0aXZlJykpIHJldHVyblxyXG5cclxuICAgIHZhciAkcHJldmlvdXMgPSAkdWwuZmluZCgnLmFjdGl2ZTpsYXN0IGEnKVxyXG4gICAgdmFyIGhpZGVFdmVudCA9ICQuRXZlbnQoJ2hpZGUuYnMudGFiJywge1xyXG4gICAgICByZWxhdGVkVGFyZ2V0OiAkdGhpc1swXVxyXG4gICAgfSlcclxuICAgIHZhciBzaG93RXZlbnQgPSAkLkV2ZW50KCdzaG93LmJzLnRhYicsIHtcclxuICAgICAgcmVsYXRlZFRhcmdldDogJHByZXZpb3VzWzBdXHJcbiAgICB9KVxyXG5cclxuICAgICRwcmV2aW91cy50cmlnZ2VyKGhpZGVFdmVudClcclxuICAgICR0aGlzLnRyaWdnZXIoc2hvd0V2ZW50KVxyXG5cclxuICAgIGlmIChzaG93RXZlbnQuaXNEZWZhdWx0UHJldmVudGVkKCkgfHwgaGlkZUV2ZW50LmlzRGVmYXVsdFByZXZlbnRlZCgpKSByZXR1cm5cclxuXHJcbiAgICB2YXIgJHRhcmdldCA9ICQoc2VsZWN0b3IpXHJcblxyXG4gICAgdGhpcy5hY3RpdmF0ZSgkdGhpcy5jbG9zZXN0KCdsaScpLCAkdWwpXHJcbiAgICB0aGlzLmFjdGl2YXRlKCR0YXJnZXQsICR0YXJnZXQucGFyZW50KCksIGZ1bmN0aW9uICgpIHtcclxuICAgICAgJHByZXZpb3VzLnRyaWdnZXIoe1xyXG4gICAgICAgIHR5cGU6ICdoaWRkZW4uYnMudGFiJyxcclxuICAgICAgICByZWxhdGVkVGFyZ2V0OiAkdGhpc1swXVxyXG4gICAgICB9KVxyXG4gICAgICAkdGhpcy50cmlnZ2VyKHtcclxuICAgICAgICB0eXBlOiAnc2hvd24uYnMudGFiJyxcclxuICAgICAgICByZWxhdGVkVGFyZ2V0OiAkcHJldmlvdXNbMF1cclxuICAgICAgfSlcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICBUYWIucHJvdG90eXBlLmFjdGl2YXRlID0gZnVuY3Rpb24gKGVsZW1lbnQsIGNvbnRhaW5lciwgY2FsbGJhY2spIHtcclxuICAgIHZhciAkYWN0aXZlICAgID0gY29udGFpbmVyLmZpbmQoJz4gLmFjdGl2ZScpXHJcbiAgICB2YXIgdHJhbnNpdGlvbiA9IGNhbGxiYWNrXHJcbiAgICAgICYmICQuc3VwcG9ydC50cmFuc2l0aW9uXHJcbiAgICAgICYmICgkYWN0aXZlLmxlbmd0aCAmJiAkYWN0aXZlLmhhc0NsYXNzKCdmYWRlJykgfHwgISFjb250YWluZXIuZmluZCgnPiAuZmFkZScpLmxlbmd0aClcclxuXHJcbiAgICBmdW5jdGlvbiBuZXh0KCkge1xyXG4gICAgICAkYWN0aXZlXHJcbiAgICAgICAgLnJlbW92ZUNsYXNzKCdhY3RpdmUnKVxyXG4gICAgICAgIC5maW5kKCc+IC5kcm9wZG93bi1tZW51ID4gLmFjdGl2ZScpXHJcbiAgICAgICAgICAucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpXHJcbiAgICAgICAgLmVuZCgpXHJcbiAgICAgICAgLmZpbmQoJ1tkYXRhLXRvZ2dsZT1cInRhYlwiXScpXHJcbiAgICAgICAgICAuYXR0cignYXJpYS1leHBhbmRlZCcsIGZhbHNlKVxyXG5cclxuICAgICAgZWxlbWVudFxyXG4gICAgICAgIC5hZGRDbGFzcygnYWN0aXZlJylcclxuICAgICAgICAuZmluZCgnW2RhdGEtdG9nZ2xlPVwidGFiXCJdJylcclxuICAgICAgICAgIC5hdHRyKCdhcmlhLWV4cGFuZGVkJywgdHJ1ZSlcclxuXHJcbiAgICAgIGlmICh0cmFuc2l0aW9uKSB7XHJcbiAgICAgICAgZWxlbWVudFswXS5vZmZzZXRXaWR0aCAvLyByZWZsb3cgZm9yIHRyYW5zaXRpb25cclxuICAgICAgICBlbGVtZW50LmFkZENsYXNzKCdpbicpXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZWxlbWVudC5yZW1vdmVDbGFzcygnZmFkZScpXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChlbGVtZW50LnBhcmVudCgnLmRyb3Bkb3duLW1lbnUnKS5sZW5ndGgpIHtcclxuICAgICAgICBlbGVtZW50XHJcbiAgICAgICAgICAuY2xvc2VzdCgnbGkuZHJvcGRvd24nKVxyXG4gICAgICAgICAgICAuYWRkQ2xhc3MoJ2FjdGl2ZScpXHJcbiAgICAgICAgICAuZW5kKClcclxuICAgICAgICAgIC5maW5kKCdbZGF0YS10b2dnbGU9XCJ0YWJcIl0nKVxyXG4gICAgICAgICAgICAuYXR0cignYXJpYS1leHBhbmRlZCcsIHRydWUpXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKClcclxuICAgIH1cclxuXHJcbiAgICAkYWN0aXZlLmxlbmd0aCAmJiB0cmFuc2l0aW9uID9cclxuICAgICAgJGFjdGl2ZVxyXG4gICAgICAgIC5vbmUoJ2JzVHJhbnNpdGlvbkVuZCcsIG5leHQpXHJcbiAgICAgICAgLmVtdWxhdGVUcmFuc2l0aW9uRW5kKFRhYi5UUkFOU0lUSU9OX0RVUkFUSU9OKSA6XHJcbiAgICAgIG5leHQoKVxyXG5cclxuICAgICRhY3RpdmUucmVtb3ZlQ2xhc3MoJ2luJylcclxuICB9XHJcblxyXG5cclxuICAvLyBUQUIgUExVR0lOIERFRklOSVRJT05cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgZnVuY3Rpb24gUGx1Z2luKG9wdGlvbikge1xyXG4gICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHZhciAkdGhpcyA9ICQodGhpcylcclxuICAgICAgdmFyIGRhdGEgID0gJHRoaXMuZGF0YSgnYnMudGFiJylcclxuXHJcbiAgICAgIGlmICghZGF0YSkgJHRoaXMuZGF0YSgnYnMudGFiJywgKGRhdGEgPSBuZXcgVGFiKHRoaXMpKSlcclxuICAgICAgaWYgKHR5cGVvZiBvcHRpb24gPT0gJ3N0cmluZycpIGRhdGFbb3B0aW9uXSgpXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgdmFyIG9sZCA9ICQuZm4udGFiXHJcblxyXG4gICQuZm4udGFiICAgICAgICAgICAgID0gUGx1Z2luXHJcbiAgJC5mbi50YWIuQ29uc3RydWN0b3IgPSBUYWJcclxuXHJcblxyXG4gIC8vIFRBQiBOTyBDT05GTElDVFxyXG4gIC8vID09PT09PT09PT09PT09PVxyXG5cclxuICAkLmZuLnRhYi5ub0NvbmZsaWN0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgJC5mbi50YWIgPSBvbGRcclxuICAgIHJldHVybiB0aGlzXHJcbiAgfVxyXG5cclxuXHJcbiAgLy8gVEFCIERBVEEtQVBJXHJcbiAgLy8gPT09PT09PT09PT09XHJcblxyXG4gIHZhciBjbGlja0hhbmRsZXIgPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICBQbHVnaW4uY2FsbCgkKHRoaXMpLCAnc2hvdycpXHJcbiAgfVxyXG5cclxuICAkKGRvY3VtZW50KVxyXG4gICAgLm9uKCdjbGljay5icy50YWIuZGF0YS1hcGknLCAnW2RhdGEtdG9nZ2xlPVwidGFiXCJdJywgY2xpY2tIYW5kbGVyKVxyXG4gICAgLm9uKCdjbGljay5icy50YWIuZGF0YS1hcGknLCAnW2RhdGEtdG9nZ2xlPVwicGlsbFwiXScsIGNsaWNrSGFuZGxlcilcclxuXHJcbn0oalF1ZXJ5KTtcclxuXHJcbi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gKiBCb290c3RyYXA6IGFmZml4LmpzIHYzLjMuN1xyXG4gKiBodHRwOi8vZ2V0Ym9vdHN0cmFwLmNvbS9qYXZhc2NyaXB0LyNhZmZpeFxyXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICogQ29weXJpZ2h0IDIwMTEtMjAxNiBUd2l0dGVyLCBJbmMuXHJcbiAqIExpY2Vuc2VkIHVuZGVyIE1JVCAoaHR0cHM6Ly9naXRodWIuY29tL3R3YnMvYm9vdHN0cmFwL2Jsb2IvbWFzdGVyL0xJQ0VOU0UpXHJcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xyXG5cclxuXHJcbitmdW5jdGlvbiAoJCkge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgLy8gQUZGSVggQ0xBU1MgREVGSU5JVElPTlxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgdmFyIEFmZml4ID0gZnVuY3Rpb24gKGVsZW1lbnQsIG9wdGlvbnMpIHtcclxuICAgIHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBBZmZpeC5ERUZBVUxUUywgb3B0aW9ucylcclxuXHJcbiAgICB0aGlzLiR0YXJnZXQgPSAkKHRoaXMub3B0aW9ucy50YXJnZXQpXHJcbiAgICAgIC5vbignc2Nyb2xsLmJzLmFmZml4LmRhdGEtYXBpJywgJC5wcm94eSh0aGlzLmNoZWNrUG9zaXRpb24sIHRoaXMpKVxyXG4gICAgICAub24oJ2NsaWNrLmJzLmFmZml4LmRhdGEtYXBpJywgICQucHJveHkodGhpcy5jaGVja1Bvc2l0aW9uV2l0aEV2ZW50TG9vcCwgdGhpcykpXHJcblxyXG4gICAgdGhpcy4kZWxlbWVudCAgICAgPSAkKGVsZW1lbnQpXHJcbiAgICB0aGlzLmFmZml4ZWQgICAgICA9IG51bGxcclxuICAgIHRoaXMudW5waW4gICAgICAgID0gbnVsbFxyXG4gICAgdGhpcy5waW5uZWRPZmZzZXQgPSBudWxsXHJcblxyXG4gICAgdGhpcy5jaGVja1Bvc2l0aW9uKClcclxuICB9XHJcblxyXG4gIEFmZml4LlZFUlNJT04gID0gJzMuMy43J1xyXG5cclxuICBBZmZpeC5SRVNFVCAgICA9ICdhZmZpeCBhZmZpeC10b3AgYWZmaXgtYm90dG9tJ1xyXG5cclxuICBBZmZpeC5ERUZBVUxUUyA9IHtcclxuICAgIG9mZnNldDogMCxcclxuICAgIHRhcmdldDogd2luZG93XHJcbiAgfVxyXG5cclxuICBBZmZpeC5wcm90b3R5cGUuZ2V0U3RhdGUgPSBmdW5jdGlvbiAoc2Nyb2xsSGVpZ2h0LCBoZWlnaHQsIG9mZnNldFRvcCwgb2Zmc2V0Qm90dG9tKSB7XHJcbiAgICB2YXIgc2Nyb2xsVG9wICAgID0gdGhpcy4kdGFyZ2V0LnNjcm9sbFRvcCgpXHJcbiAgICB2YXIgcG9zaXRpb24gICAgID0gdGhpcy4kZWxlbWVudC5vZmZzZXQoKVxyXG4gICAgdmFyIHRhcmdldEhlaWdodCA9IHRoaXMuJHRhcmdldC5oZWlnaHQoKVxyXG5cclxuICAgIGlmIChvZmZzZXRUb3AgIT0gbnVsbCAmJiB0aGlzLmFmZml4ZWQgPT0gJ3RvcCcpIHJldHVybiBzY3JvbGxUb3AgPCBvZmZzZXRUb3AgPyAndG9wJyA6IGZhbHNlXHJcblxyXG4gICAgaWYgKHRoaXMuYWZmaXhlZCA9PSAnYm90dG9tJykge1xyXG4gICAgICBpZiAob2Zmc2V0VG9wICE9IG51bGwpIHJldHVybiAoc2Nyb2xsVG9wICsgdGhpcy51bnBpbiA8PSBwb3NpdGlvbi50b3ApID8gZmFsc2UgOiAnYm90dG9tJ1xyXG4gICAgICByZXR1cm4gKHNjcm9sbFRvcCArIHRhcmdldEhlaWdodCA8PSBzY3JvbGxIZWlnaHQgLSBvZmZzZXRCb3R0b20pID8gZmFsc2UgOiAnYm90dG9tJ1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBpbml0aWFsaXppbmcgICA9IHRoaXMuYWZmaXhlZCA9PSBudWxsXHJcbiAgICB2YXIgY29sbGlkZXJUb3AgICAgPSBpbml0aWFsaXppbmcgPyBzY3JvbGxUb3AgOiBwb3NpdGlvbi50b3BcclxuICAgIHZhciBjb2xsaWRlckhlaWdodCA9IGluaXRpYWxpemluZyA/IHRhcmdldEhlaWdodCA6IGhlaWdodFxyXG5cclxuICAgIGlmIChvZmZzZXRUb3AgIT0gbnVsbCAmJiBzY3JvbGxUb3AgPD0gb2Zmc2V0VG9wKSByZXR1cm4gJ3RvcCdcclxuICAgIGlmIChvZmZzZXRCb3R0b20gIT0gbnVsbCAmJiAoY29sbGlkZXJUb3AgKyBjb2xsaWRlckhlaWdodCA+PSBzY3JvbGxIZWlnaHQgLSBvZmZzZXRCb3R0b20pKSByZXR1cm4gJ2JvdHRvbSdcclxuXHJcbiAgICByZXR1cm4gZmFsc2VcclxuICB9XHJcblxyXG4gIEFmZml4LnByb3RvdHlwZS5nZXRQaW5uZWRPZmZzZXQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICBpZiAodGhpcy5waW5uZWRPZmZzZXQpIHJldHVybiB0aGlzLnBpbm5lZE9mZnNldFxyXG4gICAgdGhpcy4kZWxlbWVudC5yZW1vdmVDbGFzcyhBZmZpeC5SRVNFVCkuYWRkQ2xhc3MoJ2FmZml4JylcclxuICAgIHZhciBzY3JvbGxUb3AgPSB0aGlzLiR0YXJnZXQuc2Nyb2xsVG9wKClcclxuICAgIHZhciBwb3NpdGlvbiAgPSB0aGlzLiRlbGVtZW50Lm9mZnNldCgpXHJcbiAgICByZXR1cm4gKHRoaXMucGlubmVkT2Zmc2V0ID0gcG9zaXRpb24udG9wIC0gc2Nyb2xsVG9wKVxyXG4gIH1cclxuXHJcbiAgQWZmaXgucHJvdG90eXBlLmNoZWNrUG9zaXRpb25XaXRoRXZlbnRMb29wID0gZnVuY3Rpb24gKCkge1xyXG4gICAgc2V0VGltZW91dCgkLnByb3h5KHRoaXMuY2hlY2tQb3NpdGlvbiwgdGhpcyksIDEpXHJcbiAgfVxyXG5cclxuICBBZmZpeC5wcm90b3R5cGUuY2hlY2tQb3NpdGlvbiA9IGZ1bmN0aW9uICgpIHtcclxuICAgIGlmICghdGhpcy4kZWxlbWVudC5pcygnOnZpc2libGUnKSkgcmV0dXJuXHJcblxyXG4gICAgdmFyIGhlaWdodCAgICAgICA9IHRoaXMuJGVsZW1lbnQuaGVpZ2h0KClcclxuICAgIHZhciBvZmZzZXQgICAgICAgPSB0aGlzLm9wdGlvbnMub2Zmc2V0XHJcbiAgICB2YXIgb2Zmc2V0VG9wICAgID0gb2Zmc2V0LnRvcFxyXG4gICAgdmFyIG9mZnNldEJvdHRvbSA9IG9mZnNldC5ib3R0b21cclxuICAgIHZhciBzY3JvbGxIZWlnaHQgPSBNYXRoLm1heCgkKGRvY3VtZW50KS5oZWlnaHQoKSwgJChkb2N1bWVudC5ib2R5KS5oZWlnaHQoKSlcclxuXHJcbiAgICBpZiAodHlwZW9mIG9mZnNldCAhPSAnb2JqZWN0JykgICAgICAgICBvZmZzZXRCb3R0b20gPSBvZmZzZXRUb3AgPSBvZmZzZXRcclxuICAgIGlmICh0eXBlb2Ygb2Zmc2V0VG9wID09ICdmdW5jdGlvbicpICAgIG9mZnNldFRvcCAgICA9IG9mZnNldC50b3AodGhpcy4kZWxlbWVudClcclxuICAgIGlmICh0eXBlb2Ygb2Zmc2V0Qm90dG9tID09ICdmdW5jdGlvbicpIG9mZnNldEJvdHRvbSA9IG9mZnNldC5ib3R0b20odGhpcy4kZWxlbWVudClcclxuXHJcbiAgICB2YXIgYWZmaXggPSB0aGlzLmdldFN0YXRlKHNjcm9sbEhlaWdodCwgaGVpZ2h0LCBvZmZzZXRUb3AsIG9mZnNldEJvdHRvbSlcclxuXHJcbiAgICBpZiAodGhpcy5hZmZpeGVkICE9IGFmZml4KSB7XHJcbiAgICAgIGlmICh0aGlzLnVucGluICE9IG51bGwpIHRoaXMuJGVsZW1lbnQuY3NzKCd0b3AnLCAnJylcclxuXHJcbiAgICAgIHZhciBhZmZpeFR5cGUgPSAnYWZmaXgnICsgKGFmZml4ID8gJy0nICsgYWZmaXggOiAnJylcclxuICAgICAgdmFyIGUgICAgICAgICA9ICQuRXZlbnQoYWZmaXhUeXBlICsgJy5icy5hZmZpeCcpXHJcblxyXG4gICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoZSlcclxuXHJcbiAgICAgIGlmIChlLmlzRGVmYXVsdFByZXZlbnRlZCgpKSByZXR1cm5cclxuXHJcbiAgICAgIHRoaXMuYWZmaXhlZCA9IGFmZml4XHJcbiAgICAgIHRoaXMudW5waW4gPSBhZmZpeCA9PSAnYm90dG9tJyA/IHRoaXMuZ2V0UGlubmVkT2Zmc2V0KCkgOiBudWxsXHJcblxyXG4gICAgICB0aGlzLiRlbGVtZW50XHJcbiAgICAgICAgLnJlbW92ZUNsYXNzKEFmZml4LlJFU0VUKVxyXG4gICAgICAgIC5hZGRDbGFzcyhhZmZpeFR5cGUpXHJcbiAgICAgICAgLnRyaWdnZXIoYWZmaXhUeXBlLnJlcGxhY2UoJ2FmZml4JywgJ2FmZml4ZWQnKSArICcuYnMuYWZmaXgnKVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChhZmZpeCA9PSAnYm90dG9tJykge1xyXG4gICAgICB0aGlzLiRlbGVtZW50Lm9mZnNldCh7XHJcbiAgICAgICAgdG9wOiBzY3JvbGxIZWlnaHQgLSBoZWlnaHQgLSBvZmZzZXRCb3R0b21cclxuICAgICAgfSlcclxuICAgIH1cclxuICB9XHJcblxyXG5cclxuICAvLyBBRkZJWCBQTFVHSU4gREVGSU5JVElPTlxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIGZ1bmN0aW9uIFBsdWdpbihvcHRpb24pIHtcclxuICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICB2YXIgJHRoaXMgICA9ICQodGhpcylcclxuICAgICAgdmFyIGRhdGEgICAgPSAkdGhpcy5kYXRhKCdicy5hZmZpeCcpXHJcbiAgICAgIHZhciBvcHRpb25zID0gdHlwZW9mIG9wdGlvbiA9PSAnb2JqZWN0JyAmJiBvcHRpb25cclxuXHJcbiAgICAgIGlmICghZGF0YSkgJHRoaXMuZGF0YSgnYnMuYWZmaXgnLCAoZGF0YSA9IG5ldyBBZmZpeCh0aGlzLCBvcHRpb25zKSkpXHJcbiAgICAgIGlmICh0eXBlb2Ygb3B0aW9uID09ICdzdHJpbmcnKSBkYXRhW29wdGlvbl0oKVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIHZhciBvbGQgPSAkLmZuLmFmZml4XHJcblxyXG4gICQuZm4uYWZmaXggICAgICAgICAgICAgPSBQbHVnaW5cclxuICAkLmZuLmFmZml4LkNvbnN0cnVjdG9yID0gQWZmaXhcclxuXHJcblxyXG4gIC8vIEFGRklYIE5PIENPTkZMSUNUXHJcbiAgLy8gPT09PT09PT09PT09PT09PT1cclxuXHJcbiAgJC5mbi5hZmZpeC5ub0NvbmZsaWN0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgJC5mbi5hZmZpeCA9IG9sZFxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcblxyXG5cclxuICAvLyBBRkZJWCBEQVRBLUFQSVxyXG4gIC8vID09PT09PT09PT09PT09XHJcblxyXG4gICQod2luZG93KS5vbignbG9hZCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICQoJ1tkYXRhLXNweT1cImFmZml4XCJdJykuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHZhciAkc3B5ID0gJCh0aGlzKVxyXG4gICAgICB2YXIgZGF0YSA9ICRzcHkuZGF0YSgpXHJcblxyXG4gICAgICBkYXRhLm9mZnNldCA9IGRhdGEub2Zmc2V0IHx8IHt9XHJcblxyXG4gICAgICBpZiAoZGF0YS5vZmZzZXRCb3R0b20gIT0gbnVsbCkgZGF0YS5vZmZzZXQuYm90dG9tID0gZGF0YS5vZmZzZXRCb3R0b21cclxuICAgICAgaWYgKGRhdGEub2Zmc2V0VG9wICAgICE9IG51bGwpIGRhdGEub2Zmc2V0LnRvcCAgICA9IGRhdGEub2Zmc2V0VG9wXHJcblxyXG4gICAgICBQbHVnaW4uY2FsbCgkc3B5LCBkYXRhKVxyXG4gICAgfSlcclxuICB9KVxyXG5cclxufShqUXVlcnkpO1xyXG4iXSwiZmlsZSI6ImxpYi9ib290c3RyYXAvZGlzdC9qcy9ib290c3RyYXAuZXM1LmpzIn0=
