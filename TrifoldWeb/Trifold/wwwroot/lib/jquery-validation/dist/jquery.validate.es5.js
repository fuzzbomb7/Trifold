"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/*!
 * jQuery Validation Plugin v1.17.0
 *
 * https://jqueryvalidation.org/
 *
 * Copyright (c) 2017 Jörn Zaefferer
 * Released under the MIT license
 */
(function (factory) {
  if (typeof define === "function" && define.amd) {
    define(["jquery"], factory);
  } else if ((typeof module === "undefined" ? "undefined" : _typeof(module)) === "object" && module.exports) {
    module.exports = factory(require("jquery"));
  } else {
    factory(jQuery);
  }
})(function ($) {
  $.extend($.fn, {
    // https://jqueryvalidation.org/validate/
    validate: function validate(options) {
      // If nothing is selected, return nothing; can't chain anyway
      if (!this.length) {
        if (options && options.debug && window.console) {
          console.warn("Nothing selected, can't validate, returning nothing.");
        }

        return;
      } // Check if a validator for this form was already created


      var validator = $.data(this[0], "validator");

      if (validator) {
        return validator;
      } // Add novalidate tag if HTML5.


      this.attr("novalidate", "novalidate");
      validator = new $.validator(options, this[0]);
      $.data(this[0], "validator", validator);

      if (validator.settings.onsubmit) {
        this.on("click.validate", ":submit", function (event) {
          // Track the used submit button to properly handle scripted
          // submits later.
          validator.submitButton = event.currentTarget; // Allow suppressing validation by adding a cancel class to the submit button

          if ($(this).hasClass("cancel")) {
            validator.cancelSubmit = true;
          } // Allow suppressing validation by adding the html5 formnovalidate attribute to the submit button


          if ($(this).attr("formnovalidate") !== undefined) {
            validator.cancelSubmit = true;
          }
        }); // Validate the form on submit

        this.on("submit.validate", function (event) {
          if (validator.settings.debug) {
            // Prevent form submit to be able to see console output
            event.preventDefault();
          }

          function handle() {
            var hidden, result; // Insert a hidden input as a replacement for the missing submit button
            // The hidden input is inserted in two cases:
            //   - A user defined a `submitHandler`
            //   - There was a pending request due to `remote` method and `stopRequest()`
            //     was called to submit the form in case it's valid

            if (validator.submitButton && (validator.settings.submitHandler || validator.formSubmitted)) {
              hidden = $("<input type='hidden'/>").attr("name", validator.submitButton.name).val($(validator.submitButton).val()).appendTo(validator.currentForm);
            }

            if (validator.settings.submitHandler) {
              result = validator.settings.submitHandler.call(validator, validator.currentForm, event);

              if (hidden) {
                // And clean up afterwards; thanks to no-block-scope, hidden can be referenced
                hidden.remove();
              }

              if (result !== undefined) {
                return result;
              }

              return false;
            }

            return true;
          } // Prevent submit for invalid forms or custom submit handlers


          if (validator.cancelSubmit) {
            validator.cancelSubmit = false;
            return handle();
          }

          if (validator.form()) {
            if (validator.pendingRequest) {
              validator.formSubmitted = true;
              return false;
            }

            return handle();
          } else {
            validator.focusInvalid();
            return false;
          }
        });
      }

      return validator;
    },
    // https://jqueryvalidation.org/valid/
    valid: function valid() {
      var valid, validator, errorList;

      if ($(this[0]).is("form")) {
        valid = this.validate().form();
      } else {
        errorList = [];
        valid = true;
        validator = $(this[0].form).validate();
        this.each(function () {
          valid = validator.element(this) && valid;

          if (!valid) {
            errorList = errorList.concat(validator.errorList);
          }
        });
        validator.errorList = errorList;
      }

      return valid;
    },
    // https://jqueryvalidation.org/rules/
    rules: function rules(command, argument) {
      var element = this[0],
          settings,
          staticRules,
          existingRules,
          data,
          param,
          filtered; // If nothing is selected, return empty object; can't chain anyway

      if (element == null) {
        return;
      }

      if (!element.form && element.hasAttribute("contenteditable")) {
        element.form = this.closest("form")[0];
        element.name = this.attr("name");
      }

      if (element.form == null) {
        return;
      }

      if (command) {
        settings = $.data(element.form, "validator").settings;
        staticRules = settings.rules;
        existingRules = $.validator.staticRules(element);

        switch (command) {
          case "add":
            $.extend(existingRules, $.validator.normalizeRule(argument)); // Remove messages from rules, but allow them to be set separately

            delete existingRules.messages;
            staticRules[element.name] = existingRules;

            if (argument.messages) {
              settings.messages[element.name] = $.extend(settings.messages[element.name], argument.messages);
            }

            break;

          case "remove":
            if (!argument) {
              delete staticRules[element.name];
              return existingRules;
            }

            filtered = {};
            $.each(argument.split(/\s/), function (index, method) {
              filtered[method] = existingRules[method];
              delete existingRules[method];
            });
            return filtered;
        }
      }

      data = $.validator.normalizeRules($.extend({}, $.validator.classRules(element), $.validator.attributeRules(element), $.validator.dataRules(element), $.validator.staticRules(element)), element); // Make sure required is at front

      if (data.required) {
        param = data.required;
        delete data.required;
        data = $.extend({
          required: param
        }, data);
      } // Make sure remote is at back


      if (data.remote) {
        param = data.remote;
        delete data.remote;
        data = $.extend(data, {
          remote: param
        });
      }

      return data;
    }
  }); // Custom selectors

  $.extend($.expr.pseudos || $.expr[":"], {
    // '|| $.expr[ ":" ]' here enables backwards compatibility to jQuery 1.7. Can be removed when dropping jQ 1.7.x support
    // https://jqueryvalidation.org/blank-selector/
    blank: function blank(a) {
      return !$.trim("" + $(a).val());
    },
    // https://jqueryvalidation.org/filled-selector/
    filled: function filled(a) {
      var val = $(a).val();
      return val !== null && !!$.trim("" + val);
    },
    // https://jqueryvalidation.org/unchecked-selector/
    unchecked: function unchecked(a) {
      return !$(a).prop("checked");
    }
  }); // Constructor for validator

  $.validator = function (options, form) {
    this.settings = $.extend(true, {}, $.validator.defaults, options);
    this.currentForm = form;
    this.init();
  }; // https://jqueryvalidation.org/jQuery.validator.format/


  $.validator.format = function (source, params) {
    if (arguments.length === 1) {
      return function () {
        var args = $.makeArray(arguments);
        args.unshift(source);
        return $.validator.format.apply(this, args);
      };
    }

    if (params === undefined) {
      return source;
    }

    if (arguments.length > 2 && params.constructor !== Array) {
      params = $.makeArray(arguments).slice(1);
    }

    if (params.constructor !== Array) {
      params = [params];
    }

    $.each(params, function (i, n) {
      source = source.replace(new RegExp("\\{" + i + "\\}", "g"), function () {
        return n;
      });
    });
    return source;
  };

  $.extend($.validator, {
    defaults: {
      messages: {},
      groups: {},
      rules: {},
      errorClass: "error",
      pendingClass: "pending",
      validClass: "valid",
      errorElement: "label",
      focusCleanup: false,
      focusInvalid: true,
      errorContainer: $([]),
      errorLabelContainer: $([]),
      onsubmit: true,
      ignore: ":hidden",
      ignoreTitle: false,
      onfocusin: function onfocusin(element) {
        this.lastActive = element; // Hide error label and remove error class on focus if enabled

        if (this.settings.focusCleanup) {
          if (this.settings.unhighlight) {
            this.settings.unhighlight.call(this, element, this.settings.errorClass, this.settings.validClass);
          }

          this.hideThese(this.errorsFor(element));
        }
      },
      onfocusout: function onfocusout(element) {
        if (!this.checkable(element) && (element.name in this.submitted || !this.optional(element))) {
          this.element(element);
        }
      },
      onkeyup: function onkeyup(element, event) {
        // Avoid revalidate the field when pressing one of the following keys
        // Shift       => 16
        // Ctrl        => 17
        // Alt         => 18
        // Caps lock   => 20
        // End         => 35
        // Home        => 36
        // Left arrow  => 37
        // Up arrow    => 38
        // Right arrow => 39
        // Down arrow  => 40
        // Insert      => 45
        // Num lock    => 144
        // AltGr key   => 225
        var excludedKeys = [16, 17, 18, 20, 35, 36, 37, 38, 39, 40, 45, 144, 225];

        if (event.which === 9 && this.elementValue(element) === "" || $.inArray(event.keyCode, excludedKeys) !== -1) {
          return;
        } else if (element.name in this.submitted || element.name in this.invalid) {
          this.element(element);
        }
      },
      onclick: function onclick(element) {
        // Click on selects, radiobuttons and checkboxes
        if (element.name in this.submitted) {
          this.element(element); // Or option elements, check parent select in that case
        } else if (element.parentNode.name in this.submitted) {
          this.element(element.parentNode);
        }
      },
      highlight: function highlight(element, errorClass, validClass) {
        if (element.type === "radio") {
          this.findByName(element.name).addClass(errorClass).removeClass(validClass);
        } else {
          $(element).addClass(errorClass).removeClass(validClass);
        }
      },
      unhighlight: function unhighlight(element, errorClass, validClass) {
        if (element.type === "radio") {
          this.findByName(element.name).removeClass(errorClass).addClass(validClass);
        } else {
          $(element).removeClass(errorClass).addClass(validClass);
        }
      }
    },
    // https://jqueryvalidation.org/jQuery.validator.setDefaults/
    setDefaults: function setDefaults(settings) {
      $.extend($.validator.defaults, settings);
    },
    messages: {
      required: "This field is required.",
      remote: "Please fix this field.",
      email: "Please enter a valid email address.",
      url: "Please enter a valid URL.",
      date: "Please enter a valid date.",
      dateISO: "Please enter a valid date (ISO).",
      number: "Please enter a valid number.",
      digits: "Please enter only digits.",
      equalTo: "Please enter the same value again.",
      maxlength: $.validator.format("Please enter no more than {0} characters."),
      minlength: $.validator.format("Please enter at least {0} characters."),
      rangelength: $.validator.format("Please enter a value between {0} and {1} characters long."),
      range: $.validator.format("Please enter a value between {0} and {1}."),
      max: $.validator.format("Please enter a value less than or equal to {0}."),
      min: $.validator.format("Please enter a value greater than or equal to {0}."),
      step: $.validator.format("Please enter a multiple of {0}.")
    },
    autoCreateRanges: false,
    prototype: {
      init: function init() {
        this.labelContainer = $(this.settings.errorLabelContainer);
        this.errorContext = this.labelContainer.length && this.labelContainer || $(this.currentForm);
        this.containers = $(this.settings.errorContainer).add(this.settings.errorLabelContainer);
        this.submitted = {};
        this.valueCache = {};
        this.pendingRequest = 0;
        this.pending = {};
        this.invalid = {};
        this.reset();
        var groups = this.groups = {},
            rules;
        $.each(this.settings.groups, function (key, value) {
          if (typeof value === "string") {
            value = value.split(/\s/);
          }

          $.each(value, function (index, name) {
            groups[name] = key;
          });
        });
        rules = this.settings.rules;
        $.each(rules, function (key, value) {
          rules[key] = $.validator.normalizeRule(value);
        });

        function delegate(event) {
          // Set form expando on contenteditable
          if (!this.form && this.hasAttribute("contenteditable")) {
            this.form = $(this).closest("form")[0];
            this.name = $(this).attr("name");
          }

          var validator = $.data(this.form, "validator"),
              eventType = "on" + event.type.replace(/^validate/, ""),
              settings = validator.settings;

          if (settings[eventType] && !$(this).is(settings.ignore)) {
            settings[eventType].call(validator, this, event);
          }
        }

        $(this.currentForm).on("focusin.validate focusout.validate keyup.validate", ":text, [type='password'], [type='file'], select, textarea, [type='number'], [type='search'], " + "[type='tel'], [type='url'], [type='email'], [type='datetime'], [type='date'], [type='month'], " + "[type='week'], [type='time'], [type='datetime-local'], [type='range'], [type='color'], " + "[type='radio'], [type='checkbox'], [contenteditable], [type='button']", delegate) // Support: Chrome, oldIE
        // "select" is provided as event.target when clicking a option
        .on("click.validate", "select, option, [type='radio'], [type='checkbox']", delegate);

        if (this.settings.invalidHandler) {
          $(this.currentForm).on("invalid-form.validate", this.settings.invalidHandler);
        }
      },
      // https://jqueryvalidation.org/Validator.form/
      form: function form() {
        this.checkForm();
        $.extend(this.submitted, this.errorMap);
        this.invalid = $.extend({}, this.errorMap);

        if (!this.valid()) {
          $(this.currentForm).triggerHandler("invalid-form", [this]);
        }

        this.showErrors();
        return this.valid();
      },
      checkForm: function checkForm() {
        this.prepareForm();

        for (var i = 0, elements = this.currentElements = this.elements(); elements[i]; i++) {
          this.check(elements[i]);
        }

        return this.valid();
      },
      // https://jqueryvalidation.org/Validator.element/
      element: function element(_element) {
        var cleanElement = this.clean(_element),
            checkElement = this.validationTargetFor(cleanElement),
            v = this,
            result = true,
            rs,
            group;

        if (checkElement === undefined) {
          delete this.invalid[cleanElement.name];
        } else {
          this.prepareElement(checkElement);
          this.currentElements = $(checkElement); // If this element is grouped, then validate all group elements already
          // containing a value

          group = this.groups[checkElement.name];

          if (group) {
            $.each(this.groups, function (name, testgroup) {
              if (testgroup === group && name !== checkElement.name) {
                cleanElement = v.validationTargetFor(v.clean(v.findByName(name)));

                if (cleanElement && cleanElement.name in v.invalid) {
                  v.currentElements.push(cleanElement);
                  result = v.check(cleanElement) && result;
                }
              }
            });
          }

          rs = this.check(checkElement) !== false;
          result = result && rs;

          if (rs) {
            this.invalid[checkElement.name] = false;
          } else {
            this.invalid[checkElement.name] = true;
          }

          if (!this.numberOfInvalids()) {
            // Hide error containers on last error
            this.toHide = this.toHide.add(this.containers);
          }

          this.showErrors(); // Add aria-invalid status for screen readers

          $(_element).attr("aria-invalid", !rs);
        }

        return result;
      },
      // https://jqueryvalidation.org/Validator.showErrors/
      showErrors: function showErrors(errors) {
        if (errors) {
          var validator = this; // Add items to error list and map

          $.extend(this.errorMap, errors);
          this.errorList = $.map(this.errorMap, function (message, name) {
            return {
              message: message,
              element: validator.findByName(name)[0]
            };
          }); // Remove items from success list

          this.successList = $.grep(this.successList, function (element) {
            return !(element.name in errors);
          });
        }

        if (this.settings.showErrors) {
          this.settings.showErrors.call(this, this.errorMap, this.errorList);
        } else {
          this.defaultShowErrors();
        }
      },
      // https://jqueryvalidation.org/Validator.resetForm/
      resetForm: function resetForm() {
        if ($.fn.resetForm) {
          $(this.currentForm).resetForm();
        }

        this.invalid = {};
        this.submitted = {};
        this.prepareForm();
        this.hideErrors();
        var elements = this.elements().removeData("previousValue").removeAttr("aria-invalid");
        this.resetElements(elements);
      },
      resetElements: function resetElements(elements) {
        var i;

        if (this.settings.unhighlight) {
          for (i = 0; elements[i]; i++) {
            this.settings.unhighlight.call(this, elements[i], this.settings.errorClass, "");
            this.findByName(elements[i].name).removeClass(this.settings.validClass);
          }
        } else {
          elements.removeClass(this.settings.errorClass).removeClass(this.settings.validClass);
        }
      },
      numberOfInvalids: function numberOfInvalids() {
        return this.objectLength(this.invalid);
      },
      objectLength: function objectLength(obj) {
        /* jshint unused: false */
        var count = 0,
            i;

        for (i in obj) {
          // This check allows counting elements with empty error
          // message as invalid elements
          if (obj[i] !== undefined && obj[i] !== null && obj[i] !== false) {
            count++;
          }
        }

        return count;
      },
      hideErrors: function hideErrors() {
        this.hideThese(this.toHide);
      },
      hideThese: function hideThese(errors) {
        errors.not(this.containers).text("");
        this.addWrapper(errors).hide();
      },
      valid: function valid() {
        return this.size() === 0;
      },
      size: function size() {
        return this.errorList.length;
      },
      focusInvalid: function focusInvalid() {
        if (this.settings.focusInvalid) {
          try {
            $(this.findLastActive() || this.errorList.length && this.errorList[0].element || []).filter(":visible").focus() // Manually trigger focusin event; without it, focusin handler isn't called, findLastActive won't have anything to find
            .trigger("focusin");
          } catch (e) {// Ignore IE throwing errors when focusing hidden elements
          }
        }
      },
      findLastActive: function findLastActive() {
        var lastActive = this.lastActive;
        return lastActive && $.grep(this.errorList, function (n) {
          return n.element.name === lastActive.name;
        }).length === 1 && lastActive;
      },
      elements: function elements() {
        var validator = this,
            rulesCache = {}; // Select all valid inputs inside the form (no submit or reset buttons)

        return $(this.currentForm).find("input, select, textarea, [contenteditable]").not(":submit, :reset, :image, :disabled").not(this.settings.ignore).filter(function () {
          var name = this.name || $(this).attr("name"); // For contenteditable

          if (!name && validator.settings.debug && window.console) {
            console.error("%o has no name assigned", this);
          } // Set form expando on contenteditable


          if (this.hasAttribute("contenteditable")) {
            this.form = $(this).closest("form")[0];
            this.name = name;
          } // Select only the first element for each name, and only those with rules specified


          if (name in rulesCache || !validator.objectLength($(this).rules())) {
            return false;
          }

          rulesCache[name] = true;
          return true;
        });
      },
      clean: function clean(selector) {
        return $(selector)[0];
      },
      errors: function errors() {
        var errorClass = this.settings.errorClass.split(" ").join(".");
        return $(this.settings.errorElement + "." + errorClass, this.errorContext);
      },
      resetInternals: function resetInternals() {
        this.successList = [];
        this.errorList = [];
        this.errorMap = {};
        this.toShow = $([]);
        this.toHide = $([]);
      },
      reset: function reset() {
        this.resetInternals();
        this.currentElements = $([]);
      },
      prepareForm: function prepareForm() {
        this.reset();
        this.toHide = this.errors().add(this.containers);
      },
      prepareElement: function prepareElement(element) {
        this.reset();
        this.toHide = this.errorsFor(element);
      },
      elementValue: function elementValue(element) {
        var $element = $(element),
            type = element.type,
            val,
            idx;

        if (type === "radio" || type === "checkbox") {
          return this.findByName(element.name).filter(":checked").val();
        } else if (type === "number" && typeof element.validity !== "undefined") {
          return element.validity.badInput ? "NaN" : $element.val();
        }

        if (element.hasAttribute("contenteditable")) {
          val = $element.text();
        } else {
          val = $element.val();
        }

        if (type === "file") {
          // Modern browser (chrome & safari)
          if (val.substr(0, 12) === "C:\\fakepath\\") {
            return val.substr(12);
          } // Legacy browsers
          // Unix-based path


          idx = val.lastIndexOf("/");

          if (idx >= 0) {
            return val.substr(idx + 1);
          } // Windows-based path


          idx = val.lastIndexOf("\\");

          if (idx >= 0) {
            return val.substr(idx + 1);
          } // Just the file name


          return val;
        }

        if (typeof val === "string") {
          return val.replace(/\r/g, "");
        }

        return val;
      },
      check: function check(element) {
        element = this.validationTargetFor(this.clean(element));
        var rules = $(element).rules(),
            rulesCount = $.map(rules, function (n, i) {
          return i;
        }).length,
            dependencyMismatch = false,
            val = this.elementValue(element),
            result,
            method,
            rule,
            normalizer; // Prioritize the local normalizer defined for this element over the global one
        // if the former exists, otherwise user the global one in case it exists.

        if (typeof rules.normalizer === "function") {
          normalizer = rules.normalizer;
        } else if (typeof this.settings.normalizer === "function") {
          normalizer = this.settings.normalizer;
        } // If normalizer is defined, then call it to retreive the changed value instead
        // of using the real one.
        // Note that `this` in the normalizer is `element`.


        if (normalizer) {
          val = normalizer.call(element, val);

          if (typeof val !== "string") {
            throw new TypeError("The normalizer should return a string value.");
          } // Delete the normalizer from rules to avoid treating it as a pre-defined method.


          delete rules.normalizer;
        }

        for (method in rules) {
          rule = {
            method: method,
            parameters: rules[method]
          };

          try {
            result = $.validator.methods[method].call(this, val, element, rule.parameters); // If a method indicates that the field is optional and therefore valid,
            // don't mark it as valid when there are no other rules

            if (result === "dependency-mismatch" && rulesCount === 1) {
              dependencyMismatch = true;
              continue;
            }

            dependencyMismatch = false;

            if (result === "pending") {
              this.toHide = this.toHide.not(this.errorsFor(element));
              return;
            }

            if (!result) {
              this.formatAndAdd(element, rule);
              return false;
            }
          } catch (e) {
            if (this.settings.debug && window.console) {
              console.log("Exception occurred when checking element " + element.id + ", check the '" + rule.method + "' method.", e);
            }

            if (e instanceof TypeError) {
              e.message += ".  Exception occurred when checking element " + element.id + ", check the '" + rule.method + "' method.";
            }

            throw e;
          }
        }

        if (dependencyMismatch) {
          return;
        }

        if (this.objectLength(rules)) {
          this.successList.push(element);
        }

        return true;
      },
      // Return the custom message for the given element and validation method
      // specified in the element's HTML5 data attribute
      // return the generic message if present and no method specific message is present
      customDataMessage: function customDataMessage(element, method) {
        return $(element).data("msg" + method.charAt(0).toUpperCase() + method.substring(1).toLowerCase()) || $(element).data("msg");
      },
      // Return the custom message for the given element name and validation method
      customMessage: function customMessage(name, method) {
        var m = this.settings.messages[name];
        return m && (m.constructor === String ? m : m[method]);
      },
      // Return the first defined argument, allowing empty strings
      findDefined: function findDefined() {
        for (var i = 0; i < arguments.length; i++) {
          if (arguments[i] !== undefined) {
            return arguments[i];
          }
        }

        return undefined;
      },
      // The second parameter 'rule' used to be a string, and extended to an object literal
      // of the following form:
      // rule = {
      //     method: "method name",
      //     parameters: "the given method parameters"
      // }
      //
      // The old behavior still supported, kept to maintain backward compatibility with
      // old code, and will be removed in the next major release.
      defaultMessage: function defaultMessage(element, rule) {
        if (typeof rule === "string") {
          rule = {
            method: rule
          };
        }

        var message = this.findDefined(this.customMessage(element.name, rule.method), this.customDataMessage(element, rule.method), // 'title' is never undefined, so handle empty string as undefined
        !this.settings.ignoreTitle && element.title || undefined, $.validator.messages[rule.method], "<strong>Warning: No message defined for " + element.name + "</strong>"),
            theregex = /\$?\{(\d+)\}/g;

        if (typeof message === "function") {
          message = message.call(this, rule.parameters, element);
        } else if (theregex.test(message)) {
          message = $.validator.format(message.replace(theregex, "{$1}"), rule.parameters);
        }

        return message;
      },
      formatAndAdd: function formatAndAdd(element, rule) {
        var message = this.defaultMessage(element, rule);
        this.errorList.push({
          message: message,
          element: element,
          method: rule.method
        });
        this.errorMap[element.name] = message;
        this.submitted[element.name] = message;
      },
      addWrapper: function addWrapper(toToggle) {
        if (this.settings.wrapper) {
          toToggle = toToggle.add(toToggle.parent(this.settings.wrapper));
        }

        return toToggle;
      },
      defaultShowErrors: function defaultShowErrors() {
        var i, elements, error;

        for (i = 0; this.errorList[i]; i++) {
          error = this.errorList[i];

          if (this.settings.highlight) {
            this.settings.highlight.call(this, error.element, this.settings.errorClass, this.settings.validClass);
          }

          this.showLabel(error.element, error.message);
        }

        if (this.errorList.length) {
          this.toShow = this.toShow.add(this.containers);
        }

        if (this.settings.success) {
          for (i = 0; this.successList[i]; i++) {
            this.showLabel(this.successList[i]);
          }
        }

        if (this.settings.unhighlight) {
          for (i = 0, elements = this.validElements(); elements[i]; i++) {
            this.settings.unhighlight.call(this, elements[i], this.settings.errorClass, this.settings.validClass);
          }
        }

        this.toHide = this.toHide.not(this.toShow);
        this.hideErrors();
        this.addWrapper(this.toShow).show();
      },
      validElements: function validElements() {
        return this.currentElements.not(this.invalidElements());
      },
      invalidElements: function invalidElements() {
        return $(this.errorList).map(function () {
          return this.element;
        });
      },
      showLabel: function showLabel(element, message) {
        var place,
            group,
            errorID,
            v,
            error = this.errorsFor(element),
            elementID = this.idOrName(element),
            describedBy = $(element).attr("aria-describedby");

        if (error.length) {
          // Refresh error/success class
          error.removeClass(this.settings.validClass).addClass(this.settings.errorClass); // Replace message on existing label

          error.html(message);
        } else {
          // Create error element
          error = $("<" + this.settings.errorElement + ">").attr("id", elementID + "-error").addClass(this.settings.errorClass).html(message || ""); // Maintain reference to the element to be placed into the DOM

          place = error;

          if (this.settings.wrapper) {
            // Make sure the element is visible, even in IE
            // actually showing the wrapped element is handled elsewhere
            place = error.hide().show().wrap("<" + this.settings.wrapper + "/>").parent();
          }

          if (this.labelContainer.length) {
            this.labelContainer.append(place);
          } else if (this.settings.errorPlacement) {
            this.settings.errorPlacement.call(this, place, $(element));
          } else {
            place.insertAfter(element);
          } // Link error back to the element


          if (error.is("label")) {
            // If the error is a label, then associate using 'for'
            error.attr("for", elementID); // If the element is not a child of an associated label, then it's necessary
            // to explicitly apply aria-describedby
          } else if (error.parents("label[for='" + this.escapeCssMeta(elementID) + "']").length === 0) {
            errorID = error.attr("id"); // Respect existing non-error aria-describedby

            if (!describedBy) {
              describedBy = errorID;
            } else if (!describedBy.match(new RegExp("\\b" + this.escapeCssMeta(errorID) + "\\b"))) {
              // Add to end of list if not already present
              describedBy += " " + errorID;
            }

            $(element).attr("aria-describedby", describedBy); // If this element is grouped, then assign to all elements in the same group

            group = this.groups[element.name];

            if (group) {
              v = this;
              $.each(v.groups, function (name, testgroup) {
                if (testgroup === group) {
                  $("[name='" + v.escapeCssMeta(name) + "']", v.currentForm).attr("aria-describedby", error.attr("id"));
                }
              });
            }
          }
        }

        if (!message && this.settings.success) {
          error.text("");

          if (typeof this.settings.success === "string") {
            error.addClass(this.settings.success);
          } else {
            this.settings.success(error, element);
          }
        }

        this.toShow = this.toShow.add(error);
      },
      errorsFor: function errorsFor(element) {
        var name = this.escapeCssMeta(this.idOrName(element)),
            describer = $(element).attr("aria-describedby"),
            selector = "label[for='" + name + "'], label[for='" + name + "'] *"; // 'aria-describedby' should directly reference the error element

        if (describer) {
          selector = selector + ", #" + this.escapeCssMeta(describer).replace(/\s+/g, ", #");
        }

        return this.errors().filter(selector);
      },
      // See https://api.jquery.com/category/selectors/, for CSS
      // meta-characters that should be escaped in order to be used with JQuery
      // as a literal part of a name/id or any selector.
      escapeCssMeta: function escapeCssMeta(string) {
        return string.replace(/([\\!"#$%&'()*+,./:;<=>?@\[\]^`{|}~])/g, "\\$1");
      },
      idOrName: function idOrName(element) {
        return this.groups[element.name] || (this.checkable(element) ? element.name : element.id || element.name);
      },
      validationTargetFor: function validationTargetFor(element) {
        // If radio/checkbox, validate first element in group instead
        if (this.checkable(element)) {
          element = this.findByName(element.name);
        } // Always apply ignore filter


        return $(element).not(this.settings.ignore)[0];
      },
      checkable: function checkable(element) {
        return /radio|checkbox/i.test(element.type);
      },
      findByName: function findByName(name) {
        return $(this.currentForm).find("[name='" + this.escapeCssMeta(name) + "']");
      },
      getLength: function getLength(value, element) {
        switch (element.nodeName.toLowerCase()) {
          case "select":
            return $("option:selected", element).length;

          case "input":
            if (this.checkable(element)) {
              return this.findByName(element.name).filter(":checked").length;
            }

        }

        return value.length;
      },
      depend: function depend(param, element) {
        return this.dependTypes[_typeof(param)] ? this.dependTypes[_typeof(param)](param, element) : true;
      },
      dependTypes: {
        "boolean": function boolean(param) {
          return param;
        },
        "string": function string(param, element) {
          return !!$(param, element.form).length;
        },
        "function": function _function(param, element) {
          return param(element);
        }
      },
      optional: function optional(element) {
        var val = this.elementValue(element);
        return !$.validator.methods.required.call(this, val, element) && "dependency-mismatch";
      },
      startRequest: function startRequest(element) {
        if (!this.pending[element.name]) {
          this.pendingRequest++;
          $(element).addClass(this.settings.pendingClass);
          this.pending[element.name] = true;
        }
      },
      stopRequest: function stopRequest(element, valid) {
        this.pendingRequest--; // Sometimes synchronization fails, make sure pendingRequest is never < 0

        if (this.pendingRequest < 0) {
          this.pendingRequest = 0;
        }

        delete this.pending[element.name];
        $(element).removeClass(this.settings.pendingClass);

        if (valid && this.pendingRequest === 0 && this.formSubmitted && this.form()) {
          $(this.currentForm).submit(); // Remove the hidden input that was used as a replacement for the
          // missing submit button. The hidden input is added by `handle()`
          // to ensure that the value of the used submit button is passed on
          // for scripted submits triggered by this method

          if (this.submitButton) {
            $("input:hidden[name='" + this.submitButton.name + "']", this.currentForm).remove();
          }

          this.formSubmitted = false;
        } else if (!valid && this.pendingRequest === 0 && this.formSubmitted) {
          $(this.currentForm).triggerHandler("invalid-form", [this]);
          this.formSubmitted = false;
        }
      },
      previousValue: function previousValue(element, method) {
        method = typeof method === "string" && method || "remote";
        return $.data(element, "previousValue") || $.data(element, "previousValue", {
          old: null,
          valid: true,
          message: this.defaultMessage(element, {
            method: method
          })
        });
      },
      // Cleans up all forms and elements, removes validator-specific events
      destroy: function destroy() {
        this.resetForm();
        $(this.currentForm).off(".validate").removeData("validator").find(".validate-equalTo-blur").off(".validate-equalTo").removeClass("validate-equalTo-blur");
      }
    },
    classRuleSettings: {
      required: {
        required: true
      },
      email: {
        email: true
      },
      url: {
        url: true
      },
      date: {
        date: true
      },
      dateISO: {
        dateISO: true
      },
      number: {
        number: true
      },
      digits: {
        digits: true
      },
      creditcard: {
        creditcard: true
      }
    },
    addClassRules: function addClassRules(className, rules) {
      if (className.constructor === String) {
        this.classRuleSettings[className] = rules;
      } else {
        $.extend(this.classRuleSettings, className);
      }
    },
    classRules: function classRules(element) {
      var rules = {},
          classes = $(element).attr("class");

      if (classes) {
        $.each(classes.split(" "), function () {
          if (this in $.validator.classRuleSettings) {
            $.extend(rules, $.validator.classRuleSettings[this]);
          }
        });
      }

      return rules;
    },
    normalizeAttributeRule: function normalizeAttributeRule(rules, type, method, value) {
      // Convert the value to a number for number inputs, and for text for backwards compability
      // allows type="date" and others to be compared as strings
      if (/min|max|step/.test(method) && (type === null || /number|range|text/.test(type))) {
        value = Number(value); // Support Opera Mini, which returns NaN for undefined minlength

        if (isNaN(value)) {
          value = undefined;
        }
      }

      if (value || value === 0) {
        rules[method] = value;
      } else if (type === method && type !== "range") {
        // Exception: the jquery validate 'range' method
        // does not test for the html5 'range' type
        rules[method] = true;
      }
    },
    attributeRules: function attributeRules(element) {
      var rules = {},
          $element = $(element),
          type = element.getAttribute("type"),
          method,
          value;

      for (method in $.validator.methods) {
        // Support for <input required> in both html5 and older browsers
        if (method === "required") {
          value = element.getAttribute(method); // Some browsers return an empty string for the required attribute
          // and non-HTML5 browsers might have required="" markup

          if (value === "") {
            value = true;
          } // Force non-HTML5 browsers to return bool


          value = !!value;
        } else {
          value = $element.attr(method);
        }

        this.normalizeAttributeRule(rules, type, method, value);
      } // 'maxlength' may be returned as -1, 2147483647 ( IE ) and 524288 ( safari ) for text inputs


      if (rules.maxlength && /-1|2147483647|524288/.test(rules.maxlength)) {
        delete rules.maxlength;
      }

      return rules;
    },
    dataRules: function dataRules(element) {
      var rules = {},
          $element = $(element),
          type = element.getAttribute("type"),
          method,
          value;

      for (method in $.validator.methods) {
        value = $element.data("rule" + method.charAt(0).toUpperCase() + method.substring(1).toLowerCase());
        this.normalizeAttributeRule(rules, type, method, value);
      }

      return rules;
    },
    staticRules: function staticRules(element) {
      var rules = {},
          validator = $.data(element.form, "validator");

      if (validator.settings.rules) {
        rules = $.validator.normalizeRule(validator.settings.rules[element.name]) || {};
      }

      return rules;
    },
    normalizeRules: function normalizeRules(rules, element) {
      // Handle dependency check
      $.each(rules, function (prop, val) {
        // Ignore rule when param is explicitly false, eg. required:false
        if (val === false) {
          delete rules[prop];
          return;
        }

        if (val.param || val.depends) {
          var keepRule = true;

          switch (_typeof(val.depends)) {
            case "string":
              keepRule = !!$(val.depends, element.form).length;
              break;

            case "function":
              keepRule = val.depends.call(element, element);
              break;
          }

          if (keepRule) {
            rules[prop] = val.param !== undefined ? val.param : true;
          } else {
            $.data(element.form, "validator").resetElements($(element));
            delete rules[prop];
          }
        }
      }); // Evaluate parameters

      $.each(rules, function (rule, parameter) {
        rules[rule] = $.isFunction(parameter) && rule !== "normalizer" ? parameter(element) : parameter;
      }); // Clean number parameters

      $.each(["minlength", "maxlength"], function () {
        if (rules[this]) {
          rules[this] = Number(rules[this]);
        }
      });
      $.each(["rangelength", "range"], function () {
        var parts;

        if (rules[this]) {
          if ($.isArray(rules[this])) {
            rules[this] = [Number(rules[this][0]), Number(rules[this][1])];
          } else if (typeof rules[this] === "string") {
            parts = rules[this].replace(/[\[\]]/g, "").split(/[\s,]+/);
            rules[this] = [Number(parts[0]), Number(parts[1])];
          }
        }
      });

      if ($.validator.autoCreateRanges) {
        // Auto-create ranges
        if (rules.min != null && rules.max != null) {
          rules.range = [rules.min, rules.max];
          delete rules.min;
          delete rules.max;
        }

        if (rules.minlength != null && rules.maxlength != null) {
          rules.rangelength = [rules.minlength, rules.maxlength];
          delete rules.minlength;
          delete rules.maxlength;
        }
      }

      return rules;
    },
    // Converts a simple string to a {string: true} rule, e.g., "required" to {required:true}
    normalizeRule: function normalizeRule(data) {
      if (typeof data === "string") {
        var transformed = {};
        $.each(data.split(/\s/), function () {
          transformed[this] = true;
        });
        data = transformed;
      }

      return data;
    },
    // https://jqueryvalidation.org/jQuery.validator.addMethod/
    addMethod: function addMethod(name, method, message) {
      $.validator.methods[name] = method;
      $.validator.messages[name] = message !== undefined ? message : $.validator.messages[name];

      if (method.length < 3) {
        $.validator.addClassRules(name, $.validator.normalizeRule(name));
      }
    },
    // https://jqueryvalidation.org/jQuery.validator.methods/
    methods: {
      // https://jqueryvalidation.org/required-method/
      required: function required(value, element, param) {
        // Check if dependency is met
        if (!this.depend(param, element)) {
          return "dependency-mismatch";
        }

        if (element.nodeName.toLowerCase() === "select") {
          // Could be an array for select-multiple or a string, both are fine this way
          var val = $(element).val();
          return val && val.length > 0;
        }

        if (this.checkable(element)) {
          return this.getLength(value, element) > 0;
        }

        return value.length > 0;
      },
      // https://jqueryvalidation.org/email-method/
      email: function email(value, element) {
        // From https://html.spec.whatwg.org/multipage/forms.html#valid-e-mail-address
        // Retrieved 2014-01-14
        // If you have a problem with this implementation, report a bug against the above spec
        // Or use custom methods to implement your own email validation
        return this.optional(element) || /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(value);
      },
      // https://jqueryvalidation.org/url-method/
      url: function url(value, element) {
        // Copyright (c) 2010-2013 Diego Perini, MIT licensed
        // https://gist.github.com/dperini/729294
        // see also https://mathiasbynens.be/demo/url-regex
        // modified to allow protocol-relative URLs
        return this.optional(element) || /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(value);
      },
      // https://jqueryvalidation.org/date-method/
      date: function date(value, element) {
        return this.optional(element) || !/Invalid|NaN/.test(new Date(value).toString());
      },
      // https://jqueryvalidation.org/dateISO-method/
      dateISO: function dateISO(value, element) {
        return this.optional(element) || /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/.test(value);
      },
      // https://jqueryvalidation.org/number-method/
      number: function number(value, element) {
        return this.optional(element) || /^(?:-?\d+|-?\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(value);
      },
      // https://jqueryvalidation.org/digits-method/
      digits: function digits(value, element) {
        return this.optional(element) || /^\d+$/.test(value);
      },
      // https://jqueryvalidation.org/minlength-method/
      minlength: function minlength(value, element, param) {
        var length = $.isArray(value) ? value.length : this.getLength(value, element);
        return this.optional(element) || length >= param;
      },
      // https://jqueryvalidation.org/maxlength-method/
      maxlength: function maxlength(value, element, param) {
        var length = $.isArray(value) ? value.length : this.getLength(value, element);
        return this.optional(element) || length <= param;
      },
      // https://jqueryvalidation.org/rangelength-method/
      rangelength: function rangelength(value, element, param) {
        var length = $.isArray(value) ? value.length : this.getLength(value, element);
        return this.optional(element) || length >= param[0] && length <= param[1];
      },
      // https://jqueryvalidation.org/min-method/
      min: function min(value, element, param) {
        return this.optional(element) || value >= param;
      },
      // https://jqueryvalidation.org/max-method/
      max: function max(value, element, param) {
        return this.optional(element) || value <= param;
      },
      // https://jqueryvalidation.org/range-method/
      range: function range(value, element, param) {
        return this.optional(element) || value >= param[0] && value <= param[1];
      },
      // https://jqueryvalidation.org/step-method/
      step: function step(value, element, param) {
        var type = $(element).attr("type"),
            errorMessage = "Step attribute on input type " + type + " is not supported.",
            supportedTypes = ["text", "number", "range"],
            re = new RegExp("\\b" + type + "\\b"),
            notSupported = type && !re.test(supportedTypes.join()),
            decimalPlaces = function decimalPlaces(num) {
          var match = ("" + num).match(/(?:\.(\d+))?$/);

          if (!match) {
            return 0;
          } // Number of digits right of decimal point.


          return match[1] ? match[1].length : 0;
        },
            toInt = function toInt(num) {
          return Math.round(num * Math.pow(10, decimals));
        },
            valid = true,
            decimals; // Works only for text, number and range input types
        // TODO find a way to support input types date, datetime, datetime-local, month, time and week


        if (notSupported) {
          throw new Error(errorMessage);
        }

        decimals = decimalPlaces(param); // Value can't have too many decimals

        if (decimalPlaces(value) > decimals || toInt(value) % toInt(param) !== 0) {
          valid = false;
        }

        return this.optional(element) || valid;
      },
      // https://jqueryvalidation.org/equalTo-method/
      equalTo: function equalTo(value, element, param) {
        // Bind to the blur event of the target in order to revalidate whenever the target field is updated
        var target = $(param);

        if (this.settings.onfocusout && target.not(".validate-equalTo-blur").length) {
          target.addClass("validate-equalTo-blur").on("blur.validate-equalTo", function () {
            $(element).valid();
          });
        }

        return value === target.val();
      },
      // https://jqueryvalidation.org/remote-method/
      remote: function remote(value, element, param, method) {
        if (this.optional(element)) {
          return "dependency-mismatch";
        }

        method = typeof method === "string" && method || "remote";
        var previous = this.previousValue(element, method),
            validator,
            data,
            optionDataString;

        if (!this.settings.messages[element.name]) {
          this.settings.messages[element.name] = {};
        }

        previous.originalMessage = previous.originalMessage || this.settings.messages[element.name][method];
        this.settings.messages[element.name][method] = previous.message;
        param = typeof param === "string" && {
          url: param
        } || param;
        optionDataString = $.param($.extend({
          data: value
        }, param.data));

        if (previous.old === optionDataString) {
          return previous.valid;
        }

        previous.old = optionDataString;
        validator = this;
        this.startRequest(element);
        data = {};
        data[element.name] = value;
        $.ajax($.extend(true, {
          mode: "abort",
          port: "validate" + element.name,
          dataType: "json",
          data: data,
          context: validator.currentForm,
          success: function success(response) {
            var valid = response === true || response === "true",
                errors,
                message,
                submitted;
            validator.settings.messages[element.name][method] = previous.originalMessage;

            if (valid) {
              submitted = validator.formSubmitted;
              validator.resetInternals();
              validator.toHide = validator.errorsFor(element);
              validator.formSubmitted = submitted;
              validator.successList.push(element);
              validator.invalid[element.name] = false;
              validator.showErrors();
            } else {
              errors = {};
              message = response || validator.defaultMessage(element, {
                method: method,
                parameters: value
              });
              errors[element.name] = previous.message = message;
              validator.invalid[element.name] = true;
              validator.showErrors(errors);
            }

            previous.valid = valid;
            validator.stopRequest(element, valid);
          }
        }, param));
        return "pending";
      }
    }
  }); // Ajax mode: abort
  // usage: $.ajax({ mode: "abort"[, port: "uniqueport"]});
  // if mode:"abort" is used, the previous request on that port (port can be undefined) is aborted via XMLHttpRequest.abort()

  var pendingRequests = {},
      ajax; // Use a prefilter if available (1.5+)

  if ($.ajaxPrefilter) {
    $.ajaxPrefilter(function (settings, _, xhr) {
      var port = settings.port;

      if (settings.mode === "abort") {
        if (pendingRequests[port]) {
          pendingRequests[port].abort();
        }

        pendingRequests[port] = xhr;
      }
    });
  } else {
    // Proxy ajax
    ajax = $.ajax;

    $.ajax = function (settings) {
      var mode = ("mode" in settings ? settings : $.ajaxSettings).mode,
          port = ("port" in settings ? settings : $.ajaxSettings).port;

      if (mode === "abort") {
        if (pendingRequests[port]) {
          pendingRequests[port].abort();
        }

        pendingRequests[port] = ajax.apply(this, arguments);
        return pendingRequests[port];
      }

      return ajax.apply(this, arguments);
    };
  }

  return $;
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9qcXVlcnktdmFsaWRhdGlvbi9kaXN0L2pxdWVyeS52YWxpZGF0ZS5qcyJdLCJuYW1lcyI6WyJmYWN0b3J5IiwiZGVmaW5lIiwiYW1kIiwibW9kdWxlIiwiZXhwb3J0cyIsInJlcXVpcmUiLCJqUXVlcnkiLCIkIiwiZXh0ZW5kIiwiZm4iLCJ2YWxpZGF0ZSIsIm9wdGlvbnMiLCJsZW5ndGgiLCJkZWJ1ZyIsIndpbmRvdyIsImNvbnNvbGUiLCJ3YXJuIiwidmFsaWRhdG9yIiwiZGF0YSIsImF0dHIiLCJzZXR0aW5ncyIsIm9uc3VibWl0Iiwib24iLCJldmVudCIsInN1Ym1pdEJ1dHRvbiIsImN1cnJlbnRUYXJnZXQiLCJoYXNDbGFzcyIsImNhbmNlbFN1Ym1pdCIsInVuZGVmaW5lZCIsInByZXZlbnREZWZhdWx0IiwiaGFuZGxlIiwiaGlkZGVuIiwicmVzdWx0Iiwic3VibWl0SGFuZGxlciIsImZvcm1TdWJtaXR0ZWQiLCJuYW1lIiwidmFsIiwiYXBwZW5kVG8iLCJjdXJyZW50Rm9ybSIsImNhbGwiLCJyZW1vdmUiLCJmb3JtIiwicGVuZGluZ1JlcXVlc3QiLCJmb2N1c0ludmFsaWQiLCJ2YWxpZCIsImVycm9yTGlzdCIsImlzIiwiZWFjaCIsImVsZW1lbnQiLCJjb25jYXQiLCJydWxlcyIsImNvbW1hbmQiLCJhcmd1bWVudCIsInN0YXRpY1J1bGVzIiwiZXhpc3RpbmdSdWxlcyIsInBhcmFtIiwiZmlsdGVyZWQiLCJoYXNBdHRyaWJ1dGUiLCJjbG9zZXN0Iiwibm9ybWFsaXplUnVsZSIsIm1lc3NhZ2VzIiwic3BsaXQiLCJpbmRleCIsIm1ldGhvZCIsIm5vcm1hbGl6ZVJ1bGVzIiwiY2xhc3NSdWxlcyIsImF0dHJpYnV0ZVJ1bGVzIiwiZGF0YVJ1bGVzIiwicmVxdWlyZWQiLCJyZW1vdGUiLCJleHByIiwicHNldWRvcyIsImJsYW5rIiwiYSIsInRyaW0iLCJmaWxsZWQiLCJ1bmNoZWNrZWQiLCJwcm9wIiwiZGVmYXVsdHMiLCJpbml0IiwiZm9ybWF0Iiwic291cmNlIiwicGFyYW1zIiwiYXJndW1lbnRzIiwiYXJncyIsIm1ha2VBcnJheSIsInVuc2hpZnQiLCJhcHBseSIsImNvbnN0cnVjdG9yIiwiQXJyYXkiLCJzbGljZSIsImkiLCJuIiwicmVwbGFjZSIsIlJlZ0V4cCIsImdyb3VwcyIsImVycm9yQ2xhc3MiLCJwZW5kaW5nQ2xhc3MiLCJ2YWxpZENsYXNzIiwiZXJyb3JFbGVtZW50IiwiZm9jdXNDbGVhbnVwIiwiZXJyb3JDb250YWluZXIiLCJlcnJvckxhYmVsQ29udGFpbmVyIiwiaWdub3JlIiwiaWdub3JlVGl0bGUiLCJvbmZvY3VzaW4iLCJsYXN0QWN0aXZlIiwidW5oaWdobGlnaHQiLCJoaWRlVGhlc2UiLCJlcnJvcnNGb3IiLCJvbmZvY3Vzb3V0IiwiY2hlY2thYmxlIiwic3VibWl0dGVkIiwib3B0aW9uYWwiLCJvbmtleXVwIiwiZXhjbHVkZWRLZXlzIiwid2hpY2giLCJlbGVtZW50VmFsdWUiLCJpbkFycmF5Iiwia2V5Q29kZSIsImludmFsaWQiLCJvbmNsaWNrIiwicGFyZW50Tm9kZSIsImhpZ2hsaWdodCIsInR5cGUiLCJmaW5kQnlOYW1lIiwiYWRkQ2xhc3MiLCJyZW1vdmVDbGFzcyIsInNldERlZmF1bHRzIiwiZW1haWwiLCJ1cmwiLCJkYXRlIiwiZGF0ZUlTTyIsIm51bWJlciIsImRpZ2l0cyIsImVxdWFsVG8iLCJtYXhsZW5ndGgiLCJtaW5sZW5ndGgiLCJyYW5nZWxlbmd0aCIsInJhbmdlIiwibWF4IiwibWluIiwic3RlcCIsImF1dG9DcmVhdGVSYW5nZXMiLCJwcm90b3R5cGUiLCJsYWJlbENvbnRhaW5lciIsImVycm9yQ29udGV4dCIsImNvbnRhaW5lcnMiLCJhZGQiLCJ2YWx1ZUNhY2hlIiwicGVuZGluZyIsInJlc2V0Iiwia2V5IiwidmFsdWUiLCJkZWxlZ2F0ZSIsImV2ZW50VHlwZSIsImludmFsaWRIYW5kbGVyIiwiY2hlY2tGb3JtIiwiZXJyb3JNYXAiLCJ0cmlnZ2VySGFuZGxlciIsInNob3dFcnJvcnMiLCJwcmVwYXJlRm9ybSIsImVsZW1lbnRzIiwiY3VycmVudEVsZW1lbnRzIiwiY2hlY2siLCJjbGVhbkVsZW1lbnQiLCJjbGVhbiIsImNoZWNrRWxlbWVudCIsInZhbGlkYXRpb25UYXJnZXRGb3IiLCJ2IiwicnMiLCJncm91cCIsInByZXBhcmVFbGVtZW50IiwidGVzdGdyb3VwIiwicHVzaCIsIm51bWJlck9mSW52YWxpZHMiLCJ0b0hpZGUiLCJlcnJvcnMiLCJtYXAiLCJtZXNzYWdlIiwic3VjY2Vzc0xpc3QiLCJncmVwIiwiZGVmYXVsdFNob3dFcnJvcnMiLCJyZXNldEZvcm0iLCJoaWRlRXJyb3JzIiwicmVtb3ZlRGF0YSIsInJlbW92ZUF0dHIiLCJyZXNldEVsZW1lbnRzIiwib2JqZWN0TGVuZ3RoIiwib2JqIiwiY291bnQiLCJub3QiLCJ0ZXh0IiwiYWRkV3JhcHBlciIsImhpZGUiLCJzaXplIiwiZmluZExhc3RBY3RpdmUiLCJmaWx0ZXIiLCJmb2N1cyIsInRyaWdnZXIiLCJlIiwicnVsZXNDYWNoZSIsImZpbmQiLCJlcnJvciIsInNlbGVjdG9yIiwiam9pbiIsInJlc2V0SW50ZXJuYWxzIiwidG9TaG93IiwiJGVsZW1lbnQiLCJpZHgiLCJ2YWxpZGl0eSIsImJhZElucHV0Iiwic3Vic3RyIiwibGFzdEluZGV4T2YiLCJydWxlc0NvdW50IiwiZGVwZW5kZW5jeU1pc21hdGNoIiwicnVsZSIsIm5vcm1hbGl6ZXIiLCJUeXBlRXJyb3IiLCJwYXJhbWV0ZXJzIiwibWV0aG9kcyIsImZvcm1hdEFuZEFkZCIsImxvZyIsImlkIiwiY3VzdG9tRGF0YU1lc3NhZ2UiLCJjaGFyQXQiLCJ0b1VwcGVyQ2FzZSIsInN1YnN0cmluZyIsInRvTG93ZXJDYXNlIiwiY3VzdG9tTWVzc2FnZSIsIm0iLCJTdHJpbmciLCJmaW5kRGVmaW5lZCIsImRlZmF1bHRNZXNzYWdlIiwidGl0bGUiLCJ0aGVyZWdleCIsInRlc3QiLCJ0b1RvZ2dsZSIsIndyYXBwZXIiLCJwYXJlbnQiLCJzaG93TGFiZWwiLCJzdWNjZXNzIiwidmFsaWRFbGVtZW50cyIsInNob3ciLCJpbnZhbGlkRWxlbWVudHMiLCJwbGFjZSIsImVycm9ySUQiLCJlbGVtZW50SUQiLCJpZE9yTmFtZSIsImRlc2NyaWJlZEJ5IiwiaHRtbCIsIndyYXAiLCJhcHBlbmQiLCJlcnJvclBsYWNlbWVudCIsImluc2VydEFmdGVyIiwicGFyZW50cyIsImVzY2FwZUNzc01ldGEiLCJtYXRjaCIsImRlc2NyaWJlciIsInN0cmluZyIsImdldExlbmd0aCIsIm5vZGVOYW1lIiwiZGVwZW5kIiwiZGVwZW5kVHlwZXMiLCJzdGFydFJlcXVlc3QiLCJzdG9wUmVxdWVzdCIsInN1Ym1pdCIsInByZXZpb3VzVmFsdWUiLCJvbGQiLCJkZXN0cm95Iiwib2ZmIiwiY2xhc3NSdWxlU2V0dGluZ3MiLCJjcmVkaXRjYXJkIiwiYWRkQ2xhc3NSdWxlcyIsImNsYXNzTmFtZSIsImNsYXNzZXMiLCJub3JtYWxpemVBdHRyaWJ1dGVSdWxlIiwiTnVtYmVyIiwiaXNOYU4iLCJnZXRBdHRyaWJ1dGUiLCJkZXBlbmRzIiwia2VlcFJ1bGUiLCJwYXJhbWV0ZXIiLCJpc0Z1bmN0aW9uIiwicGFydHMiLCJpc0FycmF5IiwidHJhbnNmb3JtZWQiLCJhZGRNZXRob2QiLCJEYXRlIiwidG9TdHJpbmciLCJlcnJvck1lc3NhZ2UiLCJzdXBwb3J0ZWRUeXBlcyIsInJlIiwibm90U3VwcG9ydGVkIiwiZGVjaW1hbFBsYWNlcyIsIm51bSIsInRvSW50IiwiTWF0aCIsInJvdW5kIiwicG93IiwiZGVjaW1hbHMiLCJFcnJvciIsInRhcmdldCIsInByZXZpb3VzIiwib3B0aW9uRGF0YVN0cmluZyIsIm9yaWdpbmFsTWVzc2FnZSIsImFqYXgiLCJtb2RlIiwicG9ydCIsImRhdGFUeXBlIiwiY29udGV4dCIsInJlc3BvbnNlIiwicGVuZGluZ1JlcXVlc3RzIiwiYWpheFByZWZpbHRlciIsIl8iLCJ4aHIiLCJhYm9ydCIsImFqYXhTZXR0aW5ncyJdLCJtYXBwaW5ncyI6Ijs7OztBQUFBOzs7Ozs7OztBQVFDLFdBQVVBLE9BQVYs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QTFCO0FBQ0E7QUFDRCxLQVJEO0FBU0EsR0FWRCxNQVVPO0FBRU47QUFDQVQsSUFBQUEsSUFBSSxHQUFHM1MsQ0FBQyxDQUFDMlMsSUFBVDs7QUFDQTNTLElBQUFBLENBQUMsQ0FBQzJTLElBQUYsR0FBUyxVQUFVOVIsUUFBVixFQUFxQjtBQUM3QixVQUFJK1IsSUFBSSxHQUFHLENBQUUsVUFBVS9SLFFBQVYsR0FBcUJBLFFBQXJCLEdBQWdDYixDQUFDLENBQUNzVCxZQUFwQyxFQUFtRFYsSUFBOUQ7QUFBQSxVQUNDQyxJQUFJLEdBQUcsQ0FBRSxVQUFVaFMsUUFBVixHQUFxQkEsUUFBckIsR0FBZ0NiLENBQUMsQ0FBQ3NULFlBQXBDLEVBQW1EVCxJQUQzRDs7QUFFQSxVQUFLRCxJQUFJLEtBQUssT0FBZCxFQUF3QjtBQUN2QixZQUFLSyxlQUFlLENBQUVKLElBQUYsQ0FBcEIsRUFBK0I7QUFDOUJJLFVBQUFBLGVBQWUsQ0FBRUosSUFBRixDQUFmLENBQXdCUSxLQUF4QjtBQUNBOztBQUNESixRQUFBQSxlQUFlLENBQUVKLElBQUYsQ0FBZixHQUEwQkYsSUFBSSxDQUFDM04sS0FBTCxDQUFZLElBQVosRUFBa0JKLFNBQWxCLENBQTFCO0FBQ0EsZUFBT3FPLGVBQWUsQ0FBRUosSUFBRixDQUF0QjtBQUNBOztBQUNELGFBQU9GLElBQUksQ0FBQzNOLEtBQUwsQ0FBWSxJQUFaLEVBQWtCSixTQUFsQixDQUFQO0FBQ0EsS0FYRDtBQVlBOztBQUNELFNBQU81RSxDQUFQO0FBQ0MsQ0F4akRBLENBQUQiLCJzb3VyY2VzQ29udGVudCI6WyIvKiFcclxuICogalF1ZXJ5IFZhbGlkYXRpb24gUGx1Z2luIHYxLjE3LjBcclxuICpcclxuICogaHR0cHM6Ly9qcXVlcnl2YWxpZGF0aW9uLm9yZy9cclxuICpcclxuICogQ29weXJpZ2h0IChjKSAyMDE3IErDtnJuIFphZWZmZXJlclxyXG4gKiBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2VcclxuICovXHJcbihmdW5jdGlvbiggZmFjdG9yeSApIHtcclxuXHRpZiAoIHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kICkge1xyXG5cdFx0ZGVmaW5lKCBbXCJqcXVlcnlcIl0sIGZhY3RvcnkgKTtcclxuXHR9IGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIgJiYgbW9kdWxlLmV4cG9ydHMpIHtcclxuXHRcdG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSggcmVxdWlyZSggXCJqcXVlcnlcIiApICk7XHJcblx0fSBlbHNlIHtcclxuXHRcdGZhY3RvcnkoIGpRdWVyeSApO1xyXG5cdH1cclxufShmdW5jdGlvbiggJCApIHtcclxuXHJcbiQuZXh0ZW5kKCAkLmZuLCB7XHJcblxyXG5cdC8vIGh0dHBzOi8vanF1ZXJ5dmFsaWRhdGlvbi5vcmcvdmFsaWRhdGUvXHJcblx0dmFsaWRhdGU6IGZ1bmN0aW9uKCBvcHRpb25zICkge1xyXG5cclxuXHRcdC8vIElmIG5vdGhpbmcgaXMgc2VsZWN0ZWQsIHJldHVybiBub3RoaW5nOyBjYW4ndCBjaGFpbiBhbnl3YXlcclxuXHRcdGlmICggIXRoaXMubGVuZ3RoICkge1xyXG5cdFx0XHRpZiAoIG9wdGlvbnMgJiYgb3B0aW9ucy5kZWJ1ZyAmJiB3aW5kb3cuY29uc29sZSApIHtcclxuXHRcdFx0XHRjb25zb2xlLndhcm4oIFwiTm90aGluZyBzZWxlY3RlZCwgY2FuJ3QgdmFsaWRhdGUsIHJldHVybmluZyBub3RoaW5nLlwiICk7XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIENoZWNrIGlmIGEgdmFsaWRhdG9yIGZvciB0aGlzIGZvcm0gd2FzIGFscmVhZHkgY3JlYXRlZFxyXG5cdFx0dmFyIHZhbGlkYXRvciA9ICQuZGF0YSggdGhpc1sgMCBdLCBcInZhbGlkYXRvclwiICk7XHJcblx0XHRpZiAoIHZhbGlkYXRvciApIHtcclxuXHRcdFx0cmV0dXJuIHZhbGlkYXRvcjtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBBZGQgbm92YWxpZGF0ZSB0YWcgaWYgSFRNTDUuXHJcblx0XHR0aGlzLmF0dHIoIFwibm92YWxpZGF0ZVwiLCBcIm5vdmFsaWRhdGVcIiApO1xyXG5cclxuXHRcdHZhbGlkYXRvciA9IG5ldyAkLnZhbGlkYXRvciggb3B0aW9ucywgdGhpc1sgMCBdICk7XHJcblx0XHQkLmRhdGEoIHRoaXNbIDAgXSwgXCJ2YWxpZGF0b3JcIiwgdmFsaWRhdG9yICk7XHJcblxyXG5cdFx0aWYgKCB2YWxpZGF0b3Iuc2V0dGluZ3Mub25zdWJtaXQgKSB7XHJcblxyXG5cdFx0XHR0aGlzLm9uKCBcImNsaWNrLnZhbGlkYXRlXCIsIFwiOnN1Ym1pdFwiLCBmdW5jdGlvbiggZXZlbnQgKSB7XHJcblxyXG5cdFx0XHRcdC8vIFRyYWNrIHRoZSB1c2VkIHN1Ym1pdCBidXR0b24gdG8gcHJvcGVybHkgaGFuZGxlIHNjcmlwdGVkXHJcblx0XHRcdFx0Ly8gc3VibWl0cyBsYXRlci5cclxuXHRcdFx0XHR2YWxpZGF0b3Iuc3VibWl0QnV0dG9uID0gZXZlbnQuY3VycmVudFRhcmdldDtcclxuXHJcblx0XHRcdFx0Ly8gQWxsb3cgc3VwcHJlc3NpbmcgdmFsaWRhdGlvbiBieSBhZGRpbmcgYSBjYW5jZWwgY2xhc3MgdG8gdGhlIHN1Ym1pdCBidXR0b25cclxuXHRcdFx0XHRpZiAoICQoIHRoaXMgKS5oYXNDbGFzcyggXCJjYW5jZWxcIiApICkge1xyXG5cdFx0XHRcdFx0dmFsaWRhdG9yLmNhbmNlbFN1Ym1pdCA9IHRydWU7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHQvLyBBbGxvdyBzdXBwcmVzc2luZyB2YWxpZGF0aW9uIGJ5IGFkZGluZyB0aGUgaHRtbDUgZm9ybW5vdmFsaWRhdGUgYXR0cmlidXRlIHRvIHRoZSBzdWJtaXQgYnV0dG9uXHJcblx0XHRcdFx0aWYgKCAkKCB0aGlzICkuYXR0ciggXCJmb3Jtbm92YWxpZGF0ZVwiICkgIT09IHVuZGVmaW5lZCApIHtcclxuXHRcdFx0XHRcdHZhbGlkYXRvci5jYW5jZWxTdWJtaXQgPSB0cnVlO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSApO1xyXG5cclxuXHRcdFx0Ly8gVmFsaWRhdGUgdGhlIGZvcm0gb24gc3VibWl0XHJcblx0XHRcdHRoaXMub24oIFwic3VibWl0LnZhbGlkYXRlXCIsIGZ1bmN0aW9uKCBldmVudCApIHtcclxuXHRcdFx0XHRpZiAoIHZhbGlkYXRvci5zZXR0aW5ncy5kZWJ1ZyApIHtcclxuXHJcblx0XHRcdFx0XHQvLyBQcmV2ZW50IGZvcm0gc3VibWl0IHRvIGJlIGFibGUgdG8gc2VlIGNvbnNvbGUgb3V0cHV0XHJcblx0XHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRmdW5jdGlvbiBoYW5kbGUoKSB7XHJcblx0XHRcdFx0XHR2YXIgaGlkZGVuLCByZXN1bHQ7XHJcblxyXG5cdFx0XHRcdFx0Ly8gSW5zZXJ0IGEgaGlkZGVuIGlucHV0IGFzIGEgcmVwbGFjZW1lbnQgZm9yIHRoZSBtaXNzaW5nIHN1Ym1pdCBidXR0b25cclxuXHRcdFx0XHRcdC8vIFRoZSBoaWRkZW4gaW5wdXQgaXMgaW5zZXJ0ZWQgaW4gdHdvIGNhc2VzOlxyXG5cdFx0XHRcdFx0Ly8gICAtIEEgdXNlciBkZWZpbmVkIGEgYHN1Ym1pdEhhbmRsZXJgXHJcblx0XHRcdFx0XHQvLyAgIC0gVGhlcmUgd2FzIGEgcGVuZGluZyByZXF1ZXN0IGR1ZSB0byBgcmVtb3RlYCBtZXRob2QgYW5kIGBzdG9wUmVxdWVzdCgpYFxyXG5cdFx0XHRcdFx0Ly8gICAgIHdhcyBjYWxsZWQgdG8gc3VibWl0IHRoZSBmb3JtIGluIGNhc2UgaXQncyB2YWxpZFxyXG5cdFx0XHRcdFx0aWYgKCB2YWxpZGF0b3Iuc3VibWl0QnV0dG9uICYmICggdmFsaWRhdG9yLnNldHRpbmdzLnN1Ym1pdEhhbmRsZXIgfHwgdmFsaWRhdG9yLmZvcm1TdWJtaXR0ZWQgKSApIHtcclxuXHRcdFx0XHRcdFx0aGlkZGVuID0gJCggXCI8aW5wdXQgdHlwZT0naGlkZGVuJy8+XCIgKVxyXG5cdFx0XHRcdFx0XHRcdC5hdHRyKCBcIm5hbWVcIiwgdmFsaWRhdG9yLnN1Ym1pdEJ1dHRvbi5uYW1lIClcclxuXHRcdFx0XHRcdFx0XHQudmFsKCAkKCB2YWxpZGF0b3Iuc3VibWl0QnV0dG9uICkudmFsKCkgKVxyXG5cdFx0XHRcdFx0XHRcdC5hcHBlbmRUbyggdmFsaWRhdG9yLmN1cnJlbnRGb3JtICk7XHJcblx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0aWYgKCB2YWxpZGF0b3Iuc2V0dGluZ3Muc3VibWl0SGFuZGxlciApIHtcclxuXHRcdFx0XHRcdFx0cmVzdWx0ID0gdmFsaWRhdG9yLnNldHRpbmdzLnN1Ym1pdEhhbmRsZXIuY2FsbCggdmFsaWRhdG9yLCB2YWxpZGF0b3IuY3VycmVudEZvcm0sIGV2ZW50ICk7XHJcblx0XHRcdFx0XHRcdGlmICggaGlkZGVuICkge1xyXG5cclxuXHRcdFx0XHRcdFx0XHQvLyBBbmQgY2xlYW4gdXAgYWZ0ZXJ3YXJkczsgdGhhbmtzIHRvIG5vLWJsb2NrLXNjb3BlLCBoaWRkZW4gY2FuIGJlIHJlZmVyZW5jZWRcclxuXHRcdFx0XHRcdFx0XHRoaWRkZW4ucmVtb3ZlKCk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0aWYgKCByZXN1bHQgIT09IHVuZGVmaW5lZCApIHtcclxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0Ly8gUHJldmVudCBzdWJtaXQgZm9yIGludmFsaWQgZm9ybXMgb3IgY3VzdG9tIHN1Ym1pdCBoYW5kbGVyc1xyXG5cdFx0XHRcdGlmICggdmFsaWRhdG9yLmNhbmNlbFN1Ym1pdCApIHtcclxuXHRcdFx0XHRcdHZhbGlkYXRvci5jYW5jZWxTdWJtaXQgPSBmYWxzZTtcclxuXHRcdFx0XHRcdHJldHVybiBoYW5kbGUoKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0aWYgKCB2YWxpZGF0b3IuZm9ybSgpICkge1xyXG5cdFx0XHRcdFx0aWYgKCB2YWxpZGF0b3IucGVuZGluZ1JlcXVlc3QgKSB7XHJcblx0XHRcdFx0XHRcdHZhbGlkYXRvci5mb3JtU3VibWl0dGVkID0gdHJ1ZTtcclxuXHRcdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0cmV0dXJuIGhhbmRsZSgpO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHR2YWxpZGF0b3IuZm9jdXNJbnZhbGlkKCk7XHJcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9ICk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHZhbGlkYXRvcjtcclxuXHR9LFxyXG5cclxuXHQvLyBodHRwczovL2pxdWVyeXZhbGlkYXRpb24ub3JnL3ZhbGlkL1xyXG5cdHZhbGlkOiBmdW5jdGlvbigpIHtcclxuXHRcdHZhciB2YWxpZCwgdmFsaWRhdG9yLCBlcnJvckxpc3Q7XHJcblxyXG5cdFx0aWYgKCAkKCB0aGlzWyAwIF0gKS5pcyggXCJmb3JtXCIgKSApIHtcclxuXHRcdFx0dmFsaWQgPSB0aGlzLnZhbGlkYXRlKCkuZm9ybSgpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0ZXJyb3JMaXN0ID0gW107XHJcblx0XHRcdHZhbGlkID0gdHJ1ZTtcclxuXHRcdFx0dmFsaWRhdG9yID0gJCggdGhpc1sgMCBdLmZvcm0gKS52YWxpZGF0ZSgpO1xyXG5cdFx0XHR0aGlzLmVhY2goIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdHZhbGlkID0gdmFsaWRhdG9yLmVsZW1lbnQoIHRoaXMgKSAmJiB2YWxpZDtcclxuXHRcdFx0XHRpZiAoICF2YWxpZCApIHtcclxuXHRcdFx0XHRcdGVycm9yTGlzdCA9IGVycm9yTGlzdC5jb25jYXQoIHZhbGlkYXRvci5lcnJvckxpc3QgKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0gKTtcclxuXHRcdFx0dmFsaWRhdG9yLmVycm9yTGlzdCA9IGVycm9yTGlzdDtcclxuXHRcdH1cclxuXHRcdHJldHVybiB2YWxpZDtcclxuXHR9LFxyXG5cclxuXHQvLyBodHRwczovL2pxdWVyeXZhbGlkYXRpb24ub3JnL3J1bGVzL1xyXG5cdHJ1bGVzOiBmdW5jdGlvbiggY29tbWFuZCwgYXJndW1lbnQgKSB7XHJcblx0XHR2YXIgZWxlbWVudCA9IHRoaXNbIDAgXSxcclxuXHRcdFx0c2V0dGluZ3MsIHN0YXRpY1J1bGVzLCBleGlzdGluZ1J1bGVzLCBkYXRhLCBwYXJhbSwgZmlsdGVyZWQ7XHJcblxyXG5cdFx0Ly8gSWYgbm90aGluZyBpcyBzZWxlY3RlZCwgcmV0dXJuIGVtcHR5IG9iamVjdDsgY2FuJ3QgY2hhaW4gYW55d2F5XHJcblx0XHRpZiAoIGVsZW1lbnQgPT0gbnVsbCApIHtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmICggIWVsZW1lbnQuZm9ybSAmJiBlbGVtZW50Lmhhc0F0dHJpYnV0ZSggXCJjb250ZW50ZWRpdGFibGVcIiApICkge1xyXG5cdFx0XHRlbGVtZW50LmZvcm0gPSB0aGlzLmNsb3Nlc3QoIFwiZm9ybVwiIClbIDAgXTtcclxuXHRcdFx0ZWxlbWVudC5uYW1lID0gdGhpcy5hdHRyKCBcIm5hbWVcIiApO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmICggZWxlbWVudC5mb3JtID09IG51bGwgKSB7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAoIGNvbW1hbmQgKSB7XHJcblx0XHRcdHNldHRpbmdzID0gJC5kYXRhKCBlbGVtZW50LmZvcm0sIFwidmFsaWRhdG9yXCIgKS5zZXR0aW5ncztcclxuXHRcdFx0c3RhdGljUnVsZXMgPSBzZXR0aW5ncy5ydWxlcztcclxuXHRcdFx0ZXhpc3RpbmdSdWxlcyA9ICQudmFsaWRhdG9yLnN0YXRpY1J1bGVzKCBlbGVtZW50ICk7XHJcblx0XHRcdHN3aXRjaCAoIGNvbW1hbmQgKSB7XHJcblx0XHRcdGNhc2UgXCJhZGRcIjpcclxuXHRcdFx0XHQkLmV4dGVuZCggZXhpc3RpbmdSdWxlcywgJC52YWxpZGF0b3Iubm9ybWFsaXplUnVsZSggYXJndW1lbnQgKSApO1xyXG5cclxuXHRcdFx0XHQvLyBSZW1vdmUgbWVzc2FnZXMgZnJvbSBydWxlcywgYnV0IGFsbG93IHRoZW0gdG8gYmUgc2V0IHNlcGFyYXRlbHlcclxuXHRcdFx0XHRkZWxldGUgZXhpc3RpbmdSdWxlcy5tZXNzYWdlcztcclxuXHRcdFx0XHRzdGF0aWNSdWxlc1sgZWxlbWVudC5uYW1lIF0gPSBleGlzdGluZ1J1bGVzO1xyXG5cdFx0XHRcdGlmICggYXJndW1lbnQubWVzc2FnZXMgKSB7XHJcblx0XHRcdFx0XHRzZXR0aW5ncy5tZXNzYWdlc1sgZWxlbWVudC5uYW1lIF0gPSAkLmV4dGVuZCggc2V0dGluZ3MubWVzc2FnZXNbIGVsZW1lbnQubmFtZSBdLCBhcmd1bWVudC5tZXNzYWdlcyApO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSBcInJlbW92ZVwiOlxyXG5cdFx0XHRcdGlmICggIWFyZ3VtZW50ICkge1xyXG5cdFx0XHRcdFx0ZGVsZXRlIHN0YXRpY1J1bGVzWyBlbGVtZW50Lm5hbWUgXTtcclxuXHRcdFx0XHRcdHJldHVybiBleGlzdGluZ1J1bGVzO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRmaWx0ZXJlZCA9IHt9O1xyXG5cdFx0XHRcdCQuZWFjaCggYXJndW1lbnQuc3BsaXQoIC9cXHMvICksIGZ1bmN0aW9uKCBpbmRleCwgbWV0aG9kICkge1xyXG5cdFx0XHRcdFx0ZmlsdGVyZWRbIG1ldGhvZCBdID0gZXhpc3RpbmdSdWxlc1sgbWV0aG9kIF07XHJcblx0XHRcdFx0XHRkZWxldGUgZXhpc3RpbmdSdWxlc1sgbWV0aG9kIF07XHJcblx0XHRcdFx0fSApO1xyXG5cdFx0XHRcdHJldHVybiBmaWx0ZXJlZDtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdGRhdGEgPSAkLnZhbGlkYXRvci5ub3JtYWxpemVSdWxlcyhcclxuXHRcdCQuZXh0ZW5kKFxyXG5cdFx0XHR7fSxcclxuXHRcdFx0JC52YWxpZGF0b3IuY2xhc3NSdWxlcyggZWxlbWVudCApLFxyXG5cdFx0XHQkLnZhbGlkYXRvci5hdHRyaWJ1dGVSdWxlcyggZWxlbWVudCApLFxyXG5cdFx0XHQkLnZhbGlkYXRvci5kYXRhUnVsZXMoIGVsZW1lbnQgKSxcclxuXHRcdFx0JC52YWxpZGF0b3Iuc3RhdGljUnVsZXMoIGVsZW1lbnQgKVxyXG5cdFx0KSwgZWxlbWVudCApO1xyXG5cclxuXHRcdC8vIE1ha2Ugc3VyZSByZXF1aXJlZCBpcyBhdCBmcm9udFxyXG5cdFx0aWYgKCBkYXRhLnJlcXVpcmVkICkge1xyXG5cdFx0XHRwYXJhbSA9IGRhdGEucmVxdWlyZWQ7XHJcblx0XHRcdGRlbGV0ZSBkYXRhLnJlcXVpcmVkO1xyXG5cdFx0XHRkYXRhID0gJC5leHRlbmQoIHsgcmVxdWlyZWQ6IHBhcmFtIH0sIGRhdGEgKTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBNYWtlIHN1cmUgcmVtb3RlIGlzIGF0IGJhY2tcclxuXHRcdGlmICggZGF0YS5yZW1vdGUgKSB7XHJcblx0XHRcdHBhcmFtID0gZGF0YS5yZW1vdGU7XHJcblx0XHRcdGRlbGV0ZSBkYXRhLnJlbW90ZTtcclxuXHRcdFx0ZGF0YSA9ICQuZXh0ZW5kKCBkYXRhLCB7IHJlbW90ZTogcGFyYW0gfSApO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBkYXRhO1xyXG5cdH1cclxufSApO1xyXG5cclxuLy8gQ3VzdG9tIHNlbGVjdG9yc1xyXG4kLmV4dGVuZCggJC5leHByLnBzZXVkb3MgfHwgJC5leHByWyBcIjpcIiBdLCB7XHRcdC8vICd8fCAkLmV4cHJbIFwiOlwiIF0nIGhlcmUgZW5hYmxlcyBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eSB0byBqUXVlcnkgMS43LiBDYW4gYmUgcmVtb3ZlZCB3aGVuIGRyb3BwaW5nIGpRIDEuNy54IHN1cHBvcnRcclxuXHJcblx0Ly8gaHR0cHM6Ly9qcXVlcnl2YWxpZGF0aW9uLm9yZy9ibGFuay1zZWxlY3Rvci9cclxuXHRibGFuazogZnVuY3Rpb24oIGEgKSB7XHJcblx0XHRyZXR1cm4gISQudHJpbSggXCJcIiArICQoIGEgKS52YWwoKSApO1xyXG5cdH0sXHJcblxyXG5cdC8vIGh0dHBzOi8vanF1ZXJ5dmFsaWRhdGlvbi5vcmcvZmlsbGVkLXNlbGVjdG9yL1xyXG5cdGZpbGxlZDogZnVuY3Rpb24oIGEgKSB7XHJcblx0XHR2YXIgdmFsID0gJCggYSApLnZhbCgpO1xyXG5cdFx0cmV0dXJuIHZhbCAhPT0gbnVsbCAmJiAhISQudHJpbSggXCJcIiArIHZhbCApO1xyXG5cdH0sXHJcblxyXG5cdC8vIGh0dHBzOi8vanF1ZXJ5dmFsaWRhdGlvbi5vcmcvdW5jaGVja2VkLXNlbGVjdG9yL1xyXG5cdHVuY2hlY2tlZDogZnVuY3Rpb24oIGEgKSB7XHJcblx0XHRyZXR1cm4gISQoIGEgKS5wcm9wKCBcImNoZWNrZWRcIiApO1xyXG5cdH1cclxufSApO1xyXG5cclxuLy8gQ29uc3RydWN0b3IgZm9yIHZhbGlkYXRvclxyXG4kLnZhbGlkYXRvciA9IGZ1bmN0aW9uKCBvcHRpb25zLCBmb3JtICkge1xyXG5cdHRoaXMuc2V0dGluZ3MgPSAkLmV4dGVuZCggdHJ1ZSwge30sICQudmFsaWRhdG9yLmRlZmF1bHRzLCBvcHRpb25zICk7XHJcblx0dGhpcy5jdXJyZW50Rm9ybSA9IGZvcm07XHJcblx0dGhpcy5pbml0KCk7XHJcbn07XHJcblxyXG4vLyBodHRwczovL2pxdWVyeXZhbGlkYXRpb24ub3JnL2pRdWVyeS52YWxpZGF0b3IuZm9ybWF0L1xyXG4kLnZhbGlkYXRvci5mb3JtYXQgPSBmdW5jdGlvbiggc291cmNlLCBwYXJhbXMgKSB7XHJcblx0aWYgKCBhcmd1bWVudHMubGVuZ3RoID09PSAxICkge1xyXG5cdFx0cmV0dXJuIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHR2YXIgYXJncyA9ICQubWFrZUFycmF5KCBhcmd1bWVudHMgKTtcclxuXHRcdFx0YXJncy51bnNoaWZ0KCBzb3VyY2UgKTtcclxuXHRcdFx0cmV0dXJuICQudmFsaWRhdG9yLmZvcm1hdC5hcHBseSggdGhpcywgYXJncyApO1xyXG5cdFx0fTtcclxuXHR9XHJcblx0aWYgKCBwYXJhbXMgPT09IHVuZGVmaW5lZCApIHtcclxuXHRcdHJldHVybiBzb3VyY2U7XHJcblx0fVxyXG5cdGlmICggYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgcGFyYW1zLmNvbnN0cnVjdG9yICE9PSBBcnJheSAgKSB7XHJcblx0XHRwYXJhbXMgPSAkLm1ha2VBcnJheSggYXJndW1lbnRzICkuc2xpY2UoIDEgKTtcclxuXHR9XHJcblx0aWYgKCBwYXJhbXMuY29uc3RydWN0b3IgIT09IEFycmF5ICkge1xyXG5cdFx0cGFyYW1zID0gWyBwYXJhbXMgXTtcclxuXHR9XHJcblx0JC5lYWNoKCBwYXJhbXMsIGZ1bmN0aW9uKCBpLCBuICkge1xyXG5cdFx0c291cmNlID0gc291cmNlLnJlcGxhY2UoIG5ldyBSZWdFeHAoIFwiXFxcXHtcIiArIGkgKyBcIlxcXFx9XCIsIFwiZ1wiICksIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRyZXR1cm4gbjtcclxuXHRcdH0gKTtcclxuXHR9ICk7XHJcblx0cmV0dXJuIHNvdXJjZTtcclxufTtcclxuXHJcbiQuZXh0ZW5kKCAkLnZhbGlkYXRvciwge1xyXG5cclxuXHRkZWZhdWx0czoge1xyXG5cdFx0bWVzc2FnZXM6IHt9LFxyXG5cdFx0Z3JvdXBzOiB7fSxcclxuXHRcdHJ1bGVzOiB7fSxcclxuXHRcdGVycm9yQ2xhc3M6IFwiZXJyb3JcIixcclxuXHRcdHBlbmRpbmdDbGFzczogXCJwZW5kaW5nXCIsXHJcblx0XHR2YWxpZENsYXNzOiBcInZhbGlkXCIsXHJcblx0XHRlcnJvckVsZW1lbnQ6IFwibGFiZWxcIixcclxuXHRcdGZvY3VzQ2xlYW51cDogZmFsc2UsXHJcblx0XHRmb2N1c0ludmFsaWQ6IHRydWUsXHJcblx0XHRlcnJvckNvbnRhaW5lcjogJCggW10gKSxcclxuXHRcdGVycm9yTGFiZWxDb250YWluZXI6ICQoIFtdICksXHJcblx0XHRvbnN1Ym1pdDogdHJ1ZSxcclxuXHRcdGlnbm9yZTogXCI6aGlkZGVuXCIsXHJcblx0XHRpZ25vcmVUaXRsZTogZmFsc2UsXHJcblx0XHRvbmZvY3VzaW46IGZ1bmN0aW9uKCBlbGVtZW50ICkge1xyXG5cdFx0XHR0aGlzLmxhc3RBY3RpdmUgPSBlbGVtZW50O1xyXG5cclxuXHRcdFx0Ly8gSGlkZSBlcnJvciBsYWJlbCBhbmQgcmVtb3ZlIGVycm9yIGNsYXNzIG9uIGZvY3VzIGlmIGVuYWJsZWRcclxuXHRcdFx0aWYgKCB0aGlzLnNldHRpbmdzLmZvY3VzQ2xlYW51cCApIHtcclxuXHRcdFx0XHRpZiAoIHRoaXMuc2V0dGluZ3MudW5oaWdobGlnaHQgKSB7XHJcblx0XHRcdFx0XHR0aGlzLnNldHRpbmdzLnVuaGlnaGxpZ2h0LmNhbGwoIHRoaXMsIGVsZW1lbnQsIHRoaXMuc2V0dGluZ3MuZXJyb3JDbGFzcywgdGhpcy5zZXR0aW5ncy52YWxpZENsYXNzICk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdHRoaXMuaGlkZVRoZXNlKCB0aGlzLmVycm9yc0ZvciggZWxlbWVudCApICk7XHJcblx0XHRcdH1cclxuXHRcdH0sXHJcblx0XHRvbmZvY3Vzb3V0OiBmdW5jdGlvbiggZWxlbWVudCApIHtcclxuXHRcdFx0aWYgKCAhdGhpcy5jaGVja2FibGUoIGVsZW1lbnQgKSAmJiAoIGVsZW1lbnQubmFtZSBpbiB0aGlzLnN1Ym1pdHRlZCB8fCAhdGhpcy5vcHRpb25hbCggZWxlbWVudCApICkgKSB7XHJcblx0XHRcdFx0dGhpcy5lbGVtZW50KCBlbGVtZW50ICk7XHJcblx0XHRcdH1cclxuXHRcdH0sXHJcblx0XHRvbmtleXVwOiBmdW5jdGlvbiggZWxlbWVudCwgZXZlbnQgKSB7XHJcblxyXG5cdFx0XHQvLyBBdm9pZCByZXZhbGlkYXRlIHRoZSBmaWVsZCB3aGVuIHByZXNzaW5nIG9uZSBvZiB0aGUgZm9sbG93aW5nIGtleXNcclxuXHRcdFx0Ly8gU2hpZnQgICAgICAgPT4gMTZcclxuXHRcdFx0Ly8gQ3RybCAgICAgICAgPT4gMTdcclxuXHRcdFx0Ly8gQWx0ICAgICAgICAgPT4gMThcclxuXHRcdFx0Ly8gQ2FwcyBsb2NrICAgPT4gMjBcclxuXHRcdFx0Ly8gRW5kICAgICAgICAgPT4gMzVcclxuXHRcdFx0Ly8gSG9tZSAgICAgICAgPT4gMzZcclxuXHRcdFx0Ly8gTGVmdCBhcnJvdyAgPT4gMzdcclxuXHRcdFx0Ly8gVXAgYXJyb3cgICAgPT4gMzhcclxuXHRcdFx0Ly8gUmlnaHQgYXJyb3cgPT4gMzlcclxuXHRcdFx0Ly8gRG93biBhcnJvdyAgPT4gNDBcclxuXHRcdFx0Ly8gSW5zZXJ0ICAgICAgPT4gNDVcclxuXHRcdFx0Ly8gTnVtIGxvY2sgICAgPT4gMTQ0XHJcblx0XHRcdC8vIEFsdEdyIGtleSAgID0+IDIyNVxyXG5cdFx0XHR2YXIgZXhjbHVkZWRLZXlzID0gW1xyXG5cdFx0XHRcdDE2LCAxNywgMTgsIDIwLCAzNSwgMzYsIDM3LFxyXG5cdFx0XHRcdDM4LCAzOSwgNDAsIDQ1LCAxNDQsIDIyNVxyXG5cdFx0XHRdO1xyXG5cclxuXHRcdFx0aWYgKCBldmVudC53aGljaCA9PT0gOSAmJiB0aGlzLmVsZW1lbnRWYWx1ZSggZWxlbWVudCApID09PSBcIlwiIHx8ICQuaW5BcnJheSggZXZlbnQua2V5Q29kZSwgZXhjbHVkZWRLZXlzICkgIT09IC0xICkge1xyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0fSBlbHNlIGlmICggZWxlbWVudC5uYW1lIGluIHRoaXMuc3VibWl0dGVkIHx8IGVsZW1lbnQubmFtZSBpbiB0aGlzLmludmFsaWQgKSB7XHJcblx0XHRcdFx0dGhpcy5lbGVtZW50KCBlbGVtZW50ICk7XHJcblx0XHRcdH1cclxuXHRcdH0sXHJcblx0XHRvbmNsaWNrOiBmdW5jdGlvbiggZWxlbWVudCApIHtcclxuXHJcblx0XHRcdC8vIENsaWNrIG9uIHNlbGVjdHMsIHJhZGlvYnV0dG9ucyBhbmQgY2hlY2tib3hlc1xyXG5cdFx0XHRpZiAoIGVsZW1lbnQubmFtZSBpbiB0aGlzLnN1Ym1pdHRlZCApIHtcclxuXHRcdFx0XHR0aGlzLmVsZW1lbnQoIGVsZW1lbnQgKTtcclxuXHJcblx0XHRcdC8vIE9yIG9wdGlvbiBlbGVtZW50cywgY2hlY2sgcGFyZW50IHNlbGVjdCBpbiB0aGF0IGNhc2VcclxuXHRcdFx0fSBlbHNlIGlmICggZWxlbWVudC5wYXJlbnROb2RlLm5hbWUgaW4gdGhpcy5zdWJtaXR0ZWQgKSB7XHJcblx0XHRcdFx0dGhpcy5lbGVtZW50KCBlbGVtZW50LnBhcmVudE5vZGUgKTtcclxuXHRcdFx0fVxyXG5cdFx0fSxcclxuXHRcdGhpZ2hsaWdodDogZnVuY3Rpb24oIGVsZW1lbnQsIGVycm9yQ2xhc3MsIHZhbGlkQ2xhc3MgKSB7XHJcblx0XHRcdGlmICggZWxlbWVudC50eXBlID09PSBcInJhZGlvXCIgKSB7XHJcblx0XHRcdFx0dGhpcy5maW5kQnlOYW1lKCBlbGVtZW50Lm5hbWUgKS5hZGRDbGFzcyggZXJyb3JDbGFzcyApLnJlbW92ZUNsYXNzKCB2YWxpZENsYXNzICk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0JCggZWxlbWVudCApLmFkZENsYXNzKCBlcnJvckNsYXNzICkucmVtb3ZlQ2xhc3MoIHZhbGlkQ2xhc3MgKTtcclxuXHRcdFx0fVxyXG5cdFx0fSxcclxuXHRcdHVuaGlnaGxpZ2h0OiBmdW5jdGlvbiggZWxlbWVudCwgZXJyb3JDbGFzcywgdmFsaWRDbGFzcyApIHtcclxuXHRcdFx0aWYgKCBlbGVtZW50LnR5cGUgPT09IFwicmFkaW9cIiApIHtcclxuXHRcdFx0XHR0aGlzLmZpbmRCeU5hbWUoIGVsZW1lbnQubmFtZSApLnJlbW92ZUNsYXNzKCBlcnJvckNsYXNzICkuYWRkQ2xhc3MoIHZhbGlkQ2xhc3MgKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHQkKCBlbGVtZW50ICkucmVtb3ZlQ2xhc3MoIGVycm9yQ2xhc3MgKS5hZGRDbGFzcyggdmFsaWRDbGFzcyApO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0Ly8gaHR0cHM6Ly9qcXVlcnl2YWxpZGF0aW9uLm9yZy9qUXVlcnkudmFsaWRhdG9yLnNldERlZmF1bHRzL1xyXG5cdHNldERlZmF1bHRzOiBmdW5jdGlvbiggc2V0dGluZ3MgKSB7XHJcblx0XHQkLmV4dGVuZCggJC52YWxpZGF0b3IuZGVmYXVsdHMsIHNldHRpbmdzICk7XHJcblx0fSxcclxuXHJcblx0bWVzc2FnZXM6IHtcclxuXHRcdHJlcXVpcmVkOiBcIlRoaXMgZmllbGQgaXMgcmVxdWlyZWQuXCIsXHJcblx0XHRyZW1vdGU6IFwiUGxlYXNlIGZpeCB0aGlzIGZpZWxkLlwiLFxyXG5cdFx0ZW1haWw6IFwiUGxlYXNlIGVudGVyIGEgdmFsaWQgZW1haWwgYWRkcmVzcy5cIixcclxuXHRcdHVybDogXCJQbGVhc2UgZW50ZXIgYSB2YWxpZCBVUkwuXCIsXHJcblx0XHRkYXRlOiBcIlBsZWFzZSBlbnRlciBhIHZhbGlkIGRhdGUuXCIsXHJcblx0XHRkYXRlSVNPOiBcIlBsZWFzZSBlbnRlciBhIHZhbGlkIGRhdGUgKElTTykuXCIsXHJcblx0XHRudW1iZXI6IFwiUGxlYXNlIGVudGVyIGEgdmFsaWQgbnVtYmVyLlwiLFxyXG5cdFx0ZGlnaXRzOiBcIlBsZWFzZSBlbnRlciBvbmx5IGRpZ2l0cy5cIixcclxuXHRcdGVxdWFsVG86IFwiUGxlYXNlIGVudGVyIHRoZSBzYW1lIHZhbHVlIGFnYWluLlwiLFxyXG5cdFx0bWF4bGVuZ3RoOiAkLnZhbGlkYXRvci5mb3JtYXQoIFwiUGxlYXNlIGVudGVyIG5vIG1vcmUgdGhhbiB7MH0gY2hhcmFjdGVycy5cIiApLFxyXG5cdFx0bWlubGVuZ3RoOiAkLnZhbGlkYXRvci5mb3JtYXQoIFwiUGxlYXNlIGVudGVyIGF0IGxlYXN0IHswfSBjaGFyYWN0ZXJzLlwiICksXHJcblx0XHRyYW5nZWxlbmd0aDogJC52YWxpZGF0b3IuZm9ybWF0KCBcIlBsZWFzZSBlbnRlciBhIHZhbHVlIGJldHdlZW4gezB9IGFuZCB7MX0gY2hhcmFjdGVycyBsb25nLlwiICksXHJcblx0XHRyYW5nZTogJC52YWxpZGF0b3IuZm9ybWF0KCBcIlBsZWFzZSBlbnRlciBhIHZhbHVlIGJldHdlZW4gezB9IGFuZCB7MX0uXCIgKSxcclxuXHRcdG1heDogJC52YWxpZGF0b3IuZm9ybWF0KCBcIlBsZWFzZSBlbnRlciBhIHZhbHVlIGxlc3MgdGhhbiBvciBlcXVhbCB0byB7MH0uXCIgKSxcclxuXHRcdG1pbjogJC52YWxpZGF0b3IuZm9ybWF0KCBcIlBsZWFzZSBlbnRlciBhIHZhbHVlIGdyZWF0ZXIgdGhhbiBvciBlcXVhbCB0byB7MH0uXCIgKSxcclxuXHRcdHN0ZXA6ICQudmFsaWRhdG9yLmZvcm1hdCggXCJQbGVhc2UgZW50ZXIgYSBtdWx0aXBsZSBvZiB7MH0uXCIgKVxyXG5cdH0sXHJcblxyXG5cdGF1dG9DcmVhdGVSYW5nZXM6IGZhbHNlLFxyXG5cclxuXHRwcm90b3R5cGU6IHtcclxuXHJcblx0XHRpbml0OiBmdW5jdGlvbigpIHtcclxuXHRcdFx0dGhpcy5sYWJlbENvbnRhaW5lciA9ICQoIHRoaXMuc2V0dGluZ3MuZXJyb3JMYWJlbENvbnRhaW5lciApO1xyXG5cdFx0XHR0aGlzLmVycm9yQ29udGV4dCA9IHRoaXMubGFiZWxDb250YWluZXIubGVuZ3RoICYmIHRoaXMubGFiZWxDb250YWluZXIgfHwgJCggdGhpcy5jdXJyZW50Rm9ybSApO1xyXG5cdFx0XHR0aGlzLmNvbnRhaW5lcnMgPSAkKCB0aGlzLnNldHRpbmdzLmVycm9yQ29udGFpbmVyICkuYWRkKCB0aGlzLnNldHRpbmdzLmVycm9yTGFiZWxDb250YWluZXIgKTtcclxuXHRcdFx0dGhpcy5zdWJtaXR0ZWQgPSB7fTtcclxuXHRcdFx0dGhpcy52YWx1ZUNhY2hlID0ge307XHJcblx0XHRcdHRoaXMucGVuZGluZ1JlcXVlc3QgPSAwO1xyXG5cdFx0XHR0aGlzLnBlbmRpbmcgPSB7fTtcclxuXHRcdFx0dGhpcy5pbnZhbGlkID0ge307XHJcblx0XHRcdHRoaXMucmVzZXQoKTtcclxuXHJcblx0XHRcdHZhciBncm91cHMgPSAoIHRoaXMuZ3JvdXBzID0ge30gKSxcclxuXHRcdFx0XHRydWxlcztcclxuXHRcdFx0JC5lYWNoKCB0aGlzLnNldHRpbmdzLmdyb3VwcywgZnVuY3Rpb24oIGtleSwgdmFsdWUgKSB7XHJcblx0XHRcdFx0aWYgKCB0eXBlb2YgdmFsdWUgPT09IFwic3RyaW5nXCIgKSB7XHJcblx0XHRcdFx0XHR2YWx1ZSA9IHZhbHVlLnNwbGl0KCAvXFxzLyApO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQkLmVhY2goIHZhbHVlLCBmdW5jdGlvbiggaW5kZXgsIG5hbWUgKSB7XHJcblx0XHRcdFx0XHRncm91cHNbIG5hbWUgXSA9IGtleTtcclxuXHRcdFx0XHR9ICk7XHJcblx0XHRcdH0gKTtcclxuXHRcdFx0cnVsZXMgPSB0aGlzLnNldHRpbmdzLnJ1bGVzO1xyXG5cdFx0XHQkLmVhY2goIHJ1bGVzLCBmdW5jdGlvbigga2V5LCB2YWx1ZSApIHtcclxuXHRcdFx0XHRydWxlc1sga2V5IF0gPSAkLnZhbGlkYXRvci5ub3JtYWxpemVSdWxlKCB2YWx1ZSApO1xyXG5cdFx0XHR9ICk7XHJcblxyXG5cdFx0XHRmdW5jdGlvbiBkZWxlZ2F0ZSggZXZlbnQgKSB7XHJcblxyXG5cdFx0XHRcdC8vIFNldCBmb3JtIGV4cGFuZG8gb24gY29udGVudGVkaXRhYmxlXHJcblx0XHRcdFx0aWYgKCAhdGhpcy5mb3JtICYmIHRoaXMuaGFzQXR0cmlidXRlKCBcImNvbnRlbnRlZGl0YWJsZVwiICkgKSB7XHJcblx0XHRcdFx0XHR0aGlzLmZvcm0gPSAkKCB0aGlzICkuY2xvc2VzdCggXCJmb3JtXCIgKVsgMCBdO1xyXG5cdFx0XHRcdFx0dGhpcy5uYW1lID0gJCggdGhpcyApLmF0dHIoIFwibmFtZVwiICk7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHR2YXIgdmFsaWRhdG9yID0gJC5kYXRhKCB0aGlzLmZvcm0sIFwidmFsaWRhdG9yXCIgKSxcclxuXHRcdFx0XHRcdGV2ZW50VHlwZSA9IFwib25cIiArIGV2ZW50LnR5cGUucmVwbGFjZSggL152YWxpZGF0ZS8sIFwiXCIgKSxcclxuXHRcdFx0XHRcdHNldHRpbmdzID0gdmFsaWRhdG9yLnNldHRpbmdzO1xyXG5cdFx0XHRcdGlmICggc2V0dGluZ3NbIGV2ZW50VHlwZSBdICYmICEkKCB0aGlzICkuaXMoIHNldHRpbmdzLmlnbm9yZSApICkge1xyXG5cdFx0XHRcdFx0c2V0dGluZ3NbIGV2ZW50VHlwZSBdLmNhbGwoIHZhbGlkYXRvciwgdGhpcywgZXZlbnQgKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdCQoIHRoaXMuY3VycmVudEZvcm0gKVxyXG5cdFx0XHRcdC5vbiggXCJmb2N1c2luLnZhbGlkYXRlIGZvY3Vzb3V0LnZhbGlkYXRlIGtleXVwLnZhbGlkYXRlXCIsXHJcblx0XHRcdFx0XHRcIjp0ZXh0LCBbdHlwZT0ncGFzc3dvcmQnXSwgW3R5cGU9J2ZpbGUnXSwgc2VsZWN0LCB0ZXh0YXJlYSwgW3R5cGU9J251bWJlciddLCBbdHlwZT0nc2VhcmNoJ10sIFwiICtcclxuXHRcdFx0XHRcdFwiW3R5cGU9J3RlbCddLCBbdHlwZT0ndXJsJ10sIFt0eXBlPSdlbWFpbCddLCBbdHlwZT0nZGF0ZXRpbWUnXSwgW3R5cGU9J2RhdGUnXSwgW3R5cGU9J21vbnRoJ10sIFwiICtcclxuXHRcdFx0XHRcdFwiW3R5cGU9J3dlZWsnXSwgW3R5cGU9J3RpbWUnXSwgW3R5cGU9J2RhdGV0aW1lLWxvY2FsJ10sIFt0eXBlPSdyYW5nZSddLCBbdHlwZT0nY29sb3InXSwgXCIgK1xyXG5cdFx0XHRcdFx0XCJbdHlwZT0ncmFkaW8nXSwgW3R5cGU9J2NoZWNrYm94J10sIFtjb250ZW50ZWRpdGFibGVdLCBbdHlwZT0nYnV0dG9uJ11cIiwgZGVsZWdhdGUgKVxyXG5cclxuXHRcdFx0XHQvLyBTdXBwb3J0OiBDaHJvbWUsIG9sZElFXHJcblx0XHRcdFx0Ly8gXCJzZWxlY3RcIiBpcyBwcm92aWRlZCBhcyBldmVudC50YXJnZXQgd2hlbiBjbGlja2luZyBhIG9wdGlvblxyXG5cdFx0XHRcdC5vbiggXCJjbGljay52YWxpZGF0ZVwiLCBcInNlbGVjdCwgb3B0aW9uLCBbdHlwZT0ncmFkaW8nXSwgW3R5cGU9J2NoZWNrYm94J11cIiwgZGVsZWdhdGUgKTtcclxuXHJcblx0XHRcdGlmICggdGhpcy5zZXR0aW5ncy5pbnZhbGlkSGFuZGxlciApIHtcclxuXHRcdFx0XHQkKCB0aGlzLmN1cnJlbnRGb3JtICkub24oIFwiaW52YWxpZC1mb3JtLnZhbGlkYXRlXCIsIHRoaXMuc2V0dGluZ3MuaW52YWxpZEhhbmRsZXIgKTtcclxuXHRcdFx0fVxyXG5cdFx0fSxcclxuXHJcblx0XHQvLyBodHRwczovL2pxdWVyeXZhbGlkYXRpb24ub3JnL1ZhbGlkYXRvci5mb3JtL1xyXG5cdFx0Zm9ybTogZnVuY3Rpb24oKSB7XHJcblx0XHRcdHRoaXMuY2hlY2tGb3JtKCk7XHJcblx0XHRcdCQuZXh0ZW5kKCB0aGlzLnN1Ym1pdHRlZCwgdGhpcy5lcnJvck1hcCApO1xyXG5cdFx0XHR0aGlzLmludmFsaWQgPSAkLmV4dGVuZCgge30sIHRoaXMuZXJyb3JNYXAgKTtcclxuXHRcdFx0aWYgKCAhdGhpcy52YWxpZCgpICkge1xyXG5cdFx0XHRcdCQoIHRoaXMuY3VycmVudEZvcm0gKS50cmlnZ2VySGFuZGxlciggXCJpbnZhbGlkLWZvcm1cIiwgWyB0aGlzIF0gKTtcclxuXHRcdFx0fVxyXG5cdFx0XHR0aGlzLnNob3dFcnJvcnMoKTtcclxuXHRcdFx0cmV0dXJuIHRoaXMudmFsaWQoKTtcclxuXHRcdH0sXHJcblxyXG5cdFx0Y2hlY2tGb3JtOiBmdW5jdGlvbigpIHtcclxuXHRcdFx0dGhpcy5wcmVwYXJlRm9ybSgpO1xyXG5cdFx0XHRmb3IgKCB2YXIgaSA9IDAsIGVsZW1lbnRzID0gKCB0aGlzLmN1cnJlbnRFbGVtZW50cyA9IHRoaXMuZWxlbWVudHMoKSApOyBlbGVtZW50c1sgaSBdOyBpKysgKSB7XHJcblx0XHRcdFx0dGhpcy5jaGVjayggZWxlbWVudHNbIGkgXSApO1xyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiB0aGlzLnZhbGlkKCk7XHJcblx0XHR9LFxyXG5cclxuXHRcdC8vIGh0dHBzOi8vanF1ZXJ5dmFsaWRhdGlvbi5vcmcvVmFsaWRhdG9yLmVsZW1lbnQvXHJcblx0XHRlbGVtZW50OiBmdW5jdGlvbiggZWxlbWVudCApIHtcclxuXHRcdFx0dmFyIGNsZWFuRWxlbWVudCA9IHRoaXMuY2xlYW4oIGVsZW1lbnQgKSxcclxuXHRcdFx0XHRjaGVja0VsZW1lbnQgPSB0aGlzLnZhbGlkYXRpb25UYXJnZXRGb3IoIGNsZWFuRWxlbWVudCApLFxyXG5cdFx0XHRcdHYgPSB0aGlzLFxyXG5cdFx0XHRcdHJlc3VsdCA9IHRydWUsXHJcblx0XHRcdFx0cnMsIGdyb3VwO1xyXG5cclxuXHRcdFx0aWYgKCBjaGVja0VsZW1lbnQgPT09IHVuZGVmaW5lZCApIHtcclxuXHRcdFx0XHRkZWxldGUgdGhpcy5pbnZhbGlkWyBjbGVhbkVsZW1lbnQubmFtZSBdO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHRoaXMucHJlcGFyZUVsZW1lbnQoIGNoZWNrRWxlbWVudCApO1xyXG5cdFx0XHRcdHRoaXMuY3VycmVudEVsZW1lbnRzID0gJCggY2hlY2tFbGVtZW50ICk7XHJcblxyXG5cdFx0XHRcdC8vIElmIHRoaXMgZWxlbWVudCBpcyBncm91cGVkLCB0aGVuIHZhbGlkYXRlIGFsbCBncm91cCBlbGVtZW50cyBhbHJlYWR5XHJcblx0XHRcdFx0Ly8gY29udGFpbmluZyBhIHZhbHVlXHJcblx0XHRcdFx0Z3JvdXAgPSB0aGlzLmdyb3Vwc1sgY2hlY2tFbGVtZW50Lm5hbWUgXTtcclxuXHRcdFx0XHRpZiAoIGdyb3VwICkge1xyXG5cdFx0XHRcdFx0JC5lYWNoKCB0aGlzLmdyb3VwcywgZnVuY3Rpb24oIG5hbWUsIHRlc3Rncm91cCApIHtcclxuXHRcdFx0XHRcdFx0aWYgKCB0ZXN0Z3JvdXAgPT09IGdyb3VwICYmIG5hbWUgIT09IGNoZWNrRWxlbWVudC5uYW1lICkge1xyXG5cdFx0XHRcdFx0XHRcdGNsZWFuRWxlbWVudCA9IHYudmFsaWRhdGlvblRhcmdldEZvciggdi5jbGVhbiggdi5maW5kQnlOYW1lKCBuYW1lICkgKSApO1xyXG5cdFx0XHRcdFx0XHRcdGlmICggY2xlYW5FbGVtZW50ICYmIGNsZWFuRWxlbWVudC5uYW1lIGluIHYuaW52YWxpZCApIHtcclxuXHRcdFx0XHRcdFx0XHRcdHYuY3VycmVudEVsZW1lbnRzLnB1c2goIGNsZWFuRWxlbWVudCApO1xyXG5cdFx0XHRcdFx0XHRcdFx0cmVzdWx0ID0gdi5jaGVjayggY2xlYW5FbGVtZW50ICkgJiYgcmVzdWx0O1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fSApO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0cnMgPSB0aGlzLmNoZWNrKCBjaGVja0VsZW1lbnQgKSAhPT0gZmFsc2U7XHJcblx0XHRcdFx0cmVzdWx0ID0gcmVzdWx0ICYmIHJzO1xyXG5cdFx0XHRcdGlmICggcnMgKSB7XHJcblx0XHRcdFx0XHR0aGlzLmludmFsaWRbIGNoZWNrRWxlbWVudC5uYW1lIF0gPSBmYWxzZTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0dGhpcy5pbnZhbGlkWyBjaGVja0VsZW1lbnQubmFtZSBdID0gdHJ1ZTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdGlmICggIXRoaXMubnVtYmVyT2ZJbnZhbGlkcygpICkge1xyXG5cclxuXHRcdFx0XHRcdC8vIEhpZGUgZXJyb3IgY29udGFpbmVycyBvbiBsYXN0IGVycm9yXHJcblx0XHRcdFx0XHR0aGlzLnRvSGlkZSA9IHRoaXMudG9IaWRlLmFkZCggdGhpcy5jb250YWluZXJzICk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdHRoaXMuc2hvd0Vycm9ycygpO1xyXG5cclxuXHRcdFx0XHQvLyBBZGQgYXJpYS1pbnZhbGlkIHN0YXR1cyBmb3Igc2NyZWVuIHJlYWRlcnNcclxuXHRcdFx0XHQkKCBlbGVtZW50ICkuYXR0ciggXCJhcmlhLWludmFsaWRcIiwgIXJzICk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJldHVybiByZXN1bHQ7XHJcblx0XHR9LFxyXG5cclxuXHRcdC8vIGh0dHBzOi8vanF1ZXJ5dmFsaWRhdGlvbi5vcmcvVmFsaWRhdG9yLnNob3dFcnJvcnMvXHJcblx0XHRzaG93RXJyb3JzOiBmdW5jdGlvbiggZXJyb3JzICkge1xyXG5cdFx0XHRpZiAoIGVycm9ycyApIHtcclxuXHRcdFx0XHR2YXIgdmFsaWRhdG9yID0gdGhpcztcclxuXHJcblx0XHRcdFx0Ly8gQWRkIGl0ZW1zIHRvIGVycm9yIGxpc3QgYW5kIG1hcFxyXG5cdFx0XHRcdCQuZXh0ZW5kKCB0aGlzLmVycm9yTWFwLCBlcnJvcnMgKTtcclxuXHRcdFx0XHR0aGlzLmVycm9yTGlzdCA9ICQubWFwKCB0aGlzLmVycm9yTWFwLCBmdW5jdGlvbiggbWVzc2FnZSwgbmFtZSApIHtcclxuXHRcdFx0XHRcdHJldHVybiB7XHJcblx0XHRcdFx0XHRcdG1lc3NhZ2U6IG1lc3NhZ2UsXHJcblx0XHRcdFx0XHRcdGVsZW1lbnQ6IHZhbGlkYXRvci5maW5kQnlOYW1lKCBuYW1lIClbIDAgXVxyXG5cdFx0XHRcdFx0fTtcclxuXHRcdFx0XHR9ICk7XHJcblxyXG5cdFx0XHRcdC8vIFJlbW92ZSBpdGVtcyBmcm9tIHN1Y2Nlc3MgbGlzdFxyXG5cdFx0XHRcdHRoaXMuc3VjY2Vzc0xpc3QgPSAkLmdyZXAoIHRoaXMuc3VjY2Vzc0xpc3QsIGZ1bmN0aW9uKCBlbGVtZW50ICkge1xyXG5cdFx0XHRcdFx0cmV0dXJuICEoIGVsZW1lbnQubmFtZSBpbiBlcnJvcnMgKTtcclxuXHRcdFx0XHR9ICk7XHJcblx0XHRcdH1cclxuXHRcdFx0aWYgKCB0aGlzLnNldHRpbmdzLnNob3dFcnJvcnMgKSB7XHJcblx0XHRcdFx0dGhpcy5zZXR0aW5ncy5zaG93RXJyb3JzLmNhbGwoIHRoaXMsIHRoaXMuZXJyb3JNYXAsIHRoaXMuZXJyb3JMaXN0ICk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0dGhpcy5kZWZhdWx0U2hvd0Vycm9ycygpO1xyXG5cdFx0XHR9XHJcblx0XHR9LFxyXG5cclxuXHRcdC8vIGh0dHBzOi8vanF1ZXJ5dmFsaWRhdGlvbi5vcmcvVmFsaWRhdG9yLnJlc2V0Rm9ybS9cclxuXHRcdHJlc2V0Rm9ybTogZnVuY3Rpb24oKSB7XHJcblx0XHRcdGlmICggJC5mbi5yZXNldEZvcm0gKSB7XHJcblx0XHRcdFx0JCggdGhpcy5jdXJyZW50Rm9ybSApLnJlc2V0Rm9ybSgpO1xyXG5cdFx0XHR9XHJcblx0XHRcdHRoaXMuaW52YWxpZCA9IHt9O1xyXG5cdFx0XHR0aGlzLnN1Ym1pdHRlZCA9IHt9O1xyXG5cdFx0XHR0aGlzLnByZXBhcmVGb3JtKCk7XHJcblx0XHRcdHRoaXMuaGlkZUVycm9ycygpO1xyXG5cdFx0XHR2YXIgZWxlbWVudHMgPSB0aGlzLmVsZW1lbnRzKClcclxuXHRcdFx0XHQucmVtb3ZlRGF0YSggXCJwcmV2aW91c1ZhbHVlXCIgKVxyXG5cdFx0XHRcdC5yZW1vdmVBdHRyKCBcImFyaWEtaW52YWxpZFwiICk7XHJcblxyXG5cdFx0XHR0aGlzLnJlc2V0RWxlbWVudHMoIGVsZW1lbnRzICk7XHJcblx0XHR9LFxyXG5cclxuXHRcdHJlc2V0RWxlbWVudHM6IGZ1bmN0aW9uKCBlbGVtZW50cyApIHtcclxuXHRcdFx0dmFyIGk7XHJcblxyXG5cdFx0XHRpZiAoIHRoaXMuc2V0dGluZ3MudW5oaWdobGlnaHQgKSB7XHJcblx0XHRcdFx0Zm9yICggaSA9IDA7IGVsZW1lbnRzWyBpIF07IGkrKyApIHtcclxuXHRcdFx0XHRcdHRoaXMuc2V0dGluZ3MudW5oaWdobGlnaHQuY2FsbCggdGhpcywgZWxlbWVudHNbIGkgXSxcclxuXHRcdFx0XHRcdFx0dGhpcy5zZXR0aW5ncy5lcnJvckNsYXNzLCBcIlwiICk7XHJcblx0XHRcdFx0XHR0aGlzLmZpbmRCeU5hbWUoIGVsZW1lbnRzWyBpIF0ubmFtZSApLnJlbW92ZUNsYXNzKCB0aGlzLnNldHRpbmdzLnZhbGlkQ2xhc3MgKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0ZWxlbWVudHNcclxuXHRcdFx0XHRcdC5yZW1vdmVDbGFzcyggdGhpcy5zZXR0aW5ncy5lcnJvckNsYXNzIClcclxuXHRcdFx0XHRcdC5yZW1vdmVDbGFzcyggdGhpcy5zZXR0aW5ncy52YWxpZENsYXNzICk7XHJcblx0XHRcdH1cclxuXHRcdH0sXHJcblxyXG5cdFx0bnVtYmVyT2ZJbnZhbGlkczogZnVuY3Rpb24oKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLm9iamVjdExlbmd0aCggdGhpcy5pbnZhbGlkICk7XHJcblx0XHR9LFxyXG5cclxuXHRcdG9iamVjdExlbmd0aDogZnVuY3Rpb24oIG9iaiApIHtcclxuXHRcdFx0LyoganNoaW50IHVudXNlZDogZmFsc2UgKi9cclxuXHRcdFx0dmFyIGNvdW50ID0gMCxcclxuXHRcdFx0XHRpO1xyXG5cdFx0XHRmb3IgKCBpIGluIG9iaiApIHtcclxuXHJcblx0XHRcdFx0Ly8gVGhpcyBjaGVjayBhbGxvd3MgY291bnRpbmcgZWxlbWVudHMgd2l0aCBlbXB0eSBlcnJvclxyXG5cdFx0XHRcdC8vIG1lc3NhZ2UgYXMgaW52YWxpZCBlbGVtZW50c1xyXG5cdFx0XHRcdGlmICggb2JqWyBpIF0gIT09IHVuZGVmaW5lZCAmJiBvYmpbIGkgXSAhPT0gbnVsbCAmJiBvYmpbIGkgXSAhPT0gZmFsc2UgKSB7XHJcblx0XHRcdFx0XHRjb3VudCsrO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gY291bnQ7XHJcblx0XHR9LFxyXG5cclxuXHRcdGhpZGVFcnJvcnM6IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHR0aGlzLmhpZGVUaGVzZSggdGhpcy50b0hpZGUgKTtcclxuXHRcdH0sXHJcblxyXG5cdFx0aGlkZVRoZXNlOiBmdW5jdGlvbiggZXJyb3JzICkge1xyXG5cdFx0XHRlcnJvcnMubm90KCB0aGlzLmNvbnRhaW5lcnMgKS50ZXh0KCBcIlwiICk7XHJcblx0XHRcdHRoaXMuYWRkV3JhcHBlciggZXJyb3JzICkuaGlkZSgpO1xyXG5cdFx0fSxcclxuXHJcblx0XHR2YWxpZDogZnVuY3Rpb24oKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLnNpemUoKSA9PT0gMDtcclxuXHRcdH0sXHJcblxyXG5cdFx0c2l6ZTogZnVuY3Rpb24oKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLmVycm9yTGlzdC5sZW5ndGg7XHJcblx0XHR9LFxyXG5cclxuXHRcdGZvY3VzSW52YWxpZDogZnVuY3Rpb24oKSB7XHJcblx0XHRcdGlmICggdGhpcy5zZXR0aW5ncy5mb2N1c0ludmFsaWQgKSB7XHJcblx0XHRcdFx0dHJ5IHtcclxuXHRcdFx0XHRcdCQoIHRoaXMuZmluZExhc3RBY3RpdmUoKSB8fCB0aGlzLmVycm9yTGlzdC5sZW5ndGggJiYgdGhpcy5lcnJvckxpc3RbIDAgXS5lbGVtZW50IHx8IFtdIClcclxuXHRcdFx0XHRcdC5maWx0ZXIoIFwiOnZpc2libGVcIiApXHJcblx0XHRcdFx0XHQuZm9jdXMoKVxyXG5cclxuXHRcdFx0XHRcdC8vIE1hbnVhbGx5IHRyaWdnZXIgZm9jdXNpbiBldmVudDsgd2l0aG91dCBpdCwgZm9jdXNpbiBoYW5kbGVyIGlzbid0IGNhbGxlZCwgZmluZExhc3RBY3RpdmUgd29uJ3QgaGF2ZSBhbnl0aGluZyB0byBmaW5kXHJcblx0XHRcdFx0XHQudHJpZ2dlciggXCJmb2N1c2luXCIgKTtcclxuXHRcdFx0XHR9IGNhdGNoICggZSApIHtcclxuXHJcblx0XHRcdFx0XHQvLyBJZ25vcmUgSUUgdGhyb3dpbmcgZXJyb3JzIHdoZW4gZm9jdXNpbmcgaGlkZGVuIGVsZW1lbnRzXHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9LFxyXG5cclxuXHRcdGZpbmRMYXN0QWN0aXZlOiBmdW5jdGlvbigpIHtcclxuXHRcdFx0dmFyIGxhc3RBY3RpdmUgPSB0aGlzLmxhc3RBY3RpdmU7XHJcblx0XHRcdHJldHVybiBsYXN0QWN0aXZlICYmICQuZ3JlcCggdGhpcy5lcnJvckxpc3QsIGZ1bmN0aW9uKCBuICkge1xyXG5cdFx0XHRcdHJldHVybiBuLmVsZW1lbnQubmFtZSA9PT0gbGFzdEFjdGl2ZS5uYW1lO1xyXG5cdFx0XHR9ICkubGVuZ3RoID09PSAxICYmIGxhc3RBY3RpdmU7XHJcblx0XHR9LFxyXG5cclxuXHRcdGVsZW1lbnRzOiBmdW5jdGlvbigpIHtcclxuXHRcdFx0dmFyIHZhbGlkYXRvciA9IHRoaXMsXHJcblx0XHRcdFx0cnVsZXNDYWNoZSA9IHt9O1xyXG5cclxuXHRcdFx0Ly8gU2VsZWN0IGFsbCB2YWxpZCBpbnB1dHMgaW5zaWRlIHRoZSBmb3JtIChubyBzdWJtaXQgb3IgcmVzZXQgYnV0dG9ucylcclxuXHRcdFx0cmV0dXJuICQoIHRoaXMuY3VycmVudEZvcm0gKVxyXG5cdFx0XHQuZmluZCggXCJpbnB1dCwgc2VsZWN0LCB0ZXh0YXJlYSwgW2NvbnRlbnRlZGl0YWJsZV1cIiApXHJcblx0XHRcdC5ub3QoIFwiOnN1Ym1pdCwgOnJlc2V0LCA6aW1hZ2UsIDpkaXNhYmxlZFwiIClcclxuXHRcdFx0Lm5vdCggdGhpcy5zZXR0aW5ncy5pZ25vcmUgKVxyXG5cdFx0XHQuZmlsdGVyKCBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHR2YXIgbmFtZSA9IHRoaXMubmFtZSB8fCAkKCB0aGlzICkuYXR0ciggXCJuYW1lXCIgKTsgLy8gRm9yIGNvbnRlbnRlZGl0YWJsZVxyXG5cdFx0XHRcdGlmICggIW5hbWUgJiYgdmFsaWRhdG9yLnNldHRpbmdzLmRlYnVnICYmIHdpbmRvdy5jb25zb2xlICkge1xyXG5cdFx0XHRcdFx0Y29uc29sZS5lcnJvciggXCIlbyBoYXMgbm8gbmFtZSBhc3NpZ25lZFwiLCB0aGlzICk7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHQvLyBTZXQgZm9ybSBleHBhbmRvIG9uIGNvbnRlbnRlZGl0YWJsZVxyXG5cdFx0XHRcdGlmICggdGhpcy5oYXNBdHRyaWJ1dGUoIFwiY29udGVudGVkaXRhYmxlXCIgKSApIHtcclxuXHRcdFx0XHRcdHRoaXMuZm9ybSA9ICQoIHRoaXMgKS5jbG9zZXN0KCBcImZvcm1cIiApWyAwIF07XHJcblx0XHRcdFx0XHR0aGlzLm5hbWUgPSBuYW1lO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0Ly8gU2VsZWN0IG9ubHkgdGhlIGZpcnN0IGVsZW1lbnQgZm9yIGVhY2ggbmFtZSwgYW5kIG9ubHkgdGhvc2Ugd2l0aCBydWxlcyBzcGVjaWZpZWRcclxuXHRcdFx0XHRpZiAoIG5hbWUgaW4gcnVsZXNDYWNoZSB8fCAhdmFsaWRhdG9yLm9iamVjdExlbmd0aCggJCggdGhpcyApLnJ1bGVzKCkgKSApIHtcclxuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdHJ1bGVzQ2FjaGVbIG5hbWUgXSA9IHRydWU7XHJcblx0XHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHRcdH0gKTtcclxuXHRcdH0sXHJcblxyXG5cdFx0Y2xlYW46IGZ1bmN0aW9uKCBzZWxlY3RvciApIHtcclxuXHRcdFx0cmV0dXJuICQoIHNlbGVjdG9yIClbIDAgXTtcclxuXHRcdH0sXHJcblxyXG5cdFx0ZXJyb3JzOiBmdW5jdGlvbigpIHtcclxuXHRcdFx0dmFyIGVycm9yQ2xhc3MgPSB0aGlzLnNldHRpbmdzLmVycm9yQ2xhc3Muc3BsaXQoIFwiIFwiICkuam9pbiggXCIuXCIgKTtcclxuXHRcdFx0cmV0dXJuICQoIHRoaXMuc2V0dGluZ3MuZXJyb3JFbGVtZW50ICsgXCIuXCIgKyBlcnJvckNsYXNzLCB0aGlzLmVycm9yQ29udGV4dCApO1xyXG5cdFx0fSxcclxuXHJcblx0XHRyZXNldEludGVybmFsczogZnVuY3Rpb24oKSB7XHJcblx0XHRcdHRoaXMuc3VjY2Vzc0xpc3QgPSBbXTtcclxuXHRcdFx0dGhpcy5lcnJvckxpc3QgPSBbXTtcclxuXHRcdFx0dGhpcy5lcnJvck1hcCA9IHt9O1xyXG5cdFx0XHR0aGlzLnRvU2hvdyA9ICQoIFtdICk7XHJcblx0XHRcdHRoaXMudG9IaWRlID0gJCggW10gKTtcclxuXHRcdH0sXHJcblxyXG5cdFx0cmVzZXQ6IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHR0aGlzLnJlc2V0SW50ZXJuYWxzKCk7XHJcblx0XHRcdHRoaXMuY3VycmVudEVsZW1lbnRzID0gJCggW10gKTtcclxuXHRcdH0sXHJcblxyXG5cdFx0cHJlcGFyZUZvcm06IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHR0aGlzLnJlc2V0KCk7XHJcblx0XHRcdHRoaXMudG9IaWRlID0gdGhpcy5lcnJvcnMoKS5hZGQoIHRoaXMuY29udGFpbmVycyApO1xyXG5cdFx0fSxcclxuXHJcblx0XHRwcmVwYXJlRWxlbWVudDogZnVuY3Rpb24oIGVsZW1lbnQgKSB7XHJcblx0XHRcdHRoaXMucmVzZXQoKTtcclxuXHRcdFx0dGhpcy50b0hpZGUgPSB0aGlzLmVycm9yc0ZvciggZWxlbWVudCApO1xyXG5cdFx0fSxcclxuXHJcblx0XHRlbGVtZW50VmFsdWU6IGZ1bmN0aW9uKCBlbGVtZW50ICkge1xyXG5cdFx0XHR2YXIgJGVsZW1lbnQgPSAkKCBlbGVtZW50ICksXHJcblx0XHRcdFx0dHlwZSA9IGVsZW1lbnQudHlwZSxcclxuXHRcdFx0XHR2YWwsIGlkeDtcclxuXHJcblx0XHRcdGlmICggdHlwZSA9PT0gXCJyYWRpb1wiIHx8IHR5cGUgPT09IFwiY2hlY2tib3hcIiApIHtcclxuXHRcdFx0XHRyZXR1cm4gdGhpcy5maW5kQnlOYW1lKCBlbGVtZW50Lm5hbWUgKS5maWx0ZXIoIFwiOmNoZWNrZWRcIiApLnZhbCgpO1xyXG5cdFx0XHR9IGVsc2UgaWYgKCB0eXBlID09PSBcIm51bWJlclwiICYmIHR5cGVvZiBlbGVtZW50LnZhbGlkaXR5ICE9PSBcInVuZGVmaW5lZFwiICkge1xyXG5cdFx0XHRcdHJldHVybiBlbGVtZW50LnZhbGlkaXR5LmJhZElucHV0ID8gXCJOYU5cIiA6ICRlbGVtZW50LnZhbCgpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZiAoIGVsZW1lbnQuaGFzQXR0cmlidXRlKCBcImNvbnRlbnRlZGl0YWJsZVwiICkgKSB7XHJcblx0XHRcdFx0dmFsID0gJGVsZW1lbnQudGV4dCgpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHZhbCA9ICRlbGVtZW50LnZhbCgpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZiAoIHR5cGUgPT09IFwiZmlsZVwiICkge1xyXG5cclxuXHRcdFx0XHQvLyBNb2Rlcm4gYnJvd3NlciAoY2hyb21lICYgc2FmYXJpKVxyXG5cdFx0XHRcdGlmICggdmFsLnN1YnN0ciggMCwgMTIgKSA9PT0gXCJDOlxcXFxmYWtlcGF0aFxcXFxcIiApIHtcclxuXHRcdFx0XHRcdHJldHVybiB2YWwuc3Vic3RyKCAxMiApO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0Ly8gTGVnYWN5IGJyb3dzZXJzXHJcblx0XHRcdFx0Ly8gVW5peC1iYXNlZCBwYXRoXHJcblx0XHRcdFx0aWR4ID0gdmFsLmxhc3RJbmRleE9mKCBcIi9cIiApO1xyXG5cdFx0XHRcdGlmICggaWR4ID49IDAgKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gdmFsLnN1YnN0ciggaWR4ICsgMSApO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0Ly8gV2luZG93cy1iYXNlZCBwYXRoXHJcblx0XHRcdFx0aWR4ID0gdmFsLmxhc3RJbmRleE9mKCBcIlxcXFxcIiApO1xyXG5cdFx0XHRcdGlmICggaWR4ID49IDAgKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gdmFsLnN1YnN0ciggaWR4ICsgMSApO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0Ly8gSnVzdCB0aGUgZmlsZSBuYW1lXHJcblx0XHRcdFx0cmV0dXJuIHZhbDtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0aWYgKCB0eXBlb2YgdmFsID09PSBcInN0cmluZ1wiICkge1xyXG5cdFx0XHRcdHJldHVybiB2YWwucmVwbGFjZSggL1xcci9nLCBcIlwiICk7XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIHZhbDtcclxuXHRcdH0sXHJcblxyXG5cdFx0Y2hlY2s6IGZ1bmN0aW9uKCBlbGVtZW50ICkge1xyXG5cdFx0XHRlbGVtZW50ID0gdGhpcy52YWxpZGF0aW9uVGFyZ2V0Rm9yKCB0aGlzLmNsZWFuKCBlbGVtZW50ICkgKTtcclxuXHJcblx0XHRcdHZhciBydWxlcyA9ICQoIGVsZW1lbnQgKS5ydWxlcygpLFxyXG5cdFx0XHRcdHJ1bGVzQ291bnQgPSAkLm1hcCggcnVsZXMsIGZ1bmN0aW9uKCBuLCBpICkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIGk7XHJcblx0XHRcdFx0fSApLmxlbmd0aCxcclxuXHRcdFx0XHRkZXBlbmRlbmN5TWlzbWF0Y2ggPSBmYWxzZSxcclxuXHRcdFx0XHR2YWwgPSB0aGlzLmVsZW1lbnRWYWx1ZSggZWxlbWVudCApLFxyXG5cdFx0XHRcdHJlc3VsdCwgbWV0aG9kLCBydWxlLCBub3JtYWxpemVyO1xyXG5cclxuXHRcdFx0Ly8gUHJpb3JpdGl6ZSB0aGUgbG9jYWwgbm9ybWFsaXplciBkZWZpbmVkIGZvciB0aGlzIGVsZW1lbnQgb3ZlciB0aGUgZ2xvYmFsIG9uZVxyXG5cdFx0XHQvLyBpZiB0aGUgZm9ybWVyIGV4aXN0cywgb3RoZXJ3aXNlIHVzZXIgdGhlIGdsb2JhbCBvbmUgaW4gY2FzZSBpdCBleGlzdHMuXHJcblx0XHRcdGlmICggdHlwZW9mIHJ1bGVzLm5vcm1hbGl6ZXIgPT09IFwiZnVuY3Rpb25cIiApIHtcclxuXHRcdFx0XHRub3JtYWxpemVyID0gcnVsZXMubm9ybWFsaXplcjtcclxuXHRcdFx0fSBlbHNlIGlmIChcdHR5cGVvZiB0aGlzLnNldHRpbmdzLm5vcm1hbGl6ZXIgPT09IFwiZnVuY3Rpb25cIiApIHtcclxuXHRcdFx0XHRub3JtYWxpemVyID0gdGhpcy5zZXR0aW5ncy5ub3JtYWxpemVyO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQvLyBJZiBub3JtYWxpemVyIGlzIGRlZmluZWQsIHRoZW4gY2FsbCBpdCB0byByZXRyZWl2ZSB0aGUgY2hhbmdlZCB2YWx1ZSBpbnN0ZWFkXHJcblx0XHRcdC8vIG9mIHVzaW5nIHRoZSByZWFsIG9uZS5cclxuXHRcdFx0Ly8gTm90ZSB0aGF0IGB0aGlzYCBpbiB0aGUgbm9ybWFsaXplciBpcyBgZWxlbWVudGAuXHJcblx0XHRcdGlmICggbm9ybWFsaXplciApIHtcclxuXHRcdFx0XHR2YWwgPSBub3JtYWxpemVyLmNhbGwoIGVsZW1lbnQsIHZhbCApO1xyXG5cclxuXHRcdFx0XHRpZiAoIHR5cGVvZiB2YWwgIT09IFwic3RyaW5nXCIgKSB7XHJcblx0XHRcdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCBcIlRoZSBub3JtYWxpemVyIHNob3VsZCByZXR1cm4gYSBzdHJpbmcgdmFsdWUuXCIgKTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdC8vIERlbGV0ZSB0aGUgbm9ybWFsaXplciBmcm9tIHJ1bGVzIHRvIGF2b2lkIHRyZWF0aW5nIGl0IGFzIGEgcHJlLWRlZmluZWQgbWV0aG9kLlxyXG5cdFx0XHRcdGRlbGV0ZSBydWxlcy5ub3JtYWxpemVyO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRmb3IgKCBtZXRob2QgaW4gcnVsZXMgKSB7XHJcblx0XHRcdFx0cnVsZSA9IHsgbWV0aG9kOiBtZXRob2QsIHBhcmFtZXRlcnM6IHJ1bGVzWyBtZXRob2QgXSB9O1xyXG5cdFx0XHRcdHRyeSB7XHJcblx0XHRcdFx0XHRyZXN1bHQgPSAkLnZhbGlkYXRvci5tZXRob2RzWyBtZXRob2QgXS5jYWxsKCB0aGlzLCB2YWwsIGVsZW1lbnQsIHJ1bGUucGFyYW1ldGVycyApO1xyXG5cclxuXHRcdFx0XHRcdC8vIElmIGEgbWV0aG9kIGluZGljYXRlcyB0aGF0IHRoZSBmaWVsZCBpcyBvcHRpb25hbCBhbmQgdGhlcmVmb3JlIHZhbGlkLFxyXG5cdFx0XHRcdFx0Ly8gZG9uJ3QgbWFyayBpdCBhcyB2YWxpZCB3aGVuIHRoZXJlIGFyZSBubyBvdGhlciBydWxlc1xyXG5cdFx0XHRcdFx0aWYgKCByZXN1bHQgPT09IFwiZGVwZW5kZW5jeS1taXNtYXRjaFwiICYmIHJ1bGVzQ291bnQgPT09IDEgKSB7XHJcblx0XHRcdFx0XHRcdGRlcGVuZGVuY3lNaXNtYXRjaCA9IHRydWU7XHJcblx0XHRcdFx0XHRcdGNvbnRpbnVlO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0ZGVwZW5kZW5jeU1pc21hdGNoID0gZmFsc2U7XHJcblxyXG5cdFx0XHRcdFx0aWYgKCByZXN1bHQgPT09IFwicGVuZGluZ1wiICkge1xyXG5cdFx0XHRcdFx0XHR0aGlzLnRvSGlkZSA9IHRoaXMudG9IaWRlLm5vdCggdGhpcy5lcnJvcnNGb3IoIGVsZW1lbnQgKSApO1xyXG5cdFx0XHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0aWYgKCAhcmVzdWx0ICkge1xyXG5cdFx0XHRcdFx0XHR0aGlzLmZvcm1hdEFuZEFkZCggZWxlbWVudCwgcnVsZSApO1xyXG5cdFx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSBjYXRjaCAoIGUgKSB7XHJcblx0XHRcdFx0XHRpZiAoIHRoaXMuc2V0dGluZ3MuZGVidWcgJiYgd2luZG93LmNvbnNvbGUgKSB7XHJcblx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKCBcIkV4Y2VwdGlvbiBvY2N1cnJlZCB3aGVuIGNoZWNraW5nIGVsZW1lbnQgXCIgKyBlbGVtZW50LmlkICsgXCIsIGNoZWNrIHRoZSAnXCIgKyBydWxlLm1ldGhvZCArIFwiJyBtZXRob2QuXCIsIGUgKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGlmICggZSBpbnN0YW5jZW9mIFR5cGVFcnJvciApIHtcclxuXHRcdFx0XHRcdFx0ZS5tZXNzYWdlICs9IFwiLiAgRXhjZXB0aW9uIG9jY3VycmVkIHdoZW4gY2hlY2tpbmcgZWxlbWVudCBcIiArIGVsZW1lbnQuaWQgKyBcIiwgY2hlY2sgdGhlICdcIiArIHJ1bGUubWV0aG9kICsgXCInIG1ldGhvZC5cIjtcclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHR0aHJvdyBlO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRpZiAoIGRlcGVuZGVuY3lNaXNtYXRjaCApIHtcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHRcdFx0aWYgKCB0aGlzLm9iamVjdExlbmd0aCggcnVsZXMgKSApIHtcclxuXHRcdFx0XHR0aGlzLnN1Y2Nlc3NMaXN0LnB1c2goIGVsZW1lbnQgKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdH0sXHJcblxyXG5cdFx0Ly8gUmV0dXJuIHRoZSBjdXN0b20gbWVzc2FnZSBmb3IgdGhlIGdpdmVuIGVsZW1lbnQgYW5kIHZhbGlkYXRpb24gbWV0aG9kXHJcblx0XHQvLyBzcGVjaWZpZWQgaW4gdGhlIGVsZW1lbnQncyBIVE1MNSBkYXRhIGF0dHJpYnV0ZVxyXG5cdFx0Ly8gcmV0dXJuIHRoZSBnZW5lcmljIG1lc3NhZ2UgaWYgcHJlc2VudCBhbmQgbm8gbWV0aG9kIHNwZWNpZmljIG1lc3NhZ2UgaXMgcHJlc2VudFxyXG5cdFx0Y3VzdG9tRGF0YU1lc3NhZ2U6IGZ1bmN0aW9uKCBlbGVtZW50LCBtZXRob2QgKSB7XHJcblx0XHRcdHJldHVybiAkKCBlbGVtZW50ICkuZGF0YSggXCJtc2dcIiArIG1ldGhvZC5jaGFyQXQoIDAgKS50b1VwcGVyQ2FzZSgpICtcclxuXHRcdFx0XHRtZXRob2Quc3Vic3RyaW5nKCAxICkudG9Mb3dlckNhc2UoKSApIHx8ICQoIGVsZW1lbnQgKS5kYXRhKCBcIm1zZ1wiICk7XHJcblx0XHR9LFxyXG5cclxuXHRcdC8vIFJldHVybiB0aGUgY3VzdG9tIG1lc3NhZ2UgZm9yIHRoZSBnaXZlbiBlbGVtZW50IG5hbWUgYW5kIHZhbGlkYXRpb24gbWV0aG9kXHJcblx0XHRjdXN0b21NZXNzYWdlOiBmdW5jdGlvbiggbmFtZSwgbWV0aG9kICkge1xyXG5cdFx0XHR2YXIgbSA9IHRoaXMuc2V0dGluZ3MubWVzc2FnZXNbIG5hbWUgXTtcclxuXHRcdFx0cmV0dXJuIG0gJiYgKCBtLmNvbnN0cnVjdG9yID09PSBTdHJpbmcgPyBtIDogbVsgbWV0aG9kIF0gKTtcclxuXHRcdH0sXHJcblxyXG5cdFx0Ly8gUmV0dXJuIHRoZSBmaXJzdCBkZWZpbmVkIGFyZ3VtZW50LCBhbGxvd2luZyBlbXB0eSBzdHJpbmdzXHJcblx0XHRmaW5kRGVmaW5lZDogZnVuY3Rpb24oKSB7XHJcblx0XHRcdGZvciAoIHZhciBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKyApIHtcclxuXHRcdFx0XHRpZiAoIGFyZ3VtZW50c1sgaSBdICE9PSB1bmRlZmluZWQgKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gYXJndW1lbnRzWyBpIF07XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XHJcblx0XHR9LFxyXG5cclxuXHRcdC8vIFRoZSBzZWNvbmQgcGFyYW1ldGVyICdydWxlJyB1c2VkIHRvIGJlIGEgc3RyaW5nLCBhbmQgZXh0ZW5kZWQgdG8gYW4gb2JqZWN0IGxpdGVyYWxcclxuXHRcdC8vIG9mIHRoZSBmb2xsb3dpbmcgZm9ybTpcclxuXHRcdC8vIHJ1bGUgPSB7XHJcblx0XHQvLyAgICAgbWV0aG9kOiBcIm1ldGhvZCBuYW1lXCIsXHJcblx0XHQvLyAgICAgcGFyYW1ldGVyczogXCJ0aGUgZ2l2ZW4gbWV0aG9kIHBhcmFtZXRlcnNcIlxyXG5cdFx0Ly8gfVxyXG5cdFx0Ly9cclxuXHRcdC8vIFRoZSBvbGQgYmVoYXZpb3Igc3RpbGwgc3VwcG9ydGVkLCBrZXB0IHRvIG1haW50YWluIGJhY2t3YXJkIGNvbXBhdGliaWxpdHkgd2l0aFxyXG5cdFx0Ly8gb2xkIGNvZGUsIGFuZCB3aWxsIGJlIHJlbW92ZWQgaW4gdGhlIG5leHQgbWFqb3IgcmVsZWFzZS5cclxuXHRcdGRlZmF1bHRNZXNzYWdlOiBmdW5jdGlvbiggZWxlbWVudCwgcnVsZSApIHtcclxuXHRcdFx0aWYgKCB0eXBlb2YgcnVsZSA9PT0gXCJzdHJpbmdcIiApIHtcclxuXHRcdFx0XHRydWxlID0geyBtZXRob2Q6IHJ1bGUgfTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dmFyIG1lc3NhZ2UgPSB0aGlzLmZpbmREZWZpbmVkKFxyXG5cdFx0XHRcdFx0dGhpcy5jdXN0b21NZXNzYWdlKCBlbGVtZW50Lm5hbWUsIHJ1bGUubWV0aG9kICksXHJcblx0XHRcdFx0XHR0aGlzLmN1c3RvbURhdGFNZXNzYWdlKCBlbGVtZW50LCBydWxlLm1ldGhvZCApLFxyXG5cclxuXHRcdFx0XHRcdC8vICd0aXRsZScgaXMgbmV2ZXIgdW5kZWZpbmVkLCBzbyBoYW5kbGUgZW1wdHkgc3RyaW5nIGFzIHVuZGVmaW5lZFxyXG5cdFx0XHRcdFx0IXRoaXMuc2V0dGluZ3MuaWdub3JlVGl0bGUgJiYgZWxlbWVudC50aXRsZSB8fCB1bmRlZmluZWQsXHJcblx0XHRcdFx0XHQkLnZhbGlkYXRvci5tZXNzYWdlc1sgcnVsZS5tZXRob2QgXSxcclxuXHRcdFx0XHRcdFwiPHN0cm9uZz5XYXJuaW5nOiBObyBtZXNzYWdlIGRlZmluZWQgZm9yIFwiICsgZWxlbWVudC5uYW1lICsgXCI8L3N0cm9uZz5cIlxyXG5cdFx0XHRcdCksXHJcblx0XHRcdFx0dGhlcmVnZXggPSAvXFwkP1xceyhcXGQrKVxcfS9nO1xyXG5cdFx0XHRpZiAoIHR5cGVvZiBtZXNzYWdlID09PSBcImZ1bmN0aW9uXCIgKSB7XHJcblx0XHRcdFx0bWVzc2FnZSA9IG1lc3NhZ2UuY2FsbCggdGhpcywgcnVsZS5wYXJhbWV0ZXJzLCBlbGVtZW50ICk7XHJcblx0XHRcdH0gZWxzZSBpZiAoIHRoZXJlZ2V4LnRlc3QoIG1lc3NhZ2UgKSApIHtcclxuXHRcdFx0XHRtZXNzYWdlID0gJC52YWxpZGF0b3IuZm9ybWF0KCBtZXNzYWdlLnJlcGxhY2UoIHRoZXJlZ2V4LCBcInskMX1cIiApLCBydWxlLnBhcmFtZXRlcnMgKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJuIG1lc3NhZ2U7XHJcblx0XHR9LFxyXG5cclxuXHRcdGZvcm1hdEFuZEFkZDogZnVuY3Rpb24oIGVsZW1lbnQsIHJ1bGUgKSB7XHJcblx0XHRcdHZhciBtZXNzYWdlID0gdGhpcy5kZWZhdWx0TWVzc2FnZSggZWxlbWVudCwgcnVsZSApO1xyXG5cclxuXHRcdFx0dGhpcy5lcnJvckxpc3QucHVzaCgge1xyXG5cdFx0XHRcdG1lc3NhZ2U6IG1lc3NhZ2UsXHJcblx0XHRcdFx0ZWxlbWVudDogZWxlbWVudCxcclxuXHRcdFx0XHRtZXRob2Q6IHJ1bGUubWV0aG9kXHJcblx0XHRcdH0gKTtcclxuXHJcblx0XHRcdHRoaXMuZXJyb3JNYXBbIGVsZW1lbnQubmFtZSBdID0gbWVzc2FnZTtcclxuXHRcdFx0dGhpcy5zdWJtaXR0ZWRbIGVsZW1lbnQubmFtZSBdID0gbWVzc2FnZTtcclxuXHRcdH0sXHJcblxyXG5cdFx0YWRkV3JhcHBlcjogZnVuY3Rpb24oIHRvVG9nZ2xlICkge1xyXG5cdFx0XHRpZiAoIHRoaXMuc2V0dGluZ3Mud3JhcHBlciApIHtcclxuXHRcdFx0XHR0b1RvZ2dsZSA9IHRvVG9nZ2xlLmFkZCggdG9Ub2dnbGUucGFyZW50KCB0aGlzLnNldHRpbmdzLndyYXBwZXIgKSApO1xyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiB0b1RvZ2dsZTtcclxuXHRcdH0sXHJcblxyXG5cdFx0ZGVmYXVsdFNob3dFcnJvcnM6IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHR2YXIgaSwgZWxlbWVudHMsIGVycm9yO1xyXG5cdFx0XHRmb3IgKCBpID0gMDsgdGhpcy5lcnJvckxpc3RbIGkgXTsgaSsrICkge1xyXG5cdFx0XHRcdGVycm9yID0gdGhpcy5lcnJvckxpc3RbIGkgXTtcclxuXHRcdFx0XHRpZiAoIHRoaXMuc2V0dGluZ3MuaGlnaGxpZ2h0ICkge1xyXG5cdFx0XHRcdFx0dGhpcy5zZXR0aW5ncy5oaWdobGlnaHQuY2FsbCggdGhpcywgZXJyb3IuZWxlbWVudCwgdGhpcy5zZXR0aW5ncy5lcnJvckNsYXNzLCB0aGlzLnNldHRpbmdzLnZhbGlkQ2xhc3MgKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0dGhpcy5zaG93TGFiZWwoIGVycm9yLmVsZW1lbnQsIGVycm9yLm1lc3NhZ2UgKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRpZiAoIHRoaXMuZXJyb3JMaXN0Lmxlbmd0aCApIHtcclxuXHRcdFx0XHR0aGlzLnRvU2hvdyA9IHRoaXMudG9TaG93LmFkZCggdGhpcy5jb250YWluZXJzICk7XHJcblx0XHRcdH1cclxuXHRcdFx0aWYgKCB0aGlzLnNldHRpbmdzLnN1Y2Nlc3MgKSB7XHJcblx0XHRcdFx0Zm9yICggaSA9IDA7IHRoaXMuc3VjY2Vzc0xpc3RbIGkgXTsgaSsrICkge1xyXG5cdFx0XHRcdFx0dGhpcy5zaG93TGFiZWwoIHRoaXMuc3VjY2Vzc0xpc3RbIGkgXSApO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRpZiAoIHRoaXMuc2V0dGluZ3MudW5oaWdobGlnaHQgKSB7XHJcblx0XHRcdFx0Zm9yICggaSA9IDAsIGVsZW1lbnRzID0gdGhpcy52YWxpZEVsZW1lbnRzKCk7IGVsZW1lbnRzWyBpIF07IGkrKyApIHtcclxuXHRcdFx0XHRcdHRoaXMuc2V0dGluZ3MudW5oaWdobGlnaHQuY2FsbCggdGhpcywgZWxlbWVudHNbIGkgXSwgdGhpcy5zZXR0aW5ncy5lcnJvckNsYXNzLCB0aGlzLnNldHRpbmdzLnZhbGlkQ2xhc3MgKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0dGhpcy50b0hpZGUgPSB0aGlzLnRvSGlkZS5ub3QoIHRoaXMudG9TaG93ICk7XHJcblx0XHRcdHRoaXMuaGlkZUVycm9ycygpO1xyXG5cdFx0XHR0aGlzLmFkZFdyYXBwZXIoIHRoaXMudG9TaG93ICkuc2hvdygpO1xyXG5cdFx0fSxcclxuXHJcblx0XHR2YWxpZEVsZW1lbnRzOiBmdW5jdGlvbigpIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuY3VycmVudEVsZW1lbnRzLm5vdCggdGhpcy5pbnZhbGlkRWxlbWVudHMoKSApO1xyXG5cdFx0fSxcclxuXHJcblx0XHRpbnZhbGlkRWxlbWVudHM6IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRyZXR1cm4gJCggdGhpcy5lcnJvckxpc3QgKS5tYXAoIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdHJldHVybiB0aGlzLmVsZW1lbnQ7XHJcblx0XHRcdH0gKTtcclxuXHRcdH0sXHJcblxyXG5cdFx0c2hvd0xhYmVsOiBmdW5jdGlvbiggZWxlbWVudCwgbWVzc2FnZSApIHtcclxuXHRcdFx0dmFyIHBsYWNlLCBncm91cCwgZXJyb3JJRCwgdixcclxuXHRcdFx0XHRlcnJvciA9IHRoaXMuZXJyb3JzRm9yKCBlbGVtZW50ICksXHJcblx0XHRcdFx0ZWxlbWVudElEID0gdGhpcy5pZE9yTmFtZSggZWxlbWVudCApLFxyXG5cdFx0XHRcdGRlc2NyaWJlZEJ5ID0gJCggZWxlbWVudCApLmF0dHIoIFwiYXJpYS1kZXNjcmliZWRieVwiICk7XHJcblxyXG5cdFx0XHRpZiAoIGVycm9yLmxlbmd0aCApIHtcclxuXHJcblx0XHRcdFx0Ly8gUmVmcmVzaCBlcnJvci9zdWNjZXNzIGNsYXNzXHJcblx0XHRcdFx0ZXJyb3IucmVtb3ZlQ2xhc3MoIHRoaXMuc2V0dGluZ3MudmFsaWRDbGFzcyApLmFkZENsYXNzKCB0aGlzLnNldHRpbmdzLmVycm9yQ2xhc3MgKTtcclxuXHJcblx0XHRcdFx0Ly8gUmVwbGFjZSBtZXNzYWdlIG9uIGV4aXN0aW5nIGxhYmVsXHJcblx0XHRcdFx0ZXJyb3IuaHRtbCggbWVzc2FnZSApO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cclxuXHRcdFx0XHQvLyBDcmVhdGUgZXJyb3IgZWxlbWVudFxyXG5cdFx0XHRcdGVycm9yID0gJCggXCI8XCIgKyB0aGlzLnNldHRpbmdzLmVycm9yRWxlbWVudCArIFwiPlwiIClcclxuXHRcdFx0XHRcdC5hdHRyKCBcImlkXCIsIGVsZW1lbnRJRCArIFwiLWVycm9yXCIgKVxyXG5cdFx0XHRcdFx0LmFkZENsYXNzKCB0aGlzLnNldHRpbmdzLmVycm9yQ2xhc3MgKVxyXG5cdFx0XHRcdFx0Lmh0bWwoIG1lc3NhZ2UgfHwgXCJcIiApO1xyXG5cclxuXHRcdFx0XHQvLyBNYWludGFpbiByZWZlcmVuY2UgdG8gdGhlIGVsZW1lbnQgdG8gYmUgcGxhY2VkIGludG8gdGhlIERPTVxyXG5cdFx0XHRcdHBsYWNlID0gZXJyb3I7XHJcblx0XHRcdFx0aWYgKCB0aGlzLnNldHRpbmdzLndyYXBwZXIgKSB7XHJcblxyXG5cdFx0XHRcdFx0Ly8gTWFrZSBzdXJlIHRoZSBlbGVtZW50IGlzIHZpc2libGUsIGV2ZW4gaW4gSUVcclxuXHRcdFx0XHRcdC8vIGFjdHVhbGx5IHNob3dpbmcgdGhlIHdyYXBwZWQgZWxlbWVudCBpcyBoYW5kbGVkIGVsc2V3aGVyZVxyXG5cdFx0XHRcdFx0cGxhY2UgPSBlcnJvci5oaWRlKCkuc2hvdygpLndyYXAoIFwiPFwiICsgdGhpcy5zZXR0aW5ncy53cmFwcGVyICsgXCIvPlwiICkucGFyZW50KCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGlmICggdGhpcy5sYWJlbENvbnRhaW5lci5sZW5ndGggKSB7XHJcblx0XHRcdFx0XHR0aGlzLmxhYmVsQ29udGFpbmVyLmFwcGVuZCggcGxhY2UgKTtcclxuXHRcdFx0XHR9IGVsc2UgaWYgKCB0aGlzLnNldHRpbmdzLmVycm9yUGxhY2VtZW50ICkge1xyXG5cdFx0XHRcdFx0dGhpcy5zZXR0aW5ncy5lcnJvclBsYWNlbWVudC5jYWxsKCB0aGlzLCBwbGFjZSwgJCggZWxlbWVudCApICk7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdHBsYWNlLmluc2VydEFmdGVyKCBlbGVtZW50ICk7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHQvLyBMaW5rIGVycm9yIGJhY2sgdG8gdGhlIGVsZW1lbnRcclxuXHRcdFx0XHRpZiAoIGVycm9yLmlzKCBcImxhYmVsXCIgKSApIHtcclxuXHJcblx0XHRcdFx0XHQvLyBJZiB0aGUgZXJyb3IgaXMgYSBsYWJlbCwgdGhlbiBhc3NvY2lhdGUgdXNpbmcgJ2ZvcidcclxuXHRcdFx0XHRcdGVycm9yLmF0dHIoIFwiZm9yXCIsIGVsZW1lbnRJRCApO1xyXG5cclxuXHRcdFx0XHRcdC8vIElmIHRoZSBlbGVtZW50IGlzIG5vdCBhIGNoaWxkIG9mIGFuIGFzc29jaWF0ZWQgbGFiZWwsIHRoZW4gaXQncyBuZWNlc3NhcnlcclxuXHRcdFx0XHRcdC8vIHRvIGV4cGxpY2l0bHkgYXBwbHkgYXJpYS1kZXNjcmliZWRieVxyXG5cdFx0XHRcdH0gZWxzZSBpZiAoIGVycm9yLnBhcmVudHMoIFwibGFiZWxbZm9yPSdcIiArIHRoaXMuZXNjYXBlQ3NzTWV0YSggZWxlbWVudElEICkgKyBcIiddXCIgKS5sZW5ndGggPT09IDAgKSB7XHJcblx0XHRcdFx0XHRlcnJvcklEID0gZXJyb3IuYXR0ciggXCJpZFwiICk7XHJcblxyXG5cdFx0XHRcdFx0Ly8gUmVzcGVjdCBleGlzdGluZyBub24tZXJyb3IgYXJpYS1kZXNjcmliZWRieVxyXG5cdFx0XHRcdFx0aWYgKCAhZGVzY3JpYmVkQnkgKSB7XHJcblx0XHRcdFx0XHRcdGRlc2NyaWJlZEJ5ID0gZXJyb3JJRDtcclxuXHRcdFx0XHRcdH0gZWxzZSBpZiAoICFkZXNjcmliZWRCeS5tYXRjaCggbmV3IFJlZ0V4cCggXCJcXFxcYlwiICsgdGhpcy5lc2NhcGVDc3NNZXRhKCBlcnJvcklEICkgKyBcIlxcXFxiXCIgKSApICkge1xyXG5cclxuXHRcdFx0XHRcdFx0Ly8gQWRkIHRvIGVuZCBvZiBsaXN0IGlmIG5vdCBhbHJlYWR5IHByZXNlbnRcclxuXHRcdFx0XHRcdFx0ZGVzY3JpYmVkQnkgKz0gXCIgXCIgKyBlcnJvcklEO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0JCggZWxlbWVudCApLmF0dHIoIFwiYXJpYS1kZXNjcmliZWRieVwiLCBkZXNjcmliZWRCeSApO1xyXG5cclxuXHRcdFx0XHRcdC8vIElmIHRoaXMgZWxlbWVudCBpcyBncm91cGVkLCB0aGVuIGFzc2lnbiB0byBhbGwgZWxlbWVudHMgaW4gdGhlIHNhbWUgZ3JvdXBcclxuXHRcdFx0XHRcdGdyb3VwID0gdGhpcy5ncm91cHNbIGVsZW1lbnQubmFtZSBdO1xyXG5cdFx0XHRcdFx0aWYgKCBncm91cCApIHtcclxuXHRcdFx0XHRcdFx0diA9IHRoaXM7XHJcblx0XHRcdFx0XHRcdCQuZWFjaCggdi5ncm91cHMsIGZ1bmN0aW9uKCBuYW1lLCB0ZXN0Z3JvdXAgKSB7XHJcblx0XHRcdFx0XHRcdFx0aWYgKCB0ZXN0Z3JvdXAgPT09IGdyb3VwICkge1xyXG5cdFx0XHRcdFx0XHRcdFx0JCggXCJbbmFtZT0nXCIgKyB2LmVzY2FwZUNzc01ldGEoIG5hbWUgKSArIFwiJ11cIiwgdi5jdXJyZW50Rm9ybSApXHJcblx0XHRcdFx0XHRcdFx0XHRcdC5hdHRyKCBcImFyaWEtZGVzY3JpYmVkYnlcIiwgZXJyb3IuYXR0ciggXCJpZFwiICkgKTtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdH0gKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0aWYgKCAhbWVzc2FnZSAmJiB0aGlzLnNldHRpbmdzLnN1Y2Nlc3MgKSB7XHJcblx0XHRcdFx0ZXJyb3IudGV4dCggXCJcIiApO1xyXG5cdFx0XHRcdGlmICggdHlwZW9mIHRoaXMuc2V0dGluZ3Muc3VjY2VzcyA9PT0gXCJzdHJpbmdcIiApIHtcclxuXHRcdFx0XHRcdGVycm9yLmFkZENsYXNzKCB0aGlzLnNldHRpbmdzLnN1Y2Nlc3MgKTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0dGhpcy5zZXR0aW5ncy5zdWNjZXNzKCBlcnJvciwgZWxlbWVudCApO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHR0aGlzLnRvU2hvdyA9IHRoaXMudG9TaG93LmFkZCggZXJyb3IgKTtcclxuXHRcdH0sXHJcblxyXG5cdFx0ZXJyb3JzRm9yOiBmdW5jdGlvbiggZWxlbWVudCApIHtcclxuXHRcdFx0dmFyIG5hbWUgPSB0aGlzLmVzY2FwZUNzc01ldGEoIHRoaXMuaWRPck5hbWUoIGVsZW1lbnQgKSApLFxyXG5cdFx0XHRcdGRlc2NyaWJlciA9ICQoIGVsZW1lbnQgKS5hdHRyKCBcImFyaWEtZGVzY3JpYmVkYnlcIiApLFxyXG5cdFx0XHRcdHNlbGVjdG9yID0gXCJsYWJlbFtmb3I9J1wiICsgbmFtZSArIFwiJ10sIGxhYmVsW2Zvcj0nXCIgKyBuYW1lICsgXCInXSAqXCI7XHJcblxyXG5cdFx0XHQvLyAnYXJpYS1kZXNjcmliZWRieScgc2hvdWxkIGRpcmVjdGx5IHJlZmVyZW5jZSB0aGUgZXJyb3IgZWxlbWVudFxyXG5cdFx0XHRpZiAoIGRlc2NyaWJlciApIHtcclxuXHRcdFx0XHRzZWxlY3RvciA9IHNlbGVjdG9yICsgXCIsICNcIiArIHRoaXMuZXNjYXBlQ3NzTWV0YSggZGVzY3JpYmVyIClcclxuXHRcdFx0XHRcdC5yZXBsYWNlKCAvXFxzKy9nLCBcIiwgI1wiICk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJldHVybiB0aGlzXHJcblx0XHRcdFx0LmVycm9ycygpXHJcblx0XHRcdFx0LmZpbHRlciggc2VsZWN0b3IgKTtcclxuXHRcdH0sXHJcblxyXG5cdFx0Ly8gU2VlIGh0dHBzOi8vYXBpLmpxdWVyeS5jb20vY2F0ZWdvcnkvc2VsZWN0b3JzLywgZm9yIENTU1xyXG5cdFx0Ly8gbWV0YS1jaGFyYWN0ZXJzIHRoYXQgc2hvdWxkIGJlIGVzY2FwZWQgaW4gb3JkZXIgdG8gYmUgdXNlZCB3aXRoIEpRdWVyeVxyXG5cdFx0Ly8gYXMgYSBsaXRlcmFsIHBhcnQgb2YgYSBuYW1lL2lkIG9yIGFueSBzZWxlY3Rvci5cclxuXHRcdGVzY2FwZUNzc01ldGE6IGZ1bmN0aW9uKCBzdHJpbmcgKSB7XHJcblx0XHRcdHJldHVybiBzdHJpbmcucmVwbGFjZSggLyhbXFxcXCFcIiMkJSYnKCkqKywuLzo7PD0+P0BcXFtcXF1eYHt8fX5dKS9nLCBcIlxcXFwkMVwiICk7XHJcblx0XHR9LFxyXG5cclxuXHRcdGlkT3JOYW1lOiBmdW5jdGlvbiggZWxlbWVudCApIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuZ3JvdXBzWyBlbGVtZW50Lm5hbWUgXSB8fCAoIHRoaXMuY2hlY2thYmxlKCBlbGVtZW50ICkgPyBlbGVtZW50Lm5hbWUgOiBlbGVtZW50LmlkIHx8IGVsZW1lbnQubmFtZSApO1xyXG5cdFx0fSxcclxuXHJcblx0XHR2YWxpZGF0aW9uVGFyZ2V0Rm9yOiBmdW5jdGlvbiggZWxlbWVudCApIHtcclxuXHJcblx0XHRcdC8vIElmIHJhZGlvL2NoZWNrYm94LCB2YWxpZGF0ZSBmaXJzdCBlbGVtZW50IGluIGdyb3VwIGluc3RlYWRcclxuXHRcdFx0aWYgKCB0aGlzLmNoZWNrYWJsZSggZWxlbWVudCApICkge1xyXG5cdFx0XHRcdGVsZW1lbnQgPSB0aGlzLmZpbmRCeU5hbWUoIGVsZW1lbnQubmFtZSApO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQvLyBBbHdheXMgYXBwbHkgaWdub3JlIGZpbHRlclxyXG5cdFx0XHRyZXR1cm4gJCggZWxlbWVudCApLm5vdCggdGhpcy5zZXR0aW5ncy5pZ25vcmUgKVsgMCBdO1xyXG5cdFx0fSxcclxuXHJcblx0XHRjaGVja2FibGU6IGZ1bmN0aW9uKCBlbGVtZW50ICkge1xyXG5cdFx0XHRyZXR1cm4gKCAvcmFkaW98Y2hlY2tib3gvaSApLnRlc3QoIGVsZW1lbnQudHlwZSApO1xyXG5cdFx0fSxcclxuXHJcblx0XHRmaW5kQnlOYW1lOiBmdW5jdGlvbiggbmFtZSApIHtcclxuXHRcdFx0cmV0dXJuICQoIHRoaXMuY3VycmVudEZvcm0gKS5maW5kKCBcIltuYW1lPSdcIiArIHRoaXMuZXNjYXBlQ3NzTWV0YSggbmFtZSApICsgXCInXVwiICk7XHJcblx0XHR9LFxyXG5cclxuXHRcdGdldExlbmd0aDogZnVuY3Rpb24oIHZhbHVlLCBlbGVtZW50ICkge1xyXG5cdFx0XHRzd2l0Y2ggKCBlbGVtZW50Lm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkgKSB7XHJcblx0XHRcdGNhc2UgXCJzZWxlY3RcIjpcclxuXHRcdFx0XHRyZXR1cm4gJCggXCJvcHRpb246c2VsZWN0ZWRcIiwgZWxlbWVudCApLmxlbmd0aDtcclxuXHRcdFx0Y2FzZSBcImlucHV0XCI6XHJcblx0XHRcdFx0aWYgKCB0aGlzLmNoZWNrYWJsZSggZWxlbWVudCApICkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMuZmluZEJ5TmFtZSggZWxlbWVudC5uYW1lICkuZmlsdGVyKCBcIjpjaGVja2VkXCIgKS5sZW5ndGg7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiB2YWx1ZS5sZW5ndGg7XHJcblx0XHR9LFxyXG5cclxuXHRcdGRlcGVuZDogZnVuY3Rpb24oIHBhcmFtLCBlbGVtZW50ICkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5kZXBlbmRUeXBlc1sgdHlwZW9mIHBhcmFtIF0gPyB0aGlzLmRlcGVuZFR5cGVzWyB0eXBlb2YgcGFyYW0gXSggcGFyYW0sIGVsZW1lbnQgKSA6IHRydWU7XHJcblx0XHR9LFxyXG5cclxuXHRcdGRlcGVuZFR5cGVzOiB7XHJcblx0XHRcdFwiYm9vbGVhblwiOiBmdW5jdGlvbiggcGFyYW0gKSB7XHJcblx0XHRcdFx0cmV0dXJuIHBhcmFtO1xyXG5cdFx0XHR9LFxyXG5cdFx0XHRcInN0cmluZ1wiOiBmdW5jdGlvbiggcGFyYW0sIGVsZW1lbnQgKSB7XHJcblx0XHRcdFx0cmV0dXJuICEhJCggcGFyYW0sIGVsZW1lbnQuZm9ybSApLmxlbmd0aDtcclxuXHRcdFx0fSxcclxuXHRcdFx0XCJmdW5jdGlvblwiOiBmdW5jdGlvbiggcGFyYW0sIGVsZW1lbnQgKSB7XHJcblx0XHRcdFx0cmV0dXJuIHBhcmFtKCBlbGVtZW50ICk7XHJcblx0XHRcdH1cclxuXHRcdH0sXHJcblxyXG5cdFx0b3B0aW9uYWw6IGZ1bmN0aW9uKCBlbGVtZW50ICkge1xyXG5cdFx0XHR2YXIgdmFsID0gdGhpcy5lbGVtZW50VmFsdWUoIGVsZW1lbnQgKTtcclxuXHRcdFx0cmV0dXJuICEkLnZhbGlkYXRvci5tZXRob2RzLnJlcXVpcmVkLmNhbGwoIHRoaXMsIHZhbCwgZWxlbWVudCApICYmIFwiZGVwZW5kZW5jeS1taXNtYXRjaFwiO1xyXG5cdFx0fSxcclxuXHJcblx0XHRzdGFydFJlcXVlc3Q6IGZ1bmN0aW9uKCBlbGVtZW50ICkge1xyXG5cdFx0XHRpZiAoICF0aGlzLnBlbmRpbmdbIGVsZW1lbnQubmFtZSBdICkge1xyXG5cdFx0XHRcdHRoaXMucGVuZGluZ1JlcXVlc3QrKztcclxuXHRcdFx0XHQkKCBlbGVtZW50ICkuYWRkQ2xhc3MoIHRoaXMuc2V0dGluZ3MucGVuZGluZ0NsYXNzICk7XHJcblx0XHRcdFx0dGhpcy5wZW5kaW5nWyBlbGVtZW50Lm5hbWUgXSA9IHRydWU7XHJcblx0XHRcdH1cclxuXHRcdH0sXHJcblxyXG5cdFx0c3RvcFJlcXVlc3Q6IGZ1bmN0aW9uKCBlbGVtZW50LCB2YWxpZCApIHtcclxuXHRcdFx0dGhpcy5wZW5kaW5nUmVxdWVzdC0tO1xyXG5cclxuXHRcdFx0Ly8gU29tZXRpbWVzIHN5bmNocm9uaXphdGlvbiBmYWlscywgbWFrZSBzdXJlIHBlbmRpbmdSZXF1ZXN0IGlzIG5ldmVyIDwgMFxyXG5cdFx0XHRpZiAoIHRoaXMucGVuZGluZ1JlcXVlc3QgPCAwICkge1xyXG5cdFx0XHRcdHRoaXMucGVuZGluZ1JlcXVlc3QgPSAwO1xyXG5cdFx0XHR9XHJcblx0XHRcdGRlbGV0ZSB0aGlzLnBlbmRpbmdbIGVsZW1lbnQubmFtZSBdO1xyXG5cdFx0XHQkKCBlbGVtZW50ICkucmVtb3ZlQ2xhc3MoIHRoaXMuc2V0dGluZ3MucGVuZGluZ0NsYXNzICk7XHJcblx0XHRcdGlmICggdmFsaWQgJiYgdGhpcy5wZW5kaW5nUmVxdWVzdCA9PT0gMCAmJiB0aGlzLmZvcm1TdWJtaXR0ZWQgJiYgdGhpcy5mb3JtKCkgKSB7XHJcblx0XHRcdFx0JCggdGhpcy5jdXJyZW50Rm9ybSApLnN1Ym1pdCgpO1xyXG5cclxuXHRcdFx0XHQvLyBSZW1vdmUgdGhlIGhpZGRlbiBpbnB1dCB0aGF0IHdhcyB1c2VkIGFzIGEgcmVwbGFjZW1lbnQgZm9yIHRoZVxyXG5cdFx0XHRcdC8vIG1pc3Npbmcgc3VibWl0IGJ1dHRvbi4gVGhlIGhpZGRlbiBpbnB1dCBpcyBhZGRlZCBieSBgaGFuZGxlKClgXHJcblx0XHRcdFx0Ly8gdG8gZW5zdXJlIHRoYXQgdGhlIHZhbHVlIG9mIHRoZSB1c2VkIHN1Ym1pdCBidXR0b24gaXMgcGFzc2VkIG9uXHJcblx0XHRcdFx0Ly8gZm9yIHNjcmlwdGVkIHN1Ym1pdHMgdHJpZ2dlcmVkIGJ5IHRoaXMgbWV0aG9kXHJcblx0XHRcdFx0aWYgKCB0aGlzLnN1Ym1pdEJ1dHRvbiApIHtcclxuXHRcdFx0XHRcdCQoIFwiaW5wdXQ6aGlkZGVuW25hbWU9J1wiICsgdGhpcy5zdWJtaXRCdXR0b24ubmFtZSArIFwiJ11cIiwgdGhpcy5jdXJyZW50Rm9ybSApLnJlbW92ZSgpO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0dGhpcy5mb3JtU3VibWl0dGVkID0gZmFsc2U7XHJcblx0XHRcdH0gZWxzZSBpZiAoICF2YWxpZCAmJiB0aGlzLnBlbmRpbmdSZXF1ZXN0ID09PSAwICYmIHRoaXMuZm9ybVN1Ym1pdHRlZCApIHtcclxuXHRcdFx0XHQkKCB0aGlzLmN1cnJlbnRGb3JtICkudHJpZ2dlckhhbmRsZXIoIFwiaW52YWxpZC1mb3JtXCIsIFsgdGhpcyBdICk7XHJcblx0XHRcdFx0dGhpcy5mb3JtU3VibWl0dGVkID0gZmFsc2U7XHJcblx0XHRcdH1cclxuXHRcdH0sXHJcblxyXG5cdFx0cHJldmlvdXNWYWx1ZTogZnVuY3Rpb24oIGVsZW1lbnQsIG1ldGhvZCApIHtcclxuXHRcdFx0bWV0aG9kID0gdHlwZW9mIG1ldGhvZCA9PT0gXCJzdHJpbmdcIiAmJiBtZXRob2QgfHwgXCJyZW1vdGVcIjtcclxuXHJcblx0XHRcdHJldHVybiAkLmRhdGEoIGVsZW1lbnQsIFwicHJldmlvdXNWYWx1ZVwiICkgfHwgJC5kYXRhKCBlbGVtZW50LCBcInByZXZpb3VzVmFsdWVcIiwge1xyXG5cdFx0XHRcdG9sZDogbnVsbCxcclxuXHRcdFx0XHR2YWxpZDogdHJ1ZSxcclxuXHRcdFx0XHRtZXNzYWdlOiB0aGlzLmRlZmF1bHRNZXNzYWdlKCBlbGVtZW50LCB7IG1ldGhvZDogbWV0aG9kIH0gKVxyXG5cdFx0XHR9ICk7XHJcblx0XHR9LFxyXG5cclxuXHRcdC8vIENsZWFucyB1cCBhbGwgZm9ybXMgYW5kIGVsZW1lbnRzLCByZW1vdmVzIHZhbGlkYXRvci1zcGVjaWZpYyBldmVudHNcclxuXHRcdGRlc3Ryb3k6IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHR0aGlzLnJlc2V0Rm9ybSgpO1xyXG5cclxuXHRcdFx0JCggdGhpcy5jdXJyZW50Rm9ybSApXHJcblx0XHRcdFx0Lm9mZiggXCIudmFsaWRhdGVcIiApXHJcblx0XHRcdFx0LnJlbW92ZURhdGEoIFwidmFsaWRhdG9yXCIgKVxyXG5cdFx0XHRcdC5maW5kKCBcIi52YWxpZGF0ZS1lcXVhbFRvLWJsdXJcIiApXHJcblx0XHRcdFx0XHQub2ZmKCBcIi52YWxpZGF0ZS1lcXVhbFRvXCIgKVxyXG5cdFx0XHRcdFx0LnJlbW92ZUNsYXNzKCBcInZhbGlkYXRlLWVxdWFsVG8tYmx1clwiICk7XHJcblx0XHR9XHJcblxyXG5cdH0sXHJcblxyXG5cdGNsYXNzUnVsZVNldHRpbmdzOiB7XHJcblx0XHRyZXF1aXJlZDogeyByZXF1aXJlZDogdHJ1ZSB9LFxyXG5cdFx0ZW1haWw6IHsgZW1haWw6IHRydWUgfSxcclxuXHRcdHVybDogeyB1cmw6IHRydWUgfSxcclxuXHRcdGRhdGU6IHsgZGF0ZTogdHJ1ZSB9LFxyXG5cdFx0ZGF0ZUlTTzogeyBkYXRlSVNPOiB0cnVlIH0sXHJcblx0XHRudW1iZXI6IHsgbnVtYmVyOiB0cnVlIH0sXHJcblx0XHRkaWdpdHM6IHsgZGlnaXRzOiB0cnVlIH0sXHJcblx0XHRjcmVkaXRjYXJkOiB7IGNyZWRpdGNhcmQ6IHRydWUgfVxyXG5cdH0sXHJcblxyXG5cdGFkZENsYXNzUnVsZXM6IGZ1bmN0aW9uKCBjbGFzc05hbWUsIHJ1bGVzICkge1xyXG5cdFx0aWYgKCBjbGFzc05hbWUuY29uc3RydWN0b3IgPT09IFN0cmluZyApIHtcclxuXHRcdFx0dGhpcy5jbGFzc1J1bGVTZXR0aW5nc1sgY2xhc3NOYW1lIF0gPSBydWxlcztcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdCQuZXh0ZW5kKCB0aGlzLmNsYXNzUnVsZVNldHRpbmdzLCBjbGFzc05hbWUgKTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHRjbGFzc1J1bGVzOiBmdW5jdGlvbiggZWxlbWVudCApIHtcclxuXHRcdHZhciBydWxlcyA9IHt9LFxyXG5cdFx0XHRjbGFzc2VzID0gJCggZWxlbWVudCApLmF0dHIoIFwiY2xhc3NcIiApO1xyXG5cclxuXHRcdGlmICggY2xhc3NlcyApIHtcclxuXHRcdFx0JC5lYWNoKCBjbGFzc2VzLnNwbGl0KCBcIiBcIiApLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRpZiAoIHRoaXMgaW4gJC52YWxpZGF0b3IuY2xhc3NSdWxlU2V0dGluZ3MgKSB7XHJcblx0XHRcdFx0XHQkLmV4dGVuZCggcnVsZXMsICQudmFsaWRhdG9yLmNsYXNzUnVsZVNldHRpbmdzWyB0aGlzIF0gKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0gKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiBydWxlcztcclxuXHR9LFxyXG5cclxuXHRub3JtYWxpemVBdHRyaWJ1dGVSdWxlOiBmdW5jdGlvbiggcnVsZXMsIHR5cGUsIG1ldGhvZCwgdmFsdWUgKSB7XHJcblxyXG5cdFx0Ly8gQ29udmVydCB0aGUgdmFsdWUgdG8gYSBudW1iZXIgZm9yIG51bWJlciBpbnB1dHMsIGFuZCBmb3IgdGV4dCBmb3IgYmFja3dhcmRzIGNvbXBhYmlsaXR5XHJcblx0XHQvLyBhbGxvd3MgdHlwZT1cImRhdGVcIiBhbmQgb3RoZXJzIHRvIGJlIGNvbXBhcmVkIGFzIHN0cmluZ3NcclxuXHRcdGlmICggL21pbnxtYXh8c3RlcC8udGVzdCggbWV0aG9kICkgJiYgKCB0eXBlID09PSBudWxsIHx8IC9udW1iZXJ8cmFuZ2V8dGV4dC8udGVzdCggdHlwZSApICkgKSB7XHJcblx0XHRcdHZhbHVlID0gTnVtYmVyKCB2YWx1ZSApO1xyXG5cclxuXHRcdFx0Ly8gU3VwcG9ydCBPcGVyYSBNaW5pLCB3aGljaCByZXR1cm5zIE5hTiBmb3IgdW5kZWZpbmVkIG1pbmxlbmd0aFxyXG5cdFx0XHRpZiAoIGlzTmFOKCB2YWx1ZSApICkge1xyXG5cdFx0XHRcdHZhbHVlID0gdW5kZWZpbmVkO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKCB2YWx1ZSB8fCB2YWx1ZSA9PT0gMCApIHtcclxuXHRcdFx0cnVsZXNbIG1ldGhvZCBdID0gdmFsdWU7XHJcblx0XHR9IGVsc2UgaWYgKCB0eXBlID09PSBtZXRob2QgJiYgdHlwZSAhPT0gXCJyYW5nZVwiICkge1xyXG5cclxuXHRcdFx0Ly8gRXhjZXB0aW9uOiB0aGUganF1ZXJ5IHZhbGlkYXRlICdyYW5nZScgbWV0aG9kXHJcblx0XHRcdC8vIGRvZXMgbm90IHRlc3QgZm9yIHRoZSBodG1sNSAncmFuZ2UnIHR5cGVcclxuXHRcdFx0cnVsZXNbIG1ldGhvZCBdID0gdHJ1ZTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHRhdHRyaWJ1dGVSdWxlczogZnVuY3Rpb24oIGVsZW1lbnQgKSB7XHJcblx0XHR2YXIgcnVsZXMgPSB7fSxcclxuXHRcdFx0JGVsZW1lbnQgPSAkKCBlbGVtZW50ICksXHJcblx0XHRcdHR5cGUgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSggXCJ0eXBlXCIgKSxcclxuXHRcdFx0bWV0aG9kLCB2YWx1ZTtcclxuXHJcblx0XHRmb3IgKCBtZXRob2QgaW4gJC52YWxpZGF0b3IubWV0aG9kcyApIHtcclxuXHJcblx0XHRcdC8vIFN1cHBvcnQgZm9yIDxpbnB1dCByZXF1aXJlZD4gaW4gYm90aCBodG1sNSBhbmQgb2xkZXIgYnJvd3NlcnNcclxuXHRcdFx0aWYgKCBtZXRob2QgPT09IFwicmVxdWlyZWRcIiApIHtcclxuXHRcdFx0XHR2YWx1ZSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCBtZXRob2QgKTtcclxuXHJcblx0XHRcdFx0Ly8gU29tZSBicm93c2VycyByZXR1cm4gYW4gZW1wdHkgc3RyaW5nIGZvciB0aGUgcmVxdWlyZWQgYXR0cmlidXRlXHJcblx0XHRcdFx0Ly8gYW5kIG5vbi1IVE1MNSBicm93c2VycyBtaWdodCBoYXZlIHJlcXVpcmVkPVwiXCIgbWFya3VwXHJcblx0XHRcdFx0aWYgKCB2YWx1ZSA9PT0gXCJcIiApIHtcclxuXHRcdFx0XHRcdHZhbHVlID0gdHJ1ZTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdC8vIEZvcmNlIG5vbi1IVE1MNSBicm93c2VycyB0byByZXR1cm4gYm9vbFxyXG5cdFx0XHRcdHZhbHVlID0gISF2YWx1ZTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHR2YWx1ZSA9ICRlbGVtZW50LmF0dHIoIG1ldGhvZCApO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR0aGlzLm5vcm1hbGl6ZUF0dHJpYnV0ZVJ1bGUoIHJ1bGVzLCB0eXBlLCBtZXRob2QsIHZhbHVlICk7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gJ21heGxlbmd0aCcgbWF5IGJlIHJldHVybmVkIGFzIC0xLCAyMTQ3NDgzNjQ3ICggSUUgKSBhbmQgNTI0Mjg4ICggc2FmYXJpICkgZm9yIHRleHQgaW5wdXRzXHJcblx0XHRpZiAoIHJ1bGVzLm1heGxlbmd0aCAmJiAvLTF8MjE0NzQ4MzY0N3w1MjQyODgvLnRlc3QoIHJ1bGVzLm1heGxlbmd0aCApICkge1xyXG5cdFx0XHRkZWxldGUgcnVsZXMubWF4bGVuZ3RoO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBydWxlcztcclxuXHR9LFxyXG5cclxuXHRkYXRhUnVsZXM6IGZ1bmN0aW9uKCBlbGVtZW50ICkge1xyXG5cdFx0dmFyIHJ1bGVzID0ge30sXHJcblx0XHRcdCRlbGVtZW50ID0gJCggZWxlbWVudCApLFxyXG5cdFx0XHR0eXBlID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoIFwidHlwZVwiICksXHJcblx0XHRcdG1ldGhvZCwgdmFsdWU7XHJcblxyXG5cdFx0Zm9yICggbWV0aG9kIGluICQudmFsaWRhdG9yLm1ldGhvZHMgKSB7XHJcblx0XHRcdHZhbHVlID0gJGVsZW1lbnQuZGF0YSggXCJydWxlXCIgKyBtZXRob2QuY2hhckF0KCAwICkudG9VcHBlckNhc2UoKSArIG1ldGhvZC5zdWJzdHJpbmcoIDEgKS50b0xvd2VyQ2FzZSgpICk7XHJcblx0XHRcdHRoaXMubm9ybWFsaXplQXR0cmlidXRlUnVsZSggcnVsZXMsIHR5cGUsIG1ldGhvZCwgdmFsdWUgKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiBydWxlcztcclxuXHR9LFxyXG5cclxuXHRzdGF0aWNSdWxlczogZnVuY3Rpb24oIGVsZW1lbnQgKSB7XHJcblx0XHR2YXIgcnVsZXMgPSB7fSxcclxuXHRcdFx0dmFsaWRhdG9yID0gJC5kYXRhKCBlbGVtZW50LmZvcm0sIFwidmFsaWRhdG9yXCIgKTtcclxuXHJcblx0XHRpZiAoIHZhbGlkYXRvci5zZXR0aW5ncy5ydWxlcyApIHtcclxuXHRcdFx0cnVsZXMgPSAkLnZhbGlkYXRvci5ub3JtYWxpemVSdWxlKCB2YWxpZGF0b3Iuc2V0dGluZ3MucnVsZXNbIGVsZW1lbnQubmFtZSBdICkgfHwge307XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gcnVsZXM7XHJcblx0fSxcclxuXHJcblx0bm9ybWFsaXplUnVsZXM6IGZ1bmN0aW9uKCBydWxlcywgZWxlbWVudCApIHtcclxuXHJcblx0XHQvLyBIYW5kbGUgZGVwZW5kZW5jeSBjaGVja1xyXG5cdFx0JC5lYWNoKCBydWxlcywgZnVuY3Rpb24oIHByb3AsIHZhbCApIHtcclxuXHJcblx0XHRcdC8vIElnbm9yZSBydWxlIHdoZW4gcGFyYW0gaXMgZXhwbGljaXRseSBmYWxzZSwgZWcuIHJlcXVpcmVkOmZhbHNlXHJcblx0XHRcdGlmICggdmFsID09PSBmYWxzZSApIHtcclxuXHRcdFx0XHRkZWxldGUgcnVsZXNbIHByb3AgXTtcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHRcdFx0aWYgKCB2YWwucGFyYW0gfHwgdmFsLmRlcGVuZHMgKSB7XHJcblx0XHRcdFx0dmFyIGtlZXBSdWxlID0gdHJ1ZTtcclxuXHRcdFx0XHRzd2l0Y2ggKCB0eXBlb2YgdmFsLmRlcGVuZHMgKSB7XHJcblx0XHRcdFx0Y2FzZSBcInN0cmluZ1wiOlxyXG5cdFx0XHRcdFx0a2VlcFJ1bGUgPSAhISQoIHZhbC5kZXBlbmRzLCBlbGVtZW50LmZvcm0gKS5sZW5ndGg7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIFwiZnVuY3Rpb25cIjpcclxuXHRcdFx0XHRcdGtlZXBSdWxlID0gdmFsLmRlcGVuZHMuY2FsbCggZWxlbWVudCwgZWxlbWVudCApO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGlmICgga2VlcFJ1bGUgKSB7XHJcblx0XHRcdFx0XHRydWxlc1sgcHJvcCBdID0gdmFsLnBhcmFtICE9PSB1bmRlZmluZWQgPyB2YWwucGFyYW0gOiB0cnVlO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHQkLmRhdGEoIGVsZW1lbnQuZm9ybSwgXCJ2YWxpZGF0b3JcIiApLnJlc2V0RWxlbWVudHMoICQoIGVsZW1lbnQgKSApO1xyXG5cdFx0XHRcdFx0ZGVsZXRlIHJ1bGVzWyBwcm9wIF07XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9ICk7XHJcblxyXG5cdFx0Ly8gRXZhbHVhdGUgcGFyYW1ldGVyc1xyXG5cdFx0JC5lYWNoKCBydWxlcywgZnVuY3Rpb24oIHJ1bGUsIHBhcmFtZXRlciApIHtcclxuXHRcdFx0cnVsZXNbIHJ1bGUgXSA9ICQuaXNGdW5jdGlvbiggcGFyYW1ldGVyICkgJiYgcnVsZSAhPT0gXCJub3JtYWxpemVyXCIgPyBwYXJhbWV0ZXIoIGVsZW1lbnQgKSA6IHBhcmFtZXRlcjtcclxuXHRcdH0gKTtcclxuXHJcblx0XHQvLyBDbGVhbiBudW1iZXIgcGFyYW1ldGVyc1xyXG5cdFx0JC5lYWNoKCBbIFwibWlubGVuZ3RoXCIsIFwibWF4bGVuZ3RoXCIgXSwgZnVuY3Rpb24oKSB7XHJcblx0XHRcdGlmICggcnVsZXNbIHRoaXMgXSApIHtcclxuXHRcdFx0XHRydWxlc1sgdGhpcyBdID0gTnVtYmVyKCBydWxlc1sgdGhpcyBdICk7XHJcblx0XHRcdH1cclxuXHRcdH0gKTtcclxuXHRcdCQuZWFjaCggWyBcInJhbmdlbGVuZ3RoXCIsIFwicmFuZ2VcIiBdLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0dmFyIHBhcnRzO1xyXG5cdFx0XHRpZiAoIHJ1bGVzWyB0aGlzIF0gKSB7XHJcblx0XHRcdFx0aWYgKCAkLmlzQXJyYXkoIHJ1bGVzWyB0aGlzIF0gKSApIHtcclxuXHRcdFx0XHRcdHJ1bGVzWyB0aGlzIF0gPSBbIE51bWJlciggcnVsZXNbIHRoaXMgXVsgMCBdICksIE51bWJlciggcnVsZXNbIHRoaXMgXVsgMSBdICkgXTtcclxuXHRcdFx0XHR9IGVsc2UgaWYgKCB0eXBlb2YgcnVsZXNbIHRoaXMgXSA9PT0gXCJzdHJpbmdcIiApIHtcclxuXHRcdFx0XHRcdHBhcnRzID0gcnVsZXNbIHRoaXMgXS5yZXBsYWNlKCAvW1xcW1xcXV0vZywgXCJcIiApLnNwbGl0KCAvW1xccyxdKy8gKTtcclxuXHRcdFx0XHRcdHJ1bGVzWyB0aGlzIF0gPSBbIE51bWJlciggcGFydHNbIDAgXSApLCBOdW1iZXIoIHBhcnRzWyAxIF0gKSBdO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fSApO1xyXG5cclxuXHRcdGlmICggJC52YWxpZGF0b3IuYXV0b0NyZWF0ZVJhbmdlcyApIHtcclxuXHJcblx0XHRcdC8vIEF1dG8tY3JlYXRlIHJhbmdlc1xyXG5cdFx0XHRpZiAoIHJ1bGVzLm1pbiAhPSBudWxsICYmIHJ1bGVzLm1heCAhPSBudWxsICkge1xyXG5cdFx0XHRcdHJ1bGVzLnJhbmdlID0gWyBydWxlcy5taW4sIHJ1bGVzLm1heCBdO1xyXG5cdFx0XHRcdGRlbGV0ZSBydWxlcy5taW47XHJcblx0XHRcdFx0ZGVsZXRlIHJ1bGVzLm1heDtcclxuXHRcdFx0fVxyXG5cdFx0XHRpZiAoIHJ1bGVzLm1pbmxlbmd0aCAhPSBudWxsICYmIHJ1bGVzLm1heGxlbmd0aCAhPSBudWxsICkge1xyXG5cdFx0XHRcdHJ1bGVzLnJhbmdlbGVuZ3RoID0gWyBydWxlcy5taW5sZW5ndGgsIHJ1bGVzLm1heGxlbmd0aCBdO1xyXG5cdFx0XHRcdGRlbGV0ZSBydWxlcy5taW5sZW5ndGg7XHJcblx0XHRcdFx0ZGVsZXRlIHJ1bGVzLm1heGxlbmd0aDtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBydWxlcztcclxuXHR9LFxyXG5cclxuXHQvLyBDb252ZXJ0cyBhIHNpbXBsZSBzdHJpbmcgdG8gYSB7c3RyaW5nOiB0cnVlfSBydWxlLCBlLmcuLCBcInJlcXVpcmVkXCIgdG8ge3JlcXVpcmVkOnRydWV9XHJcblx0bm9ybWFsaXplUnVsZTogZnVuY3Rpb24oIGRhdGEgKSB7XHJcblx0XHRpZiAoIHR5cGVvZiBkYXRhID09PSBcInN0cmluZ1wiICkge1xyXG5cdFx0XHR2YXIgdHJhbnNmb3JtZWQgPSB7fTtcclxuXHRcdFx0JC5lYWNoKCBkYXRhLnNwbGl0KCAvXFxzLyApLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHR0cmFuc2Zvcm1lZFsgdGhpcyBdID0gdHJ1ZTtcclxuXHRcdFx0fSApO1xyXG5cdFx0XHRkYXRhID0gdHJhbnNmb3JtZWQ7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gZGF0YTtcclxuXHR9LFxyXG5cclxuXHQvLyBodHRwczovL2pxdWVyeXZhbGlkYXRpb24ub3JnL2pRdWVyeS52YWxpZGF0b3IuYWRkTWV0aG9kL1xyXG5cdGFkZE1ldGhvZDogZnVuY3Rpb24oIG5hbWUsIG1ldGhvZCwgbWVzc2FnZSApIHtcclxuXHRcdCQudmFsaWRhdG9yLm1ldGhvZHNbIG5hbWUgXSA9IG1ldGhvZDtcclxuXHRcdCQudmFsaWRhdG9yLm1lc3NhZ2VzWyBuYW1lIF0gPSBtZXNzYWdlICE9PSB1bmRlZmluZWQgPyBtZXNzYWdlIDogJC52YWxpZGF0b3IubWVzc2FnZXNbIG5hbWUgXTtcclxuXHRcdGlmICggbWV0aG9kLmxlbmd0aCA8IDMgKSB7XHJcblx0XHRcdCQudmFsaWRhdG9yLmFkZENsYXNzUnVsZXMoIG5hbWUsICQudmFsaWRhdG9yLm5vcm1hbGl6ZVJ1bGUoIG5hbWUgKSApO1xyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdC8vIGh0dHBzOi8vanF1ZXJ5dmFsaWRhdGlvbi5vcmcvalF1ZXJ5LnZhbGlkYXRvci5tZXRob2RzL1xyXG5cdG1ldGhvZHM6IHtcclxuXHJcblx0XHQvLyBodHRwczovL2pxdWVyeXZhbGlkYXRpb24ub3JnL3JlcXVpcmVkLW1ldGhvZC9cclxuXHRcdHJlcXVpcmVkOiBmdW5jdGlvbiggdmFsdWUsIGVsZW1lbnQsIHBhcmFtICkge1xyXG5cclxuXHRcdFx0Ly8gQ2hlY2sgaWYgZGVwZW5kZW5jeSBpcyBtZXRcclxuXHRcdFx0aWYgKCAhdGhpcy5kZXBlbmQoIHBhcmFtLCBlbGVtZW50ICkgKSB7XHJcblx0XHRcdFx0cmV0dXJuIFwiZGVwZW5kZW5jeS1taXNtYXRjaFwiO1xyXG5cdFx0XHR9XHJcblx0XHRcdGlmICggZWxlbWVudC5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpID09PSBcInNlbGVjdFwiICkge1xyXG5cclxuXHRcdFx0XHQvLyBDb3VsZCBiZSBhbiBhcnJheSBmb3Igc2VsZWN0LW11bHRpcGxlIG9yIGEgc3RyaW5nLCBib3RoIGFyZSBmaW5lIHRoaXMgd2F5XHJcblx0XHRcdFx0dmFyIHZhbCA9ICQoIGVsZW1lbnQgKS52YWwoKTtcclxuXHRcdFx0XHRyZXR1cm4gdmFsICYmIHZhbC5sZW5ndGggPiAwO1xyXG5cdFx0XHR9XHJcblx0XHRcdGlmICggdGhpcy5jaGVja2FibGUoIGVsZW1lbnQgKSApIHtcclxuXHRcdFx0XHRyZXR1cm4gdGhpcy5nZXRMZW5ndGgoIHZhbHVlLCBlbGVtZW50ICkgPiAwO1xyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiB2YWx1ZS5sZW5ndGggPiAwO1xyXG5cdFx0fSxcclxuXHJcblx0XHQvLyBodHRwczovL2pxdWVyeXZhbGlkYXRpb24ub3JnL2VtYWlsLW1ldGhvZC9cclxuXHRcdGVtYWlsOiBmdW5jdGlvbiggdmFsdWUsIGVsZW1lbnQgKSB7XHJcblxyXG5cdFx0XHQvLyBGcm9tIGh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL2Zvcm1zLmh0bWwjdmFsaWQtZS1tYWlsLWFkZHJlc3NcclxuXHRcdFx0Ly8gUmV0cmlldmVkIDIwMTQtMDEtMTRcclxuXHRcdFx0Ly8gSWYgeW91IGhhdmUgYSBwcm9ibGVtIHdpdGggdGhpcyBpbXBsZW1lbnRhdGlvbiwgcmVwb3J0IGEgYnVnIGFnYWluc3QgdGhlIGFib3ZlIHNwZWNcclxuXHRcdFx0Ly8gT3IgdXNlIGN1c3RvbSBtZXRob2RzIHRvIGltcGxlbWVudCB5b3VyIG93biBlbWFpbCB2YWxpZGF0aW9uXHJcblx0XHRcdHJldHVybiB0aGlzLm9wdGlvbmFsKCBlbGVtZW50ICkgfHwgL15bYS16QS1aMC05LiEjJCUmJyorXFwvPT9eX2B7fH1+LV0rQFthLXpBLVowLTldKD86W2EtekEtWjAtOS1dezAsNjF9W2EtekEtWjAtOV0pPyg/OlxcLlthLXpBLVowLTldKD86W2EtekEtWjAtOS1dezAsNjF9W2EtekEtWjAtOV0pPykqJC8udGVzdCggdmFsdWUgKTtcclxuXHRcdH0sXHJcblxyXG5cdFx0Ly8gaHR0cHM6Ly9qcXVlcnl2YWxpZGF0aW9uLm9yZy91cmwtbWV0aG9kL1xyXG5cdFx0dXJsOiBmdW5jdGlvbiggdmFsdWUsIGVsZW1lbnQgKSB7XHJcblxyXG5cdFx0XHQvLyBDb3B5cmlnaHQgKGMpIDIwMTAtMjAxMyBEaWVnbyBQZXJpbmksIE1JVCBsaWNlbnNlZFxyXG5cdFx0XHQvLyBodHRwczovL2dpc3QuZ2l0aHViLmNvbS9kcGVyaW5pLzcyOTI5NFxyXG5cdFx0XHQvLyBzZWUgYWxzbyBodHRwczovL21hdGhpYXNieW5lbnMuYmUvZGVtby91cmwtcmVnZXhcclxuXHRcdFx0Ly8gbW9kaWZpZWQgdG8gYWxsb3cgcHJvdG9jb2wtcmVsYXRpdmUgVVJMc1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5vcHRpb25hbCggZWxlbWVudCApIHx8IC9eKD86KD86KD86aHR0cHM/fGZ0cCk6KT9cXC9cXC8pKD86XFxTKyg/OjpcXFMqKT9AKT8oPzooPyEoPzoxMHwxMjcpKD86XFwuXFxkezEsM30pezN9KSg/ISg/OjE2OVxcLjI1NHwxOTJcXC4xNjgpKD86XFwuXFxkezEsM30pezJ9KSg/ITE3MlxcLig/OjFbNi05XXwyXFxkfDNbMC0xXSkoPzpcXC5cXGR7MSwzfSl7Mn0pKD86WzEtOV1cXGQ/fDFcXGRcXGR8MlswMV1cXGR8MjJbMC0zXSkoPzpcXC4oPzoxP1xcZHsxLDJ9fDJbMC00XVxcZHwyNVswLTVdKSl7Mn0oPzpcXC4oPzpbMS05XVxcZD98MVxcZFxcZHwyWzAtNF1cXGR8MjVbMC00XSkpfCg/Oig/OlthLXpcXHUwMGExLVxcdWZmZmYwLTldLSopKlthLXpcXHUwMGExLVxcdWZmZmYwLTldKykoPzpcXC4oPzpbYS16XFx1MDBhMS1cXHVmZmZmMC05XS0qKSpbYS16XFx1MDBhMS1cXHVmZmZmMC05XSspKig/OlxcLig/OlthLXpcXHUwMGExLVxcdWZmZmZdezIsfSkpLj8pKD86OlxcZHsyLDV9KT8oPzpbLz8jXVxcUyopPyQvaS50ZXN0KCB2YWx1ZSApO1xyXG5cdFx0fSxcclxuXHJcblx0XHQvLyBodHRwczovL2pxdWVyeXZhbGlkYXRpb24ub3JnL2RhdGUtbWV0aG9kL1xyXG5cdFx0ZGF0ZTogZnVuY3Rpb24oIHZhbHVlLCBlbGVtZW50ICkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5vcHRpb25hbCggZWxlbWVudCApIHx8ICEvSW52YWxpZHxOYU4vLnRlc3QoIG5ldyBEYXRlKCB2YWx1ZSApLnRvU3RyaW5nKCkgKTtcclxuXHRcdH0sXHJcblxyXG5cdFx0Ly8gaHR0cHM6Ly9qcXVlcnl2YWxpZGF0aW9uLm9yZy9kYXRlSVNPLW1ldGhvZC9cclxuXHRcdGRhdGVJU086IGZ1bmN0aW9uKCB2YWx1ZSwgZWxlbWVudCApIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMub3B0aW9uYWwoIGVsZW1lbnQgKSB8fCAvXlxcZHs0fVtcXC9cXC1dKDA/WzEtOV18MVswMTJdKVtcXC9cXC1dKDA/WzEtOV18WzEyXVswLTldfDNbMDFdKSQvLnRlc3QoIHZhbHVlICk7XHJcblx0XHR9LFxyXG5cclxuXHRcdC8vIGh0dHBzOi8vanF1ZXJ5dmFsaWRhdGlvbi5vcmcvbnVtYmVyLW1ldGhvZC9cclxuXHRcdG51bWJlcjogZnVuY3Rpb24oIHZhbHVlLCBlbGVtZW50ICkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5vcHRpb25hbCggZWxlbWVudCApIHx8IC9eKD86LT9cXGQrfC0/XFxkezEsM30oPzosXFxkezN9KSspPyg/OlxcLlxcZCspPyQvLnRlc3QoIHZhbHVlICk7XHJcblx0XHR9LFxyXG5cclxuXHRcdC8vIGh0dHBzOi8vanF1ZXJ5dmFsaWRhdGlvbi5vcmcvZGlnaXRzLW1ldGhvZC9cclxuXHRcdGRpZ2l0czogZnVuY3Rpb24oIHZhbHVlLCBlbGVtZW50ICkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5vcHRpb25hbCggZWxlbWVudCApIHx8IC9eXFxkKyQvLnRlc3QoIHZhbHVlICk7XHJcblx0XHR9LFxyXG5cclxuXHRcdC8vIGh0dHBzOi8vanF1ZXJ5dmFsaWRhdGlvbi5vcmcvbWlubGVuZ3RoLW1ldGhvZC9cclxuXHRcdG1pbmxlbmd0aDogZnVuY3Rpb24oIHZhbHVlLCBlbGVtZW50LCBwYXJhbSApIHtcclxuXHRcdFx0dmFyIGxlbmd0aCA9ICQuaXNBcnJheSggdmFsdWUgKSA/IHZhbHVlLmxlbmd0aCA6IHRoaXMuZ2V0TGVuZ3RoKCB2YWx1ZSwgZWxlbWVudCApO1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5vcHRpb25hbCggZWxlbWVudCApIHx8IGxlbmd0aCA+PSBwYXJhbTtcclxuXHRcdH0sXHJcblxyXG5cdFx0Ly8gaHR0cHM6Ly9qcXVlcnl2YWxpZGF0aW9uLm9yZy9tYXhsZW5ndGgtbWV0aG9kL1xyXG5cdFx0bWF4bGVuZ3RoOiBmdW5jdGlvbiggdmFsdWUsIGVsZW1lbnQsIHBhcmFtICkge1xyXG5cdFx0XHR2YXIgbGVuZ3RoID0gJC5pc0FycmF5KCB2YWx1ZSApID8gdmFsdWUubGVuZ3RoIDogdGhpcy5nZXRMZW5ndGgoIHZhbHVlLCBlbGVtZW50ICk7XHJcblx0XHRcdHJldHVybiB0aGlzLm9wdGlvbmFsKCBlbGVtZW50ICkgfHwgbGVuZ3RoIDw9IHBhcmFtO1xyXG5cdFx0fSxcclxuXHJcblx0XHQvLyBodHRwczovL2pxdWVyeXZhbGlkYXRpb24ub3JnL3JhbmdlbGVuZ3RoLW1ldGhvZC9cclxuXHRcdHJhbmdlbGVuZ3RoOiBmdW5jdGlvbiggdmFsdWUsIGVsZW1lbnQsIHBhcmFtICkge1xyXG5cdFx0XHR2YXIgbGVuZ3RoID0gJC5pc0FycmF5KCB2YWx1ZSApID8gdmFsdWUubGVuZ3RoIDogdGhpcy5nZXRMZW5ndGgoIHZhbHVlLCBlbGVtZW50ICk7XHJcblx0XHRcdHJldHVybiB0aGlzLm9wdGlvbmFsKCBlbGVtZW50ICkgfHwgKCBsZW5ndGggPj0gcGFyYW1bIDAgXSAmJiBsZW5ndGggPD0gcGFyYW1bIDEgXSApO1xyXG5cdFx0fSxcclxuXHJcblx0XHQvLyBodHRwczovL2pxdWVyeXZhbGlkYXRpb24ub3JnL21pbi1tZXRob2QvXHJcblx0XHRtaW46IGZ1bmN0aW9uKCB2YWx1ZSwgZWxlbWVudCwgcGFyYW0gKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLm9wdGlvbmFsKCBlbGVtZW50ICkgfHwgdmFsdWUgPj0gcGFyYW07XHJcblx0XHR9LFxyXG5cclxuXHRcdC8vIGh0dHBzOi8vanF1ZXJ5dmFsaWRhdGlvbi5vcmcvbWF4LW1ldGhvZC9cclxuXHRcdG1heDogZnVuY3Rpb24oIHZhbHVlLCBlbGVtZW50LCBwYXJhbSApIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMub3B0aW9uYWwoIGVsZW1lbnQgKSB8fCB2YWx1ZSA8PSBwYXJhbTtcclxuXHRcdH0sXHJcblxyXG5cdFx0Ly8gaHR0cHM6Ly9qcXVlcnl2YWxpZGF0aW9uLm9yZy9yYW5nZS1tZXRob2QvXHJcblx0XHRyYW5nZTogZnVuY3Rpb24oIHZhbHVlLCBlbGVtZW50LCBwYXJhbSApIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMub3B0aW9uYWwoIGVsZW1lbnQgKSB8fCAoIHZhbHVlID49IHBhcmFtWyAwIF0gJiYgdmFsdWUgPD0gcGFyYW1bIDEgXSApO1xyXG5cdFx0fSxcclxuXHJcblx0XHQvLyBodHRwczovL2pxdWVyeXZhbGlkYXRpb24ub3JnL3N0ZXAtbWV0aG9kL1xyXG5cdFx0c3RlcDogZnVuY3Rpb24oIHZhbHVlLCBlbGVtZW50LCBwYXJhbSApIHtcclxuXHRcdFx0dmFyIHR5cGUgPSAkKCBlbGVtZW50ICkuYXR0ciggXCJ0eXBlXCIgKSxcclxuXHRcdFx0XHRlcnJvck1lc3NhZ2UgPSBcIlN0ZXAgYXR0cmlidXRlIG9uIGlucHV0IHR5cGUgXCIgKyB0eXBlICsgXCIgaXMgbm90IHN1cHBvcnRlZC5cIixcclxuXHRcdFx0XHRzdXBwb3J0ZWRUeXBlcyA9IFsgXCJ0ZXh0XCIsIFwibnVtYmVyXCIsIFwicmFuZ2VcIiBdLFxyXG5cdFx0XHRcdHJlID0gbmV3IFJlZ0V4cCggXCJcXFxcYlwiICsgdHlwZSArIFwiXFxcXGJcIiApLFxyXG5cdFx0XHRcdG5vdFN1cHBvcnRlZCA9IHR5cGUgJiYgIXJlLnRlc3QoIHN1cHBvcnRlZFR5cGVzLmpvaW4oKSApLFxyXG5cdFx0XHRcdGRlY2ltYWxQbGFjZXMgPSBmdW5jdGlvbiggbnVtICkge1xyXG5cdFx0XHRcdFx0dmFyIG1hdGNoID0gKCBcIlwiICsgbnVtICkubWF0Y2goIC8oPzpcXC4oXFxkKykpPyQvICk7XHJcblx0XHRcdFx0XHRpZiAoICFtYXRjaCApIHtcclxuXHRcdFx0XHRcdFx0cmV0dXJuIDA7XHJcblx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0Ly8gTnVtYmVyIG9mIGRpZ2l0cyByaWdodCBvZiBkZWNpbWFsIHBvaW50LlxyXG5cdFx0XHRcdFx0cmV0dXJuIG1hdGNoWyAxIF0gPyBtYXRjaFsgMSBdLmxlbmd0aCA6IDA7XHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHR0b0ludCA9IGZ1bmN0aW9uKCBudW0gKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gTWF0aC5yb3VuZCggbnVtICogTWF0aC5wb3coIDEwLCBkZWNpbWFscyApICk7XHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHR2YWxpZCA9IHRydWUsXHJcblx0XHRcdFx0ZGVjaW1hbHM7XHJcblxyXG5cdFx0XHQvLyBXb3JrcyBvbmx5IGZvciB0ZXh0LCBudW1iZXIgYW5kIHJhbmdlIGlucHV0IHR5cGVzXHJcblx0XHRcdC8vIFRPRE8gZmluZCBhIHdheSB0byBzdXBwb3J0IGlucHV0IHR5cGVzIGRhdGUsIGRhdGV0aW1lLCBkYXRldGltZS1sb2NhbCwgbW9udGgsIHRpbWUgYW5kIHdlZWtcclxuXHRcdFx0aWYgKCBub3RTdXBwb3J0ZWQgKSB7XHJcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCBlcnJvck1lc3NhZ2UgKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0ZGVjaW1hbHMgPSBkZWNpbWFsUGxhY2VzKCBwYXJhbSApO1xyXG5cclxuXHRcdFx0Ly8gVmFsdWUgY2FuJ3QgaGF2ZSB0b28gbWFueSBkZWNpbWFsc1xyXG5cdFx0XHRpZiAoIGRlY2ltYWxQbGFjZXMoIHZhbHVlICkgPiBkZWNpbWFscyB8fCB0b0ludCggdmFsdWUgKSAlIHRvSW50KCBwYXJhbSApICE9PSAwICkge1xyXG5cdFx0XHRcdHZhbGlkID0gZmFsc2U7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJldHVybiB0aGlzLm9wdGlvbmFsKCBlbGVtZW50ICkgfHwgdmFsaWQ7XHJcblx0XHR9LFxyXG5cclxuXHRcdC8vIGh0dHBzOi8vanF1ZXJ5dmFsaWRhdGlvbi5vcmcvZXF1YWxUby1tZXRob2QvXHJcblx0XHRlcXVhbFRvOiBmdW5jdGlvbiggdmFsdWUsIGVsZW1lbnQsIHBhcmFtICkge1xyXG5cclxuXHRcdFx0Ly8gQmluZCB0byB0aGUgYmx1ciBldmVudCBvZiB0aGUgdGFyZ2V0IGluIG9yZGVyIHRvIHJldmFsaWRhdGUgd2hlbmV2ZXIgdGhlIHRhcmdldCBmaWVsZCBpcyB1cGRhdGVkXHJcblx0XHRcdHZhciB0YXJnZXQgPSAkKCBwYXJhbSApO1xyXG5cdFx0XHRpZiAoIHRoaXMuc2V0dGluZ3Mub25mb2N1c291dCAmJiB0YXJnZXQubm90KCBcIi52YWxpZGF0ZS1lcXVhbFRvLWJsdXJcIiApLmxlbmd0aCApIHtcclxuXHRcdFx0XHR0YXJnZXQuYWRkQ2xhc3MoIFwidmFsaWRhdGUtZXF1YWxUby1ibHVyXCIgKS5vbiggXCJibHVyLnZhbGlkYXRlLWVxdWFsVG9cIiwgZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHQkKCBlbGVtZW50ICkudmFsaWQoKTtcclxuXHRcdFx0XHR9ICk7XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIHZhbHVlID09PSB0YXJnZXQudmFsKCk7XHJcblx0XHR9LFxyXG5cclxuXHRcdC8vIGh0dHBzOi8vanF1ZXJ5dmFsaWRhdGlvbi5vcmcvcmVtb3RlLW1ldGhvZC9cclxuXHRcdHJlbW90ZTogZnVuY3Rpb24oIHZhbHVlLCBlbGVtZW50LCBwYXJhbSwgbWV0aG9kICkge1xyXG5cdFx0XHRpZiAoIHRoaXMub3B0aW9uYWwoIGVsZW1lbnQgKSApIHtcclxuXHRcdFx0XHRyZXR1cm4gXCJkZXBlbmRlbmN5LW1pc21hdGNoXCI7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdG1ldGhvZCA9IHR5cGVvZiBtZXRob2QgPT09IFwic3RyaW5nXCIgJiYgbWV0aG9kIHx8IFwicmVtb3RlXCI7XHJcblxyXG5cdFx0XHR2YXIgcHJldmlvdXMgPSB0aGlzLnByZXZpb3VzVmFsdWUoIGVsZW1lbnQsIG1ldGhvZCApLFxyXG5cdFx0XHRcdHZhbGlkYXRvciwgZGF0YSwgb3B0aW9uRGF0YVN0cmluZztcclxuXHJcblx0XHRcdGlmICggIXRoaXMuc2V0dGluZ3MubWVzc2FnZXNbIGVsZW1lbnQubmFtZSBdICkge1xyXG5cdFx0XHRcdHRoaXMuc2V0dGluZ3MubWVzc2FnZXNbIGVsZW1lbnQubmFtZSBdID0ge307XHJcblx0XHRcdH1cclxuXHRcdFx0cHJldmlvdXMub3JpZ2luYWxNZXNzYWdlID0gcHJldmlvdXMub3JpZ2luYWxNZXNzYWdlIHx8IHRoaXMuc2V0dGluZ3MubWVzc2FnZXNbIGVsZW1lbnQubmFtZSBdWyBtZXRob2QgXTtcclxuXHRcdFx0dGhpcy5zZXR0aW5ncy5tZXNzYWdlc1sgZWxlbWVudC5uYW1lIF1bIG1ldGhvZCBdID0gcHJldmlvdXMubWVzc2FnZTtcclxuXHJcblx0XHRcdHBhcmFtID0gdHlwZW9mIHBhcmFtID09PSBcInN0cmluZ1wiICYmIHsgdXJsOiBwYXJhbSB9IHx8IHBhcmFtO1xyXG5cdFx0XHRvcHRpb25EYXRhU3RyaW5nID0gJC5wYXJhbSggJC5leHRlbmQoIHsgZGF0YTogdmFsdWUgfSwgcGFyYW0uZGF0YSApICk7XHJcblx0XHRcdGlmICggcHJldmlvdXMub2xkID09PSBvcHRpb25EYXRhU3RyaW5nICkge1xyXG5cdFx0XHRcdHJldHVybiBwcmV2aW91cy52YWxpZDtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cHJldmlvdXMub2xkID0gb3B0aW9uRGF0YVN0cmluZztcclxuXHRcdFx0dmFsaWRhdG9yID0gdGhpcztcclxuXHRcdFx0dGhpcy5zdGFydFJlcXVlc3QoIGVsZW1lbnQgKTtcclxuXHRcdFx0ZGF0YSA9IHt9O1xyXG5cdFx0XHRkYXRhWyBlbGVtZW50Lm5hbWUgXSA9IHZhbHVlO1xyXG5cdFx0XHQkLmFqYXgoICQuZXh0ZW5kKCB0cnVlLCB7XHJcblx0XHRcdFx0bW9kZTogXCJhYm9ydFwiLFxyXG5cdFx0XHRcdHBvcnQ6IFwidmFsaWRhdGVcIiArIGVsZW1lbnQubmFtZSxcclxuXHRcdFx0XHRkYXRhVHlwZTogXCJqc29uXCIsXHJcblx0XHRcdFx0ZGF0YTogZGF0YSxcclxuXHRcdFx0XHRjb250ZXh0OiB2YWxpZGF0b3IuY3VycmVudEZvcm0sXHJcblx0XHRcdFx0c3VjY2VzczogZnVuY3Rpb24oIHJlc3BvbnNlICkge1xyXG5cdFx0XHRcdFx0dmFyIHZhbGlkID0gcmVzcG9uc2UgPT09IHRydWUgfHwgcmVzcG9uc2UgPT09IFwidHJ1ZVwiLFxyXG5cdFx0XHRcdFx0XHRlcnJvcnMsIG1lc3NhZ2UsIHN1Ym1pdHRlZDtcclxuXHJcblx0XHRcdFx0XHR2YWxpZGF0b3Iuc2V0dGluZ3MubWVzc2FnZXNbIGVsZW1lbnQubmFtZSBdWyBtZXRob2QgXSA9IHByZXZpb3VzLm9yaWdpbmFsTWVzc2FnZTtcclxuXHRcdFx0XHRcdGlmICggdmFsaWQgKSB7XHJcblx0XHRcdFx0XHRcdHN1Ym1pdHRlZCA9IHZhbGlkYXRvci5mb3JtU3VibWl0dGVkO1xyXG5cdFx0XHRcdFx0XHR2YWxpZGF0b3IucmVzZXRJbnRlcm5hbHMoKTtcclxuXHRcdFx0XHRcdFx0dmFsaWRhdG9yLnRvSGlkZSA9IHZhbGlkYXRvci5lcnJvcnNGb3IoIGVsZW1lbnQgKTtcclxuXHRcdFx0XHRcdFx0dmFsaWRhdG9yLmZvcm1TdWJtaXR0ZWQgPSBzdWJtaXR0ZWQ7XHJcblx0XHRcdFx0XHRcdHZhbGlkYXRvci5zdWNjZXNzTGlzdC5wdXNoKCBlbGVtZW50ICk7XHJcblx0XHRcdFx0XHRcdHZhbGlkYXRvci5pbnZhbGlkWyBlbGVtZW50Lm5hbWUgXSA9IGZhbHNlO1xyXG5cdFx0XHRcdFx0XHR2YWxpZGF0b3Iuc2hvd0Vycm9ycygpO1xyXG5cdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0ZXJyb3JzID0ge307XHJcblx0XHRcdFx0XHRcdG1lc3NhZ2UgPSByZXNwb25zZSB8fCB2YWxpZGF0b3IuZGVmYXVsdE1lc3NhZ2UoIGVsZW1lbnQsIHsgbWV0aG9kOiBtZXRob2QsIHBhcmFtZXRlcnM6IHZhbHVlIH0gKTtcclxuXHRcdFx0XHRcdFx0ZXJyb3JzWyBlbGVtZW50Lm5hbWUgXSA9IHByZXZpb3VzLm1lc3NhZ2UgPSBtZXNzYWdlO1xyXG5cdFx0XHRcdFx0XHR2YWxpZGF0b3IuaW52YWxpZFsgZWxlbWVudC5uYW1lIF0gPSB0cnVlO1xyXG5cdFx0XHRcdFx0XHR2YWxpZGF0b3Iuc2hvd0Vycm9ycyggZXJyb3JzICk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRwcmV2aW91cy52YWxpZCA9IHZhbGlkO1xyXG5cdFx0XHRcdFx0dmFsaWRhdG9yLnN0b3BSZXF1ZXN0KCBlbGVtZW50LCB2YWxpZCApO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSwgcGFyYW0gKSApO1xyXG5cdFx0XHRyZXR1cm4gXCJwZW5kaW5nXCI7XHJcblx0XHR9XHJcblx0fVxyXG5cclxufSApO1xyXG5cclxuLy8gQWpheCBtb2RlOiBhYm9ydFxyXG4vLyB1c2FnZTogJC5hamF4KHsgbW9kZTogXCJhYm9ydFwiWywgcG9ydDogXCJ1bmlxdWVwb3J0XCJdfSk7XHJcbi8vIGlmIG1vZGU6XCJhYm9ydFwiIGlzIHVzZWQsIHRoZSBwcmV2aW91cyByZXF1ZXN0IG9uIHRoYXQgcG9ydCAocG9ydCBjYW4gYmUgdW5kZWZpbmVkKSBpcyBhYm9ydGVkIHZpYSBYTUxIdHRwUmVxdWVzdC5hYm9ydCgpXHJcblxyXG52YXIgcGVuZGluZ1JlcXVlc3RzID0ge30sXHJcblx0YWpheDtcclxuXHJcbi8vIFVzZSBhIHByZWZpbHRlciBpZiBhdmFpbGFibGUgKDEuNSspXHJcbmlmICggJC5hamF4UHJlZmlsdGVyICkge1xyXG5cdCQuYWpheFByZWZpbHRlciggZnVuY3Rpb24oIHNldHRpbmdzLCBfLCB4aHIgKSB7XHJcblx0XHR2YXIgcG9ydCA9IHNldHRpbmdzLnBvcnQ7XHJcblx0XHRpZiAoIHNldHRpbmdzLm1vZGUgPT09IFwiYWJvcnRcIiApIHtcclxuXHRcdFx0aWYgKCBwZW5kaW5nUmVxdWVzdHNbIHBvcnQgXSApIHtcclxuXHRcdFx0XHRwZW5kaW5nUmVxdWVzdHNbIHBvcnQgXS5hYm9ydCgpO1xyXG5cdFx0XHR9XHJcblx0XHRcdHBlbmRpbmdSZXF1ZXN0c1sgcG9ydCBdID0geGhyO1xyXG5cdFx0fVxyXG5cdH0gKTtcclxufSBlbHNlIHtcclxuXHJcblx0Ly8gUHJveHkgYWpheFxyXG5cdGFqYXggPSAkLmFqYXg7XHJcblx0JC5hamF4ID0gZnVuY3Rpb24oIHNldHRpbmdzICkge1xyXG5cdFx0dmFyIG1vZGUgPSAoIFwibW9kZVwiIGluIHNldHRpbmdzID8gc2V0dGluZ3MgOiAkLmFqYXhTZXR0aW5ncyApLm1vZGUsXHJcblx0XHRcdHBvcnQgPSAoIFwicG9ydFwiIGluIHNldHRpbmdzID8gc2V0dGluZ3MgOiAkLmFqYXhTZXR0aW5ncyApLnBvcnQ7XHJcblx0XHRpZiAoIG1vZGUgPT09IFwiYWJvcnRcIiApIHtcclxuXHRcdFx0aWYgKCBwZW5kaW5nUmVxdWVzdHNbIHBvcnQgXSApIHtcclxuXHRcdFx0XHRwZW5kaW5nUmVxdWVzdHNbIHBvcnQgXS5hYm9ydCgpO1xyXG5cdFx0XHR9XHJcblx0XHRcdHBlbmRpbmdSZXF1ZXN0c1sgcG9ydCBdID0gYWpheC5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XHJcblx0XHRcdHJldHVybiBwZW5kaW5nUmVxdWVzdHNbIHBvcnQgXTtcclxuXHRcdH1cclxuXHRcdHJldHVybiBhamF4LmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcclxuXHR9O1xyXG59XHJcbnJldHVybiAkO1xyXG59KSk7Il0sImZpbGUiOiJsaWIvanF1ZXJ5LXZhbGlkYXRpb24vZGlzdC9qcXVlcnkudmFsaWRhdGUuZXM1LmpzIn0=
