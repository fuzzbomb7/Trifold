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
    define(["jquery", "./jquery.validate"], factory);
  } else if ((typeof module === "undefined" ? "undefined" : _typeof(module)) === "object" && module.exports) {
    module.exports = factory(require("jquery"));
  } else {
    factory(jQuery);
  }
})(function ($) {
  (function () {
    function stripHtml(value) {
      // Remove html tags and space chars
      return value.replace(/<.[^<>]*?>/g, " ").replace(/&nbsp;|&#160;/gi, " ") // Remove punctuation
      .replace(/[.(),;:!?%#$'\"_+=\/\-“”’]*/g, "");
    }

    $.validator.addMethod("maxWords", function (value, element, params) {
      return this.optional(element) || stripHtml(value).match(/\b\w+\b/g).length <= params;
    }, $.validator.format("Please enter {0} words or less."));
    $.validator.addMethod("minWords", function (value, element, params) {
      return this.optional(element) || stripHtml(value).match(/\b\w+\b/g).length >= params;
    }, $.validator.format("Please enter at least {0} words."));
    $.validator.addMethod("rangeWords", function (value, element, params) {
      var valueStripped = stripHtml(value),
          regex = /\b\w+\b/g;
      return this.optional(element) || valueStripped.match(regex).length >= params[0] && valueStripped.match(regex).length <= params[1];
    }, $.validator.format("Please enter between {0} and {1} words."));
  })(); // Accept a value from a file input based on a required mimetype


  $.validator.addMethod("accept", function (value, element, param) {
    // Split mime on commas in case we have multiple types we can accept
    var typeParam = typeof param === "string" ? param.replace(/\s/g, "") : "image/*",
        optionalValue = this.optional(element),
        i,
        file,
        regex; // Element is optional

    if (optionalValue) {
      return optionalValue;
    }

    if ($(element).attr("type") === "file") {
      // Escape string to be used in the regex
      // see: https://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
      // Escape also "/*" as "/.*" as a wildcard
      typeParam = typeParam.replace(/[\-\[\]\/\{\}\(\)\+\?\.\\\^\$\|]/g, "\\$&").replace(/,/g, "|").replace(/\/\*/g, "/.*"); // Check if the element has a FileList before checking each file

      if (element.files && element.files.length) {
        regex = new RegExp(".?(" + typeParam + ")$", "i");

        for (i = 0; i < element.files.length; i++) {
          file = element.files[i]; // Grab the mimetype from the loaded file, verify it matches

          if (!file.type.match(regex)) {
            return false;
          }
        }
      }
    } // Either return true because we've validated each file, or because the
    // browser does not support element.files and the FileList feature


    return true;
  }, $.validator.format("Please enter a value with a valid mimetype."));
  $.validator.addMethod("alphanumeric", function (value, element) {
    return this.optional(element) || /^\w+$/i.test(value);
  }, "Letters, numbers, and underscores only please");
  /*
   * Dutch bank account numbers (not 'giro' numbers) have 9 digits
   * and pass the '11 check'.
   * We accept the notation with spaces, as that is common.
   * acceptable: 123456789 or 12 34 56 789
   */

  $.validator.addMethod("bankaccountNL", function (value, element) {
    if (this.optional(element)) {
      return true;
    }

    if (!/^[0-9]{9}|([0-9]{2} ){3}[0-9]{3}$/.test(value)) {
      return false;
    } // Now '11 check'


    var account = value.replace(/ /g, ""),
        // Remove spaces
    sum = 0,
        len = account.length,
        pos,
        factor,
        digit;

    for (pos = 0; pos < len; pos++) {
      factor = len - pos;
      digit = account.substring(pos, pos + 1);
      sum = sum + factor * digit;
    }

    return sum % 11 === 0;
  }, "Please specify a valid bank account number");
  $.validator.addMethod("bankorgiroaccountNL", function (value, element) {
    return this.optional(element) || $.validator.methods.bankaccountNL.call(this, value, element) || $.validator.methods.giroaccountNL.call(this, value, element);
  }, "Please specify a valid bank or giro account number");
  /**
   * BIC is the business identifier code (ISO 9362). This BIC check is not a guarantee for authenticity.
   *
   * BIC pattern: BBBBCCLLbbb (8 or 11 characters long; bbb is optional)
   *
   * Validation is case-insensitive. Please make sure to normalize input yourself.
   *
   * BIC definition in detail:
   * - First 4 characters - bank code (only letters)
   * - Next 2 characters - ISO 3166-1 alpha-2 country code (only letters)
   * - Next 2 characters - location code (letters and digits)
   *   a. shall not start with '0' or '1'
   *   b. second character must be a letter ('O' is not allowed) or digit ('0' for test (therefore not allowed), '1' denoting passive participant, '2' typically reverse-billing)
   * - Last 3 characters - branch code, optional (shall not start with 'X' except in case of 'XXX' for primary office) (letters and digits)
   */

  $.validator.addMethod("bic", function (value, element) {
    return this.optional(element) || /^([A-Z]{6}[A-Z2-9][A-NP-Z1-9])(X{3}|[A-WY-Z0-9][A-Z0-9]{2})?$/.test(value.toUpperCase());
  }, "Please specify a valid BIC code");
  /*
   * Código de identificación fiscal ( CIF ) is the tax identification code for Spanish legal entities
   * Further rules can be found in Spanish on http://es.wikipedia.org/wiki/C%C3%B3digo_de_identificaci%C3%B3n_fiscal
   *
   * Spanish CIF structure:
   *
   * [ T ][ P ][ P ][ N ][ N ][ N ][ N ][ N ][ C ]
   *
   * Where:
   *
   * T: 1 character. Kind of Organization Letter: [ABCDEFGHJKLMNPQRSUVW]
   * P: 2 characters. Province.
   * N: 5 characters. Secuencial Number within the province.
   * C: 1 character. Control Digit: [0-9A-J].
   *
   * [ T ]: Kind of Organizations. Possible values:
   *
   *   A. Corporations
   *   B. LLCs
   *   C. General partnerships
   *   D. Companies limited partnerships
   *   E. Communities of goods
   *   F. Cooperative Societies
   *   G. Associations
   *   H. Communities of homeowners in horizontal property regime
   *   J. Civil Societies
   *   K. Old format
   *   L. Old format
   *   M. Old format
   *   N. Nonresident entities
   *   P. Local authorities
   *   Q. Autonomous bodies, state or not, and the like, and congregations and religious institutions
   *   R. Congregations and religious institutions (since 2008 ORDER EHA/451/2008)
   *   S. Organs of State Administration and regions
   *   V. Agrarian Transformation
   *   W. Permanent establishments of non-resident in Spain
   *
   * [ C ]: Control Digit. It can be a number or a letter depending on T value:
   * [ T ]  -->  [ C ]
   * ------    ----------
   *   A         Number
   *   B         Number
   *   E         Number
   *   H         Number
   *   K         Letter
   *   P         Letter
   *   Q         Letter
   *   S         Letter
   *
   */

  $.validator.addMethod("cifES", function (value, element) {
    "use strict";

    if (this.optional(element)) {
      return true;
    }

    var cifRegEx = new RegExp(/^([ABCDEFGHJKLMNPQRSUVW])(\d{7})([0-9A-J])$/gi);
    var letter = value.substring(0, 1),
        // [ T ]
    number = value.substring(1, 8),
        // [ P ][ P ][ N ][ N ][ N ][ N ][ N ]
    control = value.substring(8, 9),
        // [ C ]
    all_sum = 0,
        even_sum = 0,
        odd_sum = 0,
        i,
        n,
        control_digit,
        control_letter;

    function isOdd(n) {
      return n % 2 === 0;
    } // Quick format test


    if (value.length !== 9 || !cifRegEx.test(value)) {
      return false;
    }

    for (i = 0; i < number.length; i++) {
      n = parseInt(number[i], 10); // Odd positions

      if (isOdd(i)) {
        // Odd positions are multiplied first.
        n *= 2; // If the multiplication is bigger than 10 we need to adjust

        odd_sum += n < 10 ? n : n - 9; // Even positions
        // Just sum them
      } else {
        even_sum += n;
      }
    }

    all_sum = even_sum + odd_sum;
    control_digit = (10 - all_sum.toString().substr(-1)).toString();
    control_digit = parseInt(control_digit, 10) > 9 ? "0" : control_digit;
    control_letter = "JABCDEFGHI".substr(control_digit, 1).toString(); // Control must be a digit

    if (letter.match(/[ABEH]/)) {
      return control === control_digit; // Control must be a letter
    } else if (letter.match(/[KPQS]/)) {
      return control === control_letter;
    } // Can be either


    return control === control_digit || control === control_letter;
  }, "Please specify a valid CIF number.");
  /*
   * Brazillian CPF number (Cadastrado de Pessoas Físicas) is the equivalent of a Brazilian tax registration number.
   * CPF numbers have 11 digits in total: 9 numbers followed by 2 check numbers that are being used for validation.
   */

  $.validator.addMethod("cpfBR", function (value) {
    // Removing special characters from value
    value = value.replace(/([~!@#$%^&*()_+=`{}\[\]\-|\\:;'<>,.\/? ])+/g, ""); // Checking value to have 11 digits only

    if (value.length !== 11) {
      return false;
    }

    var sum = 0,
        firstCN,
        secondCN,
        checkResult,
        i;
    firstCN = parseInt(value.substring(9, 10), 10);
    secondCN = parseInt(value.substring(10, 11), 10);

    checkResult = function checkResult(sum, cn) {
      var result = sum * 10 % 11;

      if (result === 10 || result === 11) {
        result = 0;
      }

      return result === cn;
    }; // Checking for dump data


    if (value === "" || value === "00000000000" || value === "11111111111" || value === "22222222222" || value === "33333333333" || value === "44444444444" || value === "55555555555" || value === "66666666666" || value === "77777777777" || value === "88888888888" || value === "99999999999") {
      return false;
    } // Step 1 - using first Check Number:


    for (i = 1; i <= 9; i++) {
      sum = sum + parseInt(value.substring(i - 1, i), 10) * (11 - i);
    } // If first Check Number (CN) is valid, move to Step 2 - using second Check Number:


    if (checkResult(sum, firstCN)) {
      sum = 0;

      for (i = 1; i <= 10; i++) {
        sum = sum + parseInt(value.substring(i - 1, i), 10) * (12 - i);
      }

      return checkResult(sum, secondCN);
    }

    return false;
  }, "Please specify a valid CPF number"); // https://jqueryvalidation.org/creditcard-method/
  // based on https://en.wikipedia.org/wiki/Luhn_algorithm

  $.validator.addMethod("creditcard", function (value, element) {
    if (this.optional(element)) {
      return "dependency-mismatch";
    } // Accept only spaces, digits and dashes


    if (/[^0-9 \-]+/.test(value)) {
      return false;
    }

    var nCheck = 0,
        nDigit = 0,
        bEven = false,
        n,
        cDigit;
    value = value.replace(/\D/g, ""); // Basing min and max length on
    // https://developer.ean.com/general_info/Valid_Credit_Card_Types

    if (value.length < 13 || value.length > 19) {
      return false;
    }

    for (n = value.length - 1; n >= 0; n--) {
      cDigit = value.charAt(n);
      nDigit = parseInt(cDigit, 10);

      if (bEven) {
        if ((nDigit *= 2) > 9) {
          nDigit -= 9;
        }
      }

      nCheck += nDigit;
      bEven = !bEven;
    }

    return nCheck % 10 === 0;
  }, "Please enter a valid credit card number.");
  /* NOTICE: Modified version of Castle.Components.Validator.CreditCardValidator
   * Redistributed under the the Apache License 2.0 at http://www.apache.org/licenses/LICENSE-2.0
   * Valid Types: mastercard, visa, amex, dinersclub, enroute, discover, jcb, unknown, all (overrides all other settings)
   */

  $.validator.addMethod("creditcardtypes", function (value, element, param) {
    if (/[^0-9\-]+/.test(value)) {
      return false;
    }

    value = value.replace(/\D/g, "");
    var validTypes = 0x0000;

    if (param.mastercard) {
      validTypes |= 0x0001;
    }

    if (param.visa) {
      validTypes |= 0x0002;
    }

    if (param.amex) {
      validTypes |= 0x0004;
    }

    if (param.dinersclub) {
      validTypes |= 0x0008;
    }

    if (param.enroute) {
      validTypes |= 0x0010;
    }

    if (param.discover) {
      validTypes |= 0x0020;
    }

    if (param.jcb) {
      validTypes |= 0x0040;
    }

    if (param.unknown) {
      validTypes |= 0x0080;
    }

    if (param.all) {
      validTypes = 0x0001 | 0x0002 | 0x0004 | 0x0008 | 0x0010 | 0x0020 | 0x0040 | 0x0080;
    }

    if (validTypes & 0x0001 && /^(5[12345])/.test(value)) {
      // Mastercard
      return value.length === 16;
    }

    if (validTypes & 0x0002 && /^(4)/.test(value)) {
      // Visa
      return value.length === 16;
    }

    if (validTypes & 0x0004 && /^(3[47])/.test(value)) {
      // Amex
      return value.length === 15;
    }

    if (validTypes & 0x0008 && /^(3(0[012345]|[68]))/.test(value)) {
      // Dinersclub
      return value.length === 14;
    }

    if (validTypes & 0x0010 && /^(2(014|149))/.test(value)) {
      // Enroute
      return value.length === 15;
    }

    if (validTypes & 0x0020 && /^(6011)/.test(value)) {
      // Discover
      return value.length === 16;
    }

    if (validTypes & 0x0040 && /^(3)/.test(value)) {
      // Jcb
      return value.length === 16;
    }

    if (validTypes & 0x0040 && /^(2131|1800)/.test(value)) {
      // Jcb
      return value.length === 15;
    }

    if (validTypes & 0x0080) {
      // Unknown
      return true;
    }

    return false;
  }, "Please enter a valid credit card number.");
  /**
   * Validates currencies with any given symbols by @jameslouiz
   * Symbols can be optional or required. Symbols required by default
   *
   * Usage examples:
   *  currency: ["£", false] - Use false for soft currency validation
   *  currency: ["$", false]
   *  currency: ["RM", false] - also works with text based symbols such as "RM" - Malaysia Ringgit etc
   *
   *  <input class="currencyInput" name="currencyInput">
   *
   * Soft symbol checking
   *  currencyInput: {
   *     currency: ["$", false]
   *  }
   *
   * Strict symbol checking (default)
   *  currencyInput: {
   *     currency: "$"
   *     //OR
   *     currency: ["$", true]
   *  }
   *
   * Multiple Symbols
   *  currencyInput: {
   *     currency: "$,£,¢"
   *  }
   */

  $.validator.addMethod("currency", function (value, element, param) {
    var isParamString = typeof param === "string",
        symbol = isParamString ? param : param[0],
        soft = isParamString ? true : param[1],
        regex;
    symbol = symbol.replace(/,/g, "");
    symbol = soft ? symbol + "]" : symbol + "]?";
    regex = "^[" + symbol + "([1-9]{1}[0-9]{0,2}(\\,[0-9]{3})*(\\.[0-9]{0,2})?|[1-9]{1}[0-9]{0,}(\\.[0-9]{0,2})?|0(\\.[0-9]{0,2})?|(\\.[0-9]{1,2})?)$";
    regex = new RegExp(regex);
    return this.optional(element) || regex.test(value);
  }, "Please specify a valid currency");
  $.validator.addMethod("dateFA", function (value, element) {
    return this.optional(element) || /^[1-4]\d{3}\/((0?[1-6]\/((3[0-1])|([1-2][0-9])|(0?[1-9])))|((1[0-2]|(0?[7-9]))\/(30|([1-2][0-9])|(0?[1-9]))))$/.test(value);
  }, $.validator.messages.date);
  /**
   * Return true, if the value is a valid date, also making this formal check dd/mm/yyyy.
   *
   * @example $.validator.methods.date("01/01/1900")
   * @result true
   *
   * @example $.validator.methods.date("01/13/1990")
   * @result false
   *
   * @example $.validator.methods.date("01.01.1900")
   * @result false
   *
   * @example <input name="pippo" class="{dateITA:true}" />
   * @desc Declares an optional input element whose value must be a valid date.
   *
   * @name $.validator.methods.dateITA
   * @type Boolean
   * @cat Plugins/Validate/Methods
   */

  $.validator.addMethod("dateITA", function (value, element) {
    var check = false,
        re = /^\d{1,2}\/\d{1,2}\/\d{4}$/,
        adata,
        gg,
        mm,
        aaaa,
        xdata;

    if (re.test(value)) {
      adata = value.split("/");
      gg = parseInt(adata[0], 10);
      mm = parseInt(adata[1], 10);
      aaaa = parseInt(adata[2], 10);
      xdata = new Date(Date.UTC(aaaa, mm - 1, gg, 12, 0, 0, 0));

      if (xdata.getUTCFullYear() === aaaa && xdata.getUTCMonth() === mm - 1 && xdata.getUTCDate() === gg) {
        check = true;
      } else {
        check = false;
      }
    } else {
      check = false;
    }

    return this.optional(element) || check;
  }, $.validator.messages.date);
  $.validator.addMethod("dateNL", function (value, element) {
    return this.optional(element) || /^(0?[1-9]|[12]\d|3[01])[\.\/\-](0?[1-9]|1[012])[\.\/\-]([12]\d)?(\d\d)$/.test(value);
  }, $.validator.messages.date); // Older "accept" file extension method. Old docs: http://docs.jquery.com/Plugins/Validation/Methods/accept

  $.validator.addMethod("extension", function (value, element, param) {
    param = typeof param === "string" ? param.replace(/,/g, "|") : "png|jpe?g|gif";
    return this.optional(element) || value.match(new RegExp("\\.(" + param + ")$", "i"));
  }, $.validator.format("Please enter a value with a valid extension."));
  /**
   * Dutch giro account numbers (not bank numbers) have max 7 digits
   */

  $.validator.addMethod("giroaccountNL", function (value, element) {
    return this.optional(element) || /^[0-9]{1,7}$/.test(value);
  }, "Please specify a valid giro account number");
  /**
   * IBAN is the international bank account number.
   * It has a country - specific format, that is checked here too
   *
   * Validation is case-insensitive. Please make sure to normalize input yourself.
   */

  $.validator.addMethod("iban", function (value, element) {
    // Some quick simple tests to prevent needless work
    if (this.optional(element)) {
      return true;
    } // Remove spaces and to upper case


    var iban = value.replace(/ /g, "").toUpperCase(),
        ibancheckdigits = "",
        leadingZeroes = true,
        cRest = "",
        cOperator = "",
        countrycode,
        ibancheck,
        charAt,
        cChar,
        bbanpattern,
        bbancountrypatterns,
        ibanregexp,
        i,
        p; // Check for IBAN code length.
    // It contains:
    // country code ISO 3166-1 - two letters,
    // two check digits,
    // Basic Bank Account Number (BBAN) - up to 30 chars

    var minimalIBANlength = 5;

    if (iban.length < minimalIBANlength) {
      return false;
    } // Check the country code and find the country specific format


    countrycode = iban.substring(0, 2);
    bbancountrypatterns = {
      "AL": "\\d{8}[\\dA-Z]{16}",
      "AD": "\\d{8}[\\dA-Z]{12}",
      "AT": "\\d{16}",
      "AZ": "[\\dA-Z]{4}\\d{20}",
      "BE": "\\d{12}",
      "BH": "[A-Z]{4}[\\dA-Z]{14}",
      "BA": "\\d{16}",
      "BR": "\\d{23}[A-Z][\\dA-Z]",
      "BG": "[A-Z]{4}\\d{6}[\\dA-Z]{8}",
      "CR": "\\d{17}",
      "HR": "\\d{17}",
      "CY": "\\d{8}[\\dA-Z]{16}",
      "CZ": "\\d{20}",
      "DK": "\\d{14}",
      "DO": "[A-Z]{4}\\d{20}",
      "EE": "\\d{16}",
      "FO": "\\d{14}",
      "FI": "\\d{14}",
      "FR": "\\d{10}[\\dA-Z]{11}\\d{2}",
      "GE": "[\\dA-Z]{2}\\d{16}",
      "DE": "\\d{18}",
      "GI": "[A-Z]{4}[\\dA-Z]{15}",
      "GR": "\\d{7}[\\dA-Z]{16}",
      "GL": "\\d{14}",
      "GT": "[\\dA-Z]{4}[\\dA-Z]{20}",
      "HU": "\\d{24}",
      "IS": "\\d{22}",
      "IE": "[\\dA-Z]{4}\\d{14}",
      "IL": "\\d{19}",
      "IT": "[A-Z]\\d{10}[\\dA-Z]{12}",
      "KZ": "\\d{3}[\\dA-Z]{13}",
      "KW": "[A-Z]{4}[\\dA-Z]{22}",
      "LV": "[A-Z]{4}[\\dA-Z]{13}",
      "LB": "\\d{4}[\\dA-Z]{20}",
      "LI": "\\d{5}[\\dA-Z]{12}",
      "LT": "\\d{16}",
      "LU": "\\d{3}[\\dA-Z]{13}",
      "MK": "\\d{3}[\\dA-Z]{10}\\d{2}",
      "MT": "[A-Z]{4}\\d{5}[\\dA-Z]{18}",
      "MR": "\\d{23}",
      "MU": "[A-Z]{4}\\d{19}[A-Z]{3}",
      "MC": "\\d{10}[\\dA-Z]{11}\\d{2}",
      "MD": "[\\dA-Z]{2}\\d{18}",
      "ME": "\\d{18}",
      "NL": "[A-Z]{4}\\d{10}",
      "NO": "\\d{11}",
      "PK": "[\\dA-Z]{4}\\d{16}",
      "PS": "[\\dA-Z]{4}\\d{21}",
      "PL": "\\d{24}",
      "PT": "\\d{21}",
      "RO": "[A-Z]{4}[\\dA-Z]{16}",
      "SM": "[A-Z]\\d{10}[\\dA-Z]{12}",
      "SA": "\\d{2}[\\dA-Z]{18}",
      "RS": "\\d{18}",
      "SK": "\\d{20}",
      "SI": "\\d{15}",
      "ES": "\\d{20}",
      "SE": "\\d{20}",
      "CH": "\\d{5}[\\dA-Z]{12}",
      "TN": "\\d{20}",
      "TR": "\\d{5}[\\dA-Z]{17}",
      "AE": "\\d{3}\\d{16}",
      "GB": "[A-Z]{4}\\d{14}",
      "VG": "[\\dA-Z]{4}\\d{16}"
    };
    bbanpattern = bbancountrypatterns[countrycode]; // As new countries will start using IBAN in the
    // future, we only check if the countrycode is known.
    // This prevents false negatives, while almost all
    // false positives introduced by this, will be caught
    // by the checksum validation below anyway.
    // Strict checking should return FALSE for unknown
    // countries.

    if (typeof bbanpattern !== "undefined") {
      ibanregexp = new RegExp("^[A-Z]{2}\\d{2}" + bbanpattern + "$", "");

      if (!ibanregexp.test(iban)) {
        return false; // Invalid country specific format
      }
    } // Now check the checksum, first convert to digits


    ibancheck = iban.substring(4, iban.length) + iban.substring(0, 4);

    for (i = 0; i < ibancheck.length; i++) {
      charAt = ibancheck.charAt(i);

      if (charAt !== "0") {
        leadingZeroes = false;
      }

      if (!leadingZeroes) {
        ibancheckdigits += "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(charAt);
      }
    } // Calculate the result of: ibancheckdigits % 97


    for (p = 0; p < ibancheckdigits.length; p++) {
      cChar = ibancheckdigits.charAt(p);
      cOperator = "" + cRest + "" + cChar;
      cRest = cOperator % 97;
    }

    return cRest === 1;
  }, "Please specify a valid IBAN");
  $.validator.addMethod("integer", function (value, element) {
    return this.optional(element) || /^-?\d+$/.test(value);
  }, "A positive or negative non-decimal number please");
  $.validator.addMethod("ipv4", function (value, element) {
    return this.optional(element) || /^(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)$/i.test(value);
  }, "Please enter a valid IP v4 address.");
  $.validator.addMethod("ipv6", function (value, element) {
    return this.optional(element) || /^((([0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}:[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){5}:([0-9A-Fa-f]{1,4}:)?[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){4}:([0-9A-Fa-f]{1,4}:){0,2}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){3}:([0-9A-Fa-f]{1,4}:){0,3}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){2}:([0-9A-Fa-f]{1,4}:){0,4}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(([0-9A-Fa-f]{1,4}:){0,5}:((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(::([0-9A-Fa-f]{1,4}:){0,5}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|([0-9A-Fa-f]{1,4}::([0-9A-Fa-f]{1,4}:){0,5}[0-9A-Fa-f]{1,4})|(::([0-9A-Fa-f]{1,4}:){0,6}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){1,7}:))$/i.test(value);
  }, "Please enter a valid IP v6 address.");
  $.validator.addMethod("lettersonly", function (value, element) {
    return this.optional(element) || /^[a-z]+$/i.test(value);
  }, "Letters only please");
  $.validator.addMethod("letterswithbasicpunc", function (value, element) {
    return this.optional(element) || /^[a-z\-.,()'"\s]+$/i.test(value);
  }, "Letters or punctuation only please");
  $.validator.addMethod("mobileNL", function (value, element) {
    return this.optional(element) || /^((\+|00(\s|\s?\-\s?)?)31(\s|\s?\-\s?)?(\(0\)[\-\s]?)?|0)6((\s|\s?\-\s?)?[0-9]){8}$/.test(value);
  }, "Please specify a valid mobile number");
  /* For UK phone functions, do the following server side processing:
   * Compare original input with this RegEx pattern:
   * ^\(?(?:(?:00\)?[\s\-]?\(?|\+)(44)\)?[\s\-]?\(?(?:0\)?[\s\-]?\(?)?|0)([1-9]\d{1,4}\)?[\s\d\-]+)$
   * Extract $1 and set $prefix to '+44<space>' if $1 is '44', otherwise set $prefix to '0'
   * Extract $2 and remove hyphens, spaces and parentheses. Phone number is combined $prefix and $2.
   * A number of very detailed GB telephone number RegEx patterns can also be found at:
   * http://www.aa-asterisk.org.uk/index.php/Regular_Expressions_for_Validating_and_Formatting_GB_Telephone_Numbers
   */

  $.validator.addMethod("mobileUK", function (phone_number, element) {
    phone_number = phone_number.replace(/\(|\)|\s+|-/g, "");
    return this.optional(element) || phone_number.length > 9 && phone_number.match(/^(?:(?:(?:00\s?|\+)44\s?|0)7(?:[1345789]\d{2}|624)\s?\d{3}\s?\d{3})$/);
  }, "Please specify a valid mobile number");
  $.validator.addMethod("netmask", function (value, element) {
    return this.optional(element) || /^(254|252|248|240|224|192|128)\.0\.0\.0|255\.(254|252|248|240|224|192|128|0)\.0\.0|255\.255\.(254|252|248|240|224|192|128|0)\.0|255\.255\.255\.(254|252|248|240|224|192|128|0)/i.test(value);
  }, "Please enter a valid netmask.");
  /*
   * The NIE (Número de Identificación de Extranjero) is a Spanish tax identification number assigned by the Spanish
   * authorities to any foreigner.
   *
   * The NIE is the equivalent of a Spaniards Número de Identificación Fiscal (NIF) which serves as a fiscal
   * identification number. The CIF number (Certificado de Identificación Fiscal) is equivalent to the NIF, but applies to
   * companies rather than individuals. The NIE consists of an 'X' or 'Y' followed by 7 or 8 digits then another letter.
   */

  $.validator.addMethod("nieES", function (value, element) {
    "use strict";

    if (this.optional(element)) {
      return true;
    }

    var nieRegEx = new RegExp(/^[MXYZ]{1}[0-9]{7,8}[TRWAGMYFPDXBNJZSQVHLCKET]{1}$/gi);
    var validChars = "TRWAGMYFPDXBNJZSQVHLCKET",
        letter = value.substr(value.length - 1).toUpperCase(),
        number;
    value = value.toString().toUpperCase(); // Quick format test

    if (value.length > 10 || value.length < 9 || !nieRegEx.test(value)) {
      return false;
    } // X means same number
    // Y means number + 10000000
    // Z means number + 20000000


    value = value.replace(/^[X]/, "0").replace(/^[Y]/, "1").replace(/^[Z]/, "2");
    number = value.length === 9 ? value.substr(0, 8) : value.substr(0, 9);
    return validChars.charAt(parseInt(number, 10) % 23) === letter;
  }, "Please specify a valid NIE number.");
  /*
   * The Número de Identificación Fiscal ( NIF ) is the way tax identification used in Spain for individuals
   */

  $.validator.addMethod("nifES", function (value, element) {
    "use strict";

    if (this.optional(element)) {
      return true;
    }

    value = value.toUpperCase(); // Basic format test

    if (!value.match("((^[A-Z]{1}[0-9]{7}[A-Z0-9]{1}$|^[T]{1}[A-Z0-9]{8}$)|^[0-9]{8}[A-Z]{1}$)")) {
      return false;
    } // Test NIF


    if (/^[0-9]{8}[A-Z]{1}$/.test(value)) {
      return "TRWAGMYFPDXBNJZSQVHLCKE".charAt(value.substring(8, 0) % 23) === value.charAt(8);
    } // Test specials NIF (starts with K, L or M)


    if (/^[KLM]{1}/.test(value)) {
      return value[8] === "TRWAGMYFPDXBNJZSQVHLCKE".charAt(value.substring(8, 1) % 23);
    }

    return false;
  }, "Please specify a valid NIF number.");
  /*
   * Numer identyfikacji podatkowej ( NIP ) is the way tax identification used in Poland for companies
   */

  $.validator.addMethod("nipPL", function (value) {
    "use strict";

    value = value.replace(/[^0-9]/g, "");

    if (value.length !== 10) {
      return false;
    }

    var arrSteps = [6, 5, 7, 2, 3, 4, 5, 6, 7];
    var intSum = 0;

    for (var i = 0; i < 9; i++) {
      intSum += arrSteps[i] * value[i];
    }

    var int2 = intSum % 11;
    var intControlNr = int2 === 10 ? 0 : int2;
    return intControlNr === parseInt(value[9], 10);
  }, "Please specify a valid NIP number.");
  $.validator.addMethod("notEqualTo", function (value, element, param) {
    return this.optional(element) || !$.validator.methods.equalTo.call(this, value, element, param);
  }, "Please enter a different value, values must not be the same.");
  $.validator.addMethod("nowhitespace", function (value, element) {
    return this.optional(element) || /^\S+$/i.test(value);
  }, "No white space please");
  /**
  * Return true if the field value matches the given format RegExp
  *
  * @example $.validator.methods.pattern("AR1004",element,/^AR\d{4}$/)
  * @result true
  *
  * @example $.validator.methods.pattern("BR1004",element,/^AR\d{4}$/)
  * @result false
  *
  * @name $.validator.methods.pattern
  * @type Boolean
  * @cat Plugins/Validate/Methods
  */

  $.validator.addMethod("pattern", function (value, element, param) {
    if (this.optional(element)) {
      return true;
    }

    if (typeof param === "string") {
      param = new RegExp("^(?:" + param + ")$");
    }

    return param.test(value);
  }, "Invalid format.");
  /**
   * Dutch phone numbers have 10 digits (or 11 and start with +31).
   */

  $.validator.addMethod("phoneNL", function (value, element) {
    return this.optional(element) || /^((\+|00(\s|\s?\-\s?)?)31(\s|\s?\-\s?)?(\(0\)[\-\s]?)?|0)[1-9]((\s|\s?\-\s?)?[0-9]){8}$/.test(value);
  }, "Please specify a valid phone number.");
  /* For UK phone functions, do the following server side processing:
   * Compare original input with this RegEx pattern:
   * ^\(?(?:(?:00\)?[\s\-]?\(?|\+)(44)\)?[\s\-]?\(?(?:0\)?[\s\-]?\(?)?|0)([1-9]\d{1,4}\)?[\s\d\-]+)$
   * Extract $1 and set $prefix to '+44<space>' if $1 is '44', otherwise set $prefix to '0'
   * Extract $2 and remove hyphens, spaces and parentheses. Phone number is combined $prefix and $2.
   * A number of very detailed GB telephone number RegEx patterns can also be found at:
   * http://www.aa-asterisk.org.uk/index.php/Regular_Expressions_for_Validating_and_Formatting_GB_Telephone_Numbers
   */
  // Matches UK landline + mobile, accepting only 01-3 for landline or 07 for mobile to exclude many premium numbers

  $.validator.addMethod("phonesUK", function (phone_number, element) {
    phone_number = phone_number.replace(/\(|\)|\s+|-/g, "");
    return this.optional(element) || phone_number.length > 9 && phone_number.match(/^(?:(?:(?:00\s?|\+)44\s?|0)(?:1\d{8,9}|[23]\d{9}|7(?:[1345789]\d{8}|624\d{6})))$/);
  }, "Please specify a valid uk phone number");
  /* For UK phone functions, do the following server side processing:
   * Compare original input with this RegEx pattern:
   * ^\(?(?:(?:00\)?[\s\-]?\(?|\+)(44)\)?[\s\-]?\(?(?:0\)?[\s\-]?\(?)?|0)([1-9]\d{1,4}\)?[\s\d\-]+)$
   * Extract $1 and set $prefix to '+44<space>' if $1 is '44', otherwise set $prefix to '0'
   * Extract $2 and remove hyphens, spaces and parentheses. Phone number is combined $prefix and $2.
   * A number of very detailed GB telephone number RegEx patterns can also be found at:
   * http://www.aa-asterisk.org.uk/index.php/Regular_Expressions_for_Validating_and_Formatting_GB_Telephone_Numbers
   */

  $.validator.addMethod("phoneUK", function (phone_number, element) {
    phone_number = phone_number.replace(/\(|\)|\s+|-/g, "");
    return this.optional(element) || phone_number.length > 9 && phone_number.match(/^(?:(?:(?:00\s?|\+)44\s?)|(?:\(?0))(?:\d{2}\)?\s?\d{4}\s?\d{4}|\d{3}\)?\s?\d{3}\s?\d{3,4}|\d{4}\)?\s?(?:\d{5}|\d{3}\s?\d{3})|\d{5}\)?\s?\d{4,5})$/);
  }, "Please specify a valid phone number");
  /**
   * Matches US phone number format
   *
   * where the area code may not start with 1 and the prefix may not start with 1
   * allows '-' or ' ' as a separator and allows parens around area code
   * some people may want to put a '1' in front of their number
   *
   * 1(212)-999-2345 or
   * 212 999 2344 or
   * 212-999-0983
   *
   * but not
   * 111-123-5434
   * and not
   * 212 123 4567
   */

  $.validator.addMethod("phoneUS", function (phone_number, element) {
    phone_number = phone_number.replace(/\s+/g, "");
    return this.optional(element) || phone_number.length > 9 && phone_number.match(/^(\+?1-?)?(\([2-9]([02-9]\d|1[02-9])\)|[2-9]([02-9]\d|1[02-9]))-?[2-9]([02-9]\d|1[02-9])-?\d{4}$/);
  }, "Please specify a valid phone number");
  /*
  * Valida CEPs do brasileiros:
  *
  * Formatos aceitos:
  * 99999-999
  * 99.999-999
  * 99999999
  */

  $.validator.addMethod("postalcodeBR", function (cep_value, element) {
    return this.optional(element) || /^\d{2}.\d{3}-\d{3}?$|^\d{5}-?\d{3}?$/.test(cep_value);
  }, "Informe um CEP válido.");
  /**
   * Matches a valid Canadian Postal Code
   *
   * @example jQuery.validator.methods.postalCodeCA( "H0H 0H0", element )
   * @result true
   *
   * @example jQuery.validator.methods.postalCodeCA( "H0H0H0", element )
   * @result false
   *
   * @name jQuery.validator.methods.postalCodeCA
   * @type Boolean
   * @cat Plugins/Validate/Methods
   */

  $.validator.addMethod("postalCodeCA", function (value, element) {
    return this.optional(element) || /^[ABCEGHJKLMNPRSTVXY]\d[ABCEGHJKLMNPRSTVWXYZ] *\d[ABCEGHJKLMNPRSTVWXYZ]\d$/i.test(value);
  }, "Please specify a valid postal code");
  /* Matches Italian postcode (CAP) */

  $.validator.addMethod("postalcodeIT", function (value, element) {
    return this.optional(element) || /^\d{5}$/.test(value);
  }, "Please specify a valid postal code");
  $.validator.addMethod("postalcodeNL", function (value, element) {
    return this.optional(element) || /^[1-9][0-9]{3}\s?[a-zA-Z]{2}$/.test(value);
  }, "Please specify a valid postal code"); // Matches UK postcode. Does not match to UK Channel Islands that have their own postcodes (non standard UK)

  $.validator.addMethod("postcodeUK", function (value, element) {
    return this.optional(element) || /^((([A-PR-UWYZ][0-9])|([A-PR-UWYZ][0-9][0-9])|([A-PR-UWYZ][A-HK-Y][0-9])|([A-PR-UWYZ][A-HK-Y][0-9][0-9])|([A-PR-UWYZ][0-9][A-HJKSTUW])|([A-PR-UWYZ][A-HK-Y][0-9][ABEHMNPRVWXY]))\s?([0-9][ABD-HJLNP-UW-Z]{2})|(GIR)\s?(0AA))$/i.test(value);
  }, "Please specify a valid UK postcode");
  /*
   * Lets you say "at least X inputs that match selector Y must be filled."
   *
   * The end result is that neither of these inputs:
   *
   *	<input class="productinfo" name="partnumber">
   *	<input class="productinfo" name="description">
   *
   *	...will validate unless at least one of them is filled.
   *
   * partnumber:	{require_from_group: [1,".productinfo"]},
   * description: {require_from_group: [1,".productinfo"]}
   *
   * options[0]: number of fields that must be filled in the group
   * options[1]: CSS selector that defines the group of conditionally required fields
   */

  $.validator.addMethod("require_from_group", function (value, element, options) {
    var $fields = $(options[1], element.form),
        $fieldsFirst = $fields.eq(0),
        validator = $fieldsFirst.data("valid_req_grp") ? $fieldsFirst.data("valid_req_grp") : $.extend({}, this),
        isValid = $fields.filter(function () {
      return validator.elementValue(this);
    }).length >= options[0]; // Store the cloned validator for future validation

    $fieldsFirst.data("valid_req_grp", validator); // If element isn't being validated, run each require_from_group field's validation rules

    if (!$(element).data("being_validated")) {
      $fields.data("being_validated", true);
      $fields.each(function () {
        validator.element(this);
      });
      $fields.data("being_validated", false);
    }

    return isValid;
  }, $.validator.format("Please fill at least {0} of these fields."));
  /*
   * Lets you say "either at least X inputs that match selector Y must be filled,
   * OR they must all be skipped (left blank)."
   *
   * The end result, is that none of these inputs:
   *
   *	<input class="productinfo" name="partnumber">
   *	<input class="productinfo" name="description">
   *	<input class="productinfo" name="color">
   *
   *	...will validate unless either at least two of them are filled,
   *	OR none of them are.
   *
   * partnumber:	{skip_or_fill_minimum: [2,".productinfo"]},
   * description: {skip_or_fill_minimum: [2,".productinfo"]},
   * color:		{skip_or_fill_minimum: [2,".productinfo"]}
   *
   * options[0]: number of fields that must be filled in the group
   * options[1]: CSS selector that defines the group of conditionally required fields
   *
   */

  $.validator.addMethod("skip_or_fill_minimum", function (value, element, options) {
    var $fields = $(options[1], element.form),
        $fieldsFirst = $fields.eq(0),
        validator = $fieldsFirst.data("valid_skip") ? $fieldsFirst.data("valid_skip") : $.extend({}, this),
        numberFilled = $fields.filter(function () {
      return validator.elementValue(this);
    }).length,
        isValid = numberFilled === 0 || numberFilled >= options[0]; // Store the cloned validator for future validation

    $fieldsFirst.data("valid_skip", validator); // If element isn't being validated, run each skip_or_fill_minimum field's validation rules

    if (!$(element).data("being_validated")) {
      $fields.data("being_validated", true);
      $fields.each(function () {
        validator.element(this);
      });
      $fields.data("being_validated", false);
    }

    return isValid;
  }, $.validator.format("Please either skip these fields or fill at least {0} of them."));
  /* Validates US States and/or Territories by @jdforsythe
   * Can be case insensitive or require capitalization - default is case insensitive
   * Can include US Territories or not - default does not
   * Can include US Military postal abbreviations (AA, AE, AP) - default does not
   *
   * Note: "States" always includes DC (District of Colombia)
   *
   * Usage examples:
   *
   *  This is the default - case insensitive, no territories, no military zones
   *  stateInput: {
   *     caseSensitive: false,
   *     includeTerritories: false,
   *     includeMilitary: false
   *  }
   *
   *  Only allow capital letters, no territories, no military zones
   *  stateInput: {
   *     caseSensitive: false
   *  }
   *
   *  Case insensitive, include territories but not military zones
   *  stateInput: {
   *     includeTerritories: true
   *  }
   *
   *  Only allow capital letters, include territories and military zones
   *  stateInput: {
   *     caseSensitive: true,
   *     includeTerritories: true,
   *     includeMilitary: true
   *  }
   *
   */

  $.validator.addMethod("stateUS", function (value, element, options) {
    var isDefault = typeof options === "undefined",
        caseSensitive = isDefault || typeof options.caseSensitive === "undefined" ? false : options.caseSensitive,
        includeTerritories = isDefault || typeof options.includeTerritories === "undefined" ? false : options.includeTerritories,
        includeMilitary = isDefault || typeof options.includeMilitary === "undefined" ? false : options.includeMilitary,
        regex;

    if (!includeTerritories && !includeMilitary) {
      regex = "^(A[KLRZ]|C[AOT]|D[CE]|FL|GA|HI|I[ADLN]|K[SY]|LA|M[ADEINOST]|N[CDEHJMVY]|O[HKR]|PA|RI|S[CD]|T[NX]|UT|V[AT]|W[AIVY])$";
    } else if (includeTerritories && includeMilitary) {
      regex = "^(A[AEKLPRSZ]|C[AOT]|D[CE]|FL|G[AU]|HI|I[ADLN]|K[SY]|LA|M[ADEINOPST]|N[CDEHJMVY]|O[HKR]|P[AR]|RI|S[CD]|T[NX]|UT|V[AIT]|W[AIVY])$";
    } else if (includeTerritories) {
      regex = "^(A[KLRSZ]|C[AOT]|D[CE]|FL|G[AU]|HI|I[ADLN]|K[SY]|LA|M[ADEINOPST]|N[CDEHJMVY]|O[HKR]|P[AR]|RI|S[CD]|T[NX]|UT|V[AIT]|W[AIVY])$";
    } else {
      regex = "^(A[AEKLPRZ]|C[AOT]|D[CE]|FL|GA|HI|I[ADLN]|K[SY]|LA|M[ADEINOST]|N[CDEHJMVY]|O[HKR]|PA|RI|S[CD]|T[NX]|UT|V[AT]|W[AIVY])$";
    }

    regex = caseSensitive ? new RegExp(regex) : new RegExp(regex, "i");
    return this.optional(element) || regex.test(value);
  }, "Please specify a valid state"); // TODO check if value starts with <, otherwise don't try stripping anything

  $.validator.addMethod("strippedminlength", function (value, element, param) {
    return $(value).text().length >= param;
  }, $.validator.format("Please enter at least {0} characters"));
  $.validator.addMethod("time", function (value, element) {
    return this.optional(element) || /^([01]\d|2[0-3]|[0-9])(:[0-5]\d){1,2}$/.test(value);
  }, "Please enter a valid time, between 00:00 and 23:59");
  $.validator.addMethod("time12h", function (value, element) {
    return this.optional(element) || /^((0?[1-9]|1[012])(:[0-5]\d){1,2}(\ ?[AP]M))$/i.test(value);
  }, "Please enter a valid time in 12-hour am/pm format"); // Same as url, but TLD is optional

  $.validator.addMethod("url2", function (value, element) {
    return this.optional(element) || /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)*(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(value);
  }, $.validator.messages.url);
  /**
   * Return true, if the value is a valid vehicle identification number (VIN).
   *
   * Works with all kind of text inputs.
   *
   * @example <input type="text" size="20" name="VehicleID" class="{required:true,vinUS:true}" />
   * @desc Declares a required input element whose value must be a valid vehicle identification number.
   *
   * @name $.validator.methods.vinUS
   * @type Boolean
   * @cat Plugins/Validate/Methods
   */

  $.validator.addMethod("vinUS", function (v) {
    if (v.length !== 17) {
      return false;
    }

    var LL = ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M", "N", "P", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
        VL = [1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4, 5, 7, 9, 2, 3, 4, 5, 6, 7, 8, 9],
        FL = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2],
        rs = 0,
        i,
        n,
        d,
        f,
        cd,
        cdv;

    for (i = 0; i < 17; i++) {
      f = FL[i];
      d = v.slice(i, i + 1);

      if (i === 8) {
        cdv = d;
      }

      if (!isNaN(d)) {
        d *= f;
      } else {
        for (n = 0; n < LL.length; n++) {
          if (d.toUpperCase() === LL[n]) {
            d = VL[n];
            d *= f;

            if (isNaN(cdv) && n === 8) {
              cdv = LL[n];
            }

            break;
          }
        }
      }

      rs += d;
    }

    cd = rs % 11;

    if (cd === 10) {
      cd = "X";
    }

    if (cd === cdv) {
      return true;
    }

    return false;
  }, "The specified vehicle identification number (VIN) is invalid.");
  $.validator.addMethod("zipcodeUS", function (value, element) {
    return this.optional(element) || /^\d{5}(-\d{4})?$/.test(value);
  }, "The specified US ZIP Code is invalid");
  $.validator.addMethod("ziprange", function (value, element) {
    return this.optional(element) || /^90[2-5]\d\{2\}-\d{4}$/.test(value);
  }, "Your ZIP-code must be in the range 902xx-xxxx to 905xx-xxxx");
  return $;
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9qcXVlcnktdmFsaWRhdGlvbi9kaXN0L2FkZGl0aW9uYWwtbWV0aG9kcy5qcyJdLCJuYW1lcyI6WyJmYWN0b3J5IiwiZGVmaW5lIiwiYW1kIiwibW9kdWxlIiwiZXhwb3J0cyIsInJlcXVpcmUiLCJqUXVlcnkiLCIkIiwic3RyaXBIdG1sIiwidmFsdWUiLCJyZXBsYWNlIiwidmFsaWRhdG9yIiwiYWRkTWV0aG9kIiwiZWxlbWVudCIsInBhcmFtcyIsIm9wdGlvbmFsIiwibWF0Y2giLCJsZW5ndGgiLCJmb3JtYXQiLCJ2YWx1ZVN0cmlwcGVkIiwicmVnZXgiLCJwYXJhbSIsInR5cGVQYXJhbSIsIm9wdGlvbmFsVmFsdWUiLCJpIiwiZmlsZSIsImF0dHIiLCJmaWxlcyIsIlJlZ0V4cCIsInR5cGUiLCJ0ZXN0IiwiYWNjb3VudCIsInN1bSIsImxlbiIsInBvcyIsImZhY3RvciIsImRpZ2l0Iiwic3Vic3RyaW5nIiwibWV0aG9kcyIsImJhbmthY2NvdW50TkwiLCJjYWxsIiwiZ2lyb2FjY291bnROTCIsInRvVXBwZXJDYXNlIiwiY2lmUmVnRXgiLCJsZXR0ZXIiLCJudW1iZXIiLCJjb250cm9sIiwiYWxsX3N1bSIsImV2ZW5fc3VtIiwib2RkX3N1bSIsIm4iLCJjb250cm9sX2RpZ2l0IiwiY29udHJvbF9sZXR0ZXIiLCJpc09kZCIsInBhcnNlSW50IiwidG9TdHJpbmciLCJzdWJzdHIiLCJmaXJzdENOIiwic2Vjb25kQ04iLCJjaGVja1Jlc3VsdCIsImNuIiwicmVzdWx0IiwibkNoZWNrIiwibkRpZ2l0IiwiYkV2ZW4iLCJjRGlnaXQiLCJjaGFyQXQiLCJ2YWxpZFR5cGVzIiwibWFzdGVyY2FyZCIsInZpc2EiLCJhbWV4IiwiZGluZXJzY2x1YiIsImVucm91dGUiLCJkaXNjb3ZlciIsImpjYiIsInVua25vd24iLCJhbGwiLCJpc1BhcmFtU3RyaW5nIiwic3ltYm9sIiwic29mdCIsIm1lc3NhZ2VzIiwiZGF0ZSIsImNoZWNrIiwicmUiLCJhZGF0YSIsImdnIiwibW0iLCJhYWFhIiwieGRhdGEiLCJzcGxpdCIsIkRhdGUiLCJVVEMiLCJnZXRVVENGdWxsWWVhciIsImdldFVUQ01vbnRoIiwiZ2V0VVRDRGF0ZSIsImliYW4iLCJpYmFuY2hlY2tkaWdpdHMiLCJsZWFkaW5nWmVyb2VzIiwiY1Jlc3QiLCJjT3BlcmF0b3IiLCJjb3VudHJ5Y29kZSIsImliYW5jaGVjayIsImNDaGFyIiwiYmJhbnBhdHRlcm4iLCJiYmFuY291bnRyeXBhdHRlcm5zIiwiaWJhbnJlZ2V4cCIsInAiLCJtaW5pbWFsSUJBTmxlbmd0aCIsImluZGV4T2YiLCJwaG9uZV9udW1iZXIiLCJuaWVSZWdFeCIsInZhbGlkQ2hhcnMiLCJhcnJTdGVwcyIsImludFN1bSIsImludDIiLCJpbnRDb250cm9sTnIiLCJlcXVhbFRvIiwiY2VwX3ZhbHVlIiwib3B0aW9ucyIsIiRmaWVsZHMiLCJmb3JtIiwiJGZpZWxkc0ZpcnN0IiwiZXEiLCJkYXRhIiwiZXh0ZW5kIiwiaXNWYWxpZCIsImZpbHRlciIsImVsZW1lbnRWYWx1ZSIsImVhY2giLCJudW1iZXJGaWxsZWQiLCJpc0RlZmF1bHQiLCJjYXNlU2Vuc2l0aXZlIiwiaW5jbHVkZVRlcnJpdG9yaWVzIiwiaW5jbHVkZU1pbGl0YXJ5IiwidGV4dCIsInVybCIsInYiLCJMTCIsIlZMIiwiRkwiLCJycyIsImQiLCJmIiwiY2QiLCJjZHYiLCJzbGljZSIsImlzTmFOIl0sIm1hcHBpbmdzIjoiOzs7O0FBQUE7Ozs7Ozs7O0FBUUMsV0FBVUEsT0FBVixFQUFvQjtBQUNwQixNQUFLLE9BQU9DLE1BQVAsS0FBa0IsVUFBbEIsSUFBZ0NBLE1BQU0sQ0FBQ0MsR0FBNUMsRUFBa0Q7QUFDakRELElBQUFBLE1BQU0sQ0FBRSxDQUFDLFFBQUQsRUFBVyxtQkFBWCxDQUFGLEVBQW1DRCxPQUFuQyxDQUFOO0FBQ0EsR0FGRCxNQUVPLElBQUksUUFBT0csTUFBUCx5Q0FBT0EsTUFBUCxPQUFrQixRQUFsQixJQUE4QkEsTUFBTSxDQUFDQyxPQUF6QyxFQUFrRDtBQUN4REQs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LCJzb3VyY2VzQ29udGVudCI6WyIvKiFcclxuICogalF1ZXJ5IFZhbGlkYXRpb24gUGx1Z2luIHYxLjE3LjBcclxuICpcclxuICogaHR0cHM6Ly9qcXVlcnl2YWxpZGF0aW9uLm9yZy9cclxuICpcclxuICogQ29weXJpZ2h0IChjKSAyMDE3IErDtnJuIFphZWZmZXJlclxyXG4gKiBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2VcclxuICovXHJcbihmdW5jdGlvbiggZmFjdG9yeSApIHtcclxuXHRpZiAoIHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kICkge1xyXG5cdFx0ZGVmaW5lKCBbXCJqcXVlcnlcIiwgXCIuL2pxdWVyeS52YWxpZGF0ZVwiXSwgZmFjdG9yeSApO1xyXG5cdH0gZWxzZSBpZiAodHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiAmJiBtb2R1bGUuZXhwb3J0cykge1xyXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCByZXF1aXJlKCBcImpxdWVyeVwiICkgKTtcclxuXHR9IGVsc2Uge1xyXG5cdFx0ZmFjdG9yeSggalF1ZXJ5ICk7XHJcblx0fVxyXG59KGZ1bmN0aW9uKCAkICkge1xyXG5cclxuKCBmdW5jdGlvbigpIHtcclxuXHJcblx0ZnVuY3Rpb24gc3RyaXBIdG1sKCB2YWx1ZSApIHtcclxuXHJcblx0XHQvLyBSZW1vdmUgaHRtbCB0YWdzIGFuZCBzcGFjZSBjaGFyc1xyXG5cdFx0cmV0dXJuIHZhbHVlLnJlcGxhY2UoIC88LltePD5dKj8+L2csIFwiIFwiICkucmVwbGFjZSggLyZuYnNwO3wmIzE2MDsvZ2ksIFwiIFwiIClcclxuXHJcblx0XHQvLyBSZW1vdmUgcHVuY3R1YXRpb25cclxuXHRcdC5yZXBsYWNlKCAvWy4oKSw7OiE/JSMkJ1xcXCJfKz1cXC9cXC3igJzigJ3igJldKi9nLCBcIlwiICk7XHJcblx0fVxyXG5cclxuXHQkLnZhbGlkYXRvci5hZGRNZXRob2QoIFwibWF4V29yZHNcIiwgZnVuY3Rpb24oIHZhbHVlLCBlbGVtZW50LCBwYXJhbXMgKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5vcHRpb25hbCggZWxlbWVudCApIHx8IHN0cmlwSHRtbCggdmFsdWUgKS5tYXRjaCggL1xcYlxcdytcXGIvZyApLmxlbmd0aCA8PSBwYXJhbXM7XHJcblx0fSwgJC52YWxpZGF0b3IuZm9ybWF0KCBcIlBsZWFzZSBlbnRlciB7MH0gd29yZHMgb3IgbGVzcy5cIiApICk7XHJcblxyXG5cdCQudmFsaWRhdG9yLmFkZE1ldGhvZCggXCJtaW5Xb3Jkc1wiLCBmdW5jdGlvbiggdmFsdWUsIGVsZW1lbnQsIHBhcmFtcyApIHtcclxuXHRcdHJldHVybiB0aGlzLm9wdGlvbmFsKCBlbGVtZW50ICkgfHwgc3RyaXBIdG1sKCB2YWx1ZSApLm1hdGNoKCAvXFxiXFx3K1xcYi9nICkubGVuZ3RoID49IHBhcmFtcztcclxuXHR9LCAkLnZhbGlkYXRvci5mb3JtYXQoIFwiUGxlYXNlIGVudGVyIGF0IGxlYXN0IHswfSB3b3Jkcy5cIiApICk7XHJcblxyXG5cdCQudmFsaWRhdG9yLmFkZE1ldGhvZCggXCJyYW5nZVdvcmRzXCIsIGZ1bmN0aW9uKCB2YWx1ZSwgZWxlbWVudCwgcGFyYW1zICkge1xyXG5cdFx0dmFyIHZhbHVlU3RyaXBwZWQgPSBzdHJpcEh0bWwoIHZhbHVlICksXHJcblx0XHRcdHJlZ2V4ID0gL1xcYlxcdytcXGIvZztcclxuXHRcdHJldHVybiB0aGlzLm9wdGlvbmFsKCBlbGVtZW50ICkgfHwgdmFsdWVTdHJpcHBlZC5tYXRjaCggcmVnZXggKS5sZW5ndGggPj0gcGFyYW1zWyAwIF0gJiYgdmFsdWVTdHJpcHBlZC5tYXRjaCggcmVnZXggKS5sZW5ndGggPD0gcGFyYW1zWyAxIF07XHJcblx0fSwgJC52YWxpZGF0b3IuZm9ybWF0KCBcIlBsZWFzZSBlbnRlciBiZXR3ZWVuIHswfSBhbmQgezF9IHdvcmRzLlwiICkgKTtcclxuXHJcbn0oKSApO1xyXG5cclxuLy8gQWNjZXB0IGEgdmFsdWUgZnJvbSBhIGZpbGUgaW5wdXQgYmFzZWQgb24gYSByZXF1aXJlZCBtaW1ldHlwZVxyXG4kLnZhbGlkYXRvci5hZGRNZXRob2QoIFwiYWNjZXB0XCIsIGZ1bmN0aW9uKCB2YWx1ZSwgZWxlbWVudCwgcGFyYW0gKSB7XHJcblxyXG5cdC8vIFNwbGl0IG1pbWUgb24gY29tbWFzIGluIGNhc2Ugd2UgaGF2ZSBtdWx0aXBsZSB0eXBlcyB3ZSBjYW4gYWNjZXB0XHJcblx0dmFyIHR5cGVQYXJhbSA9IHR5cGVvZiBwYXJhbSA9PT0gXCJzdHJpbmdcIiA/IHBhcmFtLnJlcGxhY2UoIC9cXHMvZywgXCJcIiApIDogXCJpbWFnZS8qXCIsXHJcblx0XHRvcHRpb25hbFZhbHVlID0gdGhpcy5vcHRpb25hbCggZWxlbWVudCApLFxyXG5cdFx0aSwgZmlsZSwgcmVnZXg7XHJcblxyXG5cdC8vIEVsZW1lbnQgaXMgb3B0aW9uYWxcclxuXHRpZiAoIG9wdGlvbmFsVmFsdWUgKSB7XHJcblx0XHRyZXR1cm4gb3B0aW9uYWxWYWx1ZTtcclxuXHR9XHJcblxyXG5cdGlmICggJCggZWxlbWVudCApLmF0dHIoIFwidHlwZVwiICkgPT09IFwiZmlsZVwiICkge1xyXG5cclxuXHRcdC8vIEVzY2FwZSBzdHJpbmcgdG8gYmUgdXNlZCBpbiB0aGUgcmVnZXhcclxuXHRcdC8vIHNlZTogaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMzQ0NjE3MC9lc2NhcGUtc3RyaW5nLWZvci11c2UtaW4tamF2YXNjcmlwdC1yZWdleFxyXG5cdFx0Ly8gRXNjYXBlIGFsc28gXCIvKlwiIGFzIFwiLy4qXCIgYXMgYSB3aWxkY2FyZFxyXG5cdFx0dHlwZVBhcmFtID0gdHlwZVBhcmFtXHJcblx0XHRcdFx0LnJlcGxhY2UoIC9bXFwtXFxbXFxdXFwvXFx7XFx9XFwoXFwpXFwrXFw/XFwuXFxcXFxcXlxcJFxcfF0vZywgXCJcXFxcJCZcIiApXHJcblx0XHRcdFx0LnJlcGxhY2UoIC8sL2csIFwifFwiIClcclxuXHRcdFx0XHQucmVwbGFjZSggL1xcL1xcKi9nLCBcIi8uKlwiICk7XHJcblxyXG5cdFx0Ly8gQ2hlY2sgaWYgdGhlIGVsZW1lbnQgaGFzIGEgRmlsZUxpc3QgYmVmb3JlIGNoZWNraW5nIGVhY2ggZmlsZVxyXG5cdFx0aWYgKCBlbGVtZW50LmZpbGVzICYmIGVsZW1lbnQuZmlsZXMubGVuZ3RoICkge1xyXG5cdFx0XHRyZWdleCA9IG5ldyBSZWdFeHAoIFwiLj8oXCIgKyB0eXBlUGFyYW0gKyBcIikkXCIsIFwiaVwiICk7XHJcblx0XHRcdGZvciAoIGkgPSAwOyBpIDwgZWxlbWVudC5maWxlcy5sZW5ndGg7IGkrKyApIHtcclxuXHRcdFx0XHRmaWxlID0gZWxlbWVudC5maWxlc1sgaSBdO1xyXG5cclxuXHRcdFx0XHQvLyBHcmFiIHRoZSBtaW1ldHlwZSBmcm9tIHRoZSBsb2FkZWQgZmlsZSwgdmVyaWZ5IGl0IG1hdGNoZXNcclxuXHRcdFx0XHRpZiAoICFmaWxlLnR5cGUubWF0Y2goIHJlZ2V4ICkgKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvLyBFaXRoZXIgcmV0dXJuIHRydWUgYmVjYXVzZSB3ZSd2ZSB2YWxpZGF0ZWQgZWFjaCBmaWxlLCBvciBiZWNhdXNlIHRoZVxyXG5cdC8vIGJyb3dzZXIgZG9lcyBub3Qgc3VwcG9ydCBlbGVtZW50LmZpbGVzIGFuZCB0aGUgRmlsZUxpc3QgZmVhdHVyZVxyXG5cdHJldHVybiB0cnVlO1xyXG59LCAkLnZhbGlkYXRvci5mb3JtYXQoIFwiUGxlYXNlIGVudGVyIGEgdmFsdWUgd2l0aCBhIHZhbGlkIG1pbWV0eXBlLlwiICkgKTtcclxuXHJcbiQudmFsaWRhdG9yLmFkZE1ldGhvZCggXCJhbHBoYW51bWVyaWNcIiwgZnVuY3Rpb24oIHZhbHVlLCBlbGVtZW50ICkge1xyXG5cdHJldHVybiB0aGlzLm9wdGlvbmFsKCBlbGVtZW50ICkgfHwgL15cXHcrJC9pLnRlc3QoIHZhbHVlICk7XHJcbn0sIFwiTGV0dGVycywgbnVtYmVycywgYW5kIHVuZGVyc2NvcmVzIG9ubHkgcGxlYXNlXCIgKTtcclxuXHJcbi8qXHJcbiAqIER1dGNoIGJhbmsgYWNjb3VudCBudW1iZXJzIChub3QgJ2dpcm8nIG51bWJlcnMpIGhhdmUgOSBkaWdpdHNcclxuICogYW5kIHBhc3MgdGhlICcxMSBjaGVjaycuXHJcbiAqIFdlIGFjY2VwdCB0aGUgbm90YXRpb24gd2l0aCBzcGFjZXMsIGFzIHRoYXQgaXMgY29tbW9uLlxyXG4gKiBhY2NlcHRhYmxlOiAxMjM0NTY3ODkgb3IgMTIgMzQgNTYgNzg5XHJcbiAqL1xyXG4kLnZhbGlkYXRvci5hZGRNZXRob2QoIFwiYmFua2FjY291bnROTFwiLCBmdW5jdGlvbiggdmFsdWUsIGVsZW1lbnQgKSB7XHJcblx0aWYgKCB0aGlzLm9wdGlvbmFsKCBlbGVtZW50ICkgKSB7XHJcblx0XHRyZXR1cm4gdHJ1ZTtcclxuXHR9XHJcblx0aWYgKCAhKCAvXlswLTldezl9fChbMC05XXsyfSApezN9WzAtOV17M30kLy50ZXN0KCB2YWx1ZSApICkgKSB7XHJcblx0XHRyZXR1cm4gZmFsc2U7XHJcblx0fVxyXG5cclxuXHQvLyBOb3cgJzExIGNoZWNrJ1xyXG5cdHZhciBhY2NvdW50ID0gdmFsdWUucmVwbGFjZSggLyAvZywgXCJcIiApLCAvLyBSZW1vdmUgc3BhY2VzXHJcblx0XHRzdW0gPSAwLFxyXG5cdFx0bGVuID0gYWNjb3VudC5sZW5ndGgsXHJcblx0XHRwb3MsIGZhY3RvciwgZGlnaXQ7XHJcblx0Zm9yICggcG9zID0gMDsgcG9zIDwgbGVuOyBwb3MrKyApIHtcclxuXHRcdGZhY3RvciA9IGxlbiAtIHBvcztcclxuXHRcdGRpZ2l0ID0gYWNjb3VudC5zdWJzdHJpbmcoIHBvcywgcG9zICsgMSApO1xyXG5cdFx0c3VtID0gc3VtICsgZmFjdG9yICogZGlnaXQ7XHJcblx0fVxyXG5cdHJldHVybiBzdW0gJSAxMSA9PT0gMDtcclxufSwgXCJQbGVhc2Ugc3BlY2lmeSBhIHZhbGlkIGJhbmsgYWNjb3VudCBudW1iZXJcIiApO1xyXG5cclxuJC52YWxpZGF0b3IuYWRkTWV0aG9kKCBcImJhbmtvcmdpcm9hY2NvdW50TkxcIiwgZnVuY3Rpb24oIHZhbHVlLCBlbGVtZW50ICkge1xyXG5cdHJldHVybiB0aGlzLm9wdGlvbmFsKCBlbGVtZW50ICkgfHxcclxuXHRcdFx0KCAkLnZhbGlkYXRvci5tZXRob2RzLmJhbmthY2NvdW50TkwuY2FsbCggdGhpcywgdmFsdWUsIGVsZW1lbnQgKSApIHx8XHJcblx0XHRcdCggJC52YWxpZGF0b3IubWV0aG9kcy5naXJvYWNjb3VudE5MLmNhbGwoIHRoaXMsIHZhbHVlLCBlbGVtZW50ICkgKTtcclxufSwgXCJQbGVhc2Ugc3BlY2lmeSBhIHZhbGlkIGJhbmsgb3IgZ2lybyBhY2NvdW50IG51bWJlclwiICk7XHJcblxyXG4vKipcclxuICogQklDIGlzIHRoZSBidXNpbmVzcyBpZGVudGlmaWVyIGNvZGUgKElTTyA5MzYyKS4gVGhpcyBCSUMgY2hlY2sgaXMgbm90IGEgZ3VhcmFudGVlIGZvciBhdXRoZW50aWNpdHkuXHJcbiAqXHJcbiAqIEJJQyBwYXR0ZXJuOiBCQkJCQ0NMTGJiYiAoOCBvciAxMSBjaGFyYWN0ZXJzIGxvbmc7IGJiYiBpcyBvcHRpb25hbClcclxuICpcclxuICogVmFsaWRhdGlvbiBpcyBjYXNlLWluc2Vuc2l0aXZlLiBQbGVhc2UgbWFrZSBzdXJlIHRvIG5vcm1hbGl6ZSBpbnB1dCB5b3Vyc2VsZi5cclxuICpcclxuICogQklDIGRlZmluaXRpb24gaW4gZGV0YWlsOlxyXG4gKiAtIEZpcnN0IDQgY2hhcmFjdGVycyAtIGJhbmsgY29kZSAob25seSBsZXR0ZXJzKVxyXG4gKiAtIE5leHQgMiBjaGFyYWN0ZXJzIC0gSVNPIDMxNjYtMSBhbHBoYS0yIGNvdW50cnkgY29kZSAob25seSBsZXR0ZXJzKVxyXG4gKiAtIE5leHQgMiBjaGFyYWN0ZXJzIC0gbG9jYXRpb24gY29kZSAobGV0dGVycyBhbmQgZGlnaXRzKVxyXG4gKiAgIGEuIHNoYWxsIG5vdCBzdGFydCB3aXRoICcwJyBvciAnMSdcclxuICogICBiLiBzZWNvbmQgY2hhcmFjdGVyIG11c3QgYmUgYSBsZXR0ZXIgKCdPJyBpcyBub3QgYWxsb3dlZCkgb3IgZGlnaXQgKCcwJyBmb3IgdGVzdCAodGhlcmVmb3JlIG5vdCBhbGxvd2VkKSwgJzEnIGRlbm90aW5nIHBhc3NpdmUgcGFydGljaXBhbnQsICcyJyB0eXBpY2FsbHkgcmV2ZXJzZS1iaWxsaW5nKVxyXG4gKiAtIExhc3QgMyBjaGFyYWN0ZXJzIC0gYnJhbmNoIGNvZGUsIG9wdGlvbmFsIChzaGFsbCBub3Qgc3RhcnQgd2l0aCAnWCcgZXhjZXB0IGluIGNhc2Ugb2YgJ1hYWCcgZm9yIHByaW1hcnkgb2ZmaWNlKSAobGV0dGVycyBhbmQgZGlnaXRzKVxyXG4gKi9cclxuJC52YWxpZGF0b3IuYWRkTWV0aG9kKCBcImJpY1wiLCBmdW5jdGlvbiggdmFsdWUsIGVsZW1lbnQgKSB7XHJcbiAgICByZXR1cm4gdGhpcy5vcHRpb25hbCggZWxlbWVudCApIHx8IC9eKFtBLVpdezZ9W0EtWjItOV1bQS1OUC1aMS05XSkoWHszfXxbQS1XWS1aMC05XVtBLVowLTldezJ9KT8kLy50ZXN0KCB2YWx1ZS50b1VwcGVyQ2FzZSgpICk7XHJcbn0sIFwiUGxlYXNlIHNwZWNpZnkgYSB2YWxpZCBCSUMgY29kZVwiICk7XHJcblxyXG4vKlxyXG4gKiBDw7NkaWdvIGRlIGlkZW50aWZpY2FjacOzbiBmaXNjYWwgKCBDSUYgKSBpcyB0aGUgdGF4IGlkZW50aWZpY2F0aW9uIGNvZGUgZm9yIFNwYW5pc2ggbGVnYWwgZW50aXRpZXNcclxuICogRnVydGhlciBydWxlcyBjYW4gYmUgZm91bmQgaW4gU3BhbmlzaCBvbiBodHRwOi8vZXMud2lraXBlZGlhLm9yZy93aWtpL0MlQzMlQjNkaWdvX2RlX2lkZW50aWZpY2FjaSVDMyVCM25fZmlzY2FsXHJcbiAqXHJcbiAqIFNwYW5pc2ggQ0lGIHN0cnVjdHVyZTpcclxuICpcclxuICogWyBUIF1bIFAgXVsgUCBdWyBOIF1bIE4gXVsgTiBdWyBOIF1bIE4gXVsgQyBdXHJcbiAqXHJcbiAqIFdoZXJlOlxyXG4gKlxyXG4gKiBUOiAxIGNoYXJhY3Rlci4gS2luZCBvZiBPcmdhbml6YXRpb24gTGV0dGVyOiBbQUJDREVGR0hKS0xNTlBRUlNVVlddXHJcbiAqIFA6IDIgY2hhcmFjdGVycy4gUHJvdmluY2UuXHJcbiAqIE46IDUgY2hhcmFjdGVycy4gU2VjdWVuY2lhbCBOdW1iZXIgd2l0aGluIHRoZSBwcm92aW5jZS5cclxuICogQzogMSBjaGFyYWN0ZXIuIENvbnRyb2wgRGlnaXQ6IFswLTlBLUpdLlxyXG4gKlxyXG4gKiBbIFQgXTogS2luZCBvZiBPcmdhbml6YXRpb25zLiBQb3NzaWJsZSB2YWx1ZXM6XHJcbiAqXHJcbiAqICAgQS4gQ29ycG9yYXRpb25zXHJcbiAqICAgQi4gTExDc1xyXG4gKiAgIEMuIEdlbmVyYWwgcGFydG5lcnNoaXBzXHJcbiAqICAgRC4gQ29tcGFuaWVzIGxpbWl0ZWQgcGFydG5lcnNoaXBzXHJcbiAqICAgRS4gQ29tbXVuaXRpZXMgb2YgZ29vZHNcclxuICogICBGLiBDb29wZXJhdGl2ZSBTb2NpZXRpZXNcclxuICogICBHLiBBc3NvY2lhdGlvbnNcclxuICogICBILiBDb21tdW5pdGllcyBvZiBob21lb3duZXJzIGluIGhvcml6b250YWwgcHJvcGVydHkgcmVnaW1lXHJcbiAqICAgSi4gQ2l2aWwgU29jaWV0aWVzXHJcbiAqICAgSy4gT2xkIGZvcm1hdFxyXG4gKiAgIEwuIE9sZCBmb3JtYXRcclxuICogICBNLiBPbGQgZm9ybWF0XHJcbiAqICAgTi4gTm9ucmVzaWRlbnQgZW50aXRpZXNcclxuICogICBQLiBMb2NhbCBhdXRob3JpdGllc1xyXG4gKiAgIFEuIEF1dG9ub21vdXMgYm9kaWVzLCBzdGF0ZSBvciBub3QsIGFuZCB0aGUgbGlrZSwgYW5kIGNvbmdyZWdhdGlvbnMgYW5kIHJlbGlnaW91cyBpbnN0aXR1dGlvbnNcclxuICogICBSLiBDb25ncmVnYXRpb25zIGFuZCByZWxpZ2lvdXMgaW5zdGl0dXRpb25zIChzaW5jZSAyMDA4IE9SREVSIEVIQS80NTEvMjAwOClcclxuICogICBTLiBPcmdhbnMgb2YgU3RhdGUgQWRtaW5pc3RyYXRpb24gYW5kIHJlZ2lvbnNcclxuICogICBWLiBBZ3JhcmlhbiBUcmFuc2Zvcm1hdGlvblxyXG4gKiAgIFcuIFBlcm1hbmVudCBlc3RhYmxpc2htZW50cyBvZiBub24tcmVzaWRlbnQgaW4gU3BhaW5cclxuICpcclxuICogWyBDIF06IENvbnRyb2wgRGlnaXQuIEl0IGNhbiBiZSBhIG51bWJlciBvciBhIGxldHRlciBkZXBlbmRpbmcgb24gVCB2YWx1ZTpcclxuICogWyBUIF0gIC0tPiAgWyBDIF1cclxuICogLS0tLS0tICAgIC0tLS0tLS0tLS1cclxuICogICBBICAgICAgICAgTnVtYmVyXHJcbiAqICAgQiAgICAgICAgIE51bWJlclxyXG4gKiAgIEUgICAgICAgICBOdW1iZXJcclxuICogICBIICAgICAgICAgTnVtYmVyXHJcbiAqICAgSyAgICAgICAgIExldHRlclxyXG4gKiAgIFAgICAgICAgICBMZXR0ZXJcclxuICogICBRICAgICAgICAgTGV0dGVyXHJcbiAqICAgUyAgICAgICAgIExldHRlclxyXG4gKlxyXG4gKi9cclxuJC52YWxpZGF0b3IuYWRkTWV0aG9kKCBcImNpZkVTXCIsIGZ1bmN0aW9uKCB2YWx1ZSwgZWxlbWVudCApIHtcclxuXHRcInVzZSBzdHJpY3RcIjtcclxuXHJcblx0aWYgKCB0aGlzLm9wdGlvbmFsKCBlbGVtZW50ICkgKSB7XHJcblx0XHRyZXR1cm4gdHJ1ZTtcclxuXHR9XHJcblxyXG5cdHZhciBjaWZSZWdFeCA9IG5ldyBSZWdFeHAoIC9eKFtBQkNERUZHSEpLTE1OUFFSU1VWV10pKFxcZHs3fSkoWzAtOUEtSl0pJC9naSApO1xyXG5cdHZhciBsZXR0ZXIgID0gdmFsdWUuc3Vic3RyaW5nKCAwLCAxICksIC8vIFsgVCBdXHJcblx0XHRudW1iZXIgID0gdmFsdWUuc3Vic3RyaW5nKCAxLCA4ICksIC8vIFsgUCBdWyBQIF1bIE4gXVsgTiBdWyBOIF1bIE4gXVsgTiBdXHJcblx0XHRjb250cm9sID0gdmFsdWUuc3Vic3RyaW5nKCA4LCA5ICksIC8vIFsgQyBdXHJcblx0XHRhbGxfc3VtID0gMCxcclxuXHRcdGV2ZW5fc3VtID0gMCxcclxuXHRcdG9kZF9zdW0gPSAwLFxyXG5cdFx0aSwgbixcclxuXHRcdGNvbnRyb2xfZGlnaXQsXHJcblx0XHRjb250cm9sX2xldHRlcjtcclxuXHJcblx0ZnVuY3Rpb24gaXNPZGQoIG4gKSB7XHJcblx0XHRyZXR1cm4gbiAlIDIgPT09IDA7XHJcblx0fVxyXG5cclxuXHQvLyBRdWljayBmb3JtYXQgdGVzdFxyXG5cdGlmICggdmFsdWUubGVuZ3RoICE9PSA5IHx8ICFjaWZSZWdFeC50ZXN0KCB2YWx1ZSApICkge1xyXG5cdFx0cmV0dXJuIGZhbHNlO1xyXG5cdH1cclxuXHJcblx0Zm9yICggaSA9IDA7IGkgPCBudW1iZXIubGVuZ3RoOyBpKysgKSB7XHJcblx0XHRuID0gcGFyc2VJbnQoIG51bWJlclsgaSBdLCAxMCApO1xyXG5cclxuXHRcdC8vIE9kZCBwb3NpdGlvbnNcclxuXHRcdGlmICggaXNPZGQoIGkgKSApIHtcclxuXHJcblx0XHRcdC8vIE9kZCBwb3NpdGlvbnMgYXJlIG11bHRpcGxpZWQgZmlyc3QuXHJcblx0XHRcdG4gKj0gMjtcclxuXHJcblx0XHRcdC8vIElmIHRoZSBtdWx0aXBsaWNhdGlvbiBpcyBiaWdnZXIgdGhhbiAxMCB3ZSBuZWVkIHRvIGFkanVzdFxyXG5cdFx0XHRvZGRfc3VtICs9IG4gPCAxMCA/IG4gOiBuIC0gOTtcclxuXHJcblx0XHQvLyBFdmVuIHBvc2l0aW9uc1xyXG5cdFx0Ly8gSnVzdCBzdW0gdGhlbVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0ZXZlbl9zdW0gKz0gbjtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGFsbF9zdW0gPSBldmVuX3N1bSArIG9kZF9zdW07XHJcblx0Y29udHJvbF9kaWdpdCA9ICggMTAgLSAoIGFsbF9zdW0gKS50b1N0cmluZygpLnN1YnN0ciggLTEgKSApLnRvU3RyaW5nKCk7XHJcblx0Y29udHJvbF9kaWdpdCA9IHBhcnNlSW50KCBjb250cm9sX2RpZ2l0LCAxMCApID4gOSA/IFwiMFwiIDogY29udHJvbF9kaWdpdDtcclxuXHRjb250cm9sX2xldHRlciA9IFwiSkFCQ0RFRkdISVwiLnN1YnN0ciggY29udHJvbF9kaWdpdCwgMSApLnRvU3RyaW5nKCk7XHJcblxyXG5cdC8vIENvbnRyb2wgbXVzdCBiZSBhIGRpZ2l0XHJcblx0aWYgKCBsZXR0ZXIubWF0Y2goIC9bQUJFSF0vICkgKSB7XHJcblx0XHRyZXR1cm4gY29udHJvbCA9PT0gY29udHJvbF9kaWdpdDtcclxuXHJcblx0Ly8gQ29udHJvbCBtdXN0IGJlIGEgbGV0dGVyXHJcblx0fSBlbHNlIGlmICggbGV0dGVyLm1hdGNoKCAvW0tQUVNdLyApICkge1xyXG5cdFx0cmV0dXJuIGNvbnRyb2wgPT09IGNvbnRyb2xfbGV0dGVyO1xyXG5cdH1cclxuXHJcblx0Ly8gQ2FuIGJlIGVpdGhlclxyXG5cdHJldHVybiBjb250cm9sID09PSBjb250cm9sX2RpZ2l0IHx8IGNvbnRyb2wgPT09IGNvbnRyb2xfbGV0dGVyO1xyXG5cclxufSwgXCJQbGVhc2Ugc3BlY2lmeSBhIHZhbGlkIENJRiBudW1iZXIuXCIgKTtcclxuXHJcbi8qXHJcbiAqIEJyYXppbGxpYW4gQ1BGIG51bWJlciAoQ2FkYXN0cmFkbyBkZSBQZXNzb2FzIEbDrXNpY2FzKSBpcyB0aGUgZXF1aXZhbGVudCBvZiBhIEJyYXppbGlhbiB0YXggcmVnaXN0cmF0aW9uIG51bWJlci5cclxuICogQ1BGIG51bWJlcnMgaGF2ZSAxMSBkaWdpdHMgaW4gdG90YWw6IDkgbnVtYmVycyBmb2xsb3dlZCBieSAyIGNoZWNrIG51bWJlcnMgdGhhdCBhcmUgYmVpbmcgdXNlZCBmb3IgdmFsaWRhdGlvbi5cclxuICovXHJcbiQudmFsaWRhdG9yLmFkZE1ldGhvZCggXCJjcGZCUlwiLCBmdW5jdGlvbiggdmFsdWUgKSB7XHJcblxyXG5cdC8vIFJlbW92aW5nIHNwZWNpYWwgY2hhcmFjdGVycyBmcm9tIHZhbHVlXHJcblx0dmFsdWUgPSB2YWx1ZS5yZXBsYWNlKCAvKFt+IUAjJCVeJiooKV8rPWB7fVxcW1xcXVxcLXxcXFxcOjsnPD4sLlxcLz8gXSkrL2csIFwiXCIgKTtcclxuXHJcblx0Ly8gQ2hlY2tpbmcgdmFsdWUgdG8gaGF2ZSAxMSBkaWdpdHMgb25seVxyXG5cdGlmICggdmFsdWUubGVuZ3RoICE9PSAxMSApIHtcclxuXHRcdHJldHVybiBmYWxzZTtcclxuXHR9XHJcblxyXG5cdHZhciBzdW0gPSAwLFxyXG5cdFx0Zmlyc3RDTiwgc2Vjb25kQ04sIGNoZWNrUmVzdWx0LCBpO1xyXG5cclxuXHRmaXJzdENOID0gcGFyc2VJbnQoIHZhbHVlLnN1YnN0cmluZyggOSwgMTAgKSwgMTAgKTtcclxuXHRzZWNvbmRDTiA9IHBhcnNlSW50KCB2YWx1ZS5zdWJzdHJpbmcoIDEwLCAxMSApLCAxMCApO1xyXG5cclxuXHRjaGVja1Jlc3VsdCA9IGZ1bmN0aW9uKCBzdW0sIGNuICkge1xyXG5cdFx0dmFyIHJlc3VsdCA9ICggc3VtICogMTAgKSAlIDExO1xyXG5cdFx0aWYgKCAoIHJlc3VsdCA9PT0gMTAgKSB8fCAoIHJlc3VsdCA9PT0gMTEgKSApIHtcclxuXHRcdFx0cmVzdWx0ID0gMDtcclxuXHRcdH1cclxuXHRcdHJldHVybiAoIHJlc3VsdCA9PT0gY24gKTtcclxuXHR9O1xyXG5cclxuXHQvLyBDaGVja2luZyBmb3IgZHVtcCBkYXRhXHJcblx0aWYgKCB2YWx1ZSA9PT0gXCJcIiB8fFxyXG5cdFx0dmFsdWUgPT09IFwiMDAwMDAwMDAwMDBcIiB8fFxyXG5cdFx0dmFsdWUgPT09IFwiMTExMTExMTExMTFcIiB8fFxyXG5cdFx0dmFsdWUgPT09IFwiMjIyMjIyMjIyMjJcIiB8fFxyXG5cdFx0dmFsdWUgPT09IFwiMzMzMzMzMzMzMzNcIiB8fFxyXG5cdFx0dmFsdWUgPT09IFwiNDQ0NDQ0NDQ0NDRcIiB8fFxyXG5cdFx0dmFsdWUgPT09IFwiNTU1NTU1NTU1NTVcIiB8fFxyXG5cdFx0dmFsdWUgPT09IFwiNjY2NjY2NjY2NjZcIiB8fFxyXG5cdFx0dmFsdWUgPT09IFwiNzc3Nzc3Nzc3NzdcIiB8fFxyXG5cdFx0dmFsdWUgPT09IFwiODg4ODg4ODg4ODhcIiB8fFxyXG5cdFx0dmFsdWUgPT09IFwiOTk5OTk5OTk5OTlcIlxyXG5cdCkge1xyXG5cdFx0cmV0dXJuIGZhbHNlO1xyXG5cdH1cclxuXHJcblx0Ly8gU3RlcCAxIC0gdXNpbmcgZmlyc3QgQ2hlY2sgTnVtYmVyOlxyXG5cdGZvciAoIGkgPSAxOyBpIDw9IDk7IGkrKyApIHtcclxuXHRcdHN1bSA9IHN1bSArIHBhcnNlSW50KCB2YWx1ZS5zdWJzdHJpbmcoIGkgLSAxLCBpICksIDEwICkgKiAoIDExIC0gaSApO1xyXG5cdH1cclxuXHJcblx0Ly8gSWYgZmlyc3QgQ2hlY2sgTnVtYmVyIChDTikgaXMgdmFsaWQsIG1vdmUgdG8gU3RlcCAyIC0gdXNpbmcgc2Vjb25kIENoZWNrIE51bWJlcjpcclxuXHRpZiAoIGNoZWNrUmVzdWx0KCBzdW0sIGZpcnN0Q04gKSApIHtcclxuXHRcdHN1bSA9IDA7XHJcblx0XHRmb3IgKCBpID0gMTsgaSA8PSAxMDsgaSsrICkge1xyXG5cdFx0XHRzdW0gPSBzdW0gKyBwYXJzZUludCggdmFsdWUuc3Vic3RyaW5nKCBpIC0gMSwgaSApLCAxMCApICogKCAxMiAtIGkgKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiBjaGVja1Jlc3VsdCggc3VtLCBzZWNvbmRDTiApO1xyXG5cdH1cclxuXHRyZXR1cm4gZmFsc2U7XHJcblxyXG59LCBcIlBsZWFzZSBzcGVjaWZ5IGEgdmFsaWQgQ1BGIG51bWJlclwiICk7XHJcblxyXG4vLyBodHRwczovL2pxdWVyeXZhbGlkYXRpb24ub3JnL2NyZWRpdGNhcmQtbWV0aG9kL1xyXG4vLyBiYXNlZCBvbiBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9MdWhuX2FsZ29yaXRobVxyXG4kLnZhbGlkYXRvci5hZGRNZXRob2QoIFwiY3JlZGl0Y2FyZFwiLCBmdW5jdGlvbiggdmFsdWUsIGVsZW1lbnQgKSB7XHJcblx0aWYgKCB0aGlzLm9wdGlvbmFsKCBlbGVtZW50ICkgKSB7XHJcblx0XHRyZXR1cm4gXCJkZXBlbmRlbmN5LW1pc21hdGNoXCI7XHJcblx0fVxyXG5cclxuXHQvLyBBY2NlcHQgb25seSBzcGFjZXMsIGRpZ2l0cyBhbmQgZGFzaGVzXHJcblx0aWYgKCAvW14wLTkgXFwtXSsvLnRlc3QoIHZhbHVlICkgKSB7XHJcblx0XHRyZXR1cm4gZmFsc2U7XHJcblx0fVxyXG5cclxuXHR2YXIgbkNoZWNrID0gMCxcclxuXHRcdG5EaWdpdCA9IDAsXHJcblx0XHRiRXZlbiA9IGZhbHNlLFxyXG5cdFx0biwgY0RpZ2l0O1xyXG5cclxuXHR2YWx1ZSA9IHZhbHVlLnJlcGxhY2UoIC9cXEQvZywgXCJcIiApO1xyXG5cclxuXHQvLyBCYXNpbmcgbWluIGFuZCBtYXggbGVuZ3RoIG9uXHJcblx0Ly8gaHR0cHM6Ly9kZXZlbG9wZXIuZWFuLmNvbS9nZW5lcmFsX2luZm8vVmFsaWRfQ3JlZGl0X0NhcmRfVHlwZXNcclxuXHRpZiAoIHZhbHVlLmxlbmd0aCA8IDEzIHx8IHZhbHVlLmxlbmd0aCA+IDE5ICkge1xyXG5cdFx0cmV0dXJuIGZhbHNlO1xyXG5cdH1cclxuXHJcblx0Zm9yICggbiA9IHZhbHVlLmxlbmd0aCAtIDE7IG4gPj0gMDsgbi0tICkge1xyXG5cdFx0Y0RpZ2l0ID0gdmFsdWUuY2hhckF0KCBuICk7XHJcblx0XHRuRGlnaXQgPSBwYXJzZUludCggY0RpZ2l0LCAxMCApO1xyXG5cdFx0aWYgKCBiRXZlbiApIHtcclxuXHRcdFx0aWYgKCAoIG5EaWdpdCAqPSAyICkgPiA5ICkge1xyXG5cdFx0XHRcdG5EaWdpdCAtPSA5O1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0bkNoZWNrICs9IG5EaWdpdDtcclxuXHRcdGJFdmVuID0gIWJFdmVuO1xyXG5cdH1cclxuXHJcblx0cmV0dXJuICggbkNoZWNrICUgMTAgKSA9PT0gMDtcclxufSwgXCJQbGVhc2UgZW50ZXIgYSB2YWxpZCBjcmVkaXQgY2FyZCBudW1iZXIuXCIgKTtcclxuXHJcbi8qIE5PVElDRTogTW9kaWZpZWQgdmVyc2lvbiBvZiBDYXN0bGUuQ29tcG9uZW50cy5WYWxpZGF0b3IuQ3JlZGl0Q2FyZFZhbGlkYXRvclxyXG4gKiBSZWRpc3RyaWJ1dGVkIHVuZGVyIHRoZSB0aGUgQXBhY2hlIExpY2Vuc2UgMi4wIGF0IGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxyXG4gKiBWYWxpZCBUeXBlczogbWFzdGVyY2FyZCwgdmlzYSwgYW1leCwgZGluZXJzY2x1YiwgZW5yb3V0ZSwgZGlzY292ZXIsIGpjYiwgdW5rbm93biwgYWxsIChvdmVycmlkZXMgYWxsIG90aGVyIHNldHRpbmdzKVxyXG4gKi9cclxuJC52YWxpZGF0b3IuYWRkTWV0aG9kKCBcImNyZWRpdGNhcmR0eXBlc1wiLCBmdW5jdGlvbiggdmFsdWUsIGVsZW1lbnQsIHBhcmFtICkge1xyXG5cdGlmICggL1teMC05XFwtXSsvLnRlc3QoIHZhbHVlICkgKSB7XHJcblx0XHRyZXR1cm4gZmFsc2U7XHJcblx0fVxyXG5cclxuXHR2YWx1ZSA9IHZhbHVlLnJlcGxhY2UoIC9cXEQvZywgXCJcIiApO1xyXG5cclxuXHR2YXIgdmFsaWRUeXBlcyA9IDB4MDAwMDtcclxuXHJcblx0aWYgKCBwYXJhbS5tYXN0ZXJjYXJkICkge1xyXG5cdFx0dmFsaWRUeXBlcyB8PSAweDAwMDE7XHJcblx0fVxyXG5cdGlmICggcGFyYW0udmlzYSApIHtcclxuXHRcdHZhbGlkVHlwZXMgfD0gMHgwMDAyO1xyXG5cdH1cclxuXHRpZiAoIHBhcmFtLmFtZXggKSB7XHJcblx0XHR2YWxpZFR5cGVzIHw9IDB4MDAwNDtcclxuXHR9XHJcblx0aWYgKCBwYXJhbS5kaW5lcnNjbHViICkge1xyXG5cdFx0dmFsaWRUeXBlcyB8PSAweDAwMDg7XHJcblx0fVxyXG5cdGlmICggcGFyYW0uZW5yb3V0ZSApIHtcclxuXHRcdHZhbGlkVHlwZXMgfD0gMHgwMDEwO1xyXG5cdH1cclxuXHRpZiAoIHBhcmFtLmRpc2NvdmVyICkge1xyXG5cdFx0dmFsaWRUeXBlcyB8PSAweDAwMjA7XHJcblx0fVxyXG5cdGlmICggcGFyYW0uamNiICkge1xyXG5cdFx0dmFsaWRUeXBlcyB8PSAweDAwNDA7XHJcblx0fVxyXG5cdGlmICggcGFyYW0udW5rbm93biApIHtcclxuXHRcdHZhbGlkVHlwZXMgfD0gMHgwMDgwO1xyXG5cdH1cclxuXHRpZiAoIHBhcmFtLmFsbCApIHtcclxuXHRcdHZhbGlkVHlwZXMgPSAweDAwMDEgfCAweDAwMDIgfCAweDAwMDQgfCAweDAwMDggfCAweDAwMTAgfCAweDAwMjAgfCAweDAwNDAgfCAweDAwODA7XHJcblx0fVxyXG5cdGlmICggdmFsaWRUeXBlcyAmIDB4MDAwMSAmJiAvXig1WzEyMzQ1XSkvLnRlc3QoIHZhbHVlICkgKSB7IC8vIE1hc3RlcmNhcmRcclxuXHRcdHJldHVybiB2YWx1ZS5sZW5ndGggPT09IDE2O1xyXG5cdH1cclxuXHRpZiAoIHZhbGlkVHlwZXMgJiAweDAwMDIgJiYgL14oNCkvLnRlc3QoIHZhbHVlICkgKSB7IC8vIFZpc2FcclxuXHRcdHJldHVybiB2YWx1ZS5sZW5ndGggPT09IDE2O1xyXG5cdH1cclxuXHRpZiAoIHZhbGlkVHlwZXMgJiAweDAwMDQgJiYgL14oM1s0N10pLy50ZXN0KCB2YWx1ZSApICkgeyAvLyBBbWV4XHJcblx0XHRyZXR1cm4gdmFsdWUubGVuZ3RoID09PSAxNTtcclxuXHR9XHJcblx0aWYgKCB2YWxpZFR5cGVzICYgMHgwMDA4ICYmIC9eKDMoMFswMTIzNDVdfFs2OF0pKS8udGVzdCggdmFsdWUgKSApIHsgLy8gRGluZXJzY2x1YlxyXG5cdFx0cmV0dXJuIHZhbHVlLmxlbmd0aCA9PT0gMTQ7XHJcblx0fVxyXG5cdGlmICggdmFsaWRUeXBlcyAmIDB4MDAxMCAmJiAvXigyKDAxNHwxNDkpKS8udGVzdCggdmFsdWUgKSApIHsgLy8gRW5yb3V0ZVxyXG5cdFx0cmV0dXJuIHZhbHVlLmxlbmd0aCA9PT0gMTU7XHJcblx0fVxyXG5cdGlmICggdmFsaWRUeXBlcyAmIDB4MDAyMCAmJiAvXig2MDExKS8udGVzdCggdmFsdWUgKSApIHsgLy8gRGlzY292ZXJcclxuXHRcdHJldHVybiB2YWx1ZS5sZW5ndGggPT09IDE2O1xyXG5cdH1cclxuXHRpZiAoIHZhbGlkVHlwZXMgJiAweDAwNDAgJiYgL14oMykvLnRlc3QoIHZhbHVlICkgKSB7IC8vIEpjYlxyXG5cdFx0cmV0dXJuIHZhbHVlLmxlbmd0aCA9PT0gMTY7XHJcblx0fVxyXG5cdGlmICggdmFsaWRUeXBlcyAmIDB4MDA0MCAmJiAvXigyMTMxfDE4MDApLy50ZXN0KCB2YWx1ZSApICkgeyAvLyBKY2JcclxuXHRcdHJldHVybiB2YWx1ZS5sZW5ndGggPT09IDE1O1xyXG5cdH1cclxuXHRpZiAoIHZhbGlkVHlwZXMgJiAweDAwODAgKSB7IC8vIFVua25vd25cclxuXHRcdHJldHVybiB0cnVlO1xyXG5cdH1cclxuXHRyZXR1cm4gZmFsc2U7XHJcbn0sIFwiUGxlYXNlIGVudGVyIGEgdmFsaWQgY3JlZGl0IGNhcmQgbnVtYmVyLlwiICk7XHJcblxyXG4vKipcclxuICogVmFsaWRhdGVzIGN1cnJlbmNpZXMgd2l0aCBhbnkgZ2l2ZW4gc3ltYm9scyBieSBAamFtZXNsb3VpelxyXG4gKiBTeW1ib2xzIGNhbiBiZSBvcHRpb25hbCBvciByZXF1aXJlZC4gU3ltYm9scyByZXF1aXJlZCBieSBkZWZhdWx0XHJcbiAqXHJcbiAqIFVzYWdlIGV4YW1wbGVzOlxyXG4gKiAgY3VycmVuY3k6IFtcIsKjXCIsIGZhbHNlXSAtIFVzZSBmYWxzZSBmb3Igc29mdCBjdXJyZW5jeSB2YWxpZGF0aW9uXHJcbiAqICBjdXJyZW5jeTogW1wiJFwiLCBmYWxzZV1cclxuICogIGN1cnJlbmN5OiBbXCJSTVwiLCBmYWxzZV0gLSBhbHNvIHdvcmtzIHdpdGggdGV4dCBiYXNlZCBzeW1ib2xzIHN1Y2ggYXMgXCJSTVwiIC0gTWFsYXlzaWEgUmluZ2dpdCBldGNcclxuICpcclxuICogIDxpbnB1dCBjbGFzcz1cImN1cnJlbmN5SW5wdXRcIiBuYW1lPVwiY3VycmVuY3lJbnB1dFwiPlxyXG4gKlxyXG4gKiBTb2Z0IHN5bWJvbCBjaGVja2luZ1xyXG4gKiAgY3VycmVuY3lJbnB1dDoge1xyXG4gKiAgICAgY3VycmVuY3k6IFtcIiRcIiwgZmFsc2VdXHJcbiAqICB9XHJcbiAqXHJcbiAqIFN0cmljdCBzeW1ib2wgY2hlY2tpbmcgKGRlZmF1bHQpXHJcbiAqICBjdXJyZW5jeUlucHV0OiB7XHJcbiAqICAgICBjdXJyZW5jeTogXCIkXCJcclxuICogICAgIC8vT1JcclxuICogICAgIGN1cnJlbmN5OiBbXCIkXCIsIHRydWVdXHJcbiAqICB9XHJcbiAqXHJcbiAqIE11bHRpcGxlIFN5bWJvbHNcclxuICogIGN1cnJlbmN5SW5wdXQ6IHtcclxuICogICAgIGN1cnJlbmN5OiBcIiQswqMswqJcIlxyXG4gKiAgfVxyXG4gKi9cclxuJC52YWxpZGF0b3IuYWRkTWV0aG9kKCBcImN1cnJlbmN5XCIsIGZ1bmN0aW9uKCB2YWx1ZSwgZWxlbWVudCwgcGFyYW0gKSB7XHJcbiAgICB2YXIgaXNQYXJhbVN0cmluZyA9IHR5cGVvZiBwYXJhbSA9PT0gXCJzdHJpbmdcIixcclxuICAgICAgICBzeW1ib2wgPSBpc1BhcmFtU3RyaW5nID8gcGFyYW0gOiBwYXJhbVsgMCBdLFxyXG4gICAgICAgIHNvZnQgPSBpc1BhcmFtU3RyaW5nID8gdHJ1ZSA6IHBhcmFtWyAxIF0sXHJcbiAgICAgICAgcmVnZXg7XHJcblxyXG4gICAgc3ltYm9sID0gc3ltYm9sLnJlcGxhY2UoIC8sL2csIFwiXCIgKTtcclxuICAgIHN5bWJvbCA9IHNvZnQgPyBzeW1ib2wgKyBcIl1cIiA6IHN5bWJvbCArIFwiXT9cIjtcclxuICAgIHJlZ2V4ID0gXCJeW1wiICsgc3ltYm9sICsgXCIoWzEtOV17MX1bMC05XXswLDJ9KFxcXFwsWzAtOV17M30pKihcXFxcLlswLTldezAsMn0pP3xbMS05XXsxfVswLTldezAsfShcXFxcLlswLTldezAsMn0pP3wwKFxcXFwuWzAtOV17MCwyfSk/fChcXFxcLlswLTldezEsMn0pPykkXCI7XHJcbiAgICByZWdleCA9IG5ldyBSZWdFeHAoIHJlZ2V4ICk7XHJcbiAgICByZXR1cm4gdGhpcy5vcHRpb25hbCggZWxlbWVudCApIHx8IHJlZ2V4LnRlc3QoIHZhbHVlICk7XHJcblxyXG59LCBcIlBsZWFzZSBzcGVjaWZ5IGEgdmFsaWQgY3VycmVuY3lcIiApO1xyXG5cclxuJC52YWxpZGF0b3IuYWRkTWV0aG9kKCBcImRhdGVGQVwiLCBmdW5jdGlvbiggdmFsdWUsIGVsZW1lbnQgKSB7XHJcblx0cmV0dXJuIHRoaXMub3B0aW9uYWwoIGVsZW1lbnQgKSB8fCAvXlsxLTRdXFxkezN9XFwvKCgwP1sxLTZdXFwvKCgzWzAtMV0pfChbMS0yXVswLTldKXwoMD9bMS05XSkpKXwoKDFbMC0yXXwoMD9bNy05XSkpXFwvKDMwfChbMS0yXVswLTldKXwoMD9bMS05XSkpKSkkLy50ZXN0KCB2YWx1ZSApO1xyXG59LCAkLnZhbGlkYXRvci5tZXNzYWdlcy5kYXRlICk7XHJcblxyXG4vKipcclxuICogUmV0dXJuIHRydWUsIGlmIHRoZSB2YWx1ZSBpcyBhIHZhbGlkIGRhdGUsIGFsc28gbWFraW5nIHRoaXMgZm9ybWFsIGNoZWNrIGRkL21tL3l5eXkuXHJcbiAqXHJcbiAqIEBleGFtcGxlICQudmFsaWRhdG9yLm1ldGhvZHMuZGF0ZShcIjAxLzAxLzE5MDBcIilcclxuICogQHJlc3VsdCB0cnVlXHJcbiAqXHJcbiAqIEBleGFtcGxlICQudmFsaWRhdG9yLm1ldGhvZHMuZGF0ZShcIjAxLzEzLzE5OTBcIilcclxuICogQHJlc3VsdCBmYWxzZVxyXG4gKlxyXG4gKiBAZXhhbXBsZSAkLnZhbGlkYXRvci5tZXRob2RzLmRhdGUoXCIwMS4wMS4xOTAwXCIpXHJcbiAqIEByZXN1bHQgZmFsc2VcclxuICpcclxuICogQGV4YW1wbGUgPGlucHV0IG5hbWU9XCJwaXBwb1wiIGNsYXNzPVwie2RhdGVJVEE6dHJ1ZX1cIiAvPlxyXG4gKiBAZGVzYyBEZWNsYXJlcyBhbiBvcHRpb25hbCBpbnB1dCBlbGVtZW50IHdob3NlIHZhbHVlIG11c3QgYmUgYSB2YWxpZCBkYXRlLlxyXG4gKlxyXG4gKiBAbmFtZSAkLnZhbGlkYXRvci5tZXRob2RzLmRhdGVJVEFcclxuICogQHR5cGUgQm9vbGVhblxyXG4gKiBAY2F0IFBsdWdpbnMvVmFsaWRhdGUvTWV0aG9kc1xyXG4gKi9cclxuJC52YWxpZGF0b3IuYWRkTWV0aG9kKCBcImRhdGVJVEFcIiwgZnVuY3Rpb24oIHZhbHVlLCBlbGVtZW50ICkge1xyXG5cdHZhciBjaGVjayA9IGZhbHNlLFxyXG5cdFx0cmUgPSAvXlxcZHsxLDJ9XFwvXFxkezEsMn1cXC9cXGR7NH0kLyxcclxuXHRcdGFkYXRhLCBnZywgbW0sIGFhYWEsIHhkYXRhO1xyXG5cdGlmICggcmUudGVzdCggdmFsdWUgKSApIHtcclxuXHRcdGFkYXRhID0gdmFsdWUuc3BsaXQoIFwiL1wiICk7XHJcblx0XHRnZyA9IHBhcnNlSW50KCBhZGF0YVsgMCBdLCAxMCApO1xyXG5cdFx0bW0gPSBwYXJzZUludCggYWRhdGFbIDEgXSwgMTAgKTtcclxuXHRcdGFhYWEgPSBwYXJzZUludCggYWRhdGFbIDIgXSwgMTAgKTtcclxuXHRcdHhkYXRhID0gbmV3IERhdGUoIERhdGUuVVRDKCBhYWFhLCBtbSAtIDEsIGdnLCAxMiwgMCwgMCwgMCApICk7XHJcblx0XHRpZiAoICggeGRhdGEuZ2V0VVRDRnVsbFllYXIoKSA9PT0gYWFhYSApICYmICggeGRhdGEuZ2V0VVRDTW9udGgoKSA9PT0gbW0gLSAxICkgJiYgKCB4ZGF0YS5nZXRVVENEYXRlKCkgPT09IGdnICkgKSB7XHJcblx0XHRcdGNoZWNrID0gdHJ1ZTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGNoZWNrID0gZmFsc2U7XHJcblx0XHR9XHJcblx0fSBlbHNlIHtcclxuXHRcdGNoZWNrID0gZmFsc2U7XHJcblx0fVxyXG5cdHJldHVybiB0aGlzLm9wdGlvbmFsKCBlbGVtZW50ICkgfHwgY2hlY2s7XHJcbn0sICQudmFsaWRhdG9yLm1lc3NhZ2VzLmRhdGUgKTtcclxuXHJcbiQudmFsaWRhdG9yLmFkZE1ldGhvZCggXCJkYXRlTkxcIiwgZnVuY3Rpb24oIHZhbHVlLCBlbGVtZW50ICkge1xyXG5cdHJldHVybiB0aGlzLm9wdGlvbmFsKCBlbGVtZW50ICkgfHwgL14oMD9bMS05XXxbMTJdXFxkfDNbMDFdKVtcXC5cXC9cXC1dKDA/WzEtOV18MVswMTJdKVtcXC5cXC9cXC1dKFsxMl1cXGQpPyhcXGRcXGQpJC8udGVzdCggdmFsdWUgKTtcclxufSwgJC52YWxpZGF0b3IubWVzc2FnZXMuZGF0ZSApO1xyXG5cclxuLy8gT2xkZXIgXCJhY2NlcHRcIiBmaWxlIGV4dGVuc2lvbiBtZXRob2QuIE9sZCBkb2NzOiBodHRwOi8vZG9jcy5qcXVlcnkuY29tL1BsdWdpbnMvVmFsaWRhdGlvbi9NZXRob2RzL2FjY2VwdFxyXG4kLnZhbGlkYXRvci5hZGRNZXRob2QoIFwiZXh0ZW5zaW9uXCIsIGZ1bmN0aW9uKCB2YWx1ZSwgZWxlbWVudCwgcGFyYW0gKSB7XHJcblx0cGFyYW0gPSB0eXBlb2YgcGFyYW0gPT09IFwic3RyaW5nXCIgPyBwYXJhbS5yZXBsYWNlKCAvLC9nLCBcInxcIiApIDogXCJwbmd8anBlP2d8Z2lmXCI7XHJcblx0cmV0dXJuIHRoaXMub3B0aW9uYWwoIGVsZW1lbnQgKSB8fCB2YWx1ZS5tYXRjaCggbmV3IFJlZ0V4cCggXCJcXFxcLihcIiArIHBhcmFtICsgXCIpJFwiLCBcImlcIiApICk7XHJcbn0sICQudmFsaWRhdG9yLmZvcm1hdCggXCJQbGVhc2UgZW50ZXIgYSB2YWx1ZSB3aXRoIGEgdmFsaWQgZXh0ZW5zaW9uLlwiICkgKTtcclxuXHJcbi8qKlxyXG4gKiBEdXRjaCBnaXJvIGFjY291bnQgbnVtYmVycyAobm90IGJhbmsgbnVtYmVycykgaGF2ZSBtYXggNyBkaWdpdHNcclxuICovXHJcbiQudmFsaWRhdG9yLmFkZE1ldGhvZCggXCJnaXJvYWNjb3VudE5MXCIsIGZ1bmN0aW9uKCB2YWx1ZSwgZWxlbWVudCApIHtcclxuXHRyZXR1cm4gdGhpcy5vcHRpb25hbCggZWxlbWVudCApIHx8IC9eWzAtOV17MSw3fSQvLnRlc3QoIHZhbHVlICk7XHJcbn0sIFwiUGxlYXNlIHNwZWNpZnkgYSB2YWxpZCBnaXJvIGFjY291bnQgbnVtYmVyXCIgKTtcclxuXHJcbi8qKlxyXG4gKiBJQkFOIGlzIHRoZSBpbnRlcm5hdGlvbmFsIGJhbmsgYWNjb3VudCBudW1iZXIuXHJcbiAqIEl0IGhhcyBhIGNvdW50cnkgLSBzcGVjaWZpYyBmb3JtYXQsIHRoYXQgaXMgY2hlY2tlZCBoZXJlIHRvb1xyXG4gKlxyXG4gKiBWYWxpZGF0aW9uIGlzIGNhc2UtaW5zZW5zaXRpdmUuIFBsZWFzZSBtYWtlIHN1cmUgdG8gbm9ybWFsaXplIGlucHV0IHlvdXJzZWxmLlxyXG4gKi9cclxuJC52YWxpZGF0b3IuYWRkTWV0aG9kKCBcImliYW5cIiwgZnVuY3Rpb24oIHZhbHVlLCBlbGVtZW50ICkge1xyXG5cclxuXHQvLyBTb21lIHF1aWNrIHNpbXBsZSB0ZXN0cyB0byBwcmV2ZW50IG5lZWRsZXNzIHdvcmtcclxuXHRpZiAoIHRoaXMub3B0aW9uYWwoIGVsZW1lbnQgKSApIHtcclxuXHRcdHJldHVybiB0cnVlO1xyXG5cdH1cclxuXHJcblx0Ly8gUmVtb3ZlIHNwYWNlcyBhbmQgdG8gdXBwZXIgY2FzZVxyXG5cdHZhciBpYmFuID0gdmFsdWUucmVwbGFjZSggLyAvZywgXCJcIiApLnRvVXBwZXJDYXNlKCksXHJcblx0XHRpYmFuY2hlY2tkaWdpdHMgPSBcIlwiLFxyXG5cdFx0bGVhZGluZ1plcm9lcyA9IHRydWUsXHJcblx0XHRjUmVzdCA9IFwiXCIsXHJcblx0XHRjT3BlcmF0b3IgPSBcIlwiLFxyXG5cdFx0Y291bnRyeWNvZGUsIGliYW5jaGVjaywgY2hhckF0LCBjQ2hhciwgYmJhbnBhdHRlcm4sIGJiYW5jb3VudHJ5cGF0dGVybnMsIGliYW5yZWdleHAsIGksIHA7XHJcblxyXG5cdC8vIENoZWNrIGZvciBJQkFOIGNvZGUgbGVuZ3RoLlxyXG5cdC8vIEl0IGNvbnRhaW5zOlxyXG5cdC8vIGNvdW50cnkgY29kZSBJU08gMzE2Ni0xIC0gdHdvIGxldHRlcnMsXHJcblx0Ly8gdHdvIGNoZWNrIGRpZ2l0cyxcclxuXHQvLyBCYXNpYyBCYW5rIEFjY291bnQgTnVtYmVyIChCQkFOKSAtIHVwIHRvIDMwIGNoYXJzXHJcblx0dmFyIG1pbmltYWxJQkFObGVuZ3RoID0gNTtcclxuXHRpZiAoIGliYW4ubGVuZ3RoIDwgbWluaW1hbElCQU5sZW5ndGggKSB7XHJcblx0XHRyZXR1cm4gZmFsc2U7XHJcblx0fVxyXG5cclxuXHQvLyBDaGVjayB0aGUgY291bnRyeSBjb2RlIGFuZCBmaW5kIHRoZSBjb3VudHJ5IHNwZWNpZmljIGZvcm1hdFxyXG5cdGNvdW50cnljb2RlID0gaWJhbi5zdWJzdHJpbmcoIDAsIDIgKTtcclxuXHRiYmFuY291bnRyeXBhdHRlcm5zID0ge1xyXG5cdFx0XCJBTFwiOiBcIlxcXFxkezh9W1xcXFxkQS1aXXsxNn1cIixcclxuXHRcdFwiQURcIjogXCJcXFxcZHs4fVtcXFxcZEEtWl17MTJ9XCIsXHJcblx0XHRcIkFUXCI6IFwiXFxcXGR7MTZ9XCIsXHJcblx0XHRcIkFaXCI6IFwiW1xcXFxkQS1aXXs0fVxcXFxkezIwfVwiLFxyXG5cdFx0XCJCRVwiOiBcIlxcXFxkezEyfVwiLFxyXG5cdFx0XCJCSFwiOiBcIltBLVpdezR9W1xcXFxkQS1aXXsxNH1cIixcclxuXHRcdFwiQkFcIjogXCJcXFxcZHsxNn1cIixcclxuXHRcdFwiQlJcIjogXCJcXFxcZHsyM31bQS1aXVtcXFxcZEEtWl1cIixcclxuXHRcdFwiQkdcIjogXCJbQS1aXXs0fVxcXFxkezZ9W1xcXFxkQS1aXXs4fVwiLFxyXG5cdFx0XCJDUlwiOiBcIlxcXFxkezE3fVwiLFxyXG5cdFx0XCJIUlwiOiBcIlxcXFxkezE3fVwiLFxyXG5cdFx0XCJDWVwiOiBcIlxcXFxkezh9W1xcXFxkQS1aXXsxNn1cIixcclxuXHRcdFwiQ1pcIjogXCJcXFxcZHsyMH1cIixcclxuXHRcdFwiREtcIjogXCJcXFxcZHsxNH1cIixcclxuXHRcdFwiRE9cIjogXCJbQS1aXXs0fVxcXFxkezIwfVwiLFxyXG5cdFx0XCJFRVwiOiBcIlxcXFxkezE2fVwiLFxyXG5cdFx0XCJGT1wiOiBcIlxcXFxkezE0fVwiLFxyXG5cdFx0XCJGSVwiOiBcIlxcXFxkezE0fVwiLFxyXG5cdFx0XCJGUlwiOiBcIlxcXFxkezEwfVtcXFxcZEEtWl17MTF9XFxcXGR7Mn1cIixcclxuXHRcdFwiR0VcIjogXCJbXFxcXGRBLVpdezJ9XFxcXGR7MTZ9XCIsXHJcblx0XHRcIkRFXCI6IFwiXFxcXGR7MTh9XCIsXHJcblx0XHRcIkdJXCI6IFwiW0EtWl17NH1bXFxcXGRBLVpdezE1fVwiLFxyXG5cdFx0XCJHUlwiOiBcIlxcXFxkezd9W1xcXFxkQS1aXXsxNn1cIixcclxuXHRcdFwiR0xcIjogXCJcXFxcZHsxNH1cIixcclxuXHRcdFwiR1RcIjogXCJbXFxcXGRBLVpdezR9W1xcXFxkQS1aXXsyMH1cIixcclxuXHRcdFwiSFVcIjogXCJcXFxcZHsyNH1cIixcclxuXHRcdFwiSVNcIjogXCJcXFxcZHsyMn1cIixcclxuXHRcdFwiSUVcIjogXCJbXFxcXGRBLVpdezR9XFxcXGR7MTR9XCIsXHJcblx0XHRcIklMXCI6IFwiXFxcXGR7MTl9XCIsXHJcblx0XHRcIklUXCI6IFwiW0EtWl1cXFxcZHsxMH1bXFxcXGRBLVpdezEyfVwiLFxyXG5cdFx0XCJLWlwiOiBcIlxcXFxkezN9W1xcXFxkQS1aXXsxM31cIixcclxuXHRcdFwiS1dcIjogXCJbQS1aXXs0fVtcXFxcZEEtWl17MjJ9XCIsXHJcblx0XHRcIkxWXCI6IFwiW0EtWl17NH1bXFxcXGRBLVpdezEzfVwiLFxyXG5cdFx0XCJMQlwiOiBcIlxcXFxkezR9W1xcXFxkQS1aXXsyMH1cIixcclxuXHRcdFwiTElcIjogXCJcXFxcZHs1fVtcXFxcZEEtWl17MTJ9XCIsXHJcblx0XHRcIkxUXCI6IFwiXFxcXGR7MTZ9XCIsXHJcblx0XHRcIkxVXCI6IFwiXFxcXGR7M31bXFxcXGRBLVpdezEzfVwiLFxyXG5cdFx0XCJNS1wiOiBcIlxcXFxkezN9W1xcXFxkQS1aXXsxMH1cXFxcZHsyfVwiLFxyXG5cdFx0XCJNVFwiOiBcIltBLVpdezR9XFxcXGR7NX1bXFxcXGRBLVpdezE4fVwiLFxyXG5cdFx0XCJNUlwiOiBcIlxcXFxkezIzfVwiLFxyXG5cdFx0XCJNVVwiOiBcIltBLVpdezR9XFxcXGR7MTl9W0EtWl17M31cIixcclxuXHRcdFwiTUNcIjogXCJcXFxcZHsxMH1bXFxcXGRBLVpdezExfVxcXFxkezJ9XCIsXHJcblx0XHRcIk1EXCI6IFwiW1xcXFxkQS1aXXsyfVxcXFxkezE4fVwiLFxyXG5cdFx0XCJNRVwiOiBcIlxcXFxkezE4fVwiLFxyXG5cdFx0XCJOTFwiOiBcIltBLVpdezR9XFxcXGR7MTB9XCIsXHJcblx0XHRcIk5PXCI6IFwiXFxcXGR7MTF9XCIsXHJcblx0XHRcIlBLXCI6IFwiW1xcXFxkQS1aXXs0fVxcXFxkezE2fVwiLFxyXG5cdFx0XCJQU1wiOiBcIltcXFxcZEEtWl17NH1cXFxcZHsyMX1cIixcclxuXHRcdFwiUExcIjogXCJcXFxcZHsyNH1cIixcclxuXHRcdFwiUFRcIjogXCJcXFxcZHsyMX1cIixcclxuXHRcdFwiUk9cIjogXCJbQS1aXXs0fVtcXFxcZEEtWl17MTZ9XCIsXHJcblx0XHRcIlNNXCI6IFwiW0EtWl1cXFxcZHsxMH1bXFxcXGRBLVpdezEyfVwiLFxyXG5cdFx0XCJTQVwiOiBcIlxcXFxkezJ9W1xcXFxkQS1aXXsxOH1cIixcclxuXHRcdFwiUlNcIjogXCJcXFxcZHsxOH1cIixcclxuXHRcdFwiU0tcIjogXCJcXFxcZHsyMH1cIixcclxuXHRcdFwiU0lcIjogXCJcXFxcZHsxNX1cIixcclxuXHRcdFwiRVNcIjogXCJcXFxcZHsyMH1cIixcclxuXHRcdFwiU0VcIjogXCJcXFxcZHsyMH1cIixcclxuXHRcdFwiQ0hcIjogXCJcXFxcZHs1fVtcXFxcZEEtWl17MTJ9XCIsXHJcblx0XHRcIlROXCI6IFwiXFxcXGR7MjB9XCIsXHJcblx0XHRcIlRSXCI6IFwiXFxcXGR7NX1bXFxcXGRBLVpdezE3fVwiLFxyXG5cdFx0XCJBRVwiOiBcIlxcXFxkezN9XFxcXGR7MTZ9XCIsXHJcblx0XHRcIkdCXCI6IFwiW0EtWl17NH1cXFxcZHsxNH1cIixcclxuXHRcdFwiVkdcIjogXCJbXFxcXGRBLVpdezR9XFxcXGR7MTZ9XCJcclxuXHR9O1xyXG5cclxuXHRiYmFucGF0dGVybiA9IGJiYW5jb3VudHJ5cGF0dGVybnNbIGNvdW50cnljb2RlIF07XHJcblxyXG5cdC8vIEFzIG5ldyBjb3VudHJpZXMgd2lsbCBzdGFydCB1c2luZyBJQkFOIGluIHRoZVxyXG5cdC8vIGZ1dHVyZSwgd2Ugb25seSBjaGVjayBpZiB0aGUgY291bnRyeWNvZGUgaXMga25vd24uXHJcblx0Ly8gVGhpcyBwcmV2ZW50cyBmYWxzZSBuZWdhdGl2ZXMsIHdoaWxlIGFsbW9zdCBhbGxcclxuXHQvLyBmYWxzZSBwb3NpdGl2ZXMgaW50cm9kdWNlZCBieSB0aGlzLCB3aWxsIGJlIGNhdWdodFxyXG5cdC8vIGJ5IHRoZSBjaGVja3N1bSB2YWxpZGF0aW9uIGJlbG93IGFueXdheS5cclxuXHQvLyBTdHJpY3QgY2hlY2tpbmcgc2hvdWxkIHJldHVybiBGQUxTRSBmb3IgdW5rbm93blxyXG5cdC8vIGNvdW50cmllcy5cclxuXHRpZiAoIHR5cGVvZiBiYmFucGF0dGVybiAhPT0gXCJ1bmRlZmluZWRcIiApIHtcclxuXHRcdGliYW5yZWdleHAgPSBuZXcgUmVnRXhwKCBcIl5bQS1aXXsyfVxcXFxkezJ9XCIgKyBiYmFucGF0dGVybiArIFwiJFwiLCBcIlwiICk7XHJcblx0XHRpZiAoICEoIGliYW5yZWdleHAudGVzdCggaWJhbiApICkgKSB7XHJcblx0XHRcdHJldHVybiBmYWxzZTsgLy8gSW52YWxpZCBjb3VudHJ5IHNwZWNpZmljIGZvcm1hdFxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0Ly8gTm93IGNoZWNrIHRoZSBjaGVja3N1bSwgZmlyc3QgY29udmVydCB0byBkaWdpdHNcclxuXHRpYmFuY2hlY2sgPSBpYmFuLnN1YnN0cmluZyggNCwgaWJhbi5sZW5ndGggKSArIGliYW4uc3Vic3RyaW5nKCAwLCA0ICk7XHJcblx0Zm9yICggaSA9IDA7IGkgPCBpYmFuY2hlY2subGVuZ3RoOyBpKysgKSB7XHJcblx0XHRjaGFyQXQgPSBpYmFuY2hlY2suY2hhckF0KCBpICk7XHJcblx0XHRpZiAoIGNoYXJBdCAhPT0gXCIwXCIgKSB7XHJcblx0XHRcdGxlYWRpbmdaZXJvZXMgPSBmYWxzZTtcclxuXHRcdH1cclxuXHRcdGlmICggIWxlYWRpbmdaZXJvZXMgKSB7XHJcblx0XHRcdGliYW5jaGVja2RpZ2l0cyArPSBcIjAxMjM0NTY3ODlBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWlwiLmluZGV4T2YoIGNoYXJBdCApO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0Ly8gQ2FsY3VsYXRlIHRoZSByZXN1bHQgb2Y6IGliYW5jaGVja2RpZ2l0cyAlIDk3XHJcblx0Zm9yICggcCA9IDA7IHAgPCBpYmFuY2hlY2tkaWdpdHMubGVuZ3RoOyBwKysgKSB7XHJcblx0XHRjQ2hhciA9IGliYW5jaGVja2RpZ2l0cy5jaGFyQXQoIHAgKTtcclxuXHRcdGNPcGVyYXRvciA9IFwiXCIgKyBjUmVzdCArIFwiXCIgKyBjQ2hhcjtcclxuXHRcdGNSZXN0ID0gY09wZXJhdG9yICUgOTc7XHJcblx0fVxyXG5cdHJldHVybiBjUmVzdCA9PT0gMTtcclxufSwgXCJQbGVhc2Ugc3BlY2lmeSBhIHZhbGlkIElCQU5cIiApO1xyXG5cclxuJC52YWxpZGF0b3IuYWRkTWV0aG9kKCBcImludGVnZXJcIiwgZnVuY3Rpb24oIHZhbHVlLCBlbGVtZW50ICkge1xyXG5cdHJldHVybiB0aGlzLm9wdGlvbmFsKCBlbGVtZW50ICkgfHwgL14tP1xcZCskLy50ZXN0KCB2YWx1ZSApO1xyXG59LCBcIkEgcG9zaXRpdmUgb3IgbmVnYXRpdmUgbm9uLWRlY2ltYWwgbnVtYmVyIHBsZWFzZVwiICk7XHJcblxyXG4kLnZhbGlkYXRvci5hZGRNZXRob2QoIFwiaXB2NFwiLCBmdW5jdGlvbiggdmFsdWUsIGVsZW1lbnQgKSB7XHJcblx0cmV0dXJuIHRoaXMub3B0aW9uYWwoIGVsZW1lbnQgKSB8fCAvXigyNVswLTVdfDJbMC00XVxcZHxbMDFdP1xcZFxcZD8pXFwuKDI1WzAtNV18MlswLTRdXFxkfFswMV0/XFxkXFxkPylcXC4oMjVbMC01XXwyWzAtNF1cXGR8WzAxXT9cXGRcXGQ/KVxcLigyNVswLTVdfDJbMC00XVxcZHxbMDFdP1xcZFxcZD8pJC9pLnRlc3QoIHZhbHVlICk7XHJcbn0sIFwiUGxlYXNlIGVudGVyIGEgdmFsaWQgSVAgdjQgYWRkcmVzcy5cIiApO1xyXG5cclxuJC52YWxpZGF0b3IuYWRkTWV0aG9kKCBcImlwdjZcIiwgZnVuY3Rpb24oIHZhbHVlLCBlbGVtZW50ICkge1xyXG5cdHJldHVybiB0aGlzLm9wdGlvbmFsKCBlbGVtZW50ICkgfHwgL14oKChbMC05QS1GYS1mXXsxLDR9Oil7N31bMC05QS1GYS1mXXsxLDR9KXwoKFswLTlBLUZhLWZdezEsNH06KXs2fTpbMC05QS1GYS1mXXsxLDR9KXwoKFswLTlBLUZhLWZdezEsNH06KXs1fTooWzAtOUEtRmEtZl17MSw0fTopP1swLTlBLUZhLWZdezEsNH0pfCgoWzAtOUEtRmEtZl17MSw0fTopezR9OihbMC05QS1GYS1mXXsxLDR9Oil7MCwyfVswLTlBLUZhLWZdezEsNH0pfCgoWzAtOUEtRmEtZl17MSw0fTopezN9OihbMC05QS1GYS1mXXsxLDR9Oil7MCwzfVswLTlBLUZhLWZdezEsNH0pfCgoWzAtOUEtRmEtZl17MSw0fTopezJ9OihbMC05QS1GYS1mXXsxLDR9Oil7MCw0fVswLTlBLUZhLWZdezEsNH0pfCgoWzAtOUEtRmEtZl17MSw0fTopezZ9KChcXGIoKDI1WzAtNV0pfCgxXFxkezJ9KXwoMlswLTRdXFxkKXwoXFxkezEsMn0pKVxcYilcXC4pezN9KFxcYigoMjVbMC01XSl8KDFcXGR7Mn0pfCgyWzAtNF1cXGQpfChcXGR7MSwyfSkpXFxiKSl8KChbMC05QS1GYS1mXXsxLDR9Oil7MCw1fTooKFxcYigoMjVbMC01XSl8KDFcXGR7Mn0pfCgyWzAtNF1cXGQpfChcXGR7MSwyfSkpXFxiKVxcLil7M30oXFxiKCgyNVswLTVdKXwoMVxcZHsyfSl8KDJbMC00XVxcZCl8KFxcZHsxLDJ9KSlcXGIpKXwoOjooWzAtOUEtRmEtZl17MSw0fTopezAsNX0oKFxcYigoMjVbMC01XSl8KDFcXGR7Mn0pfCgyWzAtNF1cXGQpfChcXGR7MSwyfSkpXFxiKVxcLil7M30oXFxiKCgyNVswLTVdKXwoMVxcZHsyfSl8KDJbMC00XVxcZCl8KFxcZHsxLDJ9KSlcXGIpKXwoWzAtOUEtRmEtZl17MSw0fTo6KFswLTlBLUZhLWZdezEsNH06KXswLDV9WzAtOUEtRmEtZl17MSw0fSl8KDo6KFswLTlBLUZhLWZdezEsNH06KXswLDZ9WzAtOUEtRmEtZl17MSw0fSl8KChbMC05QS1GYS1mXXsxLDR9Oil7MSw3fTopKSQvaS50ZXN0KCB2YWx1ZSApO1xyXG59LCBcIlBsZWFzZSBlbnRlciBhIHZhbGlkIElQIHY2IGFkZHJlc3MuXCIgKTtcclxuXHJcbiQudmFsaWRhdG9yLmFkZE1ldGhvZCggXCJsZXR0ZXJzb25seVwiLCBmdW5jdGlvbiggdmFsdWUsIGVsZW1lbnQgKSB7XHJcblx0cmV0dXJuIHRoaXMub3B0aW9uYWwoIGVsZW1lbnQgKSB8fCAvXlthLXpdKyQvaS50ZXN0KCB2YWx1ZSApO1xyXG59LCBcIkxldHRlcnMgb25seSBwbGVhc2VcIiApO1xyXG5cclxuJC52YWxpZGF0b3IuYWRkTWV0aG9kKCBcImxldHRlcnN3aXRoYmFzaWNwdW5jXCIsIGZ1bmN0aW9uKCB2YWx1ZSwgZWxlbWVudCApIHtcclxuXHRyZXR1cm4gdGhpcy5vcHRpb25hbCggZWxlbWVudCApIHx8IC9eW2EtelxcLS4sKCknXCJcXHNdKyQvaS50ZXN0KCB2YWx1ZSApO1xyXG59LCBcIkxldHRlcnMgb3IgcHVuY3R1YXRpb24gb25seSBwbGVhc2VcIiApO1xyXG5cclxuJC52YWxpZGF0b3IuYWRkTWV0aG9kKCBcIm1vYmlsZU5MXCIsIGZ1bmN0aW9uKCB2YWx1ZSwgZWxlbWVudCApIHtcclxuXHRyZXR1cm4gdGhpcy5vcHRpb25hbCggZWxlbWVudCApIHx8IC9eKChcXCt8MDAoXFxzfFxccz9cXC1cXHM/KT8pMzEoXFxzfFxccz9cXC1cXHM/KT8oXFwoMFxcKVtcXC1cXHNdPyk/fDApNigoXFxzfFxccz9cXC1cXHM/KT9bMC05XSl7OH0kLy50ZXN0KCB2YWx1ZSApO1xyXG59LCBcIlBsZWFzZSBzcGVjaWZ5IGEgdmFsaWQgbW9iaWxlIG51bWJlclwiICk7XHJcblxyXG4vKiBGb3IgVUsgcGhvbmUgZnVuY3Rpb25zLCBkbyB0aGUgZm9sbG93aW5nIHNlcnZlciBzaWRlIHByb2Nlc3Npbmc6XHJcbiAqIENvbXBhcmUgb3JpZ2luYWwgaW5wdXQgd2l0aCB0aGlzIFJlZ0V4IHBhdHRlcm46XHJcbiAqIF5cXCg/KD86KD86MDBcXCk/W1xcc1xcLV0/XFwoP3xcXCspKDQ0KVxcKT9bXFxzXFwtXT9cXCg/KD86MFxcKT9bXFxzXFwtXT9cXCg/KT98MCkoWzEtOV1cXGR7MSw0fVxcKT9bXFxzXFxkXFwtXSspJFxyXG4gKiBFeHRyYWN0ICQxIGFuZCBzZXQgJHByZWZpeCB0byAnKzQ0PHNwYWNlPicgaWYgJDEgaXMgJzQ0Jywgb3RoZXJ3aXNlIHNldCAkcHJlZml4IHRvICcwJ1xyXG4gKiBFeHRyYWN0ICQyIGFuZCByZW1vdmUgaHlwaGVucywgc3BhY2VzIGFuZCBwYXJlbnRoZXNlcy4gUGhvbmUgbnVtYmVyIGlzIGNvbWJpbmVkICRwcmVmaXggYW5kICQyLlxyXG4gKiBBIG51bWJlciBvZiB2ZXJ5IGRldGFpbGVkIEdCIHRlbGVwaG9uZSBudW1iZXIgUmVnRXggcGF0dGVybnMgY2FuIGFsc28gYmUgZm91bmQgYXQ6XHJcbiAqIGh0dHA6Ly93d3cuYWEtYXN0ZXJpc2sub3JnLnVrL2luZGV4LnBocC9SZWd1bGFyX0V4cHJlc3Npb25zX2Zvcl9WYWxpZGF0aW5nX2FuZF9Gb3JtYXR0aW5nX0dCX1RlbGVwaG9uZV9OdW1iZXJzXHJcbiAqL1xyXG4kLnZhbGlkYXRvci5hZGRNZXRob2QoIFwibW9iaWxlVUtcIiwgZnVuY3Rpb24oIHBob25lX251bWJlciwgZWxlbWVudCApIHtcclxuXHRwaG9uZV9udW1iZXIgPSBwaG9uZV9udW1iZXIucmVwbGFjZSggL1xcKHxcXCl8XFxzK3wtL2csIFwiXCIgKTtcclxuXHRyZXR1cm4gdGhpcy5vcHRpb25hbCggZWxlbWVudCApIHx8IHBob25lX251bWJlci5sZW5ndGggPiA5ICYmXHJcblx0XHRwaG9uZV9udW1iZXIubWF0Y2goIC9eKD86KD86KD86MDBcXHM/fFxcKyk0NFxccz98MCk3KD86WzEzNDU3ODldXFxkezJ9fDYyNClcXHM/XFxkezN9XFxzP1xcZHszfSkkLyApO1xyXG59LCBcIlBsZWFzZSBzcGVjaWZ5IGEgdmFsaWQgbW9iaWxlIG51bWJlclwiICk7XHJcblxyXG4kLnZhbGlkYXRvci5hZGRNZXRob2QoIFwibmV0bWFza1wiLCBmdW5jdGlvbiggdmFsdWUsIGVsZW1lbnQgKSB7XHJcbiAgICByZXR1cm4gdGhpcy5vcHRpb25hbCggZWxlbWVudCApIHx8IC9eKDI1NHwyNTJ8MjQ4fDI0MHwyMjR8MTkyfDEyOClcXC4wXFwuMFxcLjB8MjU1XFwuKDI1NHwyNTJ8MjQ4fDI0MHwyMjR8MTkyfDEyOHwwKVxcLjBcXC4wfDI1NVxcLjI1NVxcLigyNTR8MjUyfDI0OHwyNDB8MjI0fDE5MnwxMjh8MClcXC4wfDI1NVxcLjI1NVxcLjI1NVxcLigyNTR8MjUyfDI0OHwyNDB8MjI0fDE5MnwxMjh8MCkvaS50ZXN0KCB2YWx1ZSApO1xyXG59LCBcIlBsZWFzZSBlbnRlciBhIHZhbGlkIG5ldG1hc2suXCIgKTtcclxuXHJcbi8qXHJcbiAqIFRoZSBOSUUgKE7Dum1lcm8gZGUgSWRlbnRpZmljYWNpw7NuIGRlIEV4dHJhbmplcm8pIGlzIGEgU3BhbmlzaCB0YXggaWRlbnRpZmljYXRpb24gbnVtYmVyIGFzc2lnbmVkIGJ5IHRoZSBTcGFuaXNoXHJcbiAqIGF1dGhvcml0aWVzIHRvIGFueSBmb3JlaWduZXIuXHJcbiAqXHJcbiAqIFRoZSBOSUUgaXMgdGhlIGVxdWl2YWxlbnQgb2YgYSBTcGFuaWFyZHMgTsO6bWVybyBkZSBJZGVudGlmaWNhY2nDs24gRmlzY2FsIChOSUYpIHdoaWNoIHNlcnZlcyBhcyBhIGZpc2NhbFxyXG4gKiBpZGVudGlmaWNhdGlvbiBudW1iZXIuIFRoZSBDSUYgbnVtYmVyIChDZXJ0aWZpY2FkbyBkZSBJZGVudGlmaWNhY2nDs24gRmlzY2FsKSBpcyBlcXVpdmFsZW50IHRvIHRoZSBOSUYsIGJ1dCBhcHBsaWVzIHRvXHJcbiAqIGNvbXBhbmllcyByYXRoZXIgdGhhbiBpbmRpdmlkdWFscy4gVGhlIE5JRSBjb25zaXN0cyBvZiBhbiAnWCcgb3IgJ1knIGZvbGxvd2VkIGJ5IDcgb3IgOCBkaWdpdHMgdGhlbiBhbm90aGVyIGxldHRlci5cclxuICovXHJcbiQudmFsaWRhdG9yLmFkZE1ldGhvZCggXCJuaWVFU1wiLCBmdW5jdGlvbiggdmFsdWUsIGVsZW1lbnQgKSB7XHJcblx0XCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5cdGlmICggdGhpcy5vcHRpb25hbCggZWxlbWVudCApICkge1xyXG5cdFx0cmV0dXJuIHRydWU7XHJcblx0fVxyXG5cclxuXHR2YXIgbmllUmVnRXggPSBuZXcgUmVnRXhwKCAvXltNWFlaXXsxfVswLTldezcsOH1bVFJXQUdNWUZQRFhCTkpaU1FWSExDS0VUXXsxfSQvZ2kgKTtcclxuXHR2YXIgdmFsaWRDaGFycyA9IFwiVFJXQUdNWUZQRFhCTkpaU1FWSExDS0VUXCIsXHJcblx0XHRsZXR0ZXIgPSB2YWx1ZS5zdWJzdHIoIHZhbHVlLmxlbmd0aCAtIDEgKS50b1VwcGVyQ2FzZSgpLFxyXG5cdFx0bnVtYmVyO1xyXG5cclxuXHR2YWx1ZSA9IHZhbHVlLnRvU3RyaW5nKCkudG9VcHBlckNhc2UoKTtcclxuXHJcblx0Ly8gUXVpY2sgZm9ybWF0IHRlc3RcclxuXHRpZiAoIHZhbHVlLmxlbmd0aCA+IDEwIHx8IHZhbHVlLmxlbmd0aCA8IDkgfHwgIW5pZVJlZ0V4LnRlc3QoIHZhbHVlICkgKSB7XHJcblx0XHRyZXR1cm4gZmFsc2U7XHJcblx0fVxyXG5cclxuXHQvLyBYIG1lYW5zIHNhbWUgbnVtYmVyXHJcblx0Ly8gWSBtZWFucyBudW1iZXIgKyAxMDAwMDAwMFxyXG5cdC8vIFogbWVhbnMgbnVtYmVyICsgMjAwMDAwMDBcclxuXHR2YWx1ZSA9IHZhbHVlLnJlcGxhY2UoIC9eW1hdLywgXCIwXCIgKVxyXG5cdFx0LnJlcGxhY2UoIC9eW1ldLywgXCIxXCIgKVxyXG5cdFx0LnJlcGxhY2UoIC9eW1pdLywgXCIyXCIgKTtcclxuXHJcblx0bnVtYmVyID0gdmFsdWUubGVuZ3RoID09PSA5ID8gdmFsdWUuc3Vic3RyKCAwLCA4ICkgOiB2YWx1ZS5zdWJzdHIoIDAsIDkgKTtcclxuXHJcblx0cmV0dXJuIHZhbGlkQ2hhcnMuY2hhckF0KCBwYXJzZUludCggbnVtYmVyLCAxMCApICUgMjMgKSA9PT0gbGV0dGVyO1xyXG5cclxufSwgXCJQbGVhc2Ugc3BlY2lmeSBhIHZhbGlkIE5JRSBudW1iZXIuXCIgKTtcclxuXHJcbi8qXHJcbiAqIFRoZSBOw7ptZXJvIGRlIElkZW50aWZpY2FjacOzbiBGaXNjYWwgKCBOSUYgKSBpcyB0aGUgd2F5IHRheCBpZGVudGlmaWNhdGlvbiB1c2VkIGluIFNwYWluIGZvciBpbmRpdmlkdWFsc1xyXG4gKi9cclxuJC52YWxpZGF0b3IuYWRkTWV0aG9kKCBcIm5pZkVTXCIsIGZ1bmN0aW9uKCB2YWx1ZSwgZWxlbWVudCApIHtcclxuXHRcInVzZSBzdHJpY3RcIjtcclxuXHJcblx0aWYgKCB0aGlzLm9wdGlvbmFsKCBlbGVtZW50ICkgKSB7XHJcblx0XHRyZXR1cm4gdHJ1ZTtcclxuXHR9XHJcblxyXG5cdHZhbHVlID0gdmFsdWUudG9VcHBlckNhc2UoKTtcclxuXHJcblx0Ly8gQmFzaWMgZm9ybWF0IHRlc3RcclxuXHRpZiAoICF2YWx1ZS5tYXRjaCggXCIoKF5bQS1aXXsxfVswLTldezd9W0EtWjAtOV17MX0kfF5bVF17MX1bQS1aMC05XXs4fSQpfF5bMC05XXs4fVtBLVpdezF9JClcIiApICkge1xyXG5cdFx0cmV0dXJuIGZhbHNlO1xyXG5cdH1cclxuXHJcblx0Ly8gVGVzdCBOSUZcclxuXHRpZiAoIC9eWzAtOV17OH1bQS1aXXsxfSQvLnRlc3QoIHZhbHVlICkgKSB7XHJcblx0XHRyZXR1cm4gKCBcIlRSV0FHTVlGUERYQk5KWlNRVkhMQ0tFXCIuY2hhckF0KCB2YWx1ZS5zdWJzdHJpbmcoIDgsIDAgKSAlIDIzICkgPT09IHZhbHVlLmNoYXJBdCggOCApICk7XHJcblx0fVxyXG5cclxuXHQvLyBUZXN0IHNwZWNpYWxzIE5JRiAoc3RhcnRzIHdpdGggSywgTCBvciBNKVxyXG5cdGlmICggL15bS0xNXXsxfS8udGVzdCggdmFsdWUgKSApIHtcclxuXHRcdHJldHVybiAoIHZhbHVlWyA4IF0gPT09IFwiVFJXQUdNWUZQRFhCTkpaU1FWSExDS0VcIi5jaGFyQXQoIHZhbHVlLnN1YnN0cmluZyggOCwgMSApICUgMjMgKSApO1xyXG5cdH1cclxuXHJcblx0cmV0dXJuIGZhbHNlO1xyXG5cclxufSwgXCJQbGVhc2Ugc3BlY2lmeSBhIHZhbGlkIE5JRiBudW1iZXIuXCIgKTtcclxuXHJcbi8qXHJcbiAqIE51bWVyIGlkZW50eWZpa2FjamkgcG9kYXRrb3dlaiAoIE5JUCApIGlzIHRoZSB3YXkgdGF4IGlkZW50aWZpY2F0aW9uIHVzZWQgaW4gUG9sYW5kIGZvciBjb21wYW5pZXNcclxuICovXHJcbiQudmFsaWRhdG9yLmFkZE1ldGhvZCggXCJuaXBQTFwiLCBmdW5jdGlvbiggdmFsdWUgKSB7XHJcblx0XCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5cdHZhbHVlID0gdmFsdWUucmVwbGFjZSggL1teMC05XS9nLCBcIlwiICk7XHJcblxyXG5cdGlmICggdmFsdWUubGVuZ3RoICE9PSAxMCApIHtcclxuXHRcdHJldHVybiBmYWxzZTtcclxuXHR9XHJcblxyXG5cdHZhciBhcnJTdGVwcyA9IFsgNiwgNSwgNywgMiwgMywgNCwgNSwgNiwgNyBdO1xyXG5cdHZhciBpbnRTdW0gPSAwO1xyXG5cdGZvciAoIHZhciBpID0gMDsgaSA8IDk7IGkrKyApIHtcclxuXHRcdGludFN1bSArPSBhcnJTdGVwc1sgaSBdICogdmFsdWVbIGkgXTtcclxuXHR9XHJcblx0dmFyIGludDIgPSBpbnRTdW0gJSAxMTtcclxuXHR2YXIgaW50Q29udHJvbE5yID0gKCBpbnQyID09PSAxMCApID8gMCA6IGludDI7XHJcblxyXG5cdHJldHVybiAoIGludENvbnRyb2xOciA9PT0gcGFyc2VJbnQoIHZhbHVlWyA5IF0sIDEwICkgKTtcclxufSwgXCJQbGVhc2Ugc3BlY2lmeSBhIHZhbGlkIE5JUCBudW1iZXIuXCIgKTtcclxuXHJcbiQudmFsaWRhdG9yLmFkZE1ldGhvZCggXCJub3RFcXVhbFRvXCIsIGZ1bmN0aW9uKCB2YWx1ZSwgZWxlbWVudCwgcGFyYW0gKSB7XHJcblx0cmV0dXJuIHRoaXMub3B0aW9uYWwoIGVsZW1lbnQgKSB8fCAhJC52YWxpZGF0b3IubWV0aG9kcy5lcXVhbFRvLmNhbGwoIHRoaXMsIHZhbHVlLCBlbGVtZW50LCBwYXJhbSApO1xyXG59LCBcIlBsZWFzZSBlbnRlciBhIGRpZmZlcmVudCB2YWx1ZSwgdmFsdWVzIG11c3Qgbm90IGJlIHRoZSBzYW1lLlwiICk7XHJcblxyXG4kLnZhbGlkYXRvci5hZGRNZXRob2QoIFwibm93aGl0ZXNwYWNlXCIsIGZ1bmN0aW9uKCB2YWx1ZSwgZWxlbWVudCApIHtcclxuXHRyZXR1cm4gdGhpcy5vcHRpb25hbCggZWxlbWVudCApIHx8IC9eXFxTKyQvaS50ZXN0KCB2YWx1ZSApO1xyXG59LCBcIk5vIHdoaXRlIHNwYWNlIHBsZWFzZVwiICk7XHJcblxyXG4vKipcclxuKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgZmllbGQgdmFsdWUgbWF0Y2hlcyB0aGUgZ2l2ZW4gZm9ybWF0IFJlZ0V4cFxyXG4qXHJcbiogQGV4YW1wbGUgJC52YWxpZGF0b3IubWV0aG9kcy5wYXR0ZXJuKFwiQVIxMDA0XCIsZWxlbWVudCwvXkFSXFxkezR9JC8pXHJcbiogQHJlc3VsdCB0cnVlXHJcbipcclxuKiBAZXhhbXBsZSAkLnZhbGlkYXRvci5tZXRob2RzLnBhdHRlcm4oXCJCUjEwMDRcIixlbGVtZW50LC9eQVJcXGR7NH0kLylcclxuKiBAcmVzdWx0IGZhbHNlXHJcbipcclxuKiBAbmFtZSAkLnZhbGlkYXRvci5tZXRob2RzLnBhdHRlcm5cclxuKiBAdHlwZSBCb29sZWFuXHJcbiogQGNhdCBQbHVnaW5zL1ZhbGlkYXRlL01ldGhvZHNcclxuKi9cclxuJC52YWxpZGF0b3IuYWRkTWV0aG9kKCBcInBhdHRlcm5cIiwgZnVuY3Rpb24oIHZhbHVlLCBlbGVtZW50LCBwYXJhbSApIHtcclxuXHRpZiAoIHRoaXMub3B0aW9uYWwoIGVsZW1lbnQgKSApIHtcclxuXHRcdHJldHVybiB0cnVlO1xyXG5cdH1cclxuXHRpZiAoIHR5cGVvZiBwYXJhbSA9PT0gXCJzdHJpbmdcIiApIHtcclxuXHRcdHBhcmFtID0gbmV3IFJlZ0V4cCggXCJeKD86XCIgKyBwYXJhbSArIFwiKSRcIiApO1xyXG5cdH1cclxuXHRyZXR1cm4gcGFyYW0udGVzdCggdmFsdWUgKTtcclxufSwgXCJJbnZhbGlkIGZvcm1hdC5cIiApO1xyXG5cclxuLyoqXHJcbiAqIER1dGNoIHBob25lIG51bWJlcnMgaGF2ZSAxMCBkaWdpdHMgKG9yIDExIGFuZCBzdGFydCB3aXRoICszMSkuXHJcbiAqL1xyXG4kLnZhbGlkYXRvci5hZGRNZXRob2QoIFwicGhvbmVOTFwiLCBmdW5jdGlvbiggdmFsdWUsIGVsZW1lbnQgKSB7XHJcblx0cmV0dXJuIHRoaXMub3B0aW9uYWwoIGVsZW1lbnQgKSB8fCAvXigoXFwrfDAwKFxcc3xcXHM/XFwtXFxzPyk/KTMxKFxcc3xcXHM/XFwtXFxzPyk/KFxcKDBcXClbXFwtXFxzXT8pP3wwKVsxLTldKChcXHN8XFxzP1xcLVxccz8pP1swLTldKXs4fSQvLnRlc3QoIHZhbHVlICk7XHJcbn0sIFwiUGxlYXNlIHNwZWNpZnkgYSB2YWxpZCBwaG9uZSBudW1iZXIuXCIgKTtcclxuXHJcbi8qIEZvciBVSyBwaG9uZSBmdW5jdGlvbnMsIGRvIHRoZSBmb2xsb3dpbmcgc2VydmVyIHNpZGUgcHJvY2Vzc2luZzpcclxuICogQ29tcGFyZSBvcmlnaW5hbCBpbnB1dCB3aXRoIHRoaXMgUmVnRXggcGF0dGVybjpcclxuICogXlxcKD8oPzooPzowMFxcKT9bXFxzXFwtXT9cXCg/fFxcKykoNDQpXFwpP1tcXHNcXC1dP1xcKD8oPzowXFwpP1tcXHNcXC1dP1xcKD8pP3wwKShbMS05XVxcZHsxLDR9XFwpP1tcXHNcXGRcXC1dKykkXHJcbiAqIEV4dHJhY3QgJDEgYW5kIHNldCAkcHJlZml4IHRvICcrNDQ8c3BhY2U+JyBpZiAkMSBpcyAnNDQnLCBvdGhlcndpc2Ugc2V0ICRwcmVmaXggdG8gJzAnXHJcbiAqIEV4dHJhY3QgJDIgYW5kIHJlbW92ZSBoeXBoZW5zLCBzcGFjZXMgYW5kIHBhcmVudGhlc2VzLiBQaG9uZSBudW1iZXIgaXMgY29tYmluZWQgJHByZWZpeCBhbmQgJDIuXHJcbiAqIEEgbnVtYmVyIG9mIHZlcnkgZGV0YWlsZWQgR0IgdGVsZXBob25lIG51bWJlciBSZWdFeCBwYXR0ZXJucyBjYW4gYWxzbyBiZSBmb3VuZCBhdDpcclxuICogaHR0cDovL3d3dy5hYS1hc3Rlcmlzay5vcmcudWsvaW5kZXgucGhwL1JlZ3VsYXJfRXhwcmVzc2lvbnNfZm9yX1ZhbGlkYXRpbmdfYW5kX0Zvcm1hdHRpbmdfR0JfVGVsZXBob25lX051bWJlcnNcclxuICovXHJcblxyXG4vLyBNYXRjaGVzIFVLIGxhbmRsaW5lICsgbW9iaWxlLCBhY2NlcHRpbmcgb25seSAwMS0zIGZvciBsYW5kbGluZSBvciAwNyBmb3IgbW9iaWxlIHRvIGV4Y2x1ZGUgbWFueSBwcmVtaXVtIG51bWJlcnNcclxuJC52YWxpZGF0b3IuYWRkTWV0aG9kKCBcInBob25lc1VLXCIsIGZ1bmN0aW9uKCBwaG9uZV9udW1iZXIsIGVsZW1lbnQgKSB7XHJcblx0cGhvbmVfbnVtYmVyID0gcGhvbmVfbnVtYmVyLnJlcGxhY2UoIC9cXCh8XFwpfFxccyt8LS9nLCBcIlwiICk7XHJcblx0cmV0dXJuIHRoaXMub3B0aW9uYWwoIGVsZW1lbnQgKSB8fCBwaG9uZV9udW1iZXIubGVuZ3RoID4gOSAmJlxyXG5cdFx0cGhvbmVfbnVtYmVyLm1hdGNoKCAvXig/Oig/Oig/OjAwXFxzP3xcXCspNDRcXHM/fDApKD86MVxcZHs4LDl9fFsyM11cXGR7OX18Nyg/OlsxMzQ1Nzg5XVxcZHs4fXw2MjRcXGR7Nn0pKSkkLyApO1xyXG59LCBcIlBsZWFzZSBzcGVjaWZ5IGEgdmFsaWQgdWsgcGhvbmUgbnVtYmVyXCIgKTtcclxuXHJcbi8qIEZvciBVSyBwaG9uZSBmdW5jdGlvbnMsIGRvIHRoZSBmb2xsb3dpbmcgc2VydmVyIHNpZGUgcHJvY2Vzc2luZzpcclxuICogQ29tcGFyZSBvcmlnaW5hbCBpbnB1dCB3aXRoIHRoaXMgUmVnRXggcGF0dGVybjpcclxuICogXlxcKD8oPzooPzowMFxcKT9bXFxzXFwtXT9cXCg/fFxcKykoNDQpXFwpP1tcXHNcXC1dP1xcKD8oPzowXFwpP1tcXHNcXC1dP1xcKD8pP3wwKShbMS05XVxcZHsxLDR9XFwpP1tcXHNcXGRcXC1dKykkXHJcbiAqIEV4dHJhY3QgJDEgYW5kIHNldCAkcHJlZml4IHRvICcrNDQ8c3BhY2U+JyBpZiAkMSBpcyAnNDQnLCBvdGhlcndpc2Ugc2V0ICRwcmVmaXggdG8gJzAnXHJcbiAqIEV4dHJhY3QgJDIgYW5kIHJlbW92ZSBoeXBoZW5zLCBzcGFjZXMgYW5kIHBhcmVudGhlc2VzLiBQaG9uZSBudW1iZXIgaXMgY29tYmluZWQgJHByZWZpeCBhbmQgJDIuXHJcbiAqIEEgbnVtYmVyIG9mIHZlcnkgZGV0YWlsZWQgR0IgdGVsZXBob25lIG51bWJlciBSZWdFeCBwYXR0ZXJucyBjYW4gYWxzbyBiZSBmb3VuZCBhdDpcclxuICogaHR0cDovL3d3dy5hYS1hc3Rlcmlzay5vcmcudWsvaW5kZXgucGhwL1JlZ3VsYXJfRXhwcmVzc2lvbnNfZm9yX1ZhbGlkYXRpbmdfYW5kX0Zvcm1hdHRpbmdfR0JfVGVsZXBob25lX051bWJlcnNcclxuICovXHJcbiQudmFsaWRhdG9yLmFkZE1ldGhvZCggXCJwaG9uZVVLXCIsIGZ1bmN0aW9uKCBwaG9uZV9udW1iZXIsIGVsZW1lbnQgKSB7XHJcblx0cGhvbmVfbnVtYmVyID0gcGhvbmVfbnVtYmVyLnJlcGxhY2UoIC9cXCh8XFwpfFxccyt8LS9nLCBcIlwiICk7XHJcblx0cmV0dXJuIHRoaXMub3B0aW9uYWwoIGVsZW1lbnQgKSB8fCBwaG9uZV9udW1iZXIubGVuZ3RoID4gOSAmJlxyXG5cdFx0cGhvbmVfbnVtYmVyLm1hdGNoKCAvXig/Oig/Oig/OjAwXFxzP3xcXCspNDRcXHM/KXwoPzpcXCg/MCkpKD86XFxkezJ9XFwpP1xccz9cXGR7NH1cXHM/XFxkezR9fFxcZHszfVxcKT9cXHM/XFxkezN9XFxzP1xcZHszLDR9fFxcZHs0fVxcKT9cXHM/KD86XFxkezV9fFxcZHszfVxccz9cXGR7M30pfFxcZHs1fVxcKT9cXHM/XFxkezQsNX0pJC8gKTtcclxufSwgXCJQbGVhc2Ugc3BlY2lmeSBhIHZhbGlkIHBob25lIG51bWJlclwiICk7XHJcblxyXG4vKipcclxuICogTWF0Y2hlcyBVUyBwaG9uZSBudW1iZXIgZm9ybWF0XHJcbiAqXHJcbiAqIHdoZXJlIHRoZSBhcmVhIGNvZGUgbWF5IG5vdCBzdGFydCB3aXRoIDEgYW5kIHRoZSBwcmVmaXggbWF5IG5vdCBzdGFydCB3aXRoIDFcclxuICogYWxsb3dzICctJyBvciAnICcgYXMgYSBzZXBhcmF0b3IgYW5kIGFsbG93cyBwYXJlbnMgYXJvdW5kIGFyZWEgY29kZVxyXG4gKiBzb21lIHBlb3BsZSBtYXkgd2FudCB0byBwdXQgYSAnMScgaW4gZnJvbnQgb2YgdGhlaXIgbnVtYmVyXHJcbiAqXHJcbiAqIDEoMjEyKS05OTktMjM0NSBvclxyXG4gKiAyMTIgOTk5IDIzNDQgb3JcclxuICogMjEyLTk5OS0wOTgzXHJcbiAqXHJcbiAqIGJ1dCBub3RcclxuICogMTExLTEyMy01NDM0XHJcbiAqIGFuZCBub3RcclxuICogMjEyIDEyMyA0NTY3XHJcbiAqL1xyXG4kLnZhbGlkYXRvci5hZGRNZXRob2QoIFwicGhvbmVVU1wiLCBmdW5jdGlvbiggcGhvbmVfbnVtYmVyLCBlbGVtZW50ICkge1xyXG5cdHBob25lX251bWJlciA9IHBob25lX251bWJlci5yZXBsYWNlKCAvXFxzKy9nLCBcIlwiICk7XHJcblx0cmV0dXJuIHRoaXMub3B0aW9uYWwoIGVsZW1lbnQgKSB8fCBwaG9uZV9udW1iZXIubGVuZ3RoID4gOSAmJlxyXG5cdFx0cGhvbmVfbnVtYmVyLm1hdGNoKCAvXihcXCs/MS0/KT8oXFwoWzItOV0oWzAyLTldXFxkfDFbMDItOV0pXFwpfFsyLTldKFswMi05XVxcZHwxWzAyLTldKSktP1syLTldKFswMi05XVxcZHwxWzAyLTldKS0/XFxkezR9JC8gKTtcclxufSwgXCJQbGVhc2Ugc3BlY2lmeSBhIHZhbGlkIHBob25lIG51bWJlclwiICk7XHJcblxyXG4vKlxyXG4qIFZhbGlkYSBDRVBzIGRvIGJyYXNpbGVpcm9zOlxyXG4qXHJcbiogRm9ybWF0b3MgYWNlaXRvczpcclxuKiA5OTk5OS05OTlcclxuKiA5OS45OTktOTk5XHJcbiogOTk5OTk5OTlcclxuKi9cclxuJC52YWxpZGF0b3IuYWRkTWV0aG9kKCBcInBvc3RhbGNvZGVCUlwiLCBmdW5jdGlvbiggY2VwX3ZhbHVlLCBlbGVtZW50ICkge1xyXG5cdHJldHVybiB0aGlzLm9wdGlvbmFsKCBlbGVtZW50ICkgfHwgL15cXGR7Mn0uXFxkezN9LVxcZHszfT8kfF5cXGR7NX0tP1xcZHszfT8kLy50ZXN0KCBjZXBfdmFsdWUgKTtcclxufSwgXCJJbmZvcm1lIHVtIENFUCB2w6FsaWRvLlwiICk7XHJcblxyXG4vKipcclxuICogTWF0Y2hlcyBhIHZhbGlkIENhbmFkaWFuIFBvc3RhbCBDb2RlXHJcbiAqXHJcbiAqIEBleGFtcGxlIGpRdWVyeS52YWxpZGF0b3IubWV0aG9kcy5wb3N0YWxDb2RlQ0EoIFwiSDBIIDBIMFwiLCBlbGVtZW50IClcclxuICogQHJlc3VsdCB0cnVlXHJcbiAqXHJcbiAqIEBleGFtcGxlIGpRdWVyeS52YWxpZGF0b3IubWV0aG9kcy5wb3N0YWxDb2RlQ0EoIFwiSDBIMEgwXCIsIGVsZW1lbnQgKVxyXG4gKiBAcmVzdWx0IGZhbHNlXHJcbiAqXHJcbiAqIEBuYW1lIGpRdWVyeS52YWxpZGF0b3IubWV0aG9kcy5wb3N0YWxDb2RlQ0FcclxuICogQHR5cGUgQm9vbGVhblxyXG4gKiBAY2F0IFBsdWdpbnMvVmFsaWRhdGUvTWV0aG9kc1xyXG4gKi9cclxuJC52YWxpZGF0b3IuYWRkTWV0aG9kKCBcInBvc3RhbENvZGVDQVwiLCBmdW5jdGlvbiggdmFsdWUsIGVsZW1lbnQgKSB7XHJcblx0cmV0dXJuIHRoaXMub3B0aW9uYWwoIGVsZW1lbnQgKSB8fCAvXltBQkNFR0hKS0xNTlBSU1RWWFldXFxkW0FCQ0VHSEpLTE1OUFJTVFZXWFlaXSAqXFxkW0FCQ0VHSEpLTE1OUFJTVFZXWFlaXVxcZCQvaS50ZXN0KCB2YWx1ZSApO1xyXG59LCBcIlBsZWFzZSBzcGVjaWZ5IGEgdmFsaWQgcG9zdGFsIGNvZGVcIiApO1xyXG5cclxuLyogTWF0Y2hlcyBJdGFsaWFuIHBvc3Rjb2RlIChDQVApICovXHJcbiQudmFsaWRhdG9yLmFkZE1ldGhvZCggXCJwb3N0YWxjb2RlSVRcIiwgZnVuY3Rpb24oIHZhbHVlLCBlbGVtZW50ICkge1xyXG5cdHJldHVybiB0aGlzLm9wdGlvbmFsKCBlbGVtZW50ICkgfHwgL15cXGR7NX0kLy50ZXN0KCB2YWx1ZSApO1xyXG59LCBcIlBsZWFzZSBzcGVjaWZ5IGEgdmFsaWQgcG9zdGFsIGNvZGVcIiApO1xyXG5cclxuJC52YWxpZGF0b3IuYWRkTWV0aG9kKCBcInBvc3RhbGNvZGVOTFwiLCBmdW5jdGlvbiggdmFsdWUsIGVsZW1lbnQgKSB7XHJcblx0cmV0dXJuIHRoaXMub3B0aW9uYWwoIGVsZW1lbnQgKSB8fCAvXlsxLTldWzAtOV17M31cXHM/W2EtekEtWl17Mn0kLy50ZXN0KCB2YWx1ZSApO1xyXG59LCBcIlBsZWFzZSBzcGVjaWZ5IGEgdmFsaWQgcG9zdGFsIGNvZGVcIiApO1xyXG5cclxuLy8gTWF0Y2hlcyBVSyBwb3N0Y29kZS4gRG9lcyBub3QgbWF0Y2ggdG8gVUsgQ2hhbm5lbCBJc2xhbmRzIHRoYXQgaGF2ZSB0aGVpciBvd24gcG9zdGNvZGVzIChub24gc3RhbmRhcmQgVUspXHJcbiQudmFsaWRhdG9yLmFkZE1ldGhvZCggXCJwb3N0Y29kZVVLXCIsIGZ1bmN0aW9uKCB2YWx1ZSwgZWxlbWVudCApIHtcclxuXHRyZXR1cm4gdGhpcy5vcHRpb25hbCggZWxlbWVudCApIHx8IC9eKCgoW0EtUFItVVdZWl1bMC05XSl8KFtBLVBSLVVXWVpdWzAtOV1bMC05XSl8KFtBLVBSLVVXWVpdW0EtSEstWV1bMC05XSl8KFtBLVBSLVVXWVpdW0EtSEstWV1bMC05XVswLTldKXwoW0EtUFItVVdZWl1bMC05XVtBLUhKS1NUVVddKXwoW0EtUFItVVdZWl1bQS1ISy1ZXVswLTldW0FCRUhNTlBSVldYWV0pKVxccz8oWzAtOV1bQUJELUhKTE5QLVVXLVpdezJ9KXwoR0lSKVxccz8oMEFBKSkkL2kudGVzdCggdmFsdWUgKTtcclxufSwgXCJQbGVhc2Ugc3BlY2lmeSBhIHZhbGlkIFVLIHBvc3Rjb2RlXCIgKTtcclxuXHJcbi8qXHJcbiAqIExldHMgeW91IHNheSBcImF0IGxlYXN0IFggaW5wdXRzIHRoYXQgbWF0Y2ggc2VsZWN0b3IgWSBtdXN0IGJlIGZpbGxlZC5cIlxyXG4gKlxyXG4gKiBUaGUgZW5kIHJlc3VsdCBpcyB0aGF0IG5laXRoZXIgb2YgdGhlc2UgaW5wdXRzOlxyXG4gKlxyXG4gKlx0PGlucHV0IGNsYXNzPVwicHJvZHVjdGluZm9cIiBuYW1lPVwicGFydG51bWJlclwiPlxyXG4gKlx0PGlucHV0IGNsYXNzPVwicHJvZHVjdGluZm9cIiBuYW1lPVwiZGVzY3JpcHRpb25cIj5cclxuICpcclxuICpcdC4uLndpbGwgdmFsaWRhdGUgdW5sZXNzIGF0IGxlYXN0IG9uZSBvZiB0aGVtIGlzIGZpbGxlZC5cclxuICpcclxuICogcGFydG51bWJlcjpcdHtyZXF1aXJlX2Zyb21fZ3JvdXA6IFsxLFwiLnByb2R1Y3RpbmZvXCJdfSxcclxuICogZGVzY3JpcHRpb246IHtyZXF1aXJlX2Zyb21fZ3JvdXA6IFsxLFwiLnByb2R1Y3RpbmZvXCJdfVxyXG4gKlxyXG4gKiBvcHRpb25zWzBdOiBudW1iZXIgb2YgZmllbGRzIHRoYXQgbXVzdCBiZSBmaWxsZWQgaW4gdGhlIGdyb3VwXHJcbiAqIG9wdGlvbnNbMV06IENTUyBzZWxlY3RvciB0aGF0IGRlZmluZXMgdGhlIGdyb3VwIG9mIGNvbmRpdGlvbmFsbHkgcmVxdWlyZWQgZmllbGRzXHJcbiAqL1xyXG4kLnZhbGlkYXRvci5hZGRNZXRob2QoIFwicmVxdWlyZV9mcm9tX2dyb3VwXCIsIGZ1bmN0aW9uKCB2YWx1ZSwgZWxlbWVudCwgb3B0aW9ucyApIHtcclxuXHR2YXIgJGZpZWxkcyA9ICQoIG9wdGlvbnNbIDEgXSwgZWxlbWVudC5mb3JtICksXHJcblx0XHQkZmllbGRzRmlyc3QgPSAkZmllbGRzLmVxKCAwICksXHJcblx0XHR2YWxpZGF0b3IgPSAkZmllbGRzRmlyc3QuZGF0YSggXCJ2YWxpZF9yZXFfZ3JwXCIgKSA/ICRmaWVsZHNGaXJzdC5kYXRhKCBcInZhbGlkX3JlcV9ncnBcIiApIDogJC5leHRlbmQoIHt9LCB0aGlzICksXHJcblx0XHRpc1ZhbGlkID0gJGZpZWxkcy5maWx0ZXIoIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRyZXR1cm4gdmFsaWRhdG9yLmVsZW1lbnRWYWx1ZSggdGhpcyApO1xyXG5cdFx0fSApLmxlbmd0aCA+PSBvcHRpb25zWyAwIF07XHJcblxyXG5cdC8vIFN0b3JlIHRoZSBjbG9uZWQgdmFsaWRhdG9yIGZvciBmdXR1cmUgdmFsaWRhdGlvblxyXG5cdCRmaWVsZHNGaXJzdC5kYXRhKCBcInZhbGlkX3JlcV9ncnBcIiwgdmFsaWRhdG9yICk7XHJcblxyXG5cdC8vIElmIGVsZW1lbnQgaXNuJ3QgYmVpbmcgdmFsaWRhdGVkLCBydW4gZWFjaCByZXF1aXJlX2Zyb21fZ3JvdXAgZmllbGQncyB2YWxpZGF0aW9uIHJ1bGVzXHJcblx0aWYgKCAhJCggZWxlbWVudCApLmRhdGEoIFwiYmVpbmdfdmFsaWRhdGVkXCIgKSApIHtcclxuXHRcdCRmaWVsZHMuZGF0YSggXCJiZWluZ192YWxpZGF0ZWRcIiwgdHJ1ZSApO1xyXG5cdFx0JGZpZWxkcy5lYWNoKCBmdW5jdGlvbigpIHtcclxuXHRcdFx0dmFsaWRhdG9yLmVsZW1lbnQoIHRoaXMgKTtcclxuXHRcdH0gKTtcclxuXHRcdCRmaWVsZHMuZGF0YSggXCJiZWluZ192YWxpZGF0ZWRcIiwgZmFsc2UgKTtcclxuXHR9XHJcblx0cmV0dXJuIGlzVmFsaWQ7XHJcbn0sICQudmFsaWRhdG9yLmZvcm1hdCggXCJQbGVhc2UgZmlsbCBhdCBsZWFzdCB7MH0gb2YgdGhlc2UgZmllbGRzLlwiICkgKTtcclxuXHJcbi8qXHJcbiAqIExldHMgeW91IHNheSBcImVpdGhlciBhdCBsZWFzdCBYIGlucHV0cyB0aGF0IG1hdGNoIHNlbGVjdG9yIFkgbXVzdCBiZSBmaWxsZWQsXHJcbiAqIE9SIHRoZXkgbXVzdCBhbGwgYmUgc2tpcHBlZCAobGVmdCBibGFuaykuXCJcclxuICpcclxuICogVGhlIGVuZCByZXN1bHQsIGlzIHRoYXQgbm9uZSBvZiB0aGVzZSBpbnB1dHM6XHJcbiAqXHJcbiAqXHQ8aW5wdXQgY2xhc3M9XCJwcm9kdWN0aW5mb1wiIG5hbWU9XCJwYXJ0bnVtYmVyXCI+XHJcbiAqXHQ8aW5wdXQgY2xhc3M9XCJwcm9kdWN0aW5mb1wiIG5hbWU9XCJkZXNjcmlwdGlvblwiPlxyXG4gKlx0PGlucHV0IGNsYXNzPVwicHJvZHVjdGluZm9cIiBuYW1lPVwiY29sb3JcIj5cclxuICpcclxuICpcdC4uLndpbGwgdmFsaWRhdGUgdW5sZXNzIGVpdGhlciBhdCBsZWFzdCB0d28gb2YgdGhlbSBhcmUgZmlsbGVkLFxyXG4gKlx0T1Igbm9uZSBvZiB0aGVtIGFyZS5cclxuICpcclxuICogcGFydG51bWJlcjpcdHtza2lwX29yX2ZpbGxfbWluaW11bTogWzIsXCIucHJvZHVjdGluZm9cIl19LFxyXG4gKiBkZXNjcmlwdGlvbjoge3NraXBfb3JfZmlsbF9taW5pbXVtOiBbMixcIi5wcm9kdWN0aW5mb1wiXX0sXHJcbiAqIGNvbG9yOlx0XHR7c2tpcF9vcl9maWxsX21pbmltdW06IFsyLFwiLnByb2R1Y3RpbmZvXCJdfVxyXG4gKlxyXG4gKiBvcHRpb25zWzBdOiBudW1iZXIgb2YgZmllbGRzIHRoYXQgbXVzdCBiZSBmaWxsZWQgaW4gdGhlIGdyb3VwXHJcbiAqIG9wdGlvbnNbMV06IENTUyBzZWxlY3RvciB0aGF0IGRlZmluZXMgdGhlIGdyb3VwIG9mIGNvbmRpdGlvbmFsbHkgcmVxdWlyZWQgZmllbGRzXHJcbiAqXHJcbiAqL1xyXG4kLnZhbGlkYXRvci5hZGRNZXRob2QoIFwic2tpcF9vcl9maWxsX21pbmltdW1cIiwgZnVuY3Rpb24oIHZhbHVlLCBlbGVtZW50LCBvcHRpb25zICkge1xyXG5cdHZhciAkZmllbGRzID0gJCggb3B0aW9uc1sgMSBdLCBlbGVtZW50LmZvcm0gKSxcclxuXHRcdCRmaWVsZHNGaXJzdCA9ICRmaWVsZHMuZXEoIDAgKSxcclxuXHRcdHZhbGlkYXRvciA9ICRmaWVsZHNGaXJzdC5kYXRhKCBcInZhbGlkX3NraXBcIiApID8gJGZpZWxkc0ZpcnN0LmRhdGEoIFwidmFsaWRfc2tpcFwiICkgOiAkLmV4dGVuZCgge30sIHRoaXMgKSxcclxuXHRcdG51bWJlckZpbGxlZCA9ICRmaWVsZHMuZmlsdGVyKCBmdW5jdGlvbigpIHtcclxuXHRcdFx0cmV0dXJuIHZhbGlkYXRvci5lbGVtZW50VmFsdWUoIHRoaXMgKTtcclxuXHRcdH0gKS5sZW5ndGgsXHJcblx0XHRpc1ZhbGlkID0gbnVtYmVyRmlsbGVkID09PSAwIHx8IG51bWJlckZpbGxlZCA+PSBvcHRpb25zWyAwIF07XHJcblxyXG5cdC8vIFN0b3JlIHRoZSBjbG9uZWQgdmFsaWRhdG9yIGZvciBmdXR1cmUgdmFsaWRhdGlvblxyXG5cdCRmaWVsZHNGaXJzdC5kYXRhKCBcInZhbGlkX3NraXBcIiwgdmFsaWRhdG9yICk7XHJcblxyXG5cdC8vIElmIGVsZW1lbnQgaXNuJ3QgYmVpbmcgdmFsaWRhdGVkLCBydW4gZWFjaCBza2lwX29yX2ZpbGxfbWluaW11bSBmaWVsZCdzIHZhbGlkYXRpb24gcnVsZXNcclxuXHRpZiAoICEkKCBlbGVtZW50ICkuZGF0YSggXCJiZWluZ192YWxpZGF0ZWRcIiApICkge1xyXG5cdFx0JGZpZWxkcy5kYXRhKCBcImJlaW5nX3ZhbGlkYXRlZFwiLCB0cnVlICk7XHJcblx0XHQkZmllbGRzLmVhY2goIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHR2YWxpZGF0b3IuZWxlbWVudCggdGhpcyApO1xyXG5cdFx0fSApO1xyXG5cdFx0JGZpZWxkcy5kYXRhKCBcImJlaW5nX3ZhbGlkYXRlZFwiLCBmYWxzZSApO1xyXG5cdH1cclxuXHRyZXR1cm4gaXNWYWxpZDtcclxufSwgJC52YWxpZGF0b3IuZm9ybWF0KCBcIlBsZWFzZSBlaXRoZXIgc2tpcCB0aGVzZSBmaWVsZHMgb3IgZmlsbCBhdCBsZWFzdCB7MH0gb2YgdGhlbS5cIiApICk7XHJcblxyXG4vKiBWYWxpZGF0ZXMgVVMgU3RhdGVzIGFuZC9vciBUZXJyaXRvcmllcyBieSBAamRmb3JzeXRoZVxyXG4gKiBDYW4gYmUgY2FzZSBpbnNlbnNpdGl2ZSBvciByZXF1aXJlIGNhcGl0YWxpemF0aW9uIC0gZGVmYXVsdCBpcyBjYXNlIGluc2Vuc2l0aXZlXHJcbiAqIENhbiBpbmNsdWRlIFVTIFRlcnJpdG9yaWVzIG9yIG5vdCAtIGRlZmF1bHQgZG9lcyBub3RcclxuICogQ2FuIGluY2x1ZGUgVVMgTWlsaXRhcnkgcG9zdGFsIGFiYnJldmlhdGlvbnMgKEFBLCBBRSwgQVApIC0gZGVmYXVsdCBkb2VzIG5vdFxyXG4gKlxyXG4gKiBOb3RlOiBcIlN0YXRlc1wiIGFsd2F5cyBpbmNsdWRlcyBEQyAoRGlzdHJpY3Qgb2YgQ29sb21iaWEpXHJcbiAqXHJcbiAqIFVzYWdlIGV4YW1wbGVzOlxyXG4gKlxyXG4gKiAgVGhpcyBpcyB0aGUgZGVmYXVsdCAtIGNhc2UgaW5zZW5zaXRpdmUsIG5vIHRlcnJpdG9yaWVzLCBubyBtaWxpdGFyeSB6b25lc1xyXG4gKiAgc3RhdGVJbnB1dDoge1xyXG4gKiAgICAgY2FzZVNlbnNpdGl2ZTogZmFsc2UsXHJcbiAqICAgICBpbmNsdWRlVGVycml0b3JpZXM6IGZhbHNlLFxyXG4gKiAgICAgaW5jbHVkZU1pbGl0YXJ5OiBmYWxzZVxyXG4gKiAgfVxyXG4gKlxyXG4gKiAgT25seSBhbGxvdyBjYXBpdGFsIGxldHRlcnMsIG5vIHRlcnJpdG9yaWVzLCBubyBtaWxpdGFyeSB6b25lc1xyXG4gKiAgc3RhdGVJbnB1dDoge1xyXG4gKiAgICAgY2FzZVNlbnNpdGl2ZTogZmFsc2VcclxuICogIH1cclxuICpcclxuICogIENhc2UgaW5zZW5zaXRpdmUsIGluY2x1ZGUgdGVycml0b3JpZXMgYnV0IG5vdCBtaWxpdGFyeSB6b25lc1xyXG4gKiAgc3RhdGVJbnB1dDoge1xyXG4gKiAgICAgaW5jbHVkZVRlcnJpdG9yaWVzOiB0cnVlXHJcbiAqICB9XHJcbiAqXHJcbiAqICBPbmx5IGFsbG93IGNhcGl0YWwgbGV0dGVycywgaW5jbHVkZSB0ZXJyaXRvcmllcyBhbmQgbWlsaXRhcnkgem9uZXNcclxuICogIHN0YXRlSW5wdXQ6IHtcclxuICogICAgIGNhc2VTZW5zaXRpdmU6IHRydWUsXHJcbiAqICAgICBpbmNsdWRlVGVycml0b3JpZXM6IHRydWUsXHJcbiAqICAgICBpbmNsdWRlTWlsaXRhcnk6IHRydWVcclxuICogIH1cclxuICpcclxuICovXHJcbiQudmFsaWRhdG9yLmFkZE1ldGhvZCggXCJzdGF0ZVVTXCIsIGZ1bmN0aW9uKCB2YWx1ZSwgZWxlbWVudCwgb3B0aW9ucyApIHtcclxuXHR2YXIgaXNEZWZhdWx0ID0gdHlwZW9mIG9wdGlvbnMgPT09IFwidW5kZWZpbmVkXCIsXHJcblx0XHRjYXNlU2Vuc2l0aXZlID0gKCBpc0RlZmF1bHQgfHwgdHlwZW9mIG9wdGlvbnMuY2FzZVNlbnNpdGl2ZSA9PT0gXCJ1bmRlZmluZWRcIiApID8gZmFsc2UgOiBvcHRpb25zLmNhc2VTZW5zaXRpdmUsXHJcblx0XHRpbmNsdWRlVGVycml0b3JpZXMgPSAoIGlzRGVmYXVsdCB8fCB0eXBlb2Ygb3B0aW9ucy5pbmNsdWRlVGVycml0b3JpZXMgPT09IFwidW5kZWZpbmVkXCIgKSA/IGZhbHNlIDogb3B0aW9ucy5pbmNsdWRlVGVycml0b3JpZXMsXHJcblx0XHRpbmNsdWRlTWlsaXRhcnkgPSAoIGlzRGVmYXVsdCB8fCB0eXBlb2Ygb3B0aW9ucy5pbmNsdWRlTWlsaXRhcnkgPT09IFwidW5kZWZpbmVkXCIgKSA/IGZhbHNlIDogb3B0aW9ucy5pbmNsdWRlTWlsaXRhcnksXHJcblx0XHRyZWdleDtcclxuXHJcblx0aWYgKCAhaW5jbHVkZVRlcnJpdG9yaWVzICYmICFpbmNsdWRlTWlsaXRhcnkgKSB7XHJcblx0XHRyZWdleCA9IFwiXihBW0tMUlpdfENbQU9UXXxEW0NFXXxGTHxHQXxISXxJW0FETE5dfEtbU1ldfExBfE1bQURFSU5PU1RdfE5bQ0RFSEpNVlldfE9bSEtSXXxQQXxSSXxTW0NEXXxUW05YXXxVVHxWW0FUXXxXW0FJVlldKSRcIjtcclxuXHR9IGVsc2UgaWYgKCBpbmNsdWRlVGVycml0b3JpZXMgJiYgaW5jbHVkZU1pbGl0YXJ5ICkge1xyXG5cdFx0cmVnZXggPSBcIl4oQVtBRUtMUFJTWl18Q1tBT1RdfERbQ0VdfEZMfEdbQVVdfEhJfElbQURMTl18S1tTWV18TEF8TVtBREVJTk9QU1RdfE5bQ0RFSEpNVlldfE9bSEtSXXxQW0FSXXxSSXxTW0NEXXxUW05YXXxVVHxWW0FJVF18V1tBSVZZXSkkXCI7XHJcblx0fSBlbHNlIGlmICggaW5jbHVkZVRlcnJpdG9yaWVzICkge1xyXG5cdFx0cmVnZXggPSBcIl4oQVtLTFJTWl18Q1tBT1RdfERbQ0VdfEZMfEdbQVVdfEhJfElbQURMTl18S1tTWV18TEF8TVtBREVJTk9QU1RdfE5bQ0RFSEpNVlldfE9bSEtSXXxQW0FSXXxSSXxTW0NEXXxUW05YXXxVVHxWW0FJVF18V1tBSVZZXSkkXCI7XHJcblx0fSBlbHNlIHtcclxuXHRcdHJlZ2V4ID0gXCJeKEFbQUVLTFBSWl18Q1tBT1RdfERbQ0VdfEZMfEdBfEhJfElbQURMTl18S1tTWV18TEF8TVtBREVJTk9TVF18TltDREVISk1WWV18T1tIS1JdfFBBfFJJfFNbQ0RdfFRbTlhdfFVUfFZbQVRdfFdbQUlWWV0pJFwiO1xyXG5cdH1cclxuXHJcblx0cmVnZXggPSBjYXNlU2Vuc2l0aXZlID8gbmV3IFJlZ0V4cCggcmVnZXggKSA6IG5ldyBSZWdFeHAoIHJlZ2V4LCBcImlcIiApO1xyXG5cdHJldHVybiB0aGlzLm9wdGlvbmFsKCBlbGVtZW50ICkgfHwgcmVnZXgudGVzdCggdmFsdWUgKTtcclxufSwgXCJQbGVhc2Ugc3BlY2lmeSBhIHZhbGlkIHN0YXRlXCIgKTtcclxuXHJcbi8vIFRPRE8gY2hlY2sgaWYgdmFsdWUgc3RhcnRzIHdpdGggPCwgb3RoZXJ3aXNlIGRvbid0IHRyeSBzdHJpcHBpbmcgYW55dGhpbmdcclxuJC52YWxpZGF0b3IuYWRkTWV0aG9kKCBcInN0cmlwcGVkbWlubGVuZ3RoXCIsIGZ1bmN0aW9uKCB2YWx1ZSwgZWxlbWVudCwgcGFyYW0gKSB7XHJcblx0cmV0dXJuICQoIHZhbHVlICkudGV4dCgpLmxlbmd0aCA+PSBwYXJhbTtcclxufSwgJC52YWxpZGF0b3IuZm9ybWF0KCBcIlBsZWFzZSBlbnRlciBhdCBsZWFzdCB7MH0gY2hhcmFjdGVyc1wiICkgKTtcclxuXHJcbiQudmFsaWRhdG9yLmFkZE1ldGhvZCggXCJ0aW1lXCIsIGZ1bmN0aW9uKCB2YWx1ZSwgZWxlbWVudCApIHtcclxuXHRyZXR1cm4gdGhpcy5vcHRpb25hbCggZWxlbWVudCApIHx8IC9eKFswMV1cXGR8MlswLTNdfFswLTldKSg6WzAtNV1cXGQpezEsMn0kLy50ZXN0KCB2YWx1ZSApO1xyXG59LCBcIlBsZWFzZSBlbnRlciBhIHZhbGlkIHRpbWUsIGJldHdlZW4gMDA6MDAgYW5kIDIzOjU5XCIgKTtcclxuXHJcbiQudmFsaWRhdG9yLmFkZE1ldGhvZCggXCJ0aW1lMTJoXCIsIGZ1bmN0aW9uKCB2YWx1ZSwgZWxlbWVudCApIHtcclxuXHRyZXR1cm4gdGhpcy5vcHRpb25hbCggZWxlbWVudCApIHx8IC9eKCgwP1sxLTldfDFbMDEyXSkoOlswLTVdXFxkKXsxLDJ9KFxcID9bQVBdTSkpJC9pLnRlc3QoIHZhbHVlICk7XHJcbn0sIFwiUGxlYXNlIGVudGVyIGEgdmFsaWQgdGltZSBpbiAxMi1ob3VyIGFtL3BtIGZvcm1hdFwiICk7XHJcblxyXG4vLyBTYW1lIGFzIHVybCwgYnV0IFRMRCBpcyBvcHRpb25hbFxyXG4kLnZhbGlkYXRvci5hZGRNZXRob2QoIFwidXJsMlwiLCBmdW5jdGlvbiggdmFsdWUsIGVsZW1lbnQgKSB7XHJcblx0cmV0dXJuIHRoaXMub3B0aW9uYWwoIGVsZW1lbnQgKSB8fCAvXihodHRwcz98ZnRwKTpcXC9cXC8oKCgoW2Etel18XFxkfC18XFwufF98fnxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSl8KCVbXFxkYS1mXXsyfSl8WyFcXCQmJ1xcKFxcKVxcKlxcKyw7PV18OikqQCk/KCgoXFxkfFsxLTldXFxkfDFcXGRcXGR8MlswLTRdXFxkfDI1WzAtNV0pXFwuKFxcZHxbMS05XVxcZHwxXFxkXFxkfDJbMC00XVxcZHwyNVswLTVdKVxcLihcXGR8WzEtOV1cXGR8MVxcZFxcZHwyWzAtNF1cXGR8MjVbMC01XSlcXC4oXFxkfFsxLTldXFxkfDFcXGRcXGR8MlswLTRdXFxkfDI1WzAtNV0pKXwoKChbYS16XXxcXGR8W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pfCgoW2Etel18XFxkfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKShbYS16XXxcXGR8LXxcXC58X3x+fFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKSooW2Etel18XFxkfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKSkpXFwuKSooKFthLXpdfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKXwoKFthLXpdfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKShbYS16XXxcXGR8LXxcXC58X3x+fFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKSooW2Etel18W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKSlcXC4/KSg6XFxkKik/KShcXC8oKChbYS16XXxcXGR8LXxcXC58X3x+fFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKXwoJVtcXGRhLWZdezJ9KXxbIVxcJCYnXFwoXFwpXFwqXFwrLDs9XXw6fEApKyhcXC8oKFthLXpdfFxcZHwtfFxcLnxffH58W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pfCglW1xcZGEtZl17Mn0pfFshXFwkJidcXChcXClcXCpcXCssOz1dfDp8QCkqKSopPyk/KFxcPygoKFthLXpdfFxcZHwtfFxcLnxffH58W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pfCglW1xcZGEtZl17Mn0pfFshXFwkJidcXChcXClcXCpcXCssOz1dfDp8QCl8W1xcdUUwMDAtXFx1RjhGRl18XFwvfFxcPykqKT8oIygoKFthLXpdfFxcZHwtfFxcLnxffH58W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pfCglW1xcZGEtZl17Mn0pfFshXFwkJidcXChcXClcXCpcXCssOz1dfDp8QCl8XFwvfFxcPykqKT8kL2kudGVzdCggdmFsdWUgKTtcclxufSwgJC52YWxpZGF0b3IubWVzc2FnZXMudXJsICk7XHJcblxyXG4vKipcclxuICogUmV0dXJuIHRydWUsIGlmIHRoZSB2YWx1ZSBpcyBhIHZhbGlkIHZlaGljbGUgaWRlbnRpZmljYXRpb24gbnVtYmVyIChWSU4pLlxyXG4gKlxyXG4gKiBXb3JrcyB3aXRoIGFsbCBraW5kIG9mIHRleHQgaW5wdXRzLlxyXG4gKlxyXG4gKiBAZXhhbXBsZSA8aW5wdXQgdHlwZT1cInRleHRcIiBzaXplPVwiMjBcIiBuYW1lPVwiVmVoaWNsZUlEXCIgY2xhc3M9XCJ7cmVxdWlyZWQ6dHJ1ZSx2aW5VUzp0cnVlfVwiIC8+XHJcbiAqIEBkZXNjIERlY2xhcmVzIGEgcmVxdWlyZWQgaW5wdXQgZWxlbWVudCB3aG9zZSB2YWx1ZSBtdXN0IGJlIGEgdmFsaWQgdmVoaWNsZSBpZGVudGlmaWNhdGlvbiBudW1iZXIuXHJcbiAqXHJcbiAqIEBuYW1lICQudmFsaWRhdG9yLm1ldGhvZHMudmluVVNcclxuICogQHR5cGUgQm9vbGVhblxyXG4gKiBAY2F0IFBsdWdpbnMvVmFsaWRhdGUvTWV0aG9kc1xyXG4gKi9cclxuJC52YWxpZGF0b3IuYWRkTWV0aG9kKCBcInZpblVTXCIsIGZ1bmN0aW9uKCB2ICkge1xyXG5cdGlmICggdi5sZW5ndGggIT09IDE3ICkge1xyXG5cdFx0cmV0dXJuIGZhbHNlO1xyXG5cdH1cclxuXHJcblx0dmFyIExMID0gWyBcIkFcIiwgXCJCXCIsIFwiQ1wiLCBcIkRcIiwgXCJFXCIsIFwiRlwiLCBcIkdcIiwgXCJIXCIsIFwiSlwiLCBcIktcIiwgXCJMXCIsIFwiTVwiLCBcIk5cIiwgXCJQXCIsIFwiUlwiLCBcIlNcIiwgXCJUXCIsIFwiVVwiLCBcIlZcIiwgXCJXXCIsIFwiWFwiLCBcIllcIiwgXCJaXCIgXSxcclxuXHRcdFZMID0gWyAxLCAyLCAzLCA0LCA1LCA2LCA3LCA4LCAxLCAyLCAzLCA0LCA1LCA3LCA5LCAyLCAzLCA0LCA1LCA2LCA3LCA4LCA5IF0sXHJcblx0XHRGTCA9IFsgOCwgNywgNiwgNSwgNCwgMywgMiwgMTAsIDAsIDksIDgsIDcsIDYsIDUsIDQsIDMsIDIgXSxcclxuXHRcdHJzID0gMCxcclxuXHRcdGksIG4sIGQsIGYsIGNkLCBjZHY7XHJcblxyXG5cdGZvciAoIGkgPSAwOyBpIDwgMTc7IGkrKyApIHtcclxuXHRcdGYgPSBGTFsgaSBdO1xyXG5cdFx0ZCA9IHYuc2xpY2UoIGksIGkgKyAxICk7XHJcblx0XHRpZiAoIGkgPT09IDggKSB7XHJcblx0XHRcdGNkdiA9IGQ7XHJcblx0XHR9XHJcblx0XHRpZiAoICFpc05hTiggZCApICkge1xyXG5cdFx0XHRkICo9IGY7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRmb3IgKCBuID0gMDsgbiA8IExMLmxlbmd0aDsgbisrICkge1xyXG5cdFx0XHRcdGlmICggZC50b1VwcGVyQ2FzZSgpID09PSBMTFsgbiBdICkge1xyXG5cdFx0XHRcdFx0ZCA9IFZMWyBuIF07XHJcblx0XHRcdFx0XHRkICo9IGY7XHJcblx0XHRcdFx0XHRpZiAoIGlzTmFOKCBjZHYgKSAmJiBuID09PSA4ICkge1xyXG5cdFx0XHRcdFx0XHRjZHYgPSBMTFsgbiBdO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRycyArPSBkO1xyXG5cdH1cclxuXHRjZCA9IHJzICUgMTE7XHJcblx0aWYgKCBjZCA9PT0gMTAgKSB7XHJcblx0XHRjZCA9IFwiWFwiO1xyXG5cdH1cclxuXHRpZiAoIGNkID09PSBjZHYgKSB7XHJcblx0XHRyZXR1cm4gdHJ1ZTtcclxuXHR9XHJcblx0cmV0dXJuIGZhbHNlO1xyXG59LCBcIlRoZSBzcGVjaWZpZWQgdmVoaWNsZSBpZGVudGlmaWNhdGlvbiBudW1iZXIgKFZJTikgaXMgaW52YWxpZC5cIiApO1xyXG5cclxuJC52YWxpZGF0b3IuYWRkTWV0aG9kKCBcInppcGNvZGVVU1wiLCBmdW5jdGlvbiggdmFsdWUsIGVsZW1lbnQgKSB7XHJcblx0cmV0dXJuIHRoaXMub3B0aW9uYWwoIGVsZW1lbnQgKSB8fCAvXlxcZHs1fSgtXFxkezR9KT8kLy50ZXN0KCB2YWx1ZSApO1xyXG59LCBcIlRoZSBzcGVjaWZpZWQgVVMgWklQIENvZGUgaXMgaW52YWxpZFwiICk7XHJcblxyXG4kLnZhbGlkYXRvci5hZGRNZXRob2QoIFwiemlwcmFuZ2VcIiwgZnVuY3Rpb24oIHZhbHVlLCBlbGVtZW50ICkge1xyXG5cdHJldHVybiB0aGlzLm9wdGlvbmFsKCBlbGVtZW50ICkgfHwgL145MFsyLTVdXFxkXFx7MlxcfS1cXGR7NH0kLy50ZXN0KCB2YWx1ZSApO1xyXG59LCBcIllvdXIgWklQLWNvZGUgbXVzdCBiZSBpbiB0aGUgcmFuZ2UgOTAyeHgteHh4eCB0byA5MDV4eC14eHh4XCIgKTtcclxucmV0dXJuICQ7XHJcbn0pKTsiXSwiZmlsZSI6ImxpYi9qcXVlcnktdmFsaWRhdGlvbi9kaXN0L2FkZGl0aW9uYWwtbWV0aG9kcy5lczUuanMifQ==
