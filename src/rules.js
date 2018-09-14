
const _numeric = {
  validator: /^[0-9]+$/,
  message: 'Not a valid number',
};
const numeric = () => _numeric;

const _integer = {
  validator: /^-?[0-9]+$/,
  message: 'Not a valid Integer',
};
const integer = () => _integer;

const _decimal = {
  validator: /^-?[0-9]*\.?[0-9]+$/,
  message: 'Not a valid decimal',
};
const decimal = () => _decimal;

const _email = {
  validator: /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i,
  message: 'Not a valid email',
};
const email = () => _email;

const _alpha = {
  validator: /^[a-z]+$/i,
  message: 'Not a valid alpha',
};
const alpha = () => _alpha;

const _alphaNumeric = {
  validator: /^[a-z0-9]+$/i,
  message: 'Not a valid alpha numeric value',
};
const alphaNumeric = () => _alphaNumeric;

const _alphaDash = {
  validator: /^[a-z0-9_-]+$/i,
  message: 'Not a valid alpha numeric dash value',
};
const alphaDash = () => _alphaDash;

const _natural = {
  validator: /^[0-9]+$/i,
  message: 'Not a valid natural number',
};
const natural = () => _natural;

const _naturalNoZero = {
  validator: /^[1-9][0-9]*$/i,
  message: 'Not a valid natural value',
};
const naturalNoZero = () => _naturalNoZero;

const _ip = {
  validator: /^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})$/i,
  message: 'Not a valid ip address',
};
const ip = () => _ip;

const _base64 = {
  validator: /[^a-zA-Z0-9/+=]/i,
  message: 'Not a valid base 64',
};
const base64 = () => _base64;

const _numericDash = {
  validator: /^[\d\-\s]+$/,
  message: 'Not a valid numeric dash',
};
const numericDash = () => _numericDash;

const _url = {
  validator: /^((http|https):\/\/(\w+:{0,1}\w*@)?(\S+)|)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?$/,
  message: 'Not a valid url',
};
const url = () => _url;

const _phoneUS = {
  validator: /^(1-?)?(\([0-9]\d{2}\)|[0-9]\d{2})[- ]?[0-9]\d{2}[- ]?\d{4}$/,
  message: 'Not a valid phone number',
};
const phoneUS = () => _phoneUS;

const _zip = {
  validator: /(^\d{5}(-\d{4})?$)|(^[ABCEGHJKLMNPRSTVXY]{1}\d{1}[A-Z]{1} *\d{1}[A-Z]{1}\d{1}$)/,
  message: 'Not a valid zip code',
};
const zip = () => _zip;

const _zipUSA = {
  validator: /(^([0-9]{5})$)|(^[ABCEGHJKLMNPRSTVXYabceghjklmnprstvxy]{1}\d{1}[A-Za-z]{1} *\d{1}[A-Za-z]{1}\d{1}$)/,
  message: 'Not a valid zip code',
};
const zipUSA = () => _zipUSA;

const required = cacheEmpty((dependsOn, dependsValue, msg) => ({
  validator: (value, data) => {
    const _value = typeof value === 'string' ? value.trim() : value;
    if (dependsOn) {
      if ((!dependsValue && !data[dependsOn].value && arguments.length < 4) || (data[dependsOn].value !== dependsValue)) {
        return false;
      }
    }
    const isInvalid = !_value;
    return isInvalid && (msg || 'This field is required');
  },
  empty: true,
}));

const match = cacheEmpty((field, fieldName, msg) => ({
  validator: (value, data) => {
    const isInvalid = value !== data[field];

    return isInvalid && (msg || `Field must match ${fieldName || field}`);
  },
}));

const not = cacheEmpty((invalidValuesArray, msg) => ({
  validator(value) {
    const isInvalid = invalidValuesArray.indexOf(value) !== -1;
    return isInvalid && (msg || 'Not a valid value');
  },
}));

const _in = cacheEmpty((validValuesArray, msg) => ({
  validator(value) {
    const isInvalid = validValuesArray.indexOf(value) === -1;
    return isInvalid && (msg || 'Not in the list of valid values');
  },
}));

const between = cacheEmpty((min, max, msg) => ({
  validator(value) {
    const { length } = value;
    const isInvalid = !(length >= min && length <= max);

    return isInvalid && (msg || `The number of characters must be between ${min} and ${max}`);
  },
}));

const min = cacheEmpty((minLength, msg) => ({
  validator(value) {
    const { length } = value;
    const isInvalid = !(length >= minLength);

    return isInvalid && (msg || `Minimum of ${minLength} characters is required`);
  },
}));

const max = cacheEmpty((maxLength, msg) => ({
  validator(value) {
    const { length } = value;
    const isInvalid = !(length <= maxLength);

    return isInvalid && (msg || `Maximum of ${min} characters is required`);
  },
}));

const length = cacheEmpty((expectedLength, msg) => ({
  validator(value) {
    const valueLength = value.length;
    const isInvalid = (valueLength !== expectedLength);

    return isInvalid && (msg || `A length of ${expectedLength} characters is required`);
  },
}));

const cc = cacheEmpty(msg => ({
  validator(value) {
    // Check Code from https://gist.github.com/4075533
    // accept only digits, dashes or spaces
    if (!_numericDash.validator.test(value)) {
      return true;
    }
    let nCheck = 0;
    let nDigit = 0;
    let bEven = false;
    const strippedField = value.replace(/\D/g, '');

    for (let n = strippedField.length - 1; n >= 0; n--) {
      const cDigit = strippedField.charAt(n);
      nDigit = parseInt(cDigit, 10);
      if (bEven) {
        // eslint-disable-next-line no-cond-assign
        if ((nDigit *= 2) > 9) {
          nDigit -= 9;
        }
      }

      nCheck += nDigit;
      bEven = !bEven;
    }

    const isInvalid = (nCheck % 10) !== 0;
    return isInvalid && (msg || 'A valid credit card number is required');
  },
}));

const rules = {
  numeric,
  integer,
  decimal,
  email,
  alpha,
  alphaNumeric,
  alphaDash,
  natural,
  naturalNoZero,
  ip,
  base64,
  numericDash,
  url,
  phoneUS,
  zip,
  // this is for usa and canada zip codes
  zipUSA,
  required,
  match,
  not,
  in: _in,
  between,
  min,
  max,
  length,
  cc,
};


function cacheEmpty(method) {
  const empty = method();
  return (...args) => (args.length ? method(...args) : empty);
}

export default rules;
