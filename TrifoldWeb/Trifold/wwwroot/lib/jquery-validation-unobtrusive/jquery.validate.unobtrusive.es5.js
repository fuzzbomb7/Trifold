"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

// Unobtrusive validation support library for jQuery and jQuery Validate
// Copyright (C) Microsoft Corporation. All rights reserved.
// @version v3.2.9

/*jslint white: true, browser: true, onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true, strict: false */

/*global document: false, jQuery: false */
(function (factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define("jquery.validate.unobtrusive", ['jquery.validation'], factory);
  } else if ((typeof module === "undefined" ? "undefined" : _typeof(module)) === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports     
    module.exports = factory(require('jquery-validation'));
  } else {
    // Browser global
    jQuery.validator.unobtrusive = factory(jQuery);
  }
})(function ($) {
  var $jQval = $.validator,
      adapters,
      data_validation = "unobtrusiveValidation";

  function setValidationValues(options, ruleName, value) {
    options.rules[ruleName] = value;

    if (options.message) {
      options.messages[ruleName] = options.message;
    }
  }

  function splitAndTrim(value) {
    return value.replace(/^\s+|\s+$/g, "").split(/\s*,\s*/g);
  }

  function escapeAttributeValue(value) {
    // As mentioned on http://api.jquery.com/category/selectors/
    return value.replace(/([!"#$%&'()*+,./:;<=>?@\[\\\]^`{|}~])/g, "\\$1");
  }

  function getModelPrefix(fieldName) {
    return fieldName.substr(0, fieldName.lastIndexOf(".") + 1);
  }

  function appendModelPrefix(value, prefix) {
    if (value.indexOf("*.") === 0) {
      value = value.replace("*.", prefix);
    }

    return value;
  }

  function onError(error, inputElement) {
    // 'this' is the form element
    var container = $(this).find("[data-valmsg-for='" + escapeAttributeValue(inputElement[0].name) + "']"),
        replaceAttrValue = container.attr("data-valmsg-replace"),
        replace = replaceAttrValue ? $.parseJSON(replaceAttrValue) !== false : null;
    container.removeClass("field-validation-valid").addClass("field-validation-error");
    error.data("unobtrusiveContainer", container);

    if (replace) {
      container.empty();
      error.removeClass("input-validation-error").appendTo(container);
    } else {
      error.hide();
    }
  }

  function onErrors(event, validator) {
    // 'this' is the form element
    var container = $(this).find("[data-valmsg-summary=true]"),
        list = container.find("ul");

    if (list && list.length && validator.errorList.length) {
      list.empty();
      container.addClass("validation-summary-errors").removeClass("validation-summary-valid");
      $.each(validator.errorList, function () {
        $("<li />").html(this.message).appendTo(list);
      });
    }
  }

  function onSuccess(error) {
    // 'this' is the form element
    var container = error.data("unobtrusiveContainer");

    if (container) {
      var replaceAttrValue = container.attr("data-valmsg-replace"),
          replace = replaceAttrValue ? $.parseJSON(replaceAttrValue) : null;
      container.addClass("field-validation-valid").removeClass("field-validation-error");
      error.removeData("unobtrusiveContainer");

      if (replace) {
        container.empty();
      }
    }
  }

  function onReset(event) {
    // 'this' is the form element
    var $form = $(this),
        key = '__jquery_unobtrusive_validation_form_reset';

    if ($form.data(key)) {
      return;
    } // Set a flag that indicates we're currently resetting the form.


    $form.data(key, true);

    try {
      $form.data("validator").resetForm();
    } finally {
      $form.removeData(key);
    }

    $form.find(".validation-summary-errors").addClass("validation-summary-valid").removeClass("validation-summary-errors");
    $form.find(".field-validation-error").addClass("field-validation-valid").removeClass("field-validation-error").removeData("unobtrusiveContainer").find(">*") // If we were using valmsg-replace, get the underlying error
    .removeData("unobtrusiveContainer");
  }

  function validationInfo(form) {
    var $form = $(form),
        result = $form.data(data_validation),
        onResetProxy = $.proxy(onReset, form),
        defaultOptions = $jQval.unobtrusive.options || {},
        execInContext = function execInContext(name, args) {
      var func = defaultOptions[name];
      func && $.isFunction(func) && func.apply(form, args);
    };

    if (!result) {
      result = {
        options: {
          // options structure passed to jQuery Validate's validate() method
          errorClass: defaultOptions.errorClass || "input-validation-error",
          errorElement: defaultOptions.errorElement || "span",
          errorPlacement: function errorPlacement() {
            onError.apply(form, arguments);
            execInContext("errorPlacement", arguments);
          },
          invalidHandler: function invalidHandler() {
            onErrors.apply(form, arguments);
            execInContext("invalidHandler", arguments);
          },
          messages: {},
          rules: {},
          success: function success() {
            onSuccess.apply(form, arguments);
            execInContext("success", arguments);
          }
        },
        attachValidation: function attachValidation() {
          $form.off("reset." + data_validation, onResetProxy).on("reset." + data_validation, onResetProxy).validate(this.options);
        },
        validate: function validate() {
          // a validation function that is called by unobtrusive Ajax
          $form.validate();
          return $form.valid();
        }
      };
      $form.data(data_validation, result);
    }

    return result;
  }

  $jQval.unobtrusive = {
    adapters: [],
    parseElement: function parseElement(element, skipAttach) {
      /// <summary>
      /// Parses a single HTML element for unobtrusive validation attributes.
      /// </summary>
      /// <param name="element" domElement="true">The HTML element to be parsed.</param>
      /// <param name="skipAttach" type="Boolean">[Optional] true to skip attaching the
      /// validation to the form. If parsing just this single element, you should specify true.
      /// If parsing several elements, you should specify false, and manually attach the validation
      /// to the form when you are finished. The default is false.</param>
      var $element = $(element),
          form = $element.parents("form")[0],
          valInfo,
          rules,
          messages;

      if (!form) {
        // Cannot do client-side validation without a form
        return;
      }

      valInfo = validationInfo(form);
      valInfo.options.rules[element.name] = rules = {};
      valInfo.options.messages[element.name] = messages = {};
      $.each(this.adapters, function () {
        var prefix = "data-val-" + this.name,
            message = $element.attr(prefix),
            paramValues = {};

        if (message !== undefined) {
          // Compare against undefined, because an empty message is legal (and falsy)
          prefix += "-";
          $.each(this.params, function () {
            paramValues[this] = $element.attr(prefix + this);
          });
          this.adapt({
            element: element,
            form: form,
            message: message,
            params: paramValues,
            rules: rules,
            messages: messages
          });
        }
      });
      $.extend(rules, {
        "__dummy__": true
      });

      if (!skipAttach) {
        valInfo.attachValidation();
      }
    },
    parse: function parse(selector) {
      /// <summary>
      /// Parses all the HTML elements in the specified selector. It looks for input elements decorated
      /// with the [data-val=true] attribute value and enables validation according to the data-val-*
      /// attribute values.
      /// </summary>
      /// <param name="selector" type="String">Any valid jQuery selector.</param>
      // $forms includes all forms in selector's DOM hierarchy (parent, children and self) that have at least one
      // element with data-val=true
      var $selector = $(selector),
          $forms = $selector.parents().addBack().filter("form").add($selector.find("form")).has("[data-val=true]");
      $selector.find("[data-val=true]").each(function () {
        $jQval.unobtrusive.parseElement(this, true);
      });
      $forms.each(function () {
        var info = validationInfo(this);

        if (info) {
          info.attachValidation();
        }
      });
    }
  };
  adapters = $jQval.unobtrusive.adapters;

  adapters.add = function (adapterName, params, fn) {
    /// <summary>Adds a new adapter to convert unobtrusive HTML into a jQuery Validate validation.</summary>
    /// <param name="adapterName" type="String">The name of the adapter to be added. This matches the name used
    /// in the data-val-nnnn HTML attribute (where nnnn is the adapter name).</param>
    /// <param name="params" type="Array" optional="true">[Optional] An array of parameter names (strings) that will
    /// be extracted from the data-val-nnnn-mmmm HTML attributes (where nnnn is the adapter name, and
    /// mmmm is the parameter name).</param>
    /// <param name="fn" type="Function">The function to call, which adapts the values from the HTML
    /// attributes into jQuery Validate rules and/or messages.</param>
    /// <returns type="jQuery.validator.unobtrusive.adapters" />
    if (!fn) {
      // Called with no params, just a function
      fn = params;
      params = [];
    }

    this.push({
      name: adapterName,
      params: params,
      adapt: fn
    });
    return this;
  };

  adapters.addBool = function (adapterName, ruleName) {
    /// <summary>Adds a new adapter to convert unobtrusive HTML into a jQuery Validate validation, where
    /// the jQuery Validate validation rule has no parameter values.</summary>
    /// <param name="adapterName" type="String">The name of the adapter to be added. This matches the name used
    /// in the data-val-nnnn HTML attribute (where nnnn is the adapter name).</param>
    /// <param name="ruleName" type="String" optional="true">[Optional] The name of the jQuery Validate rule. If not provided, the value
    /// of adapterName will be used instead.</param>
    /// <returns type="jQuery.validator.unobtrusive.adapters" />
    return this.add(adapterName, function (options) {
      setValidationValues(options, ruleName || adapterName, true);
    });
  };

  adapters.addMinMax = function (adapterName, minRuleName, maxRuleName, minMaxRuleName, minAttribute, maxAttribute) {
    /// <summary>Adds a new adapter to convert unobtrusive HTML into a jQuery Validate validation, where
    /// the jQuery Validate validation has three potential rules (one for min-only, one for max-only, and
    /// one for min-and-max). The HTML parameters are expected to be named -min and -max.</summary>
    /// <param name="adapterName" type="String">The name of the adapter to be added. This matches the name used
    /// in the data-val-nnnn HTML attribute (where nnnn is the adapter name).</param>
    /// <param name="minRuleName" type="String">The name of the jQuery Validate rule to be used when you only
    /// have a minimum value.</param>
    /// <param name="maxRuleName" type="String">The name of the jQuery Validate rule to be used when you only
    /// have a maximum value.</param>
    /// <param name="minMaxRuleName" type="String">The name of the jQuery Validate rule to be used when you
    /// have both a minimum and maximum value.</param>
    /// <param name="minAttribute" type="String" optional="true">[Optional] The name of the HTML attribute that
    /// contains the minimum value. The default is "min".</param>
    /// <param name="maxAttribute" type="String" optional="true">[Optional] The name of the HTML attribute that
    /// contains the maximum value. The default is "max".</param>
    /// <returns type="jQuery.validator.unobtrusive.adapters" />
    return this.add(adapterName, [minAttribute || "min", maxAttribute || "max"], function (options) {
      var min = options.params.min,
          max = options.params.max;

      if (min && max) {
        setValidationValues(options, minMaxRuleName, [min, max]);
      } else if (min) {
        setValidationValues(options, minRuleName, min);
      } else if (max) {
        setValidationValues(options, maxRuleName, max);
      }
    });
  };

  adapters.addSingleVal = function (adapterName, attribute, ruleName) {
    /// <summary>Adds a new adapter to convert unobtrusive HTML into a jQuery Validate validation, where
    /// the jQuery Validate validation rule has a single value.</summary>
    /// <param name="adapterName" type="String">The name of the adapter to be added. This matches the name used
    /// in the data-val-nnnn HTML attribute(where nnnn is the adapter name).</param>
    /// <param name="attribute" type="String">[Optional] The name of the HTML attribute that contains the value.
    /// The default is "val".</param>
    /// <param name="ruleName" type="String" optional="true">[Optional] The name of the jQuery Validate rule. If not provided, the value
    /// of adapterName will be used instead.</param>
    /// <returns type="jQuery.validator.unobtrusive.adapters" />
    return this.add(adapterName, [attribute || "val"], function (options) {
      setValidationValues(options, ruleName || adapterName, options.params[attribute]);
    });
  };

  $jQval.addMethod("__dummy__", function (value, element, params) {
    return true;
  });
  $jQval.addMethod("regex", function (value, element, params) {
    var match;

    if (this.optional(element)) {
      return true;
    }

    match = new RegExp(params).exec(value);
    return match && match.index === 0 && match[0].length === value.length;
  });
  $jQval.addMethod("nonalphamin", function (value, element, nonalphamin) {
    var match;

    if (nonalphamin) {
      match = value.match(/\W/g);
      match = match && match.length >= nonalphamin;
    }

    return match;
  });

  if ($jQval.methods.extension) {
    adapters.addSingleVal("accept", "mimtype");
    adapters.addSingleVal("extension", "extension");
  } else {
    // for backward compatibility, when the 'extension' validation method does not exist, such as with versions
    // of JQuery Validation plugin prior to 1.10, we should use the 'accept' method for
    // validating the extension, and ignore mime-type validations as they are not supported.
    adapters.addSingleVal("extension", "extension", "accept");
  }

  adapters.addSingleVal("regex", "pattern");
  adapters.addBool("creditcard").addBool("date").addBool("digits").addBool("email").addBool("number").addBool("url");
  adapters.addMinMax("length", "minlength", "maxlength", "rangelength").addMinMax("range", "min", "max", "range");
  adapters.addMinMax("minlength", "minlength").addMinMax("maxlength", "minlength", "maxlength");
  adapters.add("equalto", ["other"], function (options) {
    var prefix = getModelPrefix(options.element.name),
        other = options.params.other,
        fullOtherName = appendModelPrefix(other, prefix),
        element = $(options.form).find(":input").filter("[name='" + escapeAttributeValue(fullOtherName) + "']")[0];
    setValidationValues(options, "equalTo", element);
  });
  adapters.add("required", function (options) {
    // jQuery Validate equates "required" with "mandatory" for checkbox elements
    if (options.element.tagName.toUpperCase() !== "INPUT" || options.element.type.toUpperCase() !== "CHECKBOX") {
      setValidationValues(options, "required", true);
    }
  });
  adapters.add("remote", ["url", "type", "additionalfields"], function (options) {
    var value = {
      url: options.params.url,
      type: options.params.type || "GET",
      data: {}
    },
        prefix = getModelPrefix(options.element.name);
    $.each(splitAndTrim(options.params.additionalfields || options.element.name), function (i, fieldName) {
      var paramName = appendModelPrefix(fieldName, prefix);

      value.data[paramName] = function () {
        var field = $(options.form).find(":input").filter("[name='" + escapeAttributeValue(paramName) + "']"); // For checkboxes and radio buttons, only pick up values from checked fields.

        if (field.is(":checkbox")) {
          return field.filter(":checked").val() || field.filter(":hidden").val() || '';
        } else if (field.is(":radio")) {
          return field.filter(":checked").val() || '';
        }

        return field.val();
      };
    });
    setValidationValues(options, "remote", value);
  });
  adapters.add("password", ["min", "nonalphamin", "regex"], function (options) {
    if (options.params.min) {
      setValidationValues(options, "minlength", options.params.min);
    }

    if (options.params.nonalphamin) {
      setValidationValues(options, "nonalphamin", options.params.nonalphamin);
    }

    if (options.params.regex) {
      setValidationValues(options, "regex", options.params.regex);
    }
  });
  adapters.add("fileextensions", ["extensions"], function (options) {
    setValidationValues(options, "extension", options.params.extensions);
  });
  $(function () {
    $jQval.unobtrusive.parse(document);
  });
  return $jQval.unobtrusive;
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9qcXVlcnktdmFsaWRhdGlvbi11bm9idHJ1c2l2ZS9qcXVlcnkudmFsaWRhdGUudW5vYnRydXNpdmUuanMiXSwibmFtZXMiOlsiZmFjdG9yeSIsImRlZmluZSIsImFtZCIsIm1vZHVsZSIsImV4cG9ydHMiLCJyZXF1aXJlIiwialF1ZXJ5IiwidmFsaWRhdG9yIiwidW5vYnRydXNpdmUiLCIkIiwiJGpRdmFsIiwiYWRhcHRlcnMiLCJkYXRhX3ZhbGlkYXRpb24iLCJzZXRWYWxpZGF0aW9uVmFsdWVzIiwib3B0aW9ucyIsInJ1bGVOYW1lIiwidmFsdWUiLCJydWxlcyIsIm1lc3NhZ2UiLCJtZXNzYWdlcyIsInNwbGl0QW5kVHJpbSIsInJlcGxhY2UiLCJzcGxpdCIsImVzY2FwZUF0dHJpYnV0ZVZhbHVlIiwiZ2V0TW9kZWxQcmVmaXgiLCJmaWVsZE5hbWUiLCJzdWJzdHIiLCJsYXN0SW5kZXhPZiIsImFwcGVuZE1vZGVsUHJlZml4IiwicHJlZml4IiwiaW5kZXhPZiIsIm9uRXJyb3IiLCJlcnJvciIsImlucHV0RWxlbWVudCIsImNvbnRhaW5lciIsImZpbmQiLCJuYW1lIiwicmVwbGFjZUF0dHJWYWx1ZSIsImF0dHIiLCJwYXJzZUpTT04iLCJyZW1vdmVDbGFzcyIsImFkZENsYXNzIiwiZGF0YSIsImVtcHR5IiwiYXBwZW5kVG8iLCJoaWRlIiwib25FcnJvcnMiLCJldmVudCIsImxpc3QiLCJsZW5ndGgiLCJlcnJvckxpc3QiLCJlYWNoIiwiaHRtbCIsIm9uU3VjY2VzcyIsInJlbW92ZURhdGEiLCJvblJlc2V0IiwiJGZvcm0iLCJrZXkiLCJyZXNldEZvcm0iLCJ2YWxpZGF0aW9uSW5mbyIsImZvcm0iLCJyZXN1bHQiLCJvblJlc2V0UHJveHkiLCJwcm94eSIsImRlZmF1bHRPcHRpb25zIiwiZXhlY0luQ29udGV4dCIsImFyZ3MiLCJmdW5jIiwiaXNGdW5jdGlvbiIsImFwcGx5IiwiZXJyb3JDbGFzcyIsImVycm9yRWxlbWVudCIsImVycm9yUGxhY2VtZW50IiwiYXJndW1lbnRzIiwiaW52YWxpZEhhbmRsZXIiLCJzdWNjZXNzIiwiYXR0YWNoVmFsaWRhdGlvbiIsIm9mZiIsIm9uIiwidmFsaWRhdGUiLCJ2YWxpZCIsInBhcnNlRWxlbWVudCIsImVsZW1lbnQiLCJza2lwQXR0YWNoIiwiJGVsZW1lbnQiLCJwYXJlbnRzIiwidmFsSW5mbyIsInBhcmFtVmFsdWVzIiwidW5kZWZpbmVkIiwicGFyYW1zIiwiYWRhcHQiLCJleHRlbmQiLCJwYXJzZSIsInNlbGVjdG9yIiwiJHNlbGVjdG9yIiwiJGZvcm1zIiwiYWRkQmFjayIsImZpbHRlciIsImFkZCIsImhhcyIsImluZm8iLCJhZGFwdGVyTmFtZSIsImZuIiwicHVzaCIsImFkZEJvb2wiLCJhZGRNaW5NYXgiLCJtaW5SdWxlTmFtZSIsIm1heFJ1bGVOYW1lIiwibWluTWF4UnVsZU5hbWUiLCJtaW5BdHRyaWJ1dGUiLCJtYXhBdHRyaWJ1dGUiLCJtaW4iLCJtYXgiLCJhZGRTaW5nbGVWYWwiLCJhdHRyaWJ1dGUiLCJhZGRNZXRob2QiLCJtYXRjaCIsIm9wdGlvbmFsIiwiUmVnRXhwIiwiZXhlYyIsImluZGV4Iiwibm9uYWxwaGFtaW4iLCJtZXRob2RzIiwiZXh0ZW5zaW9uIiwib3RoZXIiLCJmdWxsT3RoZXJOYW1lIiwidGFnTmFtZSIsInRvVXBwZXJDYXNlIiwidHlwZSIsInVybCIsImFkZGl0aW9uYWxmaWVsZHMiLCJpIiwicGFyYW1OYW1lIiwiZmllbGQiLCJpcyIsInZhbCIsInJlZ2V4IiwiZXh0ZW5zaW9ucyIsImRvY3VtZW50Il0sIm1hcHBpbmdzIjoiOzs7O0FBQUE7QUFDQTtBQUNBOztBQUVBOztBQUNBO0FBRUMsV0FBVUEsT0FBVixFQUFtQjtBQUNoQixNQUFJLE9BQU9DLE1BQVAsS0FBa0IsVUFBbEIsSUFBZ0NBLE1BQU0sQ0FBQ0MsR0FBM0MsRUFBZ0Q7QUFDNUM7QUFDQUQsSUFBQUEsTUFBTSxDQUFDLDZCQUFELEVBQWdDLENBQUMsbUJBQUQsQ0FBaEMsRUFBdURELE9BQXZELENBQU47QUFD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RUFBMEI7QUFDdEIzSCxNQUFBQSxtQkFBbUIsQ0FBQ0MsT0FBRCxFQUFVLE9BQVYsRUFBbUJBLE9BQU8sQ0FBQzJFLE1BQVIsQ0FBZStDLEtBQWxDLENBQW5CO0FBQ0g7QUFDSixHQVZEO0FBV0E3SCxFQUFBQSxRQUFRLENBQUN1RixHQUFULENBQWEsZ0JBQWIsRUFBK0IsQ0FBQyxZQUFELENBQS9CLEVBQStDLFVBQVVwRixPQUFWLEVBQW1CO0FBQzlERCxJQUFBQSxtQkFBbUIsQ0FBQ0MsT0FBRCxFQUFVLFdBQVYsRUFBdUJBLE9BQU8sQ0FBQzJFLE1BQVIsQ0FBZWdELFVBQXRDLENBQW5CO0FBQ0gsR0FGRDtBQUlBaEksRUFBQUEsQ0FBQyxDQUFDLFlBQVk7QUFDVkMsSUFBQUEsTUFBTSxDQUFDRixXQUFQLENBQW1Cb0YsS0FBbkIsQ0FBeUI4QyxRQUF6QjtBQUNILEdBRkEsQ0FBRDtBQUlBLFNBQU9oSSxNQUFNLENBQUNGLFdBQWQ7QUFDSCxDQXZhQSxDQUFEIiwic291cmNlc0NvbnRlbnQiOlsiLy8gVW5vYnRydXNpdmUgdmFsaWRhdGlvbiBzdXBwb3J0IGxpYnJhcnkgZm9yIGpRdWVyeSBhbmQgalF1ZXJ5IFZhbGlkYXRlXHJcbi8vIENvcHlyaWdodCAoQykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG4vLyBAdmVyc2lvbiB2My4yLjlcclxuXHJcbi8qanNsaW50IHdoaXRlOiB0cnVlLCBicm93c2VyOiB0cnVlLCBvbmV2YXI6IHRydWUsIHVuZGVmOiB0cnVlLCBub21lbjogdHJ1ZSwgZXFlcWVxOiB0cnVlLCBwbHVzcGx1czogdHJ1ZSwgYml0d2lzZTogdHJ1ZSwgcmVnZXhwOiB0cnVlLCBuZXdjYXA6IHRydWUsIGltbWVkOiB0cnVlLCBzdHJpY3Q6IGZhbHNlICovXHJcbi8qZ2xvYmFsIGRvY3VtZW50OiBmYWxzZSwgalF1ZXJ5OiBmYWxzZSAqL1xyXG5cclxuKGZ1bmN0aW9uIChmYWN0b3J5KSB7XHJcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XHJcbiAgICAgICAgLy8gQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlLlxyXG4gICAgICAgIGRlZmluZShcImpxdWVyeS52YWxpZGF0ZS51bm9idHJ1c2l2ZVwiLCBbJ2pxdWVyeS52YWxpZGF0aW9uJ10sIGZhY3RvcnkpO1xyXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cykge1xyXG4gICAgICAgIC8vIENvbW1vbkpTLWxpa2UgZW52aXJvbm1lbnRzIHRoYXQgc3VwcG9ydCBtb2R1bGUuZXhwb3J0cyAgICAgXHJcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJlcXVpcmUoJ2pxdWVyeS12YWxpZGF0aW9uJykpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBCcm93c2VyIGdsb2JhbFxyXG4gICAgICAgIGpRdWVyeS52YWxpZGF0b3IudW5vYnRydXNpdmUgPSBmYWN0b3J5KGpRdWVyeSk7XHJcbiAgICB9XHJcbn0oZnVuY3Rpb24gKCQpIHtcclxuICAgIHZhciAkalF2YWwgPSAkLnZhbGlkYXRvcixcclxuICAgICAgICBhZGFwdGVycyxcclxuICAgICAgICBkYXRhX3ZhbGlkYXRpb24gPSBcInVub2J0cnVzaXZlVmFsaWRhdGlvblwiO1xyXG5cclxuICAgIGZ1bmN0aW9uIHNldFZhbGlkYXRpb25WYWx1ZXMob3B0aW9ucywgcnVsZU5hbWUsIHZhbHVlKSB7XHJcbiAgICAgICAgb3B0aW9ucy5ydWxlc1tydWxlTmFtZV0gPSB2YWx1ZTtcclxuICAgICAgICBpZiAob3B0aW9ucy5tZXNzYWdlKSB7XHJcbiAgICAgICAgICAgIG9wdGlvbnMubWVzc2FnZXNbcnVsZU5hbWVdID0gb3B0aW9ucy5tZXNzYWdlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBzcGxpdEFuZFRyaW0odmFsdWUpIHtcclxuICAgICAgICByZXR1cm4gdmFsdWUucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgXCJcIikuc3BsaXQoL1xccyosXFxzKi9nKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBlc2NhcGVBdHRyaWJ1dGVWYWx1ZSh2YWx1ZSkge1xyXG4gICAgICAgIC8vIEFzIG1lbnRpb25lZCBvbiBodHRwOi8vYXBpLmpxdWVyeS5jb20vY2F0ZWdvcnkvc2VsZWN0b3JzL1xyXG4gICAgICAgIHJldHVybiB2YWx1ZS5yZXBsYWNlKC8oWyFcIiMkJSYnKCkqKywuLzo7PD0+P0BcXFtcXFxcXFxdXmB7fH1+XSkvZywgXCJcXFxcJDFcIik7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0TW9kZWxQcmVmaXgoZmllbGROYW1lKSB7XHJcbiAgICAgICAgcmV0dXJuIGZpZWxkTmFtZS5zdWJzdHIoMCwgZmllbGROYW1lLmxhc3RJbmRleE9mKFwiLlwiKSArIDEpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGFwcGVuZE1vZGVsUHJlZml4KHZhbHVlLCBwcmVmaXgpIHtcclxuICAgICAgICBpZiAodmFsdWUuaW5kZXhPZihcIiouXCIpID09PSAwKSB7XHJcbiAgICAgICAgICAgIHZhbHVlID0gdmFsdWUucmVwbGFjZShcIiouXCIsIHByZWZpeCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBvbkVycm9yKGVycm9yLCBpbnB1dEVsZW1lbnQpIHsgIC8vICd0aGlzJyBpcyB0aGUgZm9ybSBlbGVtZW50XHJcbiAgICAgICAgdmFyIGNvbnRhaW5lciA9ICQodGhpcykuZmluZChcIltkYXRhLXZhbG1zZy1mb3I9J1wiICsgZXNjYXBlQXR0cmlidXRlVmFsdWUoaW5wdXRFbGVtZW50WzBdLm5hbWUpICsgXCInXVwiKSxcclxuICAgICAgICAgICAgcmVwbGFjZUF0dHJWYWx1ZSA9IGNvbnRhaW5lci5hdHRyKFwiZGF0YS12YWxtc2ctcmVwbGFjZVwiKSxcclxuICAgICAgICAgICAgcmVwbGFjZSA9IHJlcGxhY2VBdHRyVmFsdWUgPyAkLnBhcnNlSlNPTihyZXBsYWNlQXR0clZhbHVlKSAhPT0gZmFsc2UgOiBudWxsO1xyXG5cclxuICAgICAgICBjb250YWluZXIucmVtb3ZlQ2xhc3MoXCJmaWVsZC12YWxpZGF0aW9uLXZhbGlkXCIpLmFkZENsYXNzKFwiZmllbGQtdmFsaWRhdGlvbi1lcnJvclwiKTtcclxuICAgICAgICBlcnJvci5kYXRhKFwidW5vYnRydXNpdmVDb250YWluZXJcIiwgY29udGFpbmVyKTtcclxuXHJcbiAgICAgICAgaWYgKHJlcGxhY2UpIHtcclxuICAgICAgICAgICAgY29udGFpbmVyLmVtcHR5KCk7XHJcbiAgICAgICAgICAgIGVycm9yLnJlbW92ZUNsYXNzKFwiaW5wdXQtdmFsaWRhdGlvbi1lcnJvclwiKS5hcHBlbmRUbyhjb250YWluZXIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgZXJyb3IuaGlkZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBvbkVycm9ycyhldmVudCwgdmFsaWRhdG9yKSB7ICAvLyAndGhpcycgaXMgdGhlIGZvcm0gZWxlbWVudFxyXG4gICAgICAgIHZhciBjb250YWluZXIgPSAkKHRoaXMpLmZpbmQoXCJbZGF0YS12YWxtc2ctc3VtbWFyeT10cnVlXVwiKSxcclxuICAgICAgICAgICAgbGlzdCA9IGNvbnRhaW5lci5maW5kKFwidWxcIik7XHJcblxyXG4gICAgICAgIGlmIChsaXN0ICYmIGxpc3QubGVuZ3RoICYmIHZhbGlkYXRvci5lcnJvckxpc3QubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGxpc3QuZW1wdHkoKTtcclxuICAgICAgICAgICAgY29udGFpbmVyLmFkZENsYXNzKFwidmFsaWRhdGlvbi1zdW1tYXJ5LWVycm9yc1wiKS5yZW1vdmVDbGFzcyhcInZhbGlkYXRpb24tc3VtbWFyeS12YWxpZFwiKTtcclxuXHJcbiAgICAgICAgICAgICQuZWFjaCh2YWxpZGF0b3IuZXJyb3JMaXN0LCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAkKFwiPGxpIC8+XCIpLmh0bWwodGhpcy5tZXNzYWdlKS5hcHBlbmRUbyhsaXN0KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIG9uU3VjY2VzcyhlcnJvcikgeyAgLy8gJ3RoaXMnIGlzIHRoZSBmb3JtIGVsZW1lbnRcclxuICAgICAgICB2YXIgY29udGFpbmVyID0gZXJyb3IuZGF0YShcInVub2J0cnVzaXZlQ29udGFpbmVyXCIpO1xyXG5cclxuICAgICAgICBpZiAoY29udGFpbmVyKSB7XHJcbiAgICAgICAgICAgIHZhciByZXBsYWNlQXR0clZhbHVlID0gY29udGFpbmVyLmF0dHIoXCJkYXRhLXZhbG1zZy1yZXBsYWNlXCIpLFxyXG4gICAgICAgICAgICAgICAgcmVwbGFjZSA9IHJlcGxhY2VBdHRyVmFsdWUgPyAkLnBhcnNlSlNPTihyZXBsYWNlQXR0clZhbHVlKSA6IG51bGw7XHJcblxyXG4gICAgICAgICAgICBjb250YWluZXIuYWRkQ2xhc3MoXCJmaWVsZC12YWxpZGF0aW9uLXZhbGlkXCIpLnJlbW92ZUNsYXNzKFwiZmllbGQtdmFsaWRhdGlvbi1lcnJvclwiKTtcclxuICAgICAgICAgICAgZXJyb3IucmVtb3ZlRGF0YShcInVub2J0cnVzaXZlQ29udGFpbmVyXCIpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHJlcGxhY2UpIHtcclxuICAgICAgICAgICAgICAgIGNvbnRhaW5lci5lbXB0eSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIG9uUmVzZXQoZXZlbnQpIHsgIC8vICd0aGlzJyBpcyB0aGUgZm9ybSBlbGVtZW50XHJcbiAgICAgICAgdmFyICRmb3JtID0gJCh0aGlzKSxcclxuICAgICAgICAgICAga2V5ID0gJ19fanF1ZXJ5X3Vub2J0cnVzaXZlX3ZhbGlkYXRpb25fZm9ybV9yZXNldCc7XHJcbiAgICAgICAgaWYgKCRmb3JtLmRhdGEoa2V5KSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIFNldCBhIGZsYWcgdGhhdCBpbmRpY2F0ZXMgd2UncmUgY3VycmVudGx5IHJlc2V0dGluZyB0aGUgZm9ybS5cclxuICAgICAgICAkZm9ybS5kYXRhKGtleSwgdHJ1ZSk7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgJGZvcm0uZGF0YShcInZhbGlkYXRvclwiKS5yZXNldEZvcm0oKTtcclxuICAgICAgICB9IGZpbmFsbHkge1xyXG4gICAgICAgICAgICAkZm9ybS5yZW1vdmVEYXRhKGtleSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAkZm9ybS5maW5kKFwiLnZhbGlkYXRpb24tc3VtbWFyeS1lcnJvcnNcIilcclxuICAgICAgICAgICAgLmFkZENsYXNzKFwidmFsaWRhdGlvbi1zdW1tYXJ5LXZhbGlkXCIpXHJcbiAgICAgICAgICAgIC5yZW1vdmVDbGFzcyhcInZhbGlkYXRpb24tc3VtbWFyeS1lcnJvcnNcIik7XHJcbiAgICAgICAgJGZvcm0uZmluZChcIi5maWVsZC12YWxpZGF0aW9uLWVycm9yXCIpXHJcbiAgICAgICAgICAgIC5hZGRDbGFzcyhcImZpZWxkLXZhbGlkYXRpb24tdmFsaWRcIilcclxuICAgICAgICAgICAgLnJlbW92ZUNsYXNzKFwiZmllbGQtdmFsaWRhdGlvbi1lcnJvclwiKVxyXG4gICAgICAgICAgICAucmVtb3ZlRGF0YShcInVub2J0cnVzaXZlQ29udGFpbmVyXCIpXHJcbiAgICAgICAgICAgIC5maW5kKFwiPipcIikgIC8vIElmIHdlIHdlcmUgdXNpbmcgdmFsbXNnLXJlcGxhY2UsIGdldCB0aGUgdW5kZXJseWluZyBlcnJvclxyXG4gICAgICAgICAgICAgICAgLnJlbW92ZURhdGEoXCJ1bm9idHJ1c2l2ZUNvbnRhaW5lclwiKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiB2YWxpZGF0aW9uSW5mbyhmb3JtKSB7XHJcbiAgICAgICAgdmFyICRmb3JtID0gJChmb3JtKSxcclxuICAgICAgICAgICAgcmVzdWx0ID0gJGZvcm0uZGF0YShkYXRhX3ZhbGlkYXRpb24pLFxyXG4gICAgICAgICAgICBvblJlc2V0UHJveHkgPSAkLnByb3h5KG9uUmVzZXQsIGZvcm0pLFxyXG4gICAgICAgICAgICBkZWZhdWx0T3B0aW9ucyA9ICRqUXZhbC51bm9idHJ1c2l2ZS5vcHRpb25zIHx8IHt9LFxyXG4gICAgICAgICAgICBleGVjSW5Db250ZXh0ID0gZnVuY3Rpb24gKG5hbWUsIGFyZ3MpIHtcclxuICAgICAgICAgICAgICAgIHZhciBmdW5jID0gZGVmYXVsdE9wdGlvbnNbbmFtZV07XHJcbiAgICAgICAgICAgICAgICBmdW5jICYmICQuaXNGdW5jdGlvbihmdW5jKSAmJiBmdW5jLmFwcGx5KGZvcm0sIGFyZ3MpO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICBpZiAoIXJlc3VsdCkge1xyXG4gICAgICAgICAgICByZXN1bHQgPSB7XHJcbiAgICAgICAgICAgICAgICBvcHRpb25zOiB7ICAvLyBvcHRpb25zIHN0cnVjdHVyZSBwYXNzZWQgdG8galF1ZXJ5IFZhbGlkYXRlJ3MgdmFsaWRhdGUoKSBtZXRob2RcclxuICAgICAgICAgICAgICAgICAgICBlcnJvckNsYXNzOiBkZWZhdWx0T3B0aW9ucy5lcnJvckNsYXNzIHx8IFwiaW5wdXQtdmFsaWRhdGlvbi1lcnJvclwiLFxyXG4gICAgICAgICAgICAgICAgICAgIGVycm9yRWxlbWVudDogZGVmYXVsdE9wdGlvbnMuZXJyb3JFbGVtZW50IHx8IFwic3BhblwiLFxyXG4gICAgICAgICAgICAgICAgICAgIGVycm9yUGxhY2VtZW50OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uRXJyb3IuYXBwbHkoZm9ybSwgYXJndW1lbnRzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXhlY0luQ29udGV4dChcImVycm9yUGxhY2VtZW50XCIsIGFyZ3VtZW50cyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBpbnZhbGlkSGFuZGxlcjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkVycm9ycy5hcHBseShmb3JtLCBhcmd1bWVudHMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBleGVjSW5Db250ZXh0KFwiaW52YWxpZEhhbmRsZXJcIiwgYXJndW1lbnRzKTtcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VzOiB7fSxcclxuICAgICAgICAgICAgICAgICAgICBydWxlczoge30sXHJcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBvblN1Y2Nlc3MuYXBwbHkoZm9ybSwgYXJndW1lbnRzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXhlY0luQ29udGV4dChcInN1Y2Nlc3NcIiwgYXJndW1lbnRzKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgYXR0YWNoVmFsaWRhdGlvbjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICRmb3JtXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5vZmYoXCJyZXNldC5cIiArIGRhdGFfdmFsaWRhdGlvbiwgb25SZXNldFByb3h5KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAub24oXCJyZXNldC5cIiArIGRhdGFfdmFsaWRhdGlvbiwgb25SZXNldFByb3h5KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAudmFsaWRhdGUodGhpcy5vcHRpb25zKTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB2YWxpZGF0ZTogZnVuY3Rpb24gKCkgeyAgLy8gYSB2YWxpZGF0aW9uIGZ1bmN0aW9uIHRoYXQgaXMgY2FsbGVkIGJ5IHVub2J0cnVzaXZlIEFqYXhcclxuICAgICAgICAgICAgICAgICAgICAkZm9ybS52YWxpZGF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAkZm9ybS52YWxpZCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAkZm9ybS5kYXRhKGRhdGFfdmFsaWRhdGlvbiwgcmVzdWx0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcblxyXG4gICAgJGpRdmFsLnVub2J0cnVzaXZlID0ge1xyXG4gICAgICAgIGFkYXB0ZXJzOiBbXSxcclxuXHJcbiAgICAgICAgcGFyc2VFbGVtZW50OiBmdW5jdGlvbiAoZWxlbWVudCwgc2tpcEF0dGFjaCkge1xyXG4gICAgICAgICAgICAvLy8gPHN1bW1hcnk+XHJcbiAgICAgICAgICAgIC8vLyBQYXJzZXMgYSBzaW5nbGUgSFRNTCBlbGVtZW50IGZvciB1bm9idHJ1c2l2ZSB2YWxpZGF0aW9uIGF0dHJpYnV0ZXMuXHJcbiAgICAgICAgICAgIC8vLyA8L3N1bW1hcnk+XHJcbiAgICAgICAgICAgIC8vLyA8cGFyYW0gbmFtZT1cImVsZW1lbnRcIiBkb21FbGVtZW50PVwidHJ1ZVwiPlRoZSBIVE1MIGVsZW1lbnQgdG8gYmUgcGFyc2VkLjwvcGFyYW0+XHJcbiAgICAgICAgICAgIC8vLyA8cGFyYW0gbmFtZT1cInNraXBBdHRhY2hcIiB0eXBlPVwiQm9vbGVhblwiPltPcHRpb25hbF0gdHJ1ZSB0byBza2lwIGF0dGFjaGluZyB0aGVcclxuICAgICAgICAgICAgLy8vIHZhbGlkYXRpb24gdG8gdGhlIGZvcm0uIElmIHBhcnNpbmcganVzdCB0aGlzIHNpbmdsZSBlbGVtZW50LCB5b3Ugc2hvdWxkIHNwZWNpZnkgdHJ1ZS5cclxuICAgICAgICAgICAgLy8vIElmIHBhcnNpbmcgc2V2ZXJhbCBlbGVtZW50cywgeW91IHNob3VsZCBzcGVjaWZ5IGZhbHNlLCBhbmQgbWFudWFsbHkgYXR0YWNoIHRoZSB2YWxpZGF0aW9uXHJcbiAgICAgICAgICAgIC8vLyB0byB0aGUgZm9ybSB3aGVuIHlvdSBhcmUgZmluaXNoZWQuIFRoZSBkZWZhdWx0IGlzIGZhbHNlLjwvcGFyYW0+XHJcbiAgICAgICAgICAgIHZhciAkZWxlbWVudCA9ICQoZWxlbWVudCksXHJcbiAgICAgICAgICAgICAgICBmb3JtID0gJGVsZW1lbnQucGFyZW50cyhcImZvcm1cIilbMF0sXHJcbiAgICAgICAgICAgICAgICB2YWxJbmZvLCBydWxlcywgbWVzc2FnZXM7XHJcblxyXG4gICAgICAgICAgICBpZiAoIWZvcm0pIHsgIC8vIENhbm5vdCBkbyBjbGllbnQtc2lkZSB2YWxpZGF0aW9uIHdpdGhvdXQgYSBmb3JtXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHZhbEluZm8gPSB2YWxpZGF0aW9uSW5mbyhmb3JtKTtcclxuICAgICAgICAgICAgdmFsSW5mby5vcHRpb25zLnJ1bGVzW2VsZW1lbnQubmFtZV0gPSBydWxlcyA9IHt9O1xyXG4gICAgICAgICAgICB2YWxJbmZvLm9wdGlvbnMubWVzc2FnZXNbZWxlbWVudC5uYW1lXSA9IG1lc3NhZ2VzID0ge307XHJcblxyXG4gICAgICAgICAgICAkLmVhY2godGhpcy5hZGFwdGVycywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHByZWZpeCA9IFwiZGF0YS12YWwtXCIgKyB0aGlzLm5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZSA9ICRlbGVtZW50LmF0dHIocHJlZml4KSxcclxuICAgICAgICAgICAgICAgICAgICBwYXJhbVZhbHVlcyA9IHt9O1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChtZXNzYWdlICE9PSB1bmRlZmluZWQpIHsgIC8vIENvbXBhcmUgYWdhaW5zdCB1bmRlZmluZWQsIGJlY2F1c2UgYW4gZW1wdHkgbWVzc2FnZSBpcyBsZWdhbCAoYW5kIGZhbHN5KVxyXG4gICAgICAgICAgICAgICAgICAgIHByZWZpeCArPSBcIi1cIjtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJC5lYWNoKHRoaXMucGFyYW1zLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtVmFsdWVzW3RoaXNdID0gJGVsZW1lbnQuYXR0cihwcmVmaXggKyB0aGlzKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGFwdCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQ6IGVsZW1lbnQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcm06IGZvcm0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IG1lc3NhZ2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtczogcGFyYW1WYWx1ZXMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bGVzOiBydWxlcyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZXM6IG1lc3NhZ2VzXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgJC5leHRlbmQocnVsZXMsIHsgXCJfX2R1bW15X19cIjogdHJ1ZSB9KTtcclxuXHJcbiAgICAgICAgICAgIGlmICghc2tpcEF0dGFjaCkge1xyXG4gICAgICAgICAgICAgICAgdmFsSW5mby5hdHRhY2hWYWxpZGF0aW9uKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBwYXJzZTogZnVuY3Rpb24gKHNlbGVjdG9yKSB7XHJcbiAgICAgICAgICAgIC8vLyA8c3VtbWFyeT5cclxuICAgICAgICAgICAgLy8vIFBhcnNlcyBhbGwgdGhlIEhUTUwgZWxlbWVudHMgaW4gdGhlIHNwZWNpZmllZCBzZWxlY3Rvci4gSXQgbG9va3MgZm9yIGlucHV0IGVsZW1lbnRzIGRlY29yYXRlZFxyXG4gICAgICAgICAgICAvLy8gd2l0aCB0aGUgW2RhdGEtdmFsPXRydWVdIGF0dHJpYnV0ZSB2YWx1ZSBhbmQgZW5hYmxlcyB2YWxpZGF0aW9uIGFjY29yZGluZyB0byB0aGUgZGF0YS12YWwtKlxyXG4gICAgICAgICAgICAvLy8gYXR0cmlidXRlIHZhbHVlcy5cclxuICAgICAgICAgICAgLy8vIDwvc3VtbWFyeT5cclxuICAgICAgICAgICAgLy8vIDxwYXJhbSBuYW1lPVwic2VsZWN0b3JcIiB0eXBlPVwiU3RyaW5nXCI+QW55IHZhbGlkIGpRdWVyeSBzZWxlY3Rvci48L3BhcmFtPlxyXG5cclxuICAgICAgICAgICAgLy8gJGZvcm1zIGluY2x1ZGVzIGFsbCBmb3JtcyBpbiBzZWxlY3RvcidzIERPTSBoaWVyYXJjaHkgKHBhcmVudCwgY2hpbGRyZW4gYW5kIHNlbGYpIHRoYXQgaGF2ZSBhdCBsZWFzdCBvbmVcclxuICAgICAgICAgICAgLy8gZWxlbWVudCB3aXRoIGRhdGEtdmFsPXRydWVcclxuICAgICAgICAgICAgdmFyICRzZWxlY3RvciA9ICQoc2VsZWN0b3IpLFxyXG4gICAgICAgICAgICAgICAgJGZvcm1zID0gJHNlbGVjdG9yLnBhcmVudHMoKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmFkZEJhY2soKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmZpbHRlcihcImZvcm1cIilcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hZGQoJHNlbGVjdG9yLmZpbmQoXCJmb3JtXCIpKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmhhcyhcIltkYXRhLXZhbD10cnVlXVwiKTtcclxuXHJcbiAgICAgICAgICAgICRzZWxlY3Rvci5maW5kKFwiW2RhdGEtdmFsPXRydWVdXCIpLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgJGpRdmFsLnVub2J0cnVzaXZlLnBhcnNlRWxlbWVudCh0aGlzLCB0cnVlKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAkZm9ybXMuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgaW5mbyA9IHZhbGlkYXRpb25JbmZvKHRoaXMpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGluZm8pIHtcclxuICAgICAgICAgICAgICAgICAgICBpbmZvLmF0dGFjaFZhbGlkYXRpb24oKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBhZGFwdGVycyA9ICRqUXZhbC51bm9idHJ1c2l2ZS5hZGFwdGVycztcclxuXHJcbiAgICBhZGFwdGVycy5hZGQgPSBmdW5jdGlvbiAoYWRhcHRlck5hbWUsIHBhcmFtcywgZm4pIHtcclxuICAgICAgICAvLy8gPHN1bW1hcnk+QWRkcyBhIG5ldyBhZGFwdGVyIHRvIGNvbnZlcnQgdW5vYnRydXNpdmUgSFRNTCBpbnRvIGEgalF1ZXJ5IFZhbGlkYXRlIHZhbGlkYXRpb24uPC9zdW1tYXJ5PlxyXG4gICAgICAgIC8vLyA8cGFyYW0gbmFtZT1cImFkYXB0ZXJOYW1lXCIgdHlwZT1cIlN0cmluZ1wiPlRoZSBuYW1lIG9mIHRoZSBhZGFwdGVyIHRvIGJlIGFkZGVkLiBUaGlzIG1hdGNoZXMgdGhlIG5hbWUgdXNlZFxyXG4gICAgICAgIC8vLyBpbiB0aGUgZGF0YS12YWwtbm5ubiBIVE1MIGF0dHJpYnV0ZSAod2hlcmUgbm5ubiBpcyB0aGUgYWRhcHRlciBuYW1lKS48L3BhcmFtPlxyXG4gICAgICAgIC8vLyA8cGFyYW0gbmFtZT1cInBhcmFtc1wiIHR5cGU9XCJBcnJheVwiIG9wdGlvbmFsPVwidHJ1ZVwiPltPcHRpb25hbF0gQW4gYXJyYXkgb2YgcGFyYW1ldGVyIG5hbWVzIChzdHJpbmdzKSB0aGF0IHdpbGxcclxuICAgICAgICAvLy8gYmUgZXh0cmFjdGVkIGZyb20gdGhlIGRhdGEtdmFsLW5ubm4tbW1tbSBIVE1MIGF0dHJpYnV0ZXMgKHdoZXJlIG5ubm4gaXMgdGhlIGFkYXB0ZXIgbmFtZSwgYW5kXHJcbiAgICAgICAgLy8vIG1tbW0gaXMgdGhlIHBhcmFtZXRlciBuYW1lKS48L3BhcmFtPlxyXG4gICAgICAgIC8vLyA8cGFyYW0gbmFtZT1cImZuXCIgdHlwZT1cIkZ1bmN0aW9uXCI+VGhlIGZ1bmN0aW9uIHRvIGNhbGwsIHdoaWNoIGFkYXB0cyB0aGUgdmFsdWVzIGZyb20gdGhlIEhUTUxcclxuICAgICAgICAvLy8gYXR0cmlidXRlcyBpbnRvIGpRdWVyeSBWYWxpZGF0ZSBydWxlcyBhbmQvb3IgbWVzc2FnZXMuPC9wYXJhbT5cclxuICAgICAgICAvLy8gPHJldHVybnMgdHlwZT1cImpRdWVyeS52YWxpZGF0b3IudW5vYnRydXNpdmUuYWRhcHRlcnNcIiAvPlxyXG4gICAgICAgIGlmICghZm4pIHsgIC8vIENhbGxlZCB3aXRoIG5vIHBhcmFtcywganVzdCBhIGZ1bmN0aW9uXHJcbiAgICAgICAgICAgIGZuID0gcGFyYW1zO1xyXG4gICAgICAgICAgICBwYXJhbXMgPSBbXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5wdXNoKHsgbmFtZTogYWRhcHRlck5hbWUsIHBhcmFtczogcGFyYW1zLCBhZGFwdDogZm4gfSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG5cclxuICAgIGFkYXB0ZXJzLmFkZEJvb2wgPSBmdW5jdGlvbiAoYWRhcHRlck5hbWUsIHJ1bGVOYW1lKSB7XHJcbiAgICAgICAgLy8vIDxzdW1tYXJ5PkFkZHMgYSBuZXcgYWRhcHRlciB0byBjb252ZXJ0IHVub2J0cnVzaXZlIEhUTUwgaW50byBhIGpRdWVyeSBWYWxpZGF0ZSB2YWxpZGF0aW9uLCB3aGVyZVxyXG4gICAgICAgIC8vLyB0aGUgalF1ZXJ5IFZhbGlkYXRlIHZhbGlkYXRpb24gcnVsZSBoYXMgbm8gcGFyYW1ldGVyIHZhbHVlcy48L3N1bW1hcnk+XHJcbiAgICAgICAgLy8vIDxwYXJhbSBuYW1lPVwiYWRhcHRlck5hbWVcIiB0eXBlPVwiU3RyaW5nXCI+VGhlIG5hbWUgb2YgdGhlIGFkYXB0ZXIgdG8gYmUgYWRkZWQuIFRoaXMgbWF0Y2hlcyB0aGUgbmFtZSB1c2VkXHJcbiAgICAgICAgLy8vIGluIHRoZSBkYXRhLXZhbC1ubm5uIEhUTUwgYXR0cmlidXRlICh3aGVyZSBubm5uIGlzIHRoZSBhZGFwdGVyIG5hbWUpLjwvcGFyYW0+XHJcbiAgICAgICAgLy8vIDxwYXJhbSBuYW1lPVwicnVsZU5hbWVcIiB0eXBlPVwiU3RyaW5nXCIgb3B0aW9uYWw9XCJ0cnVlXCI+W09wdGlvbmFsXSBUaGUgbmFtZSBvZiB0aGUgalF1ZXJ5IFZhbGlkYXRlIHJ1bGUuIElmIG5vdCBwcm92aWRlZCwgdGhlIHZhbHVlXHJcbiAgICAgICAgLy8vIG9mIGFkYXB0ZXJOYW1lIHdpbGwgYmUgdXNlZCBpbnN0ZWFkLjwvcGFyYW0+XHJcbiAgICAgICAgLy8vIDxyZXR1cm5zIHR5cGU9XCJqUXVlcnkudmFsaWRhdG9yLnVub2J0cnVzaXZlLmFkYXB0ZXJzXCIgLz5cclxuICAgICAgICByZXR1cm4gdGhpcy5hZGQoYWRhcHRlck5hbWUsIGZ1bmN0aW9uIChvcHRpb25zKSB7XHJcbiAgICAgICAgICAgIHNldFZhbGlkYXRpb25WYWx1ZXMob3B0aW9ucywgcnVsZU5hbWUgfHwgYWRhcHRlck5hbWUsIHRydWUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICBhZGFwdGVycy5hZGRNaW5NYXggPSBmdW5jdGlvbiAoYWRhcHRlck5hbWUsIG1pblJ1bGVOYW1lLCBtYXhSdWxlTmFtZSwgbWluTWF4UnVsZU5hbWUsIG1pbkF0dHJpYnV0ZSwgbWF4QXR0cmlidXRlKSB7XHJcbiAgICAgICAgLy8vIDxzdW1tYXJ5PkFkZHMgYSBuZXcgYWRhcHRlciB0byBjb252ZXJ0IHVub2J0cnVzaXZlIEhUTUwgaW50byBhIGpRdWVyeSBWYWxpZGF0ZSB2YWxpZGF0aW9uLCB3aGVyZVxyXG4gICAgICAgIC8vLyB0aGUgalF1ZXJ5IFZhbGlkYXRlIHZhbGlkYXRpb24gaGFzIHRocmVlIHBvdGVudGlhbCBydWxlcyAob25lIGZvciBtaW4tb25seSwgb25lIGZvciBtYXgtb25seSwgYW5kXHJcbiAgICAgICAgLy8vIG9uZSBmb3IgbWluLWFuZC1tYXgpLiBUaGUgSFRNTCBwYXJhbWV0ZXJzIGFyZSBleHBlY3RlZCB0byBiZSBuYW1lZCAtbWluIGFuZCAtbWF4Ljwvc3VtbWFyeT5cclxuICAgICAgICAvLy8gPHBhcmFtIG5hbWU9XCJhZGFwdGVyTmFtZVwiIHR5cGU9XCJTdHJpbmdcIj5UaGUgbmFtZSBvZiB0aGUgYWRhcHRlciB0byBiZSBhZGRlZC4gVGhpcyBtYXRjaGVzIHRoZSBuYW1lIHVzZWRcclxuICAgICAgICAvLy8gaW4gdGhlIGRhdGEtdmFsLW5ubm4gSFRNTCBhdHRyaWJ1dGUgKHdoZXJlIG5ubm4gaXMgdGhlIGFkYXB0ZXIgbmFtZSkuPC9wYXJhbT5cclxuICAgICAgICAvLy8gPHBhcmFtIG5hbWU9XCJtaW5SdWxlTmFtZVwiIHR5cGU9XCJTdHJpbmdcIj5UaGUgbmFtZSBvZiB0aGUgalF1ZXJ5IFZhbGlkYXRlIHJ1bGUgdG8gYmUgdXNlZCB3aGVuIHlvdSBvbmx5XHJcbiAgICAgICAgLy8vIGhhdmUgYSBtaW5pbXVtIHZhbHVlLjwvcGFyYW0+XHJcbiAgICAgICAgLy8vIDxwYXJhbSBuYW1lPVwibWF4UnVsZU5hbWVcIiB0eXBlPVwiU3RyaW5nXCI+VGhlIG5hbWUgb2YgdGhlIGpRdWVyeSBWYWxpZGF0ZSBydWxlIHRvIGJlIHVzZWQgd2hlbiB5b3Ugb25seVxyXG4gICAgICAgIC8vLyBoYXZlIGEgbWF4aW11bSB2YWx1ZS48L3BhcmFtPlxyXG4gICAgICAgIC8vLyA8cGFyYW0gbmFtZT1cIm1pbk1heFJ1bGVOYW1lXCIgdHlwZT1cIlN0cmluZ1wiPlRoZSBuYW1lIG9mIHRoZSBqUXVlcnkgVmFsaWRhdGUgcnVsZSB0byBiZSB1c2VkIHdoZW4geW91XHJcbiAgICAgICAgLy8vIGhhdmUgYm90aCBhIG1pbmltdW0gYW5kIG1heGltdW0gdmFsdWUuPC9wYXJhbT5cclxuICAgICAgICAvLy8gPHBhcmFtIG5hbWU9XCJtaW5BdHRyaWJ1dGVcIiB0eXBlPVwiU3RyaW5nXCIgb3B0aW9uYWw9XCJ0cnVlXCI+W09wdGlvbmFsXSBUaGUgbmFtZSBvZiB0aGUgSFRNTCBhdHRyaWJ1dGUgdGhhdFxyXG4gICAgICAgIC8vLyBjb250YWlucyB0aGUgbWluaW11bSB2YWx1ZS4gVGhlIGRlZmF1bHQgaXMgXCJtaW5cIi48L3BhcmFtPlxyXG4gICAgICAgIC8vLyA8cGFyYW0gbmFtZT1cIm1heEF0dHJpYnV0ZVwiIHR5cGU9XCJTdHJpbmdcIiBvcHRpb25hbD1cInRydWVcIj5bT3B0aW9uYWxdIFRoZSBuYW1lIG9mIHRoZSBIVE1MIGF0dHJpYnV0ZSB0aGF0XHJcbiAgICAgICAgLy8vIGNvbnRhaW5zIHRoZSBtYXhpbXVtIHZhbHVlLiBUaGUgZGVmYXVsdCBpcyBcIm1heFwiLjwvcGFyYW0+XHJcbiAgICAgICAgLy8vIDxyZXR1cm5zIHR5cGU9XCJqUXVlcnkudmFsaWRhdG9yLnVub2J0cnVzaXZlLmFkYXB0ZXJzXCIgLz5cclxuICAgICAgICByZXR1cm4gdGhpcy5hZGQoYWRhcHRlck5hbWUsIFttaW5BdHRyaWJ1dGUgfHwgXCJtaW5cIiwgbWF4QXR0cmlidXRlIHx8IFwibWF4XCJdLCBmdW5jdGlvbiAob3B0aW9ucykge1xyXG4gICAgICAgICAgICB2YXIgbWluID0gb3B0aW9ucy5wYXJhbXMubWluLFxyXG4gICAgICAgICAgICAgICAgbWF4ID0gb3B0aW9ucy5wYXJhbXMubWF4O1xyXG5cclxuICAgICAgICAgICAgaWYgKG1pbiAmJiBtYXgpIHtcclxuICAgICAgICAgICAgICAgIHNldFZhbGlkYXRpb25WYWx1ZXMob3B0aW9ucywgbWluTWF4UnVsZU5hbWUsIFttaW4sIG1heF0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKG1pbikge1xyXG4gICAgICAgICAgICAgICAgc2V0VmFsaWRhdGlvblZhbHVlcyhvcHRpb25zLCBtaW5SdWxlTmFtZSwgbWluKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChtYXgpIHtcclxuICAgICAgICAgICAgICAgIHNldFZhbGlkYXRpb25WYWx1ZXMob3B0aW9ucywgbWF4UnVsZU5hbWUsIG1heCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgYWRhcHRlcnMuYWRkU2luZ2xlVmFsID0gZnVuY3Rpb24gKGFkYXB0ZXJOYW1lLCBhdHRyaWJ1dGUsIHJ1bGVOYW1lKSB7XHJcbiAgICAgICAgLy8vIDxzdW1tYXJ5PkFkZHMgYSBuZXcgYWRhcHRlciB0byBjb252ZXJ0IHVub2J0cnVzaXZlIEhUTUwgaW50byBhIGpRdWVyeSBWYWxpZGF0ZSB2YWxpZGF0aW9uLCB3aGVyZVxyXG4gICAgICAgIC8vLyB0aGUgalF1ZXJ5IFZhbGlkYXRlIHZhbGlkYXRpb24gcnVsZSBoYXMgYSBzaW5nbGUgdmFsdWUuPC9zdW1tYXJ5PlxyXG4gICAgICAgIC8vLyA8cGFyYW0gbmFtZT1cImFkYXB0ZXJOYW1lXCIgdHlwZT1cIlN0cmluZ1wiPlRoZSBuYW1lIG9mIHRoZSBhZGFwdGVyIHRvIGJlIGFkZGVkLiBUaGlzIG1hdGNoZXMgdGhlIG5hbWUgdXNlZFxyXG4gICAgICAgIC8vLyBpbiB0aGUgZGF0YS12YWwtbm5ubiBIVE1MIGF0dHJpYnV0ZSh3aGVyZSBubm5uIGlzIHRoZSBhZGFwdGVyIG5hbWUpLjwvcGFyYW0+XHJcbiAgICAgICAgLy8vIDxwYXJhbSBuYW1lPVwiYXR0cmlidXRlXCIgdHlwZT1cIlN0cmluZ1wiPltPcHRpb25hbF0gVGhlIG5hbWUgb2YgdGhlIEhUTUwgYXR0cmlidXRlIHRoYXQgY29udGFpbnMgdGhlIHZhbHVlLlxyXG4gICAgICAgIC8vLyBUaGUgZGVmYXVsdCBpcyBcInZhbFwiLjwvcGFyYW0+XHJcbiAgICAgICAgLy8vIDxwYXJhbSBuYW1lPVwicnVsZU5hbWVcIiB0eXBlPVwiU3RyaW5nXCIgb3B0aW9uYWw9XCJ0cnVlXCI+W09wdGlvbmFsXSBUaGUgbmFtZSBvZiB0aGUgalF1ZXJ5IFZhbGlkYXRlIHJ1bGUuIElmIG5vdCBwcm92aWRlZCwgdGhlIHZhbHVlXHJcbiAgICAgICAgLy8vIG9mIGFkYXB0ZXJOYW1lIHdpbGwgYmUgdXNlZCBpbnN0ZWFkLjwvcGFyYW0+XHJcbiAgICAgICAgLy8vIDxyZXR1cm5zIHR5cGU9XCJqUXVlcnkudmFsaWRhdG9yLnVub2J0cnVzaXZlLmFkYXB0ZXJzXCIgLz5cclxuICAgICAgICByZXR1cm4gdGhpcy5hZGQoYWRhcHRlck5hbWUsIFthdHRyaWJ1dGUgfHwgXCJ2YWxcIl0sIGZ1bmN0aW9uIChvcHRpb25zKSB7XHJcbiAgICAgICAgICAgIHNldFZhbGlkYXRpb25WYWx1ZXMob3B0aW9ucywgcnVsZU5hbWUgfHwgYWRhcHRlck5hbWUsIG9wdGlvbnMucGFyYW1zW2F0dHJpYnV0ZV0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICAkalF2YWwuYWRkTWV0aG9kKFwiX19kdW1teV9fXCIsIGZ1bmN0aW9uICh2YWx1ZSwgZWxlbWVudCwgcGFyYW1zKSB7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9KTtcclxuXHJcbiAgICAkalF2YWwuYWRkTWV0aG9kKFwicmVnZXhcIiwgZnVuY3Rpb24gKHZhbHVlLCBlbGVtZW50LCBwYXJhbXMpIHtcclxuICAgICAgICB2YXIgbWF0Y2g7XHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9uYWwoZWxlbWVudCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBtYXRjaCA9IG5ldyBSZWdFeHAocGFyYW1zKS5leGVjKHZhbHVlKTtcclxuICAgICAgICByZXR1cm4gKG1hdGNoICYmIChtYXRjaC5pbmRleCA9PT0gMCkgJiYgKG1hdGNoWzBdLmxlbmd0aCA9PT0gdmFsdWUubGVuZ3RoKSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAkalF2YWwuYWRkTWV0aG9kKFwibm9uYWxwaGFtaW5cIiwgZnVuY3Rpb24gKHZhbHVlLCBlbGVtZW50LCBub25hbHBoYW1pbikge1xyXG4gICAgICAgIHZhciBtYXRjaDtcclxuICAgICAgICBpZiAobm9uYWxwaGFtaW4pIHtcclxuICAgICAgICAgICAgbWF0Y2ggPSB2YWx1ZS5tYXRjaCgvXFxXL2cpO1xyXG4gICAgICAgICAgICBtYXRjaCA9IG1hdGNoICYmIG1hdGNoLmxlbmd0aCA+PSBub25hbHBoYW1pbjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG1hdGNoO1xyXG4gICAgfSk7XHJcblxyXG4gICAgaWYgKCRqUXZhbC5tZXRob2RzLmV4dGVuc2lvbikge1xyXG4gICAgICAgIGFkYXB0ZXJzLmFkZFNpbmdsZVZhbChcImFjY2VwdFwiLCBcIm1pbXR5cGVcIik7XHJcbiAgICAgICAgYWRhcHRlcnMuYWRkU2luZ2xlVmFsKFwiZXh0ZW5zaW9uXCIsIFwiZXh0ZW5zaW9uXCIpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBmb3IgYmFja3dhcmQgY29tcGF0aWJpbGl0eSwgd2hlbiB0aGUgJ2V4dGVuc2lvbicgdmFsaWRhdGlvbiBtZXRob2QgZG9lcyBub3QgZXhpc3QsIHN1Y2ggYXMgd2l0aCB2ZXJzaW9uc1xyXG4gICAgICAgIC8vIG9mIEpRdWVyeSBWYWxpZGF0aW9uIHBsdWdpbiBwcmlvciB0byAxLjEwLCB3ZSBzaG91bGQgdXNlIHRoZSAnYWNjZXB0JyBtZXRob2QgZm9yXHJcbiAgICAgICAgLy8gdmFsaWRhdGluZyB0aGUgZXh0ZW5zaW9uLCBhbmQgaWdub3JlIG1pbWUtdHlwZSB2YWxpZGF0aW9ucyBhcyB0aGV5IGFyZSBub3Qgc3VwcG9ydGVkLlxyXG4gICAgICAgIGFkYXB0ZXJzLmFkZFNpbmdsZVZhbChcImV4dGVuc2lvblwiLCBcImV4dGVuc2lvblwiLCBcImFjY2VwdFwiKTtcclxuICAgIH1cclxuXHJcbiAgICBhZGFwdGVycy5hZGRTaW5nbGVWYWwoXCJyZWdleFwiLCBcInBhdHRlcm5cIik7XHJcbiAgICBhZGFwdGVycy5hZGRCb29sKFwiY3JlZGl0Y2FyZFwiKS5hZGRCb29sKFwiZGF0ZVwiKS5hZGRCb29sKFwiZGlnaXRzXCIpLmFkZEJvb2woXCJlbWFpbFwiKS5hZGRCb29sKFwibnVtYmVyXCIpLmFkZEJvb2woXCJ1cmxcIik7XHJcbiAgICBhZGFwdGVycy5hZGRNaW5NYXgoXCJsZW5ndGhcIiwgXCJtaW5sZW5ndGhcIiwgXCJtYXhsZW5ndGhcIiwgXCJyYW5nZWxlbmd0aFwiKS5hZGRNaW5NYXgoXCJyYW5nZVwiLCBcIm1pblwiLCBcIm1heFwiLCBcInJhbmdlXCIpO1xyXG4gICAgYWRhcHRlcnMuYWRkTWluTWF4KFwibWlubGVuZ3RoXCIsIFwibWlubGVuZ3RoXCIpLmFkZE1pbk1heChcIm1heGxlbmd0aFwiLCBcIm1pbmxlbmd0aFwiLCBcIm1heGxlbmd0aFwiKTtcclxuICAgIGFkYXB0ZXJzLmFkZChcImVxdWFsdG9cIiwgW1wib3RoZXJcIl0sIGZ1bmN0aW9uIChvcHRpb25zKSB7XHJcbiAgICAgICAgdmFyIHByZWZpeCA9IGdldE1vZGVsUHJlZml4KG9wdGlvbnMuZWxlbWVudC5uYW1lKSxcclxuICAgICAgICAgICAgb3RoZXIgPSBvcHRpb25zLnBhcmFtcy5vdGhlcixcclxuICAgICAgICAgICAgZnVsbE90aGVyTmFtZSA9IGFwcGVuZE1vZGVsUHJlZml4KG90aGVyLCBwcmVmaXgpLFxyXG4gICAgICAgICAgICBlbGVtZW50ID0gJChvcHRpb25zLmZvcm0pLmZpbmQoXCI6aW5wdXRcIikuZmlsdGVyKFwiW25hbWU9J1wiICsgZXNjYXBlQXR0cmlidXRlVmFsdWUoZnVsbE90aGVyTmFtZSkgKyBcIiddXCIpWzBdO1xyXG5cclxuICAgICAgICBzZXRWYWxpZGF0aW9uVmFsdWVzKG9wdGlvbnMsIFwiZXF1YWxUb1wiLCBlbGVtZW50KTtcclxuICAgIH0pO1xyXG4gICAgYWRhcHRlcnMuYWRkKFwicmVxdWlyZWRcIiwgZnVuY3Rpb24gKG9wdGlvbnMpIHtcclxuICAgICAgICAvLyBqUXVlcnkgVmFsaWRhdGUgZXF1YXRlcyBcInJlcXVpcmVkXCIgd2l0aCBcIm1hbmRhdG9yeVwiIGZvciBjaGVja2JveCBlbGVtZW50c1xyXG4gICAgICAgIGlmIChvcHRpb25zLmVsZW1lbnQudGFnTmFtZS50b1VwcGVyQ2FzZSgpICE9PSBcIklOUFVUXCIgfHwgb3B0aW9ucy5lbGVtZW50LnR5cGUudG9VcHBlckNhc2UoKSAhPT0gXCJDSEVDS0JPWFwiKSB7XHJcbiAgICAgICAgICAgIHNldFZhbGlkYXRpb25WYWx1ZXMob3B0aW9ucywgXCJyZXF1aXJlZFwiLCB0cnVlKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuICAgIGFkYXB0ZXJzLmFkZChcInJlbW90ZVwiLCBbXCJ1cmxcIiwgXCJ0eXBlXCIsIFwiYWRkaXRpb25hbGZpZWxkc1wiXSwgZnVuY3Rpb24gKG9wdGlvbnMpIHtcclxuICAgICAgICB2YXIgdmFsdWUgPSB7XHJcbiAgICAgICAgICAgIHVybDogb3B0aW9ucy5wYXJhbXMudXJsLFxyXG4gICAgICAgICAgICB0eXBlOiBvcHRpb25zLnBhcmFtcy50eXBlIHx8IFwiR0VUXCIsXHJcbiAgICAgICAgICAgIGRhdGE6IHt9XHJcbiAgICAgICAgfSxcclxuICAgICAgICAgICAgcHJlZml4ID0gZ2V0TW9kZWxQcmVmaXgob3B0aW9ucy5lbGVtZW50Lm5hbWUpO1xyXG5cclxuICAgICAgICAkLmVhY2goc3BsaXRBbmRUcmltKG9wdGlvbnMucGFyYW1zLmFkZGl0aW9uYWxmaWVsZHMgfHwgb3B0aW9ucy5lbGVtZW50Lm5hbWUpLCBmdW5jdGlvbiAoaSwgZmllbGROYW1lKSB7XHJcbiAgICAgICAgICAgIHZhciBwYXJhbU5hbWUgPSBhcHBlbmRNb2RlbFByZWZpeChmaWVsZE5hbWUsIHByZWZpeCk7XHJcbiAgICAgICAgICAgIHZhbHVlLmRhdGFbcGFyYW1OYW1lXSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHZhciBmaWVsZCA9ICQob3B0aW9ucy5mb3JtKS5maW5kKFwiOmlucHV0XCIpLmZpbHRlcihcIltuYW1lPSdcIiArIGVzY2FwZUF0dHJpYnV0ZVZhbHVlKHBhcmFtTmFtZSkgKyBcIiddXCIpO1xyXG4gICAgICAgICAgICAgICAgLy8gRm9yIGNoZWNrYm94ZXMgYW5kIHJhZGlvIGJ1dHRvbnMsIG9ubHkgcGljayB1cCB2YWx1ZXMgZnJvbSBjaGVja2VkIGZpZWxkcy5cclxuICAgICAgICAgICAgICAgIGlmIChmaWVsZC5pcyhcIjpjaGVja2JveFwiKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmaWVsZC5maWx0ZXIoXCI6Y2hlY2tlZFwiKS52YWwoKSB8fCBmaWVsZC5maWx0ZXIoXCI6aGlkZGVuXCIpLnZhbCgpIHx8ICcnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoZmllbGQuaXMoXCI6cmFkaW9cIikpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmllbGQuZmlsdGVyKFwiOmNoZWNrZWRcIikudmFsKCkgfHwgJyc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmllbGQudmFsKCk7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHNldFZhbGlkYXRpb25WYWx1ZXMob3B0aW9ucywgXCJyZW1vdGVcIiwgdmFsdWUpO1xyXG4gICAgfSk7XHJcbiAgICBhZGFwdGVycy5hZGQoXCJwYXNzd29yZFwiLCBbXCJtaW5cIiwgXCJub25hbHBoYW1pblwiLCBcInJlZ2V4XCJdLCBmdW5jdGlvbiAob3B0aW9ucykge1xyXG4gICAgICAgIGlmIChvcHRpb25zLnBhcmFtcy5taW4pIHtcclxuICAgICAgICAgICAgc2V0VmFsaWRhdGlvblZhbHVlcyhvcHRpb25zLCBcIm1pbmxlbmd0aFwiLCBvcHRpb25zLnBhcmFtcy5taW4pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAob3B0aW9ucy5wYXJhbXMubm9uYWxwaGFtaW4pIHtcclxuICAgICAgICAgICAgc2V0VmFsaWRhdGlvblZhbHVlcyhvcHRpb25zLCBcIm5vbmFscGhhbWluXCIsIG9wdGlvbnMucGFyYW1zLm5vbmFscGhhbWluKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG9wdGlvbnMucGFyYW1zLnJlZ2V4KSB7XHJcbiAgICAgICAgICAgIHNldFZhbGlkYXRpb25WYWx1ZXMob3B0aW9ucywgXCJyZWdleFwiLCBvcHRpb25zLnBhcmFtcy5yZWdleCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBhZGFwdGVycy5hZGQoXCJmaWxlZXh0ZW5zaW9uc1wiLCBbXCJleHRlbnNpb25zXCJdLCBmdW5jdGlvbiAob3B0aW9ucykge1xyXG4gICAgICAgIHNldFZhbGlkYXRpb25WYWx1ZXMob3B0aW9ucywgXCJleHRlbnNpb25cIiwgb3B0aW9ucy5wYXJhbXMuZXh0ZW5zaW9ucyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAkKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAkalF2YWwudW5vYnRydXNpdmUucGFyc2UoZG9jdW1lbnQpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuICRqUXZhbC51bm9idHJ1c2l2ZTtcclxufSkpOyJdLCJmaWxlIjoibGliL2pxdWVyeS12YWxpZGF0aW9uLXVub2J0cnVzaXZlL2pxdWVyeS52YWxpZGF0ZS51bm9idHJ1c2l2ZS5lczUuanMifQ==
